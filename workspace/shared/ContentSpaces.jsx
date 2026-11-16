import React,{useState} from 'react';
import {Alert,Button,Empty,Input,Modal,Segmented,Select,Table} from 'antd';
import {BookOutlined,ClockCircleOutlined,FolderOutlined,PlusOutlined} from '@ant-design/icons';
import {useMockState} from './mock/use_mock_state.js';
import './workspace_pages.css';
const initial=()=>({notes:[{id:'research',title:'产品研究资料',body:'记录研究问题、资料来源与待验证结论。',group:'个人'},{id:'meeting',title:'会议纪要模板',body:'议题、决策、负责人、下一步。',group:'共享'}],favorites:[]});
export function ContentSpaces({onStart}){
 const [content,update,error]=useMockState('contentSpacesV1',initial);
 const [section,setSection]=useState('最近'),[tab,setTab]=useState('最近访问'),[query,setQuery]=useState(''),[kind,setKind]=useState('全部类型'),[note,setNote]=useState(null),[creating,setCreating]=useState(false),[title,setTitle]=useState(''),[body,setBody]=useState(''),[validation,setValidation]=useState('');
 const items=content.notes.filter(n=>n.title.includes(query)&& (section!=='我的资料'||n.group==='个人')&&(section!=='团队空间'||n.group==='共享')&&(section!=='本地产物')&&(tab!=='我分享的')&&(tab!=='与我共享'||n.group==='共享')&&(kind!=='文件'));
 function open(n){setNote(n);update(s=>({...s,notes:s.notes.map(row=>row.id===n.id?{...row,lastVisited:new Date().toISOString()}:row)}))}
 return <section className="tc-library"><aside className="tc-library-sidebar"><h2>资料库</h2>{[['最近',ClockCircleOutlined],['本地产物',FolderOutlined],['我的资料',BookOutlined],['团队空间',BookOutlined]].map(([name,Icon])=><Button key={name} type="text" icon={<Icon/>} aria-current={section===name?'page':undefined} className={section===name?'selected':''} onClick={()=>{setSection(name);setTab('最近访问')}}>{name}</Button>)}<Button aria-label="新建资料" icon={<PlusOutlined/>} onClick={()=>{setCreating(true);setTitle('');setBody('');setValidation('')}}>新建资料</Button><small>本地预览资料</small></aside>
 <div className="tc-library-main"><h1>{section}</h1>{error&&<Alert type="error" title={error}/>}<div className="tc-page-tools"><Input.Search aria-label="搜索资料" placeholder="搜索资料" value={query} onChange={e=>setQuery(e.target.value)}/><Select aria-label="资料类型" value={kind} onChange={setKind} options={['全部类型','文档','文件'].map(value=>({value,label:value}))}/></div><Segmented aria-label="资料视图" value={tab} onChange={setTab} options={['最近访问','我分享的','与我共享']}/>
 <Table className="tc-library-table" aria-label="资料列表" size="small" rowKey="id" dataSource={items} pagination={false}
  locale={{emptyText:<Empty description={section==='本地产物'?'暂无任务产物':tab==='我分享的'?'暂无已分享资料':'暂无匹配资料'}/>}}
  onRow={record=>({onClick:()=>open(record)})}
  columns={[
   {title:'名称',dataIndex:'title',render:(title,record)=><Button className="tc-library-title" type="link" icon={<BookOutlined/>} onClick={event=>{event.stopPropagation();open(record)}}>{title}</Button>},
   {title:'所有者',key:'owner',className:'tc-library-detail-cell',render:()=>'演示账户'},
   {title:'位置',dataIndex:'group',render:group=>group==='共享'?'团队空间':'我的资料'},
   {title:'最近访问',dataIndex:'lastVisited',className:'tc-library-detail-cell',render:date=>date?new Date(date).toLocaleDateString('zh-CN'):'尚未访问'}
  ]}/>
 <p className="tc-muted">个人与团队分组为本地示例；未接入真实文件系统或共享服务。</p><h2>用资料开始工作</h2><div className="tc-project-grid">{[['整理资料','提取要点并整理待办'],['研究一个问题','结合资料核对来源与结论']].map(([name,desc])=><Button key={name} className="tc-project-tile" onClick={()=>onStart(`${name}：请先确认目标与需要的资料。`)}><BookOutlined/><span><strong>{name}</strong><small>{desc}</small></span></Button>)}</div></div>
 <Modal title={note?.title} open={!!note} onCancel={()=>setNote(null)} footer={<Button type="primary" onClick={()=>{onStart(`请根据资料“${note.title}”继续整理：\n${note.body}`);setNote(null)}}>带入任务</Button>}><p style={{whiteSpace:'pre-wrap'}}>{note?.body}</p></Modal>
 <Modal title="新建资料" open={creating} onCancel={()=>setCreating(false)} okText="保存资料" onOk={()=>{if(!title.trim()||!body.trim()){setValidation('请填写标题和内容');return}if(update(s=>({...s,notes:[...s.notes,{id:crypto.randomUUID(),title:title.trim(),body:body.trim(),group:'个人'}]})))setCreating(false)}}><div className="tc-form"><label>标题<Input aria-label="资料标题" value={title} onChange={e=>setTitle(e.target.value)}/></label><label>内容<Input.TextArea aria-label="资料内容" rows={5} value={body} onChange={e=>setBody(e.target.value)}/></label>{validation&&<Alert type="error" title={validation}/>}</div></Modal>
 </section>;
}
