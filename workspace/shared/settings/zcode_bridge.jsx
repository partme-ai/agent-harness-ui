import finderIcon from './provider_icons/finder.png';
import {AntNativeButton,AntNativeInput,AntNativeTextarea,AntNativeSelect} from '../ant_controls.jsx';
// ZCode 展示组件的宿主适配层。这里只管理界面草稿，不连接 ZCode 账号或执行工具。
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Anchor, Robot, Check, CaretDown, CaretRight, CaretUp, CircleDashed, Circle, Cloud, DownloadSimple, ArrowSquareOut, Folder, SpinnerGap, Monitor, DotsThree, Plus, ArrowClockwise, ArrowCounterClockwise, MagnifyingGlass, ShieldCheck, SignIn, Terminal, Trash, User, MagicWand, X, Plug, Brain } from '@phosphor-icons/react';
import messages from './zcode/messages.json';
export { Anchor, Check, CircleDashed, Cloud, Folder, Monitor, Plus, ShieldCheck, Terminal, X };
export { Robot as Bot, Plug as Cable, CaretDown as ChevronDown, CaretRight as ChevronRight, CaretUp as ChevronUpIcon, Circle as CircleIcon, DownloadSimple as Download, ArrowSquareOut as ExternalLink, SpinnerGap as Loader2, SpinnerGap as Loader2Icon, DotsThree as MoreHorizontal, ArrowClockwise as RefreshCcw, ArrowClockwise as RefreshCw, ArrowCounterClockwise as RotateCcw, MagnifyingGlass as Search, SignIn as SquareArrowRightEnter, Trash as Trash2, User as UserRound, MagicWand as WandSparkles };
export { SettingsRow, SettingsGroupCard } from './zcode/SettingsPageParts.jsx';
export const cn = (...values) => values.filter(Boolean).join(' ');
const intl = { formatMessage: ({id,defaultMessage}, values={}) => (messages[id] || defaultMessage || id).replace(/\{(\w+)\}/g,(_,key)=>String(values[key] ?? '')) };
export const useZCodeIntl = () => ({intl,locale:'zh-CN'});
export const testId = (id,value) => `${id}-${value}`;
export const runUserAction = ({operation}) => operation();
export const runUserActionAsync = async ({operation}) => operation();
export const getWorkspaceKey = (workspacePath,identity) => identity?.trim() || workspacePath;
export const isPluginCommand = command => command.source === 'plugin';
export const isUserCommand = command => command.source === 'user';
export const requiresWorkspaceHookTrust = hook => hook.location?.scope === 'project' && hook.trusted !== true;
export const PreviewHost = createContext({openFile:()=>{},unavailable:()=>{}});

export function Button({variant='default',size='default',className='',asChild,children,...props}) {
  const attrs={...props,'data-handled':'true','data-variant':variant,'data-size':size,className:cn('zc-button',className)};
  return asChild ? React.cloneElement(React.Children.only(children),attrs) : <AntNativeButton type="button" {...attrs}>{children}</AntNativeButton>;
}
export function Input({size='default',htmlSize,className='',...props}) {return <AntNativeInput {...props} size={htmlSize} data-size={size} className={cn('zc-input',className)}/>;}
export function Textarea({className='',...props}) {return <AntNativeTextarea {...props} className={cn('zc-textarea',className)}/>;}
export function Switch({checked,onCheckedChange,size='default',className='',...props}) {return <AntNativeButton type="button" data-handled="true" {...props} role="switch" aria-checked={!!checked} data-size={size} className={cn('zc-switch',className)} onClick={event=>{props.onClick?.(event);onCheckedChange?.(!checked)}}><span/></AntNativeButton>;}
export function Badge({variant,className,...props}) {return <span {...props} className={cn('zc-badge',className)}/>;}
export const Label = props => <label {...props}/>;
export const Card = props => <div {...props}/>;
export const CardContent = props => <div {...props}/>;
export const Alert = props => <div role="alert" {...props}/>;
export const AlertDescription = props => <p {...props}/>;
export function ControlHintTooltip({title,children}) {return <span className="zc-tooltip" title={title}>{children}</span>;}

const MenuContext=createContext(null), RadioContext=createContext(null);
export function DropdownMenu({children}) {
  const [open,setOpen]=useState(false); const ref=useRef(null);
  useEffect(()=>{if(!open)return; const close=e=>{if(!ref.current?.contains(e.target))setOpen(false)}; const key=e=>{if(e.key==='Escape'){setOpen(false);ref.current?.querySelector('[aria-haspopup]')?.focus()}};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)}},[open]);
  return <MenuContext.Provider value={{open,setOpen}}><span ref={ref} className="zc-menu">{children}</span></MenuContext.Provider>;
}
export function DropdownMenuTrigger({asChild,children,disabled}) {
  const menu=useContext(MenuContext); const trigger=React.Children.only(children);
  return React.cloneElement(trigger,{disabled:disabled||trigger.props.disabled,'aria-haspopup':'menu','aria-expanded':menu.open,onClick:event=>{trigger.props.onClick?.(event);menu.setOpen(!menu.open)},onKeyDown:event=>{if(event.key==='ArrowDown'){event.preventDefault();menu.setOpen(true);requestAnimationFrame(()=>event.target.parentElement.querySelector('[role=menuitem], [role=menuitemradio]')?.focus())}}});
}
export function DropdownMenuContent({align='start',children,className=''}) {
  const menu=useContext(MenuContext);if(!menu.open)return null;
  return <span role="menu" className={cn('zc-menu-content',align==='end'&&'zc-menu-end',className)} onKeyDown={e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const items=[...e.currentTarget.querySelectorAll('button:not(:disabled)')];const i=items.indexOf(document.activeElement);items[e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus()}}>{children}</span>;
}
export function DropdownMenuItem({children,onSelect,variant,...props}) {const menu=useContext(MenuContext);return <AntNativeButton type="button" data-handled="true" role="menuitem" {...props} onClick={()=>{onSelect?.();menu.setOpen(false)}}>{children}</AntNativeButton>;}
export function DropdownMenuRadioGroup({value,onValueChange,children}) {return <RadioContext.Provider value={{value,onValueChange}}>{children}</RadioContext.Provider>;}
export function DropdownMenuRadioItem({value,children,...props}) {const radio=useContext(RadioContext);const menu=useContext(MenuContext);return <AntNativeButton type="button" role="menuitemradio" aria-checked={radio.value===value} {...props} onClick={()=>{radio.onValueChange(value);menu.setOpen(false)}}>{children}{radio.value===value&&<Check/>}</AntNativeButton>;}
export const DropdownMenuLabel = props => <span className="zc-menu-label" {...props}/>;
export const DropdownMenuSeparator = () => <span className="zc-menu-separator"/>;

// 保留上游 Select 的调用结构，宿主用原生 select 保证键盘和读屏行为。
export const SelectItem=()=>null, SelectContent=()=>null, SelectTrigger=()=>null, SelectValue=()=>null;
function collectOptions(children) {return React.Children.toArray(children).flatMap(child=>!React.isValidElement(child)?[]:child.type===SelectItem?[child]:collectOptions(child.props.children));}
export function Select({value,onValueChange,children,disabled}) {const trigger=React.Children.toArray(children).find(child=>child.type===SelectTrigger);return <AntNativeSelect {...trigger?.props} children={undefined} className={cn('zc-select',trigger?.props.className)} disabled={disabled||trigger?.props.disabled} value={value} aria-label={trigger?.props['aria-label']||trigger?.props.id||'选择选项'} onChange={e=>onValueChange(e.target.value)}>{collectOptions(children).map(item=><option key={item.props.value} value={item.props.value} disabled={item.props.disabled}>{item.props.children}</option>)}</AntNativeSelect>;}
export function PluginStoreAvatar({item,className='',fallbackIcon}) {return <span className={cn('zc-avatar',className)}>{item?.listing?.icon ? <img src={item.listing.icon} alt=""/> : fallbackIcon || <span>{item?.name?.slice(0,2) || 'P'}</span>}</span>;}
export function PluginStoreUpdateBadge({item}) {return item?.updateAvailable?<Badge>可更新</Badge>:null;}
export function PluginStoreUpdateButton({item,actions}) {return item?.updateAvailable?<Button size="sm" variant="ghost" onClick={()=>actions.onUpdate?.(item.id)}>更新</Button>:null;}
export const resolveManagedPluginDisplay = (plugin,item) => ({name:item?.listing?.displayName||plugin.name,description:item?.listing?.description||plugin.description||''});
export function FileDisplayIcon({className}) {return <span className={cn('zc-markdown-icon',className)} aria-hidden="true">M↓</span>;}
export const resolveFileDisplayDescriptor = () => ({fileIconSrc:'markdown'});
export function WorkspaceEditorButtonGroup({workspaceAbsPath}) {const host=useContext(PreviewHost);return <span className="zc-file-actions"><Button variant="outline" aria-label="预览记忆文件" onClick={()=>host.openFile(workspaceAbsPath)}><img src={finderIcon} alt=""/></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" aria-label="文件打开方式"><CaretDown/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>host.openFile(workspaceAbsPath)}>预览</DropdownMenuItem><DropdownMenuItem onSelect={()=>host.openFile(workspaceAbsPath)}>在模拟编辑器中打开</DropdownMenuItem></DropdownMenuContent></DropdownMenu></span>;}
export function McpFailurePresentation({error}) {return <p className="text-destructive text-ui-sm">{error || '连接不可用'}</p>;}
export const resolveMcpFailureMessageId = () => 'settings.mcp.status.errorReason';
export const SUBAGENT_COLORS=['yellow','red','orange','green','cyan','blue','purple','pink'];
export const SUBAGENT_COLOR_CLASS=Object.fromEntries(SUBAGENT_COLORS.map(color=>[color,`zc-color-${color}`]));
export const encodeCustomModelValue = (providerId,modelId) => `${providerId}/${modelId}`;
export const resolveModelDisplayName = (groups,value) => groups.flatMap(group=>group.models||[]).find(model=>model.value===value)?.label || value.split('/').at(-1);
export function ModelConfigSelect({normalizedValue,onValueChange,modelGroups,triggerClassName}) {return <AntNativeSelect className={cn('zc-select',triggerClassName)} aria-label="模型" value={normalizedValue} onChange={e=>onValueChange(e.target.value)}><option value="inherit">继承默认模型</option>{modelGroups.flatMap(g=>g.models||[]).map(model=><option key={model.value} value={model.value}>{model.label}</option>)}</AntNativeSelect>;}
export function SubagentReasoningField({state,onValueCommit,disabled}) {return <span className="zc-reasoning"><Brain/><AntNativeSelect className="zc-select" aria-label="思考档位" disabled={disabled} value={state?.value||''} onChange={e=>onValueCommit(e.target.value)}><option value="">选择思考档位</option>{['low','medium','high'].map(v=><option key={v} value={v}>{({low:'低',medium:'中',high:'高'})[v]}</option>)}</AntNativeSelect></span>;}
export function SubagentModelOverrideControl({agent,onModelOverrideChange,isOperating,modelGroups}) {const value=agent.modelSelection?`${agent.modelSelection.providerId}/${agent.modelSelection.modelId}`:'inherit';return <ModelConfigSelect modelGroups={modelGroups||[]} normalizedValue={value} onValueChange={model=>onModelOverrideChange?.(agent,{model})}/>;}

export * from './zcode/test_ids.js';
