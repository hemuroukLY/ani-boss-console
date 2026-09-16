import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchPlatformMeteringUsage,
  type PlatformMeteringResourceType,
  type PlatformMeteringUsageItem,
} from "@/api/platform";
import { formatMonthDay, getUtcMonthToDateRanges, listUtcDateKeys } from "@/lib/date";
import { withId } from "@/lib/id";
import type { MeteringTenantRow } from "../model";

const SECONDS_PER_HOUR = 3600;

export function toGpuHours(quantity: number) {
  return quantity / SECONDS_PER_HOUR;
}

export function formatUsage(value: number) {
  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: 2,
  });
}

export function getChangeRate(current: number, previous: number) {
  if (previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

function sumByPeriod(items: PlatformMeteringUsageItem[]) {
  const result = new Map<string, number>();
  items.forEach((item) => {
    if (!item.period) return;
    result.set(item.period, (result.get(item.period) || 0) + item.totalQuantity);
  });
  return result;
}

function sumTenantItems(items: PlatformMeteringUsageItem[]) {
  const result = new Map<string, number>();
  items.forEach((item) => {
    if (!item.tenantId) return;
    result.set(item.tenantId, (result.get(item.tenantId) || 0) + toGpuHours(item.totalQuantity));
  });
  return result;
}

function buildTenantRows(
  currentItems: PlatformMeteringUsageItem[],
  previousItems: PlatformMeteringUsageItem[],
) {
  const current = sumTenantItems(currentItems);
  const previous = sumTenantItems(previousItems);

  return Array.from(new Set([...current.keys(), ...previous.keys()])).map(
    (id): MeteringTenantRow => {
      const currentUsage = current.get(id) || 0;
      const previousUsage = previous.get(id) || 0;
      return {
        id,
        current: currentUsage,
        previous: previousUsage,
        trend: currentUsage > previousUsage ? "up" : currentUsage < previousUsage ? "down" : "flat",
      };
    },
  );
}

export function usePlatformGpuMetering(resourceType?: PlatformMeteringResourceType) {
  const ranges = useMemo(() => getUtcMonthToDateRanges(), []);
  const query = useQuery({
    meta: {
      errorNotification: {
        id: withId("platform-metering", resourceType),
        action: "平台计量数据加载",
        fallback: "请求失败，请稍后重试",
      },
    },
    queryKey: ["platform", "metering-dashboard", resourceType, ranges],
    enabled: Boolean(resourceType),
    queryFn: async () => {
      if (!resourceType) throw new Error("当前计量维度尚未接入");
      const common = { resourceType } as const;
      const [currentTenants, previousTenants, currentDays, trendDays] = await Promise.all([
        fetchPlatformMeteringUsage({
          ...common,
          startTime: ranges.currentStart,
          endTime: ranges.currentEnd,
          groupBy: "tenant_id",
        }),
        fetchPlatformMeteringUsage({
          ...common,
          startTime: ranges.previousStart,
          endTime: ranges.previousEnd,
          groupBy: "tenant_id",
        }),
        fetchPlatformMeteringUsage({
          ...common,
          startTime: ranges.currentStart,
          endTime: ranges.currentEnd,
          groupBy: "day",
        }),
        fetchPlatformMeteringUsage({
          ...common,
          startTime: ranges.trendStart,
          endTime: ranges.currentEnd,
          groupBy: "day",
        }),
      ]);

      return { currentTenants, previousTenants, currentDays, trendDays };
    },
    staleTime: 60_000,
  });

  const view = useMemo(() => {
    if (!query.data) return undefined;
    const { currentTenants, previousTenants, currentDays, trendDays } = query.data;
    const tenantRows = buildTenantRows(currentTenants.items, previousTenants.items);
    const currentTotal = tenantRows.reduce((total, item) => total + item.current, 0);
    const previousTotal = tenantRows.reduce((total, item) => total + item.previous, 0);
    const dailyUsage = sumByPeriod(currentDays.items);
    const peak = Array.from(dailyUsage.entries()).sort((left, right) => right[1] - left[1])[0];
    const trendUsage = sumByPeriod(trendDays.items);
    const trendDates = listUtcDateKeys(ranges.trendStart, 7);

    return {
      tenantRows,
      currentTotal,
      previousTotal,
      peakDate: peak?.[0],
      peakUsage: peak ? toGpuHours(peak[1]) : undefined,
      trendLabels: trendDates.map((date) => formatMonthDay(date)),
      trendValues: trendDates.map((date) =>
        Number(toGpuHours(trendUsage.get(date) || 0).toFixed(2)),
      ),
      profile: currentTenants.profile,
    };
  }, [query.data, ranges.trendStart]);

  return { query, view, ranges };
}
