import { createFileRoute } from "@tanstack/react-router";
import { IncidentManagementPage } from "@/components/observability/IncidentManagementPage";

export const Route = createFileRoute("/maint-incidents/")({
  component: IncidentManagementPage,
});
