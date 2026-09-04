import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function ApiKeyAuditPage() {
  return <PagePlaceholder title="API Key 审计" priority="P0" />;
}

export const Route = createFileRoute("/audit-api-keys/")({
  component: ApiKeyAuditPage,
});
