import { Button, Input, Select } from "@arco-design/web-react";
import { IconDownload, IconSearch } from "@arco-design/web-react/icon";
import { useMemo, useState } from "react";
import {
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  ListToolbar,
  type ListColumn,
} from "@/components/common";
import { Metric } from "@/components/overview/Metric";
import { AuditResultBadge } from "../AuditResultBadge";
import { apiKeyAuditLogs, type ApiKeyAuditLog } from "../model";

export function ApiKeyAuditPage() {
  const [keyword, setKeyword] = useState("");
  const [action, setAction] = useState("all");
  const filteredLogs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return apiKeyAuditLogs.filter(
      (log) =>
        (action === "all" || log.action === action) &&
        (!normalized ||
          [
            log.tenant,
            log.keyName,
            log.keyPrefix,
            log.actor,
            log.sourceIp,
          ].some((value) => value.toLowerCase().includes(normalized))),
    );
  }, [action, keyword]);
  const columns: ListColumn<ApiKeyAuditLog>[] = [
    { title: "时间", dataIndex: "occurredAt", width: 170, fixed: "left" },
    { title: "租户", dataIndex: "tenant", width: 150 },
    {
      title: "API Key",
      width: 200,
      render: (_, log) => (
        <div>
          <div className="font-medium">{log.keyName}</div>
          <div className="font-mono text-xs text-gray-500">
            {log.keyPrefix}****
          </div>
        </div>
      ),
    },
    { title: "操作人/调用方", dataIndex: "actor", width: 160 },
    { title: "动作", dataIndex: "action", width: 90 },
    { title: "权限范围", dataIndex: "scopes", width: 240 },
    { title: "来源 IP", dataIndex: "sourceIp", width: 140 },
    {
      title: "结果",
      width: 90,
      fixed: "right",
      render: (_, log) => <AuditResultBadge result={log.result} />,
    },
  ];
  const failedCount = apiKeyAuditLogs.filter(
    (log) => log.result === "failed",
  ).length;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="API Key 审计"
        subtitle="跨租户查看 API Key 的创建、轮换、禁用与调用事件，密钥正文始终隐藏。"
        extra={
          <Button icon={<IconDownload />} disabled>
            导出记录
          </Button>
        }
      />
      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric label="活跃 Key" value="47" hint="全平台租户" />
        <Metric label="今日调用" value="18.4K" hint="鉴权事件" />
        <Metric label="近 7 日轮换" value="6" hint="安全维护" />
        <Metric
          label="失败鉴权"
          value={String(failedCount)}
          hint="当前样本"
          tone="danger"
        />
      </section>
      <ListPageFrame
        header={
          <div className="px-5 pt-5">
            <div className="text-base font-semibold">Key 审计事件</div>
            <div className="mt-1 text-xs text-gray-500">
              列表仅展示不可逆前缀，不提供密钥揭示操作。
            </div>
          </div>
        }
        toolbar={
          <ListToolbar
            filters={
              <div className="flex gap-3">
                <Input
                  value={keyword}
                  onChange={setKeyword}
                  allowClear
                  prefix={<IconSearch />}
                  placeholder="搜索租户、Key 或来源 IP"
                  className="w-64"
                />
                <Select value={action} onChange={setAction} className="w-32">
                  <Select.Option value="all">全部动作</Select.Option>
                  <Select.Option value="创建">创建</Select.Option>
                  <Select.Option value="调用">调用</Select.Option>
                  <Select.Option value="轮换">轮换</Select.Option>
                  <Select.Option value="禁用">禁用</Select.Option>
                </Select>
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
          scroll={{ x: 1240 }}
          emptyText="暂无符合条件的 API Key 审计记录"
        />
      </ListPageFrame>
    </div>
  );
}
