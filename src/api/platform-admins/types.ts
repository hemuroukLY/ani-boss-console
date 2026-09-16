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
  roleId?: string;
  status?: PlatformAdministratorStatus;
  source?: "local" | "oidc";
  search?: string;
}

export interface CreatePlatformAdministratorInput {
  email: string;
  username: string;
  displayName: string;
  roleId: string;
  password: string;
}

export interface UpdatePlatformAdministratorRoleInput {
  userId: string;
  roleId: string;
}

export interface ResetPlatformAdministratorPasswordInput {
  userId: string;
  newPassword: string;
}

export type PlatformPermissionAccess = "read" | "write" | "none";

export interface PlatformAdministratorRoleDefinition {
  id: string;
  name: PlatformAdministratorRole;
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
