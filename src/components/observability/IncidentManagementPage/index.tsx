import { Button, Input, Select } from "@arco-design/web-react";
import { useMemo, useState } from "react";
import {
  DataTableNameCell,
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  ListToolbar,
  type ListColumn,
} from "@/components/common";
import { Metric } from "@/components/overview/Metric";
import { platformIncidents, type PlatformIncident } from "../maintenanceModel";

const statusMeta = {
  investigating: { label: "调查中", className: "text-red-600" },
  mitigated: { label: "已缓解", className: "text-orange-600" },
  resolved: { label: "已解决", className: "text-green-600" },
} as const;

export function IncidentManagementPage() {
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const filteredIncidents = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return platformIncidents.filter((incident) => {
      const matchesKeyword =
        !query ||
        `${incident.title} ${incident.id} ${incident.owner}`
          .toLowerCase()
          .includes(query);
      return (
        (severity === "all" || incident.severity === severity) &&
        (status === "all" || incident.status === status) &&
        matchesKeyword
      );
    });
  }, [keyword, severity, status]);

  const columns: ListColumn<PlatformIncident>[] = [
    {
      title: "故障",
      dataIndex: "title",
      width: 320,
      fixed: "left",
      render: (_, incident) => (
        <DataTableNameCell name={incident.title} secondary={incident.id} />
      ),
    },
    { title: "级别", dataIndex: "severity", width: 80 },
    {
      title: "状态",
      width: 100,
      render: (_, incident) => {
        const meta = statusMeta[incident.status];
        return <span className={meta.className}>{meta.label}</span>;
      },
    },
    { title: "影响范围", dataIndex: "impact", width: 260 },
    { title: "负责人", dataIndex: "owner", width: 100 },
    { title: "关联告警", dataIndex: "alertCount", width: 100 },
    { title: "开始时间", dataIndex: "startedAt", width: 165 },
    { title: "更新时间", dataIndex: "updatedAt", width: 165 },
    {
      title: "操作",
      width: 100,
      fixed: "right",
      render: () => (
        <Button type="text" size="small" disabled>
          处置
        </Button>
      ),
    },
  ];

  const activeCount = platformIncidents.filter(
    (incident) => incident.status !== "resolved",
  ).length;
  const p1Count = platformIncidents.filter(
    (incident) => incident.severity === "P1",
  ).length;
  const resolvedCount = platformIncidents.filter(
    (incident) => incident.status === "resolved",
  ).length;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="故障处理"
        subtitle="集中查看平台故障的级别、影响、负责人和处置状态。"
        extra={
          <Button type="primary" disabled>
            创建故障
          </Button>
        }
      />
      <section className="grid grid-cols-3 gap-3.5 max-[980px]:grid-cols-1">
        <Metric
          label="处理中"
          value={String(activeCount)}
          hint="调查中或已缓解"
          tone="warning"
        />
        <Metric
          label="P1 故障"
          value={String(p1Count)}
          hint="优先处置"
          tone="danger"
        />
        <Metric label="已解决" value={String(resolvedCount)} hint="当前样本" />
      </section>
      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold text-gray-900">
                平台故障
              </div>
              <div className="mt-1 text-xs text-gray-500">
                当前为只读故障快照；创建、认领、缓解和关闭待接口接入后开放。
              </div>
            </div>
            <span className="text-xs text-gray-500">
              共 {filteredIncidents.length} 条
            </span>
          </div>
        }
        toolbar={
          <ListToolbar
            filters={
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={severity}
                  onChange={setSeverity}
                  style={{ width: 120 }}
                  options={[
                    { label: "全部级别", value: "all" },
                    { label: "P1", value: "P1" },
                    { label: "P2", value: "P2" },
                    { label: "P3", value: "P3" },
                  ]}
                />
                <Select
                  value={status}
                  onChange={setStatus}
                  style={{ width: 130 }}
                  options={[
                    { label: "全部状态", value: "all" },
                    { label: "调查中", value: "investigating" },
                    { label: "已缓解", value: "mitigated" },
                    { label: "已解决", value: "resolved" },
                  ]}
                />
                <Input.Search
                  allowClear
                  value={keyword}
                  onChange={setKeyword}
                  placeholder="搜索故障、ID 或负责人"
                  style={{ width: 280 }}
                />
              </div>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={filteredIncidents}
          pagination={false}
          scroll={{ x: 1390 }}
          emptyText="没有符合筛选条件的平台故障"
        />
      </ListPageFrame>
    </div>
  );
}
