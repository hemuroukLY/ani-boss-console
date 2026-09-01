import { createFileRoute } from "@tanstack/react-router";
import { QuotaPolicyList } from "@/components/tenant/TenantQuotaUsage/QuotaPolicyList";

export const Route = createFileRoute("/tenants-quotas/")({
  component: QuotaPolicyList,
});
