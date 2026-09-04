import { createFileRoute } from "@tanstack/react-router";
import { AlertRulesPage } from "@/components/observability/AlertRulesPage";

export const Route = createFileRoute("/health-alert-rules/")({
  component: AlertRulesPage,
});
