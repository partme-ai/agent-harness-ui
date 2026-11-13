import {Modal as AntModal} from 'antd';
import {AntNativeButton,AntNativeSelect} from '../ant_controls.jsx';
// Buddy host adapter; ZCode markup and messages are imported separately.
import React,{createContext,useContext,useEffect,useRef,useState,useCallback,useMemo} from 'react';
import {Clock,Trash,SpinnerGap,QrCode,Plug,Key,Copy,WarningCircle,ArrowSquareOut,Robot,X} from '@phosphor-icons/react';
import messages from './zcode/messages.json';
import {liveBotsService} from './live_bots_service.js';
import {mockServices} from '../mock/services.js';
import qrcode from 'qrcode-generator';
import botfatherQr from './botfather_qr.png';
export {Clock as Clock3,Trash as Trash2,SpinnerGap as LoaderCircle,SpinnerGap as Loader2,QrCode,Plug as Unlink,Plug as Webhook,Key as KeyRound,Copy,WarningCircle as CircleAlert,ArrowSquareOut as ExternalLink,Robot as Bot};
export {Button,Input,Switch,Select,SelectContent,SelectItem,SelectTrigger,SelectValue,SettingsRow,SettingsGroupCard,cn,Check,Plus} from '../settings/zcode_bridge.jsx';
export {default as WeixinChannelIcon} from './channel_icons/weixin.png';
export {default as FeishuChannelIcon} from './channel_icons/feishu.png';
export {default as TelegramChannelIcon} from './channel_icons/telegram.png';
export {default as DingDingChannelIcon} from './channel_icons/dingding.png';
export {default as DiscordChannelIcon} from './channel_icons/discord.png';
export {default as WeComChannelIcon} from './channel_icons/wecom.png';
export const intl={formatMessage:({id},values={})=>(messages[id]||id).replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??''))};
export const useZCodeIntl=()=>({intl,locale:'zh-CN'});
export const ALL_BOT_WORKSPACES='*',BOT_BIND_CODE_TTL_MS=30000;
export const isFeishuBotProvider=p=>p==='feishu'||p==='lark';
export const getSupportedBotReplyGranularities=p=>isFeishuBotProvider(p)?['streaming_card']:['assistant_changes','assistant_toolcalls_changes','summary_changes'];
export const logger={error:console.error,warn:console.warn,debug:()=>{}};
export const createUuid=()=>crypto.randomUUID();
export const DEFAULT_BOT_REPLY_GRANULARITY='assistant_changes';
export const normalizeBotReplyGranularity=(provider,value)=>getSupportedBotReplyGranularities(provider).includes(value)?value:getSupportedBotReplyGranularities(provider)[0];
export const isImeComposingKeyEvent=({compositionActive,nativeEvent})=>compositionActive||nativeEvent.isComposing||nativeEvent.keyCode===229;
const BotServiceContext=createContext({botsService:liveBotsService,mode:'live'});
export const useServices=()=>useContext(BotServiceContext);
const platform={openExternal:url=>window.open(url,'_blank','noopener,noreferrer')};
export const usePlatform=()=>platform;
export const toast=message=>window.dispatchEvent(new CustomEvent('buddy-mock-toast',{detail:message}));
const ConfirmContext=createContext(null);
export const useConfirmDialog=()=>useContext(ConfirmContext);
export function MockBotHost({children}) {
 const [pending,setPending]=useState(null),[mode,setMode]=useState('mock'),[registration,setRegistration]=useState(null),[binding,setBinding]=useState(null),[message,setMessage]=useState('');
 useEffect(()=>{const show=e=>setMessage(String(e.detail));window.addEventListener('buddy-mock-toast',show);return()=>window.removeEventListener('buddy-mock-toast',show)},[]);
 const active=useRef(null);const ask=useCallback(options=>new Promise(resolve=>{active.current=resolve;setPending(options)}),[]);
 const finish=value=>{active.current?.(value);active.current=null;setPending(null)};useEffect(()=>()=>active.current?.(false),[]);
 const botsService=useMemo(()=>mode==='live'?liveBotsService:{...mockServices.botsService,
   beginWeixinRegistration:async params=>{const r=await mockServices.botsService.beginWeixinRegistration(params);setRegistration(r);setBinding(null);setMessage('等待模拟扫码确认');return r},
   beginFeishuRegistration:async params=>{const r=await mockServices.botsService.beginFeishuRegistration(params);setRegistration(r);setBinding(null);setMessage('等待模拟扫码确认');return r},
   createBindCode:async params=>{const b=await mockServices.botsService.createBindCode(params);setBinding(b);return b},
   removeBotSecret:async id=>{const b=await mockServices.botsService.removeBotSecret(id);setBinding(null);setRegistration(null);return b},
   resetBotState:async id=>{const b=await mockServices.botsService.resetBotState(id);setBinding(null);setRegistration(null);return b},
   deleteBot:async id=>{await mockServices.botsService.deleteBot(id);setBinding(null);setRegistration(null)},
 },[mode]);
 const simulate=fn=>{try{fn();setMessage('Mock · 状态已更新，等待原始组件轮询')}catch(e){setMessage(e.message)}};
 const modeControls=<div className="buddy-bots-simulation" data-handled="true">
  <label>渠道服务<AntNativeSelect aria-label="渠道服务模式" value={mode} onChange={e=>{setMode(e.target.value);setRegistration(null);setBinding(null);setMessage('')}}><option value="mock">Mock 仿真</option><option value="live">真实平台扫码</option></AntNativeSelect></label>
  {mode==='mock'&&registration&&<><AntNativeButton data-handled="true" onClick={()=>simulate(()=>{mockServices.confirmRegistration(registration.token);setRegistration(null)})}>模拟扫码确认</AntNativeButton><AntNativeButton data-handled="true" onClick={()=>simulate(()=>{mockServices.rejectRegistration(registration.token);setRegistration(null)})}>取消模拟扫码</AntNativeButton></>}
  {mode==='mock'&&binding&&<AntNativeButton data-handled="true" onClick={()=>simulate(()=>{mockServices.bind(binding.code);setBinding(null)})}>模拟发送 /bind</AntNativeButton>}
  {mode==='mock'&&<AntNativeButton data-handled="true" onClick={()=>{mockServices.failNext('saveBot');setMessage('下一次配置保存将模拟接口失败；失败后可重试')}}>模拟保存失败</AntNativeButton>}
  <span role="status">{message|| (mode==='mock'?'Mock · 独立配置和模拟消息绑定':'真实扫码认证 · 消息监听与工作区绑定尚未接入')}</span>
 </div>;
 return <BotServiceContext.Provider value={{botsService,mode,modeControls}}><ConfirmContext.Provider value={ask}>{React.cloneElement(children,{key:mode})}{pending&&<AntModal open title={pending.title} onCancel={()=>finish(false)} getContainer={()=>document.getElementById('buddy-root')} footer={<><AntNativeButton onClick={()=>finish(false)}>取消</AntNativeButton><AntNativeButton onClick={()=>finish(true)}>{pending.confirmLabel}</AntNativeButton></>}><p>{pending.description}</p></AntModal>}</ConfirmContext.Provider></BotServiceContext.Provider>;
}
// Telegram QR encodes the public BotFather URL; binding uses the mock service.
export default {toDataURL:async url=>{const qr=qrcode(0,'M');qr.addData(url);qr.make();return qr.createDataURL(4,8)}};
const Context=createContext(null);
export function Dialog({open,onOpenChange,children}){return open?<Context.Provider value={onOpenChange}>{children}</Context.Provider>:null;}
export function DialogContent({children,className='',onEscapeKeyDown}){const {modeControls}=useContext(BotServiceContext);const close=useContext(Context);return <AntModal open footer={null} width={900} getContainer={()=>document.getElementById('buddy-root')} onCancel={()=>close(false)} styles={{body:{maxHeight:'calc(100dvh - 100px)',overflow:'auto'}}}><div className={'buddy-bots-dialog '+className} onKeyDown={event=>{if(event.key==='Escape')onEscapeKeyDown?.(event)}}>{children}{modeControls}</div></AntModal>}
export const DialogHeader=({children})=><header className="buddy-bots-header">{children}</header>;
export const DialogTitle=({children,className})=><h2 className={className}>{children}</h2>;
export const DialogDescription=({children,className})=><p className={className}>{children.replace('ZCode','Agent Harness UI')}</p>;
