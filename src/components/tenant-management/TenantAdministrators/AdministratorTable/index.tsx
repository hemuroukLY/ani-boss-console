import {
  Button,
  Dropdown,
  Menu,
  Space,
  Table,
  Tag,
} from "@arco-design/web-react";
import type { TenantAdminAction } from "@/features/tenant-management/TenantManagementProvider";
import {
  tenantAdminStatusMeta,
  type TenantAdmin,
} from "@/features/tenant-management/model";

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
  const renderMoreMenu = (admin: TenantAdmin) => (
    <Menu>
      {admin.status === "invited" ? (
        <>
          <Menu.Item
            key="resend-invite"
            onClick={() =>
              onConfirmAction(
                admin,
                "resend_invite",
                "重发邀请",
                `确认向 ${admin.email} 重新发送邀请？`,
                "邀请已重新发送",
              )
            }
          >
            重发邀请
          </Menu.Item>
          <Menu.Item
            key="accept-invite"
            onClick={() =>
              onConfirmAction(
                admin,
                "accept_invite",
                "模拟接受邀请",
                `确认模拟 ${admin.email} 接受邀请并同步为租户成员？`,
                "邀请已接受，管理员已激活",
              )
            }
          >
            模拟接受
          </Menu.Item>
        </>
      ) : null}
      {admin.status === "active" ? (
        <>
          <Menu.Item
            key="impersonate"
            onClick={() =>
              onConfirmAction(
                admin,
                "impersonate",
                "运维模拟登录",
                `确认以 ${admin.email} 的身份进入租户 Console？`,
                "模拟登录会话已创建",
              )
            }
          >
            模拟登录
          </Menu.Item>
          <Menu.Item key="reset-password" onClick={() => onOpenPassword(admin)}>
            重置密码
          </Menu.Item>
          {admin.role !== "租户所有者" ? (
            <Menu.Item
              key="transfer-owner"
              onClick={() =>
                onConfirmAction(
                  admin,
                  "transfer_owner",
                  "移交所有者",
                  `确认将租户所有者移交给 ${admin.email}？现有所有者将降为租户管理员。`,
                  "租户所有者已移交",
                )
              }
            >
              移交所有者
            </Menu.Item>
          ) : null}
        </>
      ) : null}
      <Menu.Item key="change-role" onClick={() => onOpenRole(admin)}>
        改角色
      </Menu.Item>
    </Menu>
  );

  return (
    <Table
      rowKey="id"
      pagination={false}
      data={admins}
      noDataElement="暂无管理员"
      scroll={{ x: 1180 }}
      columns={[
        {
          title: "管理员",
          width: 210,
          fixed: "left",
          render: (_, admin: TenantAdmin) => (
            <div>
              <div className="font-medium">
                {admin.displayName || admin.name}
              </div>
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
        { title: "最近登录", dataIndex: "lastLogin", width: 170 },
        { title: "邀请时间", dataIndex: "invitedAt", width: 120 },
        {
          title: "操作",
          width: 150,
          fixed: "right",
          render: (_, admin: TenantAdmin) => (
            <Space size={4}>
              {admin.status === "disabled" ? (
                <Button
                  type="text"
                  onClick={() =>
                    onConfirmAction(
                      admin,
                      "enable",
                      "启用管理员",
                      `确认启用 ${admin.email}？`,
                      "管理员已启用",
                    )
                  }
                >
                  启用
                </Button>
              ) : (
                <Button
                  type="text"
                  status="danger"
                  onClick={() =>
                    onConfirmAction(
                      admin,
                      "disable",
                      "禁用管理员",
                      `确认禁用 ${admin.email}？`,
                      "管理员已禁用",
                      true,
                    )
                  }
                >
                  禁用
                </Button>
              )}
              <Dropdown trigger="click" droplist={renderMoreMenu(admin)}>
                <Button type="text">更多</Button>
              </Dropdown>
            </Space>
          ),
        },
      ]}
    />
  );
}
