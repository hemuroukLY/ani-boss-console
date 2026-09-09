import { createFileRoute } from "@tanstack/react-router";
import { TenantAdministratorDetail } from "@/components/tenant/TenantAdministrators/TenantAdministratorDetail";

export const Route = createFileRoute("/tenants-admins/$adminId")({
  component: function TenantAdministratorDetailRoute() {
    const { adminId } = Route.useParams();
    return <TenantAdministratorDetail adminId={adminId} />;
  },
});
