import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceSkillsPage } from "@/components/observability/MaintenanceSkillsPage";

export const Route = createFileRoute("/maint-skills/")({
  component: MaintenanceSkillsPage,
});
