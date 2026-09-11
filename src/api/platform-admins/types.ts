export type PlatformAdministratorRole = "platform-admin" | "platform-ops" | "platform-readonly";

export type PlatformAdministratorStatus = "active" | "disabled";

export type PlatformAdministratorSource = "local" | "third_party";

export interface PlatformAdministratorListItem {
  id: string;
  username: string;
  displayName: string;
  role: PlatformAdministratorRole;
  status: PlatformAdministratorStatus;
  source: PlatformAdministratorSource;
  lastLoginAt: string | null;
}

export interface PlatformAdministratorDetail extends PlatformAdministratorListItem {
  email: string;
  createdAt: string;
}

export interface PlatformAdministratorListFilters {
  role?: PlatformAdministratorRole;
  status?: PlatformAdministratorStatus;
  source?: "local" | "oidc";
  search?: string;
}

export interface CreatePlatformAdministratorInput {
  email: string;
  username: string;
  displayName: string;
  role: PlatformAdministratorRole;
  password: string;
}

export interface UpdatePlatformAdministratorRoleInput {
  userId: string;
  role: PlatformAdministratorRole;
}

export interface ResetPlatformAdministratorPasswordInput {
  userId: string;
  newPassword: string;
}

export type PlatformPermissionAccess = "read" | "write" | "none";

export interface PlatformRolePermissions {
  tenantOps: PlatformPermissionAccess;
  resourcePool: PlatformPermissionAccess;
  platformUser: PlatformPermissionAccess;
  auditExport: PlatformPermissionAccess;
}

export interface PlatformAdministratorRoleDefinition {
  name: PlatformAdministratorRole;
  label: string;
  description: string;
  permissions: PlatformRolePermissions;
}

export interface PlatformAdministratorAuditLog {
  id: string;
  action: string;
  resource: string;
  result: "success" | "failed";
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface PlatformAdministratorMutationResult {
  id: string;
  message: string;
}
