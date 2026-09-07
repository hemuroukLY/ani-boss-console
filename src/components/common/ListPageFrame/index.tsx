import { Card, Typography } from "@arco-design/web-react";
import { isValidElement, type ReactNode } from "react";
import styles from "./index.module.css";

interface ListPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
}

export function ListPageHeader({
  title,
  subtitle,
  extra,
}: ListPageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderTitleArea}>
        <Typography.Title heading={5} className={styles.pageHeaderTitle}>
          {title}
        </Typography.Title>
        {subtitle ? (
          <Typography.Text type="secondary" className={styles.pageHeaderSubtitle}>
            {subtitle}
          </Typography.Text>
        ) : null}
      </div>
      {extra ? <div className={styles.pageHeaderExtra}>{extra}</div> : null}
    </header>
  );
}

interface ListToolbarProps {
  actions?: ReactNode;
  filters?: ReactNode;
  tools?: ReactNode;
}

export function ListToolbar({ actions, filters, tools }: ListToolbarProps) {
  return (
    <div className={styles.toolbar}>
      {actions ? <div className={styles.toolbarActions}>{actions}</div> : null}
      {filters ? <div className={styles.toolbarFilters}>{filters}</div> : null}
      {tools ? <div className={styles.toolbarTools}>{tools}</div> : null}
    </div>
  );
}

interface ListPageFrameProps {
  header: ReactNode;
  tabs?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function ListPageFrame({
  header,
  tabs,
  toolbar,
  children,
}: ListPageFrameProps) {
  const hasPageHeader = isValidElement(header) && header.type === ListPageHeader;

  return (
    <div className={styles.page}>
      {hasPageHeader ? header : null}
      <Card className={styles.contentPanel}>
        {!hasPageHeader ? header : null}
        {tabs}
        {toolbar}
        {children}
      </Card>
    </div>
  );
}
