import { runIdempotentRequest } from "@/api/idempotency";
import { servicesRequest } from "@/api/request";
import { getApiErrorMessage, parseApiError } from "@/lib/api-error";
import { createIdempotencyScope } from "@/lib/idempotency";
import type {
  CreatePlatformAdministratorInput,
  PlatformAdministratorAuditLog,
  PlatformAdministratorDetail,
  PlatformAdministratorListFilters,
  PlatformAdministratorListItem,
  PlatformAdministratorMutationResult,
  PlatformAdministratorRoleDefinition,
  ResetPlatformAdministratorPasswordInput,
  UpdatePlatformAdministratorRoleInput,
} from "./types";

interface PlatformAdministratorListItemResponse {
  id: string;
  username: string;
  display_name: string;
  role: PlatformAdministratorListItem["role"];
  status: PlatformAdministratorListItem["status"];
  source: PlatformAdministratorListItem["source"];
  last_login_at?: string | null;
}

interface PlatformAdministratorDetailResponse extends PlatformAdministratorListItemResponse {
  email: string;
  created_at: string;
}

interface CursorListResponse<T> {
  items: T[];
  next_cursor?: string | null;
}

interface PlatformRoleResponse {
  name: PlatformAdministratorRoleDefinition["name"];
  label: string;
  description: string;
  permissions: {
    tenant_ops: PlatformAdministratorRoleDefinition["permissions"]["tenantOps"];
    resource_pool: PlatformAdministratorRoleDefinition["permissions"]["resourcePool"];
    platform_user: PlatformAdministratorRoleDefinition["permissions"]["platformUser"];
    audit_export: PlatformAdministratorRoleDefinition["permissions"]["auditExport"];
  };
}

interface PlatformAuditLogResponse {
  id: string;
  action: string;
  resource: string;
  result: PlatformAdministratorAuditLog["result"];
  details?: Record<string, unknown> | null;
  created_at: string;
}

const createScope = createIdempotencyScope("platform-admin-create", ["POST"]);
const updateRoleScope = createIdempotencyScope("platform-admin-role", ["PUT"]);
const resetPasswordScope = createIdempotencyScope("platform-admin-password", ["POST"]);
const disableScope = createIdempotencyScope("platform-admin-disable", ["POST"]);
const enableScope = createIdempotencyScope("platform-admin-enable", ["POST"]);
const deleteScope = createIdempotencyScope("platform-admin-delete", ["DELETE"]);

export const platformAdministratorQueryKeys = {
  all: ["platform-administrators"] as const,
  list: (filters: PlatformAdministratorListFilters = {}) =>
    ["platform-administrators", "list", filters] as const,
  detail: (userId: string) => ["platform-administrators", "detail", userId] as const,
  roles: ["platform-administrators", "roles"] as const,
  auditLogs: (userId: string) => ["platform-administrators", "audit-logs", userId] as const,
};

function platformAdministratorPath(userId: string, suffix = "") {
  return `/platform-admins/${encodeURIComponent(userId)}${suffix}`;
}

function mapListItem(item: PlatformAdministratorListItemResponse): PlatformAdministratorListItem {
  return {
    id: item.id,
    username: item.username,
    displayName: item.display_name,
    role: item.role,
    status: item.status,
    source: item.source,
    lastLoginAt: item.last_login_at ?? null,
  };
}

async function fetchAllCursorPages<T>(path: string, params: object): Promise<T[]> {
  const items: T[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  do {
    const response = await servicesRequest<CursorListResponse<T>>(path, {
      method: "GET",
      params: { ...params, limit: 100, cursor },
    });
    items.push(...response.items);
    const nextCursor = response.next_cursor || undefined;
    if (!nextCursor || seenCursors.has(nextCursor)) break;
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  } while (cursor);

  return items;
}

export async function fetchPlatformAdministrators(
  filters: PlatformAdministratorListFilters = {},
): Promise<PlatformAdministratorListItem[]> {
  const items = await fetchAllCursorPages<PlatformAdministratorListItemResponse>(
    "/platform-admins",
    filters,
  );
  return items.map(mapListItem);
}

export async function fetchPlatformAdministrator(
  userId: string,
): Promise<PlatformAdministratorDetail> {
  const item = await servicesRequest<PlatformAdministratorDetailResponse>(
    platformAdministratorPath(userId),
    { method: "GET" },
  );
  return { ...mapListItem(item), email: item.email, createdAt: item.created_at };
}

export async function fetchPlatformAdministratorRoles(): Promise<
  PlatformAdministratorRoleDefinition[]
> {
  const response = await servicesRequest<{ items: PlatformRoleResponse[] }>(
    "/platform-admins/roles",
    { method: "GET" },
  );
  return response.items.map((item) => ({
    name: item.name,
    label: item.label,
    description: item.description,
    permissions: {
      tenantOps: item.permissions.tenant_ops,
      resourcePool: item.permissions.resource_pool,
      platformUser: item.permissions.platform_user,
      auditExport: item.permissions.audit_export,
    },
  }));
}

export async function fetchPlatformAdministratorAuditLogs(
  userId: string,
): Promise<PlatformAdministratorAuditLog[]> {
  const items = await fetchAllCursorPages<PlatformAuditLogResponse>(
    platformAdministratorPath(userId, "/audit-logs"),
    {},
  );
  return items.map((item) => ({
    id: item.id,
    action: item.action,
    resource: item.resource,
    result: item.result,
    details: item.details ?? null,
    createdAt: item.created_at,
  }));
}

export function createPlatformAdministrator(
  input: CreatePlatformAdministratorInput,
): Promise<PlatformAdministratorMutationResult> {
  const { displayName, ...fields } = input;
  return runIdempotentRequest(createScope, { ...fields, display_name: displayName }, (body) =>
    servicesRequest<PlatformAdministratorMutationResult, typeof body>("/platform-admins", {
      method: "POST",
      data: body,
    }),
  );
}

export function updatePlatformAdministratorRole({
  userId,
  role,
}: UpdatePlatformAdministratorRoleInput): Promise<PlatformAdministratorMutationResult> {
  return runIdempotentRequest(
    updateRoleScope,
    { role },
    (body) =>
      servicesRequest<PlatformAdministratorMutationResult, typeof body>(
        platformAdministratorPath(userId, "/role"),
        { method: "PUT", data: body },
      ),
    [userId],
  );
}

export function resetPlatformAdministratorPassword({
  userId,
  newPassword,
}: ResetPlatformAdministratorPasswordInput): Promise<PlatformAdministratorMutationResult> {
  return runIdempotentRequest(
    resetPasswordScope,
    { new_password: newPassword },
    (body) =>
      servicesRequest<PlatformAdministratorMutationResult, typeof body>(
        platformAdministratorPath(userId, "/reset-password"),
        { method: "POST", data: body },
      ),
    [userId],
  );
}

function runStatusOperation(
  userId: string,
  action: "disable" | "enable",
): Promise<PlatformAdministratorMutationResult> {
  const scope = action === "disable" ? disableScope : enableScope;
  return runIdempotentRequest(
    scope,
    {},
    (body) =>
      servicesRequest<PlatformAdministratorMutationResult, typeof body>(
        platformAdministratorPath(userId, `/${action}`),
        { method: "POST", data: body },
      ),
    [userId],
  );
}

export function disablePlatformAdministrator(userId: string) {
  return runStatusOperation(userId, "disable");
}

export function enablePlatformAdministrator(userId: string) {
  return runStatusOperation(userId, "enable");
}

export function deletePlatformAdministrator(
  userId: string,
): Promise<PlatformAdministratorMutationResult> {
  return runIdempotentRequest(
    deleteScope,
    {},
    (body) =>
      servicesRequest<PlatformAdministratorMutationResult, typeof body>(
        platformAdministratorPath(userId),
        { method: "DELETE", data: body },
      ),
    [userId],
  );
}

const platformAdministratorErrorMessages: Record<string, string> = {
  LAST_PLATFORM_ADMIN: "至少需要保留一名活跃的平台超级管理员",
  ROLE_CHANGE_INVALID: "当前账号状态不允许修改角色",
  PASSWORD_SAME_AS_OLD: "新密码不能与原密码相同",
  EMAIL_ALREADY_EXISTS: "该邮箱已被使用",
  USERNAME_ALREADY_EXISTS: "该用户名已被使用",
  ROLE_NOT_FOUND: "指定的平台角色不存在",
  PLATFORM_USER_NOT_FOUND: "平台运营账号不存在或已删除",
  FORBIDDEN: "当前账号没有执行此操作的权限",
};

export function getPlatformAdministratorErrorMessage(error: unknown) {
  const parsed = parseApiError(error);
  return (
    (parsed.code && platformAdministratorErrorMessages[parsed.code]) ||
    getApiErrorMessage(error, "平台运营账号操作失败，请稍后重试")
  );
}

export type {
  CreatePlatformAdministratorInput,
  PlatformAdministratorAuditLog,
  PlatformAdministratorDetail,
  PlatformAdministratorListFilters,
  PlatformAdministratorListItem,
  PlatformAdministratorMutationResult,
  PlatformAdministratorRole,
  PlatformAdministratorRoleDefinition,
  PlatformAdministratorSource,
  PlatformAdministratorStatus,
  PlatformPermissionAccess,
  ResetPlatformAdministratorPasswordInput,
  UpdatePlatformAdministratorRoleInput,
} from "./types";
