import { createFileRoute } from "@tanstack/react-router";
import { PlatformMeteringPage } from "@/components/metering/PlatformMeteringPage";

export const Route = createFileRoute("/metering/")({
  component: () => <PlatformMeteringPage />,
});
