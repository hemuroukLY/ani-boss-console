import { DataTable } from "@/components/common";

export function DataRows({ rows }: { rows: readonly (readonly string[])[] }) {
  const columnCount = Math.max(0, ...rows.map((row) => row.length));
  const titles = ["名称", "租户", "区域", "状态", "数值"];
  const data = rows.map((row, rowIndex) =>
    Object.fromEntries([
      ["key", row.join("-") || rowIndex],
      ...row.map((value, columnIndex) => [`column${columnIndex}`, value]),
    ]),
  );
  const columns = Array.from({ length: columnCount }, (_, columnIndex) => ({
    title: titles[columnIndex] ?? `字段 ${columnIndex + 1}`,
    dataIndex: `column${columnIndex}`,
  }));

  return <DataTable rowKey="key" columns={columns} data={data} pagination={false} border={false} />;
}
