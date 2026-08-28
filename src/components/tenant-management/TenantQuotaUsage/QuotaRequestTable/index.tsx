import { Button, Space, Table, Tag, Typography } from "@arco-design/web-react";
import type { TenantQuotaRequest } from "@/features/tenant-management/model";
import { formatNumber } from "../formatters";

const requestStatusMeta = {
  pending: { label: "待审批", color: "orange" },
  approved: { label: "已通过", color: "green" },
  rejected: { label: "已驳回", color: "red" },
} as const;

interface QuotaRequestTableProps {
  requests: TenantQuotaRequest[];
  onCreate: () => void;
  onApprove: (request: TenantQuotaRequest) => void;
  onReject: (request: TenantQuotaRequest) => void;
}

export function QuotaRequestTable({
  requests,
  onCreate,
  onApprove,
  onReject,
}: QuotaRequestTableProps) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Typography.Title heading={6} className="!mb-0">
          配额申请
        </Typography.Title>
        <Button type="primary" onClick={onCreate}>
          代客申请
        </Button>
      </div>
      <Table
        rowKey="id"
        pagination={false}
        data={requests}
        noDataElement="暂无配额申请"
        columns={[
          { title: "申请时间", dataIndex: "requestedAt", width: 170 },
          { title: "申请人", dataIndex: "by", width: 160 },
          {
            title: "GPU-Hours",
            width: 180,
            render: (_, request: TenantQuotaRequest) =>
              `${formatNumber(request.currentGpuHours)} → ${formatNumber(request.requestedGpuHours)}`,
          },
          {
            title: "存储 Gi",
            width: 180,
            render: (_, request: TenantQuotaRequest) =>
              `${formatNumber(request.currentStorageGi)} → ${formatNumber(request.requestedStorageGi)}`,
          },
          {
            title: "原因",
            render: (_, request: TenantQuotaRequest) => (
              <div>
                <div>{request.reason}</div>
                {request.rejectReason ? (
                  <div className="mt-1 text-xs text-red-500">
                    驳回：{request.rejectReason}
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            title: "状态",
            width: 100,
            render: (_, request: TenantQuotaRequest) => {
              const meta = requestStatusMeta[request.status];
              return <Tag color={meta.color}>{meta.label}</Tag>;
            },
          },
          {
            title: "操作",
            width: 150,
            render: (_, request: TenantQuotaRequest) =>
              request.status === "pending" ? (
                <Space>
                  <Button type="text" onClick={() => onApprove(request)}>
                    通过
                  </Button>
                  <Button
                    type="text"
                    status="danger"
                    onClick={() => onReject(request)}
                  >
                    驳回
                  </Button>
                </Space>
              ) : (
                "—"
              ),
          },
        ]}
      />
    </section>
  );
}
