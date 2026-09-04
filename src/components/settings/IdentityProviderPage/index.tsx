import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Switch,
} from "@arco-design/web-react";
import { ListPageHeader } from "@/components/common";

export function IdentityProviderPage() {
  return (
    <div className="space-y-4">
      <ListPageHeader
        title="登录与 IdP"
        subtitle="预留企业身份提供方接入配置；当前平台仅使用本地账号登录。"
        extra={
          <Button type="primary" disabled>
            保存配置
          </Button>
        }
      />
      <Alert
        type="info"
        content="该页面为 P1 预留结构，尚未接入身份协议、元数据发现或连接测试能力。"
      />
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-4 max-[1050px]:grid-cols-1">
        <Card title="身份提供方" className="rounded-lg">
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded border border-gray-200 p-4">
              <div>
                <div className="font-medium text-gray-900">启用企业 IdP</div>
                <div className="mt-1 text-xs text-gray-500">
                  启用后，平台运营账号可通过统一身份提供方登录。
                </div>
              </div>
              <Switch checked={false} disabled />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">协议类型</div>
              <Select value="oidc" disabled className="w-full">
                <Select.Option value="oidc">OpenID Connect</Select.Option>
                <Select.Option value="saml">SAML 2.0（预留）</Select.Option>
              </Select>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Issuer URL</div>
              <Input value="https://idp.example.com/realms/ani" disabled />
            </div>
            <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
              <div>
                <div className="mb-2 text-sm font-medium">Client ID</div>
                <Input value="ani-console" disabled />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Client Secret</div>
                <Input value="********" disabled />
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">回调地址</div>
              <Input
                value="https://console.ani.local/login/callback"
                disabled
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button disabled>获取元数据</Button>
              <Button disabled>测试连接</Button>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="当前登录方式" className="rounded-lg">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">账号来源</span>
                <span>本地账号</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">企业 IdP</span>
                <span className="text-gray-900">未配置</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">自动建号</span>
                <span>关闭</span>
              </div>
            </div>
          </Card>
          <Card title="接入边界" className="rounded-lg">
            <ul className="m-0 space-y-2 pl-5 text-sm leading-6 text-gray-600">
              <li>只作用于平台运营账号。</li>
              <li>不创建或同步租户成员。</li>
              <li>角色映射需要保留平台超级管理员兜底。</li>
              <li>切换前需要完成回退登录验证。</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
