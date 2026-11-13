import React,{useState} from 'react';
import {Button,Input,Select} from 'antd';
import {pluginOperation} from './plugin_runtime.js';

export function PluginMcpPanel({plugin,server,connectLabel="检查连接",onChecked,showTools=true}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[tools,setTools]=useState([]),[tool,setTool]=useState(null),[args,setArgs]=useState('{}'),[variables,setVariables]=useState('{}'),[result,setResult]=useState(null);
 async function request(action){
  setBusy(true);setError('');setResult(null);
  try{
   const env=JSON.parse(variables),input=JSON.parse(args);
   if(!env||Array.isArray(env)||typeof env!=='object'||!input||Array.isArray(input)||typeof input!=='object')throw Error('变量和参数必须是 JSON 对象');
   const data=await pluginOperation('mcp',{id:plugin.id,server:server.name,action,variables:env,...(action==='call'?{tool,arguments:input}:{})});
   if(action==='list'){setTools(data.tools);setTool(data.tools[0]?.name||null);setResult(`连接检查通过，发现 ${data.tools.length} 个工具`);onChecked?.(true)}
   else setResult(JSON.stringify(data.result,null,2));
  }catch(e){setError(e.message);if(action==='list')onChecked?.(false)}finally{setBusy(false)}
 }
 return <section className="tc-plugin-form"><details><summary>连接变量（仅本次使用）</summary><Input.TextArea aria-label={`连接变量 ${server.name}`} value={variables} onChange={e=>setVariables(e.target.value)} autoComplete="off" placeholder='{"API_KEY":"..."}'/></details>
 <Button loading={busy} disabled={!plugin.enabled} onClick={()=>request('list')}>{connectLabel} · {server.name}</Button>
 {showTools&&tools.length>0&&<><Select aria-label={`选择工具 ${server.name}`} value={tool} options={tools.map(t=>({label:t.name,value:t.name}))} onChange={setTool}/><p>{tools.find(t=>t.name===tool)?.description}</p><details><summary>参数结构</summary><pre className="tc-plugin-manifest">{JSON.stringify(tools.find(t=>t.name===tool)?.inputSchema,null,2)}</pre></details><Input.TextArea aria-label={`工具参数 ${server.name}`} value={args} onChange={e=>setArgs(e.target.value)}/><Button disabled={!plugin.enabled||!tool} loading={busy} onClick={()=>request('call')}>调用工具</Button></>}
 {error&&<p role="alert">{error}</p>}{result&&<pre className="tc-plugin-manifest" role="status">{result}</pre>}
 </section>;
}
