export type IntegrationStatus = "enabled" | "disabled" | "warning";

export interface WebhookDelivery {
  id: string;
  deliveredAt: string;
  event: string;
  httpStatus: number;
  latencyMs: number;
  retries: number;
  requestId: string;
}

export interface OperationsWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: IntegrationStatus;
  secretPrefix: string;
  lastDelivery: string;
  lastResult: "success" | "failed" | "-";
  createdAt: string;
  deliveries: WebhookDelivery[];
}

export interface NotificationIntegration {
  id: string;
  name: string;
  provider: string;
  target: string;
  eventGroups: string;
  status: IntegrationStatus;
  lastDelivery: string;
  successRate: string;
}

export interface OperationsSystemIntegration {
  id: string;
  name: string;
  category: string;
  direction: string;
  endpoint: string;
  objects: string;
  status: IntegrationStatus;
  lastSync: string;
  owner: string;
}

export const operationsWebhooks: OperationsWebhook[] = [
  {
    id: "hook-001",
    name: "平台告警总线",
    url: "https://events.example.com/ani/alerts",
    events: ["alert.triggered", "alert.resolved", "incident.created"],
    status: "enabled",
    secretPrefix: "whsec_8fa2",
    lastDelivery: "2026-09-04 10:22",
    lastResult: "success",
    createdAt: "2026-07-18 14:20",
    deliveries: [
      {
        id: "delivery-001",
        deliveredAt: "2026-09-04 10:22:18",
        event: "alert.resolved",
        httpStatus: 200,
        latencyMs: 186,
        retries: 0,
        requestId: "evt-43d021",
      },
      {
        id: "delivery-002",
        deliveredAt: "2026-09-04 09:58:42",
        event: "alert.triggered",
        httpStatus: 200,
        latencyMs: 214,
        retries: 0,
        requestId: "evt-5b91af",
      },
      {
        id: "delivery-003",
        deliveredAt: "2026-09-04 09:41:06",
        event: "incident.created",
        httpStatus: 503,
        latencyMs: 1004,
        retries: 3,
        requestId: "evt-028bc4",
      },
    ],
  },
  {
    id: "hook-002",
    name: "租户生命周期通知",
    url: "https://ops.example.com/hooks/tenant-lifecycle",
    events: ["tenant.created", "tenant.suspended", "tenant.disabled"],
    status: "enabled",
    secretPrefix: "whsec_219c",
    lastDelivery: "2026-09-04 09:58",
    lastResult: "failed",
    createdAt: "2026-07-21 09:10",
    deliveries: [
      {
        id: "delivery-004",
        deliveredAt: "2026-09-04 09:58:09",
        event: "tenant.suspended",
        httpStatus: 500,
        latencyMs: 830,
        retries: 3,
        requestId: "evt-917da2",
      },
      {
        id: "delivery-005",
        deliveredAt: "2026-09-03 16:32:44",
        event: "tenant.created",
        httpStatus: 200,
        latencyMs: 248,
        retries: 0,
        requestId: "evt-d71a3e",
      },
    ],
  },
  {
    id: "hook-003",
    name: "安全审计归档",
    url: "https://archive.example.com/ani/audit",
    events: ["audit.export.ready", "api_key.rotated"],
    status: "disabled",
    secretPrefix: "whsec_7e04",
    lastDelivery: "2026-08-30 18:06",
    lastResult: "success",
    createdAt: "2026-08-06 11:46",
    deliveries: [
      {
        id: "delivery-006",
        deliveredAt: "2026-08-30 18:06:20",
        event: "audit.export.ready",
        httpStatus: 204,
        latencyMs: 361,
        retries: 0,
        requestId: "evt-9c20af",
      },
    ],
  },
];

export const notificationIntegrations: NotificationIntegration[] = [
  {
    id: "notify-001",
    name: "运维告警群",
    provider: "企业微信",
    target: "ANI 平台运维",
    eventGroups: "P0/P1 告警、故障",
    status: "enabled",
    lastDelivery: "2026-09-04 10:22",
    successRate: "99.6%",
  },
  {
    id: "notify-002",
    name: "值班通知",
    provider: "钉钉机器人",
    target: "基础设施值班群",
    eventGroups: "基础设施告警",
    status: "warning",
    lastDelivery: "2026-09-04 09:58",
    successRate: "96.2%",
  },
  {
    id: "notify-003",
    name: "运营邮件",
    provider: "邮件",
    target: "platform-ops@example.com",
    eventGroups: "租户生命周期、计量日报",
    status: "enabled",
    lastDelivery: "2026-09-04 08:00",
    successRate: "100%",
  },
  {
    id: "notify-004",
    name: "安全通知",
    provider: "飞书机器人",
    target: "安全与合规",
    eventGroups: "审计、密钥与漏洞",
    status: "disabled",
    lastDelivery: "-",
    successRate: "-",
  },
];

export const operationsSystemIntegrations: OperationsSystemIntegration[] = [
  {
    id: "ops-system-001",
    name: "企业 CMDB",
    category: "资产配置",
    direction: "双向同步",
    endpoint: "https://cmdb.example.com/api/v2",
    objects: "租户、区域、节点、资源池",
    status: "warning",
    lastSync: "2026-09-04 09:30",
    owner: "平台运维",
  },
  {
    id: "ops-system-002",
    name: "ITSM 工单平台",
    category: "事件与工单",
    direction: "平台推送",
    endpoint: "https://itsm.example.com/openapi",
    objects: "告警、故障、运维任务",
    status: "enabled",
    lastSync: "2026-09-04 10:18",
    owner: "运维中心",
  },
  {
    id: "ops-system-003",
    name: "财务结算系统",
    category: "计量结算",
    direction: "平台推送",
    endpoint: "https://finance.example.com/ani",
    objects: "租户、计量汇总、对账单",
    status: "disabled",
    lastSync: "-",
    owner: "财务运营",
  },
  {
    id: "ops-system-004",
    name: "统一数据平台",
    category: "数据分析",
    direction: "单向导出",
    endpoint: "s3://enterprise-data/ani/",
    objects: "运营指标、审计归档",
    status: "enabled",
    lastSync: "2026-09-04 08:10",
    owner: "数据平台",
  },
];
