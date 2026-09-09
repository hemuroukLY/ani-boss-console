import { createFileRoute } from "@tanstack/react-router";
import { DomainMonitoringPage } from "@/components/observability/DomainMonitoringPage";

export const Route = createFileRoute("/health-gpu/")({
  component: function GpuMonitoringRoute() {
    return <DomainMonitoringPage domain="gpu" />;
  },
});
