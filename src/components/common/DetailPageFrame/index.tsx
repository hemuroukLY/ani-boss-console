import {
  Breadcrumb,
  Button,
  Card,
  Tabs,
  Tooltip,
} from "@arco-design/web-react";
import { IconLeft } from "@arco-design/web-react/icon";
import { useState, type ReactNode } from "react";
import styles from "./index.module.css";

export interface DetailBreadcrumbItem {
  label: ReactNode;
  onClick?: () => void;
}

export interface DetailHeaderItem {
  label: ReactNode;
  value: ReactNode;
}

export interface DetailInfoCard {
  key: string;
  title: ReactNode;
  content: ReactNode;
}

export interface DetailTab {
  key: string;
  title: ReactNode;
  content: ReactNode;
}

interface DetailPageFrameProps {
  breadcrumbs: DetailBreadcrumbItem[];
  title: ReactNode;
  status?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  headerItems: DetailHeaderItem[];
  actions?: ReactNode;
  cards: DetailInfoCard[];
  tabs?: DetailTab[];
  tabExtra?: ReactNode | ((activeTabKey: string) => ReactNode);
  defaultTabKey?: string;
  onBack?: () => void;
}

export function DetailPageFrame({
  breadcrumbs,
  title,
  status,
  subtitle,
  icon,
  headerItems,
  actions,
  cards,
  tabs,
  tabExtra,
  defaultTabKey,
  onBack,
}: DetailPageFrameProps) {
  const [activeTabKey, setActiveTabKey] = useState(
    defaultTabKey ?? tabs?.[0]?.key ?? "",
  );

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbRow}>
        <Tooltip content="返回上一级">
          <Button
            type="text"
            shape="circle"
            className={styles.backButton}
            icon={<IconLeft />}
            aria-label="返回上一级"
            onClick={onBack}
          />
        </Tooltip>
        <Breadcrumb className={styles.breadcrumbs} aria-label="详情面包屑">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <Breadcrumb.Item key={index}>
                {item.onClick && !isLast ? (
                  <button
                    type="button"
                    className={styles.breadcrumbLink}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={
                      isLast
                        ? styles.breadcrumbCurrent
                        : styles.breadcrumbText
                    }
                  >
                    {item.label}
                  </span>
                )}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      </div>

      <section className={styles.headerCard}>
        <div className={styles.identity}>
          {icon ? <div className={styles.identityIcon}>{icon}</div> : null}
          <div className={styles.identityText}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{title}</h1>
              {status ? <div className={styles.status}>{status}</div> : null}
            </div>
            {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          </div>
        </div>

        <div className={styles.headerItems} aria-label="关键字段">
          {headerItems.map((item, index) => (
            <div key={index} className={styles.headerItem}>
              <span className={styles.headerItemLabel}>{item.label}</span>
              <span className={styles.headerItemValue}>{item.value ?? "-"}</span>
            </div>
          ))}
        </div>

        {actions ? <div className={styles.headerActions}>{actions}</div> : null}
      </section>

      <div
        className={`${styles.workspace} ${
          tabs?.length ? styles.workspaceSplit : styles.workspaceSingle
        }`}
      >
        <aside className={styles.leftPane} aria-label="详情信息">
          {cards.map((card) => (
            <Card key={card.key} title={card.title} className={styles.infoCard}>
              {card.content}
            </Card>
          ))}
        </aside>

        {tabs?.length ? (
          <section className={styles.rightPane}>
            <Tabs
              defaultActiveTab={defaultTabKey ?? tabs[0].key}
              extra={
                typeof tabExtra === "function"
                  ? tabExtra(activeTabKey)
                  : tabExtra
              }
              onChange={setActiveTabKey}
              className={styles.tabs}
              type="line"
              headerPadding={false}
              inkBarSize={{ width: 16 }}
            >
              {tabs.map((tab) => (
                <Tabs.TabPane key={tab.key} title={tab.title}>
                  {tab.content}
                </Tabs.TabPane>
              ))}
            </Tabs>
          </section>
        ) : null}
      </div>
    </div>
  );
}
