import React,{useEffect,useRef,useState} from 'react';
import {Alert,Button,Input,Modal,Space} from 'antd';
import {ScanOutlined} from '@ant-design/icons';
import {BotsDialog} from './BotsDialog.jsx';
import {mockServices} from '../mock/services.js';

export function PhoneLinkScan({onClose,onBindingReview}){
 const [bots,setBots]=useState(false);
 const [link,setLink]=useState(''),[target,setTarget]=useState(null),[error,setError]=useState(''),[connected,setConnected]=useState(false),[scanning,setScanning]=useState(false);
 const video=useRef(null),stream=useRef(null),timer=useRef(null),alive=useRef(true);
 function stop(){clearTimeout(timer.current);stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;setScanning(false)}
 useEffect(()=>()=>{alive.current=false;clearTimeout(timer.current);stream.current?.getTracks().forEach(track=>track.stop())},[]);
 function inspect(value){try{const url=new URL(value);if(url.origin!==location.origin||url.searchParams.get('mockPair')!=='phone')throw new Error('请扫描 Pad 或桌面展示的 Agent Link 连接码');const token=url.searchParams.get('token');const session=mockServices.inspectPair('phone',token);setTarget({token,session});setError('');setConnected(false);stop()}catch(e){setTarget(null);setError(e.message)}}
 async function start(){setError('');if(!navigator.mediaDevices?.getUserMedia||!window.BarcodeDetector){setError('当前浏览器不支持二维码扫描，请粘贴 Pad／桌面的连接链接；原生端由系统扫码能力提供。');return}
 try{const detector=new window.BarcodeDetector({formats:['qr_code']});const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});if(!alive.current){media.getTracks().forEach(track=>track.stop());return}stream.current=media;setScanning(true);video.current.srcObject=media;await video.current.play();async function detect(){if(!alive.current||!stream.current)return;try{const codes=await detector.detect(video.current);if(!alive.current||!stream.current)return;if(codes.length){setLink(codes[0].rawValue);inspect(codes[0].rawValue);return}}catch{if(!alive.current)return}timer.current=setTimeout(detect,200)}detect()}catch(e){stop();setError(e.name==='NotAllowedError'?'相机权限未授予，可改用连接链接。':'无法启动相机，请检查设备或改用连接链接。')}}
 if(bots)return <BotsDialog onClose={()=>setBots(false)}/>;
 return <Modal open title="Agent Link · 扫码连接" onCancel={onClose} footer={null} width={440} getContainer={()=>document.getElementById('buddy-root')} styles={{body:{maxHeight:'calc(100dvh - 160px)',overflow:'auto'}}}>
 <Button onClick={()=>{stop();setBots(true)}}>机器人管理</Button>
 <p>扫描 Pad 或桌面的连接二维码，经确认后连接该工作区。</p>
 <div className="agent-link-scanner"><video ref={video} playsInline muted hidden={!scanning}/>{!scanning&&<ScanOutlined style={{fontSize:56,color:'#527ff5'}}/>}</div>
 <Space wrap><Button icon={<ScanOutlined/>} onClick={start} disabled={scanning}>打开相机扫码</Button>{scanning&&<Button onClick={stop}>停止扫描</Button>}</Space>
 <p style={{marginTop:20}}>也可粘贴 Pad／桌面提供的连接链接</p><Input.TextArea aria-label="Agent Link 连接链接" value={link} onChange={e=>{setLink(e.target.value);setTarget(null);setConnected(false)}} autoSize={{minRows:2,maxRows:4}}/>
 <Button style={{marginTop:12}} disabled={!link.trim()} onClick={()=>inspect(link.trim())}>识别连接</Button>
 {error&&<Alert style={{marginTop:12}} type="error" showIcon title={error}/>}
 {target&&!connected&&<Alert style={{marginTop:12}} type="info" title="已识别演示工作区" description="确认连接此 Pad／桌面工作区？" action={<Button onClick={()=>{try{if(onBindingReview){onBindingReview(target.token,mockServices.inspectPair('phone',target.token));return}mockServices.connectPhone(target.token);setConnected(true);setError('')}catch(e){setTarget(null);setError(e.message)}}}>确认连接</Button>}/>}
 {connected&&<Alert style={{marginTop:12}} type="success" showIcon title="演示工作区已连接"/>}
 <p style={{fontSize:12,color:'#7d8390',marginTop:16}}>当前仅验证本地演示配对，真实 Agent Link 服务待接入。</p>
 </Modal>;
}
