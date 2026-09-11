import { createFileRoute } from "@tanstack/react-router";
import { AuditPlannedPage } from "@/components/audit/AuditPlannedPage";

export const Route = createFileRoute("/audit-api-keys/")({
  component: function ApiKeyAuditPage() {
    return (
      <AuditPlannedPage
        title="API Key 审计"
        description="当前后端尚未提供平台范围的 API Key 审计查询。"
      />
    );
  },
});
