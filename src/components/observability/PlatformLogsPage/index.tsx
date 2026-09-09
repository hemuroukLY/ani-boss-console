import { Input, Select } from "@arco-design/web-react";
import { useMemo, useState } from "react";
import {
  DataTableNameCell,
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  ListToolbar,
  type ListColumn,
} from "@/components/common";
import { platformLogs, type PlatformLog } from "../model";

const levelMeta = {
  error: { label: "error", className: "bg-red-50 text-red-700" },
  warn: { label: "warn", className: "bg-orange-50 text-orange-700" },
  info: { label: "info", className: "bg-blue-50 text-blue-700" },
} as const;

export function PlatformLogsPage() {
  const [service, setService] = useState("all");
  const [level, setLevel] = useState("all");
  const [keyword, setKeyword] = useState("");

  const services = [...new Set(platformLogs.map((log) => log.service))];
  const filteredLogs = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return platformLogs.filter((log) => {
      const matchesKeyword =
        !query || `${log.message} ${log.requestId}`.toLowerCase().includes(query);
      return (
        (service === "all" || log.service === service) &&
        (level === "all" || log.level === level) &&
        matchesKeyword
      );
    });
  }, [keyword, level, service]);

  const columns: ListColumn<PlatformLog>[] = [
    { title: "时间", dataIndex: "time", width: 130, fixed: "left" },
    {
      title: "级别",
      width: 90,
      render: (_, log) => {
        const meta = levelMeta[log.level];
        return (
          <span className={`inline-flex rounded px-2 py-0.5 text-xs ${meta.className}`}>
            {meta.label}
          </span>
        );
      },
    },
    {
      title: "服务",
      dataIndex: "service",
      width: 160,
      render: (_, log) => <DataTableNameCell name={log.service} secondary={log.id} />,
    },
    {
      title: "request_id",
      dataIndex: "requestId",
      width: 180,
      render: (value) => <code className="text-xs">{String(value)}</code>,
    },
    { title: "摘要", dataIndex: "message", width: 520 },
  ];

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="日志"
        subtitle="检索全平台控制面和数据面日志，并按 request_id 关联调用链。"
      />
      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold text-gray-900">平台日志检索</div>
              <div className="mt-1 text-xs text-gray-500">
                当前为静态样本；时间范围、实时查询和日志下载待接口接入后开放。
              </div>
            </div>
            <span className="text-xs text-gray-500">共 {filteredLogs.length} 条</span>
          </div>
        }
        toolbar={
          <ListToolbar
            filters={
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value="1h"
                  disabled
                  style={{ width: 120 }}
                  options={[{ label: "近 1 小时", value: "1h" }]}
                />
                <Select
                  value={service}
                  onChange={setService}
                  style={{ width: 160 }}
                  options={[
                    { label: "全部服务", value: "all" },
                    ...services.map((item) => ({ label: item, value: item })),
                  ]}
                />
                <Select
                  value={level}
                  onChange={setLevel}
                  style={{ width: 130 }}
                  options={[
                    { label: "全部级别", value: "all" },
                    { label: "error", value: "error" },
                    { label: "warn", value: "warn" },
                    { label: "info", value: "info" },
                  ]}
                />
                <Input.Search
                  allowClear
                  value={keyword}
                  onChange={setKeyword}
                  placeholder="搜索 request_id 或日志摘要"
                  style={{ width: 300 }}
                />
              </div>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={filteredLogs}
          pagination={false}
          scroll={{ x: 1080 }}
          emptyText="没有符合筛选条件的平台日志"
        />
      </ListPageFrame>
    </div>
  );
}
