import React,{useState} from 'react';
import {Button,Input,Modal,Select} from 'antd';
import {LeftOutlined,RightOutlined,PlusOutlined,UserOutlined,RobotOutlined,WarningOutlined,CalendarOutlined} from '@ant-design/icons';
import {actors,statusNames,dayKey,offsetDay,weekOf,minutes,occurrences,conflicts,adjustOccurrence} from './task_schedule.js';
import './task_overview.css';

const weekdays=['周一','周二','周三','周四','周五','周六','周日'];
const timeRange=item=>item.start+'–'+item.end;
const shortDate=date=>date.slice(5).replace('-','/');
function Actor({id}){
  const actor=actors[id];
  return <span className="to-actor">{actor.kind==='成员'?<UserOutlined/>:<RobotOutlined/>}{actor.name}</span>;
}
function Panel({title,extra,children,className=''}) {
  return <section className={'to-panel '+className} aria-label={title}><header><h2>{title}</h2>{extra}</header>{children}</section>;
}
// 重叠的日程并列展示；间隔开的组重新占满列宽。
function columns(rows) {
  const groups=[];
  for(const row of rows){
    let group=groups.at(-1);
    if(!group||row.start>=group.end){group={end:row.end,lanes:[],items:[]};groups.push(group);}
    if(row.end>group.end) group.end=row.end;
    let lane=group.lanes.findIndex(end=>end<=row.start);
    if(lane===-1) lane=group.lanes.length;
    group.lanes[lane]=row.end;
    group.items.push({row,lane});
  }
  return groups.flatMap(group=>group.items.map(item=>({...item,count:group.lanes.length})));
}
function WeekCalendar({week,date,select,rows,flagged,edit}){
  const first=Math.min(8,...rows.map(row=>Math.floor(minutes(row.start)/60)));
  const last=Math.max(18,...rows.map(row=>Math.ceil(minutes(row.end)/60)));
  const hours=Array.from({length:last-first},(_,i)=>first+i);
  return <Panel title="本周日程" extra={<div className="to-week-controls"><Button size="small" type="text" aria-label="上一周" icon={<LeftOutlined/>} onClick={()=>select(offsetDay(date,-7))}/><small>{shortDate(week[0])} — {shortDate(week[6])}</small><Button size="small" type="text" aria-label="下一周" icon={<RightOutlined/>} onClick={()=>select(offsetDay(date,7))}/></div>}>
    <div className="to-calendar"><div className="to-week-head"><span/>{week.map((day,i)=><button key={day} type="button" aria-pressed={day===date} onClick={()=>select(day)}>{weekdays[i]}<b>{Number(day.slice(-2))}</b></button>)}</div>
    <div className="to-week-body" style={{height:hours.length*40}}>
      <div className="to-hours">{hours.map(h=><span key={h}>{String(h).padStart(2,'0')}:00</span>)}</div>
      {week.map(day=><div key={day} className={'to-day '+(day===date?'selected':'')}>{columns(rows.filter(r=>r.date===day)).map(({row,lane,count})=>
        <button className={'to-event '+actors[row.actor].kind+(flagged.has(row.key)?' conflict':'')} key={row.key} title={row.name+' · '+timeRange(row)+' · '+actors[row.actor].name} aria-label={row.name+' '+row.date+' '+timeRange(row)} style={{top:(minutes(row.start)-first*60)*40/60,height:Math.max(9,(minutes(row.end)-minutes(row.start))*40/60-1),left:(lane*100/count)+'%',width:'calc('+100/count+'% - 2px)'}} onClick={()=>edit(row)}><strong>{row.name}</strong>{minutes(row.end)-minutes(row.start)>=45&&<small>{row.start} · {actors[row.actor].name}</small>}</button>)}</div>)}
    </div></div></Panel>;
}
export function TaskOverview({store,phone,desktop,date,select,openRules,create,openConversation}){
  const {schedule,save}=store;
  const today=dayKey();
  const [actor,setActor]=useState('all'),[mobileWeek,setMobileWeek]=useState(false);
  const [showConflicts,setShowConflicts]=useState(false),[edit,setEdit]=useState(null),[draft,setDraft]=useState({}),[error,setError]=useState(''),[saving,setSaving]=useState(false);
  const week=weekOf(date);
  const rows=occurrences(schedule,week[0],week[6]).filter(row=>actor==='all'||row.actor===actor);
  const day=rows.filter(row=>row.date===date),pairs=conflicts(rows),dayPairs=pairs.filter(([a])=>a.date===date);
  const flagged=new Set(pairs.flat().map(r=>r.key));
  const now=new Date();
  const overdue=day.filter(row=>row.status!=='done'&&row.deadline&&new Date(row.deadlineDate+'T'+row.deadline)<now).length;
  function begin(item){
    setShowConflicts(false);setEdit(item);setDraft({date:item.date,start:item.start,end:item.end,reason:''});setError('');
  }
  async function submit(){
    setSaving(true);
    try{await save(state=>adjustOccurrence(state,edit,draft));select(draft.date);setEdit(null);}
    catch(e){setError(e.message);}
    finally{setSaving(false);}
  }
  const timeline=<Panel title={date===today?'今日时间线':'当天时间线'} extra={<small>{day.length} 项</small>}>
    {day.length?day.map(row=><button type="button" className="to-line" key={row.key} onClick={()=>begin(row)}>
      <time>{row.start}</time><i className={flagged.has(row.key)?'conflict':actors[row.actor].kind}/><span><strong>{row.name}</strong><Actor id={row.actor}/></span><small>{flagged.has(row.key)?'冲突':statusNames[row.status]}</small>
    </button>):<p className="to-empty">当天暂无安排</p>}
  </Panel>;
  const calendar=<WeekCalendar {...{week,date,select,rows,flagged,edit:begin}}/>;
  const field=(key,value)=>setDraft(prev=>({...prev,[key]:value}));
  return <div className={'task-overview '+(phone?'phone':desktop?'desktop':'tablet')}>
    <header className="to-heading"><div><small>工作</small><h1>任务总览</h1></div><div className="to-actions"><Button size="small" type="text" onClick={openConversation}>工作对话</Button><Button size="small" onClick={openRules}>定时任务</Button><Button size="small" type="primary" icon={<PlusOutlined/>} onClick={()=>create(date)}>新建安排</Button></div></header>
    <div className="to-filters"><div className="to-dates"><Button size="small" aria-label="上一天" icon={<LeftOutlined/>} onClick={()=>select(offsetDay(date,-1))}/><input aria-label="查看日期" type="date" value={date} onChange={e=>{if(e.target.value)select(e.target.value)}}/><Button size="small" aria-label="下一天" icon={<RightOutlined/>} onClick={()=>select(offsetDay(date,1))}/><Button size="small" onClick={()=>select(today)}>今天</Button></div><Select size="small" aria-label="筛选负责人" value={actor} onChange={setActor} options={[{value:'all',label:'全部负责人'},...Object.entries(actors).map(([id,a])=>({value:id,label:a.kind+' · '+a.name}))]}/></div>
    <div className="to-metrics">{[[date===today?'今日待办':'当天待办',day.filter(r=>r.status==='schedule').length],['进行中',day.filter(r=>r.status==='running').length],['逾期任务',overdue]].map(([label,n])=><div key={label}><span>{label}</span><b>{n}</b></div>)}<button type="button" aria-label={'时间冲突 '+dayPairs.length} onClick={()=>setShowConflicts(true)}><span><WarningOutlined/> 时间冲突</span><b>{dayPairs.length}<RightOutlined/></b></button></div>
    {phone?<>{timeline}<Button size="small" icon={<CalendarOutlined/>} aria-expanded={mobileWeek} onClick={()=>setMobileWeek(!mobileWeek)}>{mobileWeek?'收起周历':'查看周历'}</Button>{mobileWeek&&calendar}</>:<div className="to-planner">{calendar}{timeline}</div>}
    <Panel title="任务清单" extra={<small>{shortDate(date)}</small>}>
      <div className="to-table-wrap"><table><thead><tr><th>任务 / 项目</th><th>负责人</th><th>计划时段</th><th>截止</th><th>状态</th></tr></thead><tbody>{day.map(row=><tr key={row.key}><td><button onClick={()=>begin(row)}>{row.name}</button><small>{row.project||'未分配项目'}</small></td><td><Actor id={row.actor}/></td><td>{timeRange(row)}</td><td title={row.deadlineDate}>{row.deadlineDate!==date&&row.deadline?shortDate(row.deadlineDate)+' ':''}{row.deadline||'—'}</td><td>{statusNames[row.status]}</td></tr>)}</tbody></table></div>{!day.length&&<p className="to-empty">当天暂无任务</p>}
    </Panel>
    <Panel title="最近调整记录">{schedule.history.filter(h=>actor==='all'||h.actor===actor).map((h,i)=><div className="to-history" key={h.at+h.key+i}><time>{new Date(h.at).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time><span><b>{h.name}</b> · {actors[h.actor].name}<small>{shortDate(h.before.date)} {timeRange(h.before)} → {shortDate(h.after.date)} {timeRange(h.after)}</small><small>原因 · {h.reason}</small></span></div>)}{!schedule.history.some(h=>actor==='all'||h.actor===actor)&&<p className="to-empty">暂无调整记录</p>}</Panel>
    <Modal open={showConflicts} title="时间冲突" footer={null} onCancel={()=>setShowConflicts(false)}>{!dayPairs.length&&<p>当天没有时间冲突。</p>}{dayPairs.map(([a,b])=><section className="to-pair" key={a.key+b.key}><strong>{actors[a.actor].name} · {shortDate(a.date)}</strong>{[a,b].map(r=><div key={r.key}><span>{r.name} · {timeRange(r)}</span><Button size="small" aria-label={'调整 '+r.name} onClick={()=>begin(r)}>调整</Button></div>)}</section>)}</Modal>
    <Modal open={!!edit} title={edit?.name} onCancel={()=>setEdit(null)} onOk={submit} confirmLoading={saving} okText="保存调整" cancelText="取消" footer={edit&&(edit.status==='done'||edit.closedOn)?null:undefined}>{edit&&<><p><Actor id={edit.actor}/> · {edit.project} · {statusNames[edit.status]}</p><p>当前安排　{edit.date}　{timeRange(edit)}</p>{edit.status!=='done'&&!edit.closedOn&&<div className="to-form"><label>安排日期<Input type="date" value={draft.date} onChange={e=>field('date',e.target.value)}/></label><div><label>开始时间<Input type="time" value={draft.start} onChange={e=>field('start',e.target.value)}/></label><label>结束时间<Input type="time" value={draft.end} onChange={e=>field('end',e.target.value)}/></label></div><label>调整原因<Input maxLength={240} value={draft.reason} onChange={e=>field('reason',e.target.value)}/></label>{edit.frequency!=='单次'&&<small>仅调整本次安排，后续仍按原规则重复。</small>}{error&&<p role="alert">{error}</p>}</div>}</>}</Modal>
  </div>;
}
