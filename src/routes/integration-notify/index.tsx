import { createFileRoute } from "@tanstack/react-router";
import { NotificationIntegrationsPage } from "@/components/integration/NotificationIntegrationsPage";

export const Route = createFileRoute("/integration-notify/")({
  component: NotificationIntegrationsPage,
});
