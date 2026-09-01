import { createFileRoute } from "@tanstack/react-router";
import { TenantAdministratorList } from "@/components/tenant/TenantAdministrators/TenantAdministratorList";

export const Route = createFileRoute("/tenants-admins/")({
  component: TenantAdministratorList,
});
