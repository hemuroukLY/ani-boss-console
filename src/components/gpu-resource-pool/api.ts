import { apiRequest } from "@/api/client";
import type {
  ApiRuntimeProfile,
  GpuInventoryDevice,
  GpuInventorySnapshot,
  GpuInventoryStatus,
  GpuOccupancy,
  TenantGpuAllocation,
} from "./types";

interface ApiRuntimeProfileResponse {
  mode: string;
  provider: string;
  real_provider: boolean;
  reason: string;
}

interface GpuInventoryItemResponse {
  id: string;
  node_name: string;
  gpu_type: string;
  gpu_index: number;
  memory_total_mb?: number;
  driver_version?: string;
  status: GpuInventoryStatus;
  tenant_id?: string | null;
  instance_id?: string | null;
  gpu_mode?: string;
  gpu_spec?: string;
  gpu_sharing_spec?: string;
  gpu_sharing_policy?: string;
}

interface GpuInventoryListResponse {
  items: GpuInventoryItemResponse[];
  dev_profile: ApiRuntimeProfileResponse;
}

interface GpuOccupancyResponse {
  total: number;
  in_use: number;
  available: number;
  fault: number;
}

interface QuotaItemResponse {
  resource_type: string;
  total: number;
  used: number;
  reserved: number;
}

interface TenantQuotaResponse {
  tenant_id: string;
  tenant_name?: string;
  items: QuotaItemResponse[];
}

interface QuotaListResponse {
  items: TenantQuotaResponse[];
  next_cursor?: string | null;
}

const GPU_RESOURCE_TYPE = "gpu_count";

export const gpuResourcePoolQueryKeys = {
  inventory: ["gpu-resource-pool", "inventory"] as const,
  occupancy: ["gpu-resource-pool", "occupancy"] as const,
  specs: ["gpu-resource-pool", "specs"] as const,
  tenants: ["gpu-resource-pool", "tenants"] as const,
};

function mapRuntimeProfile(
  profile: ApiRuntimeProfileResponse,
): ApiRuntimeProfile {
  return {
    mode: profile.mode,
    provider: profile.provider,
    realProvider: profile.real_provider,
    reason: profile.reason,
  };
}

export async function fetchGpuInventory(): Promise<GpuInventorySnapshot> {
  const response = await apiRequest<GpuInventoryListResponse>("/gpu-inventory");
  return {
    items: (response.items || []).map((item) => ({
      id: item.id,
      nodeName: item.node_name,
      gpuType: item.gpu_type,
      gpuIndex: item.gpu_index,
      memoryTotalMb: item.memory_total_mb,
      driverVersion: item.driver_version,
      status: item.status,
      tenantId: item.tenant_id || undefined,
      instanceId: item.instance_id || undefined,
      gpuMode: item.gpu_mode,
      gpuSpec: item.gpu_spec,
      gpuSharingSpec: item.gpu_sharing_spec,
      gpuSharingPolicy: item.gpu_sharing_policy,
    })),
    profile: mapRuntimeProfile(response.dev_profile),
  };
}

export async function fetchGpuOccupancy(): Promise<GpuOccupancy> {
  const response = await apiRequest<GpuOccupancyResponse>(
    "/gpu-inventory/occupancy",
  );
  return {
    total: response.total,
    inUse: response.in_use,
    available: response.available,
    fault: response.fault,
  };
}

async function fetchAllTenantQuotas() {
  const items: TenantQuotaResponse[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  do {
    const query = new URLSearchParams({ limit: "100" });
    if (cursor) query.set("cursor", cursor);
    const response = await apiRequest<QuotaListResponse>(
      `/quotas?${query.toString()}`,
    );
    items.push(...(response.items || []));
    cursor = response.next_cursor || undefined;
    if (cursor && seenCursors.has(cursor)) break;
    if (cursor) seenCursors.add(cursor);
  } while (cursor);

  return items;
}

export async function fetchTenantGpuAllocations(): Promise<
  TenantGpuAllocation[]
> {
  const quotas = await fetchAllTenantQuotas();
  const gpuQuotas = quotas
    .map((quota) => ({
      quota,
      gpu: quota.items.find((item) => item.resource_type === GPU_RESOURCE_TYPE),
    }))
    .filter(
      (item): item is { quota: TenantQuotaResponse; gpu: QuotaItemResponse } =>
        Boolean(item.gpu),
    );

  return gpuQuotas.map(({ quota, gpu }) => ({
    tenantId: quota.tenant_id,
    tenantName: quota.tenant_name || quota.tenant_id,
    quotaTotal: gpu.total,
    used: gpu.used,
    reserved: gpu.reserved,
  }));
}

export function updateTenantGpuQuota(tenantId: string, total: number) {
  return apiRequest(
    `/admin/tenants/${encodeURIComponent(tenantId)}/quota`,
    {
      method: "PUT",
      body: JSON.stringify({
        items: [{ resource_type: GPU_RESOURCE_TYPE, total }],
      }),
    },
  );
}
