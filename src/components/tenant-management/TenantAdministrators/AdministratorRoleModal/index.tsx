import { Modal, Select } from "@arco-design/web-react";
import {
  tenantAdminRoles,
  type TenantAdmin,
  type TenantAdminRole,
} from "@/features/tenant-management/model";

interface AdministratorRoleModalProps {
  admin?: TenantAdmin;
  role: TenantAdminRole;
  onRoleChange: (role: TenantAdminRole) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdministratorRoleModal({
  admin,
  role,
  onRoleChange,
  onConfirm,
  onCancel,
}: AdministratorRoleModalProps) {
  return (
    <Modal
      title="修改管理员角色"
      visible={Boolean(admin)}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认修改"
    >
      <div className="mb-2 text-sm text-gray-600">角色</div>
      <Select
        value={role}
        className="w-full"
        options={tenantAdminRoles.map((item) => ({ label: item, value: item }))}
        onChange={onRoleChange}
      />
    </Modal>
  );
}
