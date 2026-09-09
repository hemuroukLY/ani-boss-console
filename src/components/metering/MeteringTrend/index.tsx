import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";

interface MeteringTrendProps {
  labels: string[];
  values: number[];
  label: string;
  unit: string;
}

export function MeteringTrend({ labels, values, label, unit }: MeteringTrendProps) {
  const option: EChartsOption = {
    animationDuration: 400,
    color: ["#165dff"],
    grid: { top: 24, right: 24, bottom: 28, left: 58 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) => `${value} ${unit}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
    },
    yAxis: {
      type: "value",
      name: unit,
      splitLine: { lineStyle: { color: "#f2f3f5" } },
    },
    series: [
      {
        name: label,
        type: "line",
        smooth: true,
        symbolSize: 7,
        data: values,
        areaStyle: { color: "rgba(22, 93, 255, 0.1)" },
      },
    ],
  };

  return <ReactECharts option={option} notMerge lazyUpdate className="h-[280px] w-full" />;
}
