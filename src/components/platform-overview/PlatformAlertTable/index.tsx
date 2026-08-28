import { useState } from "react";
import { Card } from "@arco-design/web-react";
import type { AlertItem } from "@/features/platform-overview/model";
import { AlertFilters } from "./AlertFilters";
import { AlertTable } from "./AlertTable";

interface PlatformAlertTableProps {
  alerts: AlertItem[];
  onUpdate: (id: number, status: AlertItem["status"]) => void;
}

export function PlatformAlertTable({
  alerts,
  onUpdate,
}: PlatformAlertTableProps) {
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("全部级别");
  const [status, setStatus] = useState("全部状态");
  const rows = alerts.filter((item) => {
    const searchable = `${item.title}${item.objectName}${item.region}${item.summary}`;
    return (
      searchable.includes(keyword) &&
      (level === "全部级别" || item.level === level) &&
      (status === "全部状态" || item.status === status)
    );
  });

  return (
    <Card
      title="平台告警"
      extra={
        <AlertFilters
          keyword={keyword}
          level={level}
          status={status}
          onKeywordChange={setKeyword}
          onLevelChange={setLevel}
          onStatusChange={setStatus}
        />
      }
      className="overflow-hidden rounded-lg [&_.arco-card-body]:p-0"
    >
      <AlertTable rows={rows} onUpdate={onUpdate} />
    </Card>
  );
}
