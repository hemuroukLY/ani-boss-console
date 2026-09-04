import type { IntegrationStatus } from "../model";

const statusMeta: Record<
  IntegrationStatus,
  { label: string; className: string }
> = {
  enabled: { label: "已启用", className: "bg-green-50 text-green-700" },
  disabled: { label: "已停用", className: "bg-gray-100 text-gray-500" },
  warning: { label: "异常", className: "bg-orange-50 text-orange-700" },
};

export function IntegrationStatusBadge({
  status,
}: {
  status: IntegrationStatus;
}) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
