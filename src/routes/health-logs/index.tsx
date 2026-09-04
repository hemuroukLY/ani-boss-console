import { createFileRoute } from "@tanstack/react-router";
import { PlatformLogsPage } from "@/components/observability/PlatformLogsPage";

export const Route = createFileRoute("/health-logs/")({
  component: PlatformLogsPage,
});
