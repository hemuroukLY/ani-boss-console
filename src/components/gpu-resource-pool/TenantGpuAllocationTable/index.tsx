import { Button, Card } from "@arco-design/web-react";
import { getApiErrorMessage } from "@/api/client";
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
  error: unknown;
  onRetry: () => void;
  onEditQuota: (tenant: TenantGpuAllocation) => void;
  onEditReservation: (tenant: TenantGpuAllocation) => void;
}

export function TenantGpuAllocationTable({
  data,
  loading,
  error,
  onRetry,
  onEditQuota,
  onEditReservation,
}: TenantGpuAllocationTableProps) {
  const columns: ListColumn<TenantGpuAllocation>[] = [
    {
      title: "租户",
      width: 260,
      render: (_, tenant) => (
        <DataTableNameCell
          name={tenant.tenantName}
          secondary={tenant.tenantId}
        />
      ),
    },
    { title: "配额上限", dataIndex: "quotaTotal", width: 110 },
    {
      title: "资源预留",
      width: 130,
      dataIndex: "allocatedGpuCount",
    },
    { title: "已用", dataIndex: "used", width: 90 },
    { title: "处理中", dataIndex: "reserved", width: 90 },
    { title: "可创建", dataIndex: "available", width: 90 },
    {
      title: "状态",
      width: 100,
      render: (_, tenant) => (tenant.tightened ? "已收紧" : "正常"),
    },
    {
      title: "操作",
      width: "max-content",
      fixed: "right",
      render: (_, tenant) => (
        <DataTableRowActions>
          <DataTableRowActionButton
            onClick={() => onEditReservation(tenant)}
          >
            调整资源预留
          </DataTableRowActionButton>
          <DataTableRowActionButton onClick={() => onEditQuota(tenant)}>
            调整配额上限
          </DataTableRowActionButton>
        </DataTableRowActions>
      ),
    },
  ];

  return (
    <Card
      title="租户 GPU 台账"
      className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0"
    >
      {error ? (
        <div className="flex items-center justify-between gap-4 p-6 text-sm text-red-600">
          <span>租户台账加载失败：{getApiErrorMessage(error)}</span>
          <Button size="small" onClick={onRetry}>
            重试
          </Button>
        </div>
      ) : (
        <DataTable
          tableLabel="租户 GPU 台账"
          rowKey="tenantId"
          columns={columns}
          data={data}
          loading={loading}
          pagination={false}
        />
      )}
    </Card>
  );
}
