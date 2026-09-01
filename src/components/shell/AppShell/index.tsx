import { Avatar, Button, Menu } from "@arco-design/web-react";
import {
  IconDown,
  IconMenuFold,
  IconMenuUnfold,
  IconNotification,
} from "@arco-design/web-react/icon";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import clsx from "clsx";
import { useState } from "react";
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
    | "/ops-storage";
}> = [
  { label: "平台运营总览", to: "/" },
  { label: "租户管理", to: "/tenants" },
  { label: "资源池与基础设施", to: "/ops-pool" },
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
  | "/tenants-billing"
  | "/ops-pool"
  | "/ops-gpu"
  | "/ops-nodes"
  | "/ops-storage";

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
    children: [{ label: "存储基础设施", to: "/ops-storage" }],
  },
];

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenuKeys, setOpenMenuKeys] = useState([
    "resource-pool",
    "infrastructure",
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
  const currentTopNavigation = isTenantManagement
    ? "租户管理"
    : isInfrastructure
      ? "资源池与基础设施"
      : "平台运营总览";
  const sideNavigation = isTenantManagement
    ? tenantNavigation
    : isInfrastructure
      ? infrastructureNavigation
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
              <Button type="text" icon={<IconNotification />} />
              <Avatar size={28}>管</Avatar>
              <span>平台管理员</span>
              <IconDown />
            </div>
          </header>
          <div className="workspace">
            <aside className={clsx("sidebar", collapsed && "collapsed")}>
              <div className="side-scroll">
                <Menu
                  id="sidebar-navigation-menu"
                  collapse={collapsed}
                  selectedKeys={[currentPageItem.to]}
                  openKeys={isInfrastructure ? openMenuKeys : []}
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
