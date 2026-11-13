import {taskHomeScenes,taskHomePrompt} from './task_home.js';
import React,{useEffect,useRef,useState} from 'react';
import {Alert,Button,Collapse,Typography} from 'antd';
import {Composer} from './Composer.jsx';
import {DeleteOutlined,EditOutlined,HolderOutlined,UpOutlined,DownOutlined,CopyOutlined,ArrowUpOutlined,PlusOutlined,SearchOutlined,FileTextOutlined,BulbOutlined,CodeOutlined} from '@ant-design/icons';
import {Streamdown} from 'streamdown';
import {reorderQueue} from './queue_state.js';
import {ContextIcon} from './ContextPicker.jsx';
import {Tag} from 'antd';
import {contextIdentity,contextTypeNames} from './composer_context.js';
import {sampleConversation} from './conversation_state.js';
import {DeviceConversationBar} from './DeviceWorkspace.jsx';
import {resolveTurnTarget,deviceNames,visibleSessions} from './device_workspace.js';
export function Conversation({empty=false,initialDraft="",homeContent=null,desktop=false,onSettings,workspace,consoleModels}){
 const [homeMode,setHomeMode]=useState('日常办公');
 const [rows,setRows]=useState(empty?[]:sampleConversation.rows),[draft,setDraft]=useState(initialDraft),[copied,setCopied]=useState(false);
 const [sendError,setSendError]=useState('');
 const draftCache=useRef({}),previousScope=useRef(null);
 const scope=workspace?`${workspace.kind}:${workspace.session}`:'legacy';
 const stored=workspace&&visibleSessions(workspace.state.sessions,workspace.role).find(s=>s.id===workspace.session&&s.kind===workspace.kind);
 const shownRows=stored?.rows||(previousScope.current===scope?rows:(workspace?.kind==='work'||empty?[]:sampleConversation.rows));
 const scroll=useRef(null),following=useRef(true),dragging=useRef(null);
 const [queue,setQueue]=useState([]),[queued,setQueued]=useState(false),[references,setReferences]=useState([]),[restoreConfig,setRestoreConfig]=useState(null);
 useEffect(()=>{if(sendError.startsWith('目标设备')&&workspace?.state.devices.find(d=>d.id===workspace.target)?.online)setSendError('')},[workspace?.state.devices]);
 useEffect(()=>{if(shownRows.length>0&&following.current&&scroll.current)scroll.current.scrollTop=scroll.current.scrollHeight},[shownRows]);
 useEffect(()=>{if(previousScope.current!==scope){if(previousScope.current)draftCache.current[previousScope.current]=draft;setDraft(draftCache.current[scope]??(previousScope.current?'':initialDraft));setRows(workspace?.kind==='work'||empty?[]:sampleConversation.rows);setSendError('');previousScope.current=scope;}},[scope]);
 function dispatch(text,config={}){
  const kind=config.sessionKind||workspace?.kind||'chat',target=config.targetDevice||(kind==='work'?workspace?.role:workspace?.target),sessionId=config.sessionId||workspace?.session;
  if(workspace){try{resolveTurnTarget(workspace.state.devices,{kind,target,role:workspace.role})}catch(e){setSendError(e.message);return false}}
  following.current=true;
  const base=workspace?.state.sessions.find(s=>s.id===sessionId&&s.kind===kind)?.rows||(sessionId===workspace?.session&&kind===workspace?.kind?shownRows:[]);
  const next=[...base,{rowId:crypto.randomUUID(),kind:'userInput',text,config,createdAt:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})},{rowId:crypto.randomUUID(),kind:'assistantText',state:'complete',text:'已保留本地演示输入。当前尚未连接 AgentScope 执行服务，不会生成虚构工具调用。'}];
  if(workspace&&!workspace.update(s=>{const existing=s.sessions.find(item=>item.id===sessionId&&item.kind===kind);return {...s,sessions:[...s.sessions.filter(item=>!(item.id===sessionId&&item.kind===kind)),{id:sessionId,kind,owner:existing?.owner||workspace.role,target,title:existing?.title||text.split('\n')[0].slice(0,32)||'引用会话',rows:next}]}})){setSendError('本地保存失败，草稿已保留');return false}
  if(!workspace||sessionId===workspace.session&&kind===workspace.kind)setRows(next);setSendError('');return true;
 }
 function send(config){const text=[draft.trim(),...(config.attachments||[]).map(file=>`附件：${file.name}`)].filter(Boolean).join('\n');if(!text&&!config.references?.length)return;const scopedConfig={...config,...(workspace?{sessionKind:workspace.kind,sessionId:workspace.session,targetDevice:workspace.kind==='work'?workspace.role:workspace.target}:{})};if(queued)setQueue(previous=>[...previous,{id:crypto.randomUUID(),text,body:draft,config:scopedConfig}]);else if(!dispatch(text,scopedConfig))return false;setDraft('');draftCache.current[scope]='';return true;}
 function editQueued(item){if(workspace&&item.config.sessionKind){workspace.setKind(item.config.sessionKind);workspace.setSession(item.config.sessionId);workspace.setTarget(item.config.targetDevice);draftCache.current[`${item.config.sessionKind}:${item.config.sessionId}`]=item.body??item.text;}setDraft(item.body??item.text);setReferences(item.config?.references||[]);setRestoreConfig({...item.config});setQueue(items=>items.filter(row=>row.id!==item.id));}
 function sendNow(item){if(dispatch(item.text,item.config))setQueue(items=>items.filter(row=>row.id!==item.id));}

 async function copy(text){try{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{setCopied(false)}}
 return <section className="conversation-view">

 {sendError&&<Alert className="tc-session-error" closable onClose={()=>setSendError('')} type="error" title={sendError}/>}
 <div className={"conversation-scroll"+(shownRows.length===0?" tc-empty-scroll":"")} ref={scroll} onScroll={e=>{following.current=e.currentTarget.scrollHeight-e.currentTarget.scrollTop-e.currentTarget.clientHeight<48}}>
 {shownRows.length===0&&(homeContent||<div className="tc-chat-welcome tc-task-home" aria-label="新建任务主页"><h1>{workspace?.kind==='work'?'Agent Harness UI，今天在本地完成什么？':'Agent Harness UI，今天帮你做什么？'}</h1>{workspace?.kind==='work'&&<p className="tc-work-home-scope">围绕本地文件、项目与资料开展工作 · 记录仅在本机可见</p>}<div className="tc-home-modes">{Object.keys(taskHomeScenes.chat).map(mode=><Button key={mode} type={homeMode===mode?'primary':'text'} aria-pressed={homeMode===mode} onClick={()=>setHomeMode(mode)}>{mode}</Button>)}</div><div className="tc-home-shortcuts">{taskHomeScenes[workspace?.kind==='work'?'work':'chat'][homeMode].map(title=><Button key={title} onClick={()=>{setDraft(taskHomePrompt(workspace?.kind,title));requestAnimationFrame(()=>scroll.current?.closest('.conversation-view')?.querySelector('textarea')?.focus())}}>{title}</Button>)}</div></div>)}
 {shownRows.length>0&&<><Alert title={stored?'本地预览记录 · 尚未连接真实执行服务':'演示会话 · 工具过程为固定示例，尚未连接真实执行服务'} type="info" showIcon />
 <div className="conversation-date">{stored?'本地预览记录':'示例会话'}</div></>}
 {shownRows.map(row=><div className={'conversation-row '+row.kind} key={row.rowId}>
 {row.kind==='userInput'?<>{row.config?.sessionKind&&<div className="tc-context-scope-label">{row.config.sessionKind==='chat'?'Chat · 全设备可见':'Work · 仅本机可见'} · {workspace?.state.devices.find(d=>d.id===row.config.targetDevice)?.name||'本机'}</div>}<div className="user-message">{row.config?.references?.length>0&&<div className="tc-sent-references">{row.config.references.map(item=><Tag key={contextIdentity(item)} icon={<ContextIcon type={item.type}/>} title={`${contextTypeNames[item.type]} · ${item.scope} · ${item.resourceId}`}>{item.name}</Tag>)}</div>}{row.text}</div><div className="message-meta">{row.createdAt}<Button type="text" size="small" aria-label="复制输入" icon={<CopyOutlined/>} onClick={()=>copy(row.text)}/></div></>:
 row.kind==='toolCall'?<Collapse ghost size="small" items={[{key:row.rowId,label:<span className="tool-summary">示例工具 · {row.title} · 已完成</span>,children:<Typography.Paragraph>{row.output}</Typography.Paragraph>}]} />:
 <Streamdown mode={row.state==='streaming'?'streaming':'static'}>{row.text}</Streamdown>}
 </div>)}
 {shownRows.length>0&&<Button type="text" aria-label={copied?"已复制":"复制回复"} title="复制回复" icon={<CopyOutlined/>} onClick={()=>copy(shownRows.filter(r=>r.kind==='assistantText').map(r=>r.text).join('\n\n'))}></Button>}
 </div>
 <div className="conversation-dock">
 {queue.length>0&&<div className="tc-queue" aria-label="等待列表"><small>等待列表 · 本地演示</small><ul>{queue.map((item,index)=><li className="tc-queue-item" key={item.id} draggable onDragStart={()=>dragging.current=item.id} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setQueue(items=>reorderQueue(items,dragging.current,item.id));dragging.current=null}}><HolderOutlined/><span title={item.text}>{item.config?.references?.map(r=>`[${contextTypeNames[r.type]}：${r.name}]`).join(" ")} {item.text}</span><Button size="small" type="text" aria-label="上移队列项" icon={<UpOutlined/>} disabled={index===0} onClick={()=>setQueue(items=>reorderQueue(items,item.id,items[index-1].id))}/><Button size="small" type="text" aria-label="下移队列项" icon={<DownOutlined/>} disabled={index===queue.length-1} onClick={()=>setQueue(items=>reorderQueue(items,item.id,items[index+1].id))}/><Button size="small" type="text" aria-label="立即发送队列项" title="本地演示立即发送" icon={<ArrowUpOutlined/>} onClick={()=>sendNow(item)}>立即</Button><Button size="small" type="text" aria-label="编辑队列项" icon={<EditOutlined/>} onClick={()=>editQueued(item)}/><Button size="small" type="text" aria-label="删除队列项" icon={<DeleteOutlined/>} onClick={()=>setQueue(items=>items.filter(row=>row.id!==item.id))}/></li>)}</ul></div>}
 <Composer consoleModels={consoleModels} targetControl={workspace&&<DeviceConversationBar workspace={workspace}/>} draft={draft} setDraft={setDraft} onSubmit={send} hasRows={shownRows.length>0} desktop={desktop} onSettings={onSettings} queued={queued} setQueued={setQueued} references={references} setReferences={setReferences} restoreConfig={restoreConfig}/>
 </div>
 </section>;
}
