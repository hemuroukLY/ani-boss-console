import { apiFetch, apiRequest } from "@/api/client";

interface DevProfileResponse {
  mode: string;
  provider: string;
  real_provider: boolean;
  reason: string | null;
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

interface PlatformComponentsResponse {
  observed_at: string;
  groups: Array<{
    name: string;
    components: Array<{
      name: string;
      kind: string;
      namespace: string;
      group: string;
      status: string;
      desired_replicas: number;
      ready_replicas: number;
      version: string;
      scrape_status: PlatformServiceScrapeStatus | null;
      reason: string | null;
    }>;
  }>;
  dev_profile: DevProfileResponse;
}

interface PlatformComponentLogResponse {
  container: string;
  level: string;
  message: string;
  pod: string;
  stream: string;
  timestamp: string;
}

export interface PlatformRuntimeProfile {
  mode: string;
  provider: string;
  realProvider: boolean;
  reason: string | null;
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

export type PlatformMeteringResourceType =
  | "instance_gpu_seconds"
  | "instance_cpu_seconds"
  | "instance_memory_gib_seconds";
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

export interface PlatformComponent {
  name: string;
  kind: string;
  namespace: string;
  group: string;
  status: string;
  desiredReplicas: number;
  readyReplicas: number;
  version: string;
  scrapeStatus: PlatformServiceScrapeStatus | null;
  reason: string | null;
}

export interface PlatformComponentGroup {
  name: string;
  components: PlatformComponent[];
}

export interface PlatformComponents {
  observedAt: string;
  groups: PlatformComponentGroup[];
  profile: PlatformRuntimeProfile;
}

export interface PlatformComponentLog {
  container: string;
  level: string;
  message: string;
  pod: string;
  stream: string;
  timestamp: string;
}

export interface StreamPlatformComponentLogsOptions {
  component: string;
  limit: number;
  intervalSeconds: number;
  signal?: AbortSignal;
  onConnected?: () => void;
  onLog: (log: PlatformComponentLog) => void;
}

export const platformQueryKeys = {
  capacity: ["platform", "capacity"] as const,
  components: ["platform", "components"] as const,
  meteringUsage: (params: PlatformMeteringUsageParams) =>
    ["platform", "metering-usage", params] as const,
};

function mapPlatformComponent(
  component: PlatformComponentsResponse["groups"][number]["components"][number],
): PlatformComponent {
  return {
    name: component.name,
    kind: component.kind,
    namespace: component.namespace,
    group: component.group,
    status: component.status,
    desiredReplicas: component.desired_replicas,
    readyReplicas: component.ready_replicas,
    version: component.version,
    scrapeStatus: component.scrape_status,
    reason: component.reason,
  };
}

function mapPlatformComponentLog(log: PlatformComponentLogResponse): PlatformComponentLog {
  return {
    container: log.container,
    level: log.level,
    message: log.message,
    pod: log.pod,
    stream: log.stream,
    timestamp: log.timestamp,
  };
}

function parseSseBlock(
  block: string,
  onConnected: (() => void) | undefined,
  onLog: (log: PlatformComponentLog) => void,
) {
  if (block.startsWith(":")) {
    if (block.slice(1).trim() === "connected") onConnected?.();
    return false;
  }

  const lines = block.split(/\r?\n/);
  const event =
    lines
      .find((line) => line.startsWith("event:"))
      ?.slice(6)
      .trim() || "message";
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (event === "log" && data) {
    onLog(mapPlatformComponentLog(JSON.parse(data) as PlatformComponentLogResponse));
  }
  if (event === "error") {
    throw new Error(data || "日志流异常断开");
  }
  return event === "done";
}

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

export async function fetchPlatformComponents(): Promise<PlatformComponents> {
  const response = await apiRequest<PlatformComponentsResponse>("/platform/components");

  return {
    observedAt: response.observed_at,
    groups: (response.groups || []).map((group) => ({
      name: group.name,
      components: (group.components || []).map(mapPlatformComponent),
    })),
    profile: mapRuntimeProfile(response.dev_profile),
  };
}

export async function streamPlatformComponentLogs({
  component,
  limit,
  intervalSeconds,
  signal,
  onConnected,
  onLog,
}: StreamPlatformComponentLogsOptions): Promise<void> {
  const search = new URLSearchParams({
    limit: String(limit),
    interval_seconds: String(intervalSeconds),
  });
  const response = await apiFetch(
    `/platform/components/${encodeURIComponent(component)}/logs/stream?${search.toString()}`,
    {
      headers: { Accept: "text/event-stream" },
      signal,
    },
  );
  if (!response.body) throw new Error("浏览器未提供日志流响应体");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() || "";
    for (const block of blocks) {
      if (parseSseBlock(block, onConnected, onLog)) return;
    }
    if (done) {
      if (buffer.trim()) parseSseBlock(buffer, onConnected, onLog);
      return;
    }
  }
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
