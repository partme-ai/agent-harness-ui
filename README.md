# agent-harness-ui
Agent Harness UI ：为智能体 Harness 项目定制的终端界面，Desktop、Tablet、Mobile 三端

## 当前基础

基于 Agent Admin UI 的现有前端复制，保留 React、TypeScript、Ant Design、三端界面、系统主题、模型服务、知识库、智能体配置与调试等功能。目前仍是本地交互原型，尚未接入真实业务服务；页面标识、路由和配置存储键暂时沿用原实现。

原项目说明保存在 [Agent Admin UI 原始说明](docs/Agent-Admin-UI-README.md)，更早的 TinyBot Web 说明保存在 [TinyBot Web 原始说明](docs/TinyBot-Web-README.md)。

## 本地运行

```sh
cd /Users/wandl/workspaces/workspace-partme-ai/agent-hernes-ui
npm ci
npm run typecheck
npm run build
npm run preview -- --port 5189
```

建议使用独立端口 `5189`，避免占用 TinyBot 的 `5177` 或 Agent Admin UI 的 `5188`。依赖需要在本目录单独安装；当前尚未安装依赖或启动服务。

## 复制来源

- 源仓库：`https://github.com/partme-ai/agent-admin-ui`
- 源提交：`9b0d68a75ddb98de6c85188fa2e9339a47864945`
- 本地源目录：`/Users/wandl/workspaces/workspace-partme-ai/agent-admin-ui`
- 复制日期：2026-11-12
- 本地目录按指定使用 `agent-hernes-ui`；GitHub 仓库名为 `agent-harness-ui`。
- 已知源版本测试限制：`tests/gugong-figma.test.ts` 引用的 `evidence/gugong-figma/colors-audit.json` 缺失。本次保持源代码状态，不补造校验数据。
