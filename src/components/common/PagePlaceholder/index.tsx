import { Card, Typography } from "@arco-design/web-react";
import { ListPageHeader } from "../ListPageFrame";

interface PagePlaceholderProps {
  title: string;
  priority: "P0" | "P1" | "P2";
}

export function PagePlaceholder({ title, priority }: PagePlaceholderProps) {
  return (
    <div className="space-y-4">
      <ListPageHeader title={title} />
      <Card className="rounded-lg">
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-2 text-center">
          <Typography.Title heading={6} className="!m-0">
            {priority} / 未接入 Store
          </Typography.Title>
          <Typography.Text type="secondary">
            该页尚未纳入有状态操作台种子数据。
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
