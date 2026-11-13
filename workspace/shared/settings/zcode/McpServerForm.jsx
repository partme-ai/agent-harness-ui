import {AntNativeButton} from '../../ant_controls.jsx';
// Adapted from ZCode 29628c9: settings/McpServerForm.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { useEffect, useRef, useState } from "react";
import { Button } from '../zcode_bridge.jsx';
import { Input } from '../zcode_bridge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../zcode_bridge.jsx';
import { useZCodeIntl } from '../zcode_bridge.jsx';
import { PluginScopeMenu } from './PluginScopeMenu.jsx';
import { SettingsFormTextarea } from './SettingsFormTextarea.jsx';
import { SettingsFormActions } from './SettingsFormActions.jsx';
import { ChevronDown, ChevronUpIcon as ChevronUp, Trash2 } from '../zcode_bridge.jsx';
import { EMPTY_FORM, formToJsonDraft, jsonDraftToForm, serverToForm, } from './mcpSettingsShared.js';
function McpFormFieldLabel({ children }) {
    return (<label className="mb-1 block text-ui-base font-medium text-foreground-subtle">{children}</label>);
}
function McpScopeMenu({ disabled, scopeKey, workspaceTabs, onChange, }) {
    const { intl } = useZCodeIntl();
    const scopeLabel = intl.formatMessage({ id: "settings.scope.label" });
    return (<label className="flex min-w-0 flex-wrap items-center justify-end gap-2">
      <span className="shrink-0 text-ui-base text-foreground-subtle">{scopeLabel}</span>
      <PluginScopeMenu align="end" disabled={disabled} selectedScopeKey={scopeKey} workspaceTabs={workspaceTabs} onScopeKeyChange={onChange}/>
    </label>);
}
export function McpServerForm({ initial, editingId, editorMode, onEditorModeChange, onSave, onCancel, onDelete, scopeKey, workspaceTabs, onScopeKeyChange, }) {
    const { intl } = useZCodeIntl();
    const initialForm = initial
        ? serverToForm(initial)
        : {
            ...EMPTY_FORM,
            storageLevel: scopeKey === "user" ? "user" : "workspace",
        };
    const [form, setForm] = useState(initialForm);
    const [jsonDraft, setJsonDraft] = useState(() => formToJsonDraft(initialForm));
    const [jsonError, setJsonError] = useState(null);
    const [showEnv, setShowEnv] = useState(false);
    const formRef = useRef(form);
    const jsonDraftRef = useRef(jsonDraft);
    const previousEditorModeRef = useRef(editorMode);
    useEffect(() => {
        formRef.current = form;
    }, [form]);
    useEffect(() => {
        jsonDraftRef.current = jsonDraft;
    }, [jsonDraft]);
    useEffect(() => {
        const previousMode = previousEditorModeRef.current;
        if (previousMode === editorMode) {
            return;
        }
        if (editorMode === "json") {
            setJsonDraft(formToJsonDraft(formRef.current));
            setJsonError(null);
            previousEditorModeRef.current = editorMode;
            return;
        }
        try {
            const parsedForm = jsonDraftToForm(jsonDraftRef.current, formRef.current);
            setForm(parsedForm);
            setJsonError(null);
            previousEditorModeRef.current = editorMode;
        }
        catch (error) {
            setJsonError(error instanceof Error
                ? error.message
                : intl.formatMessage({ id: "settings.mcp.form.jsonParseError" }));
            onEditorModeChange(previousMode);
        }
    }, [editorMode, intl, onEditorModeChange]);
    function update(patch) {
        setForm((prev) => {
            const next = { ...prev, ...patch };
            if (editorMode === "json") {
                setJsonDraft(formToJsonDraft(next));
            }
            return next;
        });
    }
    function handleSaveClick() {
        if (editorMode === "json") {
            try {
                const parsedForm = jsonDraftToForm(jsonDraft, form);
                setForm(parsedForm);
                setJsonError(null);
                onSave(parsedForm, initial);
            }
            catch (error) {
                setJsonError(error instanceof Error
                    ? error.message
                    : intl.formatMessage({ id: "settings.mcp.form.jsonParseError" }));
            }
            return;
        }
        onSave(form, initial);
    }
    const canSave = (() => {
        if (editorMode !== "json") {
            return Boolean(form.name.trim() && (form.type === "stdio" ? form.command.trim() : form.url.trim()));
        }
        if (!jsonDraft.trim())
            return false;
        try {
            const parsedForm = jsonDraftToForm(jsonDraft, form);
            return Boolean(parsedForm.name.trim() &&
                (parsedForm.type === "stdio" ? parsedForm.command.trim() : parsedForm.url.trim()));
        }
        catch {
            return false;
        }
    })();
    const envToggleLabel = form.type === "stdio"
        ? intl.formatMessage({ id: "settings.mcp.form.envOptional" })
        : intl.formatMessage({ id: "settings.mcp.form.headersOptional" });
    const envValue = form.type === "stdio" ? form.env : form.headers;
    const envPlaceholder = form.type === "stdio"
        ? '{\n  "MY_API_KEY": "your-key"\n}'
        : '{\n  "Authorization": "Bearer your-token"\n}';
    const updateEnvValue = (value) => update(form.type === "stdio" ? { env: value } : { headers: value });
    // Radix Select 不接受空串 value；用 "auto" 作为哨兵值：表单里空串 = 未设置 = auto
    // （配置文件不落多余字段），用户显式选 auto 时同样写回空串。
    const updateProtocolVersion = (value) => update({ protocolVersion: value === "auto" ? "" : value });
    const scopeSelect = (<McpScopeMenu disabled={!!initial} scopeKey={scopeKey} workspaceTabs={workspaceTabs} onChange={(nextScopeKey) => {
            update({
                storageLevel: nextScopeKey === "user" ? "user" : "workspace",
            });
            onScopeKeyChange(nextScopeKey);
        }}/>);
    return (<div className="space-y-4 rounded-xl border border-border p-4">
      {editorMode === "json" ? (<div className="space-y-3">
          <div className="flex justify-end">{scopeSelect}</div>
          <div className="space-y-1.5">
            <McpFormFieldLabel>
              {intl.formatMessage({ id: "settings.mcp.form.fullConfig" })}
            </McpFormFieldLabel>
            <SettingsFormTextarea rows={16} className="font-mono text-ui-base" placeholder={'{\n  "my-mcp-server": {\n    "type": "http",\n    "url": "https://example.com/mcp"\n  }\n}'} value={jsonDraft} onChange={(e) => {
                setJsonDraft(e.target.value);
                if (jsonError) {
                    setJsonError(null);
                }
            }}/>
            <p className="text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintPrefix" })}{" "}
              <code>{`{"server-name": {...}}`}</code>{" "}
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintMiddle" })}{" "}
              <code>{`{"mcpServers": {"server-name": {...}}}`}</code>
              {intl.formatMessage({ id: "settings.mcp.form.pasteHintSuffix" })}
            </p>
            {jsonError && <p className="text-ui-base text-destructive">{jsonError}</p>}
          </div>
        </div>) : (<div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="w-full min-w-0 space-y-1.5 md:w-48">
              <McpFormFieldLabel>
                {intl.formatMessage({ id: "settings.mcp.form.name" })}
              </McpFormFieldLabel>
              <Input size="lg" placeholder="my-mcp-server" value={form.name} disabled={!!editingId} onChange={(e) => update({ name: e.target.value })}/>
            </div>
            <div>{scopeSelect}</div>
          </div>

          <div className="space-y-1.5">
            <McpFormFieldLabel>
              {intl.formatMessage({ id: "settings.mcp.form.type" })}
            </McpFormFieldLabel>
            <Select value={form.type} onValueChange={(v) => update({ type: v })}>
              <SelectTrigger size="lg" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stdio">
                  {intl.formatMessage({ id: "settings.mcp.form.type.stdio" })}
                </SelectItem>
                <SelectItem value="http">HTTP</SelectItem>
                {/*
              Streamable HTTP 传输类型未启用。
              <SelectItem value="streamableHttp">Streamable HTTP</SelectItem>
            */}
                <SelectItem value="sse">
                  {intl.formatMessage({ id: "settings.mcp.form.type.sse" })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1.5 md:w-48">
            <McpFormFieldLabel>
              {intl.formatMessage({ id: "settings.mcp.form.timeoutMs" })}
            </McpFormFieldLabel>
            <Input size="lg" type="number" min={1} inputMode="numeric" placeholder="30000" value={form.timeoutMs} onChange={(e) => update({ timeoutMs: e.target.value })}/>
          </div>

          {/*
              sse 形态不渲染该字段：deprecated SSE transport 固定走 legacy 协商，
              该配置对其无效。
            */}
          {form.type !== "sse" && (<div className="w-full space-y-1.5 md:w-48">
              <McpFormFieldLabel>
                {intl.formatMessage({ id: "settings.mcp.form.protocolVersion" })}
              </McpFormFieldLabel>
              <Select value={form.protocolVersion || "auto"} onValueChange={updateProtocolVersion}>
                <SelectTrigger size="lg" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    {intl.formatMessage({ id: "settings.mcp.form.protocolVersion.auto" })}
                  </SelectItem>
                  <SelectItem value="legacy">
                    {intl.formatMessage({ id: "settings.mcp.form.protocolVersion.legacy" })}
                  </SelectItem>
                  {/* 显示名用「v2」，但 value 必须保持协议正式版本号 " "（config/wire 值，不可随文案变）*/}
                  <SelectItem value="2026-07-28">
                    {intl.formatMessage({ id: "settings.mcp.form.protocolVersion.modern" })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>)}

          {form.type === "stdio" ? (<>
              <div className="space-y-1.5">
                <McpFormFieldLabel>
                  {intl.formatMessage({ id: "settings.mcp.form.command" })}
                </McpFormFieldLabel>
                <Input size="lg" placeholder="npx" value={form.command} onChange={(e) => update({ command: e.target.value })}/>
              </div>
              <div className="space-y-1.5">
                <McpFormFieldLabel>
                  {intl.formatMessage({ id: "settings.mcp.form.args" })}
                </McpFormFieldLabel>
                <Input size="lg" placeholder="-y @modelcontextprotocol/server-memory" value={form.args} onChange={(e) => update({ args: e.target.value })}/>
              </div>
            </>) : (<div className="space-y-1.5">
              <McpFormFieldLabel>URL</McpFormFieldLabel>
              <Input size="lg" placeholder="https://mcp.example.com/mcp" value={form.url} onChange={(e) => update({ url: e.target.value })}/>
            </div>)}

          <div>
            <AntNativeButton type="button" className="flex items-center gap-1 text-ui-base text-foreground-subtle hover:text-foreground" onClick={() => setShowEnv((v) => !v)}>
              {showEnv ? <ChevronUp className="size-3.5"/> : <ChevronDown className="size-3.5"/>}
              {envToggleLabel}
            </AntNativeButton>
            {showEnv && (<div className="mt-2 space-y-1.5">
                <SettingsFormTextarea rows={4} className="font-mono text-ui-base" placeholder={envPlaceholder} value={envValue} onChange={(e) => updateEnvValue(e.target.value)}/>
              </div>)}
          </div>
        </div>)}

      <SettingsFormActions leadingAction={initial && onDelete ? (<Button type="button" variant="link" size="lg" className="px-0 text-destructive hover:text-destructive" onClick={() => onDelete(initial)}>
              <Trash2 className="size-3.5" aria-hidden="true"/>
              {intl.formatMessage({ id: "common.delete" })}
            </Button>) : undefined}>
        <Button size="lg" disabled={!canSave} onClick={handleSaveClick}>
          {intl.formatMessage({ id: "common.save" })}
        </Button>
        <Button variant="ghost" size="lg" onClick={onCancel}>
          {intl.formatMessage({ id: "common.cancel" })}
        </Button>
      </SettingsFormActions>
    </div>);
}
