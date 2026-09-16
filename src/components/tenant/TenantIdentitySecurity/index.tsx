import { Button, Modal, Space, Tag, Typography } from "@arco-design/web-react";
import { useState } from "react";
import { tenantRegions, type Tenant, type TenantSsoStatus } from "@/components/tenant/model";
import { formatCurrentDateTime, formatDateTimeMinute } from "@/lib/date";
import { showMessage } from "@/lib/feedback";
import { RegionChangeModal } from "./RegionChangeModal";
import { SsoConfigurationModal } from "./SsoConfigurationModal";

interface TenantIdentityUpdate {
  ssoEnabled?: boolean;
  ssoProvider?: string;
  ssoStatus?: TenantSsoStatus;
  ssoLastTestAt?: string;
  forceMfa?: boolean;
  region?: string;
  regionName?: string;
}

interface TenantIdentitySecurityProps {
  tenant: Tenant;
  onUpdate: (patch: TenantIdentityUpdate) => void;
}

export function TenantIdentitySecurity({ tenant, onUpdate }: TenantIdentitySecurityProps) {
  const [ssoVisible, setSsoVisible] = useState(false);
  const [regionVisible, setRegionVisible] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(tenant.ssoEnabled);
  const [ssoProvider, setSsoProvider] = useState(
    tenant.ssoProvider === "-" ? "Azure AD" : tenant.ssoProvider,
  );
  const [ssoStatus, setSsoStatus] = useState<TenantSsoStatus>(tenant.ssoStatus);
  const [ssoLastTestAt, setSsoLastTestAt] = useState(tenant.ssoLastTestAt);
  const [region, setRegion] = useState(tenant.region);

  const openSsoModal = () => {
    setSsoEnabled(tenant.ssoEnabled);
    setSsoProvider(tenant.ssoProvider === "-" ? "Azure AD" : tenant.ssoProvider);
    setSsoStatus(tenant.ssoStatus);
    setSsoLastTestAt(tenant.ssoLastTestAt);
    setSsoVisible(true);
  };

  const saveSso = () => {
    if (ssoEnabled && !ssoProvider) {
      showMessage({ type: "warning", content: "请选择 IdP 提供商" });
      return;
    }
    onUpdate({
      ssoEnabled,
      ssoProvider: ssoEnabled ? ssoProvider : "-",
      ssoStatus: ssoEnabled ? ssoStatus : "disconnected",
      ssoLastTestAt: ssoEnabled ? ssoLastTestAt : undefined,
    });
    setSsoVisible(false);
    showMessage({ type: "success", content: "企业 SSO 配置已保存" });
  };

  const testSso = () => {
    if (!ssoEnabled) {
      showMessage({ type: "warning", content: "请先在弹窗中启用企业 SSO" });
      return;
    }
    setSsoStatus("connected");
    setSsoLastTestAt(formatCurrentDateTime());
    showMessage({
      type: "success",
      content: `${ssoProvider} 连接测试成功，请保存配置后生效`,
    });
  };

  const confirmMfaChange = () => {
    const nextEnabled = !tenant.forceMfa;
    Modal.confirm({
      title: `${nextEnabled ? "开启" : "关闭"}强制 MFA`,
      content: nextEnabled
        ? "开启后，租户管理员接受邀请或登录时必须完成 MFA。"
        : "关闭后，租户将不再强制管理员使用 MFA。",
      okText: "确认生效",
      onOk: () => {
        onUpdate({ forceMfa: nextEnabled });
        showMessage({
          type: "success",
          content: `强制 MFA 已${nextEnabled ? "开启" : "关闭"}`,
        });
      },
    });
  };

  const openRegionModal = () => {
    setRegion(tenant.region);
    setRegionVisible(true);
  };

  const saveRegion = () => {
    const selected = tenantRegions.find((item) => item.value === region);
    if (!selected) {
      showMessage({ type: "warning", content: "请选择区域" });
      return;
    }
    onUpdate({ region: selected.value, regionName: selected.label });
    setRegionVisible(false);
    showMessage({ type: "success", content: `区域归属已变更为 ${selected.label}` });
  };

  return (
    <div className="space-y-6 pb-5">
      <section>
        <Typography.Title heading={6} className="!mt-0 !mb-4">
          身份与安全
        </Typography.Title>

        <div className="rounded-lg border border-gray-100 p-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-[760px]:grid-cols-1">
            <div>
              <Typography.Text type="secondary" className="block text-xs">
                企业 SSO
              </Typography.Text>
              <Tag color={tenant.ssoEnabled ? "green" : "gray"} className="mt-1">
                {tenant.ssoEnabled ? "启用" : "关闭"}
              </Tag>
            </div>
            <div>
              <Typography.Text type="secondary" className="block text-xs">
                IdP 提供商
              </Typography.Text>
              <Typography.Text className="mt-1 block font-medium">
                {tenant.ssoProvider}
              </Typography.Text>
            </div>
          </div>

          <Typography.Text type="secondary" className="mt-4 block text-xs">
            状态 {tenant.ssoStatus} · 最近测试 {formatDateTimeMinute(tenant.ssoLastTestAt)}
          </Typography.Text>

          <Space wrap className="mt-4">
            <Button type="primary" onClick={openSsoModal}>
              编辑 SSO
            </Button>
            <Button onClick={confirmMfaChange}>
              {tenant.forceMfa ? "关闭强制 MFA" : "开启强制 MFA"}
            </Button>
          </Space>
        </div>
      </section>

      <section className="border-t border-gray-100 pt-5">
        <Typography.Title heading={6} className="!mt-0 !mb-3">
          区域归属
        </Typography.Title>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-100 p-4">
          <Typography.Text>
            当前&nbsp;
            <span className="font-medium">
              {tenant.regionName} ({tenant.region})
            </span>
          </Typography.Text>
          <Button onClick={openRegionModal}>变更区域</Button>
        </div>
      </section>

      <SsoConfigurationModal
        visible={ssoVisible}
        enabled={ssoEnabled}
        provider={ssoProvider}
        status={ssoStatus}
        lastTestAt={ssoLastTestAt}
        onEnabledChange={(value) => {
          setSsoEnabled(value);
          setSsoStatus("disconnected");
          setSsoLastTestAt(undefined);
        }}
        onProviderChange={(value) => {
          setSsoProvider(value);
          setSsoStatus("disconnected");
          setSsoLastTestAt(undefined);
        }}
        onTest={testSso}
        onSave={saveSso}
        onCancel={() => setSsoVisible(false)}
      />

      <RegionChangeModal
        visible={regionVisible}
        region={region}
        onRegionChange={setRegion}
        onSave={saveRegion}
        onCancel={() => setRegionVisible(false)}
      />
    </div>
  );
}
