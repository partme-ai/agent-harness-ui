import React,{useState} from 'react';
import {Input,Select,Modal} from 'antd';
import {actors,createRule,frequencies} from './task_schedule.js';
export function ScheduleForm({date,name,overview,save,onClose,onCreated}){
  const [fields,setFields]=useState({name,date,start:'09:00',end:'09:30',deadline:'',frequency:overview?'单次':'每天',project:'',actor:'person'});
  const [error,setError]=useState(''),[saving,setSaving]=useState(false);
  const set=(key,value)=>setFields(prev=>({...prev,[key]:value}));
  function input(key,label,type='text'){
    return <label>{label}<Input type={type} aria-label={label} value={fields[key]} onChange={e=>set(key,e.target.value)}/></label>;
  }
  async function submit(){
    setSaving(true);
    try{
      const rule={...fields,id:crypto.randomUUID()};
      await save(state=>createRule(state,rule));
      onCreated(rule);
    }catch(e){setError(e.message);}
    finally{setSaving(false);}
  }
  return <Modal open title={overview?'新建安排':'创建定时任务'} onCancel={onClose} onOk={submit} confirmLoading={saving} okText={overview?'创建安排':'创建演示日程'} cancelText="取消"><div className="to-form">
    {input('name','任务名称')}<div><label>负责人<Select aria-label="负责人" value={fields.actor} onChange={v=>set('actor',v)} options={Object.entries(actors).map(([id,a])=>({value:id,label:a.kind+' · '+a.name}))}/></label>{input('project','所属项目')}</div>
    <div>{input('date','开始日期','date')}<label>重复<Select aria-label="重复" value={fields.frequency} onChange={v=>set('frequency',v)} options={frequencies.map(value=>({value,label:value}))}/></label></div>
    <div>{input('start','开始时间','time')}{input('end','结束时间','time')}</div>{input('deadline','截止时间（选填）','time')}
    <small>日程保存在此浏览器。周期任务按本地日期展示。</small>{error&&<p role="alert">{error}</p>}
  </div></Modal>;
}
