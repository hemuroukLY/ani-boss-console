import { createFileRoute } from "@tanstack/react-router";
import { ApiKeyAuditPage } from "@/components/audit/ApiKeyAuditPage";

export const Route = createFileRoute("/audit-api-keys/")({
  component: ApiKeyAuditPage,
});
