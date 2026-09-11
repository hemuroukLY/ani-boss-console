import { Tag, Typography } from "@arco-design/web-react";
import { DataTable } from "@/components/common";
import { tenantLifecycleEventMeta, type TenantLifecycleEvent } from "@/components/tenant/model";
import { formatDateTimeMinute } from "@/lib/date";

interface LifecycleHistorySectionProps {
  events: TenantLifecycleEvent[];
}

export function LifecycleHistorySection({ events }: LifecycleHistorySectionProps) {
  return (
    <section>
      <Typography.Title heading={6} className="!mb-4">
        生命周期记录
      </Typography.Title>
      <DataTable
        rowKey="id"
        pagination={false}
        data={events}
        noDataElement="暂无生命周期记录"
        columns={[
          {
            title: "时间",
            dataIndex: "at",
            width: 180,
            render: (value: string) => formatDateTimeMinute(value),
          },
          {
            title: "事件",
            width: 140,
            render: (_, event: TenantLifecycleEvent) => {
              const meta = tenantLifecycleEventMeta[event.event];
              return <Tag color={meta.color}>{meta.label}</Tag>;
            },
          },
          { title: "说明", dataIndex: "message" },
          { title: "操作人", dataIndex: "by", width: 150 },
        ]}
      />
    </section>
  );
}
