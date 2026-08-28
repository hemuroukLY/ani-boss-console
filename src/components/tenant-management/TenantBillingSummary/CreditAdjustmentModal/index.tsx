import { Input, InputNumber, Modal } from "@arco-design/web-react";

interface CreditAdjustmentModalProps {
  visible: boolean;
  amount: number;
  reason: string;
  onAmountChange: (value: number) => void;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CreditAdjustmentModal({
  visible,
  amount,
  reason,
  onAmountChange,
  onReasonChange,
  onConfirm,
  onCancel,
}: CreditAdjustmentModalProps) {
  return (
    <Modal
      title="授信调账"
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认调账"
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-sm text-gray-600">调账金额（USD）</div>
          <InputNumber
            value={amount}
            precision={2}
            className="w-full"
            placeholder="正数增加余额与授信，负数扣减余额"
            onChange={(value) => onAmountChange(Number(value) || 0)}
          />
        </div>
        <div>
          <div className="mb-2 text-sm text-gray-600">调账原因</div>
          <Input.TextArea
            value={reason}
            placeholder="未填写时记为人工调账"
            maxLength={200}
            showWordLimit
            onChange={onReasonChange}
          />
        </div>
      </div>
    </Modal>
  );
}
