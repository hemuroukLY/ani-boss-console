import { Button, Card } from "@arco-design/web-react";
import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
}

export function Panel({ title, action, onAction, children }: PanelProps) {
  return (
    <Card
      title={title}
      extra={
        action ? (
          <Button type="text" size="small" onClick={onAction}>
            {action}
          </Button>
        ) : null
      }
      className="mb-4 overflow-hidden rounded-md [&_.arco-card-body]:p-0"
    >
      {children}
    </Card>
  );
}
