import { Button } from "@arco-design/web-react";
import { Panel } from "../../Panel";
import { SoftList } from "../../SoftList";
import { SoftRow } from "../../SoftList/SoftRow";

export function PendingItemsPanel({
  onOpenFeature,
}: {
  onOpenFeature: (name: string) => void;
}) {
  return (
    <Panel title="待处理事项">
      <SoftList>
        <SoftRow
          title="配额待审批 · 星云科技 · GPU → 2400"
          meta={
            <Button
              type="text"
              size="mini"
              onClick={() => onOpenFeature("配额审批")}
            >
              去审批
            </Button>
          }
        />
        <SoftRow
          title="欠费租户 · 2 个"
          meta={
            <Button
              type="text"
              size="mini"
              onClick={() => onOpenFeature("租户计费")}
            >
              计费
            </Button>
          }
        />
        <SoftRow
          title="试用即将到期 · 3 个"
          meta={
            <Button
              type="text"
              size="mini"
              onClick={() => onOpenFeature("租户列表")}
            >
              查看租户
            </Button>
          }
        />
      </SoftList>
    </Panel>
  );
}
