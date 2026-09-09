import { Tag } from "@arco-design/web-react";
import { DataTable } from "@/components/common";
import { DeviceActions } from "./DeviceActions";
import { devices, deviceStatusColor, type Device } from "./model";

export function GpuDeviceTable() {
  return (
    <DataTable
      rowKey="id"
      data={devices}
      pagination={false}
      border={false}
      columns={[
        { title: "设备 ID", dataIndex: "id", width: 120 },
        { title: "节点 / 设备", dataIndex: "location", width: 150 },
        { title: "型号 / 显存", dataIndex: "model", width: 130 },
        { title: "切分形态", dataIndex: "slicing", width: 90 },
        {
          title: "状态",
          dataIndex: "status",
          width: 120,
          render: (_: unknown, device: Device) => (
            <Tag color={deviceStatusColor[device.status]}>{device.status}</Tag>
          ),
        },
        { title: "租户", dataIndex: "tenant", width: 110 },
        { title: "占用对象 / 原因", dataIndex: "occupant", width: 180 },
        {
          title: "操作",
          width: 120,
          fixed: "right" as const,
          render: (_: unknown, device: Device) => <DeviceActions device={device} />,
        },
      ]}
    />
  );
}
