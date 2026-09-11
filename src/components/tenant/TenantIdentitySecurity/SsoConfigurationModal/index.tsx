import { Button, Form, Modal, Radio, Select, Space, Typography } from "@arco-design/web-react";
import type { TenantSsoStatus } from "@/components/tenant/model";
import { formatDateTimeMinute } from "@/lib/date";

const idpProviders = ["Azure AD", "Okta", "钉钉", "企业微信", "自定义 SAML"] as const;

interface SsoConfigurationModalProps {
  visible: boolean;
  enabled: boolean;
  provider: string;
  status: TenantSsoStatus;
  lastTestAt?: string;
  onEnabledChange: (value: boolean) => void;
  onProviderChange: (value: string) => void;
  onTest: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SsoConfigurationModal({
  visible,
  enabled,
  provider,
  status,
  lastTestAt,
  onEnabledChange,
  onProviderChange,
  onTest,
  onSave,
  onCancel,
}: SsoConfigurationModalProps) {
  return (
    <Modal
      title="配置企业 SSO"
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      footer={
        <div className="flex w-full items-center justify-between">
          <Button disabled={!enabled} onClick={onTest}>
            测试连接
          </Button>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={onSave}>
              保存 SSO
            </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical">
        <Form.Item label="企业 SSO">
          <Radio.Group type="button" value={enabled} onChange={onEnabledChange}>
            <Radio value>启用</Radio>
            <Radio value={false}>关闭</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="IdP 提供商" required={enabled}>
          <Select
            value={provider}
            disabled={!enabled}
            onChange={onProviderChange}
            options={idpProviders.map((value) => ({ label: value, value }))}
          />
        </Form.Item>
        <Typography.Text type="secondary" className="block text-xs">
          状态 {status} · 最近测试 {formatDateTimeMinute(lastTestAt)}
        </Typography.Text>
      </Form>
    </Modal>
  );
}
