import {
  Alert,
  Button,
  Modal,
  Progress,
  Radio,
  Space,
  Spin,
  Typography,
} from "@arco-design/web-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createGpuPartition,
  fetchGpuPartitionTask,
  fetchLatestGpuPartitionTask,
  getGpuPartitionErrorMessage,
  gpuPartitionQueryKeys,
  type GpuInventoryDevice,
  type GpuPartitionShares,
  type GpuPartitionSkippedNode,
  type GpuPartitionTask,
} from "@/api/gpu-inventory";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import { hasElapsed } from "@/lib/date";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;
const terminalStatuses = new Set(["completed", "failed", "cancelled", "canceled"]);

const skippedReasonLabels: Record<string, string> = {
  node_busy: "节点忙",
  not_ready: "节点不在线",
  vgpu_mode: "已切分",
  missing_gpu_memory_label: "无法确定显存",
};

function isTerminalTask(task?: GpuPartitionTask) {
  return Boolean(task && terminalStatuses.has(task.status));
}

function isPollingTimedOut(task?: GpuPartitionTask) {
  if (!task?.createdAt || isTerminalTask(task)) return false;
  return hasElapsed(task.createdAt, POLL_TIMEOUT_MS);
}

function formatMemory(memoryMb?: number) {
  if (!memoryMb) return "-";
  const gib = memoryMb / 1024;
  return `${Number.isInteger(gib) ? gib : gib.toFixed(1)} GiB`;
}

function formatSkippedNode(node: GpuPartitionSkippedNode) {
  const reason = skippedReasonLabels[node.reason] || node.reason || "-";
  if (node.reason !== "node_busy" || !node.pods.length) return reason;
  return `${reason}（${node.pods.length} 个 GPU Pod 占用）`;
}

function eligibleForPartition(device: GpuInventoryDevice) {
  const mode = device.gpuMode?.trim().toLowerCase();
  if (mode === "vgpu") return false;
  const isWholecard = device.shares === 1 || (!device.shares && (!mode || mode === "wholecard"));
  return (
    device.status === "available" &&
    isWholecard &&
    (device.shares === 1 || (!device.gpuSharingSpec && !device.gpuSharingPolicy))
  );
}

interface GpuClusterPartitionModalProps {
  devices: GpuInventoryDevice[];
  onCancel: () => void;
  onTaskCompleted: (task: GpuPartitionTask) => void;
}

export function GpuClusterPartitionModal({
  devices,
  onCancel,
  onTaskCompleted,
}: GpuClusterPartitionModalProps) {
  const [shares, setShares] = useState<GpuPartitionShares>(2);
  const [activeTaskId, setActiveTaskId] = useState<string>();
  const [acceptedTask, setAcceptedTask] = useState<GpuPartitionTask>();
  const [ignoredRecoveredTaskId, setIgnoredRecoveredTaskId] = useState<string>();
  const completedTaskRef = useRef<string>();

  const eligibleDevices = useMemo(() => devices.filter(eligibleForPartition), [devices]);
  const latestTaskQuery = useQuery({
    queryKey: gpuPartitionQueryKeys.latest,
    queryFn: fetchLatestGpuPartitionTask,
  });

  const recoveredTask =
    latestTaskQuery.data &&
    !isTerminalTask(latestTaskQuery.data) &&
    latestTaskQuery.data.id !== ignoredRecoveredTaskId
      ? latestTaskQuery.data
      : undefined;
  const trackedTaskId = activeTaskId || recoveredTask?.id;

  const taskQuery = useQuery({
    queryKey: gpuPartitionQueryKeys.detail(trackedTaskId || "-"),
    queryFn: () => fetchGpuPartitionTask(trackedTaskId || ""),
    enabled: Boolean(trackedTaskId),
    refetchInterval: (query) => {
      const task = query.state.data;
      if (!task || isTerminalTask(task) || isPollingTimedOut(task)) return false;
      return POLL_INTERVAL_MS;
    },
  });

  const partitionMutation = useMutation({
    mutationFn: createGpuPartition,
    onSuccess: (task) => {
      setAcceptedTask(task);
      setActiveTaskId(task.id);
    },
  });

  useListErrorNotification({
    id: "gpu-partition-latest-task",
    title: "GPU 切分任务恢复失败",
    error: latestTaskQuery.error,
  });
  useListErrorNotification({
    id: "gpu-partition-task-detail",
    title: "GPU 切分任务进度加载失败",
    error: taskQuery.error,
  });

  const task = taskQuery.data || acceptedTask || recoveredTask;
  const timedOut = isPollingTimedOut(task);

  useEffect(() => {
    if (task?.status !== "completed" || completedTaskRef.current === task.id) return;
    completedTaskRef.current = task.id;
    onTaskCompleted(task);
  }, [onTaskCompleted, task]);

  const submit = () => {
    partitionMutation.mutate({ shares });
  };

  const resetFailedTask = () => {
    setIgnoredRecoveredTaskId(task?.id);
    setAcceptedTask(undefined);
    setActiveTaskId(undefined);
  };

  const footer = task ? (
    <Space>
      <Button onClick={onCancel}>关闭</Button>
      {task.status === "failed" ? (
        <Button type="primary" onClick={resetFailedTask}>
          重新配置并重试
        </Button>
      ) : null}
      {timedOut || taskQuery.isError ? (
        <Button loading={taskQuery.isFetching} onClick={() => void taskQuery.refetch()}>
          刷新进度
        </Button>
      ) : null}
    </Space>
  ) : (
    <Space>
      <Button disabled={partitionMutation.isPending} onClick={onCancel}>
        取消
      </Button>
      <Button
        type="primary"
        loading={partitionMutation.isPending}
        disabled={latestTaskQuery.isPending || latestTaskQuery.isError || !eligibleDevices.length}
        onClick={submit}
      >
        应用到集群
      </Button>
    </Space>
  );

  return (
    <Modal
      title="集群切分配置"
      visible
      footer={footer}
      style={{ width: 760 }}
      onCancel={() => {
        if (!partitionMutation.isPending) onCancel();
      }}
      unmountOnExit
    >
      {latestTaskQuery.isPending && !task ? (
        <div className="flex justify-center py-12">
          <Spin loading tip="正在检查最近的切分任务" />
        </div>
      ) : task ? (
        <Space direction="vertical" size="large" className="w-full">
          <Progress percent={Math.max(0, Math.min(100, task.progressPct))} />
          <Typography.Text>
            {task.status === "completed"
              ? "集群切分配置已完成"
              : task.status === "failed"
                ? "集群切分配置失败"
                : "正在将切分规则应用到集群"}
          </Typography.Text>
          {task.result?.lastMessage ? (
            <Typography.Text type="secondary">{task.result.lastMessage}</Typography.Text>
          ) : null}
          {timedOut ? (
            <Alert
              type="warning"
              content="任务仍在运行，已停止自动刷新。你可以稍后重新打开本窗口，或手动刷新进度。"
            />
          ) : null}
          {task.status === "failed" ? (
            <Alert
              type="error"
              content={task.errorMessage || "集群切分配置失败，请检查节点状态后重试。"}
            />
          ) : null}
          {task.result ? (
            <div className="space-y-3 rounded border border-solid border-gray-200 p-4">
              <Typography.Text>
                已应用 {task.result.appliedNodes.length} 个节点，跳过{" "}
                {task.result.skippedNodes.length}
                个节点，失败 {task.result.failedNodes.length} 个节点
              </Typography.Text>
              {task.result.appliedNodes.length ? (
                <div>
                  <Typography.Text type="secondary">已应用：</Typography.Text>
                  <div>{task.result.appliedNodes.join("、")}</div>
                </div>
              ) : null}
              {task.result.skippedNodes.map((node) => (
                <div key={`skipped-${node.nodeName}`}>
                  <Typography.Text type="secondary">{node.nodeName}：</Typography.Text>
                  {formatSkippedNode(node)}
                </div>
              ))}
              {task.result.failedNodes.map((node) => (
                <div key={`failed-${node.nodeName}`}>
                  <Typography.Text type="secondary">{node.nodeName}：</Typography.Text>
                  {node.reason || "-"}
                </div>
              ))}
            </div>
          ) : null}
        </Space>
      ) : (
        <Space direction="vertical" size="large" className="w-full">
          <Alert
            type="warning"
            content="配置会影响集群内所有租户 GPU 资源池；忙碌、离线或已切分的节点会自动跳过。"
          />
          <div>
            <Typography.Title heading={6}>等分规则</Typography.Title>
            <Radio.Group
              type="button"
              value={shares}
              onChange={(value) => setShares(value as GpuPartitionShares)}
            >
              <Radio value={2}>2 等分</Radio>
              <Radio value={4}>4 等分</Radio>
              <Radio value={8}>8 等分</Radio>
            </Radio.Group>
          </div>
          <div>
            <Typography.Title heading={6}>生效范围</Typography.Title>
            <Typography.Paragraph type="secondary">
              当前可应用到 {eligibleDevices.length}{" "}
              张空闲整卡。以下为按设备库存计算的预览，实际任务会按节点状态再次检查。
            </Typography.Paragraph>
            {eligibleDevices.length ? (
              <div className="max-h-64 space-y-2 overflow-auto rounded border border-solid border-gray-200 p-3">
                {eligibleDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between gap-4">
                    <span>
                      {device.nodeName} / GPU-{device.gpuIndex} · {device.gpuType || "-"} ·{" "}
                      {formatMemory(device.memoryTotalMb)}
                    </span>
                    <Typography.Text type="secondary">
                      每份{" "}
                      {device.memoryTotalMb ? formatMemory(device.memoryTotalMb / shares) : "-"}
                    </Typography.Text>
                  </div>
                ))}
              </div>
            ) : (
              <Alert type="warning" content="当前没有可应用切分规则的空闲整卡。" />
            )}
          </div>
          <Alert
            type="info"
            content="当前仅支持集群级 2、4、8 等分；暂不支持单卡切分、不等显存、任意份数和算力比例分配。"
          />
          {partitionMutation.error ? (
            <Alert type="error" content={getGpuPartitionErrorMessage(partitionMutation.error)} />
          ) : null}
        </Space>
      )}
    </Modal>
  );
}
