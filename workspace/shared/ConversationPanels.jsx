import React,{useState} from 'react';
import {Button,Input,Empty} from 'antd';
import {ArrowLeftOutlined,ArrowRightOutlined,ReloadOutlined,CloseOutlined,FolderOutlined,GlobalOutlined} from '@ant-design/icons';
import {useMockState} from './mock/use_mock_state.js';
import {initialProjects} from './workspace_navigation.js';
import './conversation_panels.css';

export function ConversationPanels({kind,onClose}){
 const [projects]=useMockState('workspaceProjectsV1',initialProjects);
 const [sources]=useMockState('workspaceProjectSourcesV1',()=>({}));
 const [boards]=useMockState('harnessSpaceBoardsV1',()=>({}));
 const [address,setAddress]=useState(''),[current,setCurrent]=useState(''),[history,setHistory]=useState([]),[index,setIndex]=useState(-1);
 function visit(){const value=address.trim();if(!value)return;let url;try{url=new URL(value)}catch{return}if(!['http:','https:'].includes(url.protocol))return;const next=history.slice(0,index+1).concat(url.href);setHistory(next);setIndex(next.length-1);setCurrent(url.href)}
 function travel(next){setIndex(next);setCurrent(history[next]);setAddress(history[next])}
 return <aside className="harness-conversation-panel" aria-label={kind==='browser'?'浏览器界面':'项目文件目录'}>
  <header><strong>{kind==='browser'?'浏览器界面':'项目文件目录'}</strong><Button type="text" aria-label="关闭侧面板" icon={<CloseOutlined/>} onClick={onClose}/></header>
  {kind==='browser'?<><div className="harness-browser-toolbar"><Button aria-label="后退" disabled={index<1} icon={<ArrowLeftOutlined/>} onClick={()=>travel(index-1)}/><Button aria-label="前进" disabled={index>=history.length-1} icon={<ArrowRightOutlined/>} onClick={()=>travel(index+1)}/><Button aria-label="重新检查" disabled={!current} icon={<ReloadOutlined/>} onClick={()=>setCurrent(history[index])}/></div><Input.Search aria-label="网页地址" value={address} onChange={event=>setAddress(event.target.value)} onSearch={visit} enterButton="查看" placeholder="https://example.com"/><div className="harness-browser-preview"><GlobalOutlined/><strong>{current?new URL(current).hostname:'尚未打开网页'}</strong><p>{current||'输入网页地址查看本地导航记录。'}</p><small>浏览器运行服务尚未连接，此面板不加载外部网页。</small></div></>
  :<div className="harness-file-list">{projects.map(name=><section key={name}><h3><FolderOutlined/> {name}</h3><small>{sources[name]?.directory||'尚未关联本地目录'}</small>{(boards[`project:${name}`]?.tasks||[]).map(task=><p key={task.id}>└ {task.name} <small>{task.stage}</small></p>)}</section>)}{!projects.length&&<Empty description="暂无项目"/>}<p className="harness-panel-hint">仅显示工作区项目与任务。浏览器预览不能读取本机文件目录。</p></div>}
 </aside>;
}
