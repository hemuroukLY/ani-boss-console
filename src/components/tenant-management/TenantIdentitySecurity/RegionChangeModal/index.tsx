import { Form, Modal, Select } from "@arco-design/web-react";
import { tenantRegions } from "@/features/tenant-management/model";

interface RegionChangeModalProps {
  visible: boolean;
  region: string;
  onRegionChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RegionChangeModal({
  visible,
  region,
  onRegionChange,
  onSave,
  onCancel,
}: RegionChangeModalProps) {
  return (
    <Modal
      title="变更区域归属"
      visible={visible}
      okText="确认变更"
      onOk={onSave}
      onCancel={onCancel}
      unmountOnExit
    >
      <Form layout="vertical">
        <Form.Item label="目标区域" required>
          <Select
            value={region}
            onChange={onRegionChange}
            options={tenantRegions.map((item) => ({ ...item }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
