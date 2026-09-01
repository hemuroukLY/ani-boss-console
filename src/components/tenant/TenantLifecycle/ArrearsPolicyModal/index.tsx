import { InputNumber, Modal, Switch } from "@arco-design/web-react";

interface ArrearsPolicyModalProps {
  visible: boolean;
  graceDays: number;
  autoSuspend: boolean;
  emailNotification: boolean;
  onGraceDaysChange: (value: number) => void;
  onAutoSuspendChange: (value: boolean) => void;
  onEmailNotificationChange: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ArrearsPolicyModal({
  visible,
  graceDays,
  autoSuspend,
  emailNotification,
  onGraceDaysChange,
  onAutoSuspendChange,
  onEmailNotificationChange,
  onCancel,
  onConfirm,
}: ArrearsPolicyModalProps) {
  return (
    <Modal
      title="编辑欠费策略"
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="保存策略"
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-sm text-gray-600">宽限天数</div>
          <InputNumber
            value={graceDays}
            min={0}
            precision={0}
            className="w-full"
            onChange={(value) => onGraceDaysChange(Number(value) || 0)}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>超过宽限期自动冻结</span>
          <Switch checked={autoSuspend} onChange={onAutoSuspendChange} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>发送欠费邮件通知</span>
          <Switch
            checked={emailNotification}
            onChange={onEmailNotificationChange}
          />
        </div>
      </div>
    </Modal>
  );
}
