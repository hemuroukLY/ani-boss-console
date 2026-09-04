import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceJobsPage } from "@/components/observability/MaintenanceJobsPage";

export const Route = createFileRoute("/maint-jobs/")({
  component: MaintenanceJobsPage,
});
