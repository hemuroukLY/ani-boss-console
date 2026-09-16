import { Avatar, Button, Menu, Typography } from "@arco-design/web-react";
import { useQueryClient } from "@tanstack/react-query";
import { IconMenuFold, IconMenuUnfold, IconNotification } from "@arco-design/web-react/icon";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import clsx from "clsx";
import { useState, type ReactNode } from "react";
import { logoutPlatform } from "@/api/auth";
import { clearAuthSession, useAuthState } from "@/components/auth/store";
import { showMessage } from "@/lib/feedback";
import { PlatformOverviewProvider } from "@/components/overview/PlatformOverviewProvider";
import { TenantManagementProvider } from "@/components/tenant/TenantManagementProvider";
import {
  auditNavigation,
  infrastructureNavigation,
  integrationNavigation,
  isNavigationGroup,
  meteringNavigation,
  observabilityNavigation,
  overviewNavigation,
  settingsNavigation,
  tenantNavigation,
  topNavigation,
  type NavigationLeaf,
} from "./navigation";

export function AppLayout() {
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
      .find((item) => item.to === pathname || pathname.startsWith(`${item.to}/`)) ?? sidePages[0];
  const currentMenu = sideNavigation.find(
    (item) =>
      isNavigationGroup(item) && item.children.some((child) => child.to === currentPageItem.to),
  );
  const currentPage = currentPageItem.label;
  const showShellBreadcrumb = pathname === currentPageItem.to;

  const logout = async () => {
    setLoggingOut(true);
    try {
      await logoutPlatform();
    } catch {
      showMessage({ type: "warning", content: "服务端退出失败，本地登录状态已清除" });
    } finally {
      clearAuthSession();
      queryClient.clear();
      window.location.assign("/login");
    }
  };

  const renderMenuLabel = (label: string, icon: ReactNode) => (
    <span className="side-menu-label">
      <span className="side-menu-label-icon" aria-hidden="true">
        {icon}
      </span>
      <Typography.Ellipsis rows={1} expandable={false} showTooltip className="side-menu-label-text">
        {label}
      </Typography.Ellipsis>
    </span>
  );

  const renderMenuItem = (item: NavigationLeaf, depth = 0) => (
    <Menu.Item key={item.to} className="side-menu-leaf" renderItemInTooltip={() => item.label}>
      <Link to={item.to} activeOptions={{ exact: true }} className="side-menu-link">
        {depth === 0 && item.icon ? (
          renderMenuLabel(item.label, item.icon)
        ) : (
          <Typography.Ellipsis
            rows={1}
            expandable={false}
            showTooltip
            className="side-menu-label-text"
          >
            {item.label}
          </Typography.Ellipsis>
        )}
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
              <Button type="text" aria-label="通知" icon={<IconNotification />} />
              <Avatar size={28}>{(authState.username || "平台管理员").slice(0, 1)}</Avatar>
              <span>{authState.username || "平台管理员"}</span>
              <Button type="text" size="small" loading={loggingOut} onClick={() => void logout()}>
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
                  openKeys={isInfrastructure || isObservability ? openMenuKeys : []}
                  onClickSubMenu={(_, keys) => setOpenMenuKeys(keys)}
                  className={clsx("side-menu border-none", collapsed && "side-menu--collapsed")}
                >
                  {sideNavigation.map((item) =>
                    isNavigationGroup(item) ? (
                      <Menu.SubMenu
                        key={item.key}
                        title={renderMenuLabel(item.label, item.icon)}
                        selectable={false}
                        className="side-menu-submenu"
                      >
                        {item.children.map((child) => renderMenuItem(child, 1))}
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
                aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
                title={collapsed ? "展开侧栏" : "收起侧栏"}
                onClick={() => setCollapsed((value) => !value)}
              >
                {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
                <span>{collapsed ? "" : "收起侧栏"}</span>
              </button>
            </aside>
            <main className="content">
              {showShellBreadcrumb ? (
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
              ) : null}
              <Outlet />
            </main>
          </div>
        </div>
      </TenantManagementProvider>
    </PlatformOverviewProvider>
  );
}
