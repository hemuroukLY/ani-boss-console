import { useMemo, useState } from "react";
import { Message, Modal, Result } from "@arco-design/web-react";
import { useTenantManagement } from "@/components/tenant/TenantManagementProvider/useTenantManagement";
import type { Tenant } from "@/components/tenant/model";
import { formatMonth } from "@/lib/date";
import { BillingAccountOverview } from "./BillingAccountOverview";
import { BillingRecords } from "./BillingRecords";
import { CreditAdjustmentModal } from "./CreditAdjustmentModal";
import { formatUsd } from "./formatters";

interface TenantBillingSummaryProps {
  tenant: Tenant;
}

export function TenantBillingSummary({ tenant }: TenantBillingSummaryProps) {
  const { tenantBillings, applyTenantBillingAction } = useTenantManagement();
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const billing = useMemo(
    () => tenantBillings.find((item) => item.tenantId === tenant.id),
    [tenant.id, tenantBillings],
  );

  const showResult = (result: { ok: boolean; reason?: string; message?: string }) => {
    if (result.ok) {
      Message.success(result.message || "操作成功");
      return true;
    }
    Message.error(result.reason || "操作失败");
    return false;
  };

  if (!billing) {
    return <Result status="404" title="未找到计费账户" subTitle="当前租户尚未建立计费账户。" />;
  }

  const confirmAction = (
    action: "refresh_usage" | "generate_invoice" | "mark_settled",
    title: string,
    content: string,
  ) => {
    Modal.confirm({
      title,
      content,
      onOk: () => {
        showResult(applyTenantBillingAction(tenant.id, action));
      },
    });
  };

  const confirmAdjustment = () => {
    if (!adjustmentAmount) {
      Message.warning("调账金额不能为 0");
      return;
    }
    if (
      showResult(
        applyTenantBillingAction(tenant.id, "adjust_credit", {
          amountUsd: adjustmentAmount,
          reason: adjustmentReason,
        }),
      )
    ) {
      setAdjustmentModalVisible(false);
      setAdjustmentAmount(0);
      setAdjustmentReason("");
    }
  };

  return (
    <div className="space-y-7 pb-5">
      <BillingAccountOverview
        billing={billing}
        onRefresh={() =>
          confirmAction(
            "refresh_usage",
            "刷新用量",
            `确认刷新 ${formatMonth(billing.period)} 账期的用量与费用？`,
          )
        }
        onAdjust={() => {
          setAdjustmentAmount(0);
          setAdjustmentReason("");
          setAdjustmentModalVisible(true);
        }}
        onGenerateInvoice={() =>
          confirmAction(
            "generate_invoice",
            "生成发票",
            `确认按本期用量费用 ${formatUsd(billing.usageCostUsd)} 生成发票？`,
          )
        }
        onSettle={() =>
          confirmAction(
            "mark_settled",
            "标记结清",
            "确认将当前欠费账单标记为已结清？欠费冻结的租户将同时恢复。",
          )
        }
        onExport={() => showResult(applyTenantBillingAction(tenant.id, "export_statement"))}
      />
      <BillingRecords billing={billing} />
      <CreditAdjustmentModal
        visible={adjustmentModalVisible}
        amount={adjustmentAmount}
        reason={adjustmentReason}
        onAmountChange={setAdjustmentAmount}
        onReasonChange={setAdjustmentReason}
        onConfirm={confirmAdjustment}
        onCancel={() => setAdjustmentModalVisible(false)}
      />
    </div>
  );
}
