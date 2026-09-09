import { createFileRoute } from "@tanstack/react-router";
import { GpuDeviceTable } from "@/components/overview/GpuDeviceTable";
import { Metric } from "@/components/overview/Metric";
import { OverviewPageHeader } from "@/components/overview/OverviewPageHeader";
import { Panel } from "@/components/overview/Panel";
import { SoftList } from "@/components/overview/SoftList";
import { SoftRow } from "@/components/overview/SoftList/SoftRow";

export const Route = createFileRoute("/overview-gpu/")({
  component: function GpuPoolRoute() {
    return (
      <>
        <OverviewPageHeader
          title="GPU 资源池态势"
          subtitle="查看物理卡、逻辑卡及设备切分、分配情况"
        />
        <section className="mb-4 grid grid-cols-5 gap-3.5">
          <Metric label="物理卡/逻辑卡" value="8 / 0" hint="当前均为整卡" />
          <Metric label="空闲未分配" value="3" hint="可切分或分配" />
          <Metric label="已预留" value="0" hint="暂无预留设备" />
          <Metric label="已占用" value="3" hint="覆盖 2 个租户" />
          <Metric label="异常" value="2" hint="维护 1 · 不可用 1" tone="danger" />
        </section>
        <Panel title="设备列表 · 切分 / 分配">
          <GpuDeviceTable />
        </Panel>
        <Panel title="联动事件">
          <SoftList>
            <SoftRow title="gpu-dev-06 标记为不可用 · Xid 79 硬件错误" meta="08-27 09:42" />
            <SoftRow title="gpu-dev-04 进入维护 · 驱动升级窗口" meta="08-27 09:18" />
            <SoftRow title="gpu-dev-07 分配给 acme-ai · acme-batch-3" meta="08-27 08:36" />
          </SoftList>
        </Panel>
      </>
    );
  },
});
