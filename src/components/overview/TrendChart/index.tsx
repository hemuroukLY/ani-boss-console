import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";

const trendOption: EChartsOption = {
  animationDuration: 400,
  color: ["#165dff"],
  grid: { top: 18, right: 16, bottom: 28, left: 42 },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: ["21日", "22日", "23日", "24日", "25日", "26日", "27日"],
  },
  yAxis: { type: "value", splitLine: { lineStyle: { color: "#f2f3f5" } } },
  series: [
    {
      type: "line",
      smooth: true,
      symbolSize: 7,
      data: [42, 56, 49, 68, 74, 66, 88],
      areaStyle: { color: "rgba(22, 93, 255, 0.1)" },
    },
  ],
};

export function TrendChart() {
  return <ReactECharts option={trendOption} notMerge lazyUpdate className="h-[260px] w-full" />;
}
