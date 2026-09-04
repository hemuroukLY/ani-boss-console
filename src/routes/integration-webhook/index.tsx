import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function OperationsWebhookPage() {
  return <PagePlaceholder title="运维 Webhook" priority="P0" />;
}

export const Route = createFileRoute("/integration-webhook/")({
  component: OperationsWebhookPage,
});
