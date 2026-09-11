import { Alert, Form, Input, Modal, Select } from "@arco-design/web-react";
import { useEffect, type ReactNode } from "react";
import type {
  CreatePlatformAdministratorInput,
  PlatformAdministratorListItem,
  PlatformAdministratorRole,
  PlatformAdministratorRoleDefinition,
} from "@/api/platform-admins";
import { platformAdministratorRoleLabels } from "../model";

interface CreateFormValues extends CreatePlatformAdministratorInput {
  confirmPassword: string;
}

interface PasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

interface RoleFormValues {
  role: PlatformAdministratorRole;
}

const fallbackRoles = Object.entries(platformAdministratorRoleLabels).map(([value, label]) => ({
  value: value as PlatformAdministratorRole,
  label,
}));

function passwordStrengthValidator(
  value: string | undefined,
  callback: (error?: ReactNode) => void,
) {
  if (!value) {
    callback();
    return;
  }
  const groups = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(value),
  ).length;
  callback(groups >= 3 ? undefined : "需包含大小写字母、数字、特殊字符中的至少三类");
}

function roleOptions(roles: PlatformAdministratorRoleDefinition[]) {
  return roles.length
    ? roles.map((role) => ({ value: role.name, label: role.label }))
    : fallbackRoles;
}

export function PlatformAdministratorCreateModal({
  visible,
  loading,
  roles,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  loading: boolean;
  roles: PlatformAdministratorRoleDefinition[];
  onCancel: () => void;
  onSubmit: (input: CreatePlatformAdministratorInput) => void;
}) {
  const [form] = Form.useForm<CreateFormValues>();

  const submit = () => {
    form.validate().then(({ confirmPassword: _confirmPassword, ...values }) => onSubmit(values));
  };

  return (
    <Modal
      title="新建平台运营账号"
      visible={visible}
      confirmLoading={loading}
      onOk={submit}
      onCancel={onCancel}
      afterClose={() => form.resetFields()}
      unmountOnExit={false}
    >
      <Alert
        type="info"
        className="mb-4"
        content="当前接口仅支持直接创建本地账号并设置初始密码，邀请流程需后端补充后再开放。"
      />
      <Form form={form} layout="vertical" initialValues={{ role: "platform-ops" }}>
        <Form.Item
          label="邮箱"
          field="email"
          rules={[{ required: true, type: "email", message: "请输入有效邮箱" }]}
        >
          <Input placeholder="name@example.com" autoComplete="off" />
        </Form.Item>
        <Form.Item
          label="用户名"
          field="username"
          rules={[
            { required: true, message: "请输入用户名" },
            { maxLength: 64, message: "用户名最多 64 个字符" },
            { match: /^[^:]+$/, message: "用户名不能包含冒号" },
          ]}
        >
          <Input placeholder="例如 zhang.san" autoComplete="off" />
        </Form.Item>
        <Form.Item
          label="显示名称"
          field="displayName"
          rules={[
            { required: true, message: "请输入显示名称" },
            { maxLength: 128, message: "显示名称最多 128 个字符" },
          ]}
        >
          <Input placeholder="例如 张三" />
        </Form.Item>
        <Form.Item label="角色" field="role" rules={[{ required: true, message: "请选择角色" }]}>
          <Select options={roleOptions(roles)} />
        </Form.Item>
        <Form.Item
          label="初始密码"
          field="password"
          rules={[
            { required: true, message: "请输入初始密码" },
            { minLength: 8, maxLength: 64, message: "密码长度需为 8 至 64 个字符" },
            { validator: passwordStrengthValidator },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          label="确认密码"
          field="confirmPassword"
          rules={[
            { required: true, message: "请再次输入密码" },
            {
              validator: (value, callback) =>
                callback(value === form.getFieldValue("password") ? undefined : "两次密码不一致"),
            },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function PlatformAdministratorRoleModal({
  target,
  loading,
  roles,
  onCancel,
  onSubmit,
}: {
  target: PlatformAdministratorListItem | null;
  loading: boolean;
  roles: PlatformAdministratorRoleDefinition[];
  onCancel: () => void;
  onSubmit: (role: PlatformAdministratorRole) => void;
}) {
  const [form] = Form.useForm<RoleFormValues>();

  useEffect(() => {
    if (target) form.setFieldsValue({ role: target.role });
  }, [form, target]);

  return (
    <Modal
      title={`修改角色${target ? `：${target.displayName}` : ""}`}
      visible={Boolean(target)}
      confirmLoading={loading}
      mountOnEnter={false}
      afterClose={() => form.resetFields()}
      onCancel={onCancel}
      onOk={() => form.validate().then(({ role }) => onSubmit(role))}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="平台角色"
          field="role"
          rules={[{ required: true, message: "请选择角色" }]}
        >
          <Select options={roleOptions(roles)} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function PlatformAdministratorPasswordModal({
  target,
  loading,
  onCancel,
  onSubmit,
}: {
  target: PlatformAdministratorListItem | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => void;
}) {
  const [form] = Form.useForm<PasswordFormValues>();

  return (
    <Modal
      title={`重置密码${target ? `：${target.displayName}` : ""}`}
      visible={Boolean(target)}
      confirmLoading={loading}
      afterClose={() => form.resetFields()}
      onCancel={onCancel}
      onOk={() => form.validate().then(({ newPassword }) => onSubmit(newPassword))}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="新密码"
          field="newPassword"
          rules={[
            { required: true, message: "请输入新密码" },
            { minLength: 8, maxLength: 64, message: "密码长度需为 8 至 64 个字符" },
            { validator: passwordStrengthValidator },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          label="确认密码"
          field="confirmPassword"
          rules={[
            { required: true, message: "请再次输入新密码" },
            {
              validator: (value, callback) =>
                callback(
                  value === form.getFieldValue("newPassword") ? undefined : "两次密码不一致",
                ),
            },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
