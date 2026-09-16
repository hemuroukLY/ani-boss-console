import { Card } from "@arco-design/web-react";
import { cloneElement, type ReactElement, type ReactNode } from "react";
import type { ListDataTableProps } from "../ListDataTable";
import styles from "./index.module.less";

interface TableSectionFrameProps<T> {
  header?: ReactNode;
  tabs?: ReactNode;
  toolbar?: ReactNode;
  children: ReactElement<ListDataTableProps<T>>;
}

export function TableSectionFrame<T>({
  header,
  tabs,
  toolbar,
  children,
}: TableSectionFrameProps<T>) {
  const tableScroll = children.props.scroll;
  const contentHeightTable = cloneElement(children, {
    scroll: {
      ...tableScroll,
      y: tableScroll?.y ?? false,
    },
  });

  return (
    <section className={styles.frame}>
      <Card className={styles.contentPanel}>
        {header}
        {tabs}
        {toolbar}
        {contentHeightTable}
      </Card>
    </section>
  );
}
