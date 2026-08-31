import {
  Table,
  type TableColumnProps,
  type TableProps,
} from "@arco-design/web-react";

export type ListColumn<T> = TableColumnProps<T>;

export type DataTableProps<T> = TableProps<T> & {
  tableLabel?: string;
};

export function DataTable<T>({
  tableLabel = "数据列表",
  border = false,
  hover = true,
  tableLayoutFixed = true,
  scroll,
  ...tableProps
}: DataTableProps<T>) {
  return (
    <Table<T>
      aria-label={tableLabel}
      border={border}
      hover={hover}
      tableLayoutFixed={tableLayoutFixed}
      scroll={{ x: "max-content", ...scroll }}
      {...tableProps}
    />
  );
}
