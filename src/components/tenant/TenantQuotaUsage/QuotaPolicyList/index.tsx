import {
  Alert,
  Button,
  Form,
  Grid,
  Input,
  InputNumber,
  Message,
  Menu,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from "@arco-design/web-react";
import { IconDownload, IconPlus } from "@arco-design/web-react/icon";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  DataTableNameCell,
  DataTableRowActionButton,
  DataTableRowActions,
  ListRowMore,
  type ListColumn,
} from "@/components/common";
import { useTenantManagement } from "@/components/tenant/TenantManagementProvider/useTenantManagement";
import type { TenantQuotaLimits } from "@/components/tenant/model";

type QuotaPackageStatus = "enabled" | "draft" | "disabled";

interface QuotaPackageRow {
  id: string;
  name: string;
  planCode: string;
  status: QuotaPackageStatus;
  description: string;
  isTrial: boolean;
  limits: TenantQuotaLimits;
  updatedAt: string;
}

interface QuotaPackageDraft {
  name: string;
  planCode: string;
  description: string;
  limits: TenantQuotaLimits;
}

const initialDraft: QuotaPackageDraft = {
  name: "",
  planCode: "",
  description: "",
  limits: {
    gpuHours: 1000,
    cpuCores: 64,
    memoryGi: 256,
    storageGi: 2048,
    tokenQuota: 5_000_000,
    kbQueries: 50_000,
    maxMembers: 30,
    maxInferences: 10,
  },
};

const statusMeta = {
  enabled: { label: "已启用", color: "green" },
  draft: { label: "草稿", color: "orange" },
  disabled: { label: "已停用", color: "gray" },
} as const;

function formatNow() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function QuotaPolicyList() {
  const {
    tenants,
    rebindTenantQuotaPackage,
    registerQuotaPackage,
    publishQuotaPackage: publishCatalogPackage,
    unregisterQuotaPackage,
    quotaPackages,
  } = useTenantManagement();
  const [createVisible, setCreateVisible] = useState(false);
  const [assigningPackage, setAssigningPackage] = useState<QuotaPackageRow | null>(null);
  const [targetTenantId, setTargetTenantId] = useState("");
  const [draft, setDraft] = useState<QuotaPackageDraft>(initialDraft);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const packages = useMemo<QuotaPackageRow[]>(
    () =>
      quotaPackages.map((item, index) => ({
        id: `qp-${item.planCode}`,
        name: item.name,
        planCode: item.planCode,
        status: item.status,
        description:
          item.description ??
          (item.planCode === "std"
            ? "适用于常规生产租户"
            : item.planCode === "gpu-plus"
              ? "面向高 GPU 用量场景"
              : item.planCode === "trial"
                ? "新租户试用配额"
                : "按企业合同定制限额"),
        isTrial: item.isTrial,
        limits: { ...item.limits },
        updatedAt: item.updatedAt ?? `2026-08-${String(25 - index).padStart(2, `0`)} 10:30`,
      })),
    [quotaPackages],
  );

  const boundCount = (planCode: string) =>
    tenants.filter((tenant) => tenant.planCode === planCode).length;

  const publishPackage = (item: QuotaPackageRow) => {
    if (!publishCatalogPackage(item.planCode)) {
      Message.error("套餐发布失败");
      return;
    }
    Message.success(`套餐 ${item.name} 已发布`);
  };

  const deletePackage = (item: QuotaPackageRow) => {
    if (boundCount(item.planCode) > 0) {
      Message.warning("有关联租户时不能删除套餐");
      return;
    }
    if (!unregisterQuotaPackage(item.planCode)) {
      Message.warning("有关联租户时不能删除套餐");
      return;
    }
    Message.success(`套餐 ${item.name} 已删除`);
  };

  const createPackage = () => {
    if (!draft.name.trim() || !draft.planCode.trim()) {
      Message.warning("请填写套餐名称和编码");
      return;
    }
    if (packages.some((item) => item.planCode.toLowerCase() === draft.planCode.toLowerCase())) {
      Message.warning("套餐编码已存在");
      return;
    }
    const item: QuotaPackageRow = {
      id: `qp-${Date.now()}`,
      name: draft.name.trim(),
      planCode: draft.planCode.trim(),
      description: draft.description.trim(),
      status: "enabled",
      isTrial: false,
      limits: { ...draft.limits },
      updatedAt: formatNow(),
    };
    if (
      !registerQuotaPackage({
        name: item.name,
        planCode: item.planCode,
        status: "enabled",
        isTrial: false,
        description: item.description,
        updatedAt: item.updatedAt,
        limits: { ...item.limits },
      })
    ) {
      Message.warning("套餐编码已存在");
      return;
    }
    setCreateVisible(false);
    setDraft(initialDraft);
    Message.success(`套餐 ${item.name} 已创建并发布`);
  };

  const assignPackage = () => {
    if (!assigningPackage || !targetTenantId) {
      Message.warning("请选择目标租户");
      return;
    }
    if (!rebindTenantQuotaPackage(targetTenantId, assigningPackage.planCode)) {
      Message.error("套餐改绑失败，请确认套餐已发布");
      return;
    }
    setAssigningPackage(null);
    setTargetTenantId("");
    Message.success("套餐已改绑，租户当前配额上限保持不变");
  };

  const columns: ListColumn<QuotaPackageRow>[] = [
    {
      title: "套餐 / 编码",
      dataIndex: "name",
      width: 200,
      render: (_, item) => (
        <DataTableNameCell
          name={
            <Link to="/tenants-quotas/$planCode" params={{ planCode: item.planCode }}>
              {item.name}
            </Link>
          }
          id={item.planCode}
        />
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (value: QuotaPackageStatus) => (
        <Tag color={statusMeta[value].color}>{statusMeta[value].label}</Tag>
      ),
    },
    {
      title: "GPU-Hours",
      width: 130,
      render: (_, item) => item.limits.gpuHours.toLocaleString(),
    },
    {
      title: "存储 Gi",
      width: 120,
      render: (_, item) => item.limits.storageGi.toLocaleString(),
    },
    {
      title: "绑定租户",
      width: 105,
      render: (_, item) => boundCount(item.planCode),
    },
    { title: "更新时间", dataIndex: "updatedAt", width: 160 },
    {
      title: "操作",
      width: 190,
      fixed: "right",
      render: (_, item) => {
        const moreMenu = (
          <Menu
            onClickMenuItem={(key) => {
              if (key === "publish") {
                publishPackage(item);
              } else if (key === "delete") {
                Modal.confirm({
                  title: `确定删除套餐“${item.name}”吗？`,
                  content: "有关联租户时不可删除。",
                  okButtonProps: { status: "danger" },
                  onOk: () => deletePackage(item),
                });
              }
            }}
          >
            {item.status === "draft" ? <Menu.Item key="publish">发布</Menu.Item> : null}
            <Menu.Item key="delete" disabled={boundCount(item.planCode) > 0}>
              删除
            </Menu.Item>
          </Menu>
        );

        return (
          <DataTableRowActions>
            <DataTableRowActionButton
              disabled={item.status !== "enabled"}
              onClick={() => {
                setAssigningPackage(item);
                setTargetTenantId(tenants.find((tenant) => tenant.status !== "disabled")?.id ?? "");
              }}
            >
              分配/改绑
            </DataTableRowActionButton>
            <ListRowMore droplist={moreMenu} />
          </DataTableRowActions>
        );
      },
    },
  ];

  return (
    <>
      <ListPageFrame
        header={
          <ListPageHeader
            title="配额策略"
            subtitle="管理租户配额套餐；套餐发布后限额只读，变更请新建套餐。"
            extra={
              <Space>
                <Button icon={<IconDownload />} onClick={() => Message.success("配额套餐已导出")}>
                  导出
                </Button>
                <Button type="primary" icon={<IconPlus />} onClick={() => setCreateVisible(true)}>
                  新建套餐
                </Button>
              </Space>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={packages}
          pagination={{
            page,
            pageSize,
            total: packages.length,
            onPageChange: setPage,
            onPageSizeChange: (nextPageSize) => {
              setPage(1);
              setPageSize(nextPageSize);
            },
          }}
          emptyText="还没有配额套餐"
        />
      </ListPageFrame>

      <Modal
        title="新建套餐"
        visible={createVisible}
        style={{ width: 720 }}
        okText="创建并发布"
        onOk={createPackage}
        onCancel={() => {
          setCreateVisible(false);
          setDraft(initialDraft);
        }}
      >
        <Alert
          type="warning"
          content="套餐创建并发布后，限额不可修改。请在提交前确认配置。"
          className="mb-4"
        />
        <Form layout="vertical">
          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item label="套餐名称" required>
                <Input
                  value={draft.name}
                  placeholder="例如：定制套餐"
                  onChange={(name) => setDraft((current) => ({ ...current, name }))}
                />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item label="套餐编码" required>
                <Input
                  value={draft.planCode}
                  placeholder="例如：custom-01"
                  onChange={(planCode) => setDraft((current) => ({ ...current, planCode }))}
                />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>
          <Form.Item label="说明">
            <Input.TextArea
              value={draft.description}
              placeholder="按合同定制限额"
              onChange={(description) => setDraft((current) => ({ ...current, description }))}
            />
          </Form.Item>
          <Typography.Title heading={6}>限额配置</Typography.Title>
          <Grid.Row gutter={16}>
            {(
              [
                ["gpuHours", "GPU-Hours"],
                ["cpuCores", "CPU 核"],
                ["memoryGi", "内存 Gi"],
                ["storageGi", "存储 Gi"],
                ["tokenQuota", "Token 配额"],
                ["kbQueries", "KB 查询"],
                ["maxMembers", "成员上限"],
                ["maxInferences", "推理服务上限"],
              ] as const
            ).map(([field, label]) => (
              <Grid.Col span={12} key={field}>
                <Form.Item label={label}>
                  <InputNumber
                    min={0}
                    precision={0}
                    value={draft.limits[field]}
                    className="w-full"
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        limits: { ...current.limits, [field]: Number(value) || 0 },
                      }))
                    }
                  />
                </Form.Item>
              </Grid.Col>
            ))}
          </Grid.Row>
        </Form>
      </Modal>

      <Modal
        title={`分配套餐${assigningPackage ? `：${assigningPackage.name}` : ``}`}
        visible={Boolean(assigningPackage)}
        okText="确认改绑"
        onOk={assignPackage}
        onCancel={() => {
          setAssigningPackage(null);
          setTargetTenantId("");
        }}
      >
        <Alert
          type="info"
          content="改绑只更新套餐归属，租户当前已审批或特批的配额上限保持不变。"
          className="mb-4"
        />
        <Form layout="vertical">
          <Form.Item label="目标租户" required>
            <Select
              value={targetTenantId}
              onChange={setTargetTenantId}
              options={tenants
                .filter((tenant) => tenant.status !== "disabled")
                .map((tenant) => ({
                  label: `${tenant.name} · ${tenant.displayName}`,
                  value: tenant.id,
                }))}
            />
          </Form.Item>
          {targetTenantId ? (
            <Typography.Text type="secondary">
              当前套餐：
              {tenants.find((tenant) => tenant.id === targetTenantId)?.quotaPackage ?? "-"}
              ，确认后可前往
              <Link to="/tenants/$tenantId" params={{ tenantId: targetTenantId }} className="ml-1">
                租户详情
              </Link>
              查看。
            </Typography.Text>
          ) : null}
        </Form>
      </Modal>
    </>
  );
}
