import type { PlatformMeteringResourceType } from "@/api/platform";

export type MeteringDimension = "gpu" | "cpu" | "memory" | "storage" | "tokens" | "kb-queries";

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
  resourceType?: PlatformMeteringResourceType;
  unavailableReason?: string;
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
  {
    key: "storage",
    label: "Storage",
    unit: "GB-Days",
    description: "块、对象与文件存储日均占用量汇总。",
    unavailableReason: "ANI 当前没有平台存储计量资源类型。",
  },
  {
    key: "tokens",
    label: "Tokens",
    unit: "Tokens",
    description: "推理服务请求产生的输入与输出 Token 合计。",
    unavailableReason: "待确认输入、输出和总量的页面汇总口径后接入。",
  },
  {
    key: "kb-queries",
    label: "KB Queries",
    unit: "次",
    description: "知识库检索与问答链路产生的查询次数。",
    unavailableReason: "ANI 当前没有知识库查询平台计量资源类型。",
  },
];
