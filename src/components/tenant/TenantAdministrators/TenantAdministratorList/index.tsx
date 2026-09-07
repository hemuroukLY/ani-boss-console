import {
  Button,
  Form,
  Input,
  Menu,
  Message,
  Modal,
  Select,
  Space,
  Tag,
} from "@arco-design/web-react";
import { IconDownload, IconPlus } from "@arco-design/web-react/icon";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ListDataTable,
  DataTableNameCell,
  ListPageFrame,
  ListPageHeader,
  ListRowMore,
  type ListColumn,
} from "@/components/common";
import { AdministratorPasswordModal } from "@/components/tenant/TenantAdministrators/AdministratorPasswordModal";
import { AdministratorRoleModal } from "@/components/tenant/TenantAdministrators/AdministratorRoleModal";
import {
  initialInviteDraft,
  type InviteDraft,
} from "@/components/tenant/TenantAdministrators/types";
import {
  useTenantManagement,
  type TenantAdminAction,
} from "@/components/tenant/TenantManagementProvider";
import {
  tenantAdminRoles,
  tenantAdminStatusMeta,
  type TenantAdmin,
  type TenantAdminRole,
} from "@/components/tenant/model";

export function TenantAdministratorList() {
  const {
    tenants,
    tenantAdmins,
    inviteTenantAdmin,
    applyTenantAdminAction,
  } = useTenantManagement();
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteTenantId, setInviteTenantId] = useState("");
  const [inviteDraft, setInviteDraft] = useState<InviteDraft>(initialInviteDraft);
  const [roleAdmin, setRoleAdmin] = useState<TenantAdmin>();
  const [selectedRole, setSelectedRole] =
    useState<TenantAdminRole>("租户管理员");
  const [passwordAdmin, setPasswordAdmin] = useState<TenantAdmin>();
  const [newPassword, setNewPassword] = useState("");

  const showResult = (
    result: { ok: boolean; reason?: string },
    successMessage: string,
  ) => {
    if (result.ok) {
      Message.success(successMessage);
      return true;
    }
    Message.error(result.reason ?? "操作失败");
    return false;
  };

  const confirmAction = (
    admin: TenantAdmin,
    action: TenantAdminAction,
    title: string,
    content: string,
    successMessage: string,
    danger = false,
  ) => {
    Modal.confirm({
      title,
      content,
      okButtonProps: danger ? { status: "danger" } : undefined,
      onOk: () =>
        void showResult(applyTenantAdminAction(admin.id, action), successMessage),
    });
  };

  const submitInvite = () => {
    if (!inviteTenantId) {
      Message.warning("请选择目标租户");
      return;
    }
    if (!inviteDraft.email.trim() || !inviteDraft.email.includes("@")) {
      Message.warning("请输入有效邮箱");
      return;
    }
    if (
      showResult(
        inviteTenantAdmin(inviteTenantId, inviteDraft),
        "管理员邀请已发送",
      )
    ) {
      setInviteVisible(false);
      setInviteDraft(initialInviteDraft);
      setInviteTenantId("");
    }
  };

  const confirmRoleChange = () => {
    if (!roleAdmin) return;
    if (
      showResult(
        applyTenantAdminAction(roleAdmin.id, "change_role", {
          role: selectedRole,
        }),
        "管理员角色已更新",
      )
    ) {
      setRoleAdmin(undefined);
    }
  };

  const confirmPasswordReset = () => {
    if (!passwordAdmin) return;
    if (
      showResult(
        applyTenantAdminAction(passwordAdmin.id, "reset_password", {
          password: newPassword,
        }),
        "管理员密码已重置",
      )
    ) {
      setPasswordAdmin(undefined);
      setNewPassword("");
    }
  };

  const moreMenu = (admin: TenantAdmin) => (
    <Menu
      onClickMenuItem={(key) => {
        if (key === "resend") {
          confirmAction(
            admin,
            "resend_invite",
            "重发邀请",
            `确认向 ${admin.email} 重新发送邀请？`,
            "邀请已重新发送",
          );
        } else if (key === "accept") {
          confirmAction(
            admin,
            "accept_invite",
            "模拟接受邀请",
            `确认模拟 ${admin.email} 接受邀请？`,
            "邀请已接受，管理员已激活",
          );
        } else if (key === "impersonate") {
          confirmAction(
            admin,
            "impersonate",
            "运维模拟登录",
            `确认以 ${admin.email} 的身份进入租户 Console？`,
            "模拟登录会话已创建",
          );
        } else if (key === "password") {
          setNewPassword("");
          setPasswordAdmin(admin);
        } else if (key === "transfer") {
          confirmAction(
            admin,
            "transfer_owner",
            "移交所有者",
            `确认将 ${admin.email} 设为租户所有者？`,
            "租户所有者已移交",
          );
        } else if (key === "role") {
          setSelectedRole(admin.role);
          setRoleAdmin(admin);
        } else if (key === "enable") {
          confirmAction(
            admin,
            "enable",
            "启用管理员",
            `确认启用 ${admin.email}？`,
            "管理员已启用",
          );
        } else if (key === "disable") {
          confirmAction(
            admin,
            "disable",
            "禁用管理员",
            `确认禁用 ${admin.email}？`,
            "管理员已禁用",
            true,
          );
        }
      }}
    >
      {admin.status === "invited" ? (
        <>
          <Menu.Item key="resend">重发邀请</Menu.Item>
          <Menu.Item key="accept">模拟接受</Menu.Item>
        </>
      ) : null}
      {admin.status === "active" ? (
        <>
          <Menu.Item key="impersonate">模拟登录</Menu.Item>
          <Menu.Item key="password">重置密码</Menu.Item>
          {admin.role !== "租户所有者" ? (
            <Menu.Item key="transfer">移交所有者</Menu.Item>
          ) : null}
        </>
      ) : null}
      <Menu.Item key="role">改角色</Menu.Item>
      {admin.status === "disabled" ? (
        <Menu.Item key="enable">启用</Menu.Item>
      ) : (
        <Menu.Item key="disable">禁用</Menu.Item>
      )}
    </Menu>
  );

  const columns: ListColumn<TenantAdmin>[] = [
    {
      title: "用户 / 显示名",
      width: 190,
      fixed: "left",
      render: (_, admin) => (
        <DataTableNameCell
          name={
            <Link
              to="/tenants-admins/$adminId"
              params={{ adminId: admin.id }}
            >
              {admin.name}
            </Link>
          }
          secondary={admin.displayName || "-"}
        />
      ),
    },
    { title: "邮箱", dataIndex: "email", width: 210 },
    { title: "租户", dataIndex: "tenantName", width: 150 },
    { title: "角色", dataIndex: "role", width: 130 },
    {
      title: "状态",
      width: 100,
      render: (_, admin) => {
        const meta = tenantAdminStatusMeta[admin.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "MFA",
      width: 90,
      render: (_, admin) =>
        admin.mfa ? <Tag color="green">已开启</Tag> : <Tag>未开启</Tag>,
    },
    { title: "来源", dataIndex: "source", width: 90 },
    { title: "最近登录", dataIndex: "lastLogin", width: 170 },
    {
      title: "操作",
      width: 120,
      fixed: "right",
      render: (_, admin) => (
        <ListRowMore droplist={moreMenu(admin)} />
      ),
    },
  ];

  return (
    <>
      <ListPageFrame
        header={
          <ListPageHeader
            title="租户管理员"
            subtitle="管理租户管理员邀请、角色、状态与运维模拟登录。"
            extra={
              <Space>
                <Button
                  icon={<IconDownload />}
                  onClick={() => Message.success("租户管理员数据已导出")}
                >
                  导出
                </Button>
                <Button
                  type="primary"
                  icon={<IconPlus />}
                  onClick={() => {
                    setInviteTenantId(
                      tenants.find((tenant) => tenant.status !== "disabled")?.id ??
                        "",
                    );
                    setInviteDraft(initialInviteDraft);
                    setInviteVisible(true);
                  }}
                >
                  邀请管理员
                </Button>
              </Space>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={tenantAdmins}
          pagination={{ pageSize: 10, showTotal: true, hideOnSinglePage: true }}
          emptyText="还没有租户管理员"
        />
      </ListPageFrame>

      <Modal
        title="邀请管理员"
        visible={inviteVisible}
        okText="发送邀请"
        onOk={submitInvite}
        onCancel={() => setInviteVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="目标租户" required>
            <Select
              value={inviteTenantId}
              onChange={setInviteTenantId}
              options={tenants
                .filter((tenant) => tenant.status !== "disabled")
                .map((tenant) => ({
                  label: `${tenant.name} · ${tenant.displayName}`,
                  value: tenant.id,
                }))}
            />
          </Form.Item>
          <Form.Item label="邮箱" required>
            <Input
              value={inviteDraft.email}
              placeholder="name@example.com"
              onChange={(email) =>
                setInviteDraft((current) => ({ ...current, email }))
              }
            />
          </Form.Item>
          <Form.Item label="用户名">
            <Input
              value={inviteDraft.name}
              placeholder="未填写时使用邮箱前缀"
              onChange={(name) =>
                setInviteDraft((current) => ({ ...current, name }))
              }
            />
          </Form.Item>
          <Form.Item label="显示名">
            <Input
              value={inviteDraft.displayName}
              onChange={(displayName) =>
                setInviteDraft((current) => ({ ...current, displayName }))
              }
            />
          </Form.Item>
          <Form.Item label="角色">
            <Select
              value={inviteDraft.role}
              onChange={(role) =>
                setInviteDraft((current) => ({ ...current, role }))
              }
              options={tenantAdminRoles.map((role) => ({ label: role, value: role }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <AdministratorRoleModal
        admin={roleAdmin}
        role={selectedRole}
        onRoleChange={setSelectedRole}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleAdmin(undefined)}
      />
      <AdministratorPasswordModal
        admin={passwordAdmin}
        password={newPassword}
        onPasswordChange={setNewPassword}
        onConfirm={confirmPasswordReset}
        onCancel={() => setPasswordAdmin(undefined)}
      />
    </>
  );
}
