import { Button, Message } from "@arco-design/web-react";
import { IconRefresh } from "@arco-design/web-react/icon";
import type { ReactNode } from "react";
import { ListPageHeader } from "@/components/common";

interface OverviewPageHeaderProps {
  title: string;
  subtitle: string;
  extra?: ReactNode;
}

export function OverviewPageHeader({ title, subtitle, extra }: OverviewPageHeaderProps) {
  return (
    <div className="mb-5">
      <ListPageHeader
        title={title}
        subtitle={subtitle}
        extra={
          <div className="flex items-center gap-2">
            {extra}
            <Button
              type="primary"
              icon={<IconRefresh />}
              onClick={() => Message.success("数据已刷新")}
            >
              刷新
            </Button>
          </div>
        }
      />
    </div>
  );
}
