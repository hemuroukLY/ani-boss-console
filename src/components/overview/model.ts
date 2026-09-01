export type AlertStatus = "待处理" | "已处理" | "已忽略";

export interface AlertItem {
  id: number;
  level: "严重" | "警告" | "提示";
  title: string;
  objectType: string;
  objectName: string;
  region: string;
  summary: string;
  time: string;
  status: AlertStatus;
}

export const platformAlerts: AlertItem[] = [
  {
    id: 1,
    level: "严重",
    title: "GPU 节点不可用",
    objectType: "节点",
    objectName: "gpu-node-07",
    region: "华东一区",
    summary: "节点心跳中断超过 10 分钟",
    time: "08-27 09:42",
    status: "待处理",
  },
  {
    id: 2,
    level: "警告",
    title: "算力配额扩容待审批",
    objectType: "GPU 配额",
    objectName: "acme-ai",
    region: "华东一区",
    summary: "GPU-Hours 2000 → 4000 · 大模型评测峰值",
    time: "08-27 09:18",
    status: "待处理",
  },
  {
    id: 3,
    level: "提示",
    title: "镜像配额待审批",
    objectType: "镜像配额",
    objectName: "demo-corp",
    region: "华东一区",
    summary: "租户申请镜像存储扩容",
    time: "08-27 08:36",
    status: "待处理",
  },
  {
    id: 4,
    level: "提示",
    title: "区域容量刷新完成",
    objectType: "区域",
    objectName: "cn-east-1",
    region: "华东一区",
    summary: "资源池容量数据已同步",
    time: "08-27 08:10",
    status: "已处理",
  },
];

export const regions = [
  ["华东一区", "cn-east-1", "18 / 64", "24 · AZ-A, AZ-B", "21", 72],
  ["华北一区", "cn-north-1", "24 / 48", "18 · AZ-A", "13", 50],
  ["西南一区", "cn-southwest-1", "4 / 16", "6 · AZ-A", "4", 75],
] as const;

export const statusData = {
  inference: {
    title: "AI 服务运营态势",
    subtitle: "掌握推理服务运行质量与调用趋势",
    tip: "跨租户查看推理服务规模、可用性与调用质量，异常服务可下钻处理。",
    metrics: [
      ["在线服务", "42", "共 48 个服务"],
      ["异常服务", "2", "需要及时关注"],
      ["今日调用", "2.84M", "较昨日 +12.6%"],
      ["P99 延迟", "1.26s", "较昨日 -8.4%"],
    ],
    trendTitle: "近 7 日调用趋势",
    distributionTitle: "服务状态分布",
    rows: [
      ["qwen-prod", "星云科技", "华北一区", "错误率升高", "4.8%"],
      ["embedding-v3", "未来实验室", "华东一区", "副本不足", "2 / 4"],
    ],
  },
  knowledge: {
    title: "知识库运营态势",
    subtitle: "掌握知识库规模、索引与查询质量",
    tip: "跨租户查看知识库规模、索引健康与查询质量，定位索引和容量风险。",
    metrics: [
      ["知识库", "186", "覆盖 31 个租户"],
      ["文档总量", "1.28M", "今日新增 12,430"],
      ["索引异常", "3", "失败或长时间处理中"],
      ["今日查询", "428K", "命中率 92.4%"],
    ],
    trendTitle: "近 7 日查询趋势",
    distributionTitle: "索引状态",
    rows: [
      ["corp-rag", "星云科技", "华东一区", "容量预警", "86%"],
      ["legal-docs", "远海智能", "华北一区", "索引失败", "2 次"],
      ["support-kb", "未来实验室", "华东一区", "构建超时", "48 分钟"],
    ],
  },
} as const;
