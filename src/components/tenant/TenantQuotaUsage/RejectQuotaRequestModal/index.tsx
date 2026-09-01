import { Input, Modal } from "@arco-design/web-react";

interface RejectQuotaRequestModalProps {
  visible: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RejectQuotaRequestModal({
  visible,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}: RejectQuotaRequestModalProps) {
  return (
    <Modal
      title="驳回配额申请"
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认驳回"
      okButtonProps={{ status: "danger" }}
    >
      <div className="mb-2 text-sm text-gray-600">驳回原因</div>
      <Input.TextArea
        value={reason}
        onChange={onReasonChange}
        placeholder="请输入驳回原因"
        maxLength={200}
        showWordLimit
      />
    </Modal>
  );
}
