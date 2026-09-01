import { Panel } from "../../Panel";
import { SoftList } from "../../SoftList";
import { SoftRow } from "../../SoftList/SoftRow";

export function RecentEventsPanel({
  onOpenFeature,
}: {
  onOpenFeature: (name: string) => void;
}) {
  return (
    <Panel
      title="最近平台事件"
      action="审计 →"
      onAction={() => onOpenFeature("平台审计")}
    >
      <SoftList>
        <SoftRow title="星云科技 · 配额扩容申请已提交" meta="10:02" />
        <SoftRow title="远海智能 · 租户已解冻" meta="09:46" />
        <SoftRow title="未来实验室 · 新增租户管理员" meta="08:58" />
      </SoftList>
    </Panel>
  );
}
