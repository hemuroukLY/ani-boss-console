import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

export const Route = createFileRoute("/audit/")({
  component: function PlatformAuditPage() {
    return <PagePlaceholder title="平台审计日志" priority="P0" />;
  },
});
