import { Card, Typography } from "@arco-design/web-react";
import type { ReactNode } from "react";

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
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Typography.Title heading={4} className="!m-0 !text-2xl">
          {title}
        </Typography.Title>
        {subtitle ? (
          <Typography.Text type="secondary" className="mt-1 block">
            {subtitle}
          </Typography.Text>
        ) : null}
      </div>
      {extra ? <div className="shrink-0">{extra}</div> : null}
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
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
      {filters ? <div className="min-w-0 flex-1">{filters}</div> : null}
      {tools ? (
        <div className="ml-auto flex items-center gap-2">{tools}</div>
      ) : null}
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
  return (
    <div className="space-y-4">
      {header}
      <Card className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0">
        {tabs}
        {toolbar}
        {children}
      </Card>
    </div>
  );
}
