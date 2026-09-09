import { createFileRoute } from "@tanstack/react-router";
import { DomainMonitoringPage } from "@/components/observability/DomainMonitoringPage";

export const Route = createFileRoute("/health-kb/")({
  component: function KnowledgeBaseMonitoringRoute() {
    return <DomainMonitoringPage domain="kb" />;
  },
});
