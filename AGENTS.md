# 项目约定

## UI 与产品原型

- 本项目的信息架构、菜单名称、菜单层级、路由及页面规格，以 GitNexus 已索引的 `产品原型-8.25` 为当前唯一依据。
- 新增或修改页面前，必须先通过 GitNexus 查询 `产品原型-8.25` 中对应的菜单项、路由与页面规格；原型版本升级时，应优先更新本约定中的版本号。
- 当前仓库只承载产品原型中 BOSS 域的前端内容，项目内部无需再用 `boss` 重复区分业务域。
- 路由、路由布局、源码目录、文件名、组件名及其他代码标识不得使用 `boss`、`Boss` 等冗余域名前缀；应使用项目内语义名称，例如 `/`、`/overview/*`、`_app`、`AppShell`。
- 原型明确规定的用户可见产品名称、品牌文案或菜单文案不受上述代码命名约束，仍以产品原型为准。
- BOSS 应用骨架与 `ani-console` 保持一致：一级菜单位于顶部，二级和三级菜单位于左侧边栏。
- BOSS 原型层级映射规则：`l1` 对应顶部一级菜单，`l2` 对应左侧可点击菜单，`subgroups` 对应左侧三级分组标题。
- 左侧边栏不得重复展示当前一级菜单名称，应直接从二级菜单或三级分组开始展示。

## 路由与页面组织

- 项目使用 TanStack Router 文件路由，所有 URL 路由入口必须位于 `src/routes/`，目录和文件名必须按实际 URL 层级组织。
- 单一路由使用的页面组件必须直接定义在对应 route 文件中，通过 `createFileRoute` 的 `component` 属性注册；禁止新增或恢复 `src/features/*/pages`、独立 `pages` 目录或仅用于转发页面组件的薄 route 文件。
- 项目已在 TanStack Router Vite 插件中启用 `autoCodeSplitting: true`；路由 UI 应交由插件自动拆分，除非存在明确的特殊拆包需求，否则不得额外创建 `.lazy.tsx` 或手动封装动态导入。
- 被两个或以上路由复用的页面主体或 UI 片段必须抽取到 `src/components/<scope>/<ComponentName>/index.tsx`，route 文件只负责路由参数、路由上下文、页面数据编排和组合这些组件。
- `src/features/` 只保留领域模型、状态管理、Provider、数据访问和业务逻辑，不得存放页面组件或通用 UI 组件。
- 有子路由的父 route 必须通过 `Outlet` 承载子路由；index route 使用对应目录下的 `index.tsx`，动态参数使用 `$param.tsx`。
- `src/routeTree.gen.ts` 为 TanStack Router 自动生成文件，不得手工编辑；路由结构变化后应由路由插件重新生成。

## 组件与样式

- `src/components/` 必须按页面作用域（page scope）组织，每个组件使用独立目录：`src/components/<scope>/<ComponentName>/index.tsx`。
- 组件私有样式必须与组件同目录，命名为 `index.css`、`index.less`、`index.module.css` 或 `index.module.less`。
- 子组件使用 `src/components/<scope>/<ComponentName>/<SubComponentName>/index.tsx` 组织。
- 禁止在 scope 目录直接平铺 `<ComponentName>.tsx`、`<ComponentName>.module.css` 或其他组件实现、私有样式文件。
- 开发页面或交互前，必须先确认项目中是否已有可复用组件；项目内没有合适组件时，再确认 Arco Design 是否提供可直接使用的组件。
- 只有项目现有组件和 Arco Design 均无法满足需求时，才允许封装自定义组件，避免重复实现已有能力。
- 项目已安装 `echarts` 和 `echarts-for-react`；图表及数据可视化场景必须优先通过 `echarts-for-react` 使用 ECharts 实现，不得在已有能力可满足时自行绘制或重复封装图表组件。
- 项目已安装 `clsx`；动态或条件类名必须优先使用 `clsx` 组合，不得手动使用模板字符串、字符串拼接或嵌套条件表达式拼接类名。
- 样式编写优先使用 Tailwind CSS；仅在 Tailwind CSS 确实无法合理实现时，才新增 Less 或 CSS 样式。
- 列表的名称或主标识列已提供详情跳转时，不得在操作列重复展示“详情”；详情入口应统一放在名称或主标识列。
- 详情页左侧信息区即为资源概览；右侧 Tabs 不得再设置或重复展示“概览”，只承载左侧概览之外的专项信息与操作。
- 产品原型中的编辑操作必须通过弹窗修改，并在用户确认后生效；不得在详情展示区直接切换、原地编辑或即时写入。

## 验证方式

- 除非用户明确要求，否则不要执行编译、构建或启动应用等验证；默认由项目负责人手动完成相关验证。

## GitNexus

- 当前前端仓库索引名为 `ani-boss-console`，后端索引名为 `ANI`，产品原型索引名为 `产品原型-8.25`。
- 修改函数、类或方法前，必须使用当前会话已接入的 `impact` 工具，对目标符号执行 upstream 影响分析。
- `impact` 返回 HIGH 或 CRITICAL 风险时，必须先向用户说明直接调用方、受影响流程和风险，再继续修改。
- GitNexus 查询必须使用当前会话已接入的 GitNexus 工具（如 `query`、`context`、`impact`、`detect_changes`），不得使用 GitNexus CLI、`.gitnexus/run.cjs` 或仓库索引目录下的文件替代这些查询工具。
- 完成代码修改后，必须使用当前会话已接入的 `detect_changes({ repo: "ani-boss-console", scope: "all" })` 工具检查变更范围。
- 查看接口、后端契约或执行流时，必须使用当前会话已接入的 GitNexus 工具查询后端索引 `ANI`（`repo: "ANI"`）。
- 查看产品原型、页面信息架构或交互布局时，必须使用当前会话已接入的 GitNexus 工具查询产品原型索引 `产品原型-8.25`（`repo: "产品原型-8.25"`）。
- 文档指定的仓库或索引不可用、未建立或无法访问时，不得根据前端代码、训练数据或经验猜测接口契约、后端行为、产品原型或交互布局；必须立即停止相关判断并提示用户建立或恢复对应索引，待索引可用后再继续。

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ani-boss-console** (216 symbols, 356 relationships, 11 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "master"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/ani-boss-console/context` | Codebase overview, check index freshness |
| `gitnexus://repo/ani-boss-console/clusters` | All functional areas |
| `gitnexus://repo/ani-boss-console/processes` | All execution flows |
| `gitnexus://repo/ani-boss-console/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
