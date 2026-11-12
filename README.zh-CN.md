# Agent Harness UI

简体中文 | [English](README.md)

Agent Harness UI 是一套用于探索智能体配置与交付流程的 React 三端控制台，可用于审阅界面和演练工作流；**目前尚未接入智能体运行时或生产管理服务**。

```text
浏览器（桌面 / 平板 / 手机）
  → React + Ant Design 控制台
  → 内存中的演示状态与浏览器外观设置
  → 本地模拟及界面反馈
  ↛ 模型、知识库、工具、设备或持久化服务
```

## 快速开始

需要 Node.js 24（用于当前 TypeScript 测试运行方式）、npm，以及提供静态预览的 Python 3。编写本文档时本机版本为 Node.js 24.18.0、npm 12.2.0、Python 3.14.8；这是实测环境，不代表已验证的兼容版本范围。

```bash
git clone https://github.com/partme-ai/agent-harness-ui.git
cd agent-harness-ui
npm ci
npm run typecheck
npm run build
npm run preview -- --port 5189
```

打开 <http://127.0.0.1:5189/index.html> 查看控制台，或打开 <http://127.0.0.1:5189/compare.html> 查看三端对比。预览服务仅监听 `127.0.0.1` 并提供 `dist/` 静态文件，不代理后端请求。端口 `5189` 用于与本机其他项目隔离；不传 `--port` 时，继承的脚本默认使用 `5177`。

页面接受 `device=desktop|tablet|mobile` 控制排版，接受 `host=web|desktop|android|ipad` 模拟宿主。例如 <http://127.0.0.1:5189/index.html?device=mobile&host=web#/w/demo/home> 展示手机 Web 排版。这些参数不会把浏览器变成原生宿主，也不会连接实体设备。

## 当前能力

- 共用的桌面、平板、手机控制台，以及主题和品牌设置。
- 模型服务与网关规则、知识库与共享空间、智能体、资源、系统管理等菜单和交互页面。
- 模型选择、知识库、智能体配置、试聊、发布、绑定设备的本地引导流程；检查与回复均在前端模拟。
- 用于检查各尺寸排版的对比页面。路由定义见 [`src/catalog.ts`](src/catalog.ts)，菜单结构见 [`src/shell_layout.ts`](src/shell_layout.ts)。

多数业务记录从 React 初始状态生成，刷新页面后恢复演示数据。外观设置和引导使用独立的浏览器存储键。本仓库未提供真实模型调用、文档解析、MCP、工具执行、设备接入或服务端持久化。相关服务接入并完成验证前，界面流程应视为本地演练。

## 源码结构

| 路径 | 职责 |
|:---|:---|
| `src/main.tsx`, `src/Shell.tsx` | 控制台入口与共用外壳 |
| `src/pages/` | 功能页面与弹窗 |
| `src/catalog.ts`, `src/shell_layout.ts` | 路由与导航 |
| `src/state.ts`, `src/context.tsx` | 演示数据与会话状态 |
| `src/compare.tsx` | 三端对比入口 |
| `scripts/build.mjs`, `scripts/serve.py` | 静态构建与本地预览 |
| `tests/` | 源码与行为检查 |
| `docs/` | 设计说明和流程记录 |

[`package.json`](package.json) 中的私有应用版本为 `0.1.0`。锁定的前端依赖包括 React 19.2.0、Ant Design 6.6.5、TypeScript 5.9.3 和 esbuild 0.28.2。仓库没有记录 npm 发布包或发布渠道。

## 开发与验证

```bash
npm run typecheck
npm test
npm run build
```

`npm run build` 生成 `dist/index.html` 与 `dist/compare.html`。执行 `npm run preview` 前需先完成构建。全量测试存在已知的仓库夹具缺口：[`tests/gugong-figma.test.ts`](tests/gugong-figma.test.ts) 引用了当前检出版本中不存在的 `evidence/gugong-figma/colors-audit.json`。恢复该文件或依据可核实的源数据修订测试前，不能宣称 `npm test` 全量通过。

本次 README 更新只记录现有代码，不构成真实服务、原生设备或 CI 验收。仓库没有提交 CI 工作流。对后续变更，应运行相关测试、类型检查、构建，并检查目标尺寸，再报告具体已验证范围。

## 许可证

本仓库使用 [MIT 许可证](LICENSE)。构建时附带的第三方声明由 [`scripts/build.mjs`](scripts/build.mjs) 汇集。
