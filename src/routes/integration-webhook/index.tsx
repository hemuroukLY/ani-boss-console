import { createFileRoute } from "@tanstack/react-router";
import { OperationsWebhookPage } from "@/components/integration/OperationsWebhookPage";

export const Route = createFileRoute("/integration-webhook/")({
  component: OperationsWebhookPage,
});
