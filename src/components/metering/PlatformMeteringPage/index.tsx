import { Button, Input, Select, Tabs } from "@arco-design/web-react";
import { IconDownload, IconSearch } from "@arco-design/web-react/icon";
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
import { MeteringTrend } from "../MeteringTrend";
import {
  meteringDimensions,
  type MeteringDimension,
  type MeteringTenantRow,
} from "../model";

const trendLabel = {
  up: "上升",
  down: "下降",
  flat: "持平",
} as const;

export function PlatformMeteringPage() {
  const [dimension, setDimension] = useState<MeteringDimension>("gpu");
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("all");
  const current =
    meteringDimensions.find((item) => item.key === dimension) ??
    meteringDimensions[0];
  const filteredTenants = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return current.tenants.filter(
      (tenant) =>
        (region === "all" || tenant.region === region) &&
        (!normalizedKeyword ||
          tenant.tenant.toLowerCase().includes(normalizedKeyword) ||
          tenant.tenantCode.toLowerCase().includes(normalizedKeyword)),
    );
  }, [current, keyword, region]);

  const columns: ListColumn<MeteringTenantRow>[] = [
    {
      title: "租户",
      width: 220,
      fixed: "left",
      render: (_, tenant) => (
        <DataTableNameCell name={tenant.tenant} secondary={tenant.tenantCode} />
      ),
    },
    { title: "区域", dataIndex: "region", width: 120 },
    {
      title: `本月用量（${current.unit}）`,
      width: 190,
      render: (_, tenant) => tenant.current.toLocaleString(),
    },
    {
      title: `上月用量（${current.unit}）`,
      width: 190,
      render: (_, tenant) => tenant.previous.toLocaleString(),
    },
    {
      title: "环比",
      width: 120,
      render: (_, tenant) => {
        const rate =
          ((tenant.current - tenant.previous) / tenant.previous) * 100;
        return (
          <span
            className={
              rate > 0
                ? "text-orange-600"
                : rate < 0
                  ? "text-green-600"
                  : "text-gray-500"
            }
          >
            {rate > 0 ? "+" : ""}
            {rate.toFixed(1)}% · {trendLabel[tenant.trend]}
          </span>
        );
      },
    },
    {
      title: "配额使用率",
      width: 150,
      render: (_, tenant) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded bg-gray-100">
            <div
              className={
                tenant.quotaRate >= 80
                  ? "h-full bg-orange-500"
                  : "h-full bg-blue-500"
              }
              style={{ width: `${tenant.quotaRate}%` }}
            />
          </div>
          <span>{tenant.quotaRate}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="计量总览"
        subtitle="汇总全平台资源使用量与租户分布；当前为静态计量口径示意，不作为账单依据。"
        extra={
          <Button icon={<IconDownload />} disabled>
            导出计量明细
          </Button>
        }
      />

      <Tabs
        activeTab={dimension}
        onChange={(key) => setDimension(key as MeteringDimension)}
        className="rounded-lg border border-gray-200 bg-white px-5 pt-1"
      >
        {meteringDimensions.map((item) => (
          <Tabs.TabPane key={item.key} title={item.label} />
        ))}
      </Tabs>

      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric label="本月合计" value={current.total} hint={current.unit} />
        <Metric label="环比" value={current.monthOnMonth} hint="较上月同期" />
        <Metric label="峰值日" value={current.peakDay} hint="本月单日峰值" />
        <Metric
          label="配额使用率"
          value={current.quotaRate}
          hint="平台租户配额汇总"
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold text-gray-900">
              近 7 日趋势
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {current.description}
            </div>
          </div>
          <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
            单位：{current.unit}
          </span>
        </div>
        <div className="mt-3">
          <MeteringTrend data={current} />
        </div>
      </section>

      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold text-gray-900">
                租户用量排行
              </div>
              <div className="mt-1 text-xs text-gray-500">
                按当前计量维度的本月累计用量降序排列。
              </div>
            </div>
            <span className="text-xs text-gray-500">
              共 {filteredTenants.length} 个租户
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
                  placeholder="搜索租户名称或编码"
                  className="w-60"
                />
                <Select value={region} onChange={setRegion} className="w-36">
                  <Select.Option value="all">全部区域</Select.Option>
                  <Select.Option value="华东一区">华东一区</Select.Option>
                  <Select.Option value="华北一区">华北一区</Select.Option>
                  <Select.Option value="华南一区">华南一区</Select.Option>
                </Select>
              </div>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={[...filteredTenants].sort(
            (left, right) => right.current - left.current,
          )}
          pagination={false}
          scroll={{ x: 970 }}
          emptyText="暂无符合条件的租户计量数据"
        />
      </ListPageFrame>
    </div>
  );
}
