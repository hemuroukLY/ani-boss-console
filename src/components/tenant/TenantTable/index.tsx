import {
  Link,
  Menu,
  Modal,
  Popconfirm,
  Tag,
  Typography,
} from "@arco-design/web-react";
import { useNavigate } from "@tanstack/react-router";
import {
  ListDataTable,
  DataTableNameCell,
  DataTableRowActionButton,
  DataTableRowActions,
  ListRowMore,
} from "@/components/common";
import {
  tenantStatusMeta,
  type Tenant,
} from "@/components/tenant/model";

interface TenantTableProps {
  data: Tenant[];
  onToggleStatus: (tenant: Tenant) => void;
  onDisable: (tenant: Tenant) => void;
  onQuota: (tenant: Tenant) => void;
  onAdmins: (tenant: Tenant) => void;
}

export function TenantTable({
  data,
  onToggleStatus,
  onDisable,
  onQuota,
  onAdmins,
}: TenantTableProps) {
  const navigate = useNavigate();
  const columns = [
    {
      title: "租户 / 显示名",
      dataIndex: "name",
      width: 220,
      fixed: "left" as const,
      render: (_: unknown, tenant: Tenant) => (
        <DataTableNameCell
          name={
            <Link
              href={`/tenants/${tenant.id}`}
              onClick={(event) => {
                event.preventDefault();
                void navigate({
                  to: "/tenants/$tenantId",
                  params: { tenantId: tenant.id },
                });
              }}
            >
              {tenant.name}
            </Link>
          }
          secondary={tenant.displayName || "—"}
        />
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (_: unknown, tenant: Tenant) => {
        const status = tenantStatusMeta[tenant.status];
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    { title: "套餐", dataIndex: "quotaPackage", width: 110 },
    {
      title: "管理员数",
      dataIndex: "adminCount",
      width: 100,
      align: "right" as const,
    },
    {
      title: "余额（USD）",
      dataIndex: "balanceUsd",
      width: 130,
      align: "right" as const,
      render: (value: number) => (
        <Typography.Text type={value < 0 ? "error" : undefined}>
          {value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </Typography.Text>
      ),
    },
    { title: "区域", dataIndex: "regionName", width: 120 },
    { title: "开通时间", dataIndex: "createdAt", width: 170 },
    {
      title: "操作",
      width: 150,
      fixed: "right" as const,
      render: (_: unknown, tenant: Tenant) => {
        const moreMenu = (
          <Menu
            onClickMenuItem={(key) => {
              if (key === "quota") {
                onQuota(tenant);
              } else if (key === "admins") {
                onAdmins(tenant);
              } else if (key === "disable") {
                Modal.confirm({
                  title: `禁用 ${tenant.name} 后不可还原，确认继续？`,
                  okButtonProps: { status: "danger" },
                  onOk: () => onDisable(tenant),
                });
              }
            }}
          >
            <Menu.Item key="quota">配额</Menu.Item>
            <Menu.Item key="admins">管理员</Menu.Item>
            {tenant.status !== "disabled" ? (
              <Menu.Item key="disable">禁用</Menu.Item>
            ) : null}
          </Menu>
        );

        return (
          <DataTableRowActions>
            {tenant.status !== "disabled" ? (
              <Popconfirm
                title={`确认${tenant.status === "suspended" ? "解冻" : "冻结"}租户 ${tenant.name}？`}
                onOk={() => onToggleStatus(tenant)}
              >
                <DataTableRowActionButton>
                  {tenant.status === "suspended" ? "解冻" : "冻结"}
                </DataTableRowActionButton>
              </Popconfirm>
            ) : null}
            <ListRowMore droplist={moreMenu} />
          </DataTableRowActions>
        );
      },
    },
  ];

  return (
    <ListDataTable
      rowKey="id"
      columns={columns}
      data={data}
      border={false}
      pagination={{ pageSize: 10, showTotal: true, hideOnSinglePage: true }}
      emptyText="暂无符合条件的租户"
    />
  );
}
