import { Checkbox, Descriptions, Form, Input, Select, Typography } from "@arco-design/web-react";
import { quotaPackages, tenantRegions, type TenantDraft } from "@/components/tenant/model";

interface StepContentProps {
  current: number;
  draft: TenantDraft;
  onChange: <Key extends keyof TenantDraft>(field: Key, value: TenantDraft[Key]) => void;
}

export function StepContent({ current, draft, onChange }: StepContentProps) {
  const regionName = tenantRegions.find((item) => item.value === draft.region)?.label ?? "-";

  return (
    <Form layout="vertical" className="mx-auto max-w-[560px]">
      {current === 0 ? (
        <>
          <Form.Item label="租户标识" required>
            <Input
              value={draft.name}
              onChange={(value) => onChange("name", value)}
              placeholder="例如 acme-ai"
            />
          </Form.Item>
          <Form.Item label="显示名" required>
            <Input
              value={draft.displayName}
              onChange={(value) => onChange("displayName", value)}
              placeholder="请输入企业或组织名称"
            />
          </Form.Item>
          <Form.Item label="联系人">
            <Input
              value={draft.contact}
              onChange={(value) => onChange("contact", value)}
              placeholder="联系人邮箱或电话"
            />
          </Form.Item>
          <Form.Item label="行业">
            <Input value={draft.industry} onChange={(value) => onChange("industry", value)} />
          </Form.Item>
        </>
      ) : null}

      {current === 1 ? (
        <Form.Item label="开通区域" required>
          <Select
            value={draft.region}
            onChange={(value) => onChange("region", value)}
            options={tenantRegions.map((item) => ({ ...item }))}
          />
          <Typography.Text type="secondary" className="mt-2 block text-xs">
            仅展示已启用且开放租户开通的区域。
          </Typography.Text>
        </Form.Item>
      ) : null}

      {current === 2 ? (
        <>
          <Form.Item label="配额套餐">
            <Select
              value={draft.quotaPackage}
              onChange={(value) => onChange("quotaPackage", value)}
              options={quotaPackages.map((value) => ({ label: value, value }))}
            />
          </Form.Item>
          <Checkbox checked={draft.isTrial} onChange={(checked) => onChange("isTrial", checked)}>
            标记为试用租户
          </Checkbox>
        </>
      ) : null}

      {current === 3 ? (
        <>
          <Form.Item label="管理员姓名">
            <Input
              value={draft.adminName}
              onChange={(value) => onChange("adminName", value)}
              placeholder="可暂不设置"
            />
          </Form.Item>
          <Form.Item label="管理员邮箱">
            <Input
              value={draft.adminEmail}
              onChange={(value) => onChange("adminEmail", value)}
              placeholder="用于发送初始邀请"
            />
          </Form.Item>
        </>
      ) : null}

      {current === 4 ? (
        <Descriptions
          column={1}
          border
          data={[
            { label: "租户标识", value: draft.name },
            { label: "显示名", value: draft.displayName },
            { label: "开通区域", value: regionName },
            { label: "配额套餐", value: draft.quotaPackage || "默认配额" },
            {
              label: "租户类型",
              value: draft.isTrial ? "试用租户" : "正式租户",
            },
            { label: "初始管理员", value: draft.adminEmail || "暂不设置" },
          ]}
        />
      ) : null}
    </Form>
  );
}
