import { Button, Checkbox, Input, Select, Steps } from "@arco-design/web-react";
import { IconDownload } from "@arco-design/web-react/icon";
import { useState } from "react";
import {
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  type ListColumn,
} from "@/components/common";
import { evidenceExportRecords, type EvidenceExportRecord } from "../model";

const contentOptions = [
  {
    key: "platform",
    label: "平台操作审计",
    note: "管理员操作、系统策略与资源变更",
  },
  { key: "api-key", label: "API Key 审计", note: "创建、轮换、禁用与鉴权事件" },
  {
    key: "inference",
    label: "推理调用审计",
    note: "调用元数据、状态码、耗时与 Token",
  },
];

const statusMeta = {
  ready: { label: "可下载", className: "bg-green-50 text-green-700" },
  processing: { label: "生成中", className: "bg-blue-50 text-blue-700" },
  expired: { label: "已过期", className: "bg-gray-100 text-gray-500" },
} as const;

export function ComplianceExportPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("九月审计取证包");
  const [range, setRange] = useState("last-7-days");
  const [contents, setContents] = useState(["platform", "api-key"]);
  const [format, setFormat] = useState("json-manifest");
  const toggleContent = (key: string) =>
    setContents((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  const selectedLabels = contentOptions
    .filter((option) => contents.includes(option.key))
    .map((option) => option.label);
  const columns: ListColumn<EvidenceExportRecord>[] = [
    { title: "取证包", dataIndex: "name", width: 220, fixed: "left" },
    { title: "时间范围", dataIndex: "range", width: 210 },
    { title: "内容", dataIndex: "contents", width: 220 },
    { title: "格式", dataIndex: "format", width: 170 },
    { title: "申请人", dataIndex: "requestedBy", width: 100 },
    { title: "创建时间", dataIndex: "createdAt", width: 160 },
    {
      title: "状态",
      width: 100,
      render: (_, record) => {
        const meta = statusMeta[record.status];
        return (
          <span className={`rounded px-2 py-0.5 text-xs ${meta.className}`}>
            {meta.label}
          </span>
        );
      },
    },
    { title: "过期时间", dataIndex: "expiresAt", width: 160 },
    {
      title: "操作",
      width: 90,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<IconDownload />}
          disabled={record.status !== "ready"}
        >
          下载
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="合规导出与取证"
        subtitle="按审计范围生成只读取证包；当前仅展示静态向导，不会生成或下载文件。"
      />
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <Steps current={step} size="small" className="mb-8">
          <Steps.Step title="选择范围" />
          <Steps.Step title="选择内容" />
          <Steps.Step title="确认取证" />
        </Steps>

        <div className="mx-auto min-h-[270px] max-w-3xl">
          {step === 0 ? (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-sm font-medium">取证包名称</div>
                <Input
                  value={name}
                  onChange={setName}
                  placeholder="输入取证包名称"
                />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">审计时间范围</div>
                <Select value={range} onChange={setRange} className="w-full">
                  <Select.Option value="today">今天</Select.Option>
                  <Select.Option value="last-7-days">近 7 日</Select.Option>
                  <Select.Option value="last-30-days">近 30 日</Select.Option>
                  <Select.Option value="custom">
                    自定义时间范围（预留）
                  </Select.Option>
                </Select>
              </div>
              <div className="rounded border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                取证包将记录申请人、时间范围和内容范围，并附带文件校验摘要。
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3">
              {contentOptions.map((option) => (
                <label
                  key={option.key}
                  className="flex cursor-pointer items-start gap-3 rounded border border-gray-200 p-4 hover:border-blue-300"
                >
                  <Checkbox
                    checked={contents.includes(option.key)}
                    onChange={() => toggleContent(option.key)}
                  />
                  <span>
                    <span className="block font-medium text-gray-900">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {option.note}
                    </span>
                  </span>
                </label>
              ))}
              <div>
                <div className="mb-2 mt-5 text-sm font-medium">导出格式</div>
                <Select value={format} onChange={setFormat} className="w-full">
                  <Select.Option value="json-manifest">
                    JSON + 校验清单
                  </Select.Option>
                  <Select.Option value="csv">CSV</Select.Option>
                </Select>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="rounded-lg border border-gray-200">
              {[
                ["取证包名称", name || "-"],
                [
                  "时间范围",
                  range === "today"
                    ? "今天"
                    : range === "last-7-days"
                      ? "近 7 日"
                      : range === "last-30-days"
                        ? "近 30 日"
                        : "自定义时间范围",
                ],
                ["审计内容", selectedLabels.join("、") || "-"],
                ["导出格式", format === "csv" ? "CSV" : "JSON + 校验清单"],
                ["数据口径", "只读审计快照，不包含提示词、响应正文或密钥正文"],
                ["保留期限", "生成后 7 天"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[140px_1fr] border-b border-gray-100 px-5 py-4 last:border-b-0"
                >
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-5">
          <Button
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            上一步
          </Button>
          {step < 2 ? (
            <Button
              type="primary"
              disabled={
                (step === 0 && !name.trim()) ||
                (step === 1 && contents.length === 0)
              }
              onClick={() => setStep((value) => value + 1)}
            >
              下一步
            </Button>
          ) : (
            <Button type="primary" disabled>
              生成取证包
            </Button>
          )}
        </div>
      </section>

      <ListPageFrame
        header={
          <div className="px-5 pt-5">
            <div className="text-base font-semibold">最近取证任务</div>
            <div className="mt-1 text-xs text-gray-500">
              下载和重新生成操作将在接入后端任务系统后开放。
            </div>
          </div>
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={evidenceExportRecords}
          pagination={false}
          scroll={{ x: 1430 }}
          emptyText="暂无取证任务"
        />
      </ListPageFrame>
    </div>
  );
}
