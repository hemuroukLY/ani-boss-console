import { useMemo, useState } from "react";
import { Button, Message, Modal, Typography } from "@arco-design/web-react";
import {
  useTenantManagement,
  type TenantAdminAction,
} from "@/components/tenant/TenantManagementProvider";
import type {
  Tenant,
  TenantAdmin,
  TenantAdminRole,
} from "@/components/tenant/model";
import { AdministratorPasswordModal } from "./AdministratorPasswordModal";
import { AdministratorRoleModal } from "./AdministratorRoleModal";
import { AdministratorTable } from "./AdministratorTable";
import { InviteAdministratorModal } from "./InviteAdministratorModal";
import { initialInviteDraft, type InviteDraft } from "./types";

interface TenantAdministratorsProps {
  tenant: Tenant;
}

export function TenantAdministrators({ tenant }: TenantAdministratorsProps) {
  const { tenantAdmins, inviteTenantAdmin, applyTenantAdminAction } =
    useTenantManagement();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteDraft, setInviteDraft] =
    useState<InviteDraft>(initialInviteDraft);
  const [roleAdmin, setRoleAdmin] = useState<TenantAdmin>();
  const [selectedRole, setSelectedRole] =
    useState<TenantAdminRole>("租户管理员");
  const [passwordAdmin, setPasswordAdmin] = useState<TenantAdmin>();
  const [newPassword, setNewPassword] = useState("");
  const admins = useMemo(
    () => tenantAdmins.filter((admin) => admin.tenantId === tenant.id),
    [tenant.id, tenantAdmins],
  );

  const showActionResult = (
    result: { ok: boolean; reason?: string },
    successMessage: string,
  ) => {
    if (result.ok) {
      Message.success(successMessage);
      return true;
    }
    Message.error(result.reason || "操作失败");
    return false;
  };

  const confirmInvite = () => {
    if (!inviteDraft.email.trim() || !inviteDraft.email.includes("@")) {
      Message.warning("请输入有效邮箱");
      return;
    }
    const result = inviteTenantAdmin(tenant.id, inviteDraft);
    if (showActionResult(result, "管理员邀请已发送")) {
      setInviteModalVisible(false);
      setInviteDraft(initialInviteDraft);
    }
  };

  const confirmRoleChange = () => {
    if (!roleAdmin) return;
    const result = applyTenantAdminAction(roleAdmin.id, "change_role", {
      role: selectedRole,
    });
    if (showActionResult(result, "管理员角色已更新")) setRoleAdmin(undefined);
  };

  const confirmPasswordReset = () => {
    if (!passwordAdmin) return;
    const result = applyTenantAdminAction(passwordAdmin.id, "reset_password", {
      password: newPassword,
    });
    if (showActionResult(result, "管理员密码已重置")) {
      setPasswordAdmin(undefined);
      setNewPassword("");
    }
  };

  const confirmAction = (
    admin: TenantAdmin,
    action: TenantAdminAction,
    title: string,
    content: string,
    successMessage: string,
    danger = false,
  ) => {
    Modal.confirm({
      title,
      content,
      okButtonProps: danger ? { status: "danger" } : undefined,
      onOk: () =>
        showActionResult(
          applyTenantAdminAction(admin.id, action),
          successMessage,
        ),
    });
  };

  return (
    <div className="pb-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title heading={6} className="!mb-1">
            租户管理员
          </Typography.Title>
          <Typography.Text type="secondary">
            共 {admins.length} 名，活跃管理员{" "}
            {admins.filter((admin) => admin.status === "active").length} 名
          </Typography.Text>
        </div>
        <Button
          type="primary"
          disabled={tenant.status === "disabled"}
          onClick={() => {
            setInviteDraft(initialInviteDraft);
            setInviteModalVisible(true);
          }}
        >
          邀请管理员
        </Button>
      </div>

      <AdministratorTable
        admins={admins}
        onConfirmAction={confirmAction}
        onOpenRole={(admin) => {
          setSelectedRole(admin.role);
          setRoleAdmin(admin);
        }}
        onOpenPassword={(admin) => {
          setNewPassword("");
          setPasswordAdmin(admin);
        }}
      />
      <InviteAdministratorModal
        visible={inviteModalVisible}
        draft={inviteDraft}
        onChange={setInviteDraft}
        onConfirm={confirmInvite}
        onCancel={() => setInviteModalVisible(false)}
      />
      <AdministratorRoleModal
        admin={roleAdmin}
        role={selectedRole}
        onRoleChange={setSelectedRole}
        onConfirm={confirmRoleChange}
        onCancel={() => setRoleAdmin(undefined)}
      />
      <AdministratorPasswordModal
        admin={passwordAdmin}
        password={newPassword}
        onPasswordChange={setNewPassword}
        onConfirm={confirmPasswordReset}
        onCancel={() => setPasswordAdmin(undefined)}
      />
    </div>
  );
}
