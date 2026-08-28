import { Progress, Table, Typography } from "@arco-design/web-react";
import type { Tenant } from "@/features/tenant-management/model";
import { formatQuotaValue, getUsagePercent } from "../formatters";

interface QuotaRow {
  key: string;
  resource: string;
  usage: number | null;
  limit: number;
  usageUnit: string;
  limitUnit: string;
}

interface QuotaUsageTableProps {
  tenant: Tenant;
}

export function QuotaUsageTable({ tenant }: QuotaUsageTableProps) {
  const rows: QuotaRow[] = [
    {
      key: "gpu-hours",
      resource: "GPU-Hours",
      usage: tenant.usage.gpuHours,
      limit: tenant.quotaLimits.gpuHours,
      usageUnit: "GPU-Hours",
      limitUnit: "GPU-Hours",
    },
    {
      key: "cpu",
      resource: "CPU",
      usage: tenant.usage.cpuHours,
      limit: tenant.quotaLimits.cpuCores,
      usageUnit: "CPU-Hours",
      limitUnit: "核",
    },
    {
      key: "memory",
      resource: "内存",
      usage: null,
      limit: tenant.quotaLimits.memoryGi,
      usageUnit: "Gi",
      limitUnit: "Gi",
    },
    {
      key: "storage",
      resource: "存储",
      usage: tenant.usage.storageGi,
      limit: tenant.quotaLimits.storageGi,
      usageUnit: "Gi",
      limitUnit: "Gi",
    },
    {
      key: "tokens",
      resource: "Tokens",
      usage: tenant.usage.tokens,
      limit: tenant.quotaLimits.tokenQuota,
      usageUnit: "Tokens",
      limitUnit: "Tokens",
    },
    {
      key: "kb-queries",
      resource: "知识库查询",
      usage: tenant.usage.kbQueries,
      limit: tenant.quotaLimits.kbQueries,
      usageUnit: "次",
      limitUnit: "次",
    },
    {
      key: "members",
      resource: "成员",
      usage: tenant.memberCount,
      limit: tenant.quotaLimits.maxMembers,
      usageUnit: "人",
      limitUnit: "人",
    },
    {
      key: "inferences",
      resource: "推理服务",
      usage: tenant.resourceSummary.inferences,
      limit: tenant.quotaLimits.maxInferences,
      usageUnit: "个",
      limitUnit: "个",
    },
  ];

  return (
    <section>
      <Typography.Title heading={6} className="!mb-4">
        配额与用量
      </Typography.Title>
      <Table
        rowKey="key"
        pagination={false}
        data={rows}
        columns={[
          { title: "资源项", dataIndex: "resource", width: 150 },
          {
            title: "当前用量",
            render: (_, record: QuotaRow) =>
              record.usage === null
                ? "—"
                : formatQuotaValue(record.usage, record.usageUnit),
          },
          {
            title: "配额上限",
            render: (_, record: QuotaRow) =>
              formatQuotaValue(record.limit, record.limitUnit),
          },
          {
            title: "使用率",
            width: 220,
            render: (_, record: QuotaRow) => {
              const percent = getUsagePercent(record.usage, record.limit);
              if (percent === null || record.usageUnit !== record.limitUnit)
                return "—";
              return (
                <div className="flex items-center gap-3">
                  <Progress
                    percent={Math.min(percent, 100)}
                    showText={false}
                    status={percent > 100 ? "error" : "normal"}
                    className="min-w-28 flex-1"
                  />
                  <span className="w-14 text-right tabular-nums">
                    {percent}%
                  </span>
                </div>
              );
            },
          },
        ]}
      />
    </section>
  );
}
