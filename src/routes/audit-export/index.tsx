import { createFileRoute } from "@tanstack/react-router";
import { ComplianceExportPage } from "@/components/audit/ComplianceExportPage";

export const Route = createFileRoute("/audit-export/")({
  component: ComplianceExportPage,
});
