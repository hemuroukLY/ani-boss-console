import { Button, Dropdown, type ButtonProps } from "@arco-design/web-react";
import { IconDown } from "@arco-design/web-react/icon";
import { forwardRef, type ReactElement, type ReactNode } from "react";
import { DataTable, type DataTableProps } from "../DataTable";
import styles from "./index.module.css";

export type ListDataTableProps<T> = Omit<
  DataTableProps<T>,
  "className" | "noDataElement"
> & {
  emptyText?: string;
};

export function ListDataTable<T>({
  emptyText = "暂无数据",
  ...tableProps
}: ListDataTableProps<T>) {
  return (
    <DataTable<T>
      {...tableProps}
      className={styles.listDataTable}
      noDataElement={<div className={styles.tableState}>{emptyText}</div>}
    />
  );
}


export function ListRowActions({ children }: { children: ReactNode }) {
  return <div className={styles.rowActions}>{children}</div>;
}

export function ListNameCell({ name, id }: { name: ReactNode; id: ReactNode }) {
  return (
    <div className={styles.listNameCell}>
      <span className={styles.listName}>{name}</span>
      <span className={styles.listNameId}>{id}</span>
    </div>
  );
}

export const ListRowActionButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { children: ReactNode }
>(function ListRowActionButton({ children, ...buttonProps }, ref) {
  return (
    <Button
      ref={ref}
      type="text"
      size="small"
      {...buttonProps}
      className={styles.rowActionButton}
    >
      {children}
    </Button>
  );
});

interface ListRowMoreProps {
  droplist: ReactElement;
  disabled?: boolean;
}

export function ListRowMore({ droplist, disabled }: ListRowMoreProps) {
  return (
    <Dropdown trigger="click" position="br" droplist={droplist}>
      <ListRowActionButton disabled={disabled}>
        更多
        <IconDown className="ml-1 text-xs" />
      </ListRowActionButton>
    </Dropdown>
  );
}
