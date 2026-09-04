import {
  Alert,
  Button,
  Card,
  InputNumber,
  Select,
  Switch,
} from "@arco-design/web-react";
import type { ReactNode } from "react";
import { ListPageHeader } from "@/components/common";

interface PolicyRowProps {
  title: string;
  description: string;
  children: ReactNode;
}

function PolicyRow({ title, description, children }: PolicyRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_220px] items-center gap-5 border-b border-gray-100 py-4 last:border-b-0 max-[760px]:grid-cols-1">
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <div className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </div>
      </div>
      <div className="flex justify-end max-[760px]:justify-start">
        {children}
      </div>
    </div>
  );
}

export function SessionSecurityPage() {
  return (
    <div className="space-y-4">
      <ListPageHeader
        title="会话与安全策略"
        subtitle="预留平台运营账号的登录会话、密码与访问安全策略。"
        extra={
          <Button type="primary" disabled>
            保存策略
          </Button>
        }
      />
      <Alert
        type="warning"
        content="该页面为 P2 预留结构。当前展示值不代表已生效的服务端安全策略。"
      />
      <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-1">
        <Card title="会话策略" className="rounded-lg">
          <PolicyRow
            title="空闲会话超时"
            description="账号无操作达到指定时间后要求重新登录。"
          >
            <Select value="30" disabled className="w-48">
              <Select.Option value="15">15 分钟</Select.Option>
              <Select.Option value="30">30 分钟</Select.Option>
              <Select.Option value="60">60 分钟</Select.Option>
            </Select>
          </PolicyRow>
          <PolicyRow
            title="最长会话时间"
            description="即使持续操作，也在达到上限后重新认证。"
          >
            <Select value="12" disabled className="w-48">
              <Select.Option value="8">8 小时</Select.Option>
              <Select.Option value="12">12 小时</Select.Option>
              <Select.Option value="24">24 小时</Select.Option>
            </Select>
          </PolicyRow>
          <PolicyRow
            title="单账号并发会话"
            description="限制同一平台账号同时保持的登录会话数量。"
          >
            <InputNumber value={3} min={1} max={10} disabled className="w-48" />
          </PolicyRow>
          <PolicyRow
            title="高风险操作重新认证"
            description="修改角色、禁用账号或导出取证包前再次认证。"
          >
            <Switch checked disabled />
          </PolicyRow>
        </Card>

        <Card title="账号安全" className="rounded-lg">
          <PolicyRow
            title="强制 MFA"
            description="要求所有平台运营账号完成多因素认证。"
          >
            <Switch checked={false} disabled />
          </PolicyRow>
          <PolicyRow
            title="密码最小长度"
            description="只适用于平台本地登录账号。"
          >
            <InputNumber
              value={12}
              min={8}
              max={64}
              disabled
              className="w-48"
            />
          </PolicyRow>
          <PolicyRow
            title="连续失败锁定"
            description="达到失败次数后暂时锁定账号。"
          >
            <Select value="5" disabled className="w-48">
              <Select.Option value="5">5 次</Select.Option>
              <Select.Option value="8">8 次</Select.Option>
              <Select.Option value="10">10 次</Select.Option>
            </Select>
          </PolicyRow>
          <PolicyRow
            title="来源 IP 白名单"
            description="限制管理端登录来源；需保留应急访问通道。"
          >
            <Switch checked={false} disabled />
          </PolicyRow>
        </Card>
      </div>
      <Card title="策略状态" className="rounded-lg">
        <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2">
          {[
            ["配置来源", "系统默认"],
            ["最近更新", "-"],
            ["更新人", "-"],
            ["策略版本", "预留"],
          ].map(([label, value]) => (
            <div key={label} className="rounded bg-gray-50 p-4">
              <div className="text-xs text-gray-500">{label}</div>
              <div className="mt-2 font-medium text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
