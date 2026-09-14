import {
  Button,
  Dropdown,
  Menu,
  Message,
  Modal,
  Result,
  Space,
  Spin,
} from "@arco-design/web-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  deletePlatformAdministrator,
  disablePlatformAdministrator,
  enablePlatformAdministrator,
  fetchPlatformAdministrator,
  fetchPlatformAdministratorAuditLogs,
  fetchPlatformAdministratorRoles,
  getPlatformAdministratorErrorMessage,
  platformAdministratorQueryKeys,
  resetPlatformAdministratorPassword,
  updatePlatformAdministratorRole,
} from "@/api/platform-admins";
import { getAccessTokenRoles, useAuthState } from "@/components/auth/store";
import { DetailPageFrame, type DetailInfoCard, type DetailTab } from "@/components/common";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import { formatDateTime } from "@/lib/date";
import { AccountOverview } from "./AccountOverview";
import { OperationRecords } from "./OperationRecords";
import { PermissionMatrix } from "./PermissionMatrix";
import {
  PlatformAdministratorPasswordModal,
  PlatformAdministratorRoleModal,
} from "../PlatformAdministratorsPage/PlatformAdministratorModals";
import { PlatformAdministratorStatusBadge } from "../PlatformAdministratorStatusBadge";
import { platformAdministratorRoleLabels, platformAdministratorSourceLabels } from "../model";

interface PlatformAdministratorDetailProps {
  userId: string;
}

export function PlatformAdministratorDetail({ userId }: PlatformAdministratorDetailProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authState = useAuthState();
  const [roleVisible, setRoleVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const canManage =
    authState.developmentBypass ||
    getAccessTokenRoles(authState.tokens?.access_token).includes("platform-admin");

  const detailQuery = useQuery({
    queryKey: platformAdministratorQueryKeys.detail(userId),
    queryFn: () => fetchPlatformAdministrator(userId),
  });
  const rolesQuery = useQuery({
    queryKey: platformAdministratorQueryKeys.roles,
    queryFn: fetchPlatformAdministratorRoles,
  });
  const auditQuery = useQuery({
    queryKey: platformAdministratorQueryKeys.auditLogs(userId),
    queryFn: () => fetchPlatformAdministratorAuditLogs(userId),
  });

  useListErrorNotification({
    id: `platform-administrator-detail-${userId}`,
    title: "平台运营账号详情加载失败",
    error: detailQuery.error,
  });
  useListErrorNotification({
    id: `platform-administrator-detail-roles-${userId}`,
    title: "平台角色权限加载失败",
    error: rolesQuery.error,
  });
  useListErrorNotification({
    id: `platform-administrator-audit-${userId}`,
    title: "账号操作记录加载失败",
    error: auditQuery.error,
  });

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: platformAdministratorQueryKeys.all });
  const mutationError = (error: unknown) =>
    Message.error(getPlatformAdministratorErrorMessage(error));

  const roleMutation = useMutation({
    mutationFn: updatePlatformAdministratorRole,
    onSuccess: async () => {
      await invalidateAll();
      setRoleVisible(false);
      Message.success("账号角色已更新");
    },
    onError: mutationError,
  });
  const passwordMutation = useMutation({
    mutationFn: resetPlatformAdministratorPassword,
    onSuccess: async () => {
      await invalidateAll();
      setPasswordVisible(false);
      Message.success("账号密码已重置");
    },
    onError: mutationError,
  });
  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: "active" | "disabled" }) =>
      status === "active"
        ? disablePlatformAdministrator(userId)
        : enablePlatformAdministrator(userId),
    onSuccess: async (_result, variables) => {
      await invalidateAll();
      Message.success(variables.status === "active" ? "账号已禁用" : "账号已启用");
    },
    onError: mutationError,
  });
  const deleteMutation = useMutation({
    mutationFn: () => deletePlatformAdministrator(userId),
    onSuccess: async () => {
      await invalidateAll();
      Message.success("账号已删除");
      void navigate({ to: "/settings-platform-admins" });
    },
    onError: mutationError,
  });

  const returnToList = () => {
    void navigate({ to: "/settings-platform-admins" });
  };

  if (detailQuery.isPending) {
    return (
      <div className="flex justify-center py-24">
        <Spin />
      </div>
    );
  }

  const detail = detailQuery.data;
  if (!detail) {
    return (
      <Result
        status={detailQuery.isError ? "error" : "404"}
        title={detailQuery.isError ? "账号详情暂不可用" : "平台运营账号不存在"}
        subTitle="请返回列表刷新后重试。"
        extra={<Button onClick={returnToList}>返回平台运营账号列表</Button>}
      />
    );
  }

  const operationPending =
    roleMutation.isPending ||
    passwordMutation.isPending ||
    statusMutation.isPending ||
    deleteMutation.isPending;
  const confirmStatusChange = () => {
    const action = detail.status === "active" ? "禁用" : "启用";
    Modal.confirm({
      title: `${action}账号 ${detail.displayName}？`,
      content:
        detail.status === "active"
          ? "禁用后该账号将无法登录管理端。"
          : "启用后该账号可恢复登录管理端。",
      okButtonProps: detail.status === "active" ? { status: "danger" } : undefined,
      onOk: () => statusMutation.mutateAsync({ status: detail.status }),
    });
  };

  const confirmDelete = () => {
    Modal.confirm({
      title: `删除账号 ${detail.displayName}？`,
      content: "该操作会软删除账号；至少需要保留一名活跃的平台超级管理员。",
      okButtonProps: { status: "danger" },
      onOk: () => deleteMutation.mutateAsync(),
    });
  };

  const moreMenu = (
    <Menu
      onClickMenuItem={(key) => {
        if (key === "password") setPasswordVisible(true);
        if (key === "status") confirmStatusChange();
        if (key === "delete") confirmDelete();
      }}
    >
      <Menu.Item key="password" disabled={detail.source !== "local"}>
        重置密码
      </Menu.Item>
      <Menu.Item key="status">{detail.status === "active" ? "禁用账号" : "启用账号"}</Menu.Item>
      <Menu.Item key="delete">删除账号</Menu.Item>
    </Menu>
  );

  const infoCards: DetailInfoCard[] = [
    {
      key: "overview",
      title: "账号概览",
      content: <AccountOverview detail={detail} />,
    },
  ];

  const detailTabs: DetailTab[] = [
    {
      key: "permissions",
      title: "权限",
      content: (
        <PermissionMatrix
          currentRole={detail.role}
          canManage={canManage && !operationPending}
          onChangeRole={() => setRoleVisible(true)}
        />
      ),
    },
    {
      key: "operations",
      title: "操作记录",
      content: <OperationRecords records={auditQuery.data || []} loading={auditQuery.isPending} />,
    },
  ];

  return (
    <>
      <DetailPageFrame
        breadcrumbs={[
          { label: "平台设置" },
          { label: "平台运营账号", onClick: returnToList },
          { label: detail.displayName || detail.username },
        ]}
        title={detail.displayName || detail.username}
        subtitle={detail.email || detail.username}
        status={<PlatformAdministratorStatusBadge status={detail.status} />}
        headerItems={[
          { label: "角色", value: platformAdministratorRoleLabels[detail.role] },
          { label: "来源", value: platformAdministratorSourceLabels[detail.source] },
          { label: "最近登录", value: formatDateTime(detail.lastLoginAt) },
          { label: "创建时间", value: formatDateTime(detail.createdAt) },
        ]}
        actions={
          <Space wrap>
            <Button
              type="primary"
              disabled={!canManage || operationPending}
              onClick={() => setRoleVisible(true)}
            >
              修改角色
            </Button>
            <Dropdown trigger="click" droplist={moreMenu} disabled={!canManage || operationPending}>
              <Button>更多操作</Button>
            </Dropdown>
          </Space>
        }
        cards={infoCards}
        tabs={detailTabs}
        defaultTabKey="permissions"
        onBack={returnToList}
      />

      <PlatformAdministratorRoleModal
        target={roleVisible ? detail : null}
        loading={roleMutation.isPending}
        roles={rolesQuery.data || []}
        onCancel={() => setRoleVisible(false)}
        onSubmit={(roleId) => roleMutation.mutate({ userId, roleId })}
      />
      <PlatformAdministratorPasswordModal
        target={passwordVisible ? detail : null}
        loading={passwordMutation.isPending}
        onCancel={() => setPasswordVisible(false)}
        onSubmit={(newPassword) => passwordMutation.mutate({ userId, newPassword })}
      />
    </>
  );
}
