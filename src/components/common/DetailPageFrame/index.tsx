import {
  Breadcrumb,
  Button,
  Card,
  Tabs,
  Tooltip,
  Typography,
} from "@arco-design/web-react";
import { IconLeft } from "@arco-design/web-react/icon";
import type { ReactNode } from "react";

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
  defaultTabKey,
  onBack,
}: DetailPageFrameProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tooltip content="返回上一级">
          <Button
            type="text"
            shape="circle"
            icon={<IconLeft />}
            aria-label="返回上一级"
            onClick={onBack}
          />
        </Tooltip>
        <Breadcrumb aria-label="详情面包屑">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <Breadcrumb.Item key={index}>
                {item.onClick && !isLast ? (
                  <Button type="text" className="!p-0" onClick={item.onClick}>
                    {item.label}
                  </Button>
                ) : (
                  item.label
                )}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      </div>

      <Card className="rounded-lg [&_.arco-card-body]:p-5">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex min-w-[220px] items-start gap-3">
            {icon ? <div className="shrink-0">{icon}</div> : null}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Typography.Title heading={4} className="!m-0 !text-2xl">
                  {title}
                </Typography.Title>
                {status}
              </div>
              {subtitle ? (
                <Typography.Text type="secondary" className="mt-1 block">
                  {subtitle}
                </Typography.Text>
              ) : null}
            </div>
          </div>

          <div className="grid min-w-[420px] flex-1 grid-cols-4 gap-5 max-[1200px]:grid-cols-2 max-[720px]:min-w-0 max-[720px]:grid-cols-1">
            {headerItems.map((item, index) => (
              <div key={index}>
                <Typography.Text type="secondary" className="block text-xs">
                  {item.label}
                </Typography.Text>
                <div className="mt-1 font-medium text-gray-900">
                  {item.value ?? "—"}
                </div>
              </div>
            ))}
          </div>

          {actions ? <div className="ml-auto shrink-0">{actions}</div> : null}
        </div>
      </Card>

      <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-4 max-[1100px]:grid-cols-1">
        <aside className="space-y-4" aria-label="详情信息">
          {cards.map((card) => (
            <Card key={card.key} title={card.title} className="rounded-lg">
              {card.content}
            </Card>
          ))}
        </aside>

        {tabs?.length ? (
          <Card className="min-w-0 rounded-lg [&_.arco-card-body]:p-0">
            <Tabs
              defaultActiveTab={defaultTabKey ?? tabs[0].key}
              className="px-5"
            >
              {tabs.map((tab) => (
                <Tabs.TabPane key={tab.key} title={tab.title}>
                  {tab.content}
                </Tabs.TabPane>
              ))}
            </Tabs>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
