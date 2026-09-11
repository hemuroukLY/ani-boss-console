import { createFileRoute } from "@tanstack/react-router";
import { PlatformAuditPage as PlatformAuditPageContent } from "@/components/audit/PlatformAuditPage";

export const Route = createFileRoute("/audit/")({
  component: function PlatformAuditPage() {
    return <PlatformAuditPageContent />;
  },
});
