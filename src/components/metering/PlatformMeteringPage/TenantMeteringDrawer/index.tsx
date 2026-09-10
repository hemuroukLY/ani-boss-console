import { Alert, Drawer, Empty, Tabs } from "@arco-design/web-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  fetchPlatformMeteringUsage,
  platformQueryKeys,
  type PlatformMeteringGroupBy,
  type PlatformMeteringResourceType,
  type PlatformMeteringUsageParams,
} from "@/api/platform";
import { DataTable, type ListColumn } from "@/components/common";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import { MeteringTrend } from "../../MeteringTrend";
import { formatUsage, toGpuHours } from "../usePlatformGpuMetering";

type DetailGroupBy = Extract<PlatformMeteringGroupBy, "day" | "hour">;

interface TenantMeteringDrawerProps {
  visible: boolean;
  tenantId?: string;
  resourceType: PlatformMeteringResourceType;
  metricLabel: string;
  unit: string;
  startTime: string;
  endTime: string;
  onCancel: () => void;
}

interface TenantMeteringDetailRow {
  id: string;
  period: string;
  usage: number;
}

function formatPeriod(period: string, groupBy: DetailGroupBy) {
  if (groupBy === "hour") return `${period.replace("T", " ")}:00`;
  return period;
}

export function TenantMeteringDrawer({
  visible,
  tenantId,
  resourceType,
  metricLabel,
  unit,
  startTime,
  endTime,
  onCancel,
}: TenantMeteringDrawerProps) {
  const [groupBy, setGroupBy] = useState<DetailGroupBy>("day");
  const params = useMemo<PlatformMeteringUsageParams | undefined>(() => {
    if (!tenantId) return undefined;
    return { startTime, endTime, resourceType, groupBy, tenantId };
  }, [endTime, groupBy, resourceType, startTime, tenantId]);

  const detailQuery = useQuery({
    queryKey: params
      ? platformQueryKeys.meteringUsage(params)
      : (["platform", "metering-usage", "tenant-detail-disabled"] as const),
    enabled: visible && Boolean(params),
    queryFn: () => {
      if (!params) throw new Error("缺少租户计量查询参数");
      return fetchPlatformMeteringUsage(params);
    },
    staleTime: 60_000,
  });

  useListErrorNotification({
    id: "platform-metering-tenant-detail",
    title: `${metricLabel} 租户明细加载失败`,
    error: detailQuery.error,
  });

  const rows = useMemo<TenantMeteringDetailRow[]>(
    () =>
      (detailQuery.data?.items || []).map((item, index) => ({
        id: `${item.period || "unknown"}-${index}`,
        period: item.period ? formatPeriod(item.period, groupBy) : "-",
        usage: toGpuHours(item.totalQuantity),
      })),
    [detailQuery.data?.items, groupBy],
  );

  const columns: ListColumn<TenantMeteringDetailRow>[] = [
    {
      title: groupBy === "day" ? "日期" : "小时",
      dataIndex: "period",
      width: 220,
    },
    {
      title: `用量（${unit}）`,
      dataIndex: "usage",
      width: 220,
      render: (_, row) => formatUsage(row.usage),
    },
  ];

  return (
    <Drawer
      width={760}
      title={`${metricLabel} · 租户用量明细`}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      unmountOnExit
    >
      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500">租户 ID</div>
          <div className="mt-1 break-all font-mono text-sm text-gray-900">{tenantId || "-"}</div>
          <div className="mt-2 text-xs text-gray-500">
            查询范围：{startTime.slice(0, 10)} 至 {endTime.slice(0, 10)}（UTC）
          </div>
        </div>

        <Tabs activeTab={groupBy} onChange={(key) => setGroupBy(key as DetailGroupBy)}>
          <Tabs.TabPane key="day" title="按天" />
          <Tabs.TabPane key="hour" title="按小时" />
        </Tabs>

        {detailQuery.data && !detailQuery.data.profile.realProvider ? (
          <Alert
            type="warning"
            showIcon
            content={`当前明细来自 ${detailQuery.data.profile.provider || "-"}，数据仅供开发联调。${detailQuery.data.profile.reason ? ` ${detailQuery.data.profile.reason}` : ""}`}
          />
        ) : null}

        <MeteringTrend
          labels={rows.map((row) => row.period)}
          values={rows.map((row) => Number(row.usage.toFixed(2)))}
          label={`${metricLabel} 租户明细`}
          unit={unit}
        />

        <DataTable
          rowKey="id"
          columns={columns}
          data={rows}
          loading={detailQuery.isPending}
          pagination={false}
          scroll={{ x: 520, y: 360 }}
          tableLabel={`${metricLabel} 租户计量明细`}
          noDataElement={<Empty description={`当前时间范围内暂无 ${metricLabel} 明细`} />}
        />
      </div>
    </Drawer>
  );
}
