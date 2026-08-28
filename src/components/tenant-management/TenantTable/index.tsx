import {
  Button,
  Link,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from "@arco-design/web-react";
import { useNavigate } from "@tanstack/react-router";
import {
  tenantStatusMeta,
  type Tenant,
} from "@/features/tenant-management/model";

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
      title: "租户",
      dataIndex: "name",
      width: 150,
      fixed: "left" as const,
      render: (_: unknown, tenant: Tenant) => (
        <Link
          href={`/tenants/${tenant.id}`}
          className="font-medium"
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
      ),
    },
    { title: "显示名", dataIndex: "displayName", width: 180 },
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
      width: 300,
      fixed: "right" as const,
      render: (_: unknown, tenant: Tenant) => (
        <Space size="mini">
          {tenant.status !== "disabled" ? (
            <Popconfirm
              title={`确认${tenant.status === "suspended" ? "解冻" : "冻结"}租户 ${tenant.name}？`}
              onOk={() => onToggleStatus(tenant)}
            >
              <Button type="text" size="mini">
                {tenant.status === "suspended" ? "解冻" : "冻结"}
              </Button>
            </Popconfirm>
          ) : null}
          <Button type="text" size="mini" onClick={() => onQuota(tenant)}>
            配额
          </Button>
          <Button type="text" size="mini" onClick={() => onAdmins(tenant)}>
            管理员
          </Button>
          {tenant.status !== "disabled" ? (
            <Popconfirm
              title={`禁用 ${tenant.name} 后不可还原，确认继续？`}
              okButtonProps={{ status: "danger" }}
              onOk={() => onDisable(tenant)}
            >
              <Button type="text" size="mini" status="danger">
                禁用
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      data={data}
      border={false}
      scroll={{ x: 1380 }}
      pagination={{ pageSize: 10, showTotal: true, hideOnSinglePage: true }}
      noDataElement="暂无符合条件的租户"
    />
  );
}
