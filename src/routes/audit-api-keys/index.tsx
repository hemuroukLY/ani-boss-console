import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

export const Route = createFileRoute("/audit-api-keys/")({
  component: function ApiKeyAuditPage() {
    return <PagePlaceholder title="API Key 审计" priority="P0" />;
  },
});
