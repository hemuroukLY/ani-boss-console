import { Alert, Button, Empty, Progress, Space } from "@arco-design/web-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  fetchPlatformCapacity,
  platformQueryKeys,
  type PlatformCapacityRegion,
} from "@/api/platform";
import { Metric } from "@/components/overview/Metric";
import { OverviewPageHeader } from "@/components/overview/OverviewPageHeader";
import { Panel } from "@/components/overview/Panel";
import { SoftList } from "@/components/overview/SoftList";
import { SoftRow } from "@/components/overview/SoftList/SoftRow";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";

export const Route = createFileRoute("/overview-capacity/")({
  component: CapacityOverviewRoute,
});

function CapacityOverviewRoute() {
  const navigate = useNavigate();
  const capacityQuery = useQuery({
    queryKey: platformQueryKeys.capacity,
    queryFn: fetchPlatformCapacity,
  });
  useListErrorNotification({
    id: "platform-capacity",
    title: "平台容量加载失败",
    error: capacityQuery.error,
  });
  const summary = capacityQuery.data?.summary;
  const regions = capacityQuery.data?.regions || [];

  const formatValue = (value: number | undefined) =>
    value === undefined ? "-" : value.toLocaleString("zh-CN");

  const regionTitle = (region: PlatformCapacityRegion) =>
    `${region.displayName || region.name || region.code}  ${region.code}`;

  const regionStatus = (region: PlatformCapacityRegion) => {
    if (region.status !== "enabled") return "未启用";
    return region.openForTenant ? "可开通" : "未开放租户";
  };

  const regionUsagePercent = (region: PlatformCapacityRegion) => {
    const { gpuTotal, gpuFree } = region.capacity;
    if (gpuTotal <= 0) return 0;
    return Math.round(((gpuTotal - gpuFree) / gpuTotal) * 100);
  };

  return (
    <>
      <OverviewPageHeader
        title="资源池与容量态势"
        subtitle="按 Region 查看容量与租户占用"
        extra={
          <Button
            loading={capacityQuery.isFetching}
            onClick={() => void capacityQuery.refetch()}
          >
            刷新
          </Button>
        }
      />

      {capacityQuery.data && !capacityQuery.data.profile.realProvider ? (
        <Alert
          type="warning"
          className="mb-4"
          content={`当前容量数据来自开发 Provider“${capacityQuery.data.profile.provider || "-"}”，不是实际集群数据。${capacityQuery.data.profile.reason ? ` ${capacityQuery.data.profile.reason}` : ""}`}
        />
      ) : null}

      <section className="mb-4 grid grid-cols-4 gap-3.5">
        <Metric
          label="区域"
          value={formatValue(summary?.regionCount)}
          hint="有容量记录的区域"
        />
        <Metric
          label="GPU 总量"
          value={formatValue(summary?.gpuTotal)}
          hint="全部区域合计"
          onClick={() => navigate({ to: "/overview-gpu" })}
        />
        <Metric
          label="GPU 空闲"
          value={formatValue(summary?.gpuFree)}
          hint="当前可分配"
        />
        <Metric
          label="租户数"
          value={formatValue(summary?.tenantCount)}
          hint="已归属租户"
        />
      </section>

      {capacityQuery.isPending ? (
        <div className="rounded-lg bg-white py-20 text-center text-sm text-gray-500">
          正在加载区域容量数据…
        </div>
      ) : capacityQuery.isError ? null : regions.length === 0 ? (
        <div className="rounded-lg bg-white py-16">
          <Empty description="暂无区域容量数据" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3.5 max-[1320px]:grid-cols-1">
          {regions.map((region) => (
            <Panel
              key={region.id}
              title={regionTitle(region)}
              action={regionStatus(region)}
            >
              <div className="px-5 pt-4">
                <Progress
                  percent={regionUsagePercent(region)}
                  showText={false}
                />
              </div>
              <SoftList>
                <SoftRow
                  title="GPU 空闲 / 总量"
                  meta={`${region.capacity.gpuFree} / ${region.capacity.gpuTotal}`}
                />
                <SoftRow
                  title="节点 / AZ"
                  meta={`${region.capacity.nodes} · ${region.azs.join(", ") || "-"}`}
                />
                <SoftRow
                  title="CPU 核数"
                  meta={formatValue(region.capacity.cpuCores)}
                />
                <SoftRow
                  title="内存"
                  meta={`${formatValue(region.capacity.memoryGiB)} GiB`}
                />
                <SoftRow
                  title="租户数"
                  meta={formatValue(region.tenantCount)}
                />
              </SoftList>
              <Space className="flex justify-end border-t border-gray-100 px-4 py-2">
                <Button
                  type="text"
                  onClick={() => navigate({ to: "/tenants" })}
                >
                  查看租户
                </Button>
                <Button
                  type="text"
                  onClick={() => navigate({ to: "/ops-pool" })}
                >
                  资源池运维
                </Button>
              </Space>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
