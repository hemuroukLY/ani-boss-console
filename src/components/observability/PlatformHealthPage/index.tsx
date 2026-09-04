import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import {
  DataTableNameCell,
  DataTableRowActions,
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  type ListColumn,
} from "@/components/common";
import { Metric } from "@/components/overview/Metric";
import {
  platformComponents,
  type HealthStatus,
  type PlatformComponentHealth,
} from "../model";

const healthMeta: Record<HealthStatus, { label: string; className: string }> = {
  ok: { label: "正常", className: "bg-green-50 text-green-700" },
  degraded: { label: "降级", className: "bg-orange-50 text-orange-700" },
  error: { label: "异常", className: "bg-red-50 text-red-700" },
};

function HealthBadge({ status }: { status: HealthStatus }) {
  const meta = healthMeta[status];
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export function PlatformHealthPage() {
  const okCount = platformComponents.filter(
    (item) => item.status === "ok",
  ).length;
  const degradedCount = platformComponents.filter(
    (item) => item.status === "degraded",
  ).length;
  const errorCount = platformComponents.filter(
    (item) => item.status === "error",
  ).length;
  const failedDependencies = platformComponents.flatMap((component) =>
    component.dependencies
      .filter((dependency) => dependency.status === "fail")
      .map((dependency) => ({ component, dependency })),
  );

  const columns: ListColumn<PlatformComponentHealth>[] = [
    { title: "分组", dataIndex: "group", width: 90 },
    {
      title: "组件",
      dataIndex: "name",
      width: 210,
      fixed: "left",
      render: (_, component) => (
        <DataTableNameCell
          name={component.name}
          secondary={component.service}
        />
      ),
    },
    {
      title: "状态",
      width: 90,
      render: (_, component) => <HealthBadge status={component.status} />,
    },
    { title: "版本", dataIndex: "version", width: 130 },
    { title: "就绪副本", dataIndex: "replicas", width: 100 },
    {
      title: "P99",
      width: 100,
      render: (_, component) =>
        component.p99Ms === undefined ? "-" : `${component.p99Ms} ms`,
    },
    {
      title: "错误率",
      width: 100,
      render: (_, component) => `${component.errorRate.toFixed(2)}%`,
    },
    {
      title: "依赖检查",
      width: 300,
      render: (_, component) => (
        <div className="flex flex-wrap gap-1">
          {component.dependencies.map((dependency) => (
            <span
              key={dependency.name}
              className={clsx(
                "rounded px-2 py-0.5 text-xs",
                dependency.status === "ok"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700",
              )}
              title={dependency.error}
            >
              {dependency.name}: {dependency.status}
              {dependency.latencyMs === undefined
                ? ""
                : ` · ${dependency.latencyMs} ms`}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "下钻",
      width: 180,
      fixed: "right",
      render: () => (
        <DataTableRowActions>
          <Link to="/health-metrics" className="text-blue-600 no-underline">
            指标
          </Link>
          <Link to="/health-logs" className="text-blue-600 no-underline">
            日志
          </Link>
          <Link to="/health-traces" className="text-blue-600 no-underline">
            Trace
          </Link>
        </DataTableRowActions>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="平台健康"
        subtitle="全平台控制面与数据面组件运行态，异常和降级项优先展示。"
      />

      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric
          label="整体状态"
          value="异常"
          hint="存在不可用组件"
          tone="danger"
        />
        <Metric label="正常" value={String(okCount)} hint="status = ok" />
        <Metric
          label="降级"
          value={String(degradedCount)}
          hint="需要关注"
          tone="warning"
        />
        <Metric
          label="异常"
          value={String(errorCount)}
          hint="优先处置"
          tone="danger"
        />
      </section>

      <section className="grid grid-cols-2 gap-3.5 max-[980px]:grid-cols-1">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="text-base font-semibold text-gray-900">
            组件状态分布
          </div>
          <div className="mt-5 space-y-4">
            {(
              [
                ["正常", okCount, "bg-green-500"],
                ["降级", degradedCount, "bg-orange-500"],
                ["异常", errorCount, "bg-red-500"],
              ] as const
            ).map(([label, count, color]) => (
              <div
                key={label}
                className="grid grid-cols-[48px_1fr_32px] items-center gap-3 text-sm"
              >
                <span>{label}</span>
                <div className="h-2 rounded bg-gray-100">
                  <div
                    className={`h-2 rounded ${color}`}
                    style={{
                      width: `${Math.max(5, (count / platformComponents.length) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-right text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="text-base font-semibold text-gray-900">异常依赖</div>
          <div className="mt-3 space-y-2">
            {failedDependencies.map(({ component, dependency }) => (
              <div
                key={`${component.id}-${dependency.name}`}
                className="rounded border border-red-100 bg-red-50 px-4 py-3"
              >
                <div className="font-medium text-red-700">
                  {component.name} → {dependency.name}
                </div>
                <div className="mt-1 text-xs text-red-600">
                  {dependency.error ?? "依赖检查失败"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold text-gray-900">
                服务分组健康
              </div>
              <div className="mt-1 text-xs text-gray-500">
                本页只读巡检，不提供服务重启或扩缩容操作。
              </div>
            </div>
            <span className="text-xs text-gray-500">
              共 {platformComponents.length} 个组件
            </span>
          </div>
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={[...platformComponents].sort((left, right) => {
            const rank = { error: 0, degraded: 1, ok: 2 };
            return rank[left.status] - rank[right.status];
          })}
          pagination={false}
          scroll={{ x: 1300 }}
          emptyText="暂无组件健康数据"
        />
      </ListPageFrame>
    </div>
  );
}
