import { Alert, Button } from "@arco-design/web-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import {
  fetchPlatformServiceHealth,
  platformQueryKeys,
  type PlatformServiceHealthComponent,
  type PlatformServiceScrapeStatus,
} from "@/api/platform";
import {
  DataTableNameCell,
  DataTableRowActions,
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  type ListColumn,
} from "@/components/common";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import { Metric } from "@/components/overview/Metric";

const healthMeta: Record<PlatformServiceScrapeStatus, { label: string; className: string }> = {
  reachable: { label: "正常", className: "bg-green-50 text-green-700" },
  unknown: { label: "未知", className: "bg-orange-50 text-orange-700" },
  unreachable: { label: "异常", className: "bg-red-50 text-red-700" },
};

const serviceNames: Record<string, string> = {
  "ani-gateway": "API 网关",
  "auth-service": "认证服务",
  "model-service": "模型服务",
  "task-service": "任务服务",
  "inference-service": "推理服务",
  "tenant-service": "租户服务",
  "metering-service": "计量服务",
};

function HealthBadge({ status }: { status: PlatformServiceScrapeStatus }) {
  const meta = healthMeta[status];
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function formatObservedAt(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function formatLastCollected(value?: number) {
  if (value === undefined) return "-";
  if (value < 10) return "刚刚";
  if (value < 60) return `${Math.round(value)} 秒前`;
  if (value < 3600) return `${Math.round(value / 60)} 分钟前`;
  return `${Math.round(value / 3600)} 小时前`;
}

export function PlatformHealthPage() {
  const healthQuery = useQuery({
    queryKey: platformQueryKeys.serviceHealth,
    queryFn: fetchPlatformServiceHealth,
  });
  useListErrorNotification({
    id: "platform-service-health",
    title: "平台健康加载失败",
    error: healthQuery.error,
  });
  const components = healthQuery.data?.components || [];
  const reachableCount = components.filter((item) => item.scrapeStatus === "reachable").length;
  const unknownCount = components.filter((item) => item.scrapeStatus === "unknown").length;
  const unreachableCount = components.filter((item) => item.scrapeStatus === "unreachable").length;
  const total = components.length;
  const overall = healthQuery.isPending
    ? "加载中"
    : healthQuery.isError
      ? "-"
      : unreachableCount > 0
        ? "异常"
        : unknownCount > 0
          ? "部分未知"
          : "正常";
  const overallTone = unreachableCount > 0 ? "danger" : unknownCount > 0 ? "warning" : undefined;

  const columns: ListColumn<PlatformServiceHealthComponent>[] = [
    { title: "范围", width: 100, render: () => "核心服务" },
    {
      title: "组件",
      width: 220,
      fixed: "left",
      render: (_, component) => (
        <DataTableNameCell
          name={serviceNames[component.serviceName] || component.serviceName}
          id={component.serviceName}
        />
      ),
    },
    {
      title: "状态",
      width: 90,
      render: (_, component) => <HealthBadge status={component.scrapeStatus} />,
    },
    {
      title: "版本",
      width: 200,
      render: (_, component) => component.versions.join(", ") || "-",
    },
    {
      title: "可达 / 观测副本",
      width: 150,
      render: (_, component) => `${component.reachableReplicas} / ${component.observedReplicas}`,
    },
    {
      title: "最近采集",
      width: 110,
      render: (_, component) => formatLastCollected(component.sampleAgeSeconds),
    },
    {
      title: "操作",
      width: 240,
      fixed: "right",
      render: () => (
        <DataTableRowActions>
          <Link to="/health-metrics" className="text-blue-600 no-underline">
            查看指标
          </Link>
          <Link to="/health-logs" className="text-blue-600 no-underline">
            查看日志
          </Link>
          <Link to="/health-traces" className="text-blue-600 no-underline">
            查看链路
          </Link>
        </DataTableRowActions>
      ),
    },
  ];

  const distribution = [
    ["正常", reachableCount, "bg-green-500"],
    ["未知", unknownCount, "bg-orange-500"],
    ["异常", unreachableCount, "bg-red-500"],
  ] as const;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="平台健康"
        subtitle="ANI 核心服务的 Prometheus 抓取状态与可达副本。"
        extra={
          <Button loading={healthQuery.isFetching} onClick={() => void healthQuery.refetch()}>
            刷新
          </Button>
        }
      />

      <Alert
        type="info"
        content="当前接口固定覆盖 ANI 网关、认证、模型、任务、推理、租户和计量七个核心服务，只提供抓取可达性、观测副本、版本与最近采集时间；P99、错误率和依赖检查尚无平台接口。"
      />

      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric label="整体状态" value={overall} hint="七个核心服务" tone={overallTone} />
        <Metric
          label="正常"
          value={healthQuery.isPending || healthQuery.isError ? "-" : String(reachableCount)}
          hint="scrape_status = reachable"
        />
        <Metric
          label="未知"
          value={healthQuery.isPending || healthQuery.isError ? "-" : String(unknownCount)}
          hint="未观测到目标"
          tone="warning"
        />
        <Metric
          label="异常"
          value={healthQuery.isPending || healthQuery.isError ? "-" : String(unreachableCount)}
          hint="已观测但不可达"
          tone="danger"
        />
      </section>

      <section className="grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="text-base font-semibold text-gray-900">服务状态分布</div>
          <div className="mt-5 space-y-4">
            {distribution.map(([label, count, color]) => (
              <div
                key={label}
                className="grid grid-cols-[48px_1fr_32px] items-center gap-3 text-sm"
              >
                <span>{label}</span>
                <div className="h-2 rounded bg-gray-100">
                  <div
                    className={clsx("h-2 rounded", color)}
                    style={{
                      width: `${total === 0 ? 0 : (count / total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-right text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="text-base font-semibold text-gray-900">采集范围</div>
          <dl className="mt-4 grid grid-cols-[96px_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-gray-500">覆盖范围</dt>
            <dd className="m-0 text-gray-900">
              {healthQuery.data?.coverage === "partial"
                ? "部分覆盖"
                : healthQuery.data?.coverage || "-"}
            </dd>
            <dt className="text-gray-500">信号来源</dt>
            <dd className="m-0 text-gray-900">
              {healthQuery.data?.signal === "prometheus_scrape"
                ? "Prometheus 抓取"
                : healthQuery.data?.signal || "-"}
            </dd>
            <dt className="text-gray-500">数据源状态</dt>
            <dd className="m-0 text-gray-900">
              {healthQuery.data?.sourceStatus === "ok"
                ? "正常"
                : healthQuery.data?.sourceStatus || "-"}
            </dd>
            <dt className="text-gray-500">观测时间</dt>
            <dd className="m-0 text-gray-900">{formatObservedAt(healthQuery.data?.observedAt)}</dd>
          </dl>
        </div>
      </section>

      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold text-gray-900">服务分组健康</div>
              <div className="mt-1 text-xs text-gray-500">
                本页只读巡检，不提供服务重启或扩缩容操作。
              </div>
            </div>
            <span className="text-xs text-gray-500">共 {total} 个组件</span>
          </div>
        }
      >
        <ListDataTable
          rowKey="serviceName"
          columns={columns}
          data={[...components].sort((left, right) => {
            const rank: Record<PlatformServiceScrapeStatus, number> = {
              unreachable: 0,
              unknown: 1,
              reachable: 2,
            };
            return rank[left.scrapeStatus] - rank[right.scrapeStatus];
          })}
          loading={healthQuery.isPending}
          pagination={false}
          scroll={{ x: 1050 }}
          emptyText="暂无组件健康数据"
        />
      </ListPageFrame>
    </div>
  );
}
