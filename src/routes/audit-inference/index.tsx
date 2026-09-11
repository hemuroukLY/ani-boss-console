import { createFileRoute } from "@tanstack/react-router";
import { AuditPlannedPage } from "@/components/audit/AuditPlannedPage";

export const Route = createFileRoute("/audit-inference/")({
  component: function InferenceAuditPage() {
    return (
      <AuditPlannedPage
        title="推理调用审计"
        description="当前后端尚未提供平台范围的推理调用审计查询。"
      />
    );
  },
});
