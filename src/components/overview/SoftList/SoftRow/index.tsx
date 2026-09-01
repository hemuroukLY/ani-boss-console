import { List } from "@arco-design/web-react";
import type { ReactNode } from "react";

interface SoftRowProps {
  title: ReactNode;
  meta: ReactNode;
}

export function SoftRow({ title, meta }: SoftRowProps) {
  return (
    <List.Item actions={[<span key="meta">{meta}</span>]}>{title}</List.Item>
  );
}
