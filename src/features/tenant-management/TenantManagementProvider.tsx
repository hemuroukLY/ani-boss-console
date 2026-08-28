import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getTenantUsageBreakdown,
  initialTenantAdmins,
  initialTenantBillings,
  initialTenants,
  tenantQuotaPackages,
  tenantRegions,
  type Tenant,
  type TenantAdmin,
  type TenantAdminRole,
  type TenantBilling,
  type TenantDraft,
  type TenantLifecycleEvent,
  type TenantOperation,
  type TenantQuotaRequestStatus,
  type TenantSsoStatus,
  type TenantStatus,
} from "./model";

interface CreateTenantResult {
  ok: boolean;
  reason?: string;
  tenant?: Tenant;
}

export type TenantAdminAction =
  | "resend_invite"
  | "accept_invite"
  | "reset_password"
  | "change_role"
  | "disable"
  | "enable"
  | "transfer_owner"
  | "impersonate";

export interface TenantAdminActionResult {
  ok: boolean;
  reason?: string;
}

export type TenantBillingAction =
  | "refresh_usage"
  | "adjust_credit"
  | "generate_invoice"
  | "mark_settled"
  | "export_statement";

export interface TenantBillingActionResult {
  ok: boolean;
  reason?: string;
  message?: string;
}

export type TenantLifecycleAction =
  | "suspend"
  | "resume"
  | "disable"
  | "extend_trial"
  | "convert_trial"
  | "simulate_trial_expiry"
  | "update_arrears_policy"
  | "simulate_overdue";

export interface TenantLifecycleActionResult {
  ok: boolean;
  reason?: string;
  message?: string;
}

interface TenantManagementContextValue {
  tenants: Tenant[];
  tenantAdmins: TenantAdmin[];
  tenantBillings: TenantBilling[];
  createTenant: (draft: TenantDraft) => CreateTenantResult;
  toggleTenantStatus: (tenantId: string) => TenantStatus | undefined;
  disableTenant: (tenantId: string) => boolean;
  updateTenantIdentity: (
    tenantId: string,
    patch: Partial<{
      ssoEnabled: boolean;
      ssoProvider: string;
      ssoStatus: TenantSsoStatus;
      ssoLastTestAt: string | undefined;
      forceMfa: boolean;
      region: string;
      regionName: string;
    }>,
  ) => boolean;
  rebindTenantQuotaPackage: (tenantId: string, planCode: string) => boolean;
  submitTenantQuotaRequest: (
    tenantId: string,
    draft: {
      requestedGpuHours: number;
      requestedStorageGi: number;
      reason: string;
      by: string;
    },
  ) => boolean;
  resolveTenantQuotaRequest: (
    tenantId: string,
    requestId: string,
    status: Extract<TenantQuotaRequestStatus, "approved" | "rejected">,
    rejectReason?: string,
  ) => boolean;
  refreshTenantUsage: (tenantId: string) => boolean;
  inviteTenantAdmin: (
    tenantId: string,
    draft: {
      name: string;
      displayName: string;
      email: string;
      role: TenantAdminRole;
    },
  ) => TenantAdminActionResult;
  applyTenantAdminAction: (
    adminId: string,
    action: TenantAdminAction,
    options?: { role?: TenantAdminRole; password?: string },
  ) => TenantAdminActionResult;
  applyTenantBillingAction: (
    tenantId: string,
    action: TenantBillingAction,
    options?: { amountUsd?: number; reason?: string },
  ) => TenantBillingActionResult;
  applyTenantLifecycleAction: (
    tenantId: string,
    action: TenantLifecycleAction,
    options?: {
      reason?: string;
      confirmName?: string;
      force?: boolean;
      planCode?: string;
      graceDays?: number;
      autoSuspend?: boolean;
      emailNotification?: boolean;
    },
  ) => TenantLifecycleActionResult;
}

const TenantManagementContext =
  createContext<TenantManagementContextValue | null>(null);

function formatCreatedAt() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function createLifecycleEvent(
  event: TenantLifecycleEvent["event"],
  message: string,
  by = "platform-admin",
): TenantLifecycleEvent {
  return {
    id: `lifecycle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: formatCreatedAt(),
    event,
    by,
    message,
  };
}

function appendTenantOperation(
  tenant: Tenant,
  operation: string,
  message: string,
  by = "platform-admin",
): Tenant {
  const operationRecord: TenantOperation = {
    id: `operation-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    operation,
    status: "success",
    message,
    createdAt: formatCreatedAt(),
    by,
  };

  return {
    ...tenant,
    operations: [operationRecord, ...tenant.operations].slice(0, 40),
  };
}

function formatLifecycleDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TenantManagementProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [tenantAdmins, setTenantAdmins] =
    useState<TenantAdmin[]>(initialTenantAdmins);
  const [tenantBillings, setTenantBillings] = useState<TenantBilling[]>(
    initialTenantBillings,
  );

  const value = useMemo<TenantManagementContextValue>(
    () => ({
      tenants,
      tenantAdmins,
      tenantBillings,
      createTenant: (draft) => {
        if (tenants.some((tenant) => tenant.name === draft.name.trim())) {
          return { ok: false, reason: "租户标识已存在" };
        }

        const region = tenantRegions.find(
          (item) => item.value === draft.region,
        );
        const quotaPackage =
          tenantQuotaPackages.find(
            (item) =>
              item.status === "enabled" && item.name === draft.quotaPackage,
          ) ?? tenantQuotaPackages[0];
        const tenantId = `tn-${Date.now()}`;
        const tenant: Tenant = {
          id: tenantId,
          name: draft.name.trim(),
          displayName: draft.displayName.trim(),
          status: "active",
          specification: "—",
          quotaPackage: quotaPackage.name,
          planCode: quotaPackage.planCode,
          memberCount: 0,
          adminCount: draft.adminEmail ? 1 : 0,
          balanceUsd: 0,
          creditUsd: 0,
          region: draft.region,
          regionName: region?.label ?? draft.region,
          isTrial: draft.isTrial || quotaPackage.isTrial,
          createdAt: formatCreatedAt(),
          contact: draft.contact.trim(),
          industry: draft.industry.trim() || "通用",
          ssoEnabled: false,
          ssoProvider: "—",
          ssoStatus: "disconnected",
          forceMfa: false,
          arrearsPolicy: {
            graceDays: 7,
            autoSuspend: true,
            emailNotification: true,
          },
          lifecycle: [
            {
              id: `lifecycle-${tenantId}-created`,
              at: formatCreatedAt(),
              event: "created",
              by: "system",
              message: "租户开通",
            },
          ],
          operations: [
            {
              id: `operation-${tenantId}-created`,
              operation: "create",
              status: "success",
              message: "租户开通完成",
              createdAt: formatCreatedAt(),
              by: "platform-admin",
            },
          ],
          resourceSummary: { vms: 0, inferences: 0, models: 0, kbs: 0 },
          usage: {
            gpuHours: 0,
            cpuHours: 0,
            storageGi: 0,
            tokens: 0,
            kbQueries: 0,
          },
          quotaLimits: { ...quotaPackage.limits },
          quotaRequests: [],
        };

        setTenants((current) => [tenant, ...current]);
        setTenantBillings((current) => [
          {
            id: `billing-${tenantId}`,
            tenantId,
            tenantName: tenant.name,
            status: "current",
            period: formatCreatedAt().slice(0, 7),
            usageCostUsd: 0,
            creditUsd: 0,
            balanceUsd: 0,
            dueDate: "—",
            usageBreakdown: getTenantUsageBreakdown(tenant.usage),
            adjustments: [],
            invoices: [],
            updatedAt: formatCreatedAt(),
          },
          ...current,
        ]);
        if (draft.adminEmail.trim()) {
          setTenantAdmins((current) => [
            {
              id: `tadm-${Date.now()}`,
              tenantId,
              tenantName: tenant.name,
              name: draft.adminName.trim() || draft.adminEmail.split("@")[0],
              displayName:
                draft.adminName.trim() || draft.adminEmail.split("@")[0],
              email: draft.adminEmail.trim(),
              role: "租户所有者",
              status: "invited",
              source: "本地",
              lastLogin: "—",
              mfa: false,
              invitedAt: formatCreatedAt().slice(0, 10),
            },
            ...current,
          ]);
        }
        return { ok: true, tenant };
      },
      toggleTenantStatus: (tenantId) => {
        const currentTenant = tenants.find((tenant) => tenant.id === tenantId);
        if (!currentTenant || currentTenant.status === "disabled") return;
        if (
          currentTenant.status === "suspended" &&
          currentTenant.balanceUsd < 0
        ) {
          return;
        }
        const nextStatus =
          currentTenant.status === "suspended" ? "active" : "suspended";
        setTenants((current) =>
          current.map((tenant) =>
            tenant.id === tenantId
              ? appendTenantOperation(
                  {
                    ...tenant,
                    status: nextStatus,
                    suspendedAt:
                      nextStatus === "suspended"
                        ? formatCreatedAt()
                        : undefined,
                    suspendReason:
                      nextStatus === "suspended" ? "运营冻结" : undefined,
                    lifecycle: [
                      createLifecycleEvent(
                        nextStatus === "suspended" ? "suspended" : "resumed",
                        nextStatus === "suspended" ? "运营冻结" : "解冻恢复",
                      ),
                      ...tenant.lifecycle,
                    ],
                  },
                  nextStatus === "suspended" ? "suspend" : "resume",
                  nextStatus === "suspended" ? "运营冻结" : "解冻恢复",
                )
              : tenant,
          ),
        );
        return nextStatus;
      },
      disableTenant: (tenantId) => {
        if (!tenants.some((tenant) => tenant.id === tenantId)) return false;
        setTenants((current) =>
          current.map((tenant) =>
            tenant.id === tenantId
              ? appendTenantOperation(
                  {
                    ...tenant,
                    status: "disabled",
                    adminCount: 0,
                    disabledAt: formatCreatedAt(),
                    resourceSummary: {
                      vms: 0,
                      inferences: 0,
                      models: 0,
                      kbs: 0,
                    },
                    lifecycle: [
                      createLifecycleEvent(
                        "disabled",
                        "租户禁用并清理名下资源",
                      ),
                      ...tenant.lifecycle,
                    ],
                  },
                  "disable",
                  "租户禁用，名下资源已清理",
                )
              : tenant,
          ),
        );
        return true;
      },
      updateTenantIdentity: (tenantId, patch) => {
        if (!tenants.some((tenant) => tenant.id === tenantId)) return false;
        setTenants((current) =>
          current.map((tenant) =>
            tenant.id === tenantId
              ? appendTenantOperation(
                  { ...tenant, ...patch },
                  "update_profile",
                  "租户资料已更新",
                )
              : tenant,
          ),
        );
        return true;
      },
      rebindTenantQuotaPackage: (tenantId, planCode) => {
        const quotaPackage = tenantQuotaPackages.find(
          (item) => item.planCode === planCode && item.status === "enabled",
        );
        if (
          !quotaPackage ||
          !tenants.some((tenant) => tenant.id === tenantId)
        ) {
          return false;
        }
        setTenants((current) =>
          current.map((tenant) =>
            tenant.id === tenantId
              ? appendTenantOperation(
                  {
                    ...tenant,
                    quotaPackage: quotaPackage.name,
                    planCode: quotaPackage.planCode,
                    isTrial: quotaPackage.isTrial,
                  },
                  "rebind_quota",
                  `改绑套餐 ${quotaPackage.name}（保留现有配额上限）`,
                )
              : tenant,
          ),
        );
        return true;
      },
      submitTenantQuotaRequest: (tenantId, draft) => {
        const currentTenant = tenants.find((tenant) => tenant.id === tenantId);
        if (!currentTenant) return false;
        setTenants((current) =>
          current.map((tenant) =>
            tenant.id === tenantId
              ? appendTenantOperation(
                  {
                    ...tenant,
                    quotaRequests: [
                      {
                        id: `qr-${Date.now()}`,
                        status: "pending",
                        requestedAt: formatCreatedAt(),
                        by: draft.by,
                        reason: draft.reason,
                        currentGpuHours: tenant.quotaLimits.gpuHours,
                        requestedGpuHours: draft.requestedGpuHours,
                        currentStorageGi: tenant.quotaLimits.storageGi,
                        requestedStorageGi: draft.requestedStorageGi,
                      },
                      ...tenant.quotaRequests,
                    ],
                  },
                  "submit_quota_request",
                  "提交配额扩容申请",
                  draft.by,
                )
              : tenant,
          ),
        );
        return true;
      },
      resolveTenantQuotaRequest: (
        tenantId,
        requestId,
        requestStatus,
        rejectReason,
      ) => {
        const currentTenant = tenants.find((tenant) => tenant.id === tenantId);
        const request = currentTenant?.quotaRequests.find(
          (item) => item.id === requestId && item.status === "pending",
        );
        if (!currentTenant || !request) return false;
        setTenants((current) =>
          current.map((tenant) => {
            if (tenant.id !== tenantId) return tenant;
            return appendTenantOperation(
              {
                ...tenant,
                quotaLimits:
                  requestStatus === "approved"
                    ? {
                        ...tenant.quotaLimits,
                        gpuHours: request.requestedGpuHours,
                        storageGi: request.requestedStorageGi,
                      }
                    : tenant.quotaLimits,
                quotaRequests: tenant.quotaRequests.map((item) =>
                  item.id === requestId
                    ? {
                        ...item,
                        status: requestStatus,
                        resolvedAt: formatCreatedAt(),
                        rejectReason:
                          requestStatus === "rejected"
                            ? rejectReason
                            : undefined,
                      }
                    : item,
                ),
              },
              requestStatus === "approved"
                ? "approve_quota_request"
                : "reject_quota_request",
              requestStatus === "approved"
                ? "配额扩容申请已通过"
                : `配额扩容申请已驳回${rejectReason ? `：${rejectReason}` : ""}`,
            );
          }),
        );
        return true;
      },
      refreshTenantUsage: (tenantId) => {
        if (!tenants.some((tenant) => tenant.id === tenantId)) return false;
        setTenants((current) =>
          current.map((tenant) =>
            tenant.id === tenantId
              ? appendTenantOperation(
                  {
                    ...tenant,
                    usage: {
                      ...tenant.usage,
                      gpuHours: Math.round(tenant.usage.gpuHours * 1.02 + 3),
                      cpuHours: Math.round(tenant.usage.cpuHours * 1.01 + 10),
                      tokens: Math.round(tenant.usage.tokens * 1.03 + 1000),
                    },
                  },
                  "refresh_usage",
                  "租户用量已刷新",
                )
              : tenant,
          ),
        );
        return true;
      },
      inviteTenantAdmin: (tenantId, draft) => {
        const tenant = tenants.find((item) => item.id === tenantId);
        if (!tenant) return { ok: false, reason: "租户不存在" };
        if (tenant.status === "disabled") {
          return { ok: false, reason: "禁用租户不能邀请管理员" };
        }
        const email = draft.email.trim().toLowerCase();
        if (
          tenantAdmins.some(
            (admin) =>
              admin.tenantId === tenantId &&
              admin.email.toLowerCase() === email,
          )
        ) {
          return { ok: false, reason: "该邮箱已是当前租户管理员" };
        }
        if (tenant.adminCount >= tenant.quotaLimits.maxMembers) {
          return { ok: false, reason: "管理员数量已达到成员配额上限" };
        }
        setTenantAdmins((current) => [
          {
            id: `tadm-${Date.now()}`,
            tenantId,
            tenantName: tenant.name,
            name: draft.name.trim() || email.split("@")[0],
            displayName:
              draft.displayName.trim() ||
              draft.name.trim() ||
              email.split("@")[0],
            email,
            role: draft.role,
            status: "invited",
            source: "本地",
            lastLogin: "—",
            mfa: false,
            invitedAt: formatCreatedAt().slice(0, 10),
          },
          ...current,
        ]);
        setTenants((current) =>
          current.map((item) =>
            item.id === tenantId
              ? appendTenantOperation(
                  { ...item, adminCount: item.adminCount + 1 },
                  "invite_admin",
                  `邀请管理员 ${email}`,
                )
              : item,
          ),
        );
        return { ok: true };
      },
      applyTenantAdminAction: (adminId, action, options = {}) => {
        const admin = tenantAdmins.find((item) => item.id === adminId);
        if (!admin) return { ok: false, reason: "管理员不存在" };
        const tenant = tenants.find((item) => item.id === admin.tenantId);
        if (!tenant) return { ok: false, reason: "所属租户不存在" };
        const activeOwners = tenantAdmins.filter(
          (item) =>
            item.tenantId === tenant.id &&
            item.role === "租户所有者" &&
            item.status === "active",
        );
        const isOnlyActiveOwner =
          admin.role === "租户所有者" &&
          admin.status === "active" &&
          activeOwners.length === 1;

        if (action === "resend_invite") {
          if (admin.status !== "invited") {
            return { ok: false, reason: "仅邀请中的账号可以重发邀请" };
          }
          setTenantAdmins((current) =>
            current.map((item) =>
              item.id === adminId
                ? { ...item, invitedAt: formatCreatedAt().slice(0, 10) }
                : item,
            ),
          );
          return { ok: true };
        }

        if (action === "accept_invite") {
          if (admin.status !== "invited") {
            return { ok: false, reason: "该邀请无需再次接受" };
          }
          setTenantAdmins((current) =>
            current.map((item) =>
              item.id === adminId
                ? {
                    ...item,
                    status: "active",
                    lastLogin: formatCreatedAt(),
                    mfa: tenant.forceMfa,
                  }
                : item,
            ),
          );
          setTenants((current) =>
            current.map((item) =>
              item.id === tenant.id
                ? { ...item, memberCount: item.memberCount + 1 }
                : item,
            ),
          );
          return { ok: true };
        }

        if (action === "reset_password") {
          if (admin.status === "invited") {
            return { ok: false, reason: "邀请中的账号请先接受邀请" };
          }
          if (admin.status === "disabled") {
            return { ok: false, reason: "已禁用账号不可重置密码" };
          }
          if (tenant.status !== "active") {
            return { ok: false, reason: "冻结或禁用租户不可重置密码" };
          }
          if (!options.password || options.password.length < 8) {
            return { ok: false, reason: "密码至少 8 位" };
          }
          setTenantAdmins((current) =>
            current.map((item) =>
              item.id === adminId
                ? { ...item, lastResetAt: formatCreatedAt() }
                : item,
            ),
          );
          return { ok: true };
        }

        if (action === "change_role") {
          if (!options.role) return { ok: false, reason: "请选择角色" };
          if (isOnlyActiveOwner && options.role !== "租户所有者") {
            return { ok: false, reason: "至少保留一名活跃的租户所有者" };
          }
          setTenantAdmins((current) =>
            current.map((item) =>
              item.id === adminId ? { ...item, role: options.role! } : item,
            ),
          );
          return { ok: true };
        }

        if (action === "disable") {
          if (isOnlyActiveOwner) {
            return { ok: false, reason: "至少保留一名活跃的租户所有者" };
          }
          setTenantAdmins((current) =>
            current.map((item) =>
              item.id === adminId ? { ...item, status: "disabled" } : item,
            ),
          );
          return { ok: true };
        }

        if (action === "enable") {
          if (tenant.status !== "active") {
            return { ok: false, reason: "冻结或禁用租户不能启用管理员" };
          }
          setTenantAdmins((current) =>
            current.map((item) =>
              item.id === adminId ? { ...item, status: "active" } : item,
            ),
          );
          return { ok: true };
        }

        if (action === "transfer_owner") {
          if (admin.status !== "active") {
            return { ok: false, reason: "仅活跃管理员可以接受所有者移交" };
          }
          if (isOnlyActiveOwner) {
            return { ok: false, reason: "该管理员已经是唯一所有者" };
          }
          setTenantAdmins((current) =>
            current.map((item) => {
              if (item.tenantId !== tenant.id) return item;
              if (item.id === adminId) return { ...item, role: "租户所有者" };
              return item.role === "租户所有者"
                ? { ...item, role: "租户管理员" }
                : item;
            }),
          );
          return { ok: true };
        }

        if (action === "impersonate") {
          if (tenant.status === "disabled") {
            return { ok: false, reason: "禁用租户不可模拟登录" };
          }
          if (admin.status !== "active") {
            return { ok: false, reason: "仅活跃管理员可以模拟登录" };
          }
          return { ok: true };
        }

        return { ok: false, reason: "不支持的管理员操作" };
      },
      applyTenantBillingAction: (tenantId, action, options = {}) => {
        const tenant = tenants.find((item) => item.id === tenantId);
        const billing = tenantBillings.find(
          (item) => item.tenantId === tenantId,
        );
        if (!tenant || !billing) {
          return { ok: false, reason: "未找到租户计费账户" };
        }

        if (action === "refresh_usage") {
          const nextUsage = {
            ...tenant.usage,
            gpuHours: Math.round(tenant.usage.gpuHours * 1.02 + 3),
            cpuHours: Math.round(tenant.usage.cpuHours * 1.01 + 10),
            tokens: Math.round(tenant.usage.tokens * 1.03 + 1000),
          };
          const usageBreakdown = getTenantUsageBreakdown(nextUsage);
          const usageCostUsd = Number(
            usageBreakdown
              .reduce((total, item) => total + item.cost, 0)
              .toFixed(2),
          );
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId ? { ...item, usage: nextUsage } : item,
            ),
          );
          setTenantBillings((current) =>
            current.map((item) =>
              item.tenantId === tenantId
                ? {
                    ...item,
                    usageCostUsd,
                    usageBreakdown,
                    updatedAt: formatCreatedAt(),
                  }
                : item,
            ),
          );
          return { ok: true, message: "本期用量与费用已刷新" };
        }

        if (action === "adjust_credit") {
          const amountUsd = Number(options.amountUsd) || 0;
          if (!amountUsd) {
            return { ok: false, reason: "调账金额不能为 0" };
          }
          const reason = options.reason?.trim() || "人工调账";
          const nextBalance = Number(
            (billing.balanceUsd + amountUsd).toFixed(2),
          );
          const nextCredit = Number(
            (billing.creditUsd + Math.max(0, amountUsd)).toFixed(2),
          );
          const nextStatus =
            nextBalance < 0
              ? "overdue"
              : amountUsd > 0
                ? "credited"
                : billing.status;
          setTenantBillings((current) =>
            current.map((item) =>
              item.tenantId === tenantId
                ? {
                    ...item,
                    status: nextStatus,
                    balanceUsd: nextBalance,
                    creditUsd: nextCredit,
                    adjustments: [
                      {
                        id: `adjustment-${Date.now()}`,
                        at: formatCreatedAt(),
                        amountUsd,
                        reason,
                        by: "finance",
                      },
                      ...item.adjustments,
                    ],
                    updatedAt: formatCreatedAt(),
                  }
                : item,
            ),
          );
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? {
                    ...item,
                    balanceUsd: nextBalance,
                    creditUsd: nextCredit,
                  }
                : item,
            ),
          );
          return { ok: true, message: "授信调账已生效" };
        }

        if (action === "generate_invoice") {
          const issuedAt = formatCreatedAt();
          const invoiceNo = `INV-${issuedAt.slice(2, 7).replace("-", "")}-${String(Math.floor(Math.random() * 90) + 10)}`;
          setTenantBillings((current) =>
            current.map((item) =>
              item.tenantId === tenantId
                ? {
                    ...item,
                    status: "current",
                    invoiceNo,
                    invoices: [
                      {
                        id: `invoice-${Date.now()}`,
                        no: invoiceNo,
                        period: item.period,
                        amountUsd: item.usageCostUsd,
                        status: "issued",
                        issuedAt: issuedAt.slice(0, 10),
                      },
                      ...item.invoices,
                    ],
                    updatedAt: formatCreatedAt(),
                  }
                : item,
            ),
          );
          return { ok: true, message: `发票 ${invoiceNo} 已生成` };
        }

        if (action === "mark_settled") {
          const nextBalance = Math.max(0, billing.balanceUsd);
          const shouldResume =
            tenant.status === "suspended" && billing.balanceUsd < 0;
          setTenantBillings((current) =>
            current.map((item) =>
              item.tenantId === tenantId
                ? {
                    ...item,
                    status: "settled",
                    balanceUsd: nextBalance,
                    updatedAt: formatCreatedAt(),
                  }
                : item,
            ),
          );
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? {
                    ...item,
                    balanceUsd: nextBalance,
                    status: shouldResume ? "active" : item.status,
                    suspendedAt: shouldResume ? undefined : item.suspendedAt,
                    suspendReason: shouldResume
                      ? undefined
                      : item.suspendReason,
                    lifecycle: shouldResume
                      ? [
                          createLifecycleEvent(
                            "resumed",
                            "欠费账单结清，自动解冻",
                            "system",
                          ),
                          ...item.lifecycle,
                        ]
                      : item.lifecycle,
                  }
                : item,
            ),
          );
          return { ok: true, message: "账单已标记结清" };
        }

        if (action === "export_statement") {
          return {
            ok: true,
            message: `已导出 ${tenant.name} ${billing.period} 对账单`,
          };
        }

        return { ok: false, reason: "不支持的计费操作" };
      },
      applyTenantLifecycleAction: (tenantId, action, options = {}) => {
        const tenant = tenants.find((item) => item.id === tenantId);
        if (!tenant) return { ok: false, reason: "租户不存在" };

        if (action === "suspend") {
          if (tenant.status !== "active") {
            return { ok: false, reason: "仅活跃租户可以冻结" };
          }
          const reason = options.reason?.trim() || "运营冻结";
          const suspendedAt = formatCreatedAt();
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? appendTenantOperation(
                    {
                      ...item,
                      status: "suspended",
                      suspendedAt,
                      suspendReason: reason,
                      lifecycle: [
                        createLifecycleEvent("suspended", reason),
                        ...item.lifecycle,
                      ],
                    },
                    "suspend",
                    reason,
                  )
                : item,
            ),
          );
          return { ok: true, message: "租户已冻结" };
        }

        if (action === "resume") {
          if (tenant.status !== "suspended") {
            return { ok: false, reason: "仅冻结租户可以解冻" };
          }
          if (tenant.balanceUsd < 0 && options.force !== true) {
            return {
              ok: false,
              reason: "账户仍欠费，请先调账或勾选强制解冻",
            };
          }
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? appendTenantOperation(
                    {
                      ...item,
                      status: "active",
                      suspendedAt: undefined,
                      suspendReason: undefined,
                      lifecycle: [
                        createLifecycleEvent("resumed", "解冻恢复"),
                        ...item.lifecycle,
                      ],
                    },
                    "resume",
                    options.force ? "强制解冻恢复" : "解冻恢复",
                  )
                : item,
            ),
          );
          return { ok: true, message: "租户已解冻" };
        }

        if (action === "disable") {
          if (tenant.status === "disabled") {
            return { ok: false, reason: "租户已禁用" };
          }
          if (options.confirmName?.trim() !== tenant.name) {
            return { ok: false, reason: "请输入正确的租户标识" };
          }
          const disabledAt = formatCreatedAt();
          const reason = options.reason?.trim() || "租户禁用并清理名下资源";
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? appendTenantOperation(
                    {
                      ...item,
                      status: "disabled",
                      adminCount: 0,
                      disabledAt,
                      resourceSummary: {
                        vms: 0,
                        inferences: 0,
                        models: 0,
                        kbs: 0,
                      },
                      lifecycle: [
                        createLifecycleEvent("disabled", reason),
                        ...item.lifecycle,
                      ],
                    },
                    "disable",
                    reason,
                  )
                : item,
            ),
          );
          return { ok: true, message: "租户已禁用，名下资源已清理" };
        }

        if (action === "extend_trial") {
          if (!tenant.isTrial) {
            return { ok: false, reason: "仅试用租户可以延期" };
          }
          const currentEnd = tenant.trialEndsAt
            ? new Date(tenant.trialEndsAt.replace(" ", "T"))
            : new Date();
          const start =
            Number.isNaN(currentEnd.getTime()) || currentEnd < new Date()
              ? new Date()
              : currentEnd;
          const nextEnd = new Date(start);
          nextEnd.setDate(nextEnd.getDate() + 14);
          const trialEndsAt = formatLifecycleDate(nextEnd);
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? appendTenantOperation(
                    {
                      ...item,
                      trialEndsAt,
                      lifecycle: [
                        createLifecycleEvent(
                          "trial_extended",
                          `试用延期 14 天，新的到期时间 ${trialEndsAt}`,
                        ),
                        ...item.lifecycle,
                      ],
                    },
                    "extend_trial",
                    `试用延期至 ${trialEndsAt}`,
                  )
                : item,
            ),
          );
          return { ok: true, message: `试用已延期至 ${trialEndsAt}` };
        }

        if (action === "convert_trial") {
          if (!tenant.isTrial) {
            return { ok: false, reason: "仅试用租户可以转正式" };
          }
          const quotaPackage = tenantQuotaPackages.find(
            (item) =>
              item.planCode === (options.planCode || "std") &&
              item.status === "enabled" &&
              !item.isTrial,
          );
          if (!quotaPackage) {
            return { ok: false, reason: "请选择已发布的正式套餐" };
          }
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? appendTenantOperation(
                    {
                      ...item,
                      isTrial: false,
                      trialEndsAt: undefined,
                      quotaPackage: quotaPackage.name,
                      planCode: quotaPackage.planCode,
                      lifecycle: [
                        createLifecycleEvent(
                          "trial_converted",
                          `试用转正式，改绑套餐 ${quotaPackage.name}（保留现有配额上限）`,
                        ),
                        ...item.lifecycle,
                      ],
                    },
                    "convert_trial",
                    `试用转正式，改绑套餐 ${quotaPackage.name}`,
                  )
                : item,
            ),
          );
          return { ok: true, message: "租户已转为正式租户" };
        }

        if (action === "simulate_trial_expiry") {
          if (!tenant.isTrial) {
            return { ok: false, reason: "仅试用租户可以模拟到期" };
          }
          if (tenant.status === "disabled") {
            return { ok: false, reason: "禁用租户不能模拟到期" };
          }
          const suspendedAt = formatCreatedAt();
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? appendTenantOperation(
                    {
                      ...item,
                      status: "suspended",
                      suspendedAt,
                      suspendReason: "试用到期自动冻结",
                      lifecycle: [
                        createLifecycleEvent(
                          "trial_expired",
                          "试用到期，租户自动冻结",
                          "system",
                        ),
                        ...item.lifecycle,
                      ],
                    },
                    "simulate_trial_expiry",
                    "试用到期，租户自动冻结",
                    "system",
                  )
                : item,
            ),
          );
          return { ok: true, message: "已模拟试用到期并自动冻结" };
        }

        if (action === "update_arrears_policy") {
          const graceDays = Number(options.graceDays);
          if (!Number.isFinite(graceDays) || graceDays < 0) {
            return { ok: false, reason: "宽限天数不能小于 0" };
          }
          const autoSuspend = options.autoSuspend ?? true;
          const emailNotification = options.emailNotification ?? true;
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? appendTenantOperation(
                    {
                      ...item,
                      arrearsPolicy: {
                        graceDays: Math.round(graceDays),
                        autoSuspend,
                        emailNotification,
                      },
                      lifecycle: [
                        createLifecycleEvent(
                          "arrears_policy_updated",
                          `欠费宽限 ${Math.round(graceDays)} 天 · 自动冻结${autoSuspend ? "开启" : "关闭"} · 邮件通知${emailNotification ? "开启" : "关闭"}`,
                        ),
                        ...item.lifecycle,
                      ],
                    },
                    "update_arrears_policy",
                    `欠费宽限 ${Math.round(graceDays)} 天 · 自动冻结${autoSuspend ? "开启" : "关闭"} · 邮件通知${emailNotification ? "开启" : "关闭"}`,
                  )
                : item,
            ),
          );
          return { ok: true, message: "欠费策略已更新" };
        }

        if (action === "simulate_overdue") {
          if (tenant.status === "disabled") {
            return { ok: false, reason: "禁用租户不能模拟欠费" };
          }
          const nextBalance = tenant.balanceUsd < 0 ? tenant.balanceUsd : -100;
          const autoSuspend = tenant.arrearsPolicy.autoSuspend;
          setTenantBillings((current) =>
            current.map((item) =>
              item.tenantId === tenantId
                ? {
                    ...item,
                    status: "overdue",
                    balanceUsd: nextBalance,
                    updatedAt: formatCreatedAt(),
                  }
                : item,
            ),
          );
          setTenants((current) =>
            current.map((item) =>
              item.id === tenantId
                ? appendTenantOperation(
                    {
                      ...item,
                      balanceUsd: nextBalance,
                      status: autoSuspend ? "suspended" : item.status,
                      suspendedAt: autoSuspend
                        ? formatCreatedAt()
                        : item.suspendedAt,
                      suspendReason: autoSuspend
                        ? "欠费自动冻结"
                        : item.suspendReason,
                      lifecycle: [
                        createLifecycleEvent(
                          autoSuspend
                            ? "overdue_suspended"
                            : "overdue_detected",
                          autoSuspend
                            ? `超过 ${item.arrearsPolicy.graceDays} 天宽限期，欠费自动冻结`
                            : "检测到欠费，自动冻结策略未开启",
                          "system",
                        ),
                        ...item.lifecycle,
                      ],
                    },
                    "simulate_overdue",
                    autoSuspend
                      ? "检测到欠费，租户自动冻结"
                      : "检测到欠费，自动冻结策略未开启",
                    "system",
                  )
                : item,
            ),
          );
          return {
            ok: true,
            message: autoSuspend
              ? "已模拟欠费并自动冻结租户"
              : "已模拟欠费，当前策略未自动冻结租户",
          };
        }

        return { ok: false, reason: "不支持的生命周期操作" };
      },
    }),
    [tenantAdmins, tenantBillings, tenants],
  );

  return (
    <TenantManagementContext.Provider value={value}>
      {children}
    </TenantManagementContext.Provider>
  );
}

export function useTenantManagement() {
  const context = useContext(TenantManagementContext);
  if (!context) {
    throw new Error(
      "useTenantManagement 必须在 TenantManagementProvider 内使用",
    );
  }
  return context;
}
