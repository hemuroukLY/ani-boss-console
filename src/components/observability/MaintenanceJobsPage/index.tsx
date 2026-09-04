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
import { Metric } from "@/components/overview/Metric";
import { maintenanceJobs, type MaintenanceJob } from "../maintenanceModel";

const statusMeta = {
  success: { label: "成功", className: "text-green-600" },
  running: { label: "运行中", className: "text-blue-600" },
  failed: { label: "失败", className: "text-red-600" },
} as const;

export function MaintenanceJobsPage() {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const filteredJobs = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return maintenanceJobs.filter((job) => {
      const matchesKeyword =
        !query ||
        `${job.name} ${job.id} ${job.target}`.toLowerCase().includes(query);
      return (
        (type === "all" || job.type === type) &&
        (status === "all" || job.status === status) &&
        matchesKeyword
      );
    });
  }, [keyword, status, type]);

  const columns: ListColumn<MaintenanceJob>[] = [
    {
      title: "任务",
      dataIndex: "name",
      width: 250,
      fixed: "left",
      render: (_, job) => (
        <DataTableNameCell name={job.name} secondary={job.id} />
      ),
    },
    { title: "类型", dataIndex: "type", width: 90 },
    {
      title: "状态",
      width: 100,
      render: (_, job) => {
        const meta = statusMeta[job.status];
        return <span className={meta.className}>{meta.label}</span>;
      },
    },
    { title: "目标", dataIndex: "target", width: 230 },
    { title: "触发方", dataIndex: "triggeredBy", width: 140 },
    { title: "开始时间", dataIndex: "startedAt", width: 165 },
    { title: "耗时", dataIndex: "duration", width: 120 },
    {
      title: "操作",
      width: 100,
      fixed: "right",
      render: () => (
        <Button type="text" size="small" disabled>
          详情
        </Button>
      ),
    },
  ];

  const successCount = maintenanceJobs.filter(
    (job) => job.status === "success",
  ).length;
  const runningCount = maintenanceJobs.filter(
    (job) => job.status === "running",
  ).length;
  const failedCount = maintenanceJobs.filter(
    (job) => job.status === "failed",
  ).length;

  return (
    <div className="space-y-4">
      <ListPageHeader
        title="任务历史"
        subtitle="查看平台巡检、修复、扩容和回收作业的执行记录。"
      />
      <section className="grid grid-cols-4 gap-3.5 max-[1100px]:grid-cols-2">
        <Metric
          label="全部任务"
          value={String(maintenanceJobs.length)}
          hint="当前静态样本"
        />
        <Metric label="成功" value={String(successCount)} hint="执行完成" />
        <Metric
          label="运行中"
          value={String(runningCount)}
          hint="等待任务结果"
        />
        <Metric
          label="失败"
          value={String(failedCount)}
          hint="需要排查"
          tone="danger"
        />
      </section>
      <ListPageFrame
        header={
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <div className="text-base font-semibold text-gray-900">
                作业记录
              </div>
              <div className="mt-1 text-xs text-gray-500">
                当前为只读任务快照；详情、取消和重试待任务接口接入后开放。
              </div>
            </div>
            <span className="text-xs text-gray-500">
              共 {filteredJobs.length} 条
            </span>
          </div>
        }
        toolbar={
          <ListToolbar
            filters={
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={type}
                  onChange={setType}
                  style={{ width: 130 }}
                  options={[
                    { label: "全部类型", value: "all" },
                    { label: "巡检", value: "巡检" },
                    { label: "修复", value: "修复" },
                    { label: "扩容", value: "扩容" },
                    { label: "回收", value: "回收" },
                  ]}
                />
                <Select
                  value={status}
                  onChange={setStatus}
                  style={{ width: 130 }}
                  options={[
                    { label: "全部状态", value: "all" },
                    { label: "成功", value: "success" },
                    { label: "运行中", value: "running" },
                    { label: "失败", value: "failed" },
                  ]}
                />
                <Input.Search
                  allowClear
                  value={keyword}
                  onChange={setKeyword}
                  placeholder="搜索任务、ID 或目标"
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
          data={filteredJobs}
          pagination={false}
          scroll={{ x: 1195 }}
          emptyText="没有符合筛选条件的任务记录"
        />
      </ListPageFrame>
    </div>
  );
}
