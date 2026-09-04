import { createFileRoute } from "@tanstack/react-router";
import { PlatformAuditPage } from "@/components/audit/PlatformAuditPage";

export const Route = createFileRoute("/audit/")({
  component: PlatformAuditPage,
});
