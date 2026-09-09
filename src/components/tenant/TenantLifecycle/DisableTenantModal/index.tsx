import { Input, Modal } from "@arco-design/web-react";

interface DisableTenantModalProps {
  visible: boolean;
  tenantName: string;
  confirmName: string;
  reason: string;
  onConfirmNameChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DisableTenantModal({
  visible,
  tenantName,
  confirmName,
  reason,
  onConfirmNameChange,
  onReasonChange,
  onCancel,
  onConfirm,
}: DisableTenantModalProps) {
  return (
    <Modal
      title="禁用租户"
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认禁用"
      okButtonProps={{ status: "danger" }}
    >
      <div className="space-y-4">
        <div className="text-red-600">禁用是不可恢复的终态，并会清理该租户名下资源。</div>
        <div>
          <div className="mb-2 text-sm text-gray-600">输入租户标识 {tenantName} 以确认</div>
          <Input value={confirmName} onChange={onConfirmNameChange} />
        </div>
        <div>
          <div className="mb-2 text-sm text-gray-600">禁用原因</div>
          <Input.TextArea
            value={reason}
            placeholder="请输入禁用原因"
            maxLength={200}
            showWordLimit
            onChange={onReasonChange}
          />
        </div>
      </div>
    </Modal>
  );
}
