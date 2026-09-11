import { Alert, Descriptions, Drawer, Empty, Spin, Tag } from "@arco-design/web-react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPlatformAdministrator,
  fetchPlatformAdministratorAuditLogs,
  platformAdministratorQueryKeys,
  type PlatformAdministratorRoleDefinition,
} from "@/api/platform-admins";
import { useListErrorNotification } from "@/hooks/useListErrorNotification";
import {
  platformAdministratorRoleLabels,
  platformAdministratorSourceLabels,
  platformAdministratorStatusLabels,
  platformPermissionAccessLabels,
} from "../model";
import { formatDateTime } from "@/lib/date";

export function PlatformAdministratorDetailDrawer({
  userId,
  roles,
  onClose,
}: {
  userId: string | null;
  roles: PlatformAdministratorRoleDefinition[];
  onClose: () => void;
}) {
  const detailQuery = useQuery({
    queryKey: platformAdministratorQueryKeys.detail(userId || ""),
    queryFn: () => fetchPlatformAdministrator(userId || ""),
    enabled: Boolean(userId),
  });
  const auditQuery = useQuery({
    queryKey: platformAdministratorQueryKeys.auditLogs(userId || ""),
    queryFn: () => fetchPlatformAdministratorAuditLogs(userId || ""),
    enabled: Boolean(userId),
  });

  useListErrorNotification({
    id: `platform-administrator-detail-${userId || "closed"}`,
    title: "平台运营账号详情加载失败",
    error: detailQuery.error,
  });
  useListErrorNotification({
    id: `platform-administrator-audit-${userId || "closed"}`,
    title: "账号操作记录加载失败",
    error: auditQuery.error,
  });

  const detail = detailQuery.data;
  const role = roles.find((item) => item.name === detail?.role);

  return (
    <Drawer
      width={600}
      title="平台运营账号详情"
      visible={Boolean(userId)}
      onCancel={onClose}
      footer={null}
    >
      {detailQuery.isPending ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : detail ? (
        <div className="space-y-5">
          <Descriptions
            column={1}
            border
            data={[
              { label: "用户名", value: detail.username },
              { label: "显示名称", value: detail.displayName },
              { label: "邮箱", value: detail.email || "-" },
              { label: "角色", value: platformAdministratorRoleLabels[detail.role] },
              { label: "状态", value: platformAdministratorStatusLabels[detail.status] },
              { label: "账号来源", value: platformAdministratorSourceLabels[detail.source] },
              { label: "最近登录", value: formatDateTime(detail.lastLoginAt) },
              { label: "创建时间", value: formatDateTime(detail.createdAt) },
              { label: "MFA", value: "-（接口未返回）" },
              { label: "最近重置密码", value: "-（接口未返回）" },
              { label: "安装账号", value: "-（接口未返回）" },
            ]}
          />

          <section>
            <div className="mb-2 text-sm font-semibold">角色权限</div>
            {role ? (
              <div className="rounded border border-gray-200 p-3 text-sm">
                <div className="mb-2 text-gray-600">{role.description}</div>
                <div className="flex flex-wrap gap-2">
                  <Tag>租户操作：{platformPermissionAccessLabels[role.permissions.tenantOps]}</Tag>
                  <Tag>资源池：{platformPermissionAccessLabels[role.permissions.resourcePool]}</Tag>
                  <Tag>
                    平台账号：{platformPermissionAccessLabels[role.permissions.platformUser]}
                  </Tag>
                  <Tag>
                    审计导出：{platformPermissionAccessLabels[role.permissions.auditExport]}
                  </Tag>
                </div>
              </div>
            ) : (
              <Alert type="warning" content="角色权限接口暂无可用数据" />
            )}
          </section>

          <section>
            <div className="mb-2 text-sm font-semibold">操作记录</div>
            {auditQuery.isPending ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : auditQuery.data?.length ? (
              <div className="space-y-2">
                {auditQuery.data.map((entry) => (
                  <div key={entry.id} className="rounded border border-gray-200 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{entry.action}</span>
                      <Tag color={entry.result === "success" ? "green" : "red"}>
                        {entry.result === "success" ? "成功" : "失败"}
                      </Tag>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {entry.resource || "-"} · {formatDateTime(entry.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无操作记录" />
            )}
          </section>
        </div>
      ) : (
        <Empty description="账号详情暂不可用" />
      )}
    </Drawer>
  );
}
