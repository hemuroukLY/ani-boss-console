export function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function formatQuotaValue(value: number, unit: string) {
  return `${formatNumber(value)} ${unit}`;
}

export function getUsagePercent(usage: number | null, limit: number) {
  if (usage === null || limit <= 0) return null;
  return Math.round((usage / limit) * 1000) / 10;
}
