import { createFileRoute } from "@tanstack/react-router";
import { TenantBillingList } from "@/components/tenant/TenantBillingSummary/TenantBillingList";

export const Route = createFileRoute("/tenants-billing/")({
  component: TenantBillingList,
});
