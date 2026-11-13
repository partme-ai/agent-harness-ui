import {usePluginResources,pluginOperation,refreshPluginRuntime} from '../plugin_runtime.js';
import {deviceControlLabel,settingsGroupsForDevice} from './settings_config.js';
import {modelSettingsParent} from './harness_sections.js';
import {EXTRA_SECTIONS,ExtraSections} from './ExtraSections.jsx';
import {Modal as AntModal, Select as AntSelect} from 'antd';
import {AntNativeButton,AntNativeInput,AntNativeTextarea,AntNativeSelect} from '../ant_controls.jsx';
import {SourceUsage} from './usage/SourceUsage.jsx'
import {JsonExportDialog} from '../mock/JsonExportDialog.jsx'
import {useMockState} from '../mock/use_mock_state.js'
import {mockServices} from '../mock/services.js'
import { SourceResources, SourceMemory } from './SourceSettings.jsx'
import { createCatalogSamples } from './resource_catalog.js'
import { createProviderSamples } from './settings_samples.js'
import { isValidElement, useEffect, useRef, useState } from "react"
import { SlidersHorizontal, Palette, Cube, Globe, Keyboard, Brain, Robot, PuzzlePiece, Plug, Sparkle, Terminal, Anchor, ChartBar, ArrowLeft, ArrowRight, MagnifyingGlass, X, Plus, Check, CaretRight, ArrowCounterClockwise, Sun, Moon, Monitor, FileText, Folder, Info, Rocket, Question, PencilSimple, ShieldCheck } from "@phosphor-icons/react"
import { SETTINGS_GROUPS, SETTINGS_LABELS, GENERAL_GROUPS, GENERAL_DEFAULTS, RESOURCE_CONFIG, PROVIDERS, SHORTCUTS } from "./settings_config.js"
import { PREFERENCES_KEY, normalizePreferences, validateEndpoint, recordShortcut } from "./settings_state.js"
import providerLogo0 from "./provider_icons/logo-bigmodel.svg"
import providerLogo1 from "./provider_icons/model-provider-start-plan.png"
import providerLogo2 from "./provider_icons/model-provider-openai.png"
import providerLogo3 from "./provider_icons/model-provider-anthropic.png"
import providerLogo4 from "./provider_icons/model-provider-deepseek.png"
import "./settings.css"

const ICONS = { SlidersHorizontal, Palette, Cube, Globe, Keyboard, Brain, Robot, PuzzlePiece, Plug, Sparkle, Terminal, Anchor, ChartBar, Monitor, ShieldCheck }
export function SettingsNavigationIcon({name}) {
  const Icon=ICONS[name] || SlidersHorizontal
  return <Icon size={16} aria-hidden="true" />
}
const aliases = { modelProvider: "models", subagents: "agents", plugin: "plugins", skill: "skills", platforms: "general", data: "general" }
const resolveSection = section => aliases[section] || section
function Btn({ children, primary, className = "", ...props }) { return <AntNativeButton type="button" data-handled="true" data-size={props['aria-label'] && isValidElement(children) ? 'icon' : 'default'} className={`zs-button ${primary ? "primary" : ""} ${className}`} {...props}>{children}</AntNativeButton> }
function Badge({ children }) { return <span className="zs-badge">{children}</span> }
function Notice({ children, error = false }) { return <div className={`zs-notice ${error ? "error" : ""}`} role={error ? "alert" : "note"}><Info /><span>{children}</span></div> }
function Search({ value, onChange, placeholder }) { return <div className="zs-search"><MagnifyingGlass /><AntNativeInput type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} />{value && <Btn aria-label="清除搜索" onClick={() => onChange("")}><X /></Btn>}</div> }
function Select({ label, value, onChange, options, disabled }) { return <AntNativeSelect aria-label={label} value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={typeof option === "string" ? option : option[0]} value={typeof option === "string" ? option : option[0]}>{typeof option === "string" ? option : option[1]}</option>)}</AntNativeSelect> }
function Switch({ label, value, onChange, disabled }) { return <AntNativeButton type="button" data-handled="true" role="switch" aria-label={label} aria-checked={value} disabled={disabled} className={`zs-switch ${value ? "on" : ""}`} onClick={() => onChange(!value)}><span /></AntNativeButton> }
function Row({ label, description, children, detail }) { return <div className="zs-row"><div className="zs-row-main"><div><strong>{label}</strong>{description && <p>{description}</p>}</div><div className="zs-control">{children}</div></div>{detail && <div className="zs-row-detail">{detail}</div>}</div> }
function Group({ title, description, children, actions }) { return <section className="zs-group"><div className="zs-group-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{actions}</div><div className="zs-group-card">{children}</div></section> }
function Empty({ title, children, action, Icon = Folder }) { return <div className="zs-empty"><Icon /><h3>{title}</h3><p>{children}</p>{action}</div> }
function Modal({ title, children, onClose, footer }) {
 return <AntModal open title={title} onCancel={onClose} footer={footer || <Btn onClick={onClose}>关闭</Btn>} width={640} getContainer={()=>document.getElementById('buddy-root')} styles={{body:{maxHeight:'calc(100dvh - 180px)',overflow:'auto'}}}>{children}</AntModal>
}

export function BuddySettingsSidebar({ section, setSection, onBack, footer, collapsed, device="desktop" }) {
  const current = modelSettingsParent(section) || resolveSection(section)
  return <aside className={`settings-design-sidebar zs-sidebar unified-sidebar ${collapsed ? "is-collapsed" : ""}`}>
    <div className="zs-sidebar-head"><Btn onClick={onBack} aria-label="返回工作区" title={collapsed ? "返回工作区" : undefined}><ArrowLeft /><span>返回工作区</span></Btn></div>
    <nav aria-label="设置导航">
      {settingsGroupsForDevice(device).map(group => <div className="zs-nav-group" key={group.title}>
        <h3>{group.title}</h3>
        {group.items.map(([id, name, icon]) => {
          const Icon = ICONS[icon] || SlidersHorizontal
          return <AntNativeButton type="button" data-handled="true" key={id} aria-label={name} title={collapsed ? name : undefined} aria-current={current === id ? "page" : undefined} className={current === id ? "active" : ""} onClick={() => setSection(id)}><Icon /><span>{name}</span></AntNativeButton>
        })}
      </div>)}
    </nav>
    {footer}
  </aside>
}

function General({ values, onChange, interfacePreferences, onInterfacePreferencesChange, device="desktop" }) {
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")
  const [draft,setDraft]=useState(values)
  return <><div className="zs-general-groups">{GENERAL_GROUPS.map(group => <div className="zs-group-card" key={group.title}>{group.rows.map(([id,label,description,type,,options]) => <Row key={id} label={label} description={description}>
    {id === "language" ? <Select label={label} value={interfacePreferences.locale} options={[["system","系统默认"],["en-US","English"],["zh-CN","中文简体"]]} onChange={locale => onInterfacePreferencesChange({...interfacePreferences,locale})} />
    : id === "mode" ? <Select label={label} value={interfacePreferences.mode} options={[["coding","编程模式"],["office","办公模式"]]} onChange={mode => onInterfacePreferencesChange({...interfacePreferences,mode})} />
    : type === "switch" ? <Switch label={label} value={values[id]} disabled={id === "sound" && !values.notifications} onChange={value => onChange({...values,[id]:value})} />
    : type === "select" ? <Select label={label} value={values[id]} options={options} disabled={id === "archiveDays" && !values.autoArchive} onChange={value => onChange({...values,[id]:value})} />
    : <div className="zs-field-save"><AntNativeInput aria-label={label} value={draft[id]} placeholder={options} onChange={event => setDraft({...draft,[id]:event.target.value})} /><Btn onClick={() => { const issue = id === "proxy" && draft.proxy ? validateEndpoint(draft.proxy) : ""; setError(issue); if(!issue){onChange({...values,[id]:draft[id]});setSaved(label)} }}>保存</Btn></div>}
  </Row>)}</div>)}</div>{error && <Notice error>{error}</Notice>}<p className="zs-footnote" role="status">{saved ? `${saved}已保存到模拟服务。` : "Mock 模式 · 配置已持久保存。"} 语言和模式为界面偏好，完整本地化与业务模式切换待接入。</p></>
}

function Appearance({ theme, themeMode, onThemeChange, preferences, setPreferences, storageError }) {
  const update = patch => setPreferences({...preferences,...patch})
  const sample = '{\n  "name": "Agent Harness UI",\n  "workspace": "local",\n  "theme": "system"\n}'
  return <>{storageError && <Notice error>{storageError}</Notice>}
    <Group title="界面设置" description="设置应用主题和界面文字大小。">
      <Row label="界面主题" description="选择跟随系统，或始终使用深色、浅色主题。"><Select label="界面主题" value={themeMode} options={[["system","系统默认"],["dark","深色主题"],["light","浅色主题"]]} onChange={onThemeChange} /></Row>
      <Row label="界面字号" description="调整设置界面的文字大小。"><AntNativeInput type="number" min="12" max="18" aria-label="界面字号" value={preferences.fontSize} onChange={event => update({fontSize:Number(event.target.value)})} /></Row>
    </Group>
    <Group title="代码设置" description="设置代码内容的主题、字号和显示方式，不受界面字号影响。">
      <Row label="浅色代码主题"><Select label="浅色代码主题" value={preferences.lightCode} options={[["github","GitHub Light"],["quiet","简洁浅色"]]} onChange={lightCode=>update({lightCode})}/></Row>
      <Row label="深色代码主题"><Select label="深色代码主题" value={preferences.darkCode} options={[["github","GitHub Dark"],["quiet","简洁深色"]]} onChange={darkCode=>update({darkCode})}/></Row>
      <Row label="显示行号"><Switch label="显示行号" value={preferences.lineNumbers} onChange={lineNumbers=>update({lineNumbers})}/></Row>
      <Row label="自动换行"><Switch label="自动换行" value={preferences.wrapCode} onChange={wrapCode=>update({wrapCode})}/></Row>
      <Row label="代码字号"><AntNativeInput type="number" min="12" max="18" aria-label="代码字号" value={preferences.codeSize} onChange={event=>update({codeSize:Number(event.target.value)})}/></Row>
    </Group>
    <div className="zs-preview-heading"><h2>效果预览</h2></div><div className="zs-code-previews">{[["light","浅色预览"],["dark","深色预览"]].map(([mode,label])=><section key={mode} className={`zs-code-preview ${mode}`}><header><strong>{label}</strong><Badge>{theme===mode?"当前主题":label}</Badge></header><CodePreview text={sample} preferences={preferences} theme={mode}/></section>)}</div>
  </>
}

function CodePreview({ text, preferences, theme }) {
  return <pre className={`zs-code ${preferences.wrapCode ? "wrap" : ""} code-${theme === "dark" ? preferences.darkCode : preferences.lightCode}`} style={{ fontSize: preferences.codeSize }}>{text.split("\n").map((line, i) => <span key={i}>{preferences.lineNumbers && <i>{i + 1}</i>}<code>{line || " "}</code></span>)}</pre>
}

const providerLogos = {"bigmodel":providerLogo0,"start-plan":providerLogo1,"openai":providerLogo2,"anthropic":providerLogo3,"deepseek":providerLogo4}
function ProviderMark({ provider, large=false }) { return <span className={`zs-provider-mark ${large?"large":""}`}>{providerLogos[provider.id] ? <img src={providerLogos[provider.id]} alt=""/> : <Cube/>}</span> }

function Models({providers,setProviders,device}) {
 const [selected,setSelected]=useState(providers[0]?.id),[editor,setEditor]=useState(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[modelEditor,setModelEditor]=useState(null),[removing,setRemoving]=useState(null),[credential,setCredential]=useState('');
 const provider=providers.find(p=>p.id===selected)||providers[0];
 const selectProvider=id=>{setSelected(id);setEditor(null);setModelEditor(null);setMessage('');setError('')};
 const update=patch=>setProviders(old=>old.map(p=>p.id===provider.id?{...p,...patch}:p));
 async function operation(action,fn){if(busy)return;setBusy(true);setError('');try{await mockServices.perform(action);setMessage('Mock · 操作已完成');fn?.()}catch(e){setError(e.message)}finally{setBusy(false)}}
 function saveProvider(){const issue=!editor.name.trim()?'请输入供应商名称':validateEndpoint(editor.endpoint);if(issue)return setError(issue);if(providers.some(p=>p.id!==editor.id&&p.name.toLowerCase()===editor.name.trim().toLowerCase()))return setError('供应商名称已存在');const {key,...fields}=editor;const next={...fields,name:fields.name.trim(),id:fields.id||crypto.randomUUID(),models:fields.models||[],enabledModels:fields.enabledModels||{},connected:!!key||fields.connected};setProviders(old=>fields.id?old.map(p=>p.id===fields.id?next:p):[...old,next]);setSelected(next.id);setEditor(null);setError('');setMessage('模拟配置已保存；输入的密钥未落盘')}
 function saveModel(){const name=modelEditor.name.trim();if(!name)return setError('请输入模型 ID');if(!Number.isFinite(Number(modelEditor.contextWindow))||Number(modelEditor.contextWindow)<=0)return setError('上下文窗口必须为正数');if(provider.models.some(m=>m===name&&m!==modelEditor.original))return setError('模型 ID 已存在');const enabledModels={...provider.enabledModels};delete enabledModels[modelEditor.original];enabledModels[name]=modelEditor.enabled;update({models:modelEditor.original?provider.models.map(m=>m===modelEditor.original?name:m):[...provider.models,name],enabledModels,modelMetadata:{...provider.modelMetadata,[name]:{contextWindow:Number(modelEditor.contextWindow)||128000,vision:modelEditor.vision}}});setModelEditor(null);setError('')}
 return <div className="zs-model-section"><div className="zs-section-toolbar"><p>管理模型供应商及模型。Mock 服务不会连接真实账号。</p><div className="zs-actions"><Btn aria-label="刷新供应商" disabled={busy} onClick={()=>operation('refreshProviders',()=>setProviders(mockServices.read('providers',providers)))}><ArrowCounterClockwise/></Btn><Btn primary onClick={()=>{setEditor({name:'',endpoint:'',protocol:'OpenAI 兼容',group:'自定义供应商'});setError('')}}><Plus/>添加供应商</Btn></div></div><div className={`zs-provider-layout ${device==='phone'?'zs-provider-layout-phone':''}`}>{device==='phone'?<div className="zs-provider-picker"><AntSelect aria-label="模型供应商" className="zs-provider-select" value={provider?.id} onChange={selectProvider} virtual={false} placeholder="选择供应商" options={providers.map(p=>({value:p.id,label:<span className="zs-provider-option"><ProviderMark provider={p}/><span>{p.name}</span></span>}))}/></div>:<nav aria-label="模型供应商列表">{['智谱','自定义供应商'].map(group=><div className="zs-provider-group" key={group}><h3>{group}</h3>{providers.filter(p=>p.group===group).map(p=><AntNativeButton key={p.id} className={p.id===selected?'selected':''} onClick={()=>selectProvider(p.id)}><ProviderMark provider={p}/><span>{p.name}</span>{p.connected&&<Badge>Mock</Badge>}</AntNativeButton>)}</div>)}</nav>}<section className="zs-provider-detail">{editor?<div className="zs-provider-editor"><h2>{editor.id?'编辑供应商':'添加供应商'}</h2>{!editor.id&&<Select label="供应商模板" value="" options={[["","选择供应商模板"],...PROVIDERS.map(p=>[p.id,p.name])]} onChange={id=>{const p=PROVIDERS.find(p=>p.id===id);if(p)setEditor({...p,name:providers.some(i=>i.name===p.name)?`${p.name} 2`:p.name,id:undefined,models:[],group:'自定义供应商'})}}/>}<label>名称<AntNativeInput aria-label="供应商名称" value={editor.name} onChange={e=>setEditor({...editor,name:e.target.value})}/></label><label>API 类型<Select label="API 类型" value={editor.protocol} options={['OpenAI 兼容','Anthropic']} onChange={protocol=>setEditor({...editor,protocol})}/></label><label>API 地址<AntNativeInput aria-label="API 地址" value={editor.endpoint} onChange={e=>setEditor({...editor,endpoint:e.target.value})}/></label><label>API Key<AntNativeInput aria-label="API Key" type="password" autoComplete="off" placeholder="请输入模拟密钥；不会保存密钥" value={editor.key||''} onChange={e=>setEditor({...editor,key:e.target.value})}/></label><div className="zs-actions"><Btn onClick={()=>{setEditor(null);setError('')}}>取消</Btn><Btn primary onClick={saveProvider}>保存</Btn></div></div>:provider?<><div className="zs-provider-title"><ProviderMark provider={provider} large/><h2>{provider.name}</h2></div><div className="zs-provider-connection"><div><strong>{provider.connected?'Mock · 已连接':'连接供应商'}</strong><p>{provider.connected?'模拟账号 · 5 小时剩余 85% · 每周剩余 97%':'填写模拟凭据，体验连接和测试流程。'}</p></div>{provider.connected?<Btn onClick={()=>{update({connected:false});setMessage('模拟账号已断开')}}>断开连接</Btn>:<Btn onClick={()=>{setCredential('');setEditor({...provider,key:''});setError('')}}>连接</Btn>}</div><div className="zs-provider-fields"><label>API 地址<code>{provider.endpoint}</code></label><label>API 类型<span>{provider.protocol}</span></label></div><div className="zs-actions"><Btn onClick={()=>setEditor({...provider,key:''})}><PencilSimple/>编辑配置</Btn><Btn disabled={busy} onClick={()=>{const issue=validateEndpoint(provider.endpoint);if(issue)return setError(issue);operation('testProvider',()=>{if(!provider.connected){setMessage('');setError('请先连接供应商');return}setMessage('Mock · 连接测试成功，延迟 120 ms')})}}>测试连接</Btn><Btn onClick={()=>setRemoving({type:'provider',name:provider.name})}>删除供应商</Btn></div><div className="zs-models-heading"><h3>模型列表</h3><Btn onClick={()=>{setModelEditor({name:'',enabled:true,contextWindow:128000,vision:false});setError('')}}><Plus/>添加模型</Btn></div><div className="zs-model-list">{provider.models.map(model=><div key={model}><strong>{model}</strong><Badge>{provider.modelMetadata?.[model]?.contextWindow||128000}</Badge><Btn aria-label={`编辑模型 ${model}`} onClick={()=>{setModelEditor({original:model,name:model,enabled:provider.enabledModels?.[model]??true,contextWindow:provider.modelMetadata?.[model]?.contextWindow||128000,vision:provider.modelMetadata?.[model]?.vision??false});setError('')}}><PencilSimple/></Btn><Btn aria-label={`删除模型 ${model}`} onClick={()=>setRemoving({type:'model',name:model})}><X/></Btn><Switch label={`启用模型 ${model}`} value={provider.enabledModels?.[model]??true} onChange={enabled=>update({enabledModels:{...provider.enabledModels,[model]:enabled}})}/></div>)}</div>{!provider.models.length&&<p className="zs-model-empty">尚未配置模型</p>}</>:<Empty title="尚未配置供应商">添加一个供应商开始配置。</Empty>}{message&&<p role="status">{message}</p>}{error&&<Notice error>{error}</Notice>}</section></div>
 {modelEditor&&<Modal title={modelEditor.original?'编辑模型':'添加模型'} onClose={()=>{setModelEditor(null);setError('')}} footer={<><Btn onClick={()=>setModelEditor(null)}>取消</Btn><Btn primary onClick={saveModel}>保存</Btn></>}><label>模型 ID<AntNativeInput aria-label="模型 ID" value={modelEditor.name} onChange={e=>setModelEditor({...modelEditor,name:e.target.value})}/></label><label>上下文窗口<AntNativeInput type="number" min="1" aria-label="上下文窗口" value={modelEditor.contextWindow} onChange={e=>setModelEditor({...modelEditor,contextWindow:e.target.value})}/></label><Switch label="支持视觉" value={modelEditor.vision} onChange={vision=>setModelEditor({...modelEditor,vision})}/>{error&&<Notice error>{error}</Notice>}</Modal>}
 {removing&&<Modal title={`删除${removing.type==='model'?'模型':'供应商'}`} onClose={()=>setRemoving(null)} footer={<><Btn onClick={()=>setRemoving(null)}>取消</Btn><Btn primary onClick={()=>{if(removing.type==='model'){const enabledModels={...provider.enabledModels};delete enabledModels[removing.name];update({models:provider.models.filter(m=>m!==removing.name),enabledModels})}else{setProviders(old=>old.filter(p=>p.id!==provider.id));setSelected(providers.find(p=>p.id!==provider.id)?.id)}setRemoving(null)}}>删除</Btn></>}><p>删除「{removing.name}」及相关模拟配置？</p></Modal>}
 <p className="zs-footnote">Mock 模式 · 配置持久保存，连接与额度为模拟结果。凭据输入不会落盘或发送。</p></div>
}

function BrowserSettings(){const [state,setState,error]=useMockState('browser',{enabled:false,insecure:false,cookies:0,cache:0}),[pending,setPending]=useState(null),[confirm,setConfirm]=useState(false),[message,setMessage]=useState('');async function operate(action){if(pending)return;setPending(action);try{await mockServices.perform(action);setState(old=>action==='importBrowserData'?{...old,cookies:24,cache:128}:action==='clearBrowserCache'?{...old,cache:0}:{...old,cookies:0,cache:0});setMessage(action==='importBrowserData'?'Mock · 已导入 24 个 Cookie、128 MB 缓存':action==='clearBrowserCache'?'Mock · 缓存已清除，登录数据保留':'Mock · 浏览器数据已清空')}catch(e){setMessage(e.message)}finally{setPending(null);setConfirm(false)}}return <><div className="zs-group-card"><Row label="启用浏览器控制" description="由模拟平台服务提供启停状态。"><Switch label="启用浏览器控制" value={state.enabled} onChange={enabled=>setState({...state,enabled})}/></Row></div><Group title="安全"><Row label="忽略证书错误" description="仅修改模拟配置，不降低真实浏览器安全策略。"><Switch label="忽略证书错误" value={state.insecure} onChange={insecure=>setState({...state,insecure})}/></Row></Group><Group title="浏览器数据" description={`${state.cookies} 个模拟 Cookie · ${state.cache} MB 模拟缓存`}><Row label="导入浏览器数据" description="模拟从 Chrome 导入数据，不读取本机浏览器文件。"><Btn disabled={!!pending} onClick={()=>operate('importBrowserData')}>{pending==='importBrowserData'?'导入中…':'导入'}</Btn></Row><Row label="清除缓存" description="保留 Cookie 与登录状态。"><Btn disabled={!!pending} onClick={()=>operate('clearBrowserCache')}>清除缓存</Btn></Row><Row label="清除所有数据" description="清除模拟缓存、Cookie 与登录状态。"><Btn disabled={!!pending} onClick={()=>setConfirm(true)}>清除所有数据</Btn></Row></Group>{(message||error)&&<Notice error={!!error}>{error||message}</Notice>}{confirm&&<Modal title="清除所有浏览器数据？" onClose={()=>setConfirm(false)} footer={<><Btn onClick={()=>setConfirm(false)}>取消</Btn><Btn primary disabled={!!pending} onClick={()=>operate('clearAllBrowserData')}>确认清除</Btn></>}><p>此操作不可恢复，仅清空模拟浏览器数据。</p></Modal>}</>}
function ComputerSettings({device}){const control=deviceControlLabel(device),target=device==='phone'?'手机':device==='tablet'?'平板':'电脑';const [state,setState,error]=useMockState('computer',{enabled:false,showButton:false});return <><div className="zs-group-card"><Row label={`启用${control}`} description={`开启后激活模拟${control}与工具状态。`}><Switch label={`启用${control}`} value={state.enabled} onChange={enabled=>setState({...state,enabled})}/></Row><Row label={`在输入框显示${target}操作按钮`} description={`启用${control}后，可显示操作入口。`}><Switch label={`在输入框显示${target}操作按钮`} disabled={!state.enabled} value={state.showButton} onChange={showButton=>setState({...state,showButton})}/></Row></div>{error&&<Notice error>{error}</Notice>}<p className="zs-footnote">Mock · {control}{state.enabled?'已启用':'已停用'}；不会获取或操作真实设备。</p></>}

function Shortcuts({ bindings, setBindings }) {
  const [query, setQuery] = useState("")
  const [recording, setRecording] = useState(null)
  const [error, setError] = useState("")
  const format = binding => binding.replaceAll("Mod", "⌘ / Ctrl").split("+")
  return <><div className="zs-toolbar"><Search value={query} onChange={setQuery} placeholder="搜索操作或快捷键" /><Btn onClick={() => { setBindings(Object.fromEntries(SHORTCUTS.map(([id,, key]) => [id, key]))); setRecording(null); setError("") }}><ArrowCounterClockwise />恢复默认</Btn></div><Notice>可录入并检查键位冲突；键位在当前浏览器保存；系统级快捷键由 mock 服务模拟注册。</Notice>{error && <Notice error>{error}</Notice>}<Group title="应用快捷键" description="点击键位开始录入，按 Esc 取消。">{SHORTCUTS.filter(([id, label]) => `${label} ${bindings[id]}`.toLowerCase().includes(query.toLowerCase().trim())).map(([id, label]) => <Row key={id} label={label}><AntNativeButton type="button" data-handled="true" className={`zs-keybinding ${recording === id ? "recording" : ""}`} aria-label={`设置快捷键 ${label}`} onClick={() => { setRecording(id); setError("") }} onBlur={() => setRecording(null)} onKeyDown={event => {
    if (recording !== id) return
    if (event.key === "Tab") { setRecording(null); return }
    event.preventDefault(); event.stopPropagation()
    if (event.key === "Escape") { setRecording(null); setError(""); return }
    const result = recordShortcut(event, bindings, id)
    if (result.error) setError(result.error)
    if (result.binding) { setBindings({ ...bindings, [id]: result.binding }); setRecording(null); setError("") }
  }}>{recording === id ? "请按组合键…" : format(bindings[id]).map((key, index) => <kbd key={index}>{key}</kbd>)}</AntNativeButton></Row>)}</Group>{!SHORTCUTS.some(([id, label]) => `${label} ${bindings[id]}`.toLowerCase().includes(query.toLowerCase().trim())) && <Empty title="没有匹配的快捷键">尝试按操作名称搜索。</Empty>}</>
}


function Guide({ setSection }) { return <Group title="准备你的工作环境" description="按需完成配置，之后回到工作区开始任务。">{[["models", "配置模型供应商", "准备连接地址与模型，通过 mock 服务体验认证。"], ["appearance", "调整界面外观", "选择主题与代码预览样式。"], ["agents", "查看智能体", "定义专用角色和工作方法。"], ["mcp", "配置工具连接", "为智能体准备需要的工具。"], ["memory", "了解工作区记忆", "查看记忆如何按工作区组织。"]].map(([id, label, description], index) => <Row key={id} label={`${index + 1}. ${label}`} description={description}><Btn onClick={() => setSection(id)}>前往设置<ArrowRight /></Btn></Row>)}</Group> }
function Help(){const [feedback,setFeedback]=useState(''),[message,setMessage]=useState(''),[pending,setPending]=useState(false);return <><Group title="关于 Agent Harness UI"><Row label="你的智能体伴侣" description="设置和手机绑定使用 ZCode 交互与本地 mock 服务。"><Badge>v0.1</Badge></Row><Row label="设置保存范围" description="所有模拟配置保存到当前浏览器；输入的认证密钥不会落盘。"><ShieldCheck size={22}/></Row></Group><Group title="帮助与反馈"><Row label="反馈内容" description="提交到本地模拟反馈服务，不上传外部平台。"><AntNativeTextarea aria-label="反馈内容" value={feedback} onChange={e=>setFeedback(e.target.value)} rows={4}/></Row><Row label="提交反馈"><Btn primary disabled={pending||!feedback.trim()} onClick={async()=>{setPending(true);try{const result=await mockServices.perform('submitFeedback',values=>{const receipt={id:crypto.randomUUID(),content:feedback.trim(),createdAt:Date.now()};values.feedback=[...(values.feedback||[]),receipt];return receipt});setMessage(`Mock · 已提交反馈，回执 ${result.id.slice(0,8)}`);setFeedback('')}catch(e){setMessage(e.message)}finally{setPending(false)}}}>{pending?'提交中…':'提交反馈'}</Btn></Row></Group>{message&&<Notice>{message}</Notice>}<Group title="常见问题">{[['模拟连接是否连接真实平台？','没有。扫码、账号、额度、MCP 和平台控制都由本地 mock 服务返回。'],['如何保留配置？','切换主界面或刷新页面后，配置仍保存在当前浏览器。'],['如何使用手机连接？','点击手机入口，打开模拟手机页确认授权，桌面会收到模拟连接状态。']].map(([title,text])=><details key={title}><summary>{title}</summary><p>{text}</p></details>)}</Group></>}

export function BuddySettingsCenter({ onBrowsePlugins, section, setSection, theme, themeMode, onThemeChange, interfacePreferences, onInterfacePreferencesChange, device="desktop" }) {
  const current = resolveSection(section)
  const [general, setGeneral, generalError] = useMockState('general',()=>({...GENERAL_DEFAULTS}))
  const [resources, setResources, resourceError, pluginRuntime] = usePluginResources()
  const [pluginTab, setPluginTab] = useState("plugins")
  const [providers, setProviders, providerError] = useMockState('providers',createProviderSamples)
  const [bindings, setBindings, bindingError] = useMockState('bindings',() => Object.fromEntries(SHORTCUTS.map(([id,, key]) => [id, key])))
  const [storageError, setStorageError] = useState("")
  const [preferences, updatePreferences] = useState(() => { try { return normalizePreferences(JSON.parse(localStorage.getItem(PREFERENCES_KEY))) } catch { return normalizePreferences(null) } })
  const ref = useRef(null)
  useEffect(() => { ref.current?.scrollTo(0, 0) }, [current])
  const setPreferences = next => {
    const normalized = normalizePreferences(next)
    updatePreferences(normalized)
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(normalized)); setStorageError("") }
    catch { setStorageError("无法保存界面偏好，请检查浏览器是否允许本地存储。") }
  }
  let content
  if (current === "general") content = <General values={general} onChange={setGeneral} {...{interfacePreferences,onInterfacePreferencesChange}} />
  else if (current === "appearance") content = <Appearance {...{ theme, themeMode, onThemeChange, preferences, setPreferences, storageError }} />
  else if (current === "models") content = <Models providers={providers} setProviders={setProviders} device={device} />
  else if (current === "plugins") content = <SourceResources key={`plugins-${pluginTab}`} kind={pluginTab} onBrowsePlugins={onBrowsePlugins} {...{resources,setResources,preferences,theme,pluginTab,setPluginTab}} />
  else if (RESOURCE_CONFIG[current]) content = <SourceResources key={current} kind={current} {...{ resources, setResources, preferences, theme }} />
  else if (current === "memory") content = <SourceMemory />
  else if (current === "browser") content = <BrowserSettings />
  else if (current === "computer") content = <ComputerSettings device={device} />
  else if (current === "shortcuts") content = <Shortcuts {...{ bindings, setBindings }} />
  else if (current === "usage") content = <SourceUsage />
  else if (current === "guide") content = <Guide setSection={setSection} />
  else if (EXTRA_SECTIONS.has(current)) content = <ExtraSections key={current} section={current} general={general} setGeneral={setGeneral} />
  else content = <Help />
  return <div className="zs-center" ref={ref} style={{ "--settings-font-size": `${preferences.fontSize}px` }}><div className="zs-content">{(generalError||resourceError||providerError||bindingError)&&<Notice error>{generalError||resourceError||providerError||bindingError}</Notice>}{current !== "usage" && <header className="zs-header"><h1>{(current === "computer" ? deviceControlLabel(device) : SETTINGS_LABELS[current]) || (current === "guide" ? "引导" : "帮助与反馈")}</h1></header>}{content}</div></div>
}
