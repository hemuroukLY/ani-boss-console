export type PlatformAdministratorRole =
  "平台超级管理员" | "平台运维" | "平台只读";

export type PlatformAdministratorStatus = "active" | "invited" | "disabled";

export interface PlatformAdministrator {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: PlatformAdministratorRole;
  status: PlatformAdministratorStatus;
  source: "本地账号";
  mfa: boolean;
  lastLogin: string;
  invitedAt: string;
  lastPasswordReset: string;
  bootstrap: boolean;
}

export const platformAdministrators: PlatformAdministrator[] = [
  {
    id: "admin-001",
    username: "admin",
    displayName: "安装管理员",
    email: "admin@ani.local",
    role: "平台超级管理员",
    status: "active",
    source: "本地账号",
    mfa: true,
    lastLogin: "2026-09-04 10:18",
    invitedAt: "2026-07-01",
    lastPasswordReset: "2026-08-20 16:40",
    bootstrap: true,
  },
  {
    id: "admin-002",
    username: "liming.ops",
    displayName: "李明",
    email: "liming.ops@ani.local",
    role: "平台超级管理员",
    status: "active",
    source: "本地账号",
    mfa: true,
    lastLogin: "2026-09-04 09:56",
    invitedAt: "2026-07-08",
    lastPasswordReset: "2026-08-15 11:28",
    bootstrap: false,
  },
  {
    id: "admin-003",
    username: "zhou.nan",
    displayName: "周楠",
    email: "zhou.nan@ani.local",
    role: "平台运维",
    status: "active",
    source: "本地账号",
    mfa: true,
    lastLogin: "2026-09-04 10:11",
    invitedAt: "2026-07-18",
    lastPasswordReset: "2026-08-22 09:16",
    bootstrap: false,
  },
  {
    id: "admin-004",
    username: "wang.ke",
    displayName: "王珂",
    email: "wang.ke@ani.local",
    role: "平台只读",
    status: "active",
    source: "本地账号",
    mfa: false,
    lastLogin: "2026-09-04 09:35",
    invitedAt: "2026-08-03",
    lastPasswordReset: "2026-08-03 14:20",
    bootstrap: false,
  },
  {
    id: "admin-005",
    username: "chen.yu",
    displayName: "陈宇",
    email: "chen.yu@ani.local",
    role: "平台运维",
    status: "invited",
    source: "本地账号",
    mfa: false,
    lastLogin: "-",
    invitedAt: "2026-09-03",
    lastPasswordReset: "-",
    bootstrap: false,
  },
  {
    id: "admin-006",
    username: "audit.viewer",
    displayName: "审计访客",
    email: "audit.viewer@ani.local",
    role: "平台只读",
    status: "disabled",
    source: "本地账号",
    mfa: false,
    lastLogin: "2026-08-12 15:06",
    invitedAt: "2026-07-26",
    lastPasswordReset: "2026-07-26 10:30",
    bootstrap: false,
  },
];
