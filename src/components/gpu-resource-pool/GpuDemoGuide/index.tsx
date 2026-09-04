import { Button, Modal, Space, Steps } from "@arco-design/web-react";
import { useState } from "react";
import { GpuDemoStepContent } from "./GpuDemoStepContent";
import type {
  GpuInventoryDevice,
  TenantGpuAllocation,
} from "../types";

const stepTitles = [
  "开始",
  "看资源池",
  "要切再切",
  "分给租户",
  "配额上限",
  "租户侧确认",
  "不够就拦",
  "完成",
];

interface GpuDemoGuideProps {
  visible: boolean;
  inventory: GpuInventoryDevice[];
  demoTenant?: TenantGpuAllocation;
  inventoryError: unknown;
  tenantError: unknown;
  refreshing: boolean;
  onClose: () => void;
  onRefresh: () => Promise<unknown>;
  onViewSpecs: () => void;
  onEditQuota: (tenant: TenantGpuAllocation) => void;
  onEditReservation: (tenant: TenantGpuAllocation) => void;
}

export function GpuDemoGuide({
  visible,
  inventory,
  demoTenant,
  inventoryError,
  tenantError,
  refreshing,
  onClose,
  onRefresh,
  onViewSpecs,
  onEditQuota,
  onEditReservation,
}: GpuDemoGuideProps) {
  const [current, setCurrent] = useState(0);

  const close = () => {
    setCurrent(0);
    onClose();
  };

  const leaveFor = (action: () => void) => {
    close();
    action();
  };

  const stepAction =
    current === 1 ? (
      <Button loading={refreshing} onClick={() => void onRefresh()}>
        刷新资源池
      </Button>
    ) : current === 2 ? (
      <Button onClick={() => leaveFor(onViewSpecs)}>查看调度规格</Button>
    ) : current === 3 && demoTenant ? (
      <Button onClick={() => leaveFor(() => onEditReservation(demoTenant))}>
        调整 demo-corp 资源预留
      </Button>
    ) : current === 4 && demoTenant ? (
      <Button onClick={() => leaveFor(() => onEditQuota(demoTenant))}>
        调整 demo-corp 配额
      </Button>
    ) : null;

  return (
    <Modal
      title={`GPU 演示 · ${current + 1}/${stepTitles.length}`}
      visible={visible}
      onCancel={close}
      unmountOnExit
      style={{ width: 920 }}
      footer={
        <div className="flex w-full items-center justify-between">
          <div>{stepAction}</div>
          <Space>
            <Button
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              上一步
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (current === stepTitles.length - 1) {
                  close();
                  return;
                }
                setCurrent(current + 1);
              }}
            >
              {current === stepTitles.length - 1 ? "完成" : "下一步"}
            </Button>
          </Space>
        </div>
      }
    >
      <div className="flex min-h-[390px] gap-8">
        <Steps
          current={current}
          direction="vertical"
          size="small"
          onChange={setCurrent}
          className="w-[190px] shrink-0"
        >
          {stepTitles.map((title) => (
            <Steps.Step key={title} title={title} />
          ))}
        </Steps>
        <GpuDemoStepContent
          current={current}
          inventory={inventory}
          demoTenant={demoTenant}
          inventoryError={inventoryError}
          tenantError={tenantError}
        />
      </div>
    </Modal>
  );
}
