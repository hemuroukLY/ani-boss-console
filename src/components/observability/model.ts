export type HealthStatus = "ok" | "degraded" | "error";

export interface DependencyCheck {
  name: string;
  status: "ok" | "fail";
  latencyMs?: number;
  error?: string;
}

export interface PlatformComponentHealth {
  id: string;
  group: "控制面" | "数据面";
  name: string;
  service: string;
  status: HealthStatus;
  version: string;
  replicas: string;
  p99Ms?: number;
  errorRate: number;
  requestRate: string;
  dependencies: DependencyCheck[];
}

export interface MonitoringPanel {
  title: string;
  unit: string;
  values: number[];
  color?: string;
}

export interface MonitoringProfile {
  title: string;
  subtitle: string;
  metrics: Array<{ label: string; value: string; hint: string; tone?: string }>;
  panels: MonitoringPanel[];
  notices: Array<{ title: string; detail: string; tone: "warning" | "danger" }>;
}

export interface PlatformLog {
  id: string;
  time: string;
  level: "error" | "warn" | "info";
  service: string;
  requestId: string;
  message: string;
}

export interface TraceSpan {
  service: string;
  operation: string;
  startMs: number;
  durationMs: number;
  status: "ok" | "error";
}

export interface TraceSample {
  id: string;
  requestId: string;
  entryService: string;
  operation: string;
  totalMs: number;
  status: "ok" | "error";
  startedAt: string;
  spans: TraceSpan[];
}

export interface AlertRule {
  id: string;
  name: string;
  target: string;
  expression: string;
  severity: "严重" | "警告" | "提示";
  duration: string;
  enabled: boolean;
  channel: string;
  updatedAt: string;
}

export const platformComponents: PlatformComponentHealth[] = [
  {
    id: "component-gateway",
    group: "控制面",
    name: "API 网关",
    service: "gateway",
    status: "ok",
    version: "v0.8.2",
    replicas: "3/3",
    p99Ms: 45,
    errorRate: 0.08,
    requestRate: "1.2k QPS",
    dependencies: [
      { name: "auth", status: "ok", latencyMs: 12 },
      { name: "task-service", status: "ok", latencyMs: 18 },
    ],
  },
  {
    id: "component-model",
    group: "控制面",
    name: "模型服务",
    service: "model-service",
    status: "degraded",
    version: "v0.8.0",
    replicas: "2/3",
    p99Ms: 180,
    errorRate: 1.2,
    requestRate: "42 QPS",
    dependencies: [
      { name: "object-store", status: "ok", latencyMs: 22 },
      { name: "vector-store", status: "fail", error: "connection timeout" },
    ],
  },
  {
    id: "component-kb",
    group: "控制面",
    name: "知识库服务",
    service: "kb-service",
    status: "ok",
    version: "v0.8.0",
    replicas: "2/2",
    p99Ms: 96,
    errorRate: 0.2,
    requestRate: "86 QPS",
    dependencies: [
      { name: "vector-store", status: "ok", latencyMs: 18 },
      { name: "inference", status: "ok", latencyMs: 120 },
    ],
  },
  {
    id: "component-metering",
    group: "控制面",
    name: "计量服务",
    service: "metering",
    status: "ok",
    version: "v0.8.0",
    replicas: "2/2",
    p99Ms: 54,
    errorRate: 0,
    requestRate: "310 QPS",
    dependencies: [
      { name: "postgres", status: "ok", latencyMs: 11 },
      { name: "mq", status: "ok", latencyMs: 4 },
    ],
  },
  {
    id: "component-task",
    group: "控制面",
    name: "任务服务",
    service: "task-service",
    status: "ok",
    version: "v0.8.0",
    replicas: "2/2",
    p99Ms: 67,
    errorRate: 0.1,
    requestRate: "95 QPS",
    dependencies: [{ name: "mq", status: "ok", latencyMs: 5 }],
  },
  {
    id: "component-postgres",
    group: "数据面",
    name: "数据库",
    service: "postgres",
    status: "ok",
    version: "16.2",
    replicas: "1/1",
    p99Ms: 8,
    errorRate: 0,
    requestRate: "2.1k QPS",
    dependencies: [{ name: "disk", status: "ok", latencyMs: 2 }],
  },
  {
    id: "component-object",
    group: "数据面",
    name: "对象存储",
    service: "object-store",
    status: "ok",
    version: "RELEASE.2026",
    replicas: "4/4",
    p99Ms: 32,
    errorRate: 0,
    requestRate: "780 QPS",
    dependencies: [{ name: "disk", status: "ok", latencyMs: 5 }],
  },
  {
    id: "component-vector",
    group: "数据面",
    name: "向量存储",
    service: "vector-store",
    status: "error",
    version: "2.4.1",
    replicas: "0/2",
    errorRate: 100,
    requestRate: "0 QPS",
    dependencies: [
      { name: "etcd", status: "fail", error: "leader election timeout" },
    ],
  },
  {
    id: "component-mq",
    group: "数据面",
    name: "消息队列",
    service: "mq",
    status: "ok",
    version: "2.10",
    replicas: "3/3",
    p99Ms: 6,
    errorRate: 0,
    requestRate: "1.6k msg/s",
    dependencies: [{ name: "jetstream", status: "ok", latencyMs: 1 }],
  },
  {
    id: "component-observability",
    group: "数据面",
    name: "监控组件",
    service: "observability",
    status: "ok",
    version: "v0.8.0",
    replicas: "2/2",
    p99Ms: 40,
    errorRate: 0,
    requestRate: "11 targets",
    dependencies: [{ name: "prometheus", status: "ok", latencyMs: 15 }],
  },
];

export const monitoringProfiles: Record<
  "gpu" | "inference" | "kb",
  MonitoringProfile
> = {
  gpu: {
    title: "GPU 监控",
    subtitle: "查看 GPU 设备利用率、显存、温度和调度队列运行态。",
    metrics: [
      { label: "平均利用率", value: "72%", hint: "运行中设备" },
      { label: "维护中", value: "1", hint: "待资源池处理", tone: "warning" },
      { label: "不可用", value: "1", hint: "阻断同型号调度", tone: "danger" },
      { label: "运行占用", value: "5", hint: "逻辑卡" },
    ],
    panels: [
      { title: "GPU 利用率", unit: "%", values: [58, 62, 67, 71, 76, 74, 72] },
      {
        title: "显存使用率",
        unit: "%",
        values: [48, 55, 57, 63, 68, 66, 70],
        color: "#722ed1",
      },
      {
        title: "设备温度",
        unit: "°C",
        values: [54, 57, 61, 66, 70, 68, 65],
        color: "#f77234",
      },
      {
        title: "调度队列深度",
        unit: "个",
        values: [3, 5, 8, 7, 11, 9, 6],
        color: "#00b42a",
      },
    ],
    notices: [
      {
        title: "gpu-node-03/GPU-1",
        detail: "设备不可用 · Xid 79",
        tone: "danger",
      },
      {
        title: "gpu-node-02/GPU-0",
        detail: "维护中 · 等待固件升级",
        tone: "warning",
      },
    ],
  },
  inference: {
    title: "推理监控",
    subtitle: "查看平台推理请求、延迟、Token 吞吐和错误趋势。",
    metrics: [
      { label: "可用性", value: "99.92%", hint: "近 1 小时" },
      {
        label: "P99 延迟",
        value: "780 ms",
        hint: "较昨日 +6.4%",
        tone: "warning",
      },
      { label: "错误率", value: "0.8%", hint: "近 5 分钟" },
      { label: "请求量", value: "126 QPS", hint: "峰值 184 QPS" },
    ],
    panels: [
      {
        title: "推理请求量",
        unit: "QPS",
        values: [82, 96, 104, 118, 136, 142, 126],
      },
      {
        title: "P99 延迟",
        unit: "ms",
        values: [620, 680, 710, 760, 840, 790, 780],
        color: "#f77234",
      },
      {
        title: "Token 吞吐",
        unit: "k/s",
        values: [38, 42, 46, 51, 55, 58, 56],
        color: "#722ed1",
      },
      {
        title: "错误率",
        unit: "%",
        values: [0.2, 0.3, 0.5, 0.9, 1.1, 0.7, 0.8],
        color: "#f53f3f",
      },
    ],
    notices: [
      {
        title: "infer-chat-prod",
        detail: "P99 延迟接近告警阈值",
        tone: "warning",
      },
    ],
  },
  kb: {
    title: "知识库监控",
    subtitle: "查看检索请求、索引积压、查询延迟和失败趋势。",
    metrics: [
      { label: "查询成功率", value: "98.6%", hint: "近 1 小时" },
      { label: "P99 延迟", value: "320 ms", hint: "检索链路" },
      { label: "索引积压", value: "14", hint: "待处理文档", tone: "warning" },
      { label: "今日查询", value: "3.8k", hint: "跨租户合计" },
    ],
    panels: [
      {
        title: "查询请求量",
        unit: "QPS",
        values: [42, 48, 51, 57, 64, 61, 59],
      },
      {
        title: "检索 P99",
        unit: "ms",
        values: [240, 260, 275, 330, 360, 340, 320],
        color: "#f77234",
      },
      {
        title: "索引积压",
        unit: "篇",
        values: [8, 12, 18, 22, 19, 16, 14],
        color: "#722ed1",
      },
      {
        title: "失败率",
        unit: "%",
        values: [0.4, 0.6, 0.7, 1.5, 1.9, 1.6, 1.4],
        color: "#f53f3f",
      },
    ],
    notices: [
      { title: "产品知识库", detail: "向量索引积压 9 篇文档", tone: "warning" },
    ],
  },
};

export const platformLogs: PlatformLog[] = [
  {
    id: "log-1",
    time: "15:28:41.102",
    level: "error",
    service: "vector-store",
    requestId: "req-vs-9f21a",
    message: "etcd leader election timeout; refusing writes",
  },
  {
    id: "log-2",
    time: "15:28:41.088",
    level: "error",
    service: "vector-store",
    requestId: "req-vs-9f21a",
    message: "dependency check failed: etcd status=fail",
  },
  {
    id: "log-3",
    time: "15:28:40.910",
    level: "warn",
    service: "model-service",
    requestId: "req-mdl-77c2",
    message: "vector-store dial timeout; falling back to degraded mode",
  },
  {
    id: "log-4",
    time: "15:28:40.855",
    level: "error",
    service: "model-service",
    requestId: "req-mdl-77c2",
    message: "embedding batch aborted: upstream unavailable",
  },
  {
    id: "log-5",
    time: "15:28:39.412",
    level: "info",
    service: "gateway",
    requestId: "req-gw-12ab",
    message: "POST /api/v1/svc/inference completed 200 in 45ms",
  },
  {
    id: "log-6",
    time: "15:28:39.201",
    level: "info",
    service: "auth",
    requestId: "req-gw-12ab",
    message: "token validated scope=observability:read",
  },
  {
    id: "log-7",
    time: "15:28:38.044",
    level: "info",
    service: "kb-service",
    requestId: "req-kb-33de",
    message: "rag retrieve hits=4 latency_ms=96",
  },
  {
    id: "log-8",
    time: "15:28:37.880",
    level: "warn",
    service: "kb-service",
    requestId: "req-kb-33de",
    message: "vector-store latency elevated p99=180ms",
  },
  {
    id: "log-9",
    time: "15:28:36.500",
    level: "info",
    service: "gateway",
    requestId: "req-gw-09ff",
    message: "GET /api/v1/healthz 200",
  },
  {
    id: "log-10",
    time: "15:28:35.120",
    level: "error",
    service: "vector-store",
    requestId: "req-vs-aa01",
    message: "ready replicas 0/2; probe failed",
  },
];

export const traceSamples: TraceSample[] = [
  {
    id: "trc-vs-9f21a",
    requestId: "req-vs-9f21a",
    entryService: "gateway",
    operation: "POST /api/v1/svc/models:embed",
    totalMs: 3200,
    status: "error",
    startedAt: "2026-09-04 15:28:41",
    spans: [
      {
        service: "gateway",
        operation: "POST /api/v1/svc/models:embed",
        startMs: 0,
        durationMs: 3200,
        status: "error",
      },
      {
        service: "model-service",
        operation: "EmbedBatch",
        startMs: 40,
        durationMs: 3120,
        status: "error",
      },
      {
        service: "vector-store",
        operation: "UpsertVectors",
        startMs: 120,
        durationMs: 3000,
        status: "error",
      },
      {
        service: "vector-store",
        operation: "EtcdLeaseKeepAlive",
        startMs: 140,
        durationMs: 2980,
        status: "error",
      },
    ],
  },
  {
    id: "trc-mdl-77c2",
    requestId: "req-mdl-77c2",
    entryService: "gateway",
    operation: "POST /api/v1/svc/inference",
    totalMs: 1860,
    status: "error",
    startedAt: "2026-09-04 15:28:40",
    spans: [
      {
        service: "gateway",
        operation: "POST /api/v1/svc/inference",
        startMs: 0,
        durationMs: 1860,
        status: "error",
      },
      {
        service: "auth",
        operation: "Authorize",
        startMs: 8,
        durationMs: 20,
        status: "ok",
      },
      {
        service: "model-service",
        operation: "Infer",
        startMs: 40,
        durationMs: 1800,
        status: "error",
      },
      {
        service: "vector-store",
        operation: "Search",
        startMs: 80,
        durationMs: 1600,
        status: "error",
      },
      {
        service: "object-store",
        operation: "GetObject",
        startMs: 90,
        durationMs: 40,
        status: "ok",
      },
    ],
  },
  {
    id: "trc-gw-12ab",
    requestId: "req-gw-12ab",
    entryService: "gateway",
    operation: "POST /api/v1/svc/inference",
    totalMs: 120,
    status: "ok",
    startedAt: "2026-09-04 15:28:39",
    spans: [
      {
        service: "gateway",
        operation: "POST /api/v1/svc/inference",
        startMs: 0,
        durationMs: 120,
        status: "ok",
      },
      {
        service: "auth",
        operation: "Authorize",
        startMs: 5,
        durationMs: 18,
        status: "ok",
      },
      {
        service: "model-service",
        operation: "Infer",
        startMs: 30,
        durationMs: 80,
        status: "ok",
      },
      {
        service: "kb-service",
        operation: "Retrieve",
        startMs: 35,
        durationMs: 40,
        status: "ok",
      },
    ],
  },
];

export const alertRules: AlertRule[] = [
  {
    id: "rule-vector-ready",
    name: "向量存储无就绪副本",
    target: "vector-store",
    expression: "ready_replicas < 1",
    severity: "严重",
    duration: "1 分钟",
    enabled: true,
    channel: "平台值班群",
    updatedAt: "2026-09-02 10:20",
  },
  {
    id: "rule-model-p99",
    name: "模型服务 P99 过高",
    target: "model-service",
    expression: "p99_latency_ms > 800",
    severity: "警告",
    duration: "5 分钟",
    enabled: true,
    channel: "AI 平台运维",
    updatedAt: "2026-09-01 16:45",
  },
  {
    id: "rule-gpu-xid",
    name: "GPU Xid 异常",
    target: "gpu-exporter",
    expression: "gpu_xid_errors_total > 0",
    severity: "严重",
    duration: "立即",
    enabled: true,
    channel: "基础设施值班",
    updatedAt: "2026-08-30 09:12",
  },
  {
    id: "rule-kb-backlog",
    name: "知识库索引积压",
    target: "kb-service",
    expression: "index_backlog > 20",
    severity: "警告",
    duration: "10 分钟",
    enabled: true,
    channel: "AI 平台运维",
    updatedAt: "2026-08-28 14:08",
  },
  {
    id: "rule-api-error",
    name: "网关错误率升高",
    target: "gateway",
    expression: "error_rate > 2%",
    severity: "警告",
    duration: "5 分钟",
    enabled: false,
    channel: "平台值班群",
    updatedAt: "2026-08-26 11:30",
  },
  {
    id: "rule-quota",
    name: "镜像配额水位过高",
    target: "registry",
    expression: "quota_usage_percent > 90",
    severity: "提示",
    duration: "15 分钟",
    enabled: true,
    channel: "运营通知",
    updatedAt: "2026-08-24 18:10",
  },
];
