import { Button, Message, Typography } from "@arco-design/web-react";
import { IconRefresh } from "@arco-design/web-react/icon";
import type { ReactNode } from "react";

interface OverviewPageHeaderProps {
  title: string;
  subtitle: string;
  extra?: ReactNode;
}

export function OverviewPageHeader({
  title,
  subtitle,
  extra,
}: OverviewPageHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <Typography.Title heading={4} className="!m-0 !text-2xl">
          {title}
        </Typography.Title>
        <Typography.Text type="secondary" className="text-[13px]">
          {subtitle}
        </Typography.Text>
      </div>
      <div className="flex items-center gap-2.5">
        {extra}
        <Button
          type="primary"
          icon={<IconRefresh />}
          onClick={() => Message.success("数据已刷新")}
        >
          刷新
        </Button>
      </div>
    </div>
  );
}
