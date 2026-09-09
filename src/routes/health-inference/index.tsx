import { createFileRoute } from "@tanstack/react-router";
import { DomainMonitoringPage } from "@/components/observability/DomainMonitoringPage";

export const Route = createFileRoute("/health-inference/")({
  component: function InferenceMonitoringRoute() {
    return <DomainMonitoringPage domain="inference" />;
  },
});
