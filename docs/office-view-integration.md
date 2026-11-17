# 数字办公室视图：参考研究、原创实现与产品化集成

日期：2026-11-17  
状态：前端视图已实现，后端数据契约待接通；不代表 Agent-Job / MCP BFF 已联通。
本地参考库：`../research/workstation-BOSS`，来源提交 `8acd1680b3fda845b56987f60f8a30e221f9fb46`。详细证据与功能映射见 [BOSS 深度研究](workstation-boss-deep-research.md)。

## 决策与许可

- 唯一宿主继续使用 agent-harness-ui，公共设置中心不重做。
- 从 cyberdaddyleo/workstation-BOSS 学习数字办公室、部门房间、工位、右侧概览、团队画像、目标拆解与人机确认派发的产品思路。
- BOSS 的 LICENSE 是自定义非商业许可，不是 MIT/Apache：本产品不得复制上游代码、CSS、截图、图形资产、文案或其修改版。新页面采用 Partme 独立绘制的工位、白色蓝图空间和数据契约。如需复制上游资产，必须先取得作者书面商用许可。
- 第一阶段纳入原创数字办公室、工位/详情、健康态、空间/列表、负载/风险模式。不用 localStorage 虚构经营数据、任务完成或审批。

## 源码位置

| 文件 | 责任 |
| --- | --- |
| workspace/shared/OfficeMapView.jsx | 原创 UI：工位/详情/搜索/缩放/刷新/观察模式 |
| workspace/shared/office_map.css | 白色轻量俯视空间、三端响应式 |
| workspace/shared/office_projection.js | BFF 只读协议、校验、事件证据与过期处理 |
| workspace/shared/office_scene.js | 部门布局、中心指挥室、证据衍生的负载/风险与鸟瞰缩放 |
| workspace/shared/OfficeControlPanels.jsx | 中央指挥台、部门工位名册、团队画像 |
| workspace/shared/office_panorama.css | 自主绘制的轻量俯视视觉设计与底部模式 Dock |
| workspace/shared/transient_view_state.js | 切换 Settings 后保留 UI 观察状态，纯内存、不保存密钥 |
| tests/office-scene.test.ts、tests/transient-view-state.test.ts | 布局与视图状态契约测试 |
| workspace/shared/Workbench.jsx | office-map 页面出口 |
| workspace/shared/workspace_navigation.js | 跨终端数字办公室导航 |
| workspace/desktop/DesktopLayout.jsx | 桌面导航映射 |
| tests/office-projection.test.ts | 数据/权限/失效/过滤契约测试 |

视图由 Desktop/Tablet/Mobile 的既有 Workbench 打开，账户、模型、MCP、Skills、Agent 配置和 Settings 不发生重建。

## 尚未实现的后端：Workbench BFF

前端只能通过同源的 GET /api/workbench/v1/office 读取授权投影；不可直连第三方业务 MCP Server，也不能在浏览器里处理后台密钥。BFF/原生宿主使用用户与租户会话做权限判定，从已授权的 Agent-Job、Agent-Link、MCP/业务事实源汇合只读快照。

接口 JSON 结构示例（仅用于说明字段，不是运行数据）：

    {
      "schema_version": 1,
      "snapshot_at": "2026-11-17T02:00:00Z",
      "source": "authorized-workbench-projection",
      "workspace": {"id": "workspace-id", "name": "授权工作空间"},
      "counters": {
        "pending_approvals": 0,
        "blocked_runs": 0,
        "waiting_acceptance": 0
      },
      "departments": [
        {
          "id": "team-id",
          "name": "团队名称",
          "actors": [
            {
              "id": "actor-id",
              "name": "某 Agent",
              "kind": "agent",
              "role": "代码评审",
              "state": "running",
              "run_id": "authority-run-id",
              "event_id": "committed-event-id",
              "task": "有依据的当前任务",
              "capacity": 2,
              "active": 1,
              "last_seen_at": "2026-11-17T01:59:59Z",
              "capabilities": ["git.read", "ci.read"]
            }
          ]
        }
      ]
    }

### 事实源和禁止事项

| 数据 | 事实源 | 禁止 |
| --- | --- | --- |
| Run / Node 状态 | Agent-Job + Runtime 事件 | 在前端拖卡片即视为执行成功 |
| 会话、事件和人工审批 | Agent-Link 与审批服务 | 以通信 ACK 冒充业务验收 |
| 部门、成员、客户、经营信息 | 业务系统 MCP 的授权只读投影 | 在 Workbench 中复制业务数据库 |
| 模型、工具、技能、凭据 | 统一 Settings / Agent-PaaS / Gateway | 按视图创建重复配置或储存 API Key |
| 交付结果 | Delivery Graph 的 Evidence Policy | Run 成功直接等于交付验收通过 |

### 状态与可追溯性

- HTTP 404/501：尚未接入；401/403：权限拒绝；其他服务错误显示明确异常。
- Agent 标记执行中，但缺少真实 run_id 和 event_id 时，只显示「未核实」。
- 快照超过 90 秒，执行状态不可显示为实时，统计数显示破折号而不是伪造的零。
- 缺少 KPI 表示未知，只有合法授权快照里真正的零值才显示 0。
- 空房间只显示「尚无可显示工位」，不会虚构员工。
- 手动刷新后每 30 秒自动更新，断线不应把旧在线快照继续作为可信状态。

## 页面实现的功能

- 空间 / 列表：同一份数据的两种呈现。
- 日常态势 / 执行中 / 工作负载 / 异常与风险：只读过滤，不修改真实 Job。
- 工位画像：角色、状态、任务、并发、Run ID、事件标识、最近观测、能力列表。
- 缩放、搜索、刷新、复制已有 Run ID。
- 「连接与设置」复用现有 agent-connections 设置路由。
- 目标作战图、真实审批与派发、经营指标、市场雷达：下一阶段，不使用本地假执行替代。

## 下一步：产品化而非演示

1. Workbench BFF 真实投影：认证、授权、Run 与事件引用、版本和缓存、拒绝跨租户访问。
2. View Registry / Capability Pack Registry：office-map、任务看板、Graph 与 Chat 共用 Query/Action/Subscription，不复制 View 私有数据库。
3. 目标规划：AI 建议 → 结构化草稿 → 人工编辑 → 依赖/权限/预算校验 → 审批 → 冻结 PlanVersion → Agent-Job 创建真实 Run。
4. 工位详情链接到真实执行中心，审批/重试需要命令幂等与审计，不能直接写 Job terminal state。
5. 在 BFF 事实源就绪后接入经营指标、客户和市场雷达；全部标注来源、窗口与最后更新时间。
6. 必须在 Desktop 1350×768 / Tablet 768×1024 / Mobile 390×844 验证空/错/失效/正常态、导航、Settings 保持、键盘、减少动画。
7. 最后以实际 Runtime + PostgreSQL + Agent-Link + Agent-Job + 业务 MCP 联调以及自动化验证，作为可发布条件。

## 发布限制

本阶段**不是**已交付的生产系统。原 Workbench 的部分模块仍有本地 Mock；新增数字办公室有真实只读协议，但 BFF 当前不存在。不得把前端单测和构建通过称为真实 Agent 任务完成。
