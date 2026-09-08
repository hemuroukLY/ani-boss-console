import { Alert, Button, Tabs } from "@arco-design/web-react";
import { IconDownload, IconRefresh } from "@arco-design/web-react/icon";
import { useState } from "react";
import { ListPageHeader } from "@/components/common";
import { Metric } from "@/components/overview/Metric";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import { MeteringTrend } from "../MeteringTrend";
import {
  meteringDimensions,
  type MeteringDimension,
} from "../model";
import { MeteringTenantTable } from "./MeteringTenantTable";
import {
  formatUsage,
  getChangeRate,
  usePlatformGpuMetering,
} from "./usePlatformGpuMetering";

export function PlatformMeteringPage() {
  const [dimension, setDimension] = useState<MeteringDimension>("gpu");
  const current =
    meteringDimensions.find((item) => item.key === dimension) ??
    meteringDimensions[0];
  const { query, view } = usePlatformGpuMetering(current.resourceType);
  useListErrorNotification({
    id: "platform-gpu-metering",
    title: "GPU 计量数据加载失败",
    error: query.error,
  });
  const totalChangeRate = view
    ? getChangeRate(view.currentTotal, view.previousTotal)
    : undefined;
  const metricValue = (value?: string) =>
    query.isPending || query.isError ? "-" : value || "-";

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="计量总览"
        subtitle="汇总 ANI 平台计量数据与租户用量分布；当前数据用于资源运营观察，不作为账单依据。"
        extra={
          <div className="flex gap-2">
            <Button
              icon={<IconRefresh />}
              loading={query.isFetching}
              disabled={!current.resourceType}
              onClick={() => void query.refetch()}
            >
              刷新
            </Button>
            <Button icon={<IconDownload />} disabled>
              导出计量明细
            </Button>
          </div>
        }
      />

      <Tabs
        activeTab={dimension}
        onChange={(key) => setDimension(key as MeteringDimension)}
        className="rounded-lg border border-gray-200 bg-white px-5 pt-1"
      >
        {meteringDimensions.map((item) => (
          <Tabs.TabPane key={item.key} title={item.label} />
        ))}
      </Tabs>

      {!current.resourceType ? (
        <Alert
          type="info"
          showIcon
          content={`${current.label} 暂未接入：${current.unavailableReason}`}
        />
      ) : (
        <>
          {view && !view.profile.realProvider ? (
            <Alert
              type="warning"
              showIcon
              content={`当前计量数据来自 ${view.profile.provider} 开发 Provider，不代表真实生产用量。${view.profile.reason ? ` ${view.profile.reason}` : ""}`}
            />
          ) : null}

          <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
            <Metric
              label="本月合计"
              value={metricValue(view ? formatUsage(view.currentTotal) : undefined)}
              hint={current.unit}
            />
            <Metric
              label="环比"
              value={metricValue(
                totalChangeRate === undefined
                  ? undefined
                  : `${totalChangeRate > 0 ? "+" : ""}${totalChangeRate.toFixed(1)}%`,
              )}
              hint="较上月同期"
            />
            <Metric
              label="峰值日"
              value={metricValue(view?.peakDate?.slice(5))}
              hint={
                view?.peakUsage === undefined
                  ? "本月暂无日汇总"
                  : `${formatUsage(view.peakUsage)} ${current.unit}`
              }
            />
            <Metric
              label="有用量租户"
              value={metricValue(
                view ? String(view.tenantRows.length) : undefined,
              )}
              hint="本月或上月同期有记录"
            />
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-gray-900">
                  近 7 日趋势
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {current.description}
                </div>
              </div>
              <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                单位：{current.unit}
              </span>
            </div>
            <div className="mt-3">
              <MeteringTrend
                labels={view?.trendLabels || []}
                values={view?.trendValues || []}
                label={current.label}
                unit={current.unit}
              />
            </div>
          </section>

          <MeteringTenantTable
            rows={view?.tenantRows || []}
            unit={current.unit}
            loading={query.isPending}
          />
        </>
      )}
    </div>
  );
}
