import { Button, Message } from "@arco-design/web-react";
import { IconPlus } from "@arco-design/web-react/icon";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ListPageFrame,
  ListPageHeader,
  ListToolbar,
} from "@/components/common/ListPageFrame";
import { TenantCreateDrawer } from "@/components/tenant-management/TenantCreateDrawer";
import {
  TenantFilters,
  type TenantFiltersValue,
} from "@/components/tenant-management/TenantFilters";
import { TenantTable } from "@/components/tenant-management/TenantTable";
import { useTenantManagement } from "@/features/tenant-management/TenantManagementProvider";
import type { Tenant, TenantDraft } from "@/features/tenant-management/model";

const initialFilters: TenantFiltersValue = {
  keyword: "",
  region: "all",
  status: "all",
  trial: "all",
};

export const Route = createFileRoute("/tenants/")({
  component: TenantListRoute,
});

function TenantListRoute() {
  const { tenants, createTenant, toggleTenantStatus, disableTenant } =
    useTenantManagement();
  const [filters, setFilters] = useState<TenantFiltersValue>(initialFilters);
  const [createVisible, setCreateVisible] = useState(false);

  const filteredTenants = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return tenants.filter((tenant) => {
      const matchesKeyword =
        !keyword ||
        tenant.name.toLowerCase().includes(keyword) ||
        tenant.displayName.toLowerCase().includes(keyword);
      const matchesRegion =
        filters.region === "all" || tenant.region === filters.region;
      const matchesStatus =
        filters.status === "all" || tenant.status === filters.status;
      const matchesTrial =
        filters.trial === "all" ||
        (filters.trial === "trial" ? tenant.isTrial : !tenant.isTrial);

      return matchesKeyword && matchesRegion && matchesStatus && matchesTrial;
    });
  }, [filters, tenants]);

  const updateFilter = (field: keyof TenantFiltersValue, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

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
    Message.success(
      `租户 ${tenant.name} 已${nextStatus === "active" ? "解冻" : "冻结"}`,
    );
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
              <Button
                type="primary"
                icon={<IconPlus />}
                onClick={() => setCreateVisible(true)}
              >
                开通租户
              </Button>
            }
          />
        }
        toolbar={
          <ListToolbar
            filters={
              <TenantFilters
                {...filters}
                onChange={updateFilter}
                onReset={() => setFilters(initialFilters)}
              />
            }
          />
        }
      >
        <TenantTable
          data={filteredTenants}
          onToggleStatus={handleToggleTenantStatus}
          onDisable={handleDisableTenant}
          onQuota={(tenant) =>
            Message.info(`${tenant.name} 当前套餐：${tenant.quotaPackage}`)
          }
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
}
