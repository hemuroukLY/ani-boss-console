import type { TenantAdminRole } from "@/components/tenant/model";

export interface InviteDraft {
  name: string;
  displayName: string;
  email: string;
  role: TenantAdminRole;
}

export const initialInviteDraft: InviteDraft = {
  name: "",
  displayName: "",
  email: "",
  role: "租户管理员",
};
