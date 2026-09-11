import { Alert, Button, Input, Menu, Message, Modal, Select } from "@arco-design/web-react";
import { IconPlus, IconRefresh } from "@arco-design/web-react/icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";
import {
  createPlatformAdministrator,
  deletePlatformAdministrator,
  disablePlatformAdministrator,
  enablePlatformAdministrator,
  fetchPlatformAdministratorRoles,
  fetchPlatformAdministrators,
  getPlatformAdministratorErrorMessage,
  platformAdministratorQueryKeys,
  resetPlatformAdministratorPassword,
  updatePlatformAdministratorRole,
  type CreatePlatformAdministratorInput,
  type PlatformAdministratorListFilters,
  type PlatformAdministratorListItem,
  type PlatformAdministratorRole,
  type PlatformAdministratorStatus,
} from "@/api/platform-admins";
import {
  DataTableNameCell,
  DataTableRowActionButton,
  DataTableRowActions,
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  ListRowMore,
  ListToolbar,
  type ListColumn,
} from "@/components/common";
import { getAccessTokenRoles, useAuthState } from "@/components/auth/store";
import { Metric } from "@/components/overview/Metric";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import { formatDateTime } from "@/lib/date";
import { PlatformAdministratorStatusBadge } from "../PlatformAdministratorStatusBadge";
import { platformAdministratorRoleLabels, platformAdministratorSourceLabels } from "../model";
import { PlatformAdministratorDetailDrawer } from "./PlatformAdministratorDetailDrawer";
import {
  PlatformAdministratorCreateModal,
  PlatformAdministratorPasswordModal,
  PlatformAdministratorRoleModal,
} from "./PlatformAdministratorModals";

interface StatusOperationInput {
  userId: string;
  status: PlatformAdministratorStatus;
}

export function PlatformAdministratorsPage() {
  const queryClient = useQueryClient();
  const authState = useAuthState();
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<"all" | PlatformAdministratorRole>("all");
  const [status, setStatus] = useState<"all" | PlatformAdministratorStatus>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [createVisible, setCreateVisible] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [roleTarget, setRoleTarget] = useState<PlatformAdministratorListItem | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<PlatformAdministratorListItem | null>(null);
  const deferredKeyword = useDeferredValue(keyword.trim());
  const canManage =
    authState.developmentBypass ||
    getAccessTokenRoles(authState.tokens?.access_token).includes("platform-admin");

  const filters = useMemo<PlatformAdministratorListFilters>(() => {
    const result: PlatformAdministratorListFilters = {};
    if (role !== "all") result.role = role;
    if (status !== "all") result.status = status;
    if (deferredKeyword) result.search = deferredKeyword;
    return result;
  }, [deferredKeyword, role, status]);

  const overviewQuery = useQuery({
    queryKey: platformAdministratorQueryKeys.list(),
    queryFn: () => fetchPlatformAdministrators(),
  });
  const listQuery = useQuery({
    queryKey: platformAdministratorQueryKeys.list(filters),
    queryFn: () => fetchPlatformAdministrators(filters),
  });
  const rolesQuery = useQuery({
    queryKey: platformAdministratorQueryKeys.roles,
    queryFn: fetchPlatformAdministratorRoles,
  });

  useListErrorNotification({
    id: "platform-administrators-overview",
    title: "平台运营账号汇总加载失败",
    error: overviewQuery.error,
  });
  useListErrorNotification({
    id: "platform-administrators-list",
    title: "平台运营账号列表加载失败",
    error: listQuery.error,
  });
  useListErrorNotification({
    id: "platform-administrator-roles",
    title: "平台角色加载失败",
    error: rolesQuery.error,
  });

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: platformAdministratorQueryKeys.all });
  const mutationError = (error: unknown) =>
    Message.error(getPlatformAdministratorErrorMessage(error));

  const createMutation = useMutation({
    mutationFn: createPlatformAdministrator,
    onSuccess: async () => {
      await invalidateAll();
      setCreateVisible(false);
      Message.success("平台运营账号已创建");
    },
    onError: mutationError,
  });
  const roleMutation = useMutation({
    mutationFn: updatePlatformAdministratorRole,
    onSuccess: async () => {
      await invalidateAll();
      setRoleTarget(null);
      Message.success("账号角色已更新");
    },
    onError: mutationError,
  });
  const passwordMutation = useMutation({
    mutationFn: resetPlatformAdministratorPassword,
    onSuccess: async () => {
      await invalidateAll();
      setPasswordTarget(null);
      Message.success("账号密码已重置");
    },
    onError: mutationError,
  });
  const statusMutation = useMutation({
    mutationFn: ({ userId, status: currentStatus }: StatusOperationInput) =>
      currentStatus === "active"
        ? disablePlatformAdministrator(userId)
        : enablePlatformAdministrator(userId),
    onSuccess: async (_result, variables) => {
      await invalidateAll();
      Message.success(variables.status === "active" ? "账号已禁用" : "账号已启用");
    },
    onError: mutationError,
  });
  const deleteMutation = useMutation({
    mutationFn: deletePlatformAdministrator,
    onSuccess: async (_result, userId) => {
      await invalidateAll();
      if (detailUserId === userId) setDetailUserId(null);
      Message.success("账号已删除");
    },
    onError: mutationError,
  });

  const operationPending =
    roleMutation.isPending ||
    passwordMutation.isPending ||
    statusMutation.isPending ||
    deleteMutation.isPending;

  const confirmStatusChange = (administrator: PlatformAdministratorListItem) => {
    const action = administrator.status === "active" ? "禁用" : "启用";
    Modal.confirm({
      title: `${action}账号 ${administrator.displayName}？`,
      content:
        administrator.status === "active"
          ? "禁用后该账号将无法登录管理端。"
          : "启用后该账号可恢复登录管理端。",
      okButtonProps: administrator.status === "active" ? { status: "danger" } : undefined,
      onOk: () =>
        statusMutation.mutateAsync({ userId: administrator.id, status: administrator.status }),
    });
  };

  const confirmDelete = (administrator: PlatformAdministratorListItem) => {
    Modal.confirm({
      title: `删除账号 ${administrator.displayName}？`,
      content: "该操作会软删除账号；至少需要保留一名活跃的平台超级管理员。",
      okButtonProps: { status: "danger" },
      onOk: () => deleteMutation.mutateAsync(administrator.id),
    });
  };

  const columns: ListColumn<PlatformAdministratorListItem>[] = [
    {
      key: "name",
      title: "账号",
      width: 240,
      render: (_, administrator) => (
        <DataTableNameCell name={administrator.displayName} id={administrator.username} />
      ),
    },
    { title: "邮箱", width: 190, render: () => "-" },
    {
      title: "角色",
      width: 170,
      render: (_, administrator) => platformAdministratorRoleLabels[administrator.role],
    },
    {
      title: "状态",
      width: 100,
      render: (_, administrator) => (
        <PlatformAdministratorStatusBadge status={administrator.status} />
      ),
    },
    {
      title: "来源",
      width: 120,
      render: (_, administrator) => platformAdministratorSourceLabels[administrator.source],
    },
    { title: "MFA", width: 90, render: () => "-" },
    {
      title: "最近登录",
      width: 180,
      render: (_, administrator) => formatDateTime(administrator.lastLoginAt),
    },
    {
      key: "__actions",
      title: "操作",
      width: 210,
      fixed: "right",
      render: (_, administrator) => {
        const menu = (
          <Menu
            onClickMenuItem={(key) => {
              if (key === "password") setPasswordTarget(administrator);
              if (key === "status") confirmStatusChange(administrator);
              if (key === "delete") confirmDelete(administrator);
            }}
          >
            <Menu.Item key="password" disabled={administrator.source !== "local"}>
              重置密码
            </Menu.Item>
            <Menu.Item key="status">
              {administrator.status === "active" ? "禁用账号" : "启用账号"}
            </Menu.Item>
            <Menu.Item key="delete">删除账号</Menu.Item>
          </Menu>
        );
        return (
          <DataTableRowActions>
            <DataTableRowActionButton onClick={() => setDetailUserId(administrator.id)}>
              详情
            </DataTableRowActionButton>
            <DataTableRowActionButton
              disabled={!canManage || operationPending}
              onClick={() => setRoleTarget(administrator)}
            >
              修改角色
            </DataTableRowActionButton>
            <ListRowMore droplist={menu} disabled={!canManage || operationPending} />
          </DataTableRowActions>
        );
      },
    },
  ];

  const overview = overviewQuery.data || [];
  const overviewUnavailable = overviewQuery.isPending || overviewQuery.isError;
  const activeCount = overview.filter((item) => item.status === "active").length;
  const superCount = overview.filter(
    (item) => item.status === "active" && item.role === "platform-admin",
  ).length;
  const metricValue = (value: number) => (overviewUnavailable ? "-" : String(value));
  const refreshing = overviewQuery.isFetching || listQuery.isFetching || rolesQuery.isFetching;

  return (
    <>
      <ListPageFrame
        header={
          <>
            <ListPageHeader
              title="平台运营账号"
              subtitle="管理平台本地登录账号；这些账号不属于租户，也不会同步为租户成员。"
              extra={
                <div className="flex gap-2">
                  <Button
                    icon={<IconRefresh />}
                    loading={refreshing}
                    onClick={() =>
                      void Promise.all([
                        overviewQuery.refetch(),
                        listQuery.refetch(),
                        rolesQuery.refetch(),
                      ])
                    }
                  >
                    刷新
                  </Button>
                  <Button
                    type="primary"
                    icon={<IconPlus />}
                    disabled={!canManage}
                    title={canManage ? undefined : "仅平台超级管理员可创建账号"}
                    onClick={() => setCreateVisible(true)}
                  >
                    新建账号
                  </Button>
                </div>
              }
            />

            <Alert
              type="warning"
              content="联调提示：前端已按 Services OpenAPI 接入 /platform-admins*；ANI 当前网关尚未注册对应处理器，请后端补齐后联调。"
            />

            <section className="grid flex-none grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
              <Metric label="全部账号" value={metricValue(overview.length)} hint="平台登录身份" />
              <Metric label="活跃" value={metricValue(activeCount)} hint="可登录管理端" />
              <Metric label="活跃超级管理员" value={metricValue(superCount)} hint="至少保留 1 名" />
              <Metric label="已启用 MFA" value="-" hint="接口未返回 MFA 状态" />
            </section>
          </>
        }
        toolbar={
          <ListToolbar
            filters={
              <div className="flex flex-wrap items-center gap-3">
                <Input.Search
                  value={keyword}
                  onChange={(value) => {
                    setKeyword(value);
                    setPage(1);
                  }}
                  allowClear
                  placeholder="搜索用户名或邮箱"
                  style={{ width: 320 }}
                />
                <Select
                  value={role}
                  onChange={(value) => {
                    setRole(value as "all" | PlatformAdministratorRole);
                    setPage(1);
                  }}
                  style={{ width: 180 }}
                >
                  <Select.Option value="all">全部角色</Select.Option>
                  {Object.entries(platformAdministratorRoleLabels).map(([value, label]) => (
                    <Select.Option key={value} value={value}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  value={status}
                  onChange={(value) => {
                    setStatus(value as "all" | PlatformAdministratorStatus);
                    setPage(1);
                  }}
                  style={{ width: 140 }}
                >
                  <Select.Option value="all">全部状态</Select.Option>
                  <Select.Option value="active">活跃</Select.Option>
                  <Select.Option value="disabled">已禁用</Select.Option>
                </Select>
              </div>
            }
            tools={
              <span className="text-xs text-gray-500">
                共 {listQuery.data?.length ?? 0} 个账号 · 列表邮箱和 MFA 待后端补充
              </span>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={listQuery.data || []}
          loading={listQuery.isPending}
          pagination={{
            page,
            pageSize,
            total: listQuery.data?.length ?? 0,
            onPageChange: setPage,
            onPageSizeChange: (nextPageSize) => {
              setPage(1);
              setPageSize(nextPageSize);
            },
          }}
          scroll={{ x: 1300, y: true }}
          emptyText="暂无符合条件的平台运营账号"
        />
      </ListPageFrame>

      <PlatformAdministratorCreateModal
        visible={createVisible}
        loading={createMutation.isPending}
        roles={rolesQuery.data || []}
        onCancel={() => setCreateVisible(false)}
        onSubmit={(input: CreatePlatformAdministratorInput) => createMutation.mutate(input)}
      />
      <PlatformAdministratorRoleModal
        target={roleTarget}
        loading={roleMutation.isPending}
        roles={rolesQuery.data || []}
        onCancel={() => setRoleTarget(null)}
        onSubmit={(nextRole) => {
          if (roleTarget) roleMutation.mutate({ userId: roleTarget.id, role: nextRole });
        }}
      />
      <PlatformAdministratorPasswordModal
        target={passwordTarget}
        loading={passwordMutation.isPending}
        onCancel={() => setPasswordTarget(null)}
        onSubmit={(newPassword) => {
          if (passwordTarget) {
            passwordMutation.mutate({ userId: passwordTarget.id, newPassword });
          }
        }}
      />
      <PlatformAdministratorDetailDrawer
        userId={detailUserId}
        roles={rolesQuery.data || []}
        onClose={() => setDetailUserId(null)}
      />
    </>
  );
}
