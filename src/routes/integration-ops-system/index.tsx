import { createFileRoute } from "@tanstack/react-router";
import { OperationsSystemIntegrationsPage } from "@/components/integration/OperationsSystemIntegrationsPage";

export const Route = createFileRoute("/integration-ops-system/")({
  component: OperationsSystemIntegrationsPage,
});
