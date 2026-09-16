import { Button, Descriptions, Popconfirm, Result, Space, Tag } from "@arco-design/web-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DetailPageFrame, type DetailInfoCard, type DetailTab } from "@/components/common";
import { TenantAdministrators } from "@/components/tenant/TenantAdministrators";
import { TenantBillingSummary } from "@/components/tenant/TenantBillingSummary";
import { TenantIdentitySecurity } from "@/components/tenant/TenantIdentitySecurity";
import { TenantLifecycle } from "@/components/tenant/TenantLifecycle";
import { TenantOperationHistory } from "@/components/tenant/TenantOperationHistory";
import { TenantQuotaUsage } from "@/components/tenant/TenantQuotaUsage";
import { useTenantManagement } from "@/components/tenant/TenantManagementProvider/useTenantManagement";
import { tenantStatusMeta } from "@/components/tenant/model";
import { formatDateTimeMinute } from "@/lib/date";
import { showMessage } from "@/lib/feedback";

export const Route = createFileRoute("/tenants/$tenantId")({
  component: function TenantDetailRoute() {
    const { tenantId } = Route.useParams();
    const navigate = useNavigate();
    const { tenants, toggleTenantStatus, disableTenant, updateTenantIdentity } =
      useTenantManagement();
    const tenant = tenants.find((item) => item.id === tenantId);

    const returnToList = () => {
      void navigate({ to: "/tenants" });
    };

    if (!tenant) {
      return (
        <Result
          status="404"
          title="租户不存在"
          subTitle="该租户可能已被移除，或当前地址无效。"
          extra={<Button onClick={returnToList}>返回租户列表</Button>}
        />
      );
    }

    const status = tenantStatusMeta[tenant.status];
    const balance = tenant.balanceUsd.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
    const credit = tenant.creditUsd.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

    const handleToggleStatus = () => {
      if (tenant.status === "suspended" && tenant.balanceUsd < 0) {
        showMessage({ type: "warning", content: "账户仍有欠费，请在生命周期页签中处理解冻" });
        return;
      }
      const nextStatus = toggleTenantStatus(tenant.id);
      if (!nextStatus) return;
      showMessage({
        type: "success",
        content: `租户 ${tenant.name} 已${nextStatus === "active" ? "解冻" : "冻结"}`,
      });
    };

    const handleDisable = () => {
      if (disableTenant(tenant.id)) {
        showMessage({ type: "success", content: `租户 ${tenant.name} 已禁用` });
      }
    };

    const infoCards: DetailInfoCard[] = [
      {
        key: "basic",
        title: "基本信息",
        content: (
          <Descriptions
            column={1}
            data={[
              { label: "ID", value: tenant.id },
              {
                label: "状态",
                value: <Tag color={status.color}>{status.label}</Tag>,
              },
              { label: "规格", value: tenant.specification },
              { label: "显示名", value: tenant.displayName },
              {
                label: "套餐",
                value: `${tenant.quotaPackage} (${tenant.planCode})`,
              },
              {
                label: "区域 / 行业",
                value: `${tenant.regionName} (${tenant.region}) / ${tenant.industry}`,
              },
              { label: "联系人", value: tenant.contact || "-" },
              {
                label: "成员 / 管理员",
                value: `${tenant.memberCount} / ${tenant.adminCount}`,
              },
              {
                label: "余额 / 授信",
                value: `$${balance} / $${credit}`,
              },
              {
                label: "SSO",
                value: tenant.ssoEnabled ? "已开启" : "未开启",
              },
              { label: "强制 MFA", value: tenant.forceMfa ? "开" : "关" },
              { label: "试用到期", value: formatDateTimeMinute(tenant.trialEndsAt) },
              { label: "创建时间", value: formatDateTimeMinute(tenant.createdAt) },
            ]}
          />
        ),
      },
    ];

    const detailTabs: DetailTab[] = [
      {
        key: "identity",
        title: "身份与安全",
        content: (
          <TenantIdentitySecurity
            tenant={tenant}
            onUpdate={(patch) => updateTenantIdentity(tenant.id, patch)}
          />
        ),
      },
      {
        key: "quota",
        title: "配额占用",
        content: <TenantQuotaUsage tenant={tenant} />,
      },
      {
        key: "admins",
        title: "管理员",
        content: <TenantAdministrators tenant={tenant} />,
      },
      {
        key: "billing",
        title: "计费摘要",
        content: <TenantBillingSummary tenant={tenant} />,
      },
      {
        key: "lifecycle",
        title: "生命周期",
        content: <TenantLifecycle tenant={tenant} />,
      },
      {
        key: "operations",
        title: "操作历史",
        content: <TenantOperationHistory tenant={tenant} />,
      },
    ];

    return (
      <DetailPageFrame
        breadcrumbs={[
          { label: "租户管理" },
          { label: "租户列表", onClick: returnToList },
          { label: tenant.name },
        ]}
        title={tenant.displayName}
        subtitle={tenant.name}
        status={<Tag color={status.color}>{status.label}</Tag>}
        headerItems={[
          { label: "区域", value: tenant.regionName },
          { label: "配额套餐", value: tenant.quotaPackage },
          { label: "管理员", value: `${tenant.adminCount} 人` },
          { label: "开通时间", value: formatDateTimeMinute(tenant.createdAt) },
        ]}
        actions={
          tenant.status !== "disabled" ? (
            <Space wrap>
              <Popconfirm
                title={`确认${tenant.status === "suspended" ? "解冻" : "冻结"}租户 ${tenant.name}？`}
                onOk={handleToggleStatus}
              >
                <Button>{tenant.status === "suspended" ? "解冻" : "冻结"}</Button>
              </Popconfirm>
              <Popconfirm
                title={`禁用 ${tenant.name} 后不可还原，确认继续？`}
                okButtonProps={{ status: "danger" }}
                onOk={handleDisable}
              >
                <Button status="danger">禁用</Button>
              </Popconfirm>
            </Space>
          ) : undefined
        }
        cards={infoCards}
        tabs={detailTabs}
        defaultTabKey="identity"
        onBack={returnToList}
      />
    );
  },
});
