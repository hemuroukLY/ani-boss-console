import type { ReactNode } from "react";
import {
  IconApps,
  IconArchive,
  IconBook,
  IconCalendarClock,
  IconCloud,
  IconDashboard,
  IconEmail,
  IconExport,
  IconLink,
  IconLock,
  IconNotification,
  IconRobot,
  IconSafe,
  IconSettings,
  IconStorage,
  IconThunderbolt,
  IconTool,
  IconUser,
  IconUserGroup,
} from "@arco-design/web-react/icon";

export type AppRoute =
  | "/"
  | "/overview-capacity"
  | "/overview-gpu"
  | "/overview-inference"
  | "/overview-kb"
  | "/overview-alerts"
  | "/tenants"
  | "/tenants-quotas"
  | "/tenants-admins"
  | "/tenants-billing"
  | "/ops-pool"
  | "/ops-gpu"
  | "/ops-nodes"
  | "/ops-storage"
  | "/ops-storage-quotas"
  | "/ops-network"
  | "/ops-registry-quota"
  | "/ops-registry-vulnerabilities"
  | "/ops-registry-gc"
  | "/health"
  | "/health-gpu"
  | "/health-inference"
  | "/health-kb"
  | "/health-metrics"
  | "/health-logs"
  | "/health-traces"
  | "/health-alert-rules"
  | "/maint-skills"
  | "/maint-jobs"
  | "/maint-incidents"
  | "/metering"
  | "/audit"
  | "/audit-api-keys"
  | "/audit-inference"
  | "/audit-export"
  | "/settings-platform-admins"
  | "/settings-idp"
  | "/settings-session"
  | "/integration-webhook"
  | "/integration-notify"
  | "/integration-ops-system";

export interface NavigationLeaf {
  label: string;
  to: AppRoute;
  icon?: ReactNode;
}

export interface NavigationGroup {
  key: string;
  label: string;
  icon: ReactNode;
  children: readonly NavigationLeaf[];
}

export type NavigationItem = NavigationLeaf | NavigationGroup;

export function isNavigationGroup(item: NavigationItem): item is NavigationGroup {
  return "children" in item;
}

export const topNavigation: ReadonlyArray<{
  label: string;
  to: AppRoute;
}> = [
  { label: "平台运营总览", to: "/" },
  { label: "租户管理", to: "/tenants" },
  { label: "资源池与基础设施", to: "/ops-pool" },
  { label: "运维与可观测", to: "/health" },
  { label: "平台计量与结算", to: "/metering" },
  { label: "安全审计与合规", to: "/audit" },
  { label: "平台设置", to: "/settings-platform-admins" },
  { label: "平台集成与通知", to: "/integration-webhook" },
];

export const overviewNavigation: readonly NavigationLeaf[] = [
  { label: "运营总览", to: "/", icon: <IconDashboard /> },
  {
    label: "资源池与容量态势",
    to: "/overview-capacity",
    icon: <IconCloud />,
  },
  {
    label: "GPU 资源池态势",
    to: "/overview-gpu",
    icon: <IconThunderbolt />,
  },
  {
    label: "AI 服务运营态势",
    to: "/overview-inference",
    icon: <IconRobot />,
  },
  {
    label: "知识库运营态势",
    to: "/overview-kb",
    icon: <IconBook />,
  },
  {
    label: "平台告警与待处理",
    to: "/overview-alerts",
    icon: <IconNotification />,
  },
];

export const tenantNavigation: readonly NavigationLeaf[] = [
  { label: "租户列表", to: "/tenants", icon: <IconUserGroup /> },
  { label: "配额策略", to: "/tenants-quotas", icon: <IconSettings /> },
  { label: "租户管理员", to: "/tenants-admins", icon: <IconUser /> },
  {
    label: "租户计费与用量",
    to: "/tenants-billing",
    icon: <IconCalendarClock />,
  },
];

export const infrastructureNavigation: readonly NavigationItem[] = [
  {
    key: "resource-pool",
    label: "资源池",
    icon: <IconCloud />,
    children: [
      { label: "平台资源池总览", to: "/ops-pool" },
      { label: "GPU 资源池管理", to: "/ops-gpu" },
      { label: "节点状态", to: "/ops-nodes" },
    ],
  },
  {
    key: "infrastructure",
    label: "基础设施",
    icon: <IconStorage />,
    children: [
      { label: "存储基础设施", to: "/ops-storage" },
      { label: "租户存储配额", to: "/ops-storage-quotas" },
      { label: "网络基础设施", to: "/ops-network" },
    ],
  },
  {
    key: "registry-operations",
    label: "镜像仓库运维",
    icon: <IconArchive />,
    children: [
      { label: "镜像配额", to: "/ops-registry-quota" },
      { label: "漏洞扫描", to: "/ops-registry-vulnerabilities" },
      { label: "垃圾回收", to: "/ops-registry-gc" },
    ],
  },
];

export const observabilityNavigation: readonly NavigationItem[] = [
  {
    key: "monitoring",
    label: "监控",
    icon: <IconDashboard />,
    children: [
      { label: "平台健康", to: "/health" },
      { label: "GPU 监控", to: "/health-gpu" },
      { label: "推理监控", to: "/health-inference" },
      { label: "知识库监控", to: "/health-kb" },
      { label: "组件指标", to: "/health-metrics" },
      { label: "日志", to: "/health-logs" },
      { label: "Trace", to: "/health-traces" },
    ],
  },
  {
    key: "maintenance-jobs",
    label: "运维作业",
    icon: <IconTool />,
    children: [
      { label: "告警规则", to: "/health-alert-rules" },
      { label: "运维 Skills", to: "/maint-skills" },
      { label: "任务历史", to: "/maint-jobs" },
      { label: "故障处理", to: "/maint-incidents" },
    ],
  },
];

export const meteringNavigation: readonly NavigationLeaf[] = [
  { label: "计量总览", to: "/metering", icon: <IconCalendarClock /> },
];

export const auditNavigation: readonly NavigationLeaf[] = [
  { label: "平台审计日志", to: "/audit", icon: <IconSafe /> },
  { label: "API Key 审计", to: "/audit-api-keys", icon: <IconLock /> },
  { label: "推理调用审计", to: "/audit-inference", icon: <IconRobot /> },
  { label: "合规导出与取证", to: "/audit-export", icon: <IconExport /> },
];

export const settingsNavigation: readonly NavigationLeaf[] = [
  {
    label: "平台运营账号",
    to: "/settings-platform-admins",
    icon: <IconUserGroup />,
  },
  { label: "登录与 IdP（预留）", to: "/settings-idp", icon: <IconLock /> },
  {
    label: "会话与安全策略（预留）",
    to: "/settings-session",
    icon: <IconSafe />,
  },
];

export const integrationNavigation: readonly NavigationLeaf[] = [
  { label: "运维 Webhook", to: "/integration-webhook", icon: <IconLink /> },
  { label: "企业通知集成", to: "/integration-notify", icon: <IconEmail /> },
  { label: "运营系统对接", to: "/integration-ops-system", icon: <IconApps /> },
];
