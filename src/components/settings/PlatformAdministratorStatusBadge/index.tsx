import type { PlatformAdministratorStatus } from "@/api/platform-admins";

const statusMeta: Record<PlatformAdministratorStatus, { label: string; className: string }> = {
  active: { label: "活跃", className: "bg-green-50 text-green-700" },
  disabled: { label: "已禁用", className: "bg-gray-100 text-gray-500" },
};

export function PlatformAdministratorStatusBadge({
  status,
}: {
  status: PlatformAdministratorStatus;
}) {
  const meta = statusMeta[status];
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}
