import { createFileRoute } from "@tanstack/react-router";
import { AuditPlannedPage } from "@/components/audit/AuditPlannedPage";

export const Route = createFileRoute("/audit-export/")({
  component: function ComplianceExportPage() {
    return (
      <AuditPlannedPage
        title="合规导出与取证"
        description="全平台审计数据尚未齐备，当前不提供不完整的合规导出。"
      />
    );
  },
});
