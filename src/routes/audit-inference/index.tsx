import { createFileRoute } from "@tanstack/react-router";
import { InferenceAuditPage } from "@/components/audit/InferenceAuditPage";

export const Route = createFileRoute("/audit-inference/")({
  component: InferenceAuditPage,
});
