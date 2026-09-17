import type { PlatformMeteringResourceType } from "@/api/platform";

export type MeteringDimension = "gpu" | "cpu" | "memory";

export interface MeteringTenantRow {
  id: string;
  current: number;
  previous: number;
  trend: "up" | "down" | "flat";
}

export interface MeteringDimensionOption {
  key: MeteringDimension;
  label: string;
  unit: string;
  description: string;
  resourceType: PlatformMeteringResourceType;
}

export const meteringDimensions: MeteringDimensionOption[] = [
  {
    key: "gpu",
    label: "GPU-Hours",
    unit: "GPU-Hours",
    description: "GPU 卡数与实际占用时长的折算用量。",
    resourceType: "instance_gpu_seconds",
  },
  {
    key: "cpu",
    label: "CPU-Hours",
    unit: "CPU-Hours",
    description: "云主机与容器 CPU 核数乘以运行时长。",
    resourceType: "instance_cpu_seconds",
  },
  {
    key: "memory",
    label: "Memory",
    unit: "GiB-Hours",
    description: "各类实例内存规格乘以运行时长。",
    resourceType: "instance_memory_gib_seconds",
  },
];
