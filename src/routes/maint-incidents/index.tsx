import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function IncidentManagementPage() {
  return <PagePlaceholder title="故障处理" priority="P1" />;
}

export const Route = createFileRoute("/maint-incidents/")({
  component: IncidentManagementPage,
});
