export type PlatformAuditVerb = "create" | "update" | "patch" | "delete";

export interface PlatformAuditLogQuery {
  timeFrom: string;
  timeTo: string;
  user?: string;
  verb?: PlatformAuditVerb;
  resourceType?: string;
  namespace?: string;
  after?: string;
  pageSize?: number;
  keyword?: string;
}

export interface PlatformAuditLogItem {
  auditId: string;
  timestamp: string;
  verb: PlatformAuditVerb;
  user: {
    username: string;
    groups: string[];
  };
  resource: {
    namespace: string;
    resource: string;
    name: string;
  };
  responseCode: number;
  detail: {
    requestUri: string;
    userAgent: string;
  };
}

export interface PlatformAuditLogResult {
  items: PlatformAuditLogItem[];
  nextAfter?: string;
  totalApprox: number;
  profile: {
    mode: string;
    provider: string;
    realProvider: boolean;
    reason: string | null;
  };
}
