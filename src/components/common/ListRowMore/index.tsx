import { Dropdown } from "@arco-design/web-react";
import { IconDown } from "@arco-design/web-react/icon";
import type { ReactElement } from "react";
import { DataTableRowActionButton } from "../DataTable";

interface ListRowMoreProps {
  droplist: ReactElement;
  disabled?: boolean;
}

export function ListRowMore({ droplist, disabled }: ListRowMoreProps) {
  return (
    <Dropdown trigger="click" position="br" droplist={droplist}>
      <DataTableRowActionButton disabled={disabled}>
        更多
        <IconDown className="ml-1 text-xs" />
      </DataTableRowActionButton>
    </Dropdown>
  );
}
