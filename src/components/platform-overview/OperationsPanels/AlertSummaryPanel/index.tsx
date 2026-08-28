import { Button } from "@arco-design/web-react";
import { useNavigate } from "@tanstack/react-router";
import type { AlertItem } from "@/features/platform-overview/model";
import { LevelTag } from "../../LevelTag";
import { Panel } from "../../Panel";
import { SoftList } from "../../SoftList";
import { SoftRow } from "../../SoftList/SoftRow";

interface AlertSummaryPanelProps {
  alerts: AlertItem[];
  onUpdate: (id: number, status: AlertItem["status"]) => void;
}

export function AlertSummaryPanel({
  alerts,
  onUpdate,
}: AlertSummaryPanelProps) {
  const navigate = useNavigate();

  return (
    <Panel
      title="平台告警摘要"
      action="全部 →"
      onAction={() => navigate({ to: "/overview/alerts" })}
    >
      <SoftList>
        {alerts.map((item) => (
          <SoftRow
            key={item.id}
            title={
              <>
                <LevelTag level={item.level} /> {item.title}
                <span className="ml-2 text-xs text-gray-500">
                  {item.objectType} · {item.objectName}
                </span>
              </>
            }
            meta={
              <>
                {item.time}
                <Button
                  type="text"
                  size="mini"
                  onClick={() => onUpdate(item.id, "已处理")}
                >
                  处理
                </Button>
              </>
            }
          />
        ))}
      </SoftList>
    </Panel>
  );
}
