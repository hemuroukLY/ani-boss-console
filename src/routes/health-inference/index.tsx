import { createFileRoute } from "@tanstack/react-router";
import { DomainMonitoringPage } from "@/components/observability/DomainMonitoringPage";

function InferenceMonitoringRoute() {
  return <DomainMonitoringPage domain="inference" />;
}

export const Route = createFileRoute("/health-inference/")({
  component: InferenceMonitoringRoute,
});
