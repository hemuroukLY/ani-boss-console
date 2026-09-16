import { Tag } from "@arco-design/web-react";
import { DataTable } from "@/components/common";
import type { TenantAdminAction } from "@/components/tenant/TenantManagementProvider";
import { tenantAdminStatusMeta, type TenantAdmin } from "@/components/tenant/model";
import { formatDate, formatDateTimeMinute } from "@/lib/date";

interface AdministratorTableProps {
  admins: TenantAdmin[];
  onOpenRole: (admin: TenantAdmin) => void;
  onOpenPassword: (admin: TenantAdmin) => void;
  onConfirmAction: (
    admin: TenantAdmin,
    action: TenantAdminAction,
    title: string,
    content: string,
    successMessage: string,
    danger?: boolean,
  ) => void;
}

export function AdministratorTable({
  admins,
  onOpenRole,
  onOpenPassword,
  onConfirmAction,
}: AdministratorTableProps) {
  return (
    <DataTable
      rowKey="id"
      pagination={false}
      data={admins}
      noDataElement="暂无管理员"
      rowActions={[
        {
          key: "status",
          label: (admin) => (admin.status === "disabled" ? "启用" : "禁用"),
          widthLabel: "启用",
          onClick: (admin) =>
            onConfirmAction(
              admin,
              admin.status === "disabled" ? "enable" : "disable",
              admin.status === "disabled" ? "启用管理员" : "禁用管理员",
              `确认${admin.status === "disabled" ? "启用" : "禁用"} ${admin.email}？`,
              admin.status === "disabled" ? "管理员已启用" : "管理员已禁用",
              admin.status !== "disabled",
            ),
        },
        {
          key: "resend-invite",
          label: "重发邀请",
          visible: (admin) => admin.status === "invited",
          onClick: (admin) =>
            onConfirmAction(
              admin,
              "resend_invite",
              "重发邀请",
              `确认向 ${admin.email} 重新发送邀请？`,
              "邀请已重新发送",
            ),
        },
        {
          key: "accept-invite",
          label: "模拟接受",
          visible: (admin) => admin.status === "invited",
          onClick: (admin) =>
            onConfirmAction(
              admin,
              "accept_invite",
              "模拟接受邀请",
              `确认模拟 ${admin.email} 接受邀请并同步为租户成员？`,
              "邀请已接受，管理员已激活",
            ),
        },
        {
          key: "impersonate",
          label: "模拟登录",
          visible: (admin) => admin.status === "active",
          onClick: (admin) =>
            onConfirmAction(
              admin,
              "impersonate",
              "运维模拟登录",
              `确认以 ${admin.email} 的身份进入租户 Console？`,
              "模拟登录会话已创建",
            ),
        },
        {
          key: "reset-password",
          label: "重置密码",
          visible: (admin) => admin.status === "active",
          onClick: onOpenPassword,
        },
        {
          key: "transfer-owner",
          label: "移交所有者",
          visible: (admin) => admin.status === "active" && admin.role !== "租户所有者",
          onClick: (admin) =>
            onConfirmAction(
              admin,
              "transfer_owner",
              "移交所有者",
              `确认将租户所有者移交给 ${admin.email}？现有所有者将降为租户管理员。`,
              "租户所有者已移交",
            ),
        },
        {
          key: "change-role",
          label: "改角色",
          onClick: onOpenRole,
        },
      ]}
      columns={[
        {
          title: "管理员",
          width: 210,
          fixed: "left",
          render: (_, admin: TenantAdmin) => (
            <div>
              <div className="font-medium">{admin.displayName || admin.name}</div>
              <div className="mt-1 text-xs text-gray-500">{admin.email}</div>
            </div>
          ),
        },
        { title: "角色", dataIndex: "role", width: 130 },
        {
          title: "状态",
          width: 100,
          render: (_, admin: TenantAdmin) => {
            const meta = tenantAdminStatusMeta[admin.status];
            return <Tag color={meta.color}>{meta.label}</Tag>;
          },
        },
        { title: "来源", dataIndex: "source", width: 90 },
        {
          title: "MFA",
          width: 90,
          render: (_, admin: TenantAdmin) =>
            admin.mfa ? <Tag color="green">已开启</Tag> : <Tag>未开启</Tag>,
        },
        {
          title: "最近登录",
          dataIndex: "lastLogin",
          width: 170,
          render: (value: string) => formatDateTimeMinute(value),
        },
        {
          title: "邀请时间",
          dataIndex: "invitedAt",
          width: 120,
          render: (value: string) => formatDate(value),
        },
      ]}
    />
  );
}
