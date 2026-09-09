import { ApiError, apiRequest, getApiErrorMessage } from "@/api/client";
import type {
  CreateGpuPartitionInput,
  GpuPartitionFailedNode,
  GpuPartitionShares,
  GpuPartitionSkippedNode,
  GpuPartitionTask,
  GpuPartitionTaskResult,
} from "./types";

interface GpuPartitionPodResponse {
  namespace?: string;
  name?: string;
  reason?: string;
}

interface GpuPartitionSkippedNodeResponse {
  node_name?: string;
  reason?: string;
  pods?: GpuPartitionPodResponse[];
}

interface GpuPartitionFailedNodeResponse {
  node_name?: string;
  ok?: boolean;
  reason?: string;
}

interface GpuPartitionTaskResultResponse {
  shares?: number;
  applied_nodes?: string[];
  skipped_nodes?: GpuPartitionSkippedNodeResponse[];
  failed_nodes?: GpuPartitionFailedNodeResponse[];
  last_message?: string;
}

interface GpuPartitionTaskResponse {
  id?: string;
  task_id?: string;
  idempotency_key?: string;
  task_type?: string;
  resource_type?: string;
  resource_id?: string;
  status?: string;
  attempt_count?: number;
  max_attempts?: number;
  progress_pct?: number;
  result?: GpuPartitionTaskResultResponse | null;
  error_message?: string | null;
  created_at?: string;
  completed_at?: string | null;
}

interface GpuPartitionTaskListResponse {
  items?: GpuPartitionTaskResponse[];
  next_cursor?: string | null;
}

export const gpuPartitionQueryKeys = {
  latest: ["gpu-resource-pool", "partition-task", "latest"] as const,
  detail: (taskId: string) => ["gpu-resource-pool", "partition-task", taskId] as const,
};

function asPartitionShares(value?: number): GpuPartitionShares | undefined {
  return value === 2 || value === 4 || value === 8 ? value : undefined;
}

function mapSkippedNode(node: GpuPartitionSkippedNodeResponse): GpuPartitionSkippedNode {
  return {
    nodeName: node.node_name || "-",
    reason: node.reason || "-",
    pods: (node.pods || []).map((pod) => ({
      namespace: pod.namespace || "-",
      name: pod.name || "-",
      reason: pod.reason || undefined,
    })),
  };
}

function mapFailedNode(node: GpuPartitionFailedNodeResponse): GpuPartitionFailedNode {
  return {
    nodeName: node.node_name || "-",
    ok: node.ok,
    reason: node.reason || "-",
  };
}

function mapTaskResult(
  result?: GpuPartitionTaskResultResponse | null,
): GpuPartitionTaskResult | undefined {
  if (!result) return undefined;
  return {
    shares: asPartitionShares(result.shares),
    appliedNodes: result.applied_nodes || [],
    skippedNodes: (result.skipped_nodes || []).map(mapSkippedNode),
    failedNodes: (result.failed_nodes || []).map(mapFailedNode),
    lastMessage: result.last_message || undefined,
  };
}

function mapGpuPartitionTask(response: GpuPartitionTaskResponse): GpuPartitionTask {
  return {
    id: response.id || response.task_id || "",
    idempotencyKey: response.idempotency_key,
    taskType: response.task_type || "gpu_partition",
    resourceType: response.resource_type,
    resourceId: response.resource_id,
    status: response.status || "running",
    attemptCount: response.attempt_count,
    maxAttempts: response.max_attempts,
    progressPct: response.progress_pct || 0,
    result: mapTaskResult(response.result),
    errorMessage: response.error_message || undefined,
    createdAt: response.created_at,
    completedAt: response.completed_at || undefined,
  };
}

export async function createGpuPartition(
  input: CreateGpuPartitionInput,
): Promise<GpuPartitionTask> {
  const response = await apiRequest<GpuPartitionTaskResponse>("/gpu-inventory/gpu-partitions", {
    method: "POST",
    headers: { "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify({ shares: input.shares }),
  });
  const task = mapGpuPartitionTask(response);
  if (!task.id) throw new Error("GPU 切分任务创建成功，但响应中缺少任务 ID");
  return task;
}

export async function fetchGpuPartitionTask(taskId: string): Promise<GpuPartitionTask> {
  const response = await apiRequest<GpuPartitionTaskResponse>(
    `/tasks/${encodeURIComponent(taskId)}`,
  );
  return mapGpuPartitionTask(response);
}

export async function fetchLatestGpuPartitionTask(): Promise<GpuPartitionTask | undefined> {
  const query = new URLSearchParams({ task_type: "gpu_partition", limit: "1" });
  const response = await apiRequest<GpuPartitionTaskListResponse>(`/tasks?${query.toString()}`);
  const latest = response.items?.[0];
  return latest ? mapGpuPartitionTask(latest) : undefined;
}

export function getGpuPartitionErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return getApiErrorMessage(error);
  if (error.status === 403) return "需要平台管理员身份才能配置集群 GPU 切分";
  if (error.code === "NO_IDLE_WHOLECARD_GPUS") return "集群内没有可切分的空闲整卡节点";
  if (error.code === "UNAVAILABLE" || error.code === "NOT_CONFIGURED") {
    return "GPU 切分服务暂不可用，请稍后重试";
  }
  return getApiErrorMessage(error);
}
