import {AntNativeButton} from '../ant_controls.jsx';
import { useRef, useState } from "react"
import { Globe, Palette, MagnifyingGlassPlus, SignOut, CaretRight, Check, Plus, Minus, CornersOut, UserCircle, PaintBrush } from "@phosphor-icons/react"

// 按 ZCode WorkspaceSidebarFooter 的菜单顺序与子菜单交互适配。
// 邀请好友来自用户提供的桌面截图；主工作区与设置页只渲染这一份组件。
export function SidebarAccountMenu({ menuRef, themeMode, onThemeChange, preferences, onPreferencesChange, onOpenSettings, onOpenAction, onClose }) {
  const [submenu, setSubmenu] = useState(null)
  const triggers = useRef({})
  const focusSibling = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const menu = event.target.closest('[role="menu"]')
    const buttons = [...menu.querySelectorAll(':scope > button:not(:disabled), :scope > .zc-menu-sub > button:not(:disabled)')]
    const index = buttons.indexOf(document.activeElement)
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length
    buttons[next]?.focus()
  }
  const choose = (action) => { action(); onClose() }
  const groups = [
    { id:"locale", label:"界面语言", Icon:Globe, value:preferences.locale, options:[["system","系统默认"],["en-US","English"],["zh-CN","中文简体"]] },
    { id:"theme", label:"颜色主题", Icon:Palette, value:themeMode, options:[["system","系统默认"],["dark","深色主题"],["light","浅色主题"]] },
    { id:"zoom", label:"界面缩放", Icon:MagnifyingGlassPlus },
  ]
  return <div ref={menuRef} id="sidebar-account-popover" className="zc-account-menu" role="menu" aria-label="账号菜单" onKeyDown={focusSibling}>
    <AntNativeButton type="button" data-handled="true" role="menuitem" onClick={() => choose(() => onOpenSettings('account-profile'))}><UserCircle /><span>演示账户 · ID local-demo</span></AntNativeButton>
    <AntNativeButton type="button" data-handled="true" role="menuitem" onClick={() => choose(() => onOpenSettings('account-profile'))}><UserCircle /><span>基础信息</span></AntNativeButton>
    <AntNativeButton type="button" data-handled="true" role="menuitem" onClick={() => choose(() => onOpenSettings('system-theme'))}><PaintBrush /><span>主题</span><small>查看当前主题</small></AntNativeButton>
    <hr role="separator" />
    {groups.map(({id,label,Icon,value,options}) => <div className="zc-menu-sub" key={id} onMouseEnter={() => setSubmenu(id)}>
      <AntNativeButton type="button" data-handled="true" role="menuitem" aria-haspopup="menu" aria-expanded={submenu===id} ref={node => { triggers.current[id]=node }} onClick={() => setSubmenu(id)} onKeyDown={event => { if(event.key==="ArrowRight") { event.preventDefault(); setSubmenu(id); requestAnimationFrame(() => menuRef.current?.querySelector(`[data-submenu="${id}"] button`)?.focus()) } }}><Icon /><span>{label}</span><CaretRight /></AntNativeButton>
      {submenu===id && <div role="menu" aria-label={label} data-submenu={id} className="zc-account-submenu" onKeyDown={event => { if(["ArrowLeft","Escape"].includes(event.key)) { event.preventDefault(); event.stopPropagation(); setSubmenu(null); triggers.current[id]?.focus() } }}>
        {options ? options.map(([option,text]) => <AntNativeButton type="button" data-handled="true" role="menuitemradio" aria-checked={value===option} key={option} onClick={() => choose(() => id==="theme" ? onThemeChange(option) : onPreferencesChange({...preferences,[id]:option}))}><span>{text}</span>{value===option && <Check />}</AntNativeButton>) : <>
          <AntNativeButton type="button" data-handled="true" role="menuitem" disabled={preferences.zoom>=150} onClick={() => onPreferencesChange({...preferences,zoom:Math.min(150,preferences.zoom+10)})}><Plus /><span>放大</span><kbd>⌘ +</kbd></AntNativeButton>
          <AntNativeButton type="button" data-handled="true" role="menuitem" disabled={preferences.zoom<=80} onClick={() => onPreferencesChange({...preferences,zoom:Math.max(80,preferences.zoom-10)})}><Minus /><span>缩小</span><kbd>⌘ −</kbd></AntNativeButton>
          <AntNativeButton type="button" data-handled="true" role="menuitem" onClick={() => onPreferencesChange({...preferences,zoom:100})}><CornersOut /><span>恢复缩放</span><kbd>{preferences.zoom}%</kbd></AntNativeButton>
        </>}
      </div>}
    </div>)}
    <hr role="separator" />
    <AntNativeButton type="button" data-handled="true" role="menuitem" onMouseEnter={() => setSubmenu(null)} onClick={() => choose(() => onOpenAction({title:'注销登录',subtitle:'当前为本地预览，没有真实登录会话；模型与工作区配置不会被清理。',readOnly:true}))}><SignOut /><span>注销登录</span></AntNativeButton>
  </div>
}
