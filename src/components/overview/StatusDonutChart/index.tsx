import type { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";

const statusOption: EChartsOption = {
  animationDuration: 400,
  color: ["#00b42a", "#ff7d00", "#c9cdd4"],
  tooltip: { trigger: "item" },
  legend: { bottom: 0, left: "center" },
  series: [
    {
      type: "pie",
      radius: ["55%", "75%"],
      center: ["50%", "44%"],
      label: { show: false },
      data: [
        { name: "健康", value: 87.5 },
        { name: "异常", value: 7.5 },
        { name: "处理中", value: 5 },
      ],
    },
  ],
  graphic: [
    {
      type: "text",
      left: "center",
      top: "36%",
      style: {
        text: "87.5%\n健康",
        textAlign: "center",
        fill: "#1d2129",
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 24,
      },
    },
  ],
};

export function StatusDonutChart() {
  return (
    <ReactECharts
      option={statusOption}
      notMerge
      lazyUpdate
      className="h-[260px] w-full"
    />
  );
}
