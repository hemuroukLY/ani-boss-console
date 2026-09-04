import { createFileRoute } from "@tanstack/react-router";
import { SessionSecurityPage } from "@/components/settings/SessionSecurityPage";

export const Route = createFileRoute("/settings-session/")({
  component: SessionSecurityPage,
});
