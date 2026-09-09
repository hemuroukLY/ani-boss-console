import { Tag, Typography } from "@arco-design/web-react";
import clsx from "clsx";
import { DataTable } from "@/components/common";
import type {
  TenantBilling,
  TenantBillingAdjustment,
  TenantInvoice,
  TenantUsageCost,
} from "@/components/tenant/model";
import { formatAmount, formatUsd } from "../formatters";

export function BillingRecords({ billing }: { billing: TenantBilling }) {
  return (
    <>
      <section>
        <Typography.Title heading={6} className="!mb-4">
          用量费用明细
        </Typography.Title>
        <DataTable
          rowKey="metric"
          pagination={false}
          data={billing.usageBreakdown}
          columns={[
            { title: "计量项", dataIndex: "metric" },
            {
              title: "用量",
              render: (_, item: TenantUsageCost) => formatAmount(item.amount),
            },
            {
              title: "单价（USD）",
              render: (_, item: TenantUsageCost) => `$${formatAmount(item.unitCost)}`,
            },
            {
              title: "费用（USD）",
              render: (_, item: TenantUsageCost) => formatUsd(item.cost),
            },
          ]}
        />
      </section>

      <section>
        <Typography.Title heading={6} className="!mb-4">
          调账记录
        </Typography.Title>
        <DataTable
          rowKey="id"
          pagination={false}
          data={billing.adjustments}
          noDataElement="暂无调账记录"
          columns={[
            { title: "时间", dataIndex: "at", width: 180 },
            {
              title: "金额（USD）",
              width: 150,
              render: (_, item: TenantBillingAdjustment) => (
                <span
                  className={clsx(
                    item.amountUsd >= 0 && "text-green-600",
                    item.amountUsd < 0 && "text-red-600",
                  )}
                >
                  {item.amountUsd > 0 ? "+" : ""}
                  {formatUsd(item.amountUsd)}
                </span>
              ),
            },
            { title: "原因", dataIndex: "reason" },
            { title: "操作人", dataIndex: "by", width: 140 },
          ]}
        />
      </section>

      <section>
        <Typography.Title heading={6} className="!mb-4">
          发票记录
        </Typography.Title>
        <DataTable
          rowKey="id"
          pagination={false}
          data={billing.invoices}
          noDataElement="暂无发票记录"
          columns={[
            { title: "发票号", dataIndex: "no" },
            { title: "账期", dataIndex: "period", width: 120 },
            {
              title: "金额（USD）",
              width: 150,
              render: (_, item: TenantInvoice) => formatUsd(item.amountUsd),
            },
            {
              title: "状态",
              width: 100,
              render: () => <Tag color="blue">已开具</Tag>,
            },
            { title: "开具日期", dataIndex: "issuedAt", width: 140 },
          ]}
        />
      </section>
    </>
  );
}
