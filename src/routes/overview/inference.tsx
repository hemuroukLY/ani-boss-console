import { createFileRoute } from "@tanstack/react-router";
import { ResourceStatusPage } from "@/components/platform-overview/ResourceStatus";

export const Route = createFileRoute("/overview/inference")({
  component: () => <ResourceStatusPage kind="inference" />,
});
