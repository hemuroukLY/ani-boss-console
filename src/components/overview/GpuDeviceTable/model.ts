export type DeviceStatus = "空闲未分配" | "已预留" | "已占用" | "异常";

export interface Device {
  id: string;
  location: string;
  model: string;
  slicing: string;
  status: DeviceStatus;
  tenant: string;
  occupant: string;
}

export const devices: Device[] = [
  {
    id: "gpu-dev-01",
    location: "gpu-a / GPU-0",
    model: "A100 · 40 GiB",
    slicing: "整卡",
    status: "已占用",
    tenant: "demo-corp",
    occupant: "gpu-infer-01",
  },
  {
    id: "gpu-dev-02",
    location: "gpu-a / GPU-1",
    model: "A100 · 40 GiB",
    slicing: "整卡",
    status: "空闲未分配",
    tenant: "—",
    occupant: "—",
  },
  {
    id: "gpu-dev-03",
    location: "gpu-b / GPU-0",
    model: "H100 · 80 GiB",
    slicing: "整卡",
    status: "已占用",
    tenant: "demo-corp",
    occupant: "gpu-train-01",
  },
  {
    id: "gpu-dev-04",
    location: "gpu-b / GPU-1",
    model: "H100 · 80 GiB",
    slicing: "整卡",
    status: "异常",
    tenant: "—",
    occupant: "驱动升级窗口",
  },
  {
    id: "gpu-dev-05",
    location: "gpu-c / GPU-0",
    model: "A10 · 24 GiB",
    slicing: "整卡",
    status: "空闲未分配",
    tenant: "—",
    occupant: "—",
  },
  {
    id: "gpu-dev-06",
    location: "gpu-c / GPU-1",
    model: "A10 · 24 GiB",
    slicing: "整卡",
    status: "异常",
    tenant: "—",
    occupant: "Xid 79 硬件错误",
  },
  {
    id: "gpu-dev-07",
    location: "gpu-d / GPU-0",
    model: "A100 · 40 GiB",
    slicing: "整卡",
    status: "已占用",
    tenant: "acme-ai",
    occupant: "acme-batch-3",
  },
  {
    id: "gpu-dev-08",
    location: "gpu-d / GPU-1",
    model: "A100 · 40 GiB",
    slicing: "整卡",
    status: "空闲未分配",
    tenant: "—",
    occupant: "—",
  },
];

export const deviceStatusColor = {
  空闲未分配: "green",
  已预留: "blue",
  已占用: "arcoblue",
  异常: "red",
} as const;
