import { createFileRoute } from "@tanstack/react-router";
import { Metric } from "@/components/overview/Metric";
import { OverviewPageHeader } from "@/components/overview/OverviewPageHeader";
import { PlatformAlertTable } from "@/components/overview/PlatformAlertTable";
import { usePlatformOverview } from "@/components/overview/PlatformOverviewProvider";

export const Route = createFileRoute("/overview-alerts/")({
  component: AlertsRoute,
});

function AlertsRoute() {
  const { alerts, updateAlert } = usePlatformOverview();
  const statistics = [
    ["全部", alerts.length, "平台告警"],
    [
      "待处理",
      alerts.filter((item) => item.status === "待处理").length,
      "等待处置",
    ],
    [
      "严重",
      alerts.filter((item) => item.level === "严重").length,
      "需立即关注",
    ],
    [
      "已处理",
      alerts.filter((item) => item.status !== "待处理").length,
      "已完成或忽略",
    ],
  ] as const;

  return (
    <>
      <OverviewPageHeader
        title="平台告警与待处理"
        subtitle="跨租户平台级告警收件箱"
      />
      <section className="mb-4 grid grid-cols-4 gap-3.5">
        {statistics.map(([label, value, hint]) => (
          <Metric
            key={label}
            label={label}
            value={String(value)}
            hint={hint}
            tone={label === "严重" ? "danger" : ""}
          />
        ))}
      </section>
      <PlatformAlertTable alerts={alerts} onUpdate={updateAlert} />
    </>
  );
}
