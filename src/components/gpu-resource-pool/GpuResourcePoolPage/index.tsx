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
} from "../api";
import { GpuInventoryTable } from "../GpuInventoryTable";
import { GpuSummary } from "../GpuSummary";
import { TenantGpuAllocationTable } from "../TenantGpuAllocationTable";
import type { TenantGpuAllocation } from "../types";

interface QuotaFormValues {
  total: number;
}

const TabPane = Tabs.TabPane;

export function GpuResourcePoolPage() {
  const queryClient = useQueryClient();
  const [quotaTarget, setQuotaTarget] = useState<TenantGpuAllocation | null>(null);
  const [quotaForm] = Form.useForm<QuotaFormValues>();

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

  const refreshAll = async () => {
    await Promise.all([inventoryQuery.refetch(), occupancyQuery.refetch(), tenantsQuery.refetch()]);
  };

  const openQuotaModal = (tenant: TenantGpuAllocation) => {
    quotaForm.setFieldsValue({ total: tenant.quotaTotal });
    setQuotaTarget(tenant);
  };

  const submitQuota = () => {
    quotaForm.validate().then(({ total }) => {
      if (!quotaTarget) return;
      quotaMutation.mutate({ tenantId: quotaTarget.tenantId, total });
    });
  };

  const refreshing =
    inventoryQuery.isFetching || occupancyQuery.isFetching || tenantsQuery.isFetching;
  const inventory = inventoryQuery.data?.items || [];
  const inventoryProfile = inventoryQuery.data?.profile;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="GPU 资源池管理"
        subtitle="展示 ANI 返回的 GPU 库存、占用与租户 GPU 配额，并标明原型能力的接口接入状态。"
        extra={
          <Button loading={refreshing} onClick={() => void refreshAll()}>
            刷新
          </Button>
        }
      />

      <Alert
        type="info"
        content="当前后端未提供指定物理卡分配、对某张卡执行切分、维护/恢复、平台级调度队列与资源池事件接口，本页不模拟这些数据和写操作。库存中的租户/实例关系来自节点级占用推算，不能视为精确物理卡绑定。"
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

      <Tabs defaultActiveTab="tenant-ledger" type="card-gutter" lazyload>
        <TabPane key="tenant-ledger" title="租户分配台账">
          <TenantGpuAllocationTable
            data={tenantsQuery.data || []}
            loading={tenantsQuery.isPending}
            onEditQuota={openQuotaModal}
          />
        </TabPane>
        <TabPane key="inventory" title="设备列表">
          <GpuInventoryTable data={inventory} loading={inventoryQuery.isPending} />
        </TabPane>
        <TabPane key="scheduling-queues" title="调度队列">
          <Card title="调度队列" className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0">
            <Empty className="py-12" description="ANI 暂未提供 BOSS 平台级 GPU 调度队列接口" />
          </Card>
        </TabPane>
        <TabPane key="events" title="事件">
          <Card title="事件" className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0">
            <Empty className="py-12" description="ANI 暂未提供 GPU 资源池事件接口" />
          </Card>
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
        <Form form={quotaForm} layout="vertical">
          <Form.Item
            label="GPU 卡数上限"
            field="total"
            rules={[
              {
                required: true,
                type: "number",
                min: 0,
              },
            ]}
          >
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
