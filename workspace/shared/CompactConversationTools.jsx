import React,{useState} from 'react';
import {Button,Drawer,Input,Segmented} from 'antd';
import {AppstoreOutlined} from '@ant-design/icons';
import {ConversationPanels} from './ConversationPanels.jsx';
import {ConversationStatusPanel} from './ConversationStatusPanel.jsx';
import './compact_conversation_tools.css';

export function CompactConversationTools({workspace,phone}){
 const [open,setOpen]=useState(false),[tab,setTab]=useState('状态看板'),[input,setInput]=useState(''),[rows,setRows]=useState([]);
 function run(){const value=input.trim();if(!value)return;setInput('');if(value==='clear'){setRows([]);return}setRows(old=>[...old,{input:value,output:value==='help'?'本地预览命令：help、status、clear。':value==='status'?`会话模式：${workspace.kind==='chat'?'聊天':'工作'}；执行服务：未连接。`:'未连接命令执行服务；未运行此命令。'}])}
 return <><Button type="text" aria-label="对话工具" title="对话工具" icon={<AppstoreOutlined/>} onClick={()=>setOpen(true)}/><Drawer title="对话工具" placement={phone?'bottom':'right'} height={phone?'70dvh':undefined} width={phone?undefined:360} open={open} onClose={()=>setOpen(false)} className="harness-compact-tools"><Segmented block value={tab} onChange={setTab} options={['状态看板','命令行控制台','浏览器界面','项目文件目录']}/><div className="harness-compact-tools-content">{tab==='状态看板'?<ConversationStatusPanel workspace={workspace} onClose={()=>setOpen(false)}/>:tab==='命令行控制台'?<div className="harness-compact-console"><p>本地预览命令：help、status、clear。系统命令执行服务尚未连接。</p><div role="log">{rows.map((row,index)=><p key={index}>› {row.input}<br/>{row.output}</p>)}</div><Input aria-label="控制台命令" placeholder="输入 help、status 或 clear" value={input} onChange={event=>setInput(event.target.value)} onPressEnter={run}/></div>:<ConversationPanels kind={tab==='浏览器界面'?'browser':'files'} onClose={()=>setOpen(false)}/>}</div></Drawer></>;
}
