import { Card } from "@arco-design/web-react";
import clsx from "clsx";
import { DataTable, type ListColumn } from "@/components/common";
import type {
  GpuInventoryDevice,
  GpuInventoryStatus,
} from "../types";

const statusMeta: Record<
  GpuInventoryStatus,
  { label: string; className: string }
> = {
  available: {
    label: "空闲（未分配）",
    className: "bg-green-50 text-green-700",
  },
  in_use: { label: "租户已占用", className: "bg-gray-100 text-gray-700" },
  fault: { label: "不可用", className: "bg-red-50 text-red-700" },
  maintenance: { label: "维护中", className: "bg-orange-50 text-orange-700" },
};

function formatMemory(memoryTotalMb?: number) {
  if (!memoryTotalMb) return "-";
  const gib = memoryTotalMb / 1024;
  return `${Number.isInteger(gib) ? gib : gib.toFixed(1)} GiB`;
}

function formatProfile(device: GpuInventoryDevice) {
  const mode = device.gpuMode?.trim().toLowerCase();
  if (mode === "wholecard") return "整卡";

  if (mode === "vgpu") {
    const detail =
      device.gpuSharingSpec || device.gpuSpec || device.gpuSharingPolicy;
    return detail ? `vGPU · ${detail}` : "vGPU";
  }

  const parts = [
    device.gpuMode,
    device.gpuSharingSpec,
    device.gpuSpec,
    device.gpuSharingPolicy,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "整卡";
}

function formatModel(device: GpuInventoryDevice) {
  const memory = formatMemory(device.memoryTotalMb);
  return memory === "-"
    ? device.gpuType || "-"
    : `${device.gpuType} · ${memory}`;
}

function formatOwnership(device: GpuInventoryDevice) {
  const parts = [device.tenantId, device.instanceId].filter(Boolean);
  return parts.length ? parts.join(" · ") : "-";
}

const columns: ListColumn<GpuInventoryDevice>[] = [
  {
    title: "节点 / 卡",
    width: 220,
    render: (_, device) => `${device.nodeName} / GPU-${device.gpuIndex}`,
  },
  {
    title: "型号",
    width: 260,
    render: (_, device) => formatModel(device),
  },
  {
    title: "切分",
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
    title: "归属",
    width: 320,
    render: (_, device) => formatOwnership(device),
  },
  {
    title: "操作",
    width: 100,
    fixed: "right",
    render: () => "-",
  },
];

interface GpuInventoryTableProps {
  data: GpuInventoryDevice[];
  loading: boolean;
}

export function GpuInventoryTable({
  data,
  loading,
}: GpuInventoryTableProps) {
  return (
    <Card
      title="设备列表 · 切分 / 分配"
      className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0"
    >
      <DataTable
        tableLabel="GPU 设备列表"
        rowKey="id"
        columns={columns}
        data={data}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
}
