import {
  Button,
  Descriptions,
  Drawer,
  Input,
  Select,
} from "@arco-design/web-react";
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
  operationsWebhooks,
  type IntegrationStatus,
  type OperationsWebhook,
  type WebhookDelivery,
} from "../model";

function DeliveryStatus({ status }: { status: number }) {
  const success = status >= 200 && status < 300;
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${
        success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      HTTP {status}
    </span>
  );
}

export function OperationsWebhookPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | IntegrationStatus>("all");
  const [selected, setSelected] = useState<OperationsWebhook>();
  const filteredWebhooks = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return operationsWebhooks.filter(
      (webhook) =>
        (status === "all" || webhook.status === status) &&
        (!normalized ||
          [webhook.name, webhook.url, ...webhook.events].some((value) =>
            value.toLowerCase().includes(normalized),
          )),
    );
  }, [keyword, status]);
  const webhookColumns: ListColumn<OperationsWebhook>[] = [
    {
      title: "Webhook",
      width: 230,
      fixed: "left",
      render: (_, webhook) => (
        <DataTableNameCell name={webhook.name} secondary={webhook.id} />
      ),
    },
    { title: "URL", dataIndex: "url", width: 330 },
    {
      title: "订阅事件",
      width: 330,
      render: (_, webhook) => (
        <div className="flex flex-wrap gap-1">
          {webhook.events.map((event) => (
            <span
              key={event}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs"
            >
              {event}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "状态",
      width: 100,
      render: (_, webhook) => (
        <IntegrationStatusBadge status={webhook.status} />
      ),
    },
    {
      title: "最近投递",
      width: 190,
      render: (_, webhook) => (
        <div>
          <div>{webhook.lastDelivery}</div>
          <div
            className={`text-xs ${
              webhook.lastResult === "failed" ? "text-red-600" : "text-gray-500"
            }`}
          >
            {webhook.lastResult === "success"
              ? "投递成功"
              : webhook.lastResult === "failed"
                ? "投递失败"
                : "-"}
          </div>
        </div>
      ),
    },
    {
      title: "操作",
      width: 250,
      fixed: "right",
      render: (_, webhook) => (
        <DataTableRowActions>
          <DataTableRowActionButton onClick={() => setSelected(webhook)}>
            详情
          </DataTableRowActionButton>
          <DataTableRowActionButton disabled>测试投递</DataTableRowActionButton>
          <DataTableRowActionButton disabled>
            {webhook.status === "disabled" ? "启用" : "停用"}
          </DataTableRowActionButton>
        </DataTableRowActions>
      ),
    },
  ];
  const deliveryColumns: ListColumn<WebhookDelivery>[] = [
    { title: "时间", dataIndex: "deliveredAt", width: 170 },
    { title: "事件", dataIndex: "event", width: 170 },
    {
      title: "结果",
      width: 100,
      render: (_, delivery) => <DeliveryStatus status={delivery.httpStatus} />,
    },
    {
      title: "耗时",
      width: 90,
      render: (_, delivery) => `${delivery.latencyMs} ms`,
    },
    { title: "重试", dataIndex: "retries", width: 70 },
    { title: "请求 ID", dataIndex: "requestId", width: 130 },
  ];
  const enabledCount = operationsWebhooks.filter(
    (webhook) => webhook.status === "enabled",
  ).length;
  const failedCount = operationsWebhooks.filter(
    (webhook) => webhook.lastResult === "failed",
  ).length;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="运维 Webhook"
        subtitle="向外部运维系统推送平台告警、故障、租户生命周期和审计事件。"
        extra={
          <Button type="primary" icon={<IconPlus />} disabled>
            新建 Webhook
          </Button>
        }
      />
      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric
          label="全部 Webhook"
          value={String(operationsWebhooks.length)}
          hint="平台级订阅"
        />
        <Metric
          label="已启用"
          value={String(enabledCount)}
          hint="正在接收事件"
        />
        <Metric label="今日投递" value="184" hint="含自动重试" />
        <Metric
          label="最近失败"
          value={String(failedCount)}
          hint="需要检查目标端"
          tone="danger"
        />
      </section>
      <ListPageFrame
        header={
          <div className="px-5 pt-5">
            <div className="text-base font-semibold">Webhook 列表</div>
            <div className="mt-1 text-xs text-gray-500">
              签名密钥仅显示前缀，投递与配置操作等待接口接入。
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
                  placeholder="搜索名称、URL 或事件"
                  className="w-64"
                />
                <Select
                  value={status}
                  onChange={(value) =>
                    setStatus(value as "all" | IntegrationStatus)
                  }
                  className="w-32"
                >
                  <Select.Option value="all">全部状态</Select.Option>
                  <Select.Option value="enabled">已启用</Select.Option>
                  <Select.Option value="disabled">已停用</Select.Option>
                </Select>
              </div>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={webhookColumns}
          data={filteredWebhooks}
          pagination={false}
          scroll={{ x: 1430 }}
          emptyText="暂无符合条件的 Webhook"
        />
      </ListPageFrame>
      <Drawer
        width={760}
        title="Webhook 详情"
        visible={Boolean(selected)}
        onCancel={() => setSelected(undefined)}
        footer={null}
      >
        {selected ? (
          <div className="space-y-5">
            <Descriptions
              column={1}
              border
              data={[
                { label: "名称", value: selected.name },
                { label: "URL", value: selected.url },
                {
                  label: "状态",
                  value: selected.status === "enabled" ? "已启用" : "已停用",
                },
                { label: "订阅事件", value: selected.events.join("、") },
                {
                  label: "签名密钥",
                  value: `${selected.secretPrefix}********`,
                },
                { label: "创建时间", value: selected.createdAt },
              ]}
            />
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">最近投递日志</div>
                <Button size="small" disabled>
                  重置签名密钥
                </Button>
              </div>
              <ListDataTable
                rowKey="id"
                columns={deliveryColumns}
                data={selected.deliveries}
                pagination={false}
                scroll={{ x: 730 }}
                emptyText="暂无投递日志"
              />
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
