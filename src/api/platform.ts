import { apiRequest } from "@/api/client";

interface DevProfileResponse {
  mode: string;
  provider: string;
  real_provider: boolean;
  reason: string;
}

interface PlatformCapacityRegionResponse {
  id: string;
  code: string;
  name: string;
  display_name: string;
  status: string;
  open_for_tenant: boolean;
  azs: string[];
  tenant_count: number;
  capacity: {
    gpu_total: number;
    gpu_free: number;
    nodes: number;
    cpu_cores: number;
    memory_gib: number;
  };
}

interface PlatformCapacityResponse {
  regions: PlatformCapacityRegionResponse[];
  summary: {
    region_count: number;
    gpu_total: number;
    gpu_free: number;
    tenant_count: number;
    nodes: number;
    azs: string[];
  };
  dev_profile: DevProfileResponse;
}

interface PlatformServiceHealthResponse {
  scope: string;
  coverage: string;
  signal: string;
  observed_at: string;
  source_status: string;
  components: Array<{
    service_name: string;
    scrape_status: PlatformServiceScrapeStatus;
    observed_replicas: number;
    reachable_replicas: number;
    versions: string[];
    sample_age_seconds: number | null;
  }>;
}

interface PlatformMeteringUsageResponse {
  items: Array<{
    tenant_id?: string;
    resource_type: string;
    total_quantity: number;
    unit: string;
    period?: string;
  }>;
  total: number;
  dev_profile: DevProfileResponse;
}

export interface PlatformRuntimeProfile {
  mode: string;
  provider: string;
  realProvider: boolean;
  reason: string;
}

export interface PlatformCapacityRegion {
  id: string;
  code: string;
  name: string;
  displayName: string;
  status: string;
  openForTenant: boolean;
  azs: string[];
  tenantCount: number;
  capacity: {
    gpuTotal: number;
    gpuFree: number;
    nodes: number;
    cpuCores: number;
    memoryGiB: number;
  };
}

export interface PlatformCapacity {
  regions: PlatformCapacityRegion[];
  summary: {
    regionCount: number;
    gpuTotal: number;
    gpuFree: number;
    tenantCount: number;
    nodes: number;
    azs: string[];
  };
  profile: PlatformRuntimeProfile;
}

export type PlatformServiceScrapeStatus = "reachable" | "unreachable" | "unknown";

export interface PlatformServiceHealthComponent {
  serviceName: string;
  scrapeStatus: PlatformServiceScrapeStatus;
  observedReplicas: number;
  reachableReplicas: number;
  versions: string[];
  sampleAgeSeconds?: number;
}

export interface PlatformServiceHealth {
  scope: string;
  coverage: string;
  signal: string;
  observedAt: string;
  sourceStatus: string;
  components: PlatformServiceHealthComponent[];
}

export type PlatformMeteringResourceType = "instance_gpu_seconds";
export type PlatformMeteringGroupBy = "tenant_id" | "day" | "hour";

export interface PlatformMeteringUsageParams {
  startTime: string;
  endTime: string;
  resourceType: PlatformMeteringResourceType;
  groupBy: PlatformMeteringGroupBy;
  tenantId?: string;
}

export interface PlatformMeteringUsageItem {
  tenantId?: string;
  resourceType: string;
  totalQuantity: number;
  unit: string;
  period?: string;
}

export interface PlatformMeteringUsage {
  items: PlatformMeteringUsageItem[];
  total: number;
  profile: PlatformRuntimeProfile;
}

export const platformQueryKeys = {
  capacity: ["platform", "capacity"] as const,
  serviceHealth: ["platform", "service-health"] as const,
  meteringUsage: (params: PlatformMeteringUsageParams) =>
    ["platform", "metering-usage", params] as const,
};

function mapRuntimeProfile(profile: DevProfileResponse): PlatformRuntimeProfile {
  return {
    mode: profile.mode,
    provider: profile.provider,
    realProvider: profile.real_provider,
    reason: profile.reason,
  };
}

export async function fetchPlatformCapacity(): Promise<PlatformCapacity> {
  const response = await apiRequest<PlatformCapacityResponse>("/platform/capacity");

  return {
    regions: (response.regions || []).map((region) => ({
      id: region.id,
      code: region.code,
      name: region.name,
      displayName: region.display_name,
      status: region.status,
      openForTenant: region.open_for_tenant,
      azs: region.azs || [],
      tenantCount: region.tenant_count,
      capacity: {
        gpuTotal: region.capacity.gpu_total,
        gpuFree: region.capacity.gpu_free,
        nodes: region.capacity.nodes,
        cpuCores: region.capacity.cpu_cores,
        memoryGiB: region.capacity.memory_gib,
      },
    })),
    summary: {
      regionCount: response.summary.region_count,
      gpuTotal: response.summary.gpu_total,
      gpuFree: response.summary.gpu_free,
      tenantCount: response.summary.tenant_count,
      nodes: response.summary.nodes,
      azs: response.summary.azs || [],
    },
    profile: mapRuntimeProfile(response.dev_profile),
  };
}

export async function fetchPlatformServiceHealth(): Promise<PlatformServiceHealth> {
  const response = await apiRequest<PlatformServiceHealthResponse>("/platform/services/health");

  return {
    scope: response.scope,
    coverage: response.coverage,
    signal: response.signal,
    observedAt: response.observed_at,
    sourceStatus: response.source_status,
    components: (response.components || []).map((component) => ({
      serviceName: component.service_name,
      scrapeStatus: component.scrape_status,
      observedReplicas: component.observed_replicas,
      reachableReplicas: component.reachable_replicas,
      versions: component.versions || [],
      sampleAgeSeconds: component.sample_age_seconds ?? undefined,
    })),
  };
}

export async function fetchPlatformMeteringUsage(
  params: PlatformMeteringUsageParams,
): Promise<PlatformMeteringUsage> {
  const search = new URLSearchParams({
    start_time: params.startTime,
    end_time: params.endTime,
    resource_type: params.resourceType,
    group_by: params.groupBy,
  });
  if (params.tenantId) search.set("tenant_id", params.tenantId);

  const response = await apiRequest<PlatformMeteringUsageResponse>(
    `/metering/usage/platform?${search.toString()}`,
  );

  return {
    items: (response.items || []).map((item) => ({
      tenantId: item.tenant_id,
      resourceType: item.resource_type,
      totalQuantity: item.total_quantity,
      unit: item.unit,
      period: item.period,
    })),
    total: response.total,
    profile: mapRuntimeProfile(response.dev_profile),
  };
}
