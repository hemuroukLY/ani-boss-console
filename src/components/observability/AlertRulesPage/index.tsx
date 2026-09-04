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
import { alertRules, type AlertRule } from "../model";

export function AlertRulesPage() {
  const [severity, setSeverity] = useState("all");
  const [enabled, setEnabled] = useState("all");
  const [keyword, setKeyword] = useState("");

  const filteredRules = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return alertRules.filter((rule) => {
      const matchesKeyword =
        !query || `${rule.name} ${rule.target}`.toLowerCase().includes(query);
      return (
        (severity === "all" || rule.severity === severity) &&
        (enabled === "all" || String(rule.enabled) === enabled) &&
        matchesKeyword
      );
    });
  }, [enabled, keyword, severity]);

  const columns: ListColumn<AlertRule>[] = [
    {
      title: "规则",
      dataIndex: "name",
      width: 240,
      fixed: "left",
      render: (_, rule) => (
        <DataTableNameCell name={rule.name} secondary={rule.id} />
      ),
    },
    { title: "对象", dataIndex: "target", width: 150 },
    {
      title: "表达式",
      dataIndex: "expression",
      width: 250,
      render: (value) => <code className="text-xs">{String(value)}</code>,
    },
    { title: "级别", dataIndex: "severity", width: 90 },
    { title: "持续时间", dataIndex: "duration", width: 100 },
    {
      title: "状态",
      width: 90,
      render: (_, rule) => (
        <span className={rule.enabled ? "text-green-600" : "text-gray-400"}>
          {rule.enabled ? "已启用" : "已停用"}
        </span>
      ),
    },
    { title: "通知渠道", dataIndex: "channel", width: 150 },
    { title: "更新时间", dataIndex: "updatedAt", width: 165 },
    {
      title: "操作",
      width: 100,
      fixed: "right",
      render: () => (
        <Button type="text" size="small" disabled>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="告警规则"
        subtitle="查看平台组件、GPU、推理和知识库的告警阈值与通知渠道。"
        extra={
          <Button type="primary" disabled>
            新建规则
          </Button>
        }
      />
      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold text-gray-900">
                平台告警规则
              </div>
              <div className="mt-1 text-xs text-gray-500">
                当前为只读规则快照；创建、启停和编辑待接口接入后开放。
              </div>
            </div>
            <span className="text-xs text-gray-500">
              显示 {filteredRules.length} / {alertRules.length} 条
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
                  style={{ width: 130 }}
                  options={[
                    { label: "全部级别", value: "all" },
                    { label: "严重", value: "严重" },
                    { label: "警告", value: "警告" },
                    { label: "提示", value: "提示" },
                  ]}
                />
                <Select
                  value={enabled}
                  onChange={setEnabled}
                  style={{ width: 130 }}
                  options={[
                    { label: "全部状态", value: "all" },
                    { label: "已启用", value: "true" },
                    { label: "已停用", value: "false" },
                  ]}
                />
                <Input.Search
                  allowClear
                  value={keyword}
                  onChange={setKeyword}
                  placeholder="搜索规则名称或对象"
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
          data={filteredRules}
          pagination={false}
          scroll={{ x: 1335 }}
          emptyText="没有符合筛选条件的告警规则"
        />
      </ListPageFrame>
    </div>
  );
}
