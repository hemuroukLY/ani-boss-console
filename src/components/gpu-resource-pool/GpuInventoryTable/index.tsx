import { Button, Card } from "@arco-design/web-react";
import clsx from "clsx";
import { getApiErrorMessage } from "@/api/client";
import { DataTable, type ListColumn } from "@/components/common";
import type {
  GpuInventoryDevice,
  GpuInventoryStatus,
} from "../types";

const statusMeta: Record<
  GpuInventoryStatus,
  { label: string; className: string }
> = {
  available: { label: "空闲", className: "bg-green-50 text-green-700" },
  in_use: { label: "已占用", className: "bg-gray-100 text-gray-700" },
  fault: { label: "故障", className: "bg-red-50 text-red-700" },
  maintenance: { label: "维护中", className: "bg-orange-50 text-orange-700" },
};

function formatMemory(memoryTotalMb?: number) {
  if (!memoryTotalMb) return "-";
  const gib = memoryTotalMb / 1024;
  return `${Number.isInteger(gib) ? gib : gib.toFixed(1)} GiB`;
}

function formatProfile(device: GpuInventoryDevice) {
  const parts = [device.gpuMode, device.gpuSpec, device.gpuSharingSpec].filter(
    Boolean,
  );
  return parts.length ? parts.join(" · ") : "-";
}

const columns: ListColumn<GpuInventoryDevice>[] = [
  {
    title: "节点 / 卡",
    width: 220,
    render: (_, device) => `${device.nodeName} / GPU-${device.gpuIndex}`,
  },
  { title: "GPU 类型", dataIndex: "gpuType", width: 200 },
  {
    title: "显存",
    width: 110,
    render: (_, device) => formatMemory(device.memoryTotalMb),
  },
  {
    title: "调度规格",
    width: 240,
    render: (_, device) => formatProfile(device),
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 110,
    render: (status: GpuInventoryStatus) => {
      const meta = statusMeta[status] || {
        label: status || "-",
        className: "bg-gray-100 text-gray-700",
      };
      return (
        <span
          className={clsx(
            "inline-flex rounded px-2 py-0.5 text-xs",
            meta.className,
          )}
        >
          {meta.label}
        </span>
      );
    },
  },
  {
    title: "租户 / 实例",
    width: 320,
    render: (_, device) =>
      device.tenantId
        ? `${device.tenantId} / ${device.instanceId || "-"}`
        : "-",
  },
  {
    title: "驱动版本",
    width: 150,
    render: (_, device) => device.driverVersion || "-",
  },
];

interface GpuInventoryTableProps {
  data: GpuInventoryDevice[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function GpuInventoryTable({
  data,
  loading,
  error,
  onRetry,
}: GpuInventoryTableProps) {
  return (
    <Card
      title="设备库存"
      className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0"
    >
      {error ? (
        <div className="flex items-center justify-between gap-4 p-6 text-sm text-red-600">
          <span>库存加载失败：{getApiErrorMessage(error)}</span>
          <Button size="small" onClick={onRetry}>
            重试
          </Button>
        </div>
      ) : (
        <DataTable
          tableLabel="GPU 设备库存"
          rowKey="id"
          columns={columns}
          data={data}
          loading={loading}
          pagination={false}
        />
      )}
    </Card>
  );
}
