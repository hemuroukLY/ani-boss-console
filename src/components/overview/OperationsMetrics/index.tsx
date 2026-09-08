import { useNavigate } from "@tanstack/react-router";
import { Metric } from "../Metric";

interface OperationsMetricsProps {
  pendingAlertCount: number;
  severePendingCount: number;
}

export function OperationsMetrics({
  pendingAlertCount,
  severePendingCount,
}: OperationsMetricsProps) {
  const navigate = useNavigate();

  return (
    <>
      <section className="mb-4 grid grid-cols-4 gap-3.5">
        <Metric label="活跃租户" value="38" hint="试用标签 5 · 点击查看" />
        <Metric label="冻结" value="3" hint="含欠费/试用到期" tone="danger" />
        <Metric
          label="待审批配额"
          value="6"
          hint="算力扩容单 · 点击处理"
          tone="warning"
        />
        <Metric
          label="待处理告警"
          value={String(pendingAlertCount)}
          hint={`严重 ${severePendingCount} · 全部告警`}
          tone="warning"
          onClick={() => navigate({ to: "/overview-alerts" })}
        />
      </section>
      <section className="mb-4 grid grid-cols-4 gap-3.5">
        <Metric
          label="GPU 空闲/总量"
          value="46/128"
          hint="去容量态势"
          onClick={() => navigate({ to: "/overview-capacity" })}
        />
        <Metric label="可开通区域" value="2/3" hint="区域开放状态" />
        <Metric
          label="GPU 资源池"
          value="3"
          hint="正常 2 · 维护中 1"
          onClick={() => navigate({ to: "/overview-gpu" })}
        />
        <Metric label="镜像配额" value="1" hint="待审批扩容申请" />
      </section>
    </>
  );
}
