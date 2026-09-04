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
  notificationIntegrations,
  type IntegrationStatus,
  type NotificationIntegration,
} from "../model";

export function NotificationIntegrationsPage() {
  const [keyword, setKeyword] = useState("");
  const [provider, setProvider] = useState("all");
  const filteredIntegrations = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return notificationIntegrations.filter(
      (integration) =>
        (provider === "all" || integration.provider === provider) &&
        (!normalized ||
          [integration.name, integration.target, integration.eventGroups].some(
            (value) => value.toLowerCase().includes(normalized),
          )),
    );
  }, [keyword, provider]);
  const columns: ListColumn<NotificationIntegration>[] = [
    {
      title: "集成",
      width: 220,
      fixed: "left",
      render: (_, integration) => (
        <DataTableNameCell name={integration.name} secondary={integration.id} />
      ),
    },
    { title: "渠道", dataIndex: "provider", width: 140 },
    { title: "目标", dataIndex: "target", width: 240 },
    { title: "事件范围", dataIndex: "eventGroups", width: 260 },
    {
      title: "状态",
      width: 100,
      render: (_, integration) => (
        <IntegrationStatusBadge status={integration.status} />
      ),
    },
    { title: "最近投递", dataIndex: "lastDelivery", width: 170 },
    { title: "近 7 日成功率", dataIndex: "successRate", width: 130 },
    {
      title: "操作",
      width: 220,
      fixed: "right",
      render: (_, integration) => (
        <DataTableRowActions>
          <DataTableRowActionButton disabled>配置</DataTableRowActionButton>
          <DataTableRowActionButton disabled>测试通知</DataTableRowActionButton>
          <DataTableRowActionButton disabled>
            {integration.status === "disabled" ? "启用" : "停用"}
          </DataTableRowActionButton>
        </DataTableRowActions>
      ),
    },
  ];
  const enabledCount = notificationIntegrations.filter(
    (integration) => integration.status === "enabled",
  ).length;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="企业通知集成"
        subtitle="P1 静态页面，用于规划平台告警、故障和运营事件的企业通知渠道。"
        extra={
          <Button type="primary" icon={<IconPlus />} disabled>
            添加通知渠道
          </Button>
        }
      />
      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric
          label="通知渠道"
          value={String(notificationIntegrations.length)}
          hint="当前样本"
        />
        <Metric
          label="已启用"
          value={String(enabledCount)}
          hint="静态配置状态"
        />
        <Metric label="今日通知" value="96" hint="跨全部渠道" />
        <Metric label="投递异常" value="1" hint="需要检查凭据" tone="danger" />
      </section>
      <ListPageFrame
        header={
          <div className="px-5 pt-5">
            <div className="text-base font-semibold">通知渠道</div>
            <div className="mt-1 text-xs text-gray-500">
              渠道凭据、事件路由和投递测试尚未接入。
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
                  placeholder="搜索渠道名称、目标或事件"
                  className="w-64"
                />
                <Select
                  value={provider}
                  onChange={setProvider}
                  className="w-36"
                >
                  <Select.Option value="all">全部渠道</Select.Option>
                  {[
                    ...new Set(
                      notificationIntegrations.map((item) => item.provider),
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
          scroll={{ x: 1480 }}
          emptyText="暂无符合条件的企业通知集成"
        />
      </ListPageFrame>
    </div>
  );
}
