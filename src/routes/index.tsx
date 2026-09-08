import { Button, Message } from "@arco-design/web-react";
import { createFileRoute } from "@tanstack/react-router";
import { OperationsMetrics } from "@/components/overview/OperationsMetrics";
import { OperationsPanels } from "@/components/overview/OperationsPanels";
import { OverviewPageHeader } from "@/components/overview/OverviewPageHeader";
import { usePlatformOverview } from "@/components/overview/PlatformOverviewProvider";

export const Route = createFileRoute("/")({
  component: OperationsOverviewRoute,
});

function OperationsOverviewRoute() {
  const { alerts, resetDemo, updateAlert } = usePlatformOverview();
  const pendingAlerts = alerts.filter((item) => item.status === "待处理");

  const openPendingFeature = (name: string) => {
    Message.info(`${name}将在对应功能页中继续处理`);
  };

  return (
    <>
      <OverviewPageHeader
        title="运营总览"
        subtitle="看见异常，快速定位对象并完成处置"
        extra={<Button onClick={resetDemo}>运营态势演示</Button>}
      />
      <OperationsMetrics
        pendingAlertCount={pendingAlerts.length}
        severePendingCount={
          pendingAlerts.filter((item) => item.level === "严重").length
        }
      />
      <OperationsPanels
        pendingAlerts={pendingAlerts}
        onUpdateAlert={updateAlert}
        onOpenFeature={openPendingFeature}
      />
    </>
  );
}
