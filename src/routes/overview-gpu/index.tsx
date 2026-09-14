import { createFileRoute } from "@tanstack/react-router";
import { GpuResourcePoolStatusPage } from "@/components/overview/GpuResourcePoolStatusPage";

export const Route = createFileRoute("/overview-gpu/")({
  component: () => <GpuResourcePoolStatusPage />,
});
