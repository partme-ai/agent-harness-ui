import React,{useEffect,useState} from 'react';
import {Alert,Button,Card,Empty,Input,Modal,Select,Segmented,Space,Tag} from 'antd';
import {ArrowLeftOutlined,PlusOutlined,FolderOutlined} from '@ant-design/icons';
import {useMockState} from './mock/use_mock_state.js';
import {initialProjects} from './workspace_navigation.js';
import './mode_spaces.css';

const modes={
 project:{title:'项目空间',description:'按需求分析、系统设计、编码实现和单元测试推进多智能体编程协作。',samples:initialProjects},
 office:{title:'工作空间',description:'围绕项目文档与设计交付，组织多智能体办公协作。',samples:()=>['项目文档','平面设计']},
 creative:{title:'创作空间',description:'管理平面设计、短剧创作和营销广告等创作任务。',samples:()=>['平面设计','短剧创作','营销广告']},
};
const modeViews={
 project:{tabs:['项目看板','需求分析','系统设计','任务列表','单元测试'],stages:['需求分析','系统设计','编码实现','单元测试']},
 office:{tabs:['工作看板','任务说明','资料整理','任务列表','交付检查'],stages:['待处理','处理中','待审核','已完成']},
 creative:{tabs:['创作看板','创意构思','内容设计','任务列表','成品检查'],stages:['创意构思','内容设计','制作中','成品检查']},
};
const emptyBoard=()=>({notes:{},tasks:[]});
export function ModeSpaces({mode,onStart,initialSpace=''}){
 const config=modes[mode];
 const {tabs,stages}=modeViews[mode],boardTab=tabs[0];
 const [names,setNames,error]=useMockState(mode==='project'?'workspaceProjectsV1':`harnessSpaces.${mode}`,config.samples);
 const [boards,setBoards,boardError]=useMockState('harnessSpaceBoardsV1',()=>({}));
 const [selected,setSelected]=useState(names.includes(initialSpace)?initialSpace:''),[tab,setTab]=useState(boardTab),[modal,setModal]=useState(false),[draft,setDraft]=useState(''),[taskDraft,setTaskDraft]=useState(''),[noteDraft,setNoteDraft]=useState('');
 useEffect(()=>{if(initialSpace&&names.includes(initialSpace)){setSelected(initialSpace);setTab(boardTab)}},[initialSpace,mode,names]);
 const board=boards[`${mode}:${selected}`]||emptyBoard();
 const note=board.notes[tab]||'';
 function patch(patchValue){setBoards(old=>({...old,[`${mode}:${selected}`]:{...board,...patchValue}}));}
 function choose(name){setSelected(name);setTab(boardTab);setNoteDraft('');}
 function create(){const value=draft.trim();if(!value||names.includes(value))return;setNames(old=>[...old,value]);setDraft('');setModal(false);choose(value)}
 function addTask(){const value=taskDraft.trim();if(!value)return;patch({tasks:[...board.tasks,{id:crypto.randomUUID(),name:value,stage:stages[0]}]});setTaskDraft('')}
 function changeStage(id,stage){patch({tasks:board.tasks.map(task=>task.id===id?{...task,stage}:task)})}
 return <section className="harness-spaces">
  <header className="harness-space-header"><div>{selected&&<Button type="text" aria-label="返回空间列表" icon={<ArrowLeftOutlined/>} onClick={()=>setSelected('')}/>}<h1>{selected||config.title}</h1><p>{selected?`${config.title} · 本地协作空间`:config.description}</p></div><Button type="primary" icon={<PlusOutlined/>} onClick={()=>setModal(true)}>新建{config.title}</Button></header>
  {(error||boardError)&&<Alert type="error" title={error||boardError}/>}
  {!selected?<div className="harness-space-grid">{names.map(name=><Card key={name} hoverable onClick={()=>choose(name)}><FolderOutlined/><h2>{name}</h2><p>{config.title} · {boards[`${mode}:${name}`]?.tasks?.length||0} 项任务</p><Button onClick={event=>{event.stopPropagation();choose(name)}}>进入空间</Button></Card>)}{!names.length&&<Empty description="暂无空间"/>}</div>:<>
   <Segmented className="harness-space-tabs" value={tab} onChange={value=>{setTab(value);setNoteDraft(board.notes[value]||'')}} options={tabs}/>
   {tab===boardTab?<><div className="harness-space-board">{stages.map(stage=><section key={stage}><h2>{stage} <Tag>{board.tasks.filter(task=>task.stage===stage).length}</Tag></h2>{board.tasks.filter(task=>task.stage===stage).map(task=><Card key={task.id} size="small"><strong>{task.name}</strong><Select aria-label={`${task.name} 阶段`} value={task.stage} onChange={value=>changeStage(task.id,value)} options={stages.map(value=>({value,label:value}))}/><Button type="link" onClick={()=>onStart(`${config.title}：${selected}\n任务：${task.name}`)}>开始协作</Button></Card>)}</section>)}</div><div className="harness-space-add"><Input aria-label="新任务名称" value={taskDraft} onChange={event=>setTaskDraft(event.target.value)} onPressEnter={addTask} placeholder="输入任务名称"/><Button icon={<PlusOutlined/>} onClick={addTask}>添加任务</Button></div></>
   :tab==='任务列表'?<><div className="harness-space-add"><Input aria-label="新任务名称" value={taskDraft} onChange={event=>setTaskDraft(event.target.value)} onPressEnter={addTask} placeholder="输入任务名称"/><Button icon={<PlusOutlined/>} onClick={addTask}>添加任务</Button></div>{board.tasks.map(task=><div className="harness-space-task" key={task.id}><strong>{task.name}</strong><Select aria-label={`${task.name} 阶段`} value={task.stage} onChange={value=>changeStage(task.id,value)} options={stages.map(value=>({value,label:value}))}/><Button onClick={()=>onStart(`${config.title}：${selected}\n任务：${task.name}`)}>开始协作</Button></div>)}{!board.tasks.length&&<Empty description="暂无任务"/>}</>
   :<div className="harness-space-note"><h2>{tab}</h2><p>记录本空间的{tab}，可作为协作任务的上下文。</p><Input.TextArea aria-label={`${tab}内容`} rows={12} value={noteDraft} onChange={event=>setNoteDraft(event.target.value)} placeholder={`填写${tab}内容`}/><Space><Button type="primary" onClick={()=>patch({notes:{...board.notes,[tab]:noteDraft}})}>保存</Button><Button onClick={()=>onStart(`${config.title}：${selected}\n${tab}：${noteDraft||note}`)}>基于内容新建任务</Button></Space></div>}
  </>}
  <Modal title={`新建${config.title}`} open={modal} onCancel={()=>setModal(false)} onOk={create} okText="创建" okButtonProps={{disabled:!draft.trim()||names.includes(draft.trim())}}><Input autoFocus aria-label="空间名称" value={draft} onChange={event=>setDraft(event.target.value)} onPressEnter={create} placeholder="输入空间名称"/>{names.includes(draft.trim())&&<p role="alert">空间名称已存在</p>}</Modal>
 </section>;
}
