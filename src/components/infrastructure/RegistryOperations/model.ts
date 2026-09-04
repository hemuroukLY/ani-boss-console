export interface RegistryTenantQuota {
  id: string;
  name: string;
  code: string;
  usedGi: number;
  maxGi: number;
  imageCount: number;
  projectCount: number;
  pendingExpandGi?: number;
}

export type RegistryImageKind = "容器" | "GPU 容器" | "沙箱" | "虚拟机";
export type VulnerabilityLevel = "high" | "medium" | "low" | "scanning";

export interface RegistryImageScan {
  id: string;
  image: string;
  tag: string;
  kind: RegistryImageKind;
  project: string;
  tenant: string;
  level: VulnerabilityLevel;
  cveSummary: string;
  scannedAt: string;
}

export interface RegistryScanJob {
  id: string;
  image: string;
  status: "已完成" | "扫描中" | "失败";
  summary: string;
  startedAt: string;
}

export interface RegistryGcCandidate {
  id: string;
  digest: string;
  repository: string;
  sizeGi: number;
  reason: string;
  lastReferencedAt: string;
}

export interface RegistryGcRun {
  id: string;
  status: "成功" | "部分成功" | "失败";
  reclaimedGi: number;
  deletedLayers: number;
  startedAt: string;
  duration: string;
}

export const registryTenantQuotas: RegistryTenantQuota[] = [
  {
    id: "tenant-demo",
    name: "Demo 科技",
    code: "demo",
    usedGi: 18.4,
    maxGi: 20,
    imageCount: 46,
    projectCount: 5,
    pendingExpandGi: 40,
  },
  {
    id: "tenant-research",
    name: "AI 研究院",
    code: "ai-lab",
    usedGi: 9.8,
    maxGi: 10,
    imageCount: 28,
    projectCount: 3,
  },
  {
    id: "tenant-contoso",
    name: "Contoso 制造",
    code: "contoso",
    usedGi: 6,
    maxGi: 30,
    imageCount: 17,
    projectCount: 4,
  },
  {
    id: "tenant-internal",
    name: "平台研发",
    code: "platform-rd",
    usedGi: 32.6,
    maxGi: 80,
    imageCount: 72,
    projectCount: 8,
  },
];

export const registryImageScans: RegistryImageScan[] = [
  {
    id: "image-chat-api",
    image: "demo/chat-api",
    tag: "v2.4.1",
    kind: "容器",
    project: "demo",
    tenant: "Demo 科技",
    level: "high",
    cveSummary: "2 高危 · CVE-2026-1847 / CVE-2026-2219",
    scannedAt: "2026-09-04 09:32",
  },
  {
    id: "image-embedding",
    image: "ai-lab/embedding-worker",
    tag: "2026.09",
    kind: "GPU 容器",
    project: "research",
    tenant: "AI 研究院",
    level: "medium",
    cveSummary: "3 中危 · 8 低危",
    scannedAt: "2026-09-04 09:18",
  },
  {
    id: "image-sandbox",
    image: "platform/sandbox-runtime",
    tag: "1.8.0",
    kind: "沙箱",
    project: "system",
    tenant: "平台研发",
    level: "low",
    cveSummary: "1 低危",
    scannedAt: "2026-09-04 08:56",
  },
  {
    id: "image-factory",
    image: "contoso/factory-agent",
    tag: "stable",
    kind: "容器",
    project: "factory",
    tenant: "Contoso 制造",
    level: "scanning",
    cveSummary: "扫描进行中",
    scannedAt: "2026-09-04 09:41",
  },
  {
    id: "image-base",
    image: "platform/base-ubuntu",
    tag: "24.04-3",
    kind: "虚拟机",
    project: "system",
    tenant: "平台研发",
    level: "low",
    cveSummary: "未发现中高危漏洞",
    scannedAt: "2026-09-03 22:10",
  },
];

export const registryScanJobs: RegistryScanJob[] = [
  {
    id: "scan-240904-03",
    image: "contoso/factory-agent:stable",
    status: "扫描中",
    summary: "已完成基础包分析",
    startedAt: "2026-09-04 09:41",
  },
  {
    id: "scan-240904-02",
    image: "demo/chat-api:v2.4.1",
    status: "已完成",
    summary: "2 高危 · 5 中危 · 12 低危",
    startedAt: "2026-09-04 09:31",
  },
  {
    id: "scan-240904-01",
    image: "ai-lab/embedding-worker:2026.09",
    status: "已完成",
    summary: "0 高危 · 3 中危 · 8 低危",
    startedAt: "2026-09-04 09:17",
  },
];

export const registryGcCandidates: RegistryGcCandidate[] = [
  {
    id: "layer-1",
    digest: "sha256:74b8...a912",
    repository: "demo/chat-api",
    sizeGi: 1.8,
    reason: "未被任何 Tag 引用",
    lastReferencedAt: "2026-08-11 14:20",
  },
  {
    id: "layer-2",
    digest: "sha256:9c21...4ef0",
    repository: "ai-lab/embedding-worker",
    sizeGi: 0.9,
    reason: "历史构建缓存",
    lastReferencedAt: "2026-08-19 02:44",
  },
  {
    id: "layer-3",
    digest: "sha256:2fd5...c136",
    repository: "platform/sandbox-runtime",
    sizeGi: 0.6,
    reason: "已删除 Tag 的孤立层",
    lastReferencedAt: "2026-08-25 18:05",
  },
];

export const registryGcRuns: RegistryGcRun[] = [
  {
    id: "gc-240903",
    status: "成功",
    reclaimedGi: 7.4,
    deletedLayers: 19,
    startedAt: "2026-09-03 02:00",
    duration: "3 分 18 秒",
  },
  {
    id: "gc-240827",
    status: "部分成功",
    reclaimedGi: 4.1,
    deletedLayers: 11,
    startedAt: "2026-08-27 02:00",
    duration: "5 分 42 秒",
  },
  {
    id: "gc-240820",
    status: "成功",
    reclaimedGi: 9.6,
    deletedLayers: 27,
    startedAt: "2026-08-20 02:00",
    duration: "4 分 06 秒",
  },
];

export function percentOf(used: number, total: number) {
  return Math.round((used / Math.max(1, total)) * 100);
}
