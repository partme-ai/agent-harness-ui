import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ConfigProvider,Button,Select,Switch,Space,Segmented,theme as antTheme} from 'antd';
import {ExportOutlined} from '@ant-design/icons';
import {SETTINGS_GROUPS} from './shared/settings/settings_config.js';
import {DEVICE_PRESETS,resolveDeviceViewport} from './device_presets.js';
import {readCompareState,writeCompareState} from './compare_state.js';
import './compare.css';

const devices=[{id:'phone',label:'Mobile'},{id:'tablet',label:'Tablet'},{id:'desktop',label:'Desktop'}];

function CanvasRuler({length,vertical=false}){
 const ticks=Array.from({length:Math.ceil(length/10)+1},(_,i)=>i*10);
 return <svg className={vertical?'canvas-ruler vertical':'canvas-ruler horizontal'} width={vertical?24:length} height={vertical?length:24} aria-label={vertical?'纵向标尺，画布像素':'横向标尺，画布像素'}>
 {ticks.map(value=><g key={value}>{vertical?<line x1={value%100===0?10:value%50===0?15:19} x2="24" y1={value} y2={value}/>:<line x1={value} x2={value} y1={value%100===0?10:value%50===0?15:19} y2="24"/>}{value%100===0&&(vertical?<text transform={`translate(8 ${value+3}) rotate(-90)`}>{value}</text>:<text x={value+4} y="10">{value}</text>)}</g>)}
 </svg>;
}

function Compare(){
 const [controls,setControls]=useState(readCompareState);
 const [draft,setDraft]=useState('');
 const [storageError,setStorageError]=useState(false);
 const frames=useRef({});
 const current=useRef({});
 const {section,dark,style,surface,sync,scale,landscape,presets,enabled}=controls;
 const visibleDevices=devices.filter(device=>enabled[device.id]);
 const viewports=Object.fromEntries(devices.map(device=>[device.id,resolveDeviceViewport(device.id,presets[device.id],landscape[device.id])]));
 const boardWidth=Math.max(360,visibleDevices.reduce((sum,device)=>sum+viewports[device.id].width*scale,0)+96);
 const boardHeight=Math.max(216,...visibleDevices.map(device=>viewports[device.id].height*scale))+72;
 current.current={section,dark,style,surface,draft};
 const change=(key,value)=>setControls(previous=>({...previous,[key]:value}));
 const changeDevice=(key,id,value)=>setControls(previous=>({...previous,[key]:{...previous[key],[id]:value}}));

 function broadcast(value,except){
  for(const [id,frame] of Object.entries(frames.current)){
   if(id!==except&&frame?.contentWindow)frame.contentWindow.postMessage({type:'surfium-buddy-state',...value},location.origin);
  }
 }
 useEffect(()=>{broadcast(current.current)},[section,dark,style,surface,draft,enabled]);
 useEffect(()=>{
  let storage;
  try{storage=localStorage}catch{}
  setStorageError(!writeCompareState(storage,controls));
 },[controls]);
 useEffect(()=>{
  function receive(event){
   if(event.origin!==location.origin)return;
   const id=Object.keys(frames.current).find(deviceId=>frames.current[deviceId]?.contentWindow===event.source);
   if(!id)return;
   const data=event.data;
   if(data?.type==='surfium-buddy-ready')broadcast(current.current);
   else if(sync&&data?.type==='surfium-buddy-navigation')change('section',data.section);
   else if(sync&&data?.type==='surfium-buddy-theme')change('dark',data.dark);
   else if(sync&&data?.type==='surfium-buddy-surface'){
    change('surface',data.surface);
    if(data.draft!==undefined)setDraft(data.draft);
   }
  }
  addEventListener('message',receive);
  return()=>removeEventListener('message',receive);
 },[sync]);

 return <ConfigProvider button={{autoInsertSpace:false}} componentSize="small" theme={{algorithm:dark?antTheme.darkAlgorithm:antTheme.defaultAlgorithm}}>
  <main className={'comparison '+(dark?'dark':'light')}>
   <header><div className="comparison-brand"><strong>Agent Harness UI · 三端界面设计</strong><small>本界面参考 ZCode 源码设计 · 本地演示，可用于商业使用</small></div>
    <Space wrap size={[6,4]} className="comparison-controls"><Segmented size="small" aria-label="功能区域" value={surface} onChange={value=>change('surface',value)} options={[{value:'home',label:'主页'},{value:'work',label:'工作'},{value:'settings',label:'设置'},{value:'conversation',label:'对话'},{value:'mobile',label:'Agent Link'}]}/>
     <Select aria-label="页面" value={section} onChange={value=>setControls(previous=>({...previous,section:value,surface:'settings'}))} options={SETTINGS_GROUPS.flatMap(group=>group.items.map(([value,label])=>({value,label:value==='computer'?'设备控制':label})))}/>
     <Segmented size="small" aria-label="颜色模式" value={dark?'dark':'light'} onChange={value=>change('dark',value==='dark')} options={[{value:'light',label:'浅色'},{value:'dark',label:'深色'}]}/>
     <Select aria-label="统一缩放" value={scale} onChange={value=>change('scale',value)} options={[.5,.65,.75,.85,1].map(value=>({value,label:Math.round(value*100)+'%'}))}/>
     <label className="comparison-toggle"><Switch size="small" aria-label="三端联动" checked={sync} onChange={value=>change('sync',value)}/><span>联动</span></label>
     <div className="comparison-device-switches" role="group" aria-label="三端预览开关">{devices.map(device=><label className="comparison-toggle" key={device.id}><Switch size="small" aria-label={`${device.label} 预览`} checked={enabled[device.id]} onChange={value=>changeDevice('enabled',device.id,value)}/><span>{device.label}</span></label>)}</div>
    </Space>{storageError&&<small className="comparison-storage-error" role="status">浏览器未能保存控制台选择；刷新后可能恢复默认值。</small>}
   </header>
   <div className="comparison-canvas"><div className="comparison-board"><div className="ruler-corner" title="标尺单位：画布 CSS px">px</div><CanvasRuler length={boardWidth}/><CanvasRuler vertical length={boardHeight}/>
    <div className="comparison-devices">{visibleDevices.length?visibleDevices.map(device=>{
     const {width,height,id:presetId}=viewports[device.id];
     const entry=`./${device.id==='phone'?'mobile':device.id}/index.html?${new URLSearchParams({surface,section,theme:dark?'dark':'light'})}`;
     return <section key={device.id} className="comparison-device" style={{width:width*scale}}><div className="device-toolbar"><strong>{device.label}</strong><Select className="device-preset" aria-label={`${device.label} 设备分辨率`} value={presetId} labelRender={device.id==='phone'?()=>`${width}×${height}`:undefined} popupMatchSelectWidth={device.id==='phone'?240:undefined} getPopupContainer={device.id==='phone'?trigger=>trigger.closest('.comparison-device'):undefined} classNames={device.id==='phone'?{popup:{root:'phone-preset-popup'}}:undefined} onChange={value=>changeDevice('presets',device.id,value)} options={DEVICE_PRESETS[device.id].map(preset=>({value:preset.id,label:`${preset.name} · ${preset.width} × ${preset.height}`}))}/><div className="device-actions"><Button size="small" onClick={()=>changeDevice('landscape',device.id,!landscape[device.id])}>{width>height?'横屏':'竖屏'} ↻</Button><Button size="small" href={entry} target="_blank" rel="noopener noreferrer" aria-label={`独立打开 ${device.label}`} title="独立打开" icon={<ExportOutlined/>}/></div></div>
      <div className="device-window" style={{height:height*scale}}><iframe title={device.label} id={device.id} ref={element=>frames.current[device.id]=element} src={`./${device.id==='phone'?'mobile':device.id}/index.html`} style={{width,height,transform:`scale(${scale})`}}/></div>
     </section>;
    }):<div className="comparison-empty"><strong>预览已全部关闭</strong><p>在上方开启 Mobile、Tablet 或 Desktop。</p></div>}</div>
   </div></div>
  </main>
 </ConfigProvider>;
}

createRoot(document.getElementById('buddy-root')).render(<Compare/>);
