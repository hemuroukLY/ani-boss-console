import { Button, Drawer, Message, Space, Steps } from "@arco-design/web-react";
import { useState } from "react";
import {
  initialTenantDraft,
  type TenantDraft,
} from "@/features/tenant-management/model";
import { StepContent } from "./StepContent";

const steps = ["租户资料", "开通区域", "配额套餐", "初始管理员", "确认"];

interface TenantCreateDrawerProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (draft: TenantDraft) => boolean;
}

export function TenantCreateDrawer({
  visible,
  onCancel,
  onSubmit,
}: TenantCreateDrawerProps) {
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState<TenantDraft>(initialTenantDraft);

  const updateDraft = <Key extends keyof TenantDraft>(
    field: Key,
    value: TenantDraft[Key],
  ) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const reset = () => {
    setCurrent(0);
    setDraft(initialTenantDraft);
  };

  const close = () => {
    reset();
    onCancel();
  };

  const validateCurrentStep = () => {
    if (current === 0 && (!draft.name.trim() || !draft.displayName.trim())) {
      Message.warning("请填写租户标识和显示名");
      return false;
    }
    if (current === 1 && !draft.region) {
      Message.warning("请选择开通区域");
      return false;
    }
    if (current === 3 && draft.adminEmail && !draft.adminEmail.includes("@")) {
      Message.warning("请输入正确的管理员邮箱");
      return false;
    }
    return true;
  };

  const next = () => {
    if (validateCurrentStep()) setCurrent((step) => Math.min(step + 1, 4));
  };

  const submit = () => {
    if (onSubmit(draft)) reset();
  };

  return (
    <Drawer
      width={720}
      title="开通租户"
      visible={visible}
      onCancel={close}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button onClick={close}>取消</Button>
          <Space>
            {current > 0 ? (
              <Button onClick={() => setCurrent((step) => step - 1)}>
                上一步
              </Button>
            ) : null}
            {current < 4 ? (
              <Button type="primary" onClick={next}>
                下一步
              </Button>
            ) : (
              <Button type="primary" onClick={submit}>
                确认开通
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Steps current={current} size="small" className="mb-8">
        {steps.map((title) => (
          <Steps.Step key={title} title={title} />
        ))}
      </Steps>

      <StepContent current={current} draft={draft} onChange={updateDraft} />
    </Drawer>
  );
}
