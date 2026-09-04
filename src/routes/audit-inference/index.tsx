import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/common";

function InferenceAuditPage() {
  return <PagePlaceholder title="推理调用审计" priority="P0" />;
}

export const Route = createFileRoute("/audit-inference/")({
  component: InferenceAuditPage,
});
