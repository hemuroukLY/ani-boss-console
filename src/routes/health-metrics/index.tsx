import { createFileRoute } from "@tanstack/react-router";
import { ComponentMetricsPage } from "@/components/observability/ComponentMetricsPage";

export const Route = createFileRoute("/health-metrics/")({
  component: ComponentMetricsPage,
});
