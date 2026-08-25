# 项目约定

## UI 与产品原型

- 本项目的信息架构、菜单名称、菜单层级、路由及页面规格，以 GitNexus 已索引的 `产品原型-8.24` 为当前唯一依据。
- 新增或修改页面前，必须先通过 GitNexus 查询 `产品原型-8.24` 中对应的菜单项、路由与页面规格；原型版本升级时，应优先更新本约定中的版本号。
- BOSS 应用骨架与 `ani-console` 保持一致：一级菜单位于顶部，二级和三级菜单位于左侧边栏。
- BOSS 原型层级映射规则：`l1` 对应顶部一级菜单，`l2` 对应左侧可点击菜单，`subgroups` 对应左侧三级分组标题。
- 左侧边栏不得重复展示当前一级菜单名称，应直接从二级菜单或三级分组开始展示。

## 验证方式

- 除非用户明确要求，否则不要执行编译、构建或启动应用等验证；默认由项目负责人手动完成相关验证。

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **ani-boss-console** (38 symbols, 32 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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