import {SETTINGS_GROUPS} from './harness_sections.js';
export {SETTINGS_GROUPS};
export const SETTINGS_LABELS = Object.fromEntries(SETTINGS_GROUPS.flatMap(group => group.items.map(([id, name]) => [id, name])))
const GENERAL_SOURCE_ROWS = [
  { title: "工作环境", rows: [
    ["language", "界面语言", "选择应用 UI 的显示语言。", "select", "简体中文", ["跟随系统", "简体中文", "English"]],
    ["mode", "界面模式", "办公模式侧重操作摘要与结果；编程模式显示命令、输出和代码变更详情。", "select", "代码开发", ["代码开发", "日常办公"]],
    ["terminalProfile", "继承系统终端 Profile", "启动内置终端时尽量继承登录 shell 环境、代理、Kube 变量和本机终端字体。", "switch", true],
    ["terminalFont", "终端字体", "留空时自动探测系统终端配置；填写后作为 Agent Harness UI 终端的字体覆盖。", "text", "", "例如 SF Mono, monospace"],
    ["nativeSearch", "增强 Find 和 Grep", "在新建会话或应用重启后恢复的会话中使用增强 Find 和 Grep。当前会话保持现有设置；Windows 的 Find 保持不变。", "switch", true],
  ] },
  { title: "通知与运行", rows: [
    ["notifications", "任务通知", "任务完成、失败或需要确认时发送桌面通知。", "switch", true],
    ["sound", "通知声音", "通知开启后，可单独关闭任务通知提示音。", "switch", false],
    ["awake", "保持电脑运行", "打开后阻止系统因空闲进入休眠（仍可手动睡眠/合盖休眠）。桌面端全局生效。", "switch", false],
    ["hardware", "Chrome 硬件加速", "关闭后可规避部分显卡或驱动导致的白屏、闪退、渲染异常。修改后需重启应用生效。", "switch", true],
  ] },
  { title: "任务与消息", rows: [
    ["interaction", "交互行为", "在 Agent Harness UI 运行时将后续操作加入队列，或引导至下一轮工具调用后运行。", "select", "加入队列", ["加入队列", "引导当前任务"]],
    ["autoResolve", "提问自动继续", "开启后，Agent 提问 5 分钟未回答会自动继续；关闭后，当前和后续提问会一直等待你的回答。", "switch", false],
    ["fullRetention", "完整保留模型 I/O", "保留完整的模型请求和响应，不自动压缩、限制大小或删除旧记录。", "switch", false],
    ["reasoning", "显示思考过程", "在消息流中展示完整的模型思考内容；关闭时每轮仍展示第一次思考。", "switch", true],
    ["todos", "显示待办", "在消息流中展示 Todo 工具卡片。", "switch", true],
    ["groupExplore", "分组探索工具", "将连续的读取和搜索工具聚合为 Explore 分组。", "switch", true],
    ["groupTerminal", "分组终端命令", "将连续的非只读 Shell 命令聚合为 Terminal 分组。", "switch", true],
    ["groupChanges", "分组文件更改", "将连续的 Write、Edit 和 ApplyPatch 调用聚合为 Changes 分组。", "switch", true],
    ["suggestions", "主动建议", "根据工作区上下文给出后续操作建议。", "switch", false],
  ] },
  { title: "网络", rows: [
    ["proxy", "HTTP 代理", "模型、MCP、命令工具与应用渲染层的出口流量将经此代理，不读取系统环境变量。留空时这些流量直连，内置浏览器则跟随系统代理设置。修改后需重启应用生效。", "text", "", "http://127.0.0.1:7890"],
    ["noProxy", "不使用代理的地址", "匹配这些主机的请求将直连，不经过 HTTP 代理。多个规则用英文逗号分隔。修改后需重启应用生效。", "text", "", "localhost,127.0.0.1"],
    ["certificate", "自定义证书", "可选。填写 PEM 根证书路径后，会作为 NODE_EXTRA_CA_CERTS 注入模型、MCP 与命令工具，并用于渲染层证书校验。修改后需重启应用生效。", "text", "", "证书文件路径"],
  ] },
  { title: "更新与数据", rows: [
    ["previewUpdates", "接受提前收到预览版更新", "开启后将最快、提前体验新功能和改进版本，关闭后将随着版本发布节奏获得版本推送更新。", "switch", false],
    ["autoUpdates", "自动下载并安装更新", "开启后检测到更新会自动开始下载；下载完成后，如有任务正在运行，重启更新前仍会要求确认。", "switch", false],
    ["autoArchive", "自动归档旧任务", "定时扫描最近打开过的工作区，将已完成、无未读、未置顶且超过保留期的任务自动归档。", "switch", false],
    ["archiveDays", "归档保留时长", "任务最后更新时间早于该时长后，才会进入自动归档候选。", "select", "30 天", ["3 天", "7 天", "14 天", "30 天"]],
    ["dataRoot", "数据存储路径", "应用数据的根目录；实际迁移需要接入桌面服务后确认。", "text", "", "使用应用默认目录"],
  ] },
]
// 分组顺序对应 ZCode settingsPageHelpers.tsx 的 SettingsGroupCard。
const generalRows = Object.fromEntries(GENERAL_SOURCE_ROWS.flatMap(group => group.rows.map(row => [row[0], row])))
export const GENERAL_GROUPS = [
  ["界面语言", ["language"]], ["界面模式", ["mode"]],
  ["终端", ["terminalProfile", "terminalFont", "nativeSearch"]],
  ["网络", ["proxy", "noProxy", "certificate"]],
  ["应用", ["hardware", "previewUpdates", "autoUpdates", "notifications", "sound", "awake"]],
  ["消息", ["interaction", "autoResolve", "fullRetention", "reasoning", "todos", "groupExplore", "groupTerminal", "groupChanges"]],
  ["归档", ["autoArchive", "archiveDays"]], ["数据", ["dataRoot"]],
].map(([title, ids]) => ({ title, rows: ids.map(id => generalRows[id]) }))
export const GENERAL_DEFAULTS = Object.fromEntries(GENERAL_GROUPS.flatMap(group => group.rows.map(([id,,, , value]) => [id, value])))
export const RESOURCE_CONFIG = {
  agents: { singular: "子智能体", description: "管理可被主智能体调用的专用角色、指令和工具范围。", file: "AGENT.md", field: "角色指令", placeholder: "描述职责、执行方法和输出要求", samples: [["code-reviewer", "代码审查", "检查正确性、兼容性和测试覆盖，先报告可复现的问题。"], ["explorer", "代码探索", "只读查找代码入口和调用关系，给出来源文件与证据。"]] },
  plugins: { singular: "插件", description: "集中管理插件及其提供的技能、MCP、命令与 Hooks。", file: "plugin.json", field: "插件清单", placeholder: '{"name":"my-plugin","description":""}', samples: [["workspace-tools", "工作区工具", '{\n  "name": "workspace-tools",\n  "description": "文件阅读与代码检查"\n}']] },
  mcp: { singular: "MCP 服务", description: "为智能体连接工具和数据源，分别管理用户与工作区配置。", file: "mcp.json", field: "服务配置", placeholder: '{"transport":"stdio","command":""}', samples: [["filesystem", "文件系统工具", '{\n  "transport": "stdio",\n  "command": "mcp-filesystem",\n  "args": ["./workspace"]\n}'], ["knowledge", "知识库检索", '{\n  "transport": "http",\n  "url": "https://example.test/mcp"\n}']] },
  skills: { singular: "技能", description: "管理可复用的工作方法；按任务需要加载技能说明。", file: "SKILL.md", field: "技能说明", placeholder: "---\nname: my-skill\ndescription: 技能用途\n---\n\n执行步骤", samples: [["code-review", "代码审查流程", "---\nname: code-review\ndescription: 审查代码的正确性与可维护性\n---\n\n先理解变更目标，再检查实现与测试。"], ["documentation", "文档编写", "---\nname: documentation\ndescription: 根据代码事实编写文档\n---\n\n引用真实接口和可执行示例。"]] },
  commands: { singular: "命令", description: "创建可通过斜杠调用的常用提示词和工作流。", file: "command.md", field: "命令内容", placeholder: "使用 $ARGUMENTS 引用调用时输入的参数", samples: [["review", "审查当前变更", "请审查当前未提交的变更：$ARGUMENTS\n列出问题、影响与建议验证方法。"], ["summarize", "总结当前任务", "总结当前任务的目标、变更、验证结果与待办。"]] },
  hooks: { singular: "Hook", description: "在智能体生命周期事件发生时执行预设操作。", file: "hooks.json", field: "执行命令", placeholder: "例如 npm run check", samples: [["check-changes", "变更后检查", "npm run check"], ["session-note", "会话结束记录", "echo session-complete"]] },
}
export function createResourceSamples() {
  return Object.fromEntries(Object.entries(RESOURCE_CONFIG).map(([kind, config]) => [kind, config.samples.map(([name, description, content], i) => ({ id: `${kind}-${i}`, name, description, content, scope: i === 1 ? "workspace" : "user", origin: "示例", event: kind === "hooks" ? "PostToolUse" : undefined }))]))
}
export const PROVIDERS = [
  { id:"bigmodel", name:"BigModel", mark:"B", group:"智谱", protocol:"OpenAI 兼容", endpoint:"https://open.bigmodel.cn/api/paas/v4", models:[] },
  { id:"start-plan", name:"Start Plan", mark:"Z", group:"智谱", protocol:"OpenAI 兼容", endpoint:"https://open.bigmodel.cn/api/coding/paas/v4", models:[] },
  { id:"openai", name:"OpenAI", mark:"O", group:"自定义供应商", protocol:"OpenAI 兼容", endpoint:"https://api.openai.com/v1", models:[] },
  { id:"anthropic", name:"Anthropic", mark:"A", group:"自定义供应商", protocol:"Anthropic", endpoint:"https://api.anthropic.com", models:[] },
  { id:"deepseek", name:"DeepSeek", mark:"D", group:"自定义供应商", protocol:"OpenAI 兼容", endpoint:"https://api.deepseek.com/v1", models:[] },
  { id:"local", name:"本地模型", mark:"L", group:"自定义供应商", protocol:"OpenAI 兼容", endpoint:"http://127.0.0.1:11434/v1", models:[] },
]

export const SHORTCUTS = [["task", "新建任务", "Mod+Shift+N"], ["search", "搜索任务", "Mod+K"], ["settings", "打开设置", "Mod+,"], ["sidebar", "展开 / 收起侧边栏", "Mod+B"], ["terminal", "打开终端", "Mod+J"], ["workspace", "打开工作区", "Mod+O"], ["next", "切换到下一个任务", "Mod+Shift+]"], ["previous", "切换到上一个任务", "Mod+Shift+["]]

// 设备角色保持稳定，旋转屏幕不改变控制入口的名称或配置键。
export function deviceControlLabel(device='desktop') {
  return device==='phone'?'手机控制':device==='tablet'?'平板控制':'电脑控制';
}
export function settingsGroupsForDevice(device='desktop') {
  return SETTINGS_GROUPS.map(group=>({...group,items:group.items.map(([id,label,icon])=>[id,id==='computer'?deviceControlLabel(device):label,icon])}));
}
