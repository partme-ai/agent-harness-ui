import {Modal as AntModal} from 'antd';
import {AntNativeButton} from '../ant_controls.jsx';
// Adapted from ZCode 29628c9: WebRemoteControlDialog.tsx / BotsDialog/shared.tsx.
// Apache-2.0. QR column follows the user's supplied two-column reference screenshot.
import { useEffect, useRef, useState } from 'react';
import { DeviceMobile, Devices, Robot, X, Plug, ArrowClockwise, Copy } from '@phosphor-icons/react';
import weixinIcon from './channel_icons/weixin.png';
import feishuIcon from './channel_icons/feishu.png';
import telegramIcon from './channel_icons/telegram.png';
import {mockServices} from '../mock/services.js';
import QRCode from './bots_bridge.jsx';
import './mobile_link.css';
import {listExtendedBotChannels} from './channel_catalog_view.js';
import { BotsDialog } from './BotsDialog.jsx';

const entries = [
  {provider:'weixin', title:'微信', icon:weixinIcon, description:'从微信会话打开这个工作区。'},
  {provider:'feishu', title:'飞书', icon:feishuIcon, region:'中国', description:'从飞书打开这个工作区。'},
  {provider:'lark', title:'Lark', icon:feishuIcon, region:'全球', description:'从 Lark 打开这个工作区。'},
  {provider:'telegram', title:'Telegram', icon:telegramIcon, description:'从 Telegram 打开这个工作区。'},
];

export function MobileLinkModal({onClose, onToast,deviceRole='desktop'}) {
  const ref=useRef(null);
  const [phone,setPhone]=useState(()=>(mockServices.getPhone()?.ownerRole===deviceRole?mockServices.getPhone():mockServices.startPhone(deviceRole)));
  const running=phone?.status!=='stopped';
  const [qr,setQr]=useState(null),[qrError,setQrError]=useState('');
  useEffect(()=>{let alive=true;setQr(null);setQrError('');QRCode.toDataURL(phone.url).then(value=>alive&&setQr(value)).catch(e=>alive&&setQrError(e.message));return()=>{alive=false}},[phone.token]);
  useEffect(()=>{const timer=setInterval(()=>setPhone(mockServices.getPhone()),500);return()=>clearInterval(timer)},[]);
  const [botEntry,setBotEntry]=useState(null);
  const [copied,setCopied]=useState(false);
  const openBot=entry=>setBotEntry(entry.provider);
  useEffect(()=>{
    const previous=document.activeElement;
    ref.current?.focus();
    return()=>{if(previous?.isConnected)previous.focus()};
  },[botEntry]);
  function handleKey(event) {
    if(event.key==='Escape'){event.stopPropagation();if(botEntry)setBotEntry(null);else onClose()}
    if(event.key==='Tab'){
      const controls=[...ref.current.querySelectorAll('button:not(:disabled),input,[tabindex="0"]')];
      if(event.shiftKey&&(document.activeElement===controls[0]||document.activeElement===ref.current)){event.preventDefault();controls.at(-1)?.focus()}
      else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0]?.focus()}
    }
  }
  async function copyLink() {
    try {await navigator.clipboard.writeText(phone.url);setCopied(true);onToast?.('已复制模拟连接链接')}
    catch {onToast?.('未能复制链接，请检查剪贴板访问权限')}
  }
  if(botEntry) return <BotsDialog entryProvider={botEntry==='manage'?null:botEntry} onClose={()=>setBotEntry(null)} onToast={onToast}/>;
  return <AntModal open footer={null} closable={false} onCancel={onClose} width={1000} getContainer={()=>document.getElementById('buddy-root')} styles={{body:{padding:0,maxHeight:'calc(100dvh - 60px)',overflow:'auto'}}} centered>
    <section ref={ref} tabIndex={-1} aria-labelledby="buddy-mobile-title" aria-describedby="buddy-mobile-description" className="buddy-mobile-dialog" onKeyDown={handleKey}>
      <AntNativeButton type="button" data-handled="true" className="buddy-mobile-close" aria-label="关闭手机连接" onClick={onClose}><X/></AntNativeButton>
      <header className="buddy-mobile-header"><span className="buddy-mobile-header-icon"><Devices/></span><div><h2 id="buddy-mobile-title">{botEntry?'Bot Channels 配置':'移动端远程控制'}</h2><p id="buddy-mobile-description">{botEntry?'管理当前工作区的聊天机器人。':'扫码或在手机上打开链接，即可远程控制当前工作区。'}</p></div></header>
      {<div className="buddy-mobile-columns">
        <section className="buddy-mobile-panel buddy-mobile-scan">
          <div className="buddy-mobile-panel-heading"><DeviceMobile/><div><h3>手机扫码连接</h3><p>用手机相机扫码，在手机上打开这个工作区。</p></div></div>
          <div className="buddy-mobile-connection">
            <div className="buddy-mobile-status-row"><div><div className="buddy-mobile-status"><strong>{!running?'连接已停止':phone.expiresAt<Date.now()?'链接已过期':phone.status==='connected'?'手机已连接':'等待手机连接'}</strong><span><i/>{!running?'已停止':phone.status==='connected'?'Mock 已连通':'已就绪'}</span></div><p>{running?'用手机扫码，或在手机上打开链接。':'重新开始后，可继续预览扫码连接。'}</p></div><AntNativeButton type="button" data-handled="true" className="buddy-mobile-button" onClick={()=>{if(running)mockServices.stopPhone();else mockServices.startPhone(deviceRole);setPhone(mockServices.getPhone())}}><Plug/>{running?'停止':'重新开始'}</AntNativeButton></div>
            <div className="buddy-mobile-link-row"><p>无法扫码？可以在手机上打开链接。</p><div><AntNativeButton type="button" data-handled="true" className="buddy-mobile-button" disabled={!running} onClick={()=>{setPhone(mockServices.startPhone(deviceRole));setCopied(false)}}><ArrowClockwise/>刷新二维码</AntNativeButton><AntNativeButton type="button" data-handled="true" className="buddy-mobile-button" disabled={!running} onClick={copyLink}><Copy/>{copied?'已复制':'复制链接'}</AntNativeButton></div></div>
          </div>
          <div className="buddy-mobile-qr-area"><div className="buddy-mobile-qr-slot" aria-live="polite">{running?qr?<img className="buddy-mobile-qr" src={qr} alt="手机连接模拟二维码" width="256" height="256"/>:<p>{qrError||'二维码生成中…'}</p>:<p>二维码已停止</p>}</div><small>Mock · 扫码或打开模拟手机页确认连接</small><a data-handled="true" href={running?phone.url:undefined} aria-hidden={!running} tabIndex={running?0:-1} style={{visibility:running?'visible':'hidden'}} target="_blank" rel="noreferrer">打开模拟手机页</a></div>
        </section>
        <section className="buddy-mobile-panel buddy-mobile-channels">
          <div className="buddy-mobile-panel-heading"><Robot/><div><h3>使用 Bot Channel</h3><p>连接聊天 Bot，适合更长时间的移动端访问。</p></div></div>
          <div className="buddy-mobile-channel-list">{entries.map(entry=><AntNativeButton key={entry.provider} type="button" data-handled="true" className="buddy-mobile-channel" onClick={()=>openBot(entry)}>
            <img src={entry.icon} alt=""/>
            <span><span className="buddy-mobile-channel-title"><strong>{entry.title}</strong>{entry.region&&<small>{entry.region}</small>}</span><span className="buddy-mobile-channel-description">{entry.description}</span><strong className="buddy-mobile-channel-action">去 Bot Channels 配置</strong></span>
          </AntNativeButton>)}</div>
          <AntNativeButton type="button" data-handled="true" className="buddy-mobile-button buddy-mobile-manage" onClick={()=>setBotEntry('manage')}><Robot/>机器人管理 · 更多 {listExtendedBotChannels().length} 个平台</AntNativeButton>
        </section>
      </div>}
    </section>
  </AntModal>;
}
