import {
  Alert,
  Button,
  Form,
  InputNumber,
  Message,
  Modal,
} from "@arco-design/web-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getApiErrorMessage } from "@/api/client";
import { ListPageHeader } from "@/components/common";
import {
  fetchGpuInventory,
  fetchGpuOccupancy,
  fetchTenantGpuAllocations,
  gpuResourcePoolQueryKeys,
  updateTenantGpuQuota,
  updateTenantGpuReservation,
} from "../api";
import { GpuInventoryTable } from "../GpuInventoryTable";
import { GpuDemoGuide } from "../GpuDemoGuide";
import { GpuSpecCatalog } from "../GpuSpecCatalog";
import { GpuSummary } from "../GpuSummary";
import { TenantGpuAllocationTable } from "../TenantGpuAllocationTable";
import type { TenantGpuAllocation } from "../types";

interface QuotaFormValues {
  total: number;
}

interface ReservationFormValues {
  allocatedGpuCount: number;
}

export function GpuResourcePoolPage() {
  const queryClient = useQueryClient();
  const [quotaTarget, setQuotaTarget] = useState<TenantGpuAllocation | null>(
    null,
  );
  const [reservationTarget, setReservationTarget] =
    useState<TenantGpuAllocation | null>(null);
  const [demoVisible, setDemoVisible] = useState(false);
  const [quotaForm] = Form.useForm<QuotaFormValues>();
  const [reservationForm] = Form.useForm<ReservationFormValues>();

  const inventoryQuery = useQuery({
    queryKey: gpuResourcePoolQueryKeys.inventory,
    queryFn: fetchGpuInventory,
  });
  const occupancyQuery = useQuery({
    queryKey: gpuResourcePoolQueryKeys.occupancy,
    queryFn: fetchGpuOccupancy,
  });
  const tenantsQuery = useQuery({
    queryKey: gpuResourcePoolQueryKeys.tenants,
    queryFn: fetchTenantGpuAllocations,
  });

  const tenantAllocatedTotal = useMemo(
    () =>
      tenantsQuery.data?.reduce(
        (total, tenant) => total + tenant.allocatedGpuCount,
        0,
      ),
    [tenantsQuery.data],
  );

  const refreshTenantLedger = () =>
    queryClient.invalidateQueries({
      queryKey: gpuResourcePoolQueryKeys.tenants,
    });

  const quotaMutation = useMutation({
    mutationFn: ({ tenantId, total }: { tenantId: string; total: number }) =>
      updateTenantGpuQuota(tenantId, total),
    onSuccess: async () => {
      await refreshTenantLedger();
      Message.success("GPU 配额上限已更新");
      setQuotaTarget(null);
      quotaForm.resetFields();
    },
    onError: (error) => Message.error(getApiErrorMessage(error)),
  });

  const reservationMutation = useMutation({
    mutationFn: ({
      tenantId,
      allocatedGpuCount,
    }: {
      tenantId: string;
      allocatedGpuCount: number;
    }) => updateTenantGpuReservation(tenantId, allocatedGpuCount),
    onSuccess: async (reservation) => {
      await refreshTenantLedger();
      Message.success(
        reservation.tightened
          ? "资源预留已按当前占用自动收紧"
          : "GPU 资源预留已更新",
      );
      setReservationTarget(null);
      reservationForm.resetFields();
    },
    onError: (error) => Message.error(getApiErrorMessage(error)),
  });

  const refreshAll = async () => {
    await Promise.all([
      inventoryQuery.refetch(),
      occupancyQuery.refetch(),
      tenantsQuery.refetch(),
      queryClient.invalidateQueries({
        queryKey: gpuResourcePoolQueryKeys.specs,
      }),
    ]);
  };

  const openQuotaModal = (tenant: TenantGpuAllocation) => {
    quotaForm.setFieldsValue({ total: tenant.quotaTotal });
    setQuotaTarget(tenant);
  };

  const openReservationModal = (tenant: TenantGpuAllocation) => {
    reservationForm.setFieldsValue({
      allocatedGpuCount: tenant.allocatedGpuCount,
    });
    setReservationTarget(tenant);
  };

  const submitQuota = () => {
    quotaForm.validate().then(({ total }) => {
      if (!quotaTarget) return;
      if (total < quotaTarget.allocatedGpuCount) {
        Message.warning(
          `配额上限不能低于当前资源预留 ${quotaTarget.allocatedGpuCount} 张`,
        );
        return;
      }
      quotaMutation.mutate({ tenantId: quotaTarget.tenantId, total });
    });
  };

  const submitReservation = () => {
    reservationForm.validate().then(({ allocatedGpuCount }) => {
      if (!reservationTarget) return;
      reservationMutation.mutate({
        tenantId: reservationTarget.tenantId,
        allocatedGpuCount,
      });
    });
  };

  const refreshing =
    inventoryQuery.isFetching ||
    occupancyQuery.isFetching ||
    tenantsQuery.isFetching;
  const inventory = inventoryQuery.data?.items || [];
  const inventoryProfile = inventoryQuery.data?.profile;
  const demoTenant = tenantsQuery.data?.find(
    (tenant) =>
      tenant.tenantId.toLowerCase() === "demo-corp" ||
      tenant.tenantName.toLowerCase() === "demo-corp",
  );

  const viewSection = (sectionId: string) => {
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="GPU 资源池管理"
        subtitle="展示 ANI 返回的 GPU 库存、占用与租户 GPU 配额/资源预留。"
        extra={
          <div className="flex items-center gap-2">
            <Button onClick={() => setDemoVisible(true)}>GPU 演示</Button>
            <Button loading={refreshing} onClick={() => void refreshAll()}>
              刷新
            </Button>
          </div>
        }
      />

      <Alert
        type="info"
        content="当前后端已提供 GPU 调度规格目录，但未提供指定物理卡分配、对某张卡执行切分、维护/恢复、平台级调度队列与资源池事件接口，本页不模拟这些写操作。库存中的租户/实例关系来自节点级占用推算，不能视为精确物理卡绑定。"
      />

      {inventoryProfile && !inventoryProfile.realProvider ? (
        <Alert
          type="warning"
          content={`当前库存来自开发 Provider“${inventoryProfile.provider || "-"}”，不是实际 Kubernetes 集群数据。${inventoryProfile.reason ? ` ${inventoryProfile.reason}` : ""}`}
        />
      ) : null}

      {occupancyQuery.isError ? (
        <Alert
          type="error"
          content={`GPU 占用汇总加载失败：${getApiErrorMessage(occupancyQuery.error)}。可点击右上角“刷新”重试。`}
        />
      ) : null}

      <GpuSummary
        occupancy={occupancyQuery.data}
        tenantAllocatedTotal={tenantAllocatedTotal}
        occupancyPending={occupancyQuery.isPending || occupancyQuery.isError}
        tenantsPending={tenantsQuery.isPending || tenantsQuery.isError}
      />

      <div id="gpu-tenant-ledger" className="scroll-mt-4">
        <TenantGpuAllocationTable
          data={tenantsQuery.data || []}
          loading={tenantsQuery.isPending}
          error={tenantsQuery.error}
          onRetry={() => void tenantsQuery.refetch()}
          onEditQuota={openQuotaModal}
          onEditReservation={openReservationModal}
        />
      </div>

      <div id="gpu-inventory" className="scroll-mt-4">
        <GpuInventoryTable
          data={inventory}
          loading={inventoryQuery.isPending}
          error={inventoryQuery.error}
          onRetry={() => void inventoryQuery.refetch()}
        />
      </div>

      <div id="gpu-spec-catalog" className="scroll-mt-4">
        <GpuSpecCatalog devices={inventory} />
      </div>

      <GpuDemoGuide
        visible={demoVisible}
        inventory={inventory}
        demoTenant={demoTenant}
        inventoryError={inventoryQuery.error}
        tenantError={tenantsQuery.error}
        refreshing={refreshing}
        onClose={() => setDemoVisible(false)}
        onRefresh={refreshAll}
        onViewSpecs={() => viewSection("gpu-spec-catalog")}
        onEditQuota={openQuotaModal}
        onEditReservation={openReservationModal}
      />

      <Modal
        title={`调整 GPU 配额上限${quotaTarget ? `：${quotaTarget.tenantName}` : ""}`}
        visible={Boolean(quotaTarget)}
        confirmLoading={quotaMutation.isPending}
        onOk={submitQuota}
        onCancel={() => {
          setQuotaTarget(null);
          quotaForm.resetFields();
        }}
      >
        <Alert
          type="warning"
          content={`配额上限不得低于当前资源预留 ${quotaTarget?.allocatedGpuCount ?? 0} 张；如需继续降低，请先调整资源预留。`}
          className="mb-4"
        />
        <Form form={quotaForm} layout="vertical">
          <Form.Item
            label="GPU 卡数上限"
            field="total"
            rules={[
              {
                required: true,
                type: "number",
                min: quotaTarget?.allocatedGpuCount ?? 0,
              },
            ]}
          >
            <InputNumber
              min={quotaTarget?.allocatedGpuCount ?? 0}
              precision={0}
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`调整 GPU 资源预留${reservationTarget ? `：${reservationTarget.tenantName}` : ""}`}
        visible={Boolean(reservationTarget)}
        confirmLoading={reservationMutation.isPending}
        onOk={submitReservation}
        onCancel={() => {
          setReservationTarget(null);
          reservationForm.resetFields();
        }}
      >
        <Alert
          type="warning"
          content="这里调整的是租户聚合预留上限，不会绑定到某一张物理 GPU。填写 0 会把预留上限设为 0，此时新建 GPU 实例会因预留不足被拒绝；若低于当前已用量或处理中占用，后端会自动收紧到安全值。"
          className="mb-4"
        />
        <Form form={reservationForm} layout="vertical">
          <Form.Item
            label="预留 GPU 卡数"
            field="allocatedGpuCount"
            rules={[
              {
                required: true,
                type: "number",
                min: 0,
                max: reservationTarget?.quotaTotal,
              },
            ]}
          >
            <InputNumber
              min={0}
              max={reservationTarget?.quotaTotal}
              precision={0}
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
