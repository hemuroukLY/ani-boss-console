import {
  Button,
  Descriptions,
  Space,
  Tag,
  Typography,
} from "@arco-design/web-react";
import {
  tenantBillingStatusMeta,
  type TenantBilling,
} from "@/components/tenant/model";
import { formatUsd } from "../formatters";

interface BillingAccountOverviewProps {
  billing: TenantBilling;
  onRefresh: () => void;
  onAdjust: () => void;
  onGenerateInvoice: () => void;
  onSettle: () => void;
  onExport: () => void;
}

export function BillingAccountOverview({
  billing,
  onRefresh,
  onAdjust,
  onGenerateInvoice,
  onSettle,
  onExport,
}: BillingAccountOverviewProps) {
  const statusMeta = tenantBillingStatusMeta[billing.status];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title heading={6} className="!mb-1">
            计费账户
          </Typography.Title>
          <Typography.Text type="secondary">
            最近更新 {billing.updatedAt}
          </Typography.Text>
        </div>
        <Space wrap>
          <Button onClick={onRefresh}>刷新用量</Button>
          <Button onClick={onAdjust}>授信调账</Button>
          <Button onClick={onGenerateInvoice}>生成发票</Button>
          <Button
            disabled={billing.status !== "overdue" && billing.balanceUsd >= 0}
            onClick={onSettle}
          >
            标记结清
          </Button>
          <Button onClick={onExport}>导出对账单</Button>
        </Space>
      </div>

      <Descriptions
        border
        column={3}
        data={[
          {
            label: "状态",
            value: <Tag color={statusMeta.color}>{statusMeta.label}</Tag>,
          },
          { label: "账期", value: billing.period },
          { label: "本期用量费用", value: formatUsd(billing.usageCostUsd) },
          { label: "账户余额", value: formatUsd(billing.balanceUsd) },
          { label: "授信额度", value: formatUsd(billing.creditUsd) },
          { label: "到期日", value: billing.dueDate },
          { label: "发票号", value: billing.invoiceNo || "-" },
        ]}
      />
    </section>
  );
}
