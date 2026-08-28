import { Checkbox, Modal } from "@arco-design/web-react";

interface ResumeTenantModalProps {
  visible: boolean;
  hasOutstandingBalance: boolean;
  forceResume: boolean;
  onForceResumeChange: (value: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResumeTenantModal({
  visible,
  hasOutstandingBalance,
  forceResume,
  onForceResumeChange,
  onCancel,
  onConfirm,
}: ResumeTenantModalProps) {
  return (
    <Modal
      title="解冻租户"
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认解冻"
    >
      <div className="space-y-4">
        <div>解冻后租户恢复为活跃状态，原有资源保持不变。</div>
        {hasOutstandingBalance ? (
          <Checkbox checked={forceResume} onChange={onForceResumeChange}>
            账户仍有欠费，确认强制解冻
          </Checkbox>
        ) : null}
      </div>
    </Modal>
  );
}
