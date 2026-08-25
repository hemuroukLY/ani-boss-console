# ANI Boss

ANI 平台管理端。当前阶段提供与 `ani-console` 一致的基础技术栈和可扩展项目骨架。

## 开发

```bash
pnpm install
pnpm dev
```

默认访问 `http://localhost:5174`。

如果需要对接后端，复制 `.env.example` 为 `.env.local`，并修改其中的代理地址。

## 校验

```bash
pnpm verify
```

首次执行校验时会先由 Vite 生成 TanStack Router 路由树，再进行 TypeScript 类型检查。
