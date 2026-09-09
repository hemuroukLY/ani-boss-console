import { createFileRoute } from "@tanstack/react-router";
import { QuotaPolicyDetail } from "@/components/tenant/TenantQuotaUsage/QuotaPolicyDetail";

export const Route = createFileRoute("/tenants-quotas/$planCode")({
  component: function QuotaPolicyDetailRoute() {
    const { planCode } = Route.useParams();
    return <QuotaPolicyDetail planCode={planCode} />;
  },
});
