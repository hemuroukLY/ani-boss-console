import { Button, Message, Progress, Space } from "@arco-design/web-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Metric } from "@/components/platform-overview/Metric";
import { OverviewPageHeader } from "@/components/platform-overview/OverviewPageHeader";
import { Panel } from "@/components/platform-overview/Panel";
import { SoftList } from "@/components/platform-overview/SoftList";
import { SoftRow } from "@/components/platform-overview/SoftList/SoftRow";
import { regions } from "@/features/platform-overview/model";

export const Route = createFileRoute("/overview/capacity")({
  component: CapacityOverviewRoute,
});

function CapacityOverviewRoute() {
  const navigate = useNavigate();

  return (
    <>
      <OverviewPageHeader
        title="资源池与容量态势"
        subtitle="按 Region 查看容量与租户占用"
      />
      <section className="mb-4 grid grid-cols-4 gap-3.5">
        <Metric label="区域" value="3" hint="有容量记录的区域" />
        <Metric
          label="GPU 总量"
          value="128"
          hint="全部区域合计"
          onClick={() => navigate({ to: "/overview/gpu" })}
        />
        <Metric label="GPU 空闲" value="46" hint="当前可分配" />
        <Metric label="租户数" value="38" hint="已归属租户" />
      </section>
      <div className="grid grid-cols-3 gap-3.5 max-[1320px]:grid-cols-1">
        {regions.map((region) => (
          <Panel
            key={region[1]}
            title={`${region[0]}  ${region[1]}`}
            action={region[0] === "西南一区" ? "规划中" : "可开通"}
          >
            <div className="px-5 pt-4">
              <Progress percent={region[5]} showText={false} />
            </div>
            <SoftList>
              <SoftRow title="GPU 空闲 / 总量" meta={region[2]} />
              <SoftRow title="节点 / AZ" meta={region[3]} />
              <SoftRow title="租户数" meta={region[4]} />
            </SoftList>
            <Space className="flex justify-end border-t border-gray-100 px-4 py-2">
              <Button
                type="text"
                onClick={() => Message.info(`按 ${region[0]} 筛选租户`)}
              >
                筛选租户
              </Button>
              <Button
                type="text"
                onClick={() => Message.info(`打开 ${region[0]} 资源池运维`)}
              >
                去资源池运维
              </Button>
            </Space>
          </Panel>
        ))}
      </div>
    </>
  );
}
