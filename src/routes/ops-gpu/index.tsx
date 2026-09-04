import { createFileRoute } from "@tanstack/react-router";
import { GpuResourcePoolPage } from "@/components/gpu-resource-pool/GpuResourcePoolPage";

export const Route = createFileRoute("/ops-gpu/")({
  component: GpuResourcePoolPage,
});
