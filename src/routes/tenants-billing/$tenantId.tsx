import { createFileRoute } from "@tanstack/react-router";
import { TenantBillingDetail } from "@/components/tenant/TenantBillingSummary/TenantBillingDetail";

export const Route = createFileRoute("/tenants-billing/$tenantId")({
  component: TenantBillingDetailRoute,
});

function TenantBillingDetailRoute() {
  const { tenantId } = Route.useParams();
  return <TenantBillingDetail tenantId={tenantId} />;
}
