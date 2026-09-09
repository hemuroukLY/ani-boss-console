import { Tag, Typography } from "@arco-design/web-react";
import { DataTable, DataTableRowActionButton, DataTableRowActions } from "@/components/common";
import type { AlertItem } from "@/components/overview/model";
import { LevelTag } from "../../LevelTag";

interface AlertTableProps {
  rows: AlertItem[];
  onUpdate: (id: number, status: AlertItem["status"]) => void;
}

export function AlertTable({ rows, onUpdate }: AlertTableProps) {
  return (
    <DataTable
      rowKey="id"
      data={rows}
      pagination={false}
      noDataElement="暂无平台告警"
      columns={[
        {
          title: "级别",
          dataIndex: "level",
          width: 90,
          render: (_: unknown, item: AlertItem) => <LevelTag level={item.level} />,
        },
        {
          title: "标题 / 摘要",
          dataIndex: "title",
          width: 260,
          render: (_: unknown, item: AlertItem) => (
            <div>
              <Typography.Text bold>{item.title}</Typography.Text>
              <Typography.Text type="secondary" className="mt-1 block text-xs">
                {item.summary}
              </Typography.Text>
            </div>
          ),
        },
        {
          title: "对象",
          dataIndex: "objectType",
          width: 150,
          render: (_: unknown, item: AlertItem) => (
            <div>
              <Typography.Text>{item.objectType}</Typography.Text>
              <Typography.Text type="secondary" className="mt-1 block text-xs">
                {item.objectName}
              </Typography.Text>
            </div>
          ),
        },
        { title: "区域", dataIndex: "region", width: 120 },
        { title: "时间", dataIndex: "time", width: 120 },
        {
          title: "状态",
          dataIndex: "status",
          width: 100,
          render: (_: unknown, item: AlertItem) => (
            <Tag color={item.status === "待处理" ? "orange" : "green"}>{item.status}</Tag>
          ),
        },
        {
          title: "操作",
          width: 170,
          fixed: "right" as const,
          render: (_: unknown, item: AlertItem) =>
            item.status === "待处理" ? (
              <DataTableRowActions>
                <DataTableRowActionButton onClick={() => onUpdate(item.id, "已处理")}>
                  处理
                </DataTableRowActionButton>
                <DataTableRowActionButton onClick={() => onUpdate(item.id, "已忽略")}>
                  忽略
                </DataTableRowActionButton>
              </DataTableRowActions>
            ) : null,
        },
      ]}
    />
  );
}
