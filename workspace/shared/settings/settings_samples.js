import { PROVIDERS } from './settings_config.js';

// 模型名称用于复现参考图的信息密度，不表示已连接或当前可用的模型。
const modelsByProvider = {
  bigmodel: ['GLM-5.3', 'GLM-5.3-Flash', 'GLM-4.6V'],
  'start-plan': ['GLM-5.3', 'GLM-5.3-Flash'],
  openai: ['gpt-5.3-codex', 'gpt-5.2', 'gpt-5-mini'],
  anthropic: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  local: ['qwen3-coder:30b', 'qwen3:8b', 'deepseek-r1:14b'],
  mimo: ['mimo-v2.6-flash', 'mimo-v2.6'],
  minimax: ['MiniMax-M3.1', 'MiniMax-M3.1-Flash-Preview'],
  kimi: ['kimi-k2.5', 'kimi-k2'],
};

export function createProviderSamples() {
  const custom = [
    ['mimo', 'Xiaomi MiMo Plan'], ['minimax', 'MiniMax Plan'], ['kimi', 'Kimi Code'],
  ].map(([id, name]) => ({id, name, mark:name[0], group:'自定义供应商', protocol:'OpenAI 兼容', endpoint:`https://${id}.example.test/v1`}));
  return [...PROVIDERS.slice(0, 2), ...custom, ...PROVIDERS.slice(2)].map(provider => ({...provider, models:[...modelsByProvider[provider.id]], preview:true}));
}

export const SAMPLE_MODEL_GROUPS = createProviderSamples().map(provider => ({
  label: provider.name,
  models: provider.models.map(model => ({value:`${provider.id}/${model}`, label:model})),
}));

const memoryTopics = [
  ['MEMORY.md', '工作区记忆索引', '按架构、界面、资源配置和验证记录组织记忆；每次任务只加载相关条目。'],
  ['agent-plugins-migration-2026-09-28.md', '插件迁移记录', '资源按插件来源分组，保留独立配置与插件托管资源的区别。'],
  ['agent-buddy-product-boundary.md', '产品功能边界', 'Agent Harness UI 为桌面智能体底座，提供本地能力、远端 API 和可扩展业务入口。'],
  ['dual-desktop-architecture.md', '双桌面架构', 'Tauri 网页与 GPUI-Kit 共用业务契约、字段和交互语义。'],
  ['settings-sidebar-contract.md', '设置导航约定', '设置替换左侧导航，展开宽度保持一致，账号入口与返回行为保持稳定。'],
  ['zcode-settings-source-port.md', '设置组件迁移', '沿用参考源码的列表、表单、插件分组与工具栏，不用通用卡片替换专属结构。'],
  ['blender-scene-preview-notes.md', '场景预览记录', '预览镜头按正面、侧面与细节分组，记录光照与材质检查结果。'],
  ['blender-render-output-checklist.md', '渲染输出清单', '交付前检查相机、帧范围、透明背景、尺寸与输出格式。'],
  ['codeguard-review-checklist.md', '代码审查约定', '问题描述应包括触发条件、影响与复现方法；区分已验证事实与推断。'],
  ['gpui-kit-component-mapping.md', '原生组件映射', '按钮、列表、表单、弹窗使用统一命名和状态，记录平台差异。'],
  ['model-provider-configuration.md', '模型配置约定', '供应商地址与模型 ID 分开维护，凭据由安全服务保存。'],
  ['mcp-tool-boundaries.md', '工具连接边界', '区分 stdio 与 HTTP 传输，保留超时设置和工具调用范围。'],
  ['knowledge-indexing-workflow.md', '知识索引流程', '导入、切片、嵌入、索引与检索分别记录进度和失败原因。'],
  ['workspace-conventions.md', '工作区规范', '先查看现有修改；任务只更新相关文件，保留其它进行中的工作。'],
  ['ui-spacing-and-controls.md', '界面间距与控件', '统一内容宽度、按钮高度、行内间距和弹窗边距；长文字应省略或换行。'],
  ['session-resume-checkpoints.md', '会话恢复检查点', '保存任务目标、已完成步骤、验证结果和待办，恢复时避免重复副作用。'],
  ['agent-evaluation-fixtures.md', '智能体评估样本', '评估集同时覆盖正常、错误、取消、重试与权限拒绝场景。'],
  ['plugin-scope-and-inheritance.md', '插件作用域', '用户配置与工作区配置独立；界面计数始终对应当前范围。'],
  ['browser-verification-notes.md', '浏览器验证记录', '逐页核对列表、编辑、搜索和空状态，截图保留导航与页面上下文。'],
  ['release-readiness-notes.md', '发布前记录', '编译、测试、界面验证与真实服务验收分别记录，不混用完成结论。'],
  ['design-handoff-checklist.md', '设计交付清单', '为页面整理入口、字段、操作流程、空状态和返回位置。'],
  ['memory-retention-policy.md', '记忆保留约定', '只保留可复用的决策和约束，定期合并重复条目并标明来源。'],
  ['local-runtime-health.md', '本地运行时检查', '记录进程状态、资源占用与最后检查时间，未知状态单独显示。'],
  ['remote-api-error-handling.md', '远端 API 错误处理', '区分认证失败、限流、超时与结果未知，给出明确的恢复入口。'],
];

export function createMemorySamples() {
  const workspaces = [
    ['buddy', 'Agent Harness UI', memoryTopics],
    ['agent-skills', 'workspace-agent-skills', memoryTopics.filter((_, index) => index === 0 || index % 2 === 1)],
    ['design', 'design-workspace', memoryTopics.filter((_, index) => index === 0 || [4, 6, 7, 14, 18, 20].includes(index))],
  ];
  return workspaces.map(([id, label, topics]) => ({id, label, files:topics.map(([name, title, description], index) => {
    const content = `# ${title}\n\n> ${label} · 演示记忆，不代表本机真实记录。\n\n## 约定\n\n${description}\n\n## 使用方式\n\n- 在相关任务开始前核对现有实现。\n- 记录输入、操作范围和验证证据。\n- 发现变化时更新本条记录，保留待确认事项。\n\n## 后续检查\n\n确认实现与当前要求一致，并将未验证的能力单独列出。`;
    return {name, path:`preview-memory/${id}/${name}`, updatedAt:Date.parse('2026-09-30T09:00:00+08:00') - index * 8 * 3600000, kind:index === 0 ? 'index' : 'item', size:new TextEncoder().encode(content).length, content};
  })}));
}

// 用量是固定演示样本；汇总与行数据同源，切换周期可核对总数。
export const USAGE_SAMPLES = [
  ['GLM-5.3', 'BigModel', 34, 1248000, 286400],
  ['mimo-v2.6-flash', 'Xiaomi MiMo Plan', 28, 986000, 192800],
  ['MiniMax-M3.1', 'MiniMax Plan', 19, 624000, 148200],
  ['deepseek-chat', 'DeepSeek', 16, 428000, 96700],
  ['kimi-k2.5', 'Kimi Code', 12, 356000, 78400],
  ['qwen3-coder:30b', '本地模型', 9, 214000, 42800],
].map(([model, provider, sessions, input, output]) => ({model, provider, sessions, input, output}));
export function getUsageSamples(period) {
  const factor = period === '30d' ? 4 : 1;
  return USAGE_SAMPLES.map(row => ({...row, sessions:row.sessions * factor, input:row.input * factor, output:row.output * factor}));
}
