import { Button, Message, Space } from "@arco-design/web-react";
import type { Device } from "../model";

export function DeviceActions({ device }: { device: Device }) {
  const disabled = device.status !== "空闲未分配";

  return (
    <Space size="mini">
      <Button
        type="text"
        size="mini"
        disabled={disabled}
        onClick={() => Message.info(`${device.id} · 切分`)}
      >
        切分
      </Button>
      <Button
        type="text"
        size="mini"
        disabled={disabled}
        onClick={() => Message.info(`${device.id} · 分配`)}
      >
        分配
      </Button>
    </Space>
  );
}
