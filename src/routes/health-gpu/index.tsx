import { createFileRoute } from "@tanstack/react-router";
import { DomainMonitoringPage } from "@/components/observability/DomainMonitoringPage";

function GpuMonitoringRoute() {
  return <DomainMonitoringPage domain="gpu" />;
}

export const Route = createFileRoute("/health-gpu/")({
  component: GpuMonitoringRoute,
});
