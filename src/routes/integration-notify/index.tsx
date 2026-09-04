import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function NotificationIntegrationsPage() {
  return <PagePlaceholder title="企业通知集成" priority="P1" />;
}

export const Route = createFileRoute("/integration-notify/")({
  component: NotificationIntegrationsPage,
});
