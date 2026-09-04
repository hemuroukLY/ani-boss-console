import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/auth/LoginPage";

export const Route = createFileRoute("/login/")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === "string" &&
    search.redirect.startsWith("/") &&
    !search.redirect.startsWith("//") &&
    !search.redirect.includes("\\")
      ? { redirect: search.redirect }
      : {},
  component: function LoginRouteComponent() {
    const { redirect } = Route.useSearch();
    return <LoginPage redirect={redirect} />;
  },
});
