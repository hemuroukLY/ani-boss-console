import { coreRequest } from "@/api/request";
import type { PlatformAuditLogItem, PlatformAuditLogQuery, PlatformAuditLogResult } from "./types";

interface PlatformAuditLogResponse {
  items: Array<{
    audit_id: string;
    timestamp: string;
    verb: PlatformAuditLogItem["verb"];
    user: {
      username: string;
      groups: string[];
    };
    resource: {
      namespace: string;
      resource: string;
      name: string;
    };
    response_code: number;
    detail: {
      request_uri: string;
      user_agent: string;
    };
  }>;
  next_after: string | null;
  total_approx: number;
  dev_profile: {
    mode: string;
    provider: string;
    real_provider: boolean;
    reason: string | null;
  };
}

export const platformAuditQueryKeys = {
  list: (query: PlatformAuditLogQuery) => ["platform", "audit-logs", query] as const,
};

export async function fetchPlatformAuditLogs(
  query: PlatformAuditLogQuery,
): Promise<PlatformAuditLogResult> {
  const response = await coreRequest<PlatformAuditLogResponse>("/platform/audit-logs", {
    params: {
      time_from: query.timeFrom,
      time_to: query.timeTo,
      user: query.user,
      verb: query.verb,
      resource_type: query.resourceType,
      namespace: query.namespace,
      after: query.after,
      page_size: query.pageSize,
      keyword: query.keyword,
    },
  });

  return {
    items: (response.items || []).map((item) => ({
      auditId: item.audit_id,
      timestamp: item.timestamp,
      verb: item.verb,
      user: {
        username: item.user.username,
        groups: item.user.groups || [],
      },
      resource: {
        namespace: item.resource.namespace,
        resource: item.resource.resource,
        name: item.resource.name,
      },
      responseCode: item.response_code,
      detail: {
        requestUri: item.detail.request_uri,
        userAgent: item.detail.user_agent,
      },
    })),
    nextAfter: response.next_after || undefined,
    totalApprox: response.total_approx,
    profile: {
      mode: response.dev_profile.mode,
      provider: response.dev_profile.provider,
      realProvider: response.dev_profile.real_provider,
      reason: response.dev_profile.reason,
    },
  };
}

export type {
  PlatformAuditLogItem,
  PlatformAuditLogQuery,
  PlatformAuditLogResult,
  PlatformAuditVerb,
} from "./types";
