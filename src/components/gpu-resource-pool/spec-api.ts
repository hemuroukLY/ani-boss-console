import { apiRequest } from "@/api/client";
import type { CreateGpuSpecInput, GpuSpec, GpuSpecMode } from "./types";

interface GpuSpecResponse {
  id: string;
  name: string;
  gpu_type: string;
  gpu_mode?: GpuSpecMode;
  memory_total_mb?: number;
  shares: number;
  mb_per_share: number;
  available: boolean;
  node_affinity?: {
    gpu_sharing_policy?: string;
  };
}

interface GpuSpecListResponse {
  items: GpuSpecResponse[];
}

function mapGpuSpec(spec: GpuSpecResponse): GpuSpec {
  return {
    id: spec.id,
    name: spec.name,
    gpuType: spec.gpu_type,
    gpuMode: spec.gpu_mode,
    memoryTotalMb: spec.memory_total_mb,
    shares: spec.shares,
    mbPerShare: spec.mb_per_share,
    available: spec.available,
    sharingPolicy: spec.node_affinity?.gpu_sharing_policy,
  };
}

export async function fetchGpuSpecs(): Promise<GpuSpec[]> {
  const response = await apiRequest<GpuSpecListResponse>("/gpu-specs");
  return (response.items || []).map(mapGpuSpec);
}

export async function createGpuSpec(input: CreateGpuSpecInput) {
  const response = await apiRequest<GpuSpecResponse>("/gpu-specs", {
    method: "POST",
    headers: { "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({
      spec_id: input.specId,
      gpu_type: input.gpuType,
      gpu_mode: input.gpuMode,
      shares: input.shares,
      mb_per_share: input.mbPerShare,
      memory_total_mb: input.memoryTotalMb,
    }),
  });
  return mapGpuSpec(response);
}

export function deleteGpuSpec(specId: string) {
  return apiRequest<void>(`/gpu-specs/${encodeURIComponent(specId)}`, {
    method: "DELETE",
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
}
