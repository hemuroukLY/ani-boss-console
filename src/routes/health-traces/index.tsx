import { createFileRoute } from "@tanstack/react-router";
import { PlatformTracePage } from "@/components/observability/PlatformTracePage";

export const Route = createFileRoute("/health-traces/")({
  component: PlatformTracePage,
});
