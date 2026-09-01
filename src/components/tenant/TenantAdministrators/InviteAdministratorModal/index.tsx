import { Input, Modal, Select } from "@arco-design/web-react";
import { tenantAdminRoles } from "@/components/tenant/model";
import type { InviteDraft } from "../types";

interface InviteAdministratorModalProps {
  visible: boolean;
  draft: InviteDraft;
  onChange: (draft: InviteDraft) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function InviteAdministratorModal({
  visible,
  draft,
  onChange,
  onConfirm,
  onCancel,
}: InviteAdministratorModalProps) {
  return (
    <Modal
      title="邀请管理员"
      visible={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="发送邀请"
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-sm text-gray-600">用户名</div>
          <Input
            value={draft.name}
            placeholder="未填写时使用邮箱前缀"
            onChange={(name) => onChange({ ...draft, name })}
          />
        </div>
        <div>
          <div className="mb-2 text-sm text-gray-600">显示名</div>
          <Input
            value={draft.displayName}
            onChange={(displayName) => onChange({ ...draft, displayName })}
          />
        </div>
        <div>
          <div className="mb-2 text-sm text-gray-600">邮箱</div>
          <Input
            value={draft.email}
            placeholder="name@example.com"
            onChange={(email) => onChange({ ...draft, email })}
          />
        </div>
        <div>
          <div className="mb-2 text-sm text-gray-600">角色</div>
          <Select
            value={draft.role}
            className="w-full"
            options={tenantAdminRoles.map((role) => ({
              label: role,
              value: role,
            }))}
            onChange={(role) => onChange({ ...draft, role })}
          />
        </div>
      </div>
    </Modal>
  );
}
