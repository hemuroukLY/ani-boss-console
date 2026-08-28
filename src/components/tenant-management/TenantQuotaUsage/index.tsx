import { useState } from "react";
import { Message, Modal } from "@arco-design/web-react";
import { useTenantManagement } from "@/features/tenant-management/TenantManagementProvider";
import type {
  Tenant,
  TenantQuotaRequest,
} from "@/features/tenant-management/model";
import { CreateQuotaRequestModal } from "./CreateQuotaRequestModal";
import { formatNumber } from "./formatters";
import { QuotaOverview } from "./QuotaOverview";
import { QuotaRequestTable } from "./QuotaRequestTable";
import { QuotaUsageTable } from "./QuotaUsageTable";
import { RebindPackageModal } from "./RebindPackageModal";
import { RejectQuotaRequestModal } from "./RejectQuotaRequestModal";

interface TenantQuotaUsageProps {
  tenant: Tenant;
}

export function TenantQuotaUsage({ tenant }: TenantQuotaUsageProps) {
  const {
    rebindTenantQuotaPackage,
    submitTenantQuotaRequest,
    resolveTenantQuotaRequest,
    refreshTenantUsage,
  } = useTenantManagement();
  const [packageModalVisible, setPackageModalVisible] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState(tenant.planCode);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestedGpuHours, setRequestedGpuHours] = useState(
    tenant.quotaLimits.gpuHours,
  );
  const [requestedStorageGi, setRequestedStorageGi] = useState(
    tenant.quotaLimits.storageGi,
  );
  const [requestReason, setRequestReason] = useState("");
  const [requestBy, setRequestBy] = useState(tenant.contact);
  const [rejectingRequest, setRejectingRequest] =
    useState<TenantQuotaRequest>();
  const [rejectReason, setRejectReason] = useState("");

  const confirmPackageChange = () => {
    if (!rebindTenantQuotaPackage(tenant.id, selectedPlanCode)) {
      Message.error("套餐改绑失败");
      return;
    }
    setPackageModalVisible(false);
    Message.success("套餐已改绑，当前配额上限保持不变");
  };

  const confirmQuotaRequest = () => {
    if (
      requestedGpuHours < tenant.quotaLimits.gpuHours ||
      requestedStorageGi < tenant.quotaLimits.storageGi
    ) {
      Message.warning("扩容申请不能低于当前配额上限");
      return;
    }
    if (
      requestedGpuHours === tenant.quotaLimits.gpuHours &&
      requestedStorageGi === tenant.quotaLimits.storageGi
    ) {
      Message.warning("请至少提高一项配额");
      return;
    }
    if (!requestReason.trim() || !requestBy.trim()) {
      Message.warning("请填写申请人和申请原因");
      return;
    }
    const created = submitTenantQuotaRequest(tenant.id, {
      requestedGpuHours,
      requestedStorageGi,
      reason: requestReason.trim(),
      by: requestBy.trim(),
    });
    if (!created) {
      Message.error("配额申请提交失败");
      return;
    }
    setRequestModalVisible(false);
    Message.success("配额申请已提交");
  };

  const approveRequest = (request: TenantQuotaRequest) => {
    Modal.confirm({
      title: "通过配额申请",
      content: `确认将 GPU-Hours 上限调整为 ${formatNumber(request.requestedGpuHours)}、存储上限调整为 ${formatNumber(request.requestedStorageGi)} Gi？`,
      onOk: () => {
        if (resolveTenantQuotaRequest(tenant.id, request.id, "approved"))
          Message.success("配额申请已通过");
      },
    });
  };

  const confirmRejectRequest = () => {
    if (!rejectingRequest || !rejectReason.trim()) {
      Message.warning("请填写驳回原因");
      return;
    }
    if (
      resolveTenantQuotaRequest(
        tenant.id,
        rejectingRequest.id,
        "rejected",
        rejectReason.trim(),
      )
    ) {
      setRejectingRequest(undefined);
      setRejectReason("");
      Message.success("配额申请已驳回");
    }
  };

  return (
    <div className="space-y-6 pb-5">
      <QuotaOverview
        tenant={tenant}
        onRefresh={() =>
          Modal.confirm({
            title: "刷新用量",
            content: "确认拉取并更新当前租户的最新资源用量？",
            onOk: () => {
              if (refreshTenantUsage(tenant.id)) Message.success("用量已刷新");
            },
          })
        }
        onRebindPackage={() => {
          setSelectedPlanCode(tenant.planCode);
          setPackageModalVisible(true);
        }}
      />
      <QuotaUsageTable tenant={tenant} />
      <QuotaRequestTable
        requests={tenant.quotaRequests}
        onCreate={() => {
          setRequestedGpuHours(tenant.quotaLimits.gpuHours);
          setRequestedStorageGi(tenant.quotaLimits.storageGi);
          setRequestReason("");
          setRequestBy(tenant.contact);
          setRequestModalVisible(true);
        }}
        onApprove={approveRequest}
        onReject={(request) => {
          setRejectReason("");
          setRejectingRequest(request);
        }}
      />
      <RebindPackageModal
        visible={packageModalVisible}
        planCode={selectedPlanCode}
        onPlanCodeChange={setSelectedPlanCode}
        onCancel={() => setPackageModalVisible(false)}
        onConfirm={confirmPackageChange}
      />
      <CreateQuotaRequestModal
        visible={requestModalVisible}
        gpuHours={requestedGpuHours}
        storageGi={requestedStorageGi}
        requestedBy={requestBy}
        reason={requestReason}
        onGpuHoursChange={setRequestedGpuHours}
        onStorageGiChange={setRequestedStorageGi}
        onRequestedByChange={setRequestBy}
        onReasonChange={setRequestReason}
        onCancel={() => setRequestModalVisible(false)}
        onConfirm={confirmQuotaRequest}
      />
      <RejectQuotaRequestModal
        visible={Boolean(rejectingRequest)}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onCancel={() => setRejectingRequest(undefined)}
        onConfirm={confirmRejectRequest}
      />
    </div>
  );
}
