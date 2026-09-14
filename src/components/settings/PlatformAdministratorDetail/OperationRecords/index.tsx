import { Empty, Spin, Tag } from "@arco-design/web-react";
import type { PlatformAdministratorAuditLog } from "@/api/platform-admins";
import { DataTable, type ListColumn } from "@/components/common";
import { formatDateTime } from "@/lib/date";

const columns: ListColumn<PlatformAdministratorAuditLog>[] = [
  { title: "操作", dataIndex: "action", width: 180 },
  { title: "资源", dataIndex: "resource", render: (value) => value || "-" },
  {
    title: "结果",
    dataIndex: "result",
    width: 100,
    render: (value) => (
      <Tag color={value === "success" ? "green" : "red"}>
        {value === "success" ? "成功" : "失败"}
      </Tag>
    ),
  },
  {
    title: "时间",
    dataIndex: "createdAt",
    width: 180,
    render: (value) => formatDateTime(value),
  },
];

export function OperationRecords({
  records,
  loading,
}: {
  records: PlatformAdministratorAuditLog[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }

  if (!records.length) return <Empty description="暂无操作记录" />;

  return (
    <DataTable
      rowKey="id"
      columns={columns}
      data={records}
      pagination={false}
      scroll={{ x: 760 }}
    />
  );
}
