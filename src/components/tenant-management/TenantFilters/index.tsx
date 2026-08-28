import { Button, Input, Select, Space } from "@arco-design/web-react";
import { IconRefresh, IconSearch } from "@arco-design/web-react/icon";
import {
  tenantRegions,
  tenantStatusMeta,
} from "@/features/tenant-management/model";

export interface TenantFiltersValue {
  keyword: string;
  region: string;
  status: string;
  trial: string;
}

interface TenantFiltersProps extends TenantFiltersValue {
  onChange: (field: keyof TenantFiltersValue, value: string) => void;
  onReset: () => void;
}

export function TenantFilters({
  keyword,
  region,
  status,
  trial,
  onChange,
  onReset,
}: TenantFiltersProps) {
  return (
    <Space wrap size={12} className="w-full">
      <Input
        value={keyword}
        onChange={(value) => onChange("keyword", value)}
        prefix={<IconSearch />}
        placeholder="搜索租户标识或显示名"
        allowClear
        className="w-64"
      />
      <Select
        value={region}
        onChange={(value) => onChange("region", value)}
        options={[{ label: "全部区域", value: "all" }, ...tenantRegions]}
        className="w-36"
      />
      <Select
        value={status}
        onChange={(value) => onChange("status", value)}
        options={[
          { label: "全部状态", value: "all" },
          ...Object.entries(tenantStatusMeta).map(([value, item]) => ({
            label: item.label,
            value,
          })),
        ]}
        className="w-32"
      />
      <Select
        value={trial}
        onChange={(value) => onChange("trial", value)}
        options={[
          { label: "全部租户", value: "all" },
          { label: "试用租户", value: "trial" },
          { label: "正式租户", value: "formal" },
        ]}
        className="w-32"
      />
      <Button icon={<IconRefresh />} onClick={onReset}>
        重置
      </Button>
    </Space>
  );
}
