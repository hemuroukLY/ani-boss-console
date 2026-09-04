import {
  Button,
  Descriptions,
  Drawer,
  Input,
  Select,
} from "@arco-design/web-react";
import { IconDownload, IconSearch } from "@arco-design/web-react/icon";
import { useMemo, useState } from "react";
import {
  DataTableRowActionButton,
  DataTableRowActions,
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  ListToolbar,
  type ListColumn,
} from "@/components/common";
import { Metric } from "@/components/overview/Metric";
import { AuditResultBadge } from "../AuditResultBadge";
import {
  platformAuditLogs,
  type AuditResult,
  type PlatformAuditLog,
} from "../model";

export function PlatformAuditPage() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<"all" | AuditResult>("all");
  const [resourceType, setResourceType] = useState("all");
  const [selected, setSelected] = useState<PlatformAuditLog>();
  const filteredLogs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return platformAuditLogs.filter(
      (log) =>
        (result === "all" || log.result === result) &&
        (resourceType === "all" || log.resourceType === resourceType) &&
        (!normalized ||
          [log.actor, log.action, log.resource, log.tenant, log.requestId].some(
            (value) => value.toLowerCase().includes(normalized),
          )),
    );
  }, [keyword, resourceType, result]);

  const columns: ListColumn<PlatformAuditLog>[] = [
    { title: "时间", dataIndex: "occurredAt", width: 170, fixed: "left" },
    {
      title: "操作人",
      width: 180,
      render: (_, log) => (
        <div>
          <div className="font-medium text-gray-900">{log.actor}</div>
          <div className="text-xs text-gray-500">{log.actorRole}</div>
        </div>
      ),
    },
    { title: "动作", dataIndex: "action", width: 150 },
    { title: "资源类型", dataIndex: "resourceType", width: 120 },
    {
      title: "资源",
      width: 230,
      render: (_, log) => (
        <div>
          <div>{log.resource}</div>
          <div className="text-xs text-gray-500">租户：{log.tenant}</div>
        </div>
      ),
    },
    { title: "来源 IP", dataIndex: "sourceIp", width: 130 },
    {
      title: "结果",
      width: 90,
      render: (_, log) => <AuditResultBadge result={log.result} />,
    },
    {
      title: "操作",
      width: 90,
      fixed: "right",
      render: (_, log) => (
        <DataTableRowActions>
          <DataTableRowActionButton onClick={() => setSelected(log)}>
            查看
          </DataTableRowActionButton>
        </DataTableRowActions>
      ),
    },
  ];
  const failedCount = platformAuditLogs.filter(
    (log) => log.result === "failed",
  ).length;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="平台审计日志"
        subtitle="记录平台级管理操作与系统策略执行结果，日志只读且不可修改。"
        extra={
          <Button icon={<IconDownload />} disabled>
            导出日志
          </Button>
        }
      />
      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric label="今日事件" value="286" hint="全部平台操作" />
        <Metric label="人工操作" value="94" hint="管理员发起" />
        <Metric label="系统操作" value="192" hint="策略与定时任务" />
        <Metric
          label="失败事件"
          value={String(failedCount)}
          hint="当前样本"
          tone="danger"
        />
      </section>
      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold">审计事件</div>
              <div className="mt-1 text-xs text-gray-500">
                支持按操作人、动作、资源、租户和请求 ID 检索。
              </div>
            </div>
            <span className="text-xs text-gray-500">
              共 {filteredLogs.length} 条
            </span>
          </div>
        }
        toolbar={
          <ListToolbar
            filters={
              <div className="flex flex-wrap gap-3">
                <Input
                  value={keyword}
                  onChange={setKeyword}
                  allowClear
                  prefix={<IconSearch />}
                  placeholder="搜索审计事件"
                  className="w-60"
                />
                <Select
                  value={resourceType}
                  onChange={setResourceType}
                  className="w-36"
                >
                  <Select.Option value="all">全部资源类型</Select.Option>
                  {[
                    ...new Set(
                      platformAuditLogs.map((log) => log.resourceType),
                    ),
                  ].map((type) => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  value={result}
                  onChange={(value) => setResult(value as "all" | AuditResult)}
                  className="w-32"
                >
                  <Select.Option value="all">全部结果</Select.Option>
                  <Select.Option value="success">成功</Select.Option>
                  <Select.Option value="failed">失败</Select.Option>
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
          scroll={{ x: 1160 }}
          emptyText="暂无符合条件的审计事件"
        />
      </ListPageFrame>
      <Drawer
        width={520}
        title="审计事件详情"
        visible={Boolean(selected)}
        onCancel={() => setSelected(undefined)}
        footer={null}
      >
        {selected ? (
          <Descriptions
            column={1}
            border
            data={[
              { label: "请求 ID", value: selected.requestId },
              { label: "发生时间", value: selected.occurredAt },
              {
                label: "操作人",
                value: `${selected.actor} · ${selected.actorRole}`,
              },
              { label: "来源 IP", value: selected.sourceIp },
              { label: "动作", value: selected.action },
              {
                label: "资源",
                value: `${selected.resourceType} · ${selected.resource}`,
              },
              { label: "租户", value: selected.tenant },
              {
                label: "结果",
                value: selected.result === "success" ? "成功" : "失败",
              },
              { label: "变更摘要", value: selected.detail },
              { label: "User-Agent", value: "ANI Console / Chromium" },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  );
}
