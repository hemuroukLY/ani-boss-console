import { createFileRoute } from "@tanstack/react-router";
import { PlatformHealthPage } from "@/components/observability/PlatformHealthPage";

export const Route = createFileRoute("/health/")({
  component: () => <PlatformHealthPage />,
});
