export type AuditResult = "success" | "failed";

export interface PlatformAuditLog {
  id: string;
  occurredAt: string;
  actor: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resource: string;
  tenant: string;
  result: AuditResult;
  sourceIp: string;
  requestId: string;
  detail: string;
}

export interface ApiKeyAuditLog {
  id: string;
  occurredAt: string;
  tenant: string;
  keyName: string;
  keyPrefix: string;
  actor: string;
  action: "创建" | "调用" | "轮换" | "禁用";
  scopes: string;
  result: AuditResult;
  sourceIp: string;
}

export interface InferenceAuditLog {
  id: string;
  occurredAt: string;
  tenant: string;
  service: string;
  model: string;
  endpoint: string;
  keyPrefix: string;
  httpStatus: number;
  latencyMs: number;
  tokens: number;
  sourceIp: string;
  requestId: string;
}

export interface EvidenceExportRecord {
  id: string;
  name: string;
  range: string;
  contents: string;
  format: string;
  requestedBy: string;
  createdAt: string;
  status: "ready" | "processing" | "expired";
  expiresAt: string;
}

export const platformAuditLogs: PlatformAuditLog[] = [
  {
    id: "aud-240901",
    occurredAt: "2026-09-04 10:26:18",
    actor: "李明",
    actorRole: "平台超级管理员",
    action: "调整租户配额",
    resourceType: "租户配额",
    resource: "star-ring / GPU A100",
    tenant: "星环科技",
    result: "success",
    sourceIp: "10.24.8.16",
    requestId: "req-a91f8c24",
    detail: "GPU A100 配额由 6 调整为 8",
  },
  {
    id: "aud-240902",
    occurredAt: "2026-09-04 10:11:42",
    actor: "周楠",
    actorRole: "平台运维",
    action: "执行垃圾回收",
    resourceType: "镜像仓库",
    resource: "registry-east / gc-20260904",
    tenant: "-",
    result: "success",
    sourceIp: "10.24.8.31",
    requestId: "req-723fc540",
    detail: "回收 18 个无引用镜像层，共 42.6 GiB",
  },
  {
    id: "aud-240903",
    occurredAt: "2026-09-04 09:58:06",
    actor: "system",
    actorRole: "平台服务",
    action: "冻结租户",
    resourceType: "租户",
    resource: "vision-edu",
    tenant: "远景教育",
    result: "failed",
    sourceIp: "10.16.4.12",
    requestId: "req-b651d483",
    detail: "欠费冻结策略执行失败：存在进行中的迁移任务",
  },
  {
    id: "aud-240904",
    occurredAt: "2026-09-04 09:35:27",
    actor: "王珂",
    actorRole: "平台只读",
    action: "查看故障详情",
    resourceType: "故障",
    resource: "INC-20260904-03",
    tenant: "-",
    result: "success",
    sourceIp: "10.24.9.44",
    requestId: "req-13d5a816",
    detail: "查看推理网关高延迟故障时间线",
  },
  {
    id: "aud-240905",
    occurredAt: "2026-09-04 09:12:53",
    actor: "陈宇",
    actorRole: "平台运维",
    action: "停用告警规则",
    resourceType: "告警规则",
    resource: "GPU 温度过高",
    tenant: "-",
    result: "success",
    sourceIp: "10.24.8.22",
    requestId: "req-c92e4410",
    detail: "维护窗口内临时停用规则",
  },
];

export const apiKeyAuditLogs: ApiKeyAuditLog[] = [
  {
    id: "key-aud-01",
    occurredAt: "2026-09-04 10:24:31",
    tenant: "星环科技",
    keyName: "prod-inference",
    keyPrefix: "ani_sk_7d3f",
    actor: "svc-inference",
    action: "调用",
    scopes: "inference:invoke",
    result: "success",
    sourceIp: "172.20.18.44",
  },
  {
    id: "key-aud-02",
    occurredAt: "2026-09-04 10:18:09",
    tenant: "云智研究院",
    keyName: "research-agent",
    keyPrefix: "ani_sk_2ab9",
    actor: "future.admin",
    action: "轮换",
    scopes: "inference:invoke, kb:query",
    result: "success",
    sourceIp: "10.31.4.27",
  },
  {
    id: "key-aud-03",
    occurredAt: "2026-09-04 10:02:47",
    tenant: "数澜信息",
    keyName: "legacy-client",
    keyPrefix: "ani_sk_9c11",
    actor: "legacy-job",
    action: "调用",
    scopes: "inference:invoke",
    result: "failed",
    sourceIp: "203.0.113.18",
  },
  {
    id: "key-aud-04",
    occurredAt: "2026-09-04 09:46:12",
    tenant: "启明制造",
    keyName: "mes-assistant",
    keyPrefix: "ani_sk_61ea",
    actor: "qiming.owner",
    action: "创建",
    scopes: "inference:invoke",
    result: "success",
    sourceIp: "10.52.7.10",
  },
  {
    id: "key-aud-05",
    occurredAt: "2026-09-04 09:21:36",
    tenant: "远景教育",
    keyName: "course-bot",
    keyPrefix: "ani_sk_08bd",
    actor: "vision.owner",
    action: "禁用",
    scopes: "kb:query",
    result: "success",
    sourceIp: "10.42.5.33",
  },
];

export const inferenceAuditLogs: InferenceAuditLog[] = [
  {
    id: "inf-aud-01",
    occurredAt: "2026-09-04 10:28:15",
    tenant: "星环科技",
    service: "qwen-prod",
    model: "Qwen2.5-72B-Instruct",
    endpoint: "/v1/chat/completions",
    keyPrefix: "ani_sk_7d3f",
    httpStatus: 200,
    latencyMs: 684,
    tokens: 1842,
    sourceIp: "172.20.18.44",
    requestId: "chatcmpl-91e4d8",
  },
  {
    id: "inf-aud-02",
    occurredAt: "2026-09-04 10:27:42",
    tenant: "云智研究院",
    service: "embedding-v3",
    model: "bge-m3",
    endpoint: "/v1/embeddings",
    keyPrefix: "ani_sk_2ab9",
    httpStatus: 200,
    latencyMs: 92,
    tokens: 486,
    sourceIp: "10.31.4.27",
    requestId: "emb-7b2ac1",
  },
  {
    id: "inf-aud-03",
    occurredAt: "2026-09-04 10:26:58",
    tenant: "数澜信息",
    service: "deepseek-r1",
    model: "DeepSeek-R1-Distill-32B",
    endpoint: "/v1/chat/completions",
    keyPrefix: "ani_sk_9c11",
    httpStatus: 401,
    latencyMs: 18,
    tokens: 0,
    sourceIp: "203.0.113.18",
    requestId: "chatcmpl-f83d20",
  },
  {
    id: "inf-aud-04",
    occurredAt: "2026-09-04 10:25:21",
    tenant: "启明制造",
    service: "factory-assistant",
    model: "Qwen2.5-14B-Instruct",
    endpoint: "/v1/chat/completions",
    keyPrefix: "ani_sk_61ea",
    httpStatus: 429,
    latencyMs: 34,
    tokens: 0,
    sourceIp: "10.52.7.10",
    requestId: "chatcmpl-25ca80",
  },
  {
    id: "inf-aud-05",
    occurredAt: "2026-09-04 10:23:07",
    tenant: "远景教育",
    service: "course-qa",
    model: "Qwen2.5-7B-Instruct",
    endpoint: "/v1/chat/completions",
    keyPrefix: "ani_sk_08bd",
    httpStatus: 200,
    latencyMs: 426,
    tokens: 963,
    sourceIp: "10.42.5.33",
    requestId: "chatcmpl-40a91b",
  },
];

export const evidenceExportRecords: EvidenceExportRecord[] = [
  {
    id: "exp-20260904-01",
    name: "九月平台变更审计",
    range: "2026-09-01 至 2026-09-04",
    contents: "平台操作、API Key",
    format: "JSON + 校验清单",
    requestedBy: "李明",
    createdAt: "2026-09-04 09:40",
    status: "ready",
    expiresAt: "2026-09-11 09:40",
  },
  {
    id: "exp-20260903-02",
    name: "推理调用抽样取证",
    range: "2026-09-03",
    contents: "推理调用",
    format: "CSV",
    requestedBy: "王珂",
    createdAt: "2026-09-03 17:26",
    status: "processing",
    expiresAt: "-",
  },
  {
    id: "exp-20260820-01",
    name: "八月安全审计归档",
    range: "2026-08-01 至 2026-08-20",
    contents: "全部审计域",
    format: "JSON + 校验清单",
    requestedBy: "李明",
    createdAt: "2026-08-20 16:05",
    status: "expired",
    expiresAt: "2026-08-27 16:05",
  },
];
