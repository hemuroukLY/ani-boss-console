import {
  Button,
  Descriptions,
  Space,
  Tag,
  Typography,
} from "@arco-design/web-react";
import {
  tenantStatusMeta,
  type Tenant,
} from "@/components/tenant/model";

interface LifecycleStatusSectionProps {
  tenant: Tenant;
  onOpenSuspend: () => void;
  onOpenResume: () => void;
  onOpenDisable: () => void;
}

export function LifecycleStatusSection({
  tenant,
  onOpenSuspend,
  onOpenResume,
  onOpenDisable,
}: LifecycleStatusSectionProps) {
  const statusMeta = tenantStatusMeta[tenant.status];
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Typography.Title heading={6} className="!mb-0">
          生命周期状态
        </Typography.Title>
        {tenant.status !== "disabled" ? (
          <Space wrap>
            <Button
              onClick={
                tenant.status === "active" ? onOpenSuspend : onOpenResume
              }
            >
              {tenant.status === "active" ? "冻结" : "解冻"}
            </Button>
            <Button status="danger" onClick={onOpenDisable}>
              禁用
            </Button>
          </Space>
        ) : null}
      </div>
      <Descriptions
        border
        column={3}
        data={[
          {
            label: "当前状态",
            value: <Tag color={statusMeta.color}>{statusMeta.label}</Tag>,
          },
          {
            label: "商业属性",
            value: tenant.isTrial ? "试用租户" : "正式租户",
          },
          { label: "开通时间", value: tenant.createdAt },
          { label: "冻结时间", value: tenant.suspendedAt || "—" },
          { label: "冻结原因", value: tenant.suspendReason || "—" },
          { label: "禁用时间", value: tenant.disabledAt || "—" },
        ]}
      />
    </section>
  );
}
