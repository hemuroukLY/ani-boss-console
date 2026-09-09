import { Alert, Button, Card, Message, Modal } from "@arco-design/web-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getApiErrorMessage } from "@/api/client";
import { DataTable, DataTableRowActionButton, type ListColumn } from "@/components/common";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import { gpuResourcePoolQueryKeys } from "../api";
import { createGpuSpec, deleteGpuSpec, fetchGpuSpecs } from "../spec-api";
import { GpuSpecCreateModal } from "../GpuSpecCreateModal";
import type { GpuInventoryDevice, GpuSpec } from "../types";

function formatMemory(memoryMb?: number) {
  if (!memoryMb) return "-";
  const gib = memoryMb / 1024;
  return `${Number.isInteger(gib) ? gib : gib.toFixed(1)} GiB`;
}

interface GpuSpecCatalogProps {
  devices: GpuInventoryDevice[];
}

export function GpuSpecCatalog({ devices }: GpuSpecCatalogProps) {
  const queryClient = useQueryClient();
  const [createVisible, setCreateVisible] = useState(false);
  const specsQuery = useQuery({
    queryKey: gpuResourcePoolQueryKeys.specs,
    queryFn: fetchGpuSpecs,
  });

  useListErrorNotification({
    id: "gpu-resource-specs",
    title: "GPU 调度规格目录加载失败",
    error: specsQuery.error,
  });

  const refreshSpecs = () =>
    queryClient.invalidateQueries({
      queryKey: gpuResourcePoolQueryKeys.specs,
    });

  const createMutation = useMutation({
    mutationFn: createGpuSpec,
    onSuccess: async () => {
      await refreshSpecs();
      Message.success("GPU 调度规格已创建");
      setCreateVisible(false);
    },
    onError: (error) => Message.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGpuSpec,
    onSuccess: async () => {
      await refreshSpecs();
      Message.success("GPU 调度规格已删除");
    },
    onError: (error) => Message.error(getApiErrorMessage(error)),
  });

  const confirmDelete = (spec: GpuSpec) => {
    Modal.confirm({
      title: `删除 GPU 调度规格“${spec.id}”？`,
      content: "仍被任一租户实例引用的规格会由后端拒绝删除。",
      okText: "删除",
      cancelText: "取消",
      okButtonProps: { status: "danger" },
      onOk: () => deleteMutation.mutateAsync(spec.id),
    });
  };

  const columns: ListColumn<GpuSpec>[] = [
    { title: "规格 ID", dataIndex: "id", width: 260 },
    { title: "节点标签值", dataIndex: "gpuType", width: 260 },
    {
      title: "模式",
      width: 100,
      render: (_, spec) =>
        spec.gpuMode === "wholecard" ? "整卡" : spec.gpuMode === "vgpu" ? "vGPU" : "-",
    },
    { title: "份数", dataIndex: "shares", width: 90 },
    {
      title: "每份显存",
      width: 120,
      render: (_, spec) => formatMemory(spec.mbPerShare),
    },
    {
      title: "总显存",
      width: 120,
      render: (_, spec) => formatMemory(spec.memoryTotalMb),
    },
    {
      title: "状态",
      width: 100,
      render: (_, spec) => (spec.available ? "可用" : "不可用"),
    },
    {
      title: "操作",
      width: 200,
      fixed: "right",
      render: (_, spec) => (
        <DataTableRowActionButton
          status="danger"
          disabled={deleteMutation.isPending}
          onClick={() => confirmDelete(spec)}
        >
          删除
        </DataTableRowActionButton>
      ),
    },
  ];

  return (
    <>
      <Card
        title="GPU 调度规格目录"
        extra={
          <Button type="primary" onClick={() => setCreateVisible(true)}>
            新建调度规格
          </Button>
        }
        className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0"
      >
        <Alert
          type="info"
          content="这里管理的是 Console 创建实例时使用的调度规格目录，不会立即切分某一张物理 GPU。"
          className="m-4"
        />
        <DataTable
          tableLabel="GPU 调度规格目录"
          rowKey="id"
          columns={columns}
          data={specsQuery.data || []}
          loading={specsQuery.isPending}
          pagination={false}
        />
      </Card>

      {createVisible && (
        <GpuSpecCreateModal
          devices={devices}
          submitting={createMutation.isPending}
          onCancel={() => setCreateVisible(false)}
          onSubmit={(input) => createMutation.mutate(input)}
        />
      )}
    </>
  );
}
