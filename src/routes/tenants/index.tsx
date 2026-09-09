import { Button, Message } from "@arco-design/web-react";
import { IconPlus } from "@arco-design/web-react/icon";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListPageFrame, ListPageHeader } from "@/components/common";
import { TenantCreateDrawer } from "@/components/tenant/TenantCreateDrawer";
import { TenantTable } from "@/components/tenant/TenantTable";
import { useTenantManagement } from "@/components/tenant/TenantManagementProvider/useTenantManagement";
import type { Tenant, TenantDraft } from "@/components/tenant/model";

export const Route = createFileRoute("/tenants/")({
  component: function TenantListRoute() {
    const { tenants, createTenant, toggleTenantStatus, disableTenant } = useTenantManagement();
    const [createVisible, setCreateVisible] = useState(false);

    const submitTenant = (draft: TenantDraft) => {
      const result = createTenant(draft);
      if (!result.ok || !result.tenant) {
        Message.error(result.reason ?? "租户开通失败");
        return false;
      }
      setCreateVisible(false);
      Message.success(`租户 ${result.tenant.name} 已开通`);
      return true;
    };

    const handleToggleTenantStatus = (tenant: Tenant) => {
      const nextStatus = toggleTenantStatus(tenant.id);
      if (!nextStatus) return;
      Message.success(`租户 ${tenant.name} 已${nextStatus === "active" ? "解冻" : "冻结"}`);
    };

    const handleDisableTenant = (tenant: Tenant) => {
      if (disableTenant(tenant.id)) {
        Message.success(`租户 ${tenant.name} 已禁用`);
      }
    };

    return (
      <>
        <ListPageFrame
          header={
            <ListPageHeader
              title="租户列表"
              extra={
                <Button type="primary" icon={<IconPlus />} onClick={() => setCreateVisible(true)}>
                  开通租户
                </Button>
              }
            />
          }
        >
          <TenantTable
            data={tenants}
            onToggleStatus={handleToggleTenantStatus}
            onDisable={handleDisableTenant}
            onQuota={(tenant) => Message.info(`${tenant.name} 当前套餐：${tenant.quotaPackage}`)}
            onAdmins={(tenant) =>
              Message.info(`${tenant.name} 当前管理员：${tenant.adminCount} 人`)
            }
          />
        </ListPageFrame>

        <TenantCreateDrawer
          visible={createVisible}
          onCancel={() => setCreateVisible(false)}
          onSubmit={submitTenant}
        />
      </>
    );
  },
});
