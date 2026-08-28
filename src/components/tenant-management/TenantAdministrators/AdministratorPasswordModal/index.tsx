import { Input, Modal } from "@arco-design/web-react";
import type { TenantAdmin } from "@/features/tenant-management/model";

interface AdministratorPasswordModalProps {
  admin?: TenantAdmin;
  password: string;
  onPasswordChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdministratorPasswordModal({
  admin,
  password,
  onPasswordChange,
  onConfirm,
  onCancel,
}: AdministratorPasswordModalProps) {
  return (
    <Modal
      title="重置管理员密码"
      visible={Boolean(admin)}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认重置"
    >
      <div className="mb-2 text-sm text-gray-600">新密码</div>
      <Input.Password
        value={password}
        placeholder="至少 8 位"
        onChange={onPasswordChange}
      />
    </Modal>
  );
}
