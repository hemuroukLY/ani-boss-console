import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { isAuthenticated } from "@/components/auth/store";
import { AppShell } from "@/components/shell/AppShell";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    if (!location.pathname.startsWith("/login") && !isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: function RootLayout() {
    const isLoginPage = useRouterState({
      select: (state) => state.location.pathname.startsWith("/login"),
    });
    return isLoginPage ? <Outlet /> : <AppShell />;
  },
  notFoundComponent: () => <div className="status-page">页面不存在</div>,
});
