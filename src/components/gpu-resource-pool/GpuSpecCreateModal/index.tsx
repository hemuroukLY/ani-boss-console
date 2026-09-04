import {
  Alert,
  Form,
  Input,
  InputNumber,
  Message,
  Modal,
  Select,
} from "@arco-design/web-react";
import { useEffect, useMemo, useState } from "react";
import type {
  CreateGpuSpecInput,
  GpuInventoryDevice,
  GpuSpecMode,
} from "../types";

type CreateGpuSpecFormValues = Omit<CreateGpuSpecInput, "memoryTotalMb">;

const SPEC_ID_PATTERN = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

function gpuTypesForMode(
  devices: GpuInventoryDevice[],
  mode: GpuSpecMode,
) {
  return Array.from(
    new Set(
      devices
        .map((device) =>
          mode === "wholecard" ? device.gpuSpec : device.gpuSharingSpec,
        )
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort();
}

interface GpuSpecCreateModalProps {
  visible: boolean;
  devices: GpuInventoryDevice[];
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateGpuSpecInput) => void;
}

export function GpuSpecCreateModal({
  visible,
  devices,
  submitting,
  onCancel,
  onSubmit,
}: GpuSpecCreateModalProps) {
  const [mode, setMode] = useState<GpuSpecMode>("wholecard");
  const [form] = Form.useForm<CreateGpuSpecFormValues>();
  const gpuTypes = useMemo(
    () => gpuTypesForMode(devices, mode),
    [devices, mode],
  );

  useEffect(() => {
    if (!visible) return;
    setMode("wholecard");
    form.setFieldsValue({
      specId: "",
      gpuType: "",
      gpuMode: "wholecard",
      shares: 1,
      mbPerShare: 0,
    });
  }, [form, visible]);

  const submit = () => {
    form.validate().then((values) => {
      if (!SPEC_ID_PATTERN.test(values.specId)) {
        Message.warning("规格 ID 仅支持小写字母、数字和中划线");
        return;
      }
      const memoryTotalMb = values.shares * values.mbPerShare;
      const matchingMemory = devices
        .filter((device) =>
          values.gpuMode === "wholecard"
            ? device.gpuSpec === values.gpuType
            : device.gpuSharingSpec === values.gpuType,
        )
        .map((device) => device.memoryTotalMb || 0);
      const maxMemoryMb = Math.max(0, ...matchingMemory);
      if (maxMemoryMb && memoryTotalMb > maxMemoryMb) {
        Message.warning(
          `切分显存总量不能超过匹配物理卡的 ${maxMemoryMb} MiB`,
        );
        return;
      }
      onSubmit({ ...values, memoryTotalMb });
    });
  };

  return (
    <Modal
      title="新建 GPU 调度规格"
      visible={visible}
      confirmLoading={submitting}
      onOk={submit}
      onCancel={() => {
        if (submitting) return;
        onCancel();
        form.resetFields();
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="规格 ID"
          field="specId"
          rules={[{ required: true, message: "请输入规格 ID" }]}
        >
          <Input placeholder="例如 nvidia-a100-vgpu-half" />
        </Form.Item>
        <Form.Item
          label="模式"
          field="gpuMode"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: "整卡", value: "wholecard" },
              { label: "vGPU", value: "vgpu" },
            ]}
            onChange={(value) => {
              const nextMode = value as GpuSpecMode;
              setMode(nextMode);
              form.setFieldsValue({
                gpuType: "",
                shares: nextMode === "wholecard" ? 1 : 2,
                mbPerShare: 0,
              });
            }}
          />
        </Form.Item>
        {gpuTypes.length ? null : (
          <Alert
            type="warning"
            content="当前库存没有与所选模式匹配的节点标签，后端会拒绝创建该规格。"
            className="mb-4"
          />
        )}
        <Form.Item
          label="节点标签值"
          field="gpuType"
          rules={[{ required: true, message: "请选择节点标签值" }]}
        >
          <Select
            placeholder="从实际 GPU 节点标签中选择"
            options={gpuTypes.map((value) => ({ label: value, value }))}
            disabled={!gpuTypes.length}
          />
        </Form.Item>
        <Form.Item
          label="切分份数"
          field="shares"
          rules={[{ required: true, type: "number", min: 1 }]}
        >
          {mode === "wholecard" ? (
            <InputNumber disabled min={1} max={1} className="w-full" />
          ) : (
            <Select
              options={[
                { label: "2 份（half）", value: 2 },
                { label: "4 份（quarter）", value: 4 },
              ]}
            />
          )}
        </Form.Item>
        <Form.Item
          label="每份显存（MiB）"
          field="mbPerShare"
          rules={[
            {
              required: true,
              type: "number",
              min: mode === "vgpu" ? 10 : 1,
            },
          ]}
        >
          <InputNumber
            min={mode === "vgpu" ? 10 : 1}
            precision={0}
            className="w-full"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
