import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

export const Route = createFileRoute("/audit-inference/")({
  component: function InferenceAuditPage() {
    return <PagePlaceholder title="推理调用审计" priority="P0" />;
  },
});
