import type { AuditResult } from "../model";

export function AuditResultBadge({ result }: { result: AuditResult }) {
  const success = result === "success";
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
        success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      {success ? "成功" : "失败"}
    </span>
  );
}
