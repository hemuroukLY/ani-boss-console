import {
  Card,
  Form,
  InputNumber,
  Menu,
  Message,
  Modal,
  Select,
} from "@arco-design/web-react";
import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { useMemo, useState } from "react";
import {
  DataTable,
  ListPageHeader,
  DataTableRowActionButton,
  DataTableRowActions,
  ListRowMore,
  type ListColumn,
} from "@/components/common";
import { Metric } from "@/components/overview/Metric";

type GpuDeviceState =
  | "available"
  | "reserved"
  | "allocated"
  | "maintenance"
  | "unavailable";

interface GpuDevice {
  id: string;
  node: string;
  name: string;
  model: string;
  memGi: number;
  virt: string;
  state: GpuDeviceState;
  tenant: string;
  occupant: string;
  utilPct: number;
  reason?: string;
  sliceOf?: string;
  computeShare?: number;
}

interface TenantCapacity {
  tenant: string;
  maxGpu: number;
}

interface GpuQueue {
  id: string;
  name: string;
  scope: "platform" | "tenant";
  tenant?: string;
  weight: number;
  reclaimable: boolean;
  workload: string;
  status: "enabled" | "disabled";
}

interface GpuEvent {
  id: string;
  message: string;
  at: string;
}

interface SplitFormValues {
  parts: number;
  memoryPerSlice: number;
  computeShare: number;
}

interface AssignFormValues {
  tenant: string;
}

interface QuotaFormValues {
  maxGpu: number;
}

const initialDevices: GpuDevice[] = [
  {
    id: "gpu-dev-01",
    node: "gpu-a",
    name: "GPU-0",
    model: "A100",
    memGi: 40,
    virt: "整卡",
    state: "allocated",
    tenant: "demo-corp",
    occupant: "gpu-infer-01",
    utilPct: 71,
  },
  {
    id: "gpu-dev-02",
    node: "gpu-a",
    name: "GPU-1",
    model: "A100",
    memGi: 40,
    virt: "整卡",
    state: "available",
    tenant: "—",
    occupant: "—",
    utilPct: 0,
  },
  {
    id: "gpu-dev-03",
    node: "gpu-b",
    name: "GPU-0",
    model: "H100",
    memGi: 80,
    virt: "整卡",
    state: "allocated",
    tenant: "demo-corp",
    occupant: "gpu-train-01",
    utilPct: 88,
  },
  {
    id: "gpu-dev-04",
    node: "gpu-b",
    name: "GPU-1",
    model: "H100",
    memGi: 80,
    virt: "整卡",
    state: "maintenance",
    tenant: "—",
    occupant: "—",
    utilPct: 0,
    reason: "驱动升级窗口",
  },
  {
    id: "gpu-dev-05",
    node: "gpu-c",
    name: "GPU-0",
    model: "A10",
    memGi: 24,
    virt: "整卡",
    state: "available",
    tenant: "—",
    occupant: "—",
    utilPct: 0,
  },
  {
    id: "gpu-dev-06",
    node: "gpu-c",
    name: "GPU-1",
    model: "A10",
    memGi: 24,
    virt: "整卡",
    state: "unavailable",
    tenant: "—",
    occupant: "—",
    utilPct: 0,
    reason: "Xid 79 硬件错误",
  },
  {
    id: "gpu-dev-07",
    node: "gpu-d",
    name: "GPU-0",
    model: "A100",
    memGi: 40,
    virt: "整卡",
    state: "allocated",
    tenant: "acme-ai",
    occupant: "acme-batch-3",
    utilPct: 55,
  },
  {
    id: "gpu-dev-08",
    node: "gpu-d",
    name: "GPU-1",
    model: "A100",
    memGi: 40,
    virt: "整卡",
    state: "available",
    tenant: "—",
    occupant: "—",
    utilPct: 0,
  },
];

const initialTenantCapacities: TenantCapacity[] = [
  { tenant: "demo-corp", maxGpu: 6 },
  { tenant: "acme-ai", maxGpu: 8 },
  { tenant: "northwind", maxGpu: 2 },
];

const initialQueues: GpuQueue[] = [
  {
    id: "q-platform",
    name: "platform-default",
    scope: "platform",
    weight: 10,
    reclaimable: true,
    workload: "全部",
    status: "enabled",
  },
  {
    id: "q-demo-train",
    name: "demo-train",
    scope: "tenant",
    tenant: "demo-corp",
    weight: 5,
    reclaimable: false,
    workload: "训练",
    status: "enabled",
  },
  {
    id: "q-demo-infer",
    name: "demo-infer",
    scope: "tenant",
    tenant: "demo-corp",
    weight: 8,
    reclaimable: true,
    workload: "推理",
    status: "enabled",
  },
];

const initialEvents: GpuEvent[] = [
  {
    id: "gpu-event-1",
    message: "gpu-b/GPU-1 进入维护窗口",
    at: "2026-08-31 09:20",
  },
  {
    id: "gpu-event-2",
    message: "gpu-c/GPU-1 上报 Xid 79 硬件错误",
    at: "2026-08-31 08:46",
  },
];

const deviceStateMeta: Record<
  GpuDeviceState,
  { label: string; className: string }
> = {
  available: {
    label: "空闲（未分配）",
    className: "bg-green-50 text-green-700",
  },
  reserved: {
    label: "已预留给租户",
    className: "bg-orange-50 text-orange-700",
  },
  allocated: {
    label: "租户已占用",
    className: "bg-gray-100 text-gray-700",
  },
  maintenance: {
    label: "维护中",
    className: "bg-orange-50 text-orange-700",
  },
  unavailable: {
    label: "不可用",
    className: "bg-red-50 text-red-700",
  },
};

function nowText() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const Route = createFileRoute("/ops-gpu/")({
  component: GpuResourcePoolManagementRoute,
});

function GpuResourcePoolManagementRoute() {
  const [devices, setDevices] = useState(initialDevices);
  const [tenantCapacities, setTenantCapacities] = useState(
    initialTenantCapacities,
  );
  const [events, setEvents] = useState(initialEvents);
  const [splitTarget, setSplitTarget] = useState<GpuDevice | null>(null);
  const [assignTarget, setAssignTarget] = useState<GpuDevice | null>(null);
  const [quotaTarget, setQuotaTarget] = useState<TenantCapacity | null>(null);
  const [splitForm] = Form.useForm<SplitFormValues>();
  const [assignForm] = Form.useForm<AssignFormValues>();
  const [quotaForm] = Form.useForm<QuotaFormValues>();

  const summary = useMemo(
    () => ({
      total: devices.length,
      available: devices.filter((device) => device.state === "available")
        .length,
      reserved: devices.filter((device) => device.state === "reserved")
        .length,
      allocated: devices.filter((device) => device.state === "allocated")
        .length,
      abnormal: devices.filter((device) =>
        ["maintenance", "unavailable"].includes(device.state),
      ).length,
    }),
    [devices],
  );

  const tenantBoard = useMemo(
    () =>
      tenantCapacities.map((capacity) => ({
        ...capacity,
        reserved: devices.filter(
          (device) =>
            device.tenant === capacity.tenant && device.state === "reserved",
        ).length,
        allocated: devices.filter(
          (device) =>
            device.tenant === capacity.tenant && device.state === "allocated",
        ).length,
      })),
    [devices, tenantCapacities],
  );

  const addEvent = (message: string) => {
    setEvents((current) => [
      { id: `gpu-event-${Date.now()}`, message, at: nowText() },
      ...current,
    ]);
  };

  const updateDevice = (
    deviceId: string,
    updater: (device: GpuDevice) => GpuDevice,
  ) => {
    setDevices((current) =>
      current.map((device) =>
        device.id === deviceId ? updater(device) : device,
      ),
    );
  };

  const openSplitModal = (device: GpuDevice) => {
    splitForm.setFieldsValue({
      parts: 2,
      memoryPerSlice: Math.floor(device.memGi / 2),
      computeShare: 50,
    });
    setSplitTarget(device);
  };

  const applySplit = () => {
    splitForm.validate().then((values) => {
      if (!splitTarget) return;
      if (values.parts * values.memoryPerSlice > splitTarget.memGi) {
        Message.warning("切分显存总量不能超过物理卡显存");
        return;
      }
      if (values.parts * values.computeShare > 100) {
        Message.warning("切分算力份额总和不能超过 100% ");
        return;
      }
      const slices = Array.from({ length: values.parts }, (_, index) => ({
        ...splitTarget,
        id: `${splitTarget.id}-slice-${index + 1}`,
        name: `${splitTarget.name}-${index + 1}`,
        memGi: values.memoryPerSlice,
        virt: `vGPU 1/${values.parts}`,
        sliceOf: splitTarget.id,
        computeShare: values.computeShare,
      }));
      setDevices((current) =>
        current.flatMap((device) =>
          device.id === splitTarget.id ? slices : [device],
        ),
      );
      addEvent(
        `${splitTarget.node}/${splitTarget.name} 切分为 ${values.parts} 份 vGPU`,
      );
      Message.success("GPU 自定义切分已完成");
      setSplitTarget(null);
      splitForm.resetFields();
    });
  };

  const assignDevice = () => {
    assignForm.validate().then(({ tenant }) => {
      if (!assignTarget) return;
      updateDevice(assignTarget.id, (device) => ({
        ...device,
        state: "reserved",
        tenant,
        occupant: "预留（未创建实例）",
        reason: "",
      }));
      const held = devices.filter(
        (device) =>
          device.tenant === tenant &&
          ["reserved", "allocated"].includes(device.state),
      ).length;
      setTenantCapacities((current) =>
        current.map((capacity) =>
          capacity.tenant === tenant && capacity.maxGpu < held + 1
            ? { ...capacity, maxGpu: held + 1 }
            : capacity,
        ),
      );
      addEvent(
        `${assignTarget.node}/${assignTarget.name} 分配给 ${tenant}（预留）`,
      );
      Message.success(`已将 GPU 预留给 ${tenant}`);
      setAssignTarget(null);
      assignForm.resetFields();
    });
  };

  const assignFirstAvailable = (tenant: string) => {
    const device = devices.find(
      (item) => item.state === "available",
    );
    if (!device) {
      Message.warning("没有可分配的空闲 GPU");
      return;
    }
    updateDevice(device.id, (current) => ({
      ...current,
      state: "reserved",
      tenant,
      occupant: "预留（未创建实例）",
      reason: "",
    }));
    const board = tenantBoard.find((item) => item.tenant === tenant);
    const nextHeld = (board?.reserved ?? 0) + (board?.allocated ?? 0) + 1;
    setTenantCapacities((current) =>
      current.map((capacity) =>
        capacity.tenant === tenant && capacity.maxGpu < nextHeld
          ? { ...capacity, maxGpu: nextHeld }
          : capacity,
      ),
    );
    addEvent(`${device.node}/${device.name} 分配给 ${tenant}（预留）`);
    Message.success(`已给 ${tenant} 预留 1 张 GPU`);
  };

  const applyQuota = () => {
    quotaForm.validate().then(({ maxGpu }) => {
      if (!quotaTarget) return;
      const board = tenantBoard.find(
        (item) => item.tenant === quotaTarget.tenant,
      );
      const minimum = (board?.reserved ?? 0) + (board?.allocated ?? 0);
      if (maxGpu < minimum) {
        Message.warning(`配额上限不能低于当前已持有的 ${minimum} 张 GPU`);
        return;
      }
      setTenantCapacities((current) =>
        current.map((capacity) =>
          capacity.tenant === quotaTarget.tenant
            ? { ...capacity, maxGpu }
            : capacity,
        ),
      );
      addEvent(`${quotaTarget.tenant} GPU 配额上限调整为 ${maxGpu}`);
      Message.success("GPU 配额上限已更新");
      setQuotaTarget(null);
      quotaForm.resetFields();
    });
  };

  const setDeviceMaintenance = (device: GpuDevice) => {
    Modal.confirm({
      title: `将 ${device.node}/${device.name} 标记为维护中？`,
      content: "维护中的 GPU 不再参与租户调度。",
      okText: "确认",
      cancelText: "取消",
      onOk: () => {
        updateDevice(device.id, (current) => ({
          ...current,
          state: "maintenance",
          tenant: "—",
          occupant: "—",
          utilPct: 0,
          reason: "人工维护",
        }));
        addEvent(`${device.node}/${device.name} → 维护中`);
        Message.success("设备已进入维护状态");
      },
    });
  };

  const restoreDevice = (device: GpuDevice) => {
    updateDevice(device.id, (current) => ({
      ...current,
      state: "available",
      tenant: "—",
      occupant: "—",
      reason: "",
      utilPct: 0,
    }));
    addEvent(`${device.node}/${device.name} → 空闲可用`);
    Message.success("设备已恢复空闲");
  };

  const unassignDevice = (device: GpuDevice) => {
    updateDevice(device.id, (current) => ({
      ...current,
      state: "available",
      tenant: "—",
      occupant: "—",
      reason: "",
    }));
    addEvent(`${device.node}/${device.name} 收回预留`);
    Message.success("GPU 已收回共享空闲池");
  };

  const tenantColumns: ListColumn<(typeof tenantBoard)[number]>[] = [
    { title: "租户", dataIndex: "tenant", width: 180 },
    { title: "已预留", dataIndex: "reserved", width: 110 },
    { title: "已占用", dataIndex: "allocated", width: 110 },
    {
      title: "配额上限",
      width: 140,
      render: (_, item) => `${item.allocated} / ${item.maxGpu}`,
    },
    {
      title: "操作",
      width: "max-content",
      fixed: "right",
      render: (_, item) => (
        <DataTableRowActions>
          <DataTableRowActionButton
            onClick={() => assignFirstAvailable(item.tenant)}
          >
            分 1 张空闲卡
          </DataTableRowActionButton>
          <DataTableRowActionButton
            onClick={() => {
              quotaForm.setFieldsValue({ maxGpu: item.maxGpu });
              setQuotaTarget(item);
            }}
          >
            调配额上限
          </DataTableRowActionButton>
        </DataTableRowActions>
      ),
    },
  ];

  const deviceColumns: ListColumn<GpuDevice>[] = [
    {
      title: "节点 / 卡",
      width: 170,
      render: (_, device) => `${device.node} / ${device.name}`,
    },
    {
      title: "型号",
      width: 180,
      render: (_, device) =>
        `${device.model} · ${device.memGi} Gi${device.computeShare ? ` · ${device.computeShare}%` : ""}`,
    },
    { title: "切分", dataIndex: "virt", width: 130 },
    {
      title: "状态",
      dataIndex: "state",
      width: 150,
      render: (state: GpuDeviceState) => (
        <span
          className={clsx(
            "inline-flex rounded px-2 py-0.5 text-xs",
            deviceStateMeta[state].className,
          )}
        >
          {deviceStateMeta[state].label}
        </span>
      ),
    },
    {
      title: "归属",
      width: 220,
      render: (_, device) =>
        device.tenant === "—"
          ? device.reason || "—"
          : `${device.tenant} · ${device.occupant}`,
    },
    {
      title: "操作",
      width: "max-content",
      fixed: "right",
      render: (_, device) => {
        if (device.state === "reserved") {
          return (
            <DataTableRowActionButton onClick={() => unassignDevice(device)}>
              收回预留
            </DataTableRowActionButton>
          );
        }
        if (device.state === "maintenance") {
          return (
            <DataTableRowActionButton onClick={() => restoreDevice(device)}>
              恢复空闲
            </DataTableRowActionButton>
          );
        }
        if (device.state !== "available") return "—";

        const canSplit = !device.sliceOf && !device.virt.startsWith("vGPU");
        const moreMenu = (
          <Menu
            onClickMenuItem={(action) => {
              if (action === "split") openSplitModal(device);
              if (action === "maintenance") setDeviceMaintenance(device);
            }}
          >
            {canSplit ? <Menu.Item key="split">自定义切分</Menu.Item> : null}
            <Menu.Item key="maintenance">标记维护</Menu.Item>
          </Menu>
        );
        return (
          <DataTableRowActions>
            <DataTableRowActionButton
              onClick={() => {
                assignForm.setFieldsValue({ tenant: "demo-corp" });
                setAssignTarget(device);
              }}
            >
              分配
            </DataTableRowActionButton>
            <ListRowMore droplist={moreMenu} />
          </DataTableRowActions>
        );
      },
    },
  ];

  const queueColumns: ListColumn<GpuQueue>[] = [
    { title: "队列", dataIndex: "name", width: 220 },
    {
      title: "范围",
      width: 180,
      render: (_, queue) =>
        queue.scope === "platform"
          ? "平台"
          : `租户 / ${queue.tenant ?? "—"}`,
    },
    { title: "权重", dataIndex: "weight", width: 100 },
    {
      title: "可回收",
      width: 100,
      render: (_, queue) => (queue.reclaimable ? "是" : "否"),
    },
    { title: "工作负载", dataIndex: "workload", width: 130 },
    {
      title: "状态",
      dataIndex: "status",
      width: 110,
      render: (status: GpuQueue["status"]) =>
        status === "enabled" ? "已启用" : "已停用",
    },
  ];

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="GPU 资源池管理"
        subtitle="管理 GPU 设备切分、租户分配、配额上限和调度队列。"
      />

      <section className="grid grid-cols-5 gap-3.5 max-[1280px]:grid-cols-3">
        <Metric
          label="物理 / 逻辑卡"
          value={String(summary.total)}
          hint="当前设备池"
        />
        <Metric
          label="空闲未分配"
          value={String(summary.available)}
          hint="可切分 / 可分配"
        />
        <Metric
          label="已预留"
          value={String(summary.reserved)}
          hint="分给租户未创建"
        />
        <Metric
          label="已占用"
          value={String(summary.allocated)}
          hint="租户实例占用"
        />
        <Metric
          label="异常"
          value={String(summary.abnormal)}
          hint="维护中 + 不可用"
          tone={summary.abnormal ? "danger" : ""}
        />
      </section>

      <Card
        title="租户分配台账"
        className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0"
      >
        <DataTable
          rowKey="tenant"
          columns={tenantColumns}
          data={tenantBoard}
          pagination={false}
        />
      </Card>

      <Card
        title="设备列表"
        className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0"
      >
        <DataTable
          rowKey="id"
          columns={deviceColumns}
          data={devices}
          pagination={false}
        />
      </Card>

      <Card
        title="调度队列"
        className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0"
      >
        <DataTable
          rowKey="id"
          columns={queueColumns}
          data={initialQueues}
          pagination={false}
        />
      </Card>

      <Card title="联动事件" className="rounded-lg">
        <div className="divide-y divide-gray-100">
          {events.length ? (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-gray-700">{event.message}</span>
                <span className="shrink-0 text-xs text-gray-400">{event.at}</span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">暂无事件</div>
          )}
        </div>
      </Card>

      <Modal
        title={`自定义切分${splitTarget ? `：${splitTarget.node}/${splitTarget.name}` : ""}`}
        visible={Boolean(splitTarget)}
        onOk={applySplit}
        onCancel={() => {
          setSplitTarget(null);
          splitForm.resetFields();
        }}
      >
        <Form form={splitForm} layout="vertical">
          <Form.Item
            label="切分份数"
            field="parts"
            rules={[{ required: true, type: "number", min: 2, max: 8 }]}
          >
            <InputNumber min={2} max={8} precision={0} className="w-full" />
          </Form.Item>
          <Form.Item
            label="每份显存（Gi）"
            field="memoryPerSlice"
            rules={[{ required: true, type: "number", min: 1 }]}
          >
            <InputNumber min={1} precision={0} className="w-full" />
          </Form.Item>
          <Form.Item
            label="每份算力份额（%）"
            field="computeShare"
            rules={[{ required: true, type: "number", min: 1, max: 100 }]}
          >
            <InputNumber min={1} max={100} precision={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`分配 GPU${assignTarget ? `：${assignTarget.node}/${assignTarget.name}` : ""}`}
        visible={Boolean(assignTarget)}
        onOk={assignDevice}
        onCancel={() => {
          setAssignTarget(null);
          assignForm.resetFields();
        }}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            label="租户"
            field="tenant"
            rules={[{ required: true, message: "请选择租户" }]}
          >
            <Select
              placeholder="请选择租户"
              options={tenantCapacities.map((item) => ({
                label: item.tenant,
                value: item.tenant,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`调整配额上限${quotaTarget ? `：${quotaTarget.tenant}` : ""}`}
        visible={Boolean(quotaTarget)}
        onOk={applyQuota}
        onCancel={() => {
          setQuotaTarget(null);
          quotaForm.resetFields();
        }}
      >
        <Form form={quotaForm} layout="vertical">
          <Form.Item
            label="GPU 卡数上限"
            field="maxGpu"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber min={0} precision={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
