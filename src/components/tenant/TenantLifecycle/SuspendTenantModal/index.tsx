import { Input, Modal } from "@arco-design/web-react";

interface SuspendTenantModalProps {
  visible: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SuspendTenantModal({
  visible,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}: SuspendTenantModalProps) {
  return (
    <Modal
      title="冻结租户"
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认冻结"
    >
      <div className="mb-2 text-sm text-gray-600">冻结原因</div>
      <Input.TextArea
        value={reason}
        placeholder="未填写时记为运营冻结"
        maxLength={200}
        showWordLimit
        onChange={onReasonChange}
      />
    </Modal>
  );
}
