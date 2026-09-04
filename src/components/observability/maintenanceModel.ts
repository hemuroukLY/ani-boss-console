export interface MaintenanceSkill {
  id: string;
  name: string;
  domain: "计算" | "存储" | "网络" | "可观测";
  version: string;
  status: "ready" | "disabled" | "attention";
  scope: string;
  successRate: string;
  lastRunAt: string;
}

export interface MaintenanceJob {
  id: string;
  name: string;
  type: "巡检" | "修复" | "扩容" | "回收";
  status: "success" | "running" | "failed";
  target: string;
  triggeredBy: string;
  startedAt: string;
  duration: string;
}

export interface PlatformIncident {
  id: string;
  title: string;
  severity: "P1" | "P2" | "P3";
  status: "investigating" | "mitigated" | "resolved";
  impact: string;
  owner: string;
  alertCount: number;
  startedAt: string;
  updatedAt: string;
}

export const maintenanceSkills: MaintenanceSkill[] = [
  {
    id: "skill-node-inspection",
    name: "节点健康巡检",
    domain: "计算",
    version: "v1.6.0",
    status: "ready",
    scope: "全 Region Kubernetes 节点",
    successRate: "99.4%",
    lastRunAt: "2026-09-04 09:30",
  },
  {
    id: "skill-gpu-diagnosis",
    name: "GPU Xid 诊断",
    domain: "计算",
    version: "v1.3.2",
    status: "attention",
    scope: "NVIDIA GPU 设备",
    successRate: "96.8%",
    lastRunAt: "2026-09-04 08:52",
  },
  {
    id: "skill-storage-check",
    name: "存储后端巡检",
    domain: "存储",
    version: "v2.1.0",
    status: "ready",
    scope: "块、对象、文件与向量存储",
    successRate: "99.1%",
    lastRunAt: "2026-09-04 09:15",
  },
  {
    id: "skill-ip-pool",
    name: "IP 池容量检查",
    domain: "网络",
    version: "v1.1.4",
    status: "ready",
    scope: "SDN 与 IPAM 地址池",
    successRate: "100%",
    lastRunAt: "2026-09-04 09:05",
  },
  {
    id: "skill-trace-analysis",
    name: "Trace 错误链分析",
    domain: "可观测",
    version: "v0.9.8",
    status: "ready",
    scope: "控制面跨服务调用",
    successRate: "97.5%",
    lastRunAt: "2026-09-04 08:40",
  },
  {
    id: "skill-registry-cleanup",
    name: "镜像层回收评估",
    domain: "存储",
    version: "v1.0.3",
    status: "disabled",
    scope: "平台镜像仓库",
    successRate: "98.2%",
    lastRunAt: "2026-09-03 02:00",
  },
];

export const maintenanceJobs: MaintenanceJob[] = [
  {
    id: "job-240904-0915",
    name: "存储后端定时巡检",
    type: "巡检",
    status: "success",
    target: "storage/backends",
    triggeredBy: "scheduler",
    startedAt: "2026-09-04 09:15",
    duration: "42 秒",
  },
  {
    id: "job-240904-0905",
    name: "IP 池容量检查",
    type: "巡检",
    status: "success",
    target: "network/ipam",
    triggeredBy: "scheduler",
    startedAt: "2026-09-04 09:05",
    duration: "18 秒",
  },
  {
    id: "job-240904-0852",
    name: "GPU Xid 诊断",
    type: "修复",
    status: "failed",
    target: "gpu-node-03/GPU-1",
    triggeredBy: "platform-admin",
    startedAt: "2026-09-04 08:52",
    duration: "2 分 14 秒",
  },
  {
    id: "job-240904-0840",
    name: "Trace 错误链分析",
    type: "巡检",
    status: "success",
    target: "req-vs-9f21a",
    triggeredBy: "platform-admin",
    startedAt: "2026-09-04 08:40",
    duration: "9 秒",
  },
  {
    id: "job-240904-0810",
    name: "向量存储副本修复",
    type: "修复",
    status: "running",
    target: "vector-store",
    triggeredBy: "incident-bot",
    startedAt: "2026-09-04 08:10",
    duration: "进行中",
  },
  {
    id: "job-240903-0200",
    name: "镜像仓库垃圾回收",
    type: "回收",
    status: "success",
    target: "registry",
    triggeredBy: "scheduler",
    startedAt: "2026-09-03 02:00",
    duration: "3 分 18 秒",
  },
  {
    id: "job-240902-1430",
    name: "对象存储容量扩展",
    type: "扩容",
    status: "success",
    target: "object-store/cn-east-1",
    triggeredBy: "platform-admin",
    startedAt: "2026-09-02 14:30",
    duration: "18 分 06 秒",
  },
];

export const platformIncidents: PlatformIncident[] = [
  {
    id: "INC-2026-0904-01",
    title: "向量存储不可用导致知识库写入失败",
    severity: "P1",
    status: "investigating",
    impact: "3 个租户知识库索引暂停",
    owner: "王晨",
    alertCount: 6,
    startedAt: "2026-09-04 08:02",
    updatedAt: "2026-09-04 09:38",
  },
  {
    id: "INC-2026-0904-02",
    title: "GPU 节点 Xid 79 异常",
    severity: "P2",
    status: "mitigated",
    impact: "A100 可调度容量减少 1 张",
    owner: "李哲",
    alertCount: 3,
    startedAt: "2026-09-04 07:45",
    updatedAt: "2026-09-04 09:12",
  },
  {
    id: "INC-2026-0903-04",
    title: "模型服务部分副本探针失败",
    severity: "P2",
    status: "resolved",
    impact: "推理 P99 短时升高",
    owner: "陈悦",
    alertCount: 4,
    startedAt: "2026-09-03 16:20",
    updatedAt: "2026-09-03 17:06",
  },
  {
    id: "INC-2026-0902-03",
    title: "IPAM 地址池水位超过阈值",
    severity: "P3",
    status: "resolved",
    impact: "无业务中断，容量风险预警",
    owner: "周航",
    alertCount: 2,
    startedAt: "2026-09-02 11:18",
    updatedAt: "2026-09-02 14:42",
  },
];
