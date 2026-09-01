import { Input, InputNumber, Modal } from "@arco-design/web-react";

interface CreateQuotaRequestModalProps {
  visible: boolean;
  gpuHours: number;
  storageGi: number;
  requestedBy: string;
  reason: string;
  onGpuHoursChange: (value: number) => void;
  onStorageGiChange: (value: number) => void;
  onRequestedByChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CreateQuotaRequestModal({
  visible,
  gpuHours,
  storageGi,
  requestedBy,
  reason,
  onGpuHoursChange,
  onStorageGiChange,
  onRequestedByChange,
  onReasonChange,
  onCancel,
  onConfirm,
}: CreateQuotaRequestModalProps) {
  return (
    <Modal
      title="代客申请配额"
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="提交申请"
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-sm text-gray-600">GPU-Hours 上限</div>
          <InputNumber
            value={gpuHours}
            min={0}
            precision={0}
            onChange={(value) => onGpuHoursChange(Number(value) || 0)}
            className="w-full"
          />
        </div>
        <div>
          <div className="mb-2 text-sm text-gray-600">存储上限（Gi）</div>
          <InputNumber
            value={storageGi}
            min={0}
            precision={0}
            onChange={(value) => onStorageGiChange(Number(value) || 0)}
            className="w-full"
          />
        </div>
        <div>
          <div className="mb-2 text-sm text-gray-600">申请人</div>
          <Input value={requestedBy} onChange={onRequestedByChange} />
        </div>
        <div>
          <div className="mb-2 text-sm text-gray-600">申请原因</div>
          <Input.TextArea
            value={reason}
            onChange={onReasonChange}
            placeholder="请输入申请原因"
            maxLength={200}
            showWordLimit
          />
        </div>
      </div>
    </Modal>
  );
}
