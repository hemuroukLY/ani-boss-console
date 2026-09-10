import { createFileRoute } from "@tanstack/react-router";
import { CapacityOverviewPage } from "@/components/overview/CapacityOverviewPage";

export const Route = createFileRoute("/overview-capacity/")({
  component: () => <CapacityOverviewPage />,
});
