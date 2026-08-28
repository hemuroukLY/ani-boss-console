import { Metric } from "@/components/platform-overview/Metric";
import { OverviewPageHeader } from "@/components/platform-overview/OverviewPageHeader";
import { Panel } from "@/components/platform-overview/Panel";
import { StatusDonutChart } from "@/components/platform-overview/StatusDonutChart";
import { TrendChart } from "@/components/platform-overview/TrendChart";
import { statusData } from "@/features/platform-overview/model";

export type ResourceStatusKind = keyof typeof statusData;

export function ResourceStatusPage({ kind }: { kind: ResourceStatusKind }) {
  const data = statusData[kind];

  return (
    <>
      <OverviewPageHeader title={data.title} subtitle={data.subtitle} />
      <section className="mb-4 grid grid-cols-4 gap-3.5">
        {data.metrics.map((item, index) => (
          <Metric
            key={item[0]}
            label={item[0]}
            value={item[1]}
            hint={item[2]}
            tone={index === 1 || index === 3 ? "warning" : ""}
          />
        ))}
      </section>
      <div className="mb-3.5 grid grid-cols-2 gap-3.5">
        <Panel title={data.trendTitle}>
          <TrendChart />
        </Panel>
        <Panel title={data.distributionTitle}>
          <StatusDonutChart />
        </Panel>
      </div>
    </>
  );
}
