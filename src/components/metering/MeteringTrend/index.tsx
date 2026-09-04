import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { meteringTrendDays, type MeteringDimensionData } from "../model";

export function MeteringTrend({ data }: { data: MeteringDimensionData }) {
  const option: EChartsOption = {
    animationDuration: 400,
    color: ["#165dff"],
    grid: { top: 24, right: 24, bottom: 28, left: 58 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => `${value} ${data.unit}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: meteringTrendDays,
    },
    yAxis: {
      type: "value",
      name: data.unit,
      splitLine: { lineStyle: { color: "#f2f3f5" } },
    },
    series: [
      {
        name: data.label,
        type: "line",
        smooth: true,
        symbolSize: 7,
        data: data.trend,
        areaStyle: { color: "rgba(22, 93, 255, 0.1)" },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      notMerge
      lazyUpdate
      className="h-[280px] w-full"
    />
  );
}
