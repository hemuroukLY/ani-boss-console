import {
  Button,
  Message,
  Modal,
  Space,
  Tag,
  Typography,
} from "@arco-design/web-react";
import { useState } from "react";
import {
  tenantRegions,
  type Tenant,
  type TenantSsoStatus,
} from "@/features/tenant-management/model";
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

function formatCurrentTime() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TenantIdentitySecurity({
  tenant,
  onUpdate,
}: TenantIdentitySecurityProps) {
  const [ssoVisible, setSsoVisible] = useState(false);
  const [regionVisible, setRegionVisible] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(tenant.ssoEnabled);
  const [ssoProvider, setSsoProvider] = useState(
    tenant.ssoProvider === "—" ? "Azure AD" : tenant.ssoProvider,
  );
  const [ssoStatus, setSsoStatus] = useState<TenantSsoStatus>(tenant.ssoStatus);
  const [ssoLastTestAt, setSsoLastTestAt] = useState(tenant.ssoLastTestAt);
  const [region, setRegion] = useState(tenant.region);

  const openSsoModal = () => {
    setSsoEnabled(tenant.ssoEnabled);
    setSsoProvider(
      tenant.ssoProvider === "—" ? "Azure AD" : tenant.ssoProvider,
    );
    setSsoStatus(tenant.ssoStatus);
    setSsoLastTestAt(tenant.ssoLastTestAt);
    setSsoVisible(true);
  };

  const saveSso = () => {
    if (ssoEnabled && !ssoProvider) {
      Message.warning("请选择 IdP 提供商");
      return;
    }
    onUpdate({
      ssoEnabled,
      ssoProvider: ssoEnabled ? ssoProvider : "—",
      ssoStatus: ssoEnabled ? ssoStatus : "disconnected",
      ssoLastTestAt: ssoEnabled ? ssoLastTestAt : undefined,
    });
    setSsoVisible(false);
    Message.success("企业 SSO 配置已保存");
  };

  const testSso = () => {
    if (!ssoEnabled) {
      Message.warning("请先在弹窗中启用企业 SSO");
      return;
    }
    setSsoStatus("connected");
    setSsoLastTestAt(formatCurrentTime());
    Message.success(`${ssoProvider} 连接测试成功，请保存配置后生效`);
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
        Message.success(`强制 MFA 已${nextEnabled ? "开启" : "关闭"}`);
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
      Message.warning("请选择区域");
      return;
    }
    onUpdate({ region: selected.value, regionName: selected.label });
    setRegionVisible(false);
    Message.success(`区域归属已变更为 ${selected.label}`);
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
              <Tag
                color={tenant.ssoEnabled ? "green" : "gray"}
                className="mt-1"
              >
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
            状态 {tenant.ssoStatus} · 最近测试 {tenant.ssoLastTestAt || "—"}
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
