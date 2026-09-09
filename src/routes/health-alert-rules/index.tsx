import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

export const Route = createFileRoute("/health-alert-rules/")({
  component: function AlertRulesPage() {
    return <PagePlaceholder title="告警规则" priority="P0" />;
  },
});
