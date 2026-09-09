export type GpuInventoryStatus = "available" | "in_use" | "fault" | "maintenance";

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

export type GpuSpecMode = "wholecard" | "vgpu";

export interface GpuSpec {
  id: string;
  name: string;
  gpuType: string;
  gpuMode?: GpuSpecMode;
  memoryTotalMb?: number;
  shares: number;
  mbPerShare: number;
  available: boolean;
  sharingPolicy?: string;
}

export interface CreateGpuSpecInput {
  specId: string;
  gpuType: string;
  gpuMode: GpuSpecMode;
  shares: number;
  mbPerShare: number;
  memoryTotalMb: number;
}

export interface TenantGpuAllocation {
  tenantId: string;
  tenantName: string;
  quotaTotal: number;
  used: number;
  reserved: number;
}
