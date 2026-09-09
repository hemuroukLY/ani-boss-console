import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  InputNumber,
  Message,
  Modal,
  Tabs,
} from "@arco-design/web-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getApiErrorMessage } from "@/api/client";
import { ListPageHeader } from "@/components/common";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import {
  fetchGpuInventory,
  fetchGpuOccupancy,
  fetchTenantGpuAllocations,
  gpuResourcePoolQueryKeys,
  updateTenantGpuQuota,
  updateTenantGpuReservation,
} from "../api";
import { GpuClusterPartitionFlow } from "../GpuClusterPartitionFlow";
import { GpuInventoryTable } from "../GpuInventoryTable";
import { GpuSummary } from "../GpuSummary";
import { TenantGpuAllocationTable } from "../TenantGpuAllocationTable";
import type { TenantGpuAllocation } from "../types";
import styles from "./index.module.css";

interface QuotaFormValues {
  total: number;
}

interface ReservationFormValues {
  allocatedGpuCount: number;
}

const TabPane = Tabs.TabPane;

export function GpuResourcePoolPage() {
  const queryClient = useQueryClient();
  const [quotaTarget, setQuotaTarget] = useState<TenantGpuAllocation | null>(null);
  const [reservationTarget, setReservationTarget] = useState<TenantGpuAllocation | null>(null);
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

  useListErrorNotification({
    id: "gpu-resource-occupancy",
    title: "GPU 占用汇总加载失败",
    error: occupancyQuery.error,
  });
  useListErrorNotification({
    id: "gpu-resource-tenants",
    title: "租户 GPU 台账加载失败",
    error: tenantsQuery.error,
  });
  useListErrorNotification({
    id: "gpu-resource-inventory",
    title: "GPU 设备库存加载失败",
    error: inventoryQuery.error,
  });

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
        reservation.tightened ? "资源预留已按当前占用自动收紧" : "GPU 资源预留已更新",
      );
      setReservationTarget(null);
      reservationForm.resetFields();
    },
    onError: (error) => Message.error(getApiErrorMessage(error)),
  });

  const refreshAll = async () => {
    await Promise.all([inventoryQuery.refetch(), occupancyQuery.refetch(), tenantsQuery.refetch()]);
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
        Message.warning(`配额上限不能低于当前资源预留 ${quotaTarget.allocatedGpuCount} 张`);
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
    inventoryQuery.isFetching || occupancyQuery.isFetching || tenantsQuery.isFetching;
  const inventory = inventoryQuery.data?.items || [];
  const inventoryProfile = inventoryQuery.data?.profile;

  return (
    <div className={styles.page}>
      <ListPageHeader
        title="GPU 资源池管理"
        subtitle="查看 GPU 库存与租户配额，并在集群上统一配置空闲整卡的切分规则。"
        extra={
          <Button loading={refreshing} onClick={() => void refreshAll()}>
            刷新
          </Button>
        }
      />

      <Alert
        type="info"
        content="集群切分会应用到所有空闲整卡，忙碌、离线或已切分节点会自动跳过。当前仍未提供指定物理卡分配、维护/恢复、平台级调度队列与资源池事件接口；库存中的租户/实例关系来自节点级占用推算，不能视为精确物理卡绑定。"
      />

      {inventoryProfile && !inventoryProfile.realProvider ? (
        <Alert
          type="warning"
          content={`当前库存来自开发 Provider“${inventoryProfile.provider || "-"}”，不是实际 Kubernetes 集群数据。${inventoryProfile.reason ? ` ${inventoryProfile.reason}` : ""}`}
        />
      ) : null}

      <GpuSummary
        occupancy={occupancyQuery.data}
        occupancyPending={occupancyQuery.isPending || occupancyQuery.isError}
      />

      <Tabs
        className={styles.tabs}
        defaultActiveTab="tenant-ledger"
        type="card-gutter"
        lazyload
        justify
      >
        <TabPane key="tenant-ledger" title="租户分配台账">
          <div className={styles.tabPanel}>
            <TenantGpuAllocationTable
              data={tenantsQuery.data || []}
              loading={tenantsQuery.isPending}
              onEditQuota={openQuotaModal}
              onEditReservation={openReservationModal}
            />
          </div>
        </TabPane>
        <TabPane key="inventory" title="设备列表">
          <div className={styles.tabPanel}>
            <GpuInventoryTable
              data={inventory}
              loading={inventoryQuery.isPending}
              extra={<GpuClusterPartitionFlow devices={inventory} />}
            />
          </div>
        </TabPane>
        <TabPane key="scheduling-queues" title="调度队列">
          <div className={styles.tabPanel}>
            <Card title="调度队列" className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0">
              <Empty className="py-12" description="ANI 暂未提供 BOSS 平台级 GPU 调度队列接口" />
            </Card>
          </div>
        </TabPane>
        <TabPane key="events" title="事件">
          <div className={styles.tabPanel}>
            <Card title="事件" className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0">
              <Empty className="py-12" description="ANI 暂未提供 GPU 资源池事件接口" />
            </Card>
          </div>
        </TabPane>
      </Tabs>

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
          content="这里调整的是租户聚合预留上限，不会绑定到某一张物理 GPU。填写 0 会把预留上限设为 0；若低于当前已用量或处理中占用，后端会自动收紧到安全值。"
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
