import React, {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ConfigProvider,Button,Select,Modal,theme as antTheme} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {useDeviceWorkspace,DeviceWorkspacePanels} from './DeviceWorkspace.jsx';
import {Workbench,IconAction} from './Workbench.jsx';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {ScanOutlined} from '@ant-design/icons';
import {PhoneLinkScan} from './channels/PhoneLinkScan.jsx';
import {SETTINGS_GROUPS,settingsGroupsForDevice} from './settings/settings_config.js';
import {CONSOLE_SECTIONS,consolePath,modelSettingsParent,modelSettingsTabs,modelSettingsActiveTab} from './settings/harness_sections.js';
import {DeviceMobile,GearSix,CaretDown,X,Question} from '@phosphor-icons/react';
import {BuddySettingsSidebar,BuddySettingsCenter,SettingsNavigationIcon} from './settings/SettingsCenter.jsx';
import {SidebarAccountMenu} from './settings/SidebarAccountMenu.jsx';
import {MobileLinkModal} from './channels/MobileLinkModal.jsx';
import {PairingPage} from './mock/PairingPage.jsx';
import './styles/styles.css';
import './styles/controls.css';
import './settings/usage/usage.css';
import './settings/pad_layout.css';
import './surfium_desktop.css';
import './baseline.css';
import './zcode/generated.css';
import './zcode/adaptation.css';
import './harness_integration.css';

const hostMessage = data => {if(window.parent!==window)window.parent.postMessage(data,location.origin);};
function WorkspaceApp(){
 const entry=new URLSearchParams(location.search),entrySurface=entry.get('surface')||(entry.has('section')?'settings':'home');
 const [section,setSection]=useState(entry.get('section')||'general'),[settings,setSettings]=useState(entrySurface==='settings'),[mobile,setMobile]=useState(entrySurface==='mobile'),[account,setAccount]=useState(false),[themeMode,setThemeMode]=useState(entry.get('theme')==='dark'?'dark':'light'),[systemDark,setSystemDark]=useState(matchMedia('(prefers-color-scheme: dark)').matches),[preferences,setPreferences]=useState({locale:'zh-CN',mode:'coding',zoom:100}),[toast,setToast]=useState(''),[action,setAction]=useState(null),[pair,setPair]=useState(null);
 const [sidebarWidth,setSidebarWidth]=useState(264);
 const [consoleModels,setConsoleModels]=useState(null);
 const [page,setPage]=useState(['settings','mobile'].includes(entrySurface)?'home':entrySurface),[sharedDraft,setSharedDraft]=useState('');
 const [viewStyle,setViewStyle]=useState('zcode'),[viewportWidth,setViewportWidth]=useState(innerWidth);
 const adminRef=useRef(null),canvasRef=useRef(null),initialAdminPath=useRef(consolePath(entry.get('section'))||'#/w/demo/home');
 const [adminRect,setAdminRect]=useState({left:0,top:0,width:0,height:0});
 const deviceRole=document.documentElement.dataset.device||new URLSearchParams(location.search).get('device');
 const isPhone=deviceRole==='phone'||(!deviceRole&&viewportWidth<600);
 const isDesktop=deviceRole==='desktop'||(!deviceRole&&viewportWidth>=1100);
 const settingsDevice=isPhone?'phone':isDesktop?'desktop':'tablet';
 const modelTabs=modelSettingsTabs(section),activeModelTab=modelSettingsActiveTab(section);
 useEffect(()=>{const path=consolePath(section);if(path&&adminRef.current?.contentWindow)adminRef.current.contentWindow.location.hash=path;},[section]);
 useEffect(()=>{const receive=event=>{if(event.origin===location.origin&&event.source===adminRef.current?.contentWindow&&event.data?.type==='harness-models'&&Array.isArray(event.data.models))setConsoleModels(event.data.models)};addEventListener('message',receive);return()=>removeEventListener('message',receive)},[]);
 useLayoutEffect(()=>{if(!settings||!canvasRef.current)return;const canvas=canvasRef.current;const update=()=>{const {left,top,width,height}=canvas.getBoundingClientRect();setAdminRect({left,top,width,height})};update();const observer=new ResizeObserver(update);observer.observe(canvas);return()=>observer.disconnect();},[settings,section,sidebarWidth,viewportWidth]);
 const deviceWorkspace=useDeviceWorkspace(settingsDevice);
 useEffect(()=>{if(entrySurface==='work'){deviceWorkspace.setKind('work');deviceWorkspace.setSession(`work-${settingsDevice}`)}},[]);
 function reviewBinding(token,session){setMobile(false);setPair(null);window.SURFIUM_PAIR=null;deviceWorkspace.setBindingRequest({token,deviceId:session.ownerRole||'desktop'})}
 const linkLabel=isPhone?'扫码连接 Pad／桌面':'手机联动';
 const linkIcon=isPhone?<ScanOutlined/>:<DeviceMobile/>;
 const composerReturnDraft=useRef(null),accountMenuRef=useRef(null),accountFooterRef=useRef(null);
 const toastTimer=useRef(null),mobileTrigger=useRef(null),settingsTrigger=useRef(null);
 const linkEntry=<IconAction label={linkLabel} icon={linkIcon} onClick={()=>openMobile()}/>;
 const theme=themeMode==='system'?(systemDark?'dark':'light'):themeMode;
 const shellStyle={"--interface-scale":preferences.zoom/100,...(isDesktop?{"--primary-sidebar-width":`${sidebarWidth}px`,"--settings-sidebar-width":`${sidebarWidth}px`,...(settings?{gridTemplateColumns:`${sidebarWidth}px minmax(0,1fr)`,columnGap:3}:{})}:{})};
 function showToast(value){setToast(value);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),4000);}
 function changeTheme(mode){setThemeMode(mode);hostMessage({type:'surfium-buddy-theme',dark:mode==='dark'||(mode==='system'&&systemDark)});}
 function navigate(next,draft=''){setSharedDraft(draft);setPage(next);setSettings(false);setMobile(false);hostMessage({type:'surfium-buddy-surface',surface:next,draft});}
 function closeSurface(){setMobile(false);setAccount(false);const draft=composerReturnDraft.current;composerReturnDraft.current=null;navigate(draft!==null?'new':page,draft||'');}
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.body.dataset.theme=theme;},[theme]);
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)'),change=()=>setSystemDark(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{
   function receive(event){
    if(event.source!==window.parent||event.origin!==location.origin||event.data?.type!=='surfium-buddy-state')return;
    const value=event.data;if(value.draft!==undefined)setSharedDraft(value.draft);if(value.section)setSection(value.section);if(value.style)setViewStyle(value.style);
    if(value.surface==='settings'){setSettings(true);setMobile(false)}
    else if(value.surface==='mobile'){setMobile(true)}
    else if(value.surface){if(value.surface==='work'){deviceWorkspace.setKind('work');deviceWorkspace.setSession(`work-${settingsDevice}`)}setPage(value.surface);setSettings(false);setMobile(false)}
    if((value.dark?'dark':'light')!==document.documentElement.dataset.theme)setThemeMode(value.dark?'dark':'light');
   }
   function pairing(event){const anchor=event.target.closest('a');if(!anchor)return;let params;try{params=new URL(anchor.href).searchParams;}catch{return;}if(!params.get('mockPair'))return;event.preventDefault();window.SURFIUM_PAIR=params;setPair(params.toString());}
   addEventListener('message',receive);document.addEventListener('click',pairing,true);hostMessage({type:'surfium-buddy-ready'});
   return()=>{removeEventListener('message',receive);document.removeEventListener('click',pairing,true);clearTimeout(toastTimer.current);};
 },[]);
 useEffect(()=>{function observe(){hostMessage({type:'surfium-buddy-observation',theme:document.documentElement.dataset.theme,heading:document.querySelector('.zs-header h1')?.textContent||'',navigation:Array.from(document.querySelectorAll('.zs-sidebar nav button')).map(button=>button.getAttribute('aria-label')),mobile:!!document.getElementById('buddy-mobile-title'),qr:!!document.querySelector('.buddy-mobile-qr'),settings:!!document.querySelector('.zs-center')});}const observer=new MutationObserver(observe);observer.observe(document.getElementById('buddy-root'),{subtree:true,childList:true,attributes:true});observe();return()=>observer.disconnect();},[]);
 function openSettings(next=section,draft){if(typeof draft==='string')composerReturnDraft.current=draft;setSection(next);setSettings(true);setAccount(false);hostMessage({type:'surfium-buddy-navigation',section:next});hostMessage({type:'surfium-buddy-surface',surface:'settings'});}
 function openMobile(){setAccount(false);setMobile(true);hostMessage({type:'surfium-buddy-surface',surface:'mobile'});}
 useEffect(()=>{const resize=()=>{setViewportWidth(innerWidth);setSidebarWidth(w=>Math.max(264,Math.min(innerWidth*.5,w)))};addEventListener('resize',resize);return()=>removeEventListener('resize',resize)},[]);
 useEffect(()=>{if(!account)return;const dismiss=event=>{if(!accountFooterRef.current?.contains(event.target))setAccount(false)};const key=event=>{if(event.key==='Escape'){setAccount(false);accountFooterRef.current?.querySelector('[aria-label="工作区账号菜单"]')?.focus()}};document.addEventListener('pointerdown',dismiss);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',key)}},[account]);
 const footer=<footer ref={accountFooterRef} className="surfium-utility-footer"><div className="surfium-utility-row"><Button className="surfium-account-trigger" aria-label="工作区账号菜单" aria-expanded={account} onClick={()=>setAccount(!account)}><span className="surfium-avatar">{isDesktop?'A':'S'}</span><span>{isDesktop?'演示账户':'本地工作区'}</span><CaretDown/></Button><Button ref={mobileTrigger} aria-label={linkLabel} title={linkLabel} onClick={openMobile}>{linkIcon}</Button><Button ref={settingsTrigger} aria-label="设置" title="设置" aria-pressed={settings} onClick={()=>settings?closeSurface():openSettings()}><GearSix/></Button></div>{account&&<SidebarAccountMenu menuRef={accountMenuRef} themeMode={themeMode} onThemeChange={changeTheme} preferences={preferences} onPreferencesChange={setPreferences} onOpenSettings={openSettings} onOpenAction={setAction} onClose={()=>setAccount(false)}/>}</footer>;
 return <ConfigProvider button={{autoInsertSpace:false}} locale={zhCN} componentSize={isPhone?'small':'middle'} theme={{algorithm:theme==='dark'?antTheme.darkAlgorithm:antTheme.defaultAlgorithm,token:{fontSize:14,borderRadius:8,colorPrimary:viewStyle==='buddy'?'#278575':'#527ff5'}}}><div data-style={viewStyle} className={`app-shell aligned-shell shell-settings shell-device-${settingsDevice} theme-${theme}`} style={shellStyle} data-theme={theme}>
  {settings?<><BuddySettingsSidebar device={settingsDevice} section={section} setSection={next=>{setSection(next);hostMessage({type:'surfium-buddy-navigation',section:next})}} onBack={closeSurface} footer={footer}/><main className="workspace"><div className="settings-window-bar"><IconAction label="返回工作区" icon={<ArrowLeftOutlined/>} onClick={closeSurface}/><Select virtual={false} className="mobile-settings-selector" aria-label="设置页面" value={modelSettingsParent(section)||section} onChange={next=>{setSection(next);hostMessage({type:"surfium-buddy-navigation",section:next})}} options={settingsGroupsForDevice(settingsDevice).flatMap(g=>g.items.map(([value,label,icon])=>({value,label:<span className="settings-navigation-label"><SettingsNavigationIcon name={icon}/><span>{label}</span></span>})))}/><span className="surfium-preview-status">Agent Harness UI · 设置</span>{linkEntry}<Button aria-label="帮助与反馈" onClick={()=>setSection('about')}><Question/></Button></div><div className={`settings-canvas ${CONSOLE_SECTIONS[section]?'harness-console-canvas':''}`}>{CONSOLE_SECTIONS[section]?<>{modelTabs&&<nav className="harness-model-tabs" role="tablist" aria-label={`${modelSettingsParent(section)==='local-model'?'本地模型':'模型网关'}配置`}>{modelTabs.map(tab=><button key={tab.id} type="button" role="tab" aria-selected={activeModelTab===tab.id} className={activeModelTab===tab.id?'active':''} onClick={()=>{setSection(tab.id);hostMessage({type:'surfium-buddy-navigation',section:tab.id})}}>{tab.label}</button>)}</nav>}<div className="harness-console-anchor" ref={canvasRef}/></>:<BuddySettingsCenter onBrowsePlugins={action=>navigate('plugins',typeof action==='string'?action:'')} device={settingsDevice} section={section} setSection={next=>{setSection(next);hostMessage({type:'surfium-buddy-navigation',section:next})}} theme={theme} themeMode={themeMode} onThemeChange={changeTheme} interfacePreferences={preferences} onInterfacePreferencesChange={setPreferences}/>}</div></main></>:<Workbench consoleModels={consoleModels} deviceWorkspace={deviceWorkspace} sidebarWidth={sidebarWidth} onSidebarWidthChange={setSidebarWidth} accountFooter={footer} initialDraft={sharedDraft} page={page} isPhone={isPhone} isDesktop={isDesktop} onNavigate={navigate} onSettings={openSettings} linkEntry={linkEntry}/>}
  <iframe ref={adminRef} className="harness-admin-frame harness-persistent-admin" title="Agent Harness UI 配置页面" src={`/admin.html?device=${settingsDevice==='phone'?'mobile':settingsDevice}&embed=1${initialAdminPath.current}`} onLoad={()=>{const path=consolePath(section);if(path&&adminRef.current?.contentWindow)adminRef.current.contentWindow.location.hash=path}} style={{display:settings&&CONSOLE_SECTIONS[section]?'block':'none',...adminRect}}/>
  <DeviceWorkspacePanels workspace={deviceWorkspace}/>{mobile&&(isPhone?<PhoneLinkScan onBindingReview={reviewBinding} onClose={()=>{setMobile(false);hostMessage({type:'surfium-buddy-surface',surface:settings?'settings':page})}}/>:<MobileLinkModal deviceRole={settingsDevice} onClose={()=>{setMobile(false);mobileTrigger.current?.focus();hostMessage({type:'surfium-buddy-surface',surface:settings?'settings':page});}} onToast={showToast}/>)}
  {pair&&<Modal open title="模拟手机确认" width={500} getContainer={()=>document.getElementById('buddy-root')} onCancel={()=>{setPair(null);window.SURFIUM_PAIR=null}} footer={<Button onClick={()=>{setPair(null);window.SURFIUM_PAIR=null}}>返回手机联动</Button>}><PairingPage onBindingReview={reviewBinding}/></Modal>}
  {action&&<div className="zs-modal-backdrop"><section className="zs-modal" role="dialog" aria-modal="true" aria-label={action.title}><header><h2>{action.title}</h2><Button aria-label="关闭说明" onClick={()=>setAction(null)}><X/></Button></header><p>{action.subtitle}</p><p>开发预览：此操作未连接真实账户或运行服务。</p><Button onClick={()=>setAction(null)}>关闭</Button></section></div>}
  {toast&&<div className="toast" role="status">{toast}</div>}
 </div></ConfigProvider>;
}
function PhonePairingReview(){const workspace=useDeviceWorkspace('phone');return <><PairingPage onBindingReview={(token,session)=>workspace.setBindingRequest({token,deviceId:session.ownerRole||'desktop'})}/><DeviceWorkspacePanels workspace={workspace}/></>}
export function mountWorkspace(device){
 if(device)document.documentElement.dataset.device=device;
 createRoot(document.getElementById('buddy-root')).render(new URLSearchParams(location.search).has('mockPair')?<ConfigProvider button={{autoInsertSpace:false}}><PhonePairingReview/></ConfigProvider>:<WorkspaceApp/>);

}
