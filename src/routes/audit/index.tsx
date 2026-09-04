import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function PlatformAuditPage() {
  return <PagePlaceholder title="平台审计日志" priority="P0" />;
}

export const Route = createFileRoute("/audit/")({
  component: PlatformAuditPage,
});
