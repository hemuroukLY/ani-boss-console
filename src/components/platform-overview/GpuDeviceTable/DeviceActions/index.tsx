import { Message } from "@arco-design/web-react";
import {
  ListRowActionButton,
  ListRowActions,
} from "@/components/common";
import type { Device } from "../model";

export function DeviceActions({ device }: { device: Device }) {
  const disabled = device.status !== "空闲未分配";

  return (
    <ListRowActions>
      <ListRowActionButton
        disabled={disabled}
        onClick={() => Message.info(`${device.id} · 切分`)}
      >
        切分
      </ListRowActionButton>
      <ListRowActionButton
        disabled={disabled}
        onClick={() => Message.info(`${device.id} · 分配`)}
      >
        分配
      </ListRowActionButton>
    </ListRowActions>
  );
}
