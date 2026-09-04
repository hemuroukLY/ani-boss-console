import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function MaintenanceSkillsPage() {
  return <PagePlaceholder title="运维 Skills" priority="P1" />;
}

export const Route = createFileRoute("/maint-skills/")({
  component: MaintenanceSkillsPage,
});
