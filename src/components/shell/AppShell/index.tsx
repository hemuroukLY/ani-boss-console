import { Avatar, Button } from "@arco-design/web-react";
import {
  IconDown,
  IconMenuFold,
  IconMenuUnfold,
  IconNotification,
} from "@arco-design/web-react/icon";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import clsx from "clsx";
import { useState } from "react";
import { PlatformOverviewProvider } from "@/features/platform-overview/PlatformOverviewProvider";
import { TenantManagementProvider } from "@/features/tenant-management/TenantManagementProvider";

const topNavigation: Array<{ label: string; to?: "/" | "/tenants" }> = [
  { label: "平台运营总览", to: "/" },
  { label: "租户管理", to: "/tenants" },
  { label: "资源池与基础设施" },
  { label: "运维与可观测" },
  { label: "平台计量与结算" },
  { label: "安全审计与合规" },
  { label: "平台设置" },
  { label: "平台集成与通知" },
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
  | "/tenants-billing";

interface NavigationItem {
  label: string;
  to: AppRoute;
}

const overviewNavigation: readonly NavigationItem[] = [
  { label: "运营总览", to: "/" },
  { label: "资源池与容量态势", to: "/overview-capacity" },
  { label: "GPU 资源池态势", to: "/overview-gpu" },
  { label: "AI 服务运营态势", to: "/overview-inference" },
  { label: "知识库运营态势", to: "/overview-kb" },
  { label: "平台告警与待处理", to: "/overview-alerts" },
] as const;

const tenantNavigation: readonly NavigationItem[] = [
  { label: "租户列表", to: "/tenants" },
  { label: "配额策略", to: "/tenants-quotas" },
  { label: "租户管理员", to: "/tenants-admins" },
  { label: "租户计费与用量", to: "/tenants-billing" },
];

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isTenantManagement = tenantNavigation.some(
    (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
  );
  const currentTopNavigation = isTenantManagement ? "租户管理" : "平台运营总览";
  const sideNavigation = isTenantManagement
    ? tenantNavigation
    : overviewNavigation;
  const currentPage =
    [...sideNavigation]
      .sort((a, b) => b.to.length - a.to.length)
      .find(
        (item) => item.to === pathname || pathname.startsWith(`${item.to}/`),
      )?.label ?? sideNavigation[0].label;

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
              <Button type="text" icon={<IconNotification />} />
              <Avatar size={28}>管</Avatar>
              <span>平台管理员</span>
              <IconDown />
            </div>
          </header>
          <div className="workspace">
            <aside className={clsx("sidebar", collapsed && "collapsed")}>
              <div className="side-scroll">
                <section className="menu-group">
                  {sideNavigation.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: true }}
                      className={clsx(
                        "side-item",
                        item.label === currentPage && "active",
                      )}
                      title={item.label}
                    >
                      <span className="side-dot" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </section>
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
