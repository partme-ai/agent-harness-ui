import {AntNativeButton} from '../../ant_controls.jsx';
// Adapted from ZCode 29628c9: settings/SubagentsSection.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { Bot, Check, Trash2, Button, Input, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, cn, useZCodeIntl, testId, TID_SUBAGENT_ROW, PluginStoreAvatar, resolveModelDisplayName, encodeCustomModelValue, ModelConfigSelect, SubagentReasoningField, SubagentModelOverrideControl, SUBAGENT_COLORS, SUBAGENT_COLOR_CLASS } from '../zcode_bridge.jsx';
import { settingsResourceRowInteraction } from './settingsResourceRowInteraction.js';
import { PluginScopeMenu } from './PluginScopeMenu.jsx';
import { SettingsFormActions } from './SettingsFormActions.jsx';
import { SettingsFormTextarea } from './SettingsFormTextarea.jsx';
const AGENT_COLORS = SUBAGENT_COLORS;
const COLOR_DOT_CLASS = SUBAGENT_COLOR_CLASS;
const INHERIT_MODEL_VALUE = 'inherit';
const MODEL_ITEM_NEVER_LOCKED = () => false;
const TOOL_OPTIONS = ['Read', 'Grep', 'Glob', 'Bash', 'Edit', 'Write', 'WebFetch', 'WebSearch', 'TodoWrite'];
const RISKY_TOOLS = new Set(['Bash', 'Edit', 'Write']);
function isEditableUserAgent(agent) {
    return ((agent.scope === "user" || agent.scope === "workspace") &&
        agent.source === "user" &&
        agent.readOnly !== true);
}
function supportsEnabledToggle(agent) {
    return isEditableUserAgent(agent) && agent.scope === "user";
}
function isBuiltInAgent(agent) {
    return agent.scope === "built-in" || agent.source === "built-in";
}
function supportsModelOverride(agent) {
    return getBuiltInSubagentName(agent) !== null || agent.source === "plugin";
}
function getBuiltInSubagentName(agent) {
    if (!isBuiltInAgent(agent)) {
        return null;
    }
    return agent.name === "general-purpose" || agent.name === "Explore" ? agent.name : null;
}
function allowsAllTools(tools) {
    // 通配符 * 表示全部工具，不能按数组长度显示成 1 个工具。
    return !tools || tools.length === 0 || tools.some((tool) => tool.trim() === "*");
}
function toSubagentModelValue(selection) {
    return selection
        ? encodeCustomModelValue(selection.providerId, selection.modelId)
        : INHERIT_MODEL_VALUE;
}
function resolveSubagentModelLabel(params) {
    const trimmedModel = params.model?.trim();
    if (!trimmedModel || trimmedModel === INHERIT_MODEL_VALUE) {
        return params.inheritLabel;
    }
    // Registry 只包含当前可选模型，但历史 Subagent 配置仍需展示原模型身份，
    // 方便用户理解并修复失效配置。候选列表与保存校验继续以 Registry 为准。
    return resolveModelDisplayName(params.modelGroups, trimmedModel) ?? trimmedModel;
}
function FormFieldLabel({ children }) {
    return (<label className="mb-1.5 block text-ui-base font-medium text-foreground-subtle">
      {children}
    </label>);
}
function AgentColorDot({ color }) {
    return (<span className={cn("inline-flex size-2 shrink-0 rounded-full", color ? COLOR_DOT_CLASS[color] : "bg-foreground-subtlest")} aria-hidden="true"/>);
}
function AgentBadge({ children, className }) {
    return (<span className={cn("inline-flex min-h-5 items-center rounded-md bg-surface px-1.5 py-0.5 text-ui-sm text-foreground-subtle ring-1 ring-border", className)}>
      {children}
    </span>);
}
function ToolCheckbox({ checked, disabled, label, onToggle, }) {
    return (<AntNativeButton type="button" role="checkbox" aria-checked={checked} disabled={disabled} onClick={onToggle} className={cn("flex min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left transition-colors", disabled ? "cursor-not-allowed opacity-60" : "hover:bg-surface-hover")}>
      <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
        <span className={cn("flex size-4 items-center justify-center rounded-sm border transition-colors", checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input-border bg-input text-transparent")}>
          <Check className="size-3.5"/>
        </span>
      </span>
      <span className="min-w-0 flex-1 truncate text-ui-base font-medium text-foreground">
        {label}
      </span>
      {RISKY_TOOLS.has(label) ? (<span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true"/>) : null}
    </AntNativeButton>);
}
function AgentListRow({ agent, pluginIconItem, isOperating, modelGroups, modelSelectionView, modelSelectionLoading, modelSelectGroups, onModelOverrideChange, onDelete, onEdit, onToggle, }) {
    const { intl } = useZCodeIntl();
    const editable = isEditableUserAgent(agent);
    const showEnabledToggle = supportsEnabledToggle(agent);
    const rowEditable = editable && !isOperating;
    const hasModelOverrideControl = supportsModelOverride(agent);
    // 有覆盖控件的行由控件本身表达模型，不再重复显示模型徽标。
    const showModelBadge = !hasModelOverrideControl;
    const inheritModelLabel = intl.formatMessage({
        id: "settings.subagents.model.inherit",
    });
    const modelLabel = resolveSubagentModelLabel({
        inheritLabel: inheritModelLabel,
        modelGroups: modelSelectGroups,
        model: toSubagentModelValue(agent.modelSelection),
    });
    const toolCount = agent.tools?.length ?? 0;
    const toolsLabel = allowsAllTools(agent.tools)
        ? intl.formatMessage({ id: "settings.subagents.tools.all" })
        : intl.formatMessage({ id: "settings.subagents.toolsCount" }, { count: String(toolCount) });
    const displayName = agent.source === "plugin" && agent.name.includes(":")
        ? agent.name.slice(agent.name.indexOf(":") + 1)
        : agent.name;
    return (<div data-testid={testId(TID_SUBAGENT_ROW, agent.name)} className={cn("grid cursor-default items-center gap-3 px-4 py-3 transition-colors", rowEditable && "hover:bg-hover", hasModelOverrideControl
            ? "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            : "grid-cols-[auto_minmax(0,1fr)_auto]")} {...settingsResourceRowInteraction(rowEditable ? () => onEdit(agent) : undefined)}>
      <div className="relative shrink-0" aria-hidden="true">
        {pluginIconItem ? (<PluginStoreAvatar item={pluginIconItem} className="size-9 bg-background" fallbackIcon={<Bot className="size-4"/>}/>) : (<div className="flex size-9 items-center justify-center rounded-xl bg-background text-foreground-subtle">
            <Bot className="size-4"/>
          </div>)}
        {agent.color ? (
        // 右下角颜色点之前溢出头像容器，会让列表行视觉高度变高。
        <span className="absolute -bottom-1 -right-1 inline-flex size-3.5 items-center justify-center rounded-full border border-card bg-card p-px leading-none">
            <AgentColorDot color={agent.color}/>
          </span>) : null}
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-ui-base font-medium text-foreground">{displayName}</span>
          {showModelBadge ? <AgentBadge>{modelLabel}</AgentBadge> : null}
          <AgentBadge>{toolsLabel}</AgentBadge>
        </div>
        <p className="mt-0.5 line-clamp-2 text-ui-sm text-foreground-subtle">
          {agent.description || intl.formatMessage({ id: "settings.subagents.noDescription" })}
        </p>
      </div>

      <div className={cn("flex items-center gap-2", hasModelOverrideControl
            ? "col-span-2 min-w-0 justify-end sm:col-span-1 sm:shrink-0"
            : "shrink-0")}>
        {hasModelOverrideControl ? (<SubagentModelOverrideControl agent={agent} disabled={isOperating} modelGroups={modelGroups} modelSelectionView={modelSelectionView} modelSelectionLoading={modelSelectionLoading} onModelOverrideChange={onModelOverrideChange}/>) : null}
        {showEnabledToggle ? (<Switch checked={agent.enabled} onCheckedChange={(enabled) => onToggle(agent, enabled)} disabled={isOperating} aria-label={intl.formatMessage({ id: "settings.subagents.toggleAria" }, { name: agent.name })}/>) : null}
        <div className="flex items-center gap-1">
          {editable ? (<Button type="button" variant="ghost" size="icon-md" onClick={() => void onDelete(agent)} disabled={isOperating} title={intl.formatMessage({ id: "common.delete" })}>
              <Trash2 className="size-3.5" aria-hidden="true"/>
            </Button>) : null}
        </div>
      </div>
    </div>);
}
export function SubagentFormView(props) {
    const { intl, initial, scopeKey, workspaceTabs, onScopeKeyChange, name, setName, nameError, color, setColor, selectedColorIndex, modelSelectGroups, model, modelTriggerLabel, onManageModels, handleModelChange, footerActions, thoughtLevelState, saving, setThoughtLevel, modelError, thoughtLevelInvalid, description, setDescription, descriptionError, inheritAllTools, handleToolsModeChange, selectedTools, toggleTool, systemPrompt, setSystemPrompt, promptError, injectAgentsMd, setInjectAgentsMd, onDelete, canSave, onCancel, handleSubmit } = props;
    return (<form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex justify-end">
        <label className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          <span className="shrink-0 text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: "settings.scope.label" })}
          </span>
          <PluginScopeMenu align="end" disabled={Boolean(initial)} selectedScopeKey={scopeKey} workspaceTabs={workspaceTabs} onScopeKeyChange={onScopeKeyChange}/>
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(12rem,14rem)_auto_minmax(0,1fr)] md:items-start">
        <div className="space-y-1.5">
          <FormFieldLabel>
            {intl.formatMessage({ id: "settings.subagents.form.name.label" })}
          </FormFieldLabel>
          <Input type="text" size="lg" value={name} onChange={(event) => setName(event.target.value)} placeholder={intl.formatMessage({
            id: "settings.subagents.form.name.placeholder",
        })}/>
          {nameError ? <p className="text-ui-base text-destructive">{nameError}</p> : null}
        </div>
        <div className="space-y-1.5">
          <FormFieldLabel>
            {intl.formatMessage({ id: "settings.subagents.form.color.label" })}
          </FormFieldLabel>
          <div role="radiogroup" className="relative inline-grid w-56 grid-cols-8 rounded-lg border border-input-border bg-input p-1">
            <span className="pointer-events-none absolute top-1 size-6 rounded-full border border-border-hover bg-surface shadow-xs transition-[left]" style={{
            left: `calc(0.25rem + ((100% - 0.5rem) / ${AGENT_COLORS.length}) * ${selectedColorIndex})`,
        }} aria-hidden="true"/>
            {AGENT_COLORS.map((option) => (<AntNativeButton key={option} type="button" role="radio" aria-checked={color === option} aria-label={intl.formatMessage({
                id: `settings.subagents.color.${option}`,
            })} className="relative z-10 flex size-6 items-center justify-center rounded-full outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setColor(option)}>
                <span className={cn("size-3.5 rounded-full", COLOR_DOT_CLASS[option])}/>
              </AntNativeButton>))}
          </div>
        </div>
        <div className="space-y-1.5">
          <FormFieldLabel>
            {intl.formatMessage({ id: "settings.subagents.form.model.label" })}
          </FormFieldLabel>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ModelConfigSelect modelGroups={modelSelectGroups} normalizedValue={model} triggerLabel={modelTriggerLabel} showManageModelsAction={Boolean(onManageModels)} lockReasonMessage="" isItemLocked={MODEL_ITEM_NEVER_LOCKED} onValueChange={handleModelChange} footerActions={footerActions} manageModelsLabel={intl.formatMessage({
            id: "chat.toolbar.model.manageModels",
        })} onManageModels={onManageModels} 
    // 聊天工具栏的模型菜单默认向上弹；Subagents add/edit 表单位于设置页正文，
    // 菜单项应贴着按钮下方展开，避免覆盖上面的表单字段。
    contentSide="bottom" focusSelectorOnClose={null} labelVisibilityClassName="inline-flex min-w-0" triggerClassName="h-8 w-fit max-w-full min-w-0 justify-between rounded-lg border border-input-border bg-input bg-clip-border px-3 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input focus-visible:border-input-border-focused focus-visible:bg-input-focused" triggerLabelClassName="inline-flex min-w-0 truncate text-left"/>
            <SubagentReasoningField intl={intl} state={thoughtLevelState} disabled={saving} labelVisibilityClassName="inline-flex min-w-0" onValueCommit={setThoughtLevel}/>
          </div>
          {modelError ? <p className="text-ui-base text-destructive">{modelError}</p> : null}
          {thoughtLevelInvalid ? (<p className="text-ui-base text-destructive">
              {intl.formatMessage({
                id: "settings.subagents.form.validation.thoughtLevelUnavailable",
            })}
            </p>) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <FormFieldLabel>
          {intl.formatMessage({
            id: "settings.subagents.form.description.label",
        })}
        </FormFieldLabel>
        <Input type="text" size="lg" value={description} onChange={(event) => setDescription(event.target.value)} placeholder={intl.formatMessage({
            id: "settings.subagents.form.description.placeholder",
        })}/>
        {descriptionError ? (<p className="text-ui-base text-destructive">{descriptionError}</p>) : null}
      </div>

      <div className="space-y-2 pt-1">
        <FormFieldLabel>
          {intl.formatMessage({ id: "settings.subagents.form.tools.label" })}
        </FormFieldLabel>
        <div className="flex min-w-0 items-center gap-2">
          <Select value={inheritAllTools ? "all" : "custom"} onValueChange={handleToolsModeChange}>
            <SelectTrigger size="lg" className="w-fit justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {intl.formatMessage({
            id: "settings.subagents.form.tools.mode.all",
        })}
              </SelectItem>
              <SelectItem value="custom">
                {intl.formatMessage({
            id: "settings.subagents.form.tools.mode.custom",
        })}
              </SelectItem>
            </SelectContent>
          </Select>
          <span className="min-w-0 text-ui-base font-normal text-foreground-subtle">
            {intl.formatMessage({
            id: "settings.subagents.form.tools.card.title",
        })}
          </span>
        </div>
        {inheritAllTools ? null : (<div className="rounded-lg border border-border bg-card p-1">
            <div className="grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {TOOL_OPTIONS.map((tool) => (<ToolCheckbox key={tool} checked={selectedTools.includes(tool)} disabled={false} label={tool} onToggle={() => toggleTool(tool)}/>))}
            </div>
          </div>)}
      </div>

      <div className="space-y-1.5">
        <FormFieldLabel>
          {intl.formatMessage({
            id: "settings.subagents.form.systemPrompt.label",
        })}
        </FormFieldLabel>
        <SettingsFormTextarea value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={3} className="max-h-56 min-h-16 resize-y overflow-y-auto text-ui-base" placeholder={intl.formatMessage({
            id: "settings.subagents.form.systemPrompt.placeholder",
        })}/>
        {promptError ? <p className="text-ui-base text-destructive">{promptError}</p> : null}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-3 py-2.5">
        <p className="min-w-0 text-ui-base font-medium text-foreground">
          {intl.formatMessage({
            id: "settings.subagents.form.injectAgentsMd.label",
        })}
        </p>
        <Switch checked={injectAgentsMd} onCheckedChange={setInjectAgentsMd} aria-label={intl.formatMessage({
            id: "settings.subagents.form.injectAgentsMd.label",
        })}/>
      </div>

      <SettingsFormActions leadingAction={initial && onDelete ? (<Button type="button" variant="link" size="lg" className="px-0 text-destructive hover:text-destructive" onClick={() => onDelete(initial)} disabled={saving}>
              <Trash2 className="size-3.5" aria-hidden="true"/>
              {intl.formatMessage({ id: "common.delete" })}
            </Button>) : undefined}>
        <Button type="submit" variant="default" size="lg" disabled={!canSave || saving}>
          {saving
            ? intl.formatMessage({ id: "common.saving" })
            : intl.formatMessage({ id: "common.save" })}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={saving}>
          {intl.formatMessage({ id: "common.cancel" })}
        </Button>
      </SettingsFormActions>
    </form>);
}
export { AgentListRow };
