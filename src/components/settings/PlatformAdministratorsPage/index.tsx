import { Button, Descriptions, Drawer, Input, Select } from "@arco-design/web-react";
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
import { PlatformAdministratorStatusBadge } from "../PlatformAdministratorStatusBadge";
import {
  platformAdministrators,
  type PlatformAdministrator,
  type PlatformAdministratorRole,
  type PlatformAdministratorStatus,
} from "../model";

export function PlatformAdministratorsPage() {
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<"all" | PlatformAdministratorRole>("all");
  const [status, setStatus] = useState<"all" | PlatformAdministratorStatus>("all");
  const [selected, setSelected] = useState<PlatformAdministrator>();
  const filteredAdministrators = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return platformAdministrators.filter(
      (administrator) =>
        (role === "all" || administrator.role === role) &&
        (status === "all" || administrator.status === status) &&
        (!normalized ||
          [administrator.username, administrator.displayName, administrator.email].some((value) =>
            value.toLowerCase().includes(normalized),
          )),
    );
  }, [keyword, role, status]);
  const activeCount = platformAdministrators.filter(
    (administrator) => administrator.status === "active",
  ).length;
  const superCount = platformAdministrators.filter(
    (administrator) => administrator.status === "active" && administrator.role === "平台超级管理员",
  ).length;
  const mfaCount = platformAdministrators.filter((administrator) => administrator.mfa).length;
  const columns: ListColumn<PlatformAdministrator>[] = [
    {
      title: "账号",
      width: 240,
      fixed: "left",
      render: (_, administrator) => (
        <DataTableNameCell name={administrator.displayName} secondary={administrator.username} />
      ),
    },
    { title: "邮箱", dataIndex: "email", width: 230 },
    { title: "角色", dataIndex: "role", width: 170 },
    {
      title: "状态",
      width: 100,
      render: (_, administrator) => (
        <PlatformAdministratorStatusBadge status={administrator.status} />
      ),
    },
    { title: "来源", dataIndex: "source", width: 110 },
    {
      title: "MFA",
      width: 90,
      render: (_, administrator) => (administrator.mfa ? "已启用" : "未启用"),
    },
    { title: "最近登录", dataIndex: "lastLogin", width: 170 },
    {
      title: "操作",
      width: 240,
      fixed: "right",
      render: (_, administrator) => (
        <DataTableRowActions>
          <DataTableRowActionButton onClick={() => setSelected(administrator)}>
            详情
          </DataTableRowActionButton>
          <DataTableRowActionButton disabled>修改角色</DataTableRowActionButton>
          <DataTableRowActionButton disabled>
            {administrator.status === "disabled" ? "启用" : "禁用"}
          </DataTableRowActionButton>
        </DataTableRowActions>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="平台运营账号"
        subtitle="管理平台本地登录账号；这些账号不属于租户，也不会同步为租户成员。"
        extra={
          <Button type="primary" icon={<IconPlus />} disabled>
            新建或邀请账号
          </Button>
        }
      />
      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric
          label="全部账号"
          value={String(platformAdministrators.length)}
          hint="本地登录身份"
        />
        <Metric label="活跃" value={String(activeCount)} hint="可登录管理端" />
        <Metric label="活跃超级管理员" value={String(superCount)} hint="至少保留 1 名" />
        <Metric label="已启用 MFA" value={String(mfaCount)} hint="账号安全" />
      </section>
      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold">账号列表</div>
              <div className="mt-1 text-xs text-gray-500">
                密码重置、角色修改和启停操作将在身份接口接入后开放。
              </div>
            </div>
            <span className="text-xs text-gray-500">共 {filteredAdministrators.length} 个账号</span>
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
                  placeholder="搜索用户名、姓名或邮箱"
                  className="w-64"
                />
                <Select
                  value={role}
                  onChange={(value) => setRole(value as "all" | PlatformAdministratorRole)}
                  className="w-44"
                >
                  <Select.Option value="all">全部角色</Select.Option>
                  <Select.Option value="平台超级管理员">平台超级管理员</Select.Option>
                  <Select.Option value="平台运维">平台运维</Select.Option>
                  <Select.Option value="平台只读">平台只读</Select.Option>
                </Select>
                <Select
                  value={status}
                  onChange={(value) => setStatus(value as "all" | PlatformAdministratorStatus)}
                  className="w-32"
                >
                  <Select.Option value="all">全部状态</Select.Option>
                  <Select.Option value="active">活跃</Select.Option>
                  <Select.Option value="invited">邀请中</Select.Option>
                  <Select.Option value="disabled">已禁用</Select.Option>
                </Select>
              </div>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={filteredAdministrators}
          pagination={false}
          scroll={{ x: 1350 }}
          emptyText="暂无符合条件的平台运营账号"
        />
      </ListPageFrame>
      <Drawer
        width={520}
        title="平台运营账号详情"
        visible={Boolean(selected)}
        onCancel={() => setSelected(undefined)}
        footer={null}
      >
        {selected ? (
          <Descriptions
            column={1}
            border
            data={[
              { label: "用户名", value: selected.username },
              { label: "显示名称", value: selected.displayName },
              { label: "邮箱", value: selected.email },
              { label: "角色", value: selected.role },
              {
                label: "状态",
                value:
                  selected.status === "active"
                    ? "活跃"
                    : selected.status === "invited"
                      ? "邀请中"
                      : "已禁用",
              },
              { label: "账号来源", value: selected.source },
              { label: "MFA", value: selected.mfa ? "已启用" : "未启用" },
              { label: "最近登录", value: selected.lastLogin },
              { label: "邀请时间", value: selected.invitedAt },
              { label: "最近重置密码", value: selected.lastPasswordReset },
              {
                label: "安装账号",
                value: selected.bootstrap ? "是" : "否",
              },
            ]}
          />
        ) : null}
      </Drawer>
    </div>
  );
}
