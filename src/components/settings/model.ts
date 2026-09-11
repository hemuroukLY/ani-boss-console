import type {
  PlatformAdministratorRole,
  PlatformAdministratorSource,
  PlatformAdministratorStatus,
  PlatformPermissionAccess,
} from "@/api/platform-admins";

export const platformAdministratorRoleLabels: Record<PlatformAdministratorRole, string> = {
  "platform-admin": "平台超级管理员",
  "platform-ops": "平台运维",
  "platform-readonly": "平台只读",
};

export const platformAdministratorStatusLabels: Record<PlatformAdministratorStatus, string> = {
  active: "活跃",
  disabled: "已禁用",
};

export const platformAdministratorSourceLabels: Record<PlatformAdministratorSource, string> = {
  local: "本地账号",
  third_party: "第三方账号",
};

export const platformPermissionAccessLabels: Record<PlatformPermissionAccess, string> = {
  read: "只读",
  write: "读写",
  none: "无权限",
};
