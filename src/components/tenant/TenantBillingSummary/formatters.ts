export function formatUsd(value: number) {
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "-" : ""}$${formatted}`;
}

export function formatAmount(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}
