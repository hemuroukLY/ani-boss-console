export type MeteringDimension =
  "gpu" | "cpu" | "memory" | "storage" | "tokens" | "kb-queries";

export interface MeteringTenantRow {
  id: string;
  tenant: string;
  tenantCode: string;
  region: string;
  current: number;
  previous: number;
  quotaRate: number;
  trend: "up" | "down" | "flat";
}

export interface MeteringDimensionData {
  key: MeteringDimension;
  label: string;
  unit: string;
  total: string;
  monthOnMonth: string;
  peakDay: string;
  quotaRate: string;
  description: string;
  trend: number[];
  tenants: MeteringTenantRow[];
}

const tenants = [
  ["tenant-001", "星环科技", "star-ring", "华东一区"],
  ["tenant-002", "云智研究院", "cloud-lab", "华北一区"],
  ["tenant-003", "数澜信息", "data-wave", "华东一区"],
  ["tenant-004", "启明制造", "qiming-mfg", "华南一区"],
  ["tenant-005", "远景教育", "vision-edu", "华北一区"],
] as const;

function makeRows(
  current: readonly number[],
  previous: readonly number[],
  quotaRates: readonly number[],
): MeteringTenantRow[] {
  return tenants.map(([id, tenant, tenantCode, region], index) => ({
    id,
    tenant,
    tenantCode,
    region,
    current: current[index],
    previous: previous[index],
    quotaRate: quotaRates[index],
    trend:
      current[index] > previous[index]
        ? "up"
        : current[index] < previous[index]
          ? "down"
          : "flat",
  }));
}

export const meteringDimensions: MeteringDimensionData[] = [
  {
    key: "gpu",
    label: "GPU-Hours",
    unit: "GPU-Hours",
    total: "1,284",
    monthOnMonth: "+12%",
    peakDay: "08-27",
    quotaRate: "71%",
    description: "GPU 卡数与实际占用时长的折算用量。",
    trend: [124, 136, 151, 143, 168, 182, 196],
    tenants: makeRows(
      [384, 296, 241, 205, 158],
      [342, 278, 252, 187, 146],
      [82, 68, 74, 59, 44],
    ),
  },
  {
    key: "cpu",
    label: "CPU-Hours",
    unit: "CPU-Hours",
    total: "18,620",
    monthOnMonth: "+8%",
    peakDay: "08-29",
    quotaRate: "64%",
    description: "云主机与容器 CPU 核数乘以运行时长。",
    trend: [2180, 2320, 2480, 2410, 2690, 2820, 2720],
    tenants: makeRows(
      [4860, 3980, 3640, 3280, 2860],
      [4520, 3710, 3480, 3010, 2520],
      [76, 69, 61, 58, 52],
    ),
  },
  {
    key: "memory",
    label: "Memory",
    unit: "GB-Hours",
    total: "96,480",
    monthOnMonth: "+5%",
    peakDay: "08-28",
    quotaRate: "58%",
    description: "各类实例内存规格乘以运行时长。",
    trend: [12120, 12780, 13340, 13180, 14260, 15120, 15680],
    tenants: makeRows(
      [26500, 21300, 18700, 16400, 13580],
      [24900, 20700, 18100, 15800, 12400],
      [72, 63, 57, 49, 45],
    ),
  },
  {
    key: "storage",
    label: "Storage",
    unit: "GB-Days",
    total: "42,760",
    monthOnMonth: "+9%",
    peakDay: "08-31",
    quotaRate: "67%",
    description: "块、对象与文件存储日均占用量汇总。",
    trend: [5420, 5610, 5780, 5990, 6210, 6620, 7130],
    tenants: makeRows(
      [12300, 9840, 8120, 7040, 5460],
      [11100, 9130, 7480, 6630, 4890],
      [86, 71, 64, 55, 48],
    ),
  },
  {
    key: "tokens",
    label: "Tokens",
    unit: "Tokens",
    total: "28.6M",
    monthOnMonth: "+18%",
    peakDay: "08-30",
    quotaRate: "41%",
    description: "推理服务请求产生的输入与输出 Token 合计。",
    trend: [3.1, 3.4, 3.7, 3.6, 4.2, 4.9, 4.7],
    tenants: makeRows(
      [8200000, 6740000, 5480000, 4560000, 3620000],
      [6800000, 5820000, 4720000, 3980000, 2940000],
      [63, 51, 46, 38, 32],
    ),
  },
  {
    key: "kb-queries",
    label: "KB Queries",
    unit: "次",
    total: "186,240",
    monthOnMonth: "+22%",
    peakDay: "08-26",
    quotaRate: "33%",
    description: "知识库检索与问答链路产生的查询次数。",
    trend: [21800, 23100, 24800, 26200, 28100, 30500, 31740],
    tenants: makeRows(
      [52200, 41800, 36400, 31200, 24640],
      [41700, 35600, 29400, 27200, 18800],
      [48, 39, 35, 31, 26],
    ),
  },
];

export const meteringTrendDays = [
  "08-25",
  "08-26",
  "08-27",
  "08-28",
  "08-29",
  "08-30",
  "08-31",
];
