export type GpuInventoryStatus = "available" | "in_use" | "fault" | "maintenance";
export type GpuShareCount = 1 | 2 | 4 | 8;

export interface ApiRuntimeProfile {
  mode: string;
  provider: string;
  realProvider: boolean;
  reason: string;
}

export interface GpuInventoryDevice {
  id: string;
  nodeName: string;
  gpuType: string;
  gpuIndex: number;
  memoryTotalMb?: number;
  driverVersion?: string;
  status: GpuInventoryStatus;
  tenantId?: string;
  instanceId?: string;
  gpuMode?: string;
  gpuSpec?: string;
  gpuSharingSpec?: string;
  gpuSharingPolicy?: string;
  shares?: GpuShareCount;
}

export interface GpuInventorySnapshot {
  items: GpuInventoryDevice[];
  profile: ApiRuntimeProfile;
}

export interface GpuOccupancy {
  total: number;
  inUse: number;
  available: number;
  fault: number;
}

export type GpuPartitionShares = Exclude<GpuShareCount, 1>;

export interface GpuPartitionPod {
  namespace: string;
  name: string;
  reason?: string;
}

export interface GpuPartitionSkippedNode {
  nodeName: string;
  reason: string;
  pods: GpuPartitionPod[];
}

export interface GpuPartitionFailedNode {
  nodeName: string;
  ok?: boolean;
  reason: string;
}

export interface GpuPartitionTaskResult {
  shares?: GpuPartitionShares;
  appliedNodes: string[];
  skippedNodes: GpuPartitionSkippedNode[];
  failedNodes: GpuPartitionFailedNode[];
  lastMessage?: string;
}

export interface GpuPartitionTask {
  id: string;
  idempotencyKey?: string;
  taskType: string;
  resourceType?: string;
  resourceId?: string;
  status: string;
  attemptCount?: number;
  maxAttempts?: number;
  progressPct: number;
  result?: GpuPartitionTaskResult;
  errorMessage?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface CreateGpuPartitionInput {
  shares: GpuPartitionShares;
}

export interface TenantGpuAllocation {
  tenantId: string;
  tenantName: string;
  quotaTotal: number;
  allocatedGpuCount: number;
  used: number;
  reserved: number;
  available: number;
}

export interface UpdateTenantGpuQuotaInput {
  tenantId: string;
  total: number;
}

export interface UpdateTenantGpuReservationInput {
  tenantId: string;
  allocatedGpuCount: number;
}
