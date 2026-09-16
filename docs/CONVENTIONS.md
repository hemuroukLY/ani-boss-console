# ANI BOSS Console 工程约定

本文档说明项目的工程结构和日常开发边界。必须执行的完整规则以 [AGENTS.md](../AGENTS.md) 为准。

## 项目边界

- 仓库根目录已经代表 BOSS 应用范围，源码目录、路由和代码标识按业务语义命名，不重复添加 `boss` 或 `Boss` 前缀。
- 用户可见的产品名、品牌和菜单文案按产品原型保留，不受代码命名规则限制。
- 页面规格以 GitNexus 索引 `产品原型-9.11` 为准；后端契约与行为以 GitNexus 索引 `ANI` 为准。

## 目录职责

- `src/routes/`：TanStack Router 文件路由。路由文件负责路由参数、路由上下文、页面级状态与数据编排，以及领域组件组合。
- `src/components/<scope>/`：按页面作用域组织的业务组件、领域模型、Provider、状态管理和业务逻辑。
- `src/api/`：按业务资源组织的 API 请求函数、静态类型与 Axios 公共请求基础设施。
- `src/components/common/`：跨页面或跨领域复用的公共组件；目录外统一从 `@/components/common` 导入。
- `src/components/layouts/`：应用布局、认证中心、顶部导航、侧边栏和页面出口。
- `src/styles/`：全局样式。组件私有样式应与组件同目录，不放入全局样式目录。
- `src/routeTree.gen.ts`：TanStack Router 自动生成文件，不得手工修改。
- `docs/`：工程说明、API 对接流程与 UI 约定，不保存接口契约或产品原型副本。

项目不使用 `src/pages/` 或 `src/features/` 承载新代码；已有遗留目录应在相关功能调整时按 `AGENTS.md` 迁移，不新增依赖。

## 路由组织

- 所有 URL 入口位于 `src/routes/`，业务页面使用 `<page-name>/index.tsx`。
- route component 是路由适配层：在入口内通过当前 `Route` 的 `useParams`、`useSearch` 或 loader 数据读取并整理路由输入，再以普通 props 传给 `src/components/<scope>/` 下的页面组件；领域页面不应仅为读取 path/search 而依赖 route 对象或 `getRouteApi`。
- 路由适配层可以使用具名函数或等价的内联函数，不强制箭头语法；没有路由输入时也只组合页面组件，不把查询、业务状态和完整页面 JSX 留在 route 文件中。
- 不存在真实父子关系的模块直接放在路由根层级，并使用连字符连接语义，例如 `tenants-billing/index.tsx`。
- 只有模块自身的 index、详情或其他真实子路由放入对应模块目录；动态参数使用 `$param.tsx`。
- 有子路由的父 route 使用 `Outlet`，不得以薄 route 文件转发独立 pages 组件。
- 路由 UI 交由 TanStack Router Vite 插件的 `autoCodeSplitting` 自动拆分，默认不增加 `.lazy.tsx` 或手工动态导入。

## 组件组织

- 组件使用 `src/components/<scope>/<ComponentName>/index.tsx`，不得在 scope 根目录平铺组件实现。
- 子组件使用 `<ComponentName>/<SubComponentName>/index.tsx`。
- 组件私有样式使用同目录的 `index.css`、`index.less`、`index.module.css` 或 `index.module.less`。
- 被两个及以上路由复用的页面主体或 UI 片段必须抽取为领域组件；仅供单一路由使用但具有完整业务职责的复杂区域也应按组件拆分规则抽取。
- 领域状态应靠近其所属组件或 Provider，避免将完整实现拆成大量零散 props。

## 数据与接口

- 新增或调整接口的完整步骤遵循 [API 对接流程](./API-INTEGRATION.md)；本节只保留长期有效的结构边界。
- API 层按业务资源组织在 `src/api/<domain>/`；Core 与 Services 请求分别由 `src/api/request.ts` 的 Axios 实例统一处理认证、刷新、响应解包与错误归一化，页面只调用领域 API 函数。
- 接口类型随业务资源保存在各模块 `types.ts`；契约核对独立 ANI 仓库的 Core/Services OpenAPI、实现与 GitNexus 接口补充索引，不在前端保留整份生成式 schema 快照。
- 要求幂等的写请求由业务 API 模块内部管理 key 生命周期；页面仅提交无 key DTO，是否使用 body 或 Header 载体以接口契约为准。
- SSE 使用 Axios fetch adapter 的流式响应；预签名直传使用不带平台 JWT 的隔离 Axios 实例。
- 平台登录态位于 `src/components/auth/`，只使用 ANI 平台身份接口，不复用 Console 的租户登录字段。
- 接入真实接口前，必须通过 GitNexus 查询 `ANI` 中的接口、字段和行为，不得根据页面演示数据反推后端契约。
- 服务端数据接入后统一使用 TanStack Query 管理；页面私有交互状态保留在组件内部，跨页面领域状态放入对应 `src/components/<scope>/`。

## 导入、样式与可视化

- 源码使用 `@/` 指向 `src/`。
- 动态类名使用 `clsx`。
- 样式优先使用 Tailwind CSS；复杂选择器或第三方组件局部覆写才使用组件私有 CSS/LESS。
- 图表优先通过 `echarts-for-react` 使用 ECharts，不重复实现已有图表能力。
- Arco Design 的使用顺序、表格约束和交互底线见 [UI 开发约定](./UI-CONVENTIONS.md)。

## 验证

默认由项目负责人手动完成构建、启动和页面交互验证。除非用户明确要求，Agent 不运行 `pnpm build`、`pnpm verify` 或启动开发服务。

pnpm 命令执行门禁：所有 Agent 执行任何 `pnpm` 命令时，都必须在 Codex 沙箱外的系统环境运行，由系统 Corepack 根据 `package.json` 的 `packageManager` 选择 pnpm 版本；不得使用沙箱内的 fallback pnpm，也不得绕过项目声明手动选择其他版本。

完成代码或工程配置修改后，在最终回复前必须运行 `pnpm lint` 和 `pnpm fmt:check`；检查失败时应先修复，无法在当前范围处理的既有问题必须如实记录。文档修改至少检查 Markdown 链接、内容一致性和 `git diff --check`；代码修改还必须遵循 `AGENTS.md` 中的 GitNexus 影响分析与变更检测要求。
