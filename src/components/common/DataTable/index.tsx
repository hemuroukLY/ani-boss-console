import {
  Button,
  Table,
  type ButtonProps,
  type TableColumnProps,
  type TableProps,
} from "@arco-design/web-react";
import { forwardRef, type ReactNode } from "react";
import styles from "./index.module.css";

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

export function DataTableRowActions({ children }: { children: ReactNode }) {
  return <div className={styles.rowActions}>{children}</div>;
}

interface DataTableNameCellProps {
  name: ReactNode;
  secondary: ReactNode;
}

export function DataTableNameCell({ name, secondary }: DataTableNameCellProps) {
  return (
    <div className={styles.listNameCell}>
      <span className={styles.listName}>{name}</span>
      <span className={styles.listNameSecondary}>{secondary}</span>
    </div>
  );
}

export const DataTableRowActionButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { children: ReactNode }
>(function DataTableRowActionButton({ children, ...buttonProps }, ref) {
  return (
    <Button ref={ref} type="text" size="small" {...buttonProps} className={styles.rowActionButton}>
      {children}
    </Button>
  );
});
