import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

export const Route = createFileRoute("/audit-export/")({
  component: function ComplianceExportPage() {
    return <PagePlaceholder title="合规导出与取证" priority="P1" />;
  },
});
