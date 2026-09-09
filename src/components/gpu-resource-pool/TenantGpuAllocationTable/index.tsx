import { Card } from "@arco-design/web-react";
import {
  DataTable,
  DataTableNameCell,
  DataTableRowActionButton,
  DataTableRowActions,
  type ListColumn,
} from "@/components/common";
import type { TenantGpuAllocation } from "../types";

interface TenantGpuAllocationTableProps {
  data: TenantGpuAllocation[];
  loading: boolean;
  onEditQuota: (tenant: TenantGpuAllocation) => void;
}

export function TenantGpuAllocationTable({
  data,
  loading,
  onEditQuota,
}: TenantGpuAllocationTableProps) {
  const columns: ListColumn<TenantGpuAllocation>[] = [
    {
      title: "租户",
      width: 260,
      render: (_, tenant) => (
        <DataTableNameCell name={tenant.tenantName} secondary={tenant.tenantId} />
      ),
    },
    { title: "配额上限", dataIndex: "quotaTotal", width: 110 },
    { title: "已用", dataIndex: "used", width: 90 },
    { title: "处理中", dataIndex: "reserved", width: 90 },
    {
      title: "操作",
      width: 200,
      fixed: "right",
      render: (_, tenant) => (
        <DataTableRowActions>
          <DataTableRowActionButton onClick={() => onEditQuota(tenant)}>
            调整配额上限
          </DataTableRowActionButton>
        </DataTableRowActions>
      ),
    },
  ];

  return (
    <Card title="租户分配台账" className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0">
      <DataTable
        tableLabel="租户 GPU 分配台账"
        rowKey="tenantId"
        columns={columns}
        data={data}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
}
