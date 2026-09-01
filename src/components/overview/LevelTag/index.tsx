import { Tag } from "@arco-design/web-react";
import type { AlertItem } from "@/components/overview/model";

export function LevelTag({ level }: { level: AlertItem["level"] }) {
  const colors = { 严重: "red", 警告: "orange", 提示: "blue" } as const;

  return <Tag color={colors[level]}>{level}</Tag>;
}
