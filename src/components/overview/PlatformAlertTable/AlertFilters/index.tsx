import { Input, Select, Space } from "@arco-design/web-react";
import { IconSearch } from "@arco-design/web-react/icon";

interface AlertFiltersProps {
  keyword: string;
  level: string;
  status: string;
  onKeywordChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function AlertFilters({
  keyword,
  level,
  status,
  onKeywordChange,
  onLevelChange,
  onStatusChange,
}: AlertFiltersProps) {
  return (
    <Space>
      <Input
        value={keyword}
        onChange={onKeywordChange}
        prefix={<IconSearch />}
        placeholder="关键字"
        allowClear
        className="w-48"
      />
      <Select
        value={level}
        onChange={onLevelChange}
        options={["全部级别", "严重", "警告", "提示"]}
        className="w-32"
      />
      <Select
        value={status}
        onChange={onStatusChange}
        options={["全部状态", "待处理", "已处理", "已忽略"]}
        className="w-32"
      />
    </Space>
  );
}
