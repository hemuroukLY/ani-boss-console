import { Button, Message, Typography } from "@arco-design/web-react";
import { IconRefresh } from "@arco-design/web-react/icon";
import type { ReactNode } from "react";

interface OverviewPageHeaderProps {
  title: string;
  subtitle: string;
  extra?: ReactNode;
}

export function OverviewPageHeader({ title, subtitle, extra }: OverviewPageHeaderProps) {
  return (
    <header className="mb-5 flex min-w-0 items-start justify-between gap-4">
      <div className="min-w-0">
        <Typography.Title heading={5} className="!m-0 !text-[20px] !font-semibold">
          {title}
        </Typography.Title>
        <Typography.Text type="secondary" className="mt-1 block text-sm">
          {subtitle}
        </Typography.Text>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {extra}
        <Button type="primary" icon={<IconRefresh />} onClick={() => Message.success("数据已刷新")}>
          刷新
        </Button>
      </div>
    </header>
  );
}
