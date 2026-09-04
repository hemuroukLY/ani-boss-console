import { Card } from "@arco-design/web-react";
import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import type { MonitoringPanel } from "../model";

const timeLabels = ["-60m", "-50m", "-40m", "-30m", "-20m", "-10m", "现在"];

export function MonitoringTrend({ panel }: { panel: MonitoringPanel }) {
  const color = panel.color ?? "#165dff";
  const option: EChartsOption = {
    animationDuration: 350,
    color: [color],
    grid: { top: 18, right: 20, bottom: 28, left: 46 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => `${value}${panel.unit}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: timeLabels,
      axisLine: { lineStyle: { color: "#e5e6eb" } },
      axisLabel: { color: "#86909c" },
    },
    yAxis: {
      type: "value",
      axisLabel: { formatter: `{value}${panel.unit}`, color: "#86909c" },
      splitLine: { lineStyle: { color: "#f2f3f5" } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: panel.values,
        areaStyle: { color, opacity: 0.08 },
      },
    ],
  };

  return (
    <Card title={panel.title} className="rounded-lg [&_.arco-card-body]:p-3">
      <ReactECharts
        option={option}
        notMerge
        lazyUpdate
        className="h-[220px] w-full"
      />
    </Card>
  );
}
