import { createFileRoute } from "@tanstack/react-router";
import { DomainMonitoringPage } from "@/components/observability/DomainMonitoringPage";

function KnowledgeBaseMonitoringRoute() {
  return <DomainMonitoringPage domain="kb" />;
}

export const Route = createFileRoute("/health-kb/")({
  component: KnowledgeBaseMonitoringRoute,
});
