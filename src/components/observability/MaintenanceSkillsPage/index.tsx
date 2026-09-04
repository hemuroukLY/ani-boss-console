import { Button, Input, Select } from "@arco-design/web-react";
import { useMemo, useState } from "react";
import {
  DataTableNameCell,
  ListDataTable,
  ListPageFrame,
  ListPageHeader,
  ListToolbar,
  type ListColumn,
} from "@/components/common";
import { maintenanceSkills, type MaintenanceSkill } from "../maintenanceModel";

const statusMeta = {
  ready: { label: "就绪", className: "text-green-600" },
  attention: { label: "需关注", className: "text-orange-600" },
  disabled: { label: "已停用", className: "text-gray-400" },
} as const;

export function MaintenanceSkillsPage() {
  const [domain, setDomain] = useState("all");
  const [status, setStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const filteredSkills = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return maintenanceSkills.filter((skill) => {
      const matchesKeyword =
        !query || `${skill.name} ${skill.scope}`.toLowerCase().includes(query);
      return (
        (domain === "all" || skill.domain === domain) &&
        (status === "all" || skill.status === status) &&
        matchesKeyword
      );
    });
  }, [domain, keyword, status]);

  const columns: ListColumn<MaintenanceSkill>[] = [
    {
      title: "Skill",
      dataIndex: "name",
      width: 230,
      fixed: "left",
      render: (_, skill) => (
        <DataTableNameCell name={skill.name} secondary={skill.id} />
      ),
    },
    { title: "领域", dataIndex: "domain", width: 100 },
    { title: "版本", dataIndex: "version", width: 100 },
    {
      title: "状态",
      width: 100,
      render: (_, skill) => {
        const meta = statusMeta[skill.status];
        return <span className={meta.className}>{meta.label}</span>;
      },
    },
    { title: "适用范围", dataIndex: "scope", width: 280 },
    { title: "成功率", dataIndex: "successRate", width: 100 },
    { title: "最近运行", dataIndex: "lastRunAt", width: 165 },
    {
      title: "操作",
      width: 100,
      fixed: "right",
      render: () => (
        <Button type="text" size="small" disabled>
          执行
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="运维 Skills"
        subtitle="查看平台可用的巡检、诊断、修复和容量评估能力。"
        extra={
          <Button type="primary" disabled>
            安装 Skill
          </Button>
        }
      />
      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold text-gray-900">
                Skills 清单
              </div>
              <div className="mt-1 text-xs text-gray-500">
                当前为只读能力清单；安装、启停和执行待任务接口接入后开放。
              </div>
            </div>
            <span className="text-xs text-gray-500">
              显示 {filteredSkills.length} / {maintenanceSkills.length} 项
            </span>
          </div>
        }
        toolbar={
          <ListToolbar
            filters={
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={domain}
                  onChange={setDomain}
                  style={{ width: 130 }}
                  options={[
                    { label: "全部领域", value: "all" },
                    { label: "计算", value: "计算" },
                    { label: "存储", value: "存储" },
                    { label: "网络", value: "网络" },
                    { label: "可观测", value: "可观测" },
                  ]}
                />
                <Select
                  value={status}
                  onChange={setStatus}
                  style={{ width: 130 }}
                  options={[
                    { label: "全部状态", value: "all" },
                    { label: "就绪", value: "ready" },
                    { label: "需关注", value: "attention" },
                    { label: "已停用", value: "disabled" },
                  ]}
                />
                <Input.Search
                  allowClear
                  value={keyword}
                  onChange={setKeyword}
                  placeholder="搜索 Skill 或适用范围"
                  style={{ width: 280 }}
                />
              </div>
            }
          />
        }
      >
        <ListDataTable
          rowKey="id"
          columns={columns}
          data={filteredSkills}
          pagination={false}
          scroll={{ x: 1175 }}
          emptyText="没有符合筛选条件的运维 Skill"
        />
      </ListPageFrame>
    </div>
  );
}
