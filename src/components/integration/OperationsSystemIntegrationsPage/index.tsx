import { Button, Input, Select } from "@arco-design/web-react";
import { IconPlus, IconSearch } from "@arco-design/web-react/icon";
import { useMemo, useState } from "react";
import {
  DataTableNameCell,
  DataTableRowActionButton,
  DataTableRowActions,
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  ListToolbar,
  type ListColumn,
} from "@/components/common";
import { Metric } from "@/components/overview/Metric";
import { IntegrationStatusBadge } from "../IntegrationStatusBadge";
import {
  operationsSystemIntegrations,
  type OperationsSystemIntegration,
} from "../model";

export function OperationsSystemIntegrationsPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const filteredIntegrations = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return operationsSystemIntegrations.filter(
      (integration) =>
        (category === "all" || integration.category === category) &&
        (!normalized ||
          [integration.name, integration.endpoint, integration.objects].some(
            (value) => value.toLowerCase().includes(normalized),
          )),
    );
  }, [category, keyword]);
  const columns: ListColumn<OperationsSystemIntegration>[] = [
    {
      title: "系统",
      width: 220,
      fixed: "left",
      render: (_, integration) => (
        <DataTableNameCell name={integration.name} secondary={integration.id} />
      ),
    },
    { title: "类别", dataIndex: "category", width: 140 },
    { title: "数据方向", dataIndex: "direction", width: 120 },
    { title: "Endpoint", dataIndex: "endpoint", width: 310 },
    { title: "同步对象", dataIndex: "objects", width: 280 },
    {
      title: "状态",
      width: 100,
      render: (_, integration) => (
        <IntegrationStatusBadge status={integration.status} />
      ),
    },
    { title: "最近同步", dataIndex: "lastSync", width: 170 },
    { title: "负责人", dataIndex: "owner", width: 120 },
    {
      title: "操作",
      width: 220,
      fixed: "right",
      render: () => (
        <DataTableRowActions>
          <DataTableRowActionButton disabled>配置</DataTableRowActionButton>
          <DataTableRowActionButton disabled>测试连接</DataTableRowActionButton>
          <DataTableRowActionButton disabled>立即同步</DataTableRowActionButton>
        </DataTableRowActions>
      ),
    },
  ];
  const enabledCount = operationsSystemIntegrations.filter(
    (integration) => integration.status === "enabled",
  ).length;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="运营系统对接"
        subtitle="P1 静态页面，用于规划 CMDB、ITSM、财务与数据平台的对接关系。"
        extra={
          <Button type="primary" icon={<IconPlus />} disabled>
            添加系统对接
          </Button>
        }
      />
      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric
          label="外部系统"
          value={String(operationsSystemIntegrations.length)}
          hint="当前样本"
        />
        <Metric label="正常" value={String(enabledCount)} hint="静态配置状态" />
        <Metric label="今日同步" value="28" hint="批次与事件合计" />
        <Metric label="待检查" value="1" hint="连接状态异常" tone="danger" />
      </section>
      <ListPageFrame
        header={
          <div className="px-5 pt-5">
            <div className="text-base font-semibold">系统对接清单</div>
            <div className="mt-1 text-xs text-gray-500">
              当前 Endpoint 和对象范围仅用于页面示意，不作为接口契约。
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
                  placeholder="搜索系统、Endpoint 或对象"
                  className="w-64"
                />
                <Select
                  value={category}
                  onChange={setCategory}
                  className="w-36"
                >
                  <Select.Option value="all">全部类别</Select.Option>
                  {[
                    ...new Set(
                      operationsSystemIntegrations.map((item) => item.category),
                    ),
                  ].map((item) => (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={filteredIntegrations}
          pagination={false}
          scroll={{ x: 1680 }}
          emptyText="暂无符合条件的运营系统对接"
        />
      </ListPageFrame>
    </div>
  );
}
