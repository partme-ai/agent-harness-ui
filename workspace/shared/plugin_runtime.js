// 服务端安装记录是事实源；浏览器只保留页面演示资源，不持久化真实安装状态。
import {useEffect,useState} from 'react';
import {useMockState} from './mock/use_mock_state.js';
import {createCatalogSamples} from './settings/resource_catalog.js';
const empty=()=>Object.fromEntries(['plugins','skills','mcp','commands','hooks','agents'].map(k=>[k,[]]));
let state={resources:empty(),token:null,error:'',workspaceName:'当前工作区',loading:true};
const listeners=new Set();let pending;
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('tinyclaw-plugin-runtime'):null;
function emit(){listeners.forEach(fn=>fn(state));}
export async function refreshPluginRuntime(){
 if(pending)return pending;
 pending=(async()=>{
  try{const response=await fetch('/api/plugins',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(`插件服务不可用（${response.status}）`);const data=await response.json();if(!data.resources||!data.token)throw Error('插件服务响应无效');state={...state,...data,error:'',loading:false};}
  catch(error){state={...state,error:'无法连接本机插件服务，请重试。'+error.message,loading:false};}
  finally{pending=null;emit()}
 })();return pending;
}
if(channel)channel.onmessage=()=>refreshPluginRuntime();
export async function pluginOperation(action,payload){
 if(!state.token||state.error){await refreshPluginRuntime();if(state.error)throw Error(state.error)}
 const response=await fetch(`/api/plugins/${action}`,{method:'POST',headers:{'Content-Type':'application/json','X-TinyClaw-Token':state.token},body:JSON.stringify(payload),signal:AbortSignal.timeout(action==='install'||action==='update'?180000:45000)});
 const data=await response.json();if(!response.ok)throw Error(data.error||'插件操作失败');
 if(data.resources){state={...state,resources:data.resources,error:''};emit();channel?.postMessage('refresh')}
 return data;
}
export function mergeRuntimeResources(mock,runtime){
 const merged={...mock};
 for(const kind of Object.keys(runtime))merged[kind]=[...(mock[kind]||[]).filter(item=>item.runtime!=='local'&&item.source!=='claude-public'),...runtime[kind]];
 return merged;
}
export function usePluginResources(){
 const [mock,setMock,mockError]=useMockState('resources',createCatalogSamples);
 const [runtime,setRuntime]=useState(state);
 useEffect(()=>{listeners.add(setRuntime);refreshPluginRuntime();return()=>listeners.delete(setRuntime)},[]);
 const resources=mergeRuntimeResources(mock,runtime.resources);
 function update(change){
  const next=typeof change==='function'?change(resources):change;
  // 真实资源只能通过 API 更新，避免旧 mock 操作污染安装记录。
  return setMock(Object.fromEntries(Object.entries(next).map(([kind,items])=>[kind,Array.isArray(items)?items.filter(item=>item.runtime!=='local'):items])));
 }
 return [resources,update,mockError,runtime];
}
