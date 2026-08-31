import type { ReactNode } from "react";
import styles from "./index.module.css";

interface ListNameCellProps {
  name: ReactNode;
  secondary: ReactNode;
}

export function ListNameCell({ name, secondary }: ListNameCellProps) {
  return (
    <div className={styles.listNameCell}>
      <span className={styles.listName}>{name}</span>
      <span className={styles.listNameSecondary}>{secondary}</span>
    </div>
  );
}
