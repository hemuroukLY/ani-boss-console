import {
  Button,
  Descriptions,
  Modal,
  Space,
  Typography,
} from "@arco-design/web-react";
import type { Tenant } from "@/features/tenant-management/model";

interface ArrearsPolicySectionProps {
  tenant: Tenant;
  onOpenPolicy: () => void;
  onSimulateOverdue: () => void;
}

export function ArrearsPolicySection({
  tenant,
  onOpenPolicy,
  onSimulateOverdue,
}: ArrearsPolicySectionProps) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Typography.Title heading={6} className="!mb-0">
          欠费策略
        </Typography.Title>
        {tenant.status !== "disabled" ? (
          <Space wrap>
            <Button onClick={onOpenPolicy}>编辑策略</Button>
            <Button
              status="warning"
              onClick={() =>
                Modal.confirm({
                  title: "模拟欠费",
                  content: tenant.arrearsPolicy.autoSuspend
                    ? `模拟超过 ${tenant.arrearsPolicy.graceDays} 天宽限期，租户将自动冻结。`
                    : "模拟产生欠费；当前未开启自动冻结，租户状态不会变化。",
                  onOk: onSimulateOverdue,
                })
              }
            >
              模拟欠费冻结
            </Button>
          </Space>
        ) : null}
      </div>
      <Descriptions
        border
        column={3}
        data={[
          { label: "宽限天数", value: `${tenant.arrearsPolicy.graceDays} 天` },
          {
            label: "自动冻结",
            value: tenant.arrearsPolicy.autoSuspend ? "开启" : "关闭",
          },
          {
            label: "邮件通知",
            value: tenant.arrearsPolicy.emailNotification ? "开启" : "关闭",
          },
        ]}
      />
    </section>
  );
}
