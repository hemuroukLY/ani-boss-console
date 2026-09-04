import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function OperationsSystemIntegrationsPage() {
  return <PagePlaceholder title="运营系统对接" priority="P1" />;
}

export const Route = createFileRoute("/integration-ops-system/")({
  component: OperationsSystemIntegrationsPage,
});
