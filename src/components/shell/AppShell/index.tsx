import { Avatar, Button, Menu, Message } from "@arco-design/web-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  IconMenuFold,
  IconMenuUnfold,
  IconNotification,
} from "@arco-design/web-react/icon";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import clsx from "clsx";
import { useState } from "react";
import { logoutPlatform } from "@/api/auth";
import {
  clearAuthSession,
  useAuthState,
} from "@/components/auth/store";
import { PlatformOverviewProvider } from "@/components/overview/PlatformOverviewProvider";
import { TenantManagementProvider } from "@/components/tenant/TenantManagementProvider";

const topNavigation: Array<{
  label: string;
  to?:
    | "/"
    | "/tenants"
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

type AppRoute =
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

interface NavigationLeaf {
  label: string;
  to: AppRoute;
}

interface NavigationGroup {
  key: string;
  label: string;
  children: readonly NavigationLeaf[];
}

type NavigationItem = NavigationLeaf | NavigationGroup;

function isNavigationGroup(item: NavigationItem): item is NavigationGroup {
  return "children" in item;
}

const overviewNavigation: readonly NavigationLeaf[] = [
  { label: "运营总览", to: "/" },
  { label: "资源池与容量态势", to: "/overview-capacity" },
  { label: "GPU 资源池态势", to: "/overview-gpu" },
  { label: "AI 服务运营态势", to: "/overview-inference" },
  { label: "知识库运营态势", to: "/overview-kb" },
  { label: "平台告警与待处理", to: "/overview-alerts" },
] as const;

const tenantNavigation: readonly NavigationLeaf[] = [
  { label: "租户列表", to: "/tenants" },
  { label: "配额策略", to: "/tenants-quotas" },
  { label: "租户管理员", to: "/tenants-admins" },
  { label: "租户计费与用量", to: "/tenants-billing" },
];

const infrastructureNavigation: readonly NavigationItem[] = [
  {
    key: "resource-pool",
    label: "资源池",
    children: [
      { label: "平台资源池总览", to: "/ops-pool" },
      { label: "GPU 资源池管理", to: "/ops-gpu" },
      { label: "节点状态", to: "/ops-nodes" },
    ],
  },
  {
    key: "infrastructure",
    label: "基础设施",
    children: [
      { label: "存储基础设施", to: "/ops-storage" },
      { label: "租户存储配额", to: "/ops-storage-quotas" },
      { label: "网络基础设施", to: "/ops-network" },
    ],
  },
  {
    key: "registry-operations",
    label: "镜像仓库运维",
    children: [
      { label: "镜像配额", to: "/ops-registry-quota" },
      { label: "漏洞扫描", to: "/ops-registry-vulnerabilities" },
      { label: "垃圾回收", to: "/ops-registry-gc" },
    ],
  },
];

const observabilityNavigation: readonly NavigationItem[] = [
  {
    key: "monitoring",
    label: "监控",
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
    children: [
      { label: "告警规则", to: "/health-alert-rules" },
      { label: "运维 Skills", to: "/maint-skills" },
      { label: "任务历史", to: "/maint-jobs" },
      { label: "故障处理", to: "/maint-incidents" },
    ],
  },
];

const meteringNavigation: readonly NavigationLeaf[] = [
  { label: "计量总览", to: "/metering" },
];

const auditNavigation: readonly NavigationLeaf[] = [
  { label: "平台审计日志", to: "/audit" },
  { label: "API Key 审计", to: "/audit-api-keys" },
  { label: "推理调用审计", to: "/audit-inference" },
  { label: "合规导出与取证", to: "/audit-export" },
];

const settingsNavigation: readonly NavigationLeaf[] = [
  { label: "平台运营账号", to: "/settings-platform-admins" },
  { label: "登录与 IdP（预留）", to: "/settings-idp" },
  { label: "会话与安全策略（预留）", to: "/settings-session" },
];

const integrationNavigation: readonly NavigationLeaf[] = [
  { label: "运维 Webhook", to: "/integration-webhook" },
  { label: "企业通知集成", to: "/integration-notify" },
  { label: "运营系统对接", to: "/integration-ops-system" },
];

export function AppShell() {
  const queryClient = useQueryClient();
  const authState = useAuthState();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [openMenuKeys, setOpenMenuKeys] = useState([
    "resource-pool",
    "infrastructure",
    "registry-operations",
    "monitoring",
    "maintenance-jobs",
  ]);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isTenantManagement = tenantNavigation.some(
    (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
  );
  const infrastructurePages = infrastructureNavigation.flatMap((item) =>
    isNavigationGroup(item) ? item.children : [item],
  );
  const isInfrastructure = infrastructurePages.some(
    (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
  );
  const observabilityPages = observabilityNavigation.flatMap((item) =>
    isNavigationGroup(item) ? item.children : [item],
  );
  const isObservability = observabilityPages.some(
    (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
  );
  const isMetering = meteringNavigation.some(
    (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
  );
  const isAudit = auditNavigation.some(
    (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
  );
  const isSettings = settingsNavigation.some(
    (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
  );
  const isIntegration = integrationNavigation.some(
    (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
  );
  const currentTopNavigation = isTenantManagement
    ? "租户管理"
    : isInfrastructure
      ? "资源池与基础设施"
      : isObservability
        ? "运维与可观测"
        : isMetering
          ? "平台计量与结算"
          : isAudit
            ? "安全审计与合规"
            : isSettings
              ? "平台设置"
              : isIntegration
                ? "平台集成与通知"
                : "平台运营总览";
  const sideNavigation = isTenantManagement
    ? tenantNavigation
    : isInfrastructure
      ? infrastructureNavigation
      : isObservability
        ? observabilityNavigation
        : isMetering
          ? meteringNavigation
          : isAudit
            ? auditNavigation
            : isSettings
              ? settingsNavigation
              : isIntegration
                ? integrationNavigation
                : overviewNavigation;
  const sidePages = sideNavigation.flatMap((item) =>
    isNavigationGroup(item) ? item.children : [item],
  );
  const currentPageItem =
    [...sidePages]
      .sort((a, b) => b.to.length - a.to.length)
      .find(
        (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
      ) ?? sidePages[0];
  const currentMenu = sideNavigation.find(
    (item) =>
      isNavigationGroup(item) &&
      item.children.some((child) => child.to === currentPageItem.to),
  );
  const currentPage = currentPageItem.label;

  const logout = async () => {
    setLoggingOut(true);
    try {
      await logoutPlatform();
    } catch {
      Message.warning("服务端退出失败，本地登录状态已清除");
    } finally {
      clearAuthSession();
      queryClient.clear();
      window.location.assign("/login");
    }
  };

  const renderMenuItem = (item: NavigationLeaf) => (
    <Menu.Item
      key={item.to}
      className="side-menu-leaf"
      renderItemInTooltip={() => item.label}
    >
      <Link
        to={item.to}
        activeOptions={{ exact: true }}
        className="side-menu-link"
      >
        {item.label}
      </Link>
    </Menu.Item>
  );

  return (
    <PlatformOverviewProvider>
      <TenantManagementProvider>
        <div className="app-shell">
          <header className="topbar">
            <Link to="/" className="brand">
              <span className="brand-mark">A</span>
              <span>ANI BOSS</span>
            </Link>
            <nav className="top-navigation" aria-label="一级菜单">
              {topNavigation.map((item) =>
                item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={clsx(
                      "top-nav-item flex items-center justify-center no-underline",
                      item.label === currentTopNavigation && "active",
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    className="top-nav-item flex items-center justify-center"
                    type="button"
                  >
                    {item.label}
                  </button>
                ),
              )}
            </nav>
            <div className="top-actions">
              <Button
                type="text"
                aria-label="通知"
                icon={<IconNotification />}
              />
              <Avatar size={28}>
                {(authState.username || "平台管理员").slice(0, 1)}
              </Avatar>
              <span>{authState.username || "平台管理员"}</span>
              <Button
                type="text"
                size="small"
                loading={loggingOut}
                onClick={() => void logout()}
              >
                退出
              </Button>
            </div>
          </header>
          <div className="workspace">
            <aside className={clsx("sidebar", collapsed && "collapsed")}>
              <div className="side-scroll">
                <Menu
                  id="sidebar-navigation-menu"
                  collapse={collapsed}
                  selectedKeys={[currentPageItem.to]}
                  openKeys={
                    isInfrastructure || isObservability ? openMenuKeys : []
                  }
                  onClickSubMenu={(_, keys) => setOpenMenuKeys(keys)}
                  className={clsx(
                    "side-menu border-none",
                    collapsed && "side-menu--collapsed",
                  )}
                >
                  {sideNavigation.map((item) =>
                    isNavigationGroup(item) ? (
                      <Menu.SubMenu
                        key={item.key}
                        title={item.label}
                        selectable={false}
                        className="side-menu-submenu"
                      >
                        {item.children.map((child) => renderMenuItem(child))}
                      </Menu.SubMenu>
                    ) : (
                      renderMenuItem(item)
                    ),
                  )}
                </Menu>
              </div>
              <button
                className="collapse-button"
                type="button"
                onClick={() => setCollapsed((value) => !value)}
              >
                {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
                <span>{collapsed ? "" : "收起侧栏"}</span>
              </button>
            </aside>
            <main className="content">
              <div className="breadcrumb">
                {currentTopNavigation}
                <span>/</span>
                {currentMenu ? (
                  <>
                    <span>{currentMenu.label}</span>
                    <span>/</span>
                  </>
                ) : null}
                <strong>{currentPage}</strong>
              </div>
              <Outlet />
            </main>
          </div>
        </div>
      </TenantManagementProvider>
    </PlatformOverviewProvider>
  );
}
