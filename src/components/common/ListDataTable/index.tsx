import { Dropdown, Empty } from "@arco-design/web-react";
import { IconDown } from "@arco-design/web-react/icon";
import type { ReactElement } from "react";
import {
  DataTable,
  DataTableRowActionButton,
  type DataTableProps,
} from "../DataTable";
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
      noDataElement={
        <Empty className={styles.tableState} description={emptyText} />
      }
    />
  );
}

interface ListRowMoreProps {
  droplist: ReactElement;
  disabled?: boolean;
}

export function ListRowMore({ droplist, disabled }: ListRowMoreProps) {
  return (
    <Dropdown trigger="click" position="br" droplist={droplist}>
      <DataTableRowActionButton disabled={disabled}>
        更多
        <IconDown className="ml-1 text-xs" />
      </DataTableRowActionButton>
    </Dropdown>
  );
}
