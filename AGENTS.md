# AGENTS.md

## 项目定位

本仓库只包含 ANI 平台管理端前端。仓库根目录已经代表产品原型中的 BOSS 范围，源码按业务语义命名。

## 开发入口

1. 阅读 [工程约定](./docs/CONVENTIONS.md) 和 [UI 开发约定](./docs/UI-CONVENTIONS.md)。
2. 当前范围、缺口与开发记录见 [docs/PROJECT-STATUS.md](./docs/PROJECT-STATUS.md)。
3. 页面信息架构与交互规格以 GitNexus 索引 `产品原型-9.08 v2` 为准；后端接口与行为以 GitNexus 索引 `ANI` 为准。
4. 除非用户明确要求，不执行编译、构建或启动应用；页面与交互由项目负责人手动验证。

## 强制规则

- 路由、路由布局、源码目录、文件名、组件名及其他代码标识不得使用 `boss`、`Boss` 等冗余域名前缀；原型明确规定的用户可见产品名称、品牌和菜单文案除外。
- UI 实现顺序、组件复用、样式边界和交互底线以 `docs/UI-CONVENTIONS.md` 为准；目录职责、路由与组件组织、数据边界和验证方式以 `docs/CONVENTIONS.md` 为准。
- BOSS 应用骨架与 `ani-console` 保持一致：`l1` 对应顶部一级菜单，`l2` 对应左侧可点击菜单，`subgroups` 对应左侧三级分组标题；侧边栏不得重复展示当前一级菜单名称。
- 新增或修改页面前，必须通过 GitNexus 查询 `产品原型-9.08 v2` 中对应的菜单、路由和页面规格；不得根据现有前端页面反推产品要求。
- 用户界面中的空值占位统一使用半角连字符 `-`，不得使用长破折号 `—`。
- 接入接口或判断后端行为前，必须通过 GitNexus 查询 `ANI`；不得将前端演示数据作为接口契约。
- 开始任何 Core API 接口对接前，必须先通过 GitNexus 查询 `ani-boss-console对接文档补充`，并将命中内容作为 Core OpenAPI 与 `ANI` 后端实现之外的临时契约补充；未完成查询不得开始对接。该补充仅覆盖“后端测试环境已经部署、对应代码尚未合并”的过渡期。若补充内容与 Core OpenAPI、`ANI` 索引中的后端实现或实际测试环境表现存在差异，不得自行推断，必须停止相关对接并提示用户确认。
- 不覆盖、清理或改写用户已有的无关工作区变更。

## 组件拆分

### 文件规模参考

- 路由文件建议控制在 150–300 行，职责限定为路由参数处理、页面状态编排和组件组合。
- 业务组件通常控制在 80–200 行；超过 250 行时，应检查是否承担了多个可独立描述的职责。
- Hook 或状态逻辑超过 80–120 行，或包含多组相互独立的操作流程时，应考虑按业务流程抽取。
- 单文件页面超过 500 行时，通常应拆分；仅当内容高度线性、职责单一且拆分不能降低理解成本时可保留。
- 行数仅用于提示潜在的职责混杂，不作为机械拆分的唯一依据；应优先根据业务边界、状态归属和维护成本判断。

### 适合拆分的情形

满足以下任一条件时，应优先评估并实施拆分：

- 页面区域具有独立标题、表格、弹窗或完整交互边界。
- 某一区域拥有独立状态、事件处理和操作流程。
- 可以使用明确的业务名称描述，例如“设备表”“租户分配台账”。
- 需要单独维护、测试，或已存在明确的复用需求。
- 修改某一区域时，经常需要在同一大文件的不同位置之间来回查找。
- `useState`、事件处理函数或表格 `columns` 按业务区域明显成组出现。

拆分时应让新组件或 Hook 承担完整、可命名的业务职责，并尽量由其内部管理相关状态与操作，避免将实现细节重新变成大量零散参数传递给父组件。

### 不宜拆分的情形

- 只有十几行、没有独立业务语义的 JSX 片段，不应仅为缩短文件而抽取。
- 仅转发一层 props、未隔离状态、逻辑或复杂度的薄组件，不应单独创建。
- 如果拆分会引入大量零散参数、使状态归属模糊或增加跨文件跳转成本，应保留在原组件中，或先重新划分职责边界。

## 开发记录

- 完成代码或工程配置修改后，在最终回复前必须运行 `pnpm lint` 和 `pnpm fmt:check`；检查失败时应先修复，无法在当前范围处理的既有问题必须如实记录。
- 完成并验证实现、修复或文档调整后，在最终回复前更新 `docs/PROJECT-STATUS.md`。
- 记录应简短、事实准确，覆盖变更区域、用户可见行为、重要集成说明和已执行验证；不粘贴冗长命令输出。
- 不创建重复的状态或记录文件；更新记录后运行 `git diff --check`。

## GitNexus

当前前端仓库索引名为 `ani-boss-console`，后端索引名为 `ANI`，接口对接临时补充索引名为 `ani-boss-console对接文档补充`，产品原型索引名为 `产品原型-9.08 v2`。GitNexus 查询必须使用当前会话接入的工具，不得使用仓库内 CLI 或索引文件替代。

- 修改函数、类或方法前，必须使用当前会话已接入的 `impact` 工具，对目标符号执行 upstream 影响分析。
- `impact` 返回 HIGH 或 CRITICAL 风险时，必须先向用户说明直接调用方、受影响流程和风险，再继续修改。
- 完成代码修改后，必须使用当前会话已接入的 `detect_changes({ repo: "ani-boss-console", scope: "all" })` 工具检查变更范围。
- 查看接口、后端契约或执行流时，必须使用当前会话已接入的 GitNexus 工具查询后端索引 `ANI`（`repo: "ANI"`）。
- 开始任何 Core API 接口对接前，必须额外查询临时补充索引 `ani-boss-console对接文档补充`（`repo: "ani-boss-console对接文档补充"`）；命中内容用于补充 Core OpenAPI 与 `ANI` 后端实现，但不得覆盖二者，也不得替代实际测试环境验证。
- 查看产品原型、页面信息架构或交互布局时，必须使用当前会话已接入的 GitNexus 工具查询产品原型索引 `产品原型-9.08 v2`（`repo: "产品原型-9.08 v2"`）。
- 文档指定的仓库或索引不可用、未建立或无法访问时，不得根据前端代码、训练数据或经验猜测接口契约、后端行为、产品原型或交互布局；必须立即停止相关判断并提示用户建立或恢复对应索引，待索引可用后再继续。

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ani-boss-console** (1450 symbols, 3042 relationships, 114 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
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
