import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function SessionSecurityPage() {
  return <PagePlaceholder title="会话与安全策略（预留）" priority="P2" />;
}

export const Route = createFileRoute("/settings-session/")({
  component: SessionSecurityPage,
});
