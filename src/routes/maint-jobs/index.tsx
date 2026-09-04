import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function MaintenanceJobsPage() {
  return <PagePlaceholder title="任务历史" priority="P1" />;
}

export const Route = createFileRoute("/maint-jobs/")({
  component: MaintenanceJobsPage,
});
