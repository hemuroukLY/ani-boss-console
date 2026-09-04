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
import { inferenceAuditLogs, type InferenceAuditLog } from "../model";

function HttpStatus({ value }: { value: number }) {
  const success = value >= 200 && value < 300;
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
    >
      {value}
    </span>
  );
}

export function InferenceAuditPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const filteredLogs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return inferenceAuditLogs.filter((log) => {
      const successful = log.httpStatus >= 200 && log.httpStatus < 300;
      return (
        (status === "all" || (status === "success") === successful) &&
        (!normalized ||
          [
            log.tenant,
            log.service,
            log.model,
            log.requestId,
            log.keyPrefix,
          ].some((value) => value.toLowerCase().includes(normalized)))
      );
    });
  }, [keyword, status]);
  const columns: ListColumn<InferenceAuditLog>[] = [
    { title: "时间", dataIndex: "occurredAt", width: 170, fixed: "left" },
    { title: "租户", dataIndex: "tenant", width: 140 },
    { title: "推理服务", dataIndex: "service", width: 170 },
    { title: "模型", dataIndex: "model", width: 230 },
    { title: "接口", dataIndex: "endpoint", width: 190 },
    { title: "Key 前缀", dataIndex: "keyPrefix", width: 130 },
    {
      title: "状态码",
      width: 90,
      render: (_, log) => <HttpStatus value={log.httpStatus} />,
    },
    { title: "耗时", width: 100, render: (_, log) => `${log.latencyMs} ms` },
    {
      title: "Token",
      width: 100,
      render: (_, log) => log.tokens.toLocaleString(),
    },
    { title: "来源 IP", dataIndex: "sourceIp", width: 140 },
    { title: "请求 ID", dataIndex: "requestId", width: 170, fixed: "right" },
  ];
  const successCount = inferenceAuditLogs.filter(
    (log) => log.httpStatus >= 200 && log.httpStatus < 300,
  ).length;
  const tokenTotal = inferenceAuditLogs.reduce(
    (sum, log) => sum + log.tokens,
    0,
  );

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="推理调用审计"
        subtitle="按租户、服务、模型与 API Key 追踪推理请求元数据，不记录提示词或响应正文。"
        extra={
          <Button icon={<IconDownload />} disabled>
            导出调用记录
          </Button>
        }
      />
      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric label="今日请求" value="126.8K" hint="全平台调用" />
        <Metric
          label="成功率"
          value="99.72%"
          hint={`${successCount}/${inferenceAuditLogs.length} 条当前样本`}
        />
        <Metric label="P95 耗时" value="742 ms" hint="近 24 小时" />
        <Metric
          label="样本 Token"
          value={tokenTotal.toLocaleString()}
          hint="当前列表合计"
        />
      </section>
      <ListPageFrame
        header={
          <div className="px-5 pt-5">
            <div className="text-base font-semibold">调用记录</div>
            <div className="mt-1 text-xs text-gray-500">
              敏感请求内容不进入平台审计展示。
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
                  placeholder="搜索租户、服务、模型或请求 ID"
                  className="w-72"
                />
                <Select value={status} onChange={setStatus} className="w-32">
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
          scroll={{ x: 1640 }}
          emptyText="暂无符合条件的推理调用记录"
        />
      </ListPageFrame>
    </div>
  );
}
