export const actors = {
  person: {name:'我', kind:'成员'},
  lin: {name:'林悦', kind:'成员'},
  agent: {name:'简报助手', kind:'智能体'},
  analyst: {name:'研究助手', kind:'智能体'}
};
export const statusNames = {schedule:'待开始', running:'进行中', done:'已完成'};
export const frequencies = ['每天','工作日','每周','单次'];
const pad = value => String(value).padStart(2,'0');
export function dayKey(date = new Date()) {
  return [String(date.getFullYear()).padStart(4,'0'), pad(date.getMonth()+1), pad(date.getDate())].join('-');
}
const localDay = date => new Date(date+'T12:00:00');
export function offsetDay(date, offset) {
  const value=localDay(date);
  value.setDate(value.getDate()+offset);
  return dayKey(value);
}
export function weekOf(date) {
  const start=offsetDay(date,-((localDay(date).getDay()+6)%7));
  return Array.from({length:7},(_,i)=>offsetDay(start,i));
}
export function minutes(time) {
  const [hour,minute]=time.split(':').map(Number);
  return hour*60+minute;
}
export function validateSlot({date,start,end}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || dayKey(localDay(date))!==date) throw Error('请选择有效日期');
  const clock=/^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!clock.test(start)||!clock.test(end)||end<=start) throw Error('结束时间须晚于开始时间，且在同一天');
}
export function createRule(state, rule) {
  validateSlot(rule);
  if (!rule.name.trim()||!actors[rule.actor]||!frequencies.includes(rule.frequency)) throw Error('请填写任务名称、负责人和重复方式');
  if (rule.deadline && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(rule.deadline)) throw Error('请选择有效截止时间');
  return {...state,rules:[...state.rules,{...rule,name:rule.name.trim(),project:rule.project.trim(),status:'schedule'}]};
}
export function initialSchedule(date=dayKey()) {
  const make=(id,name,actor,start,end,project,status='schedule',frequency='单次',on=date,deadline=end)=>
    ({id,name,actor,start,end,project,status,frequency,date:on,deadline});
  return {rules:[
    make('brief','每日简报','agent','08:30','09:00','工作简报','schedule','每天',weekOf(date)[0]),
    make('research','新产品市场调研','analyst','09:30','10:30','产品研究','running'),
    make('client','客户沟通','person','10:00','11:00','产品研究'),
    make('review','方案评审','person','10:30','11:30','示例工作区','schedule','单次',date,'14:00'),
    make('design','设计走查','lin','14:00','15:00','示例工作区'),
    make('notes','整理会议纪要','agent','15:00','15:30','示例工作区','done'),
    make('plan','整理下周计划','person','16:00','16:45','示例工作区','schedule','每周',weekOf(date)[4])
  ],overrides:{},history:[]};
}
function matches(rule,date) {
  if (date<rule.date||rule.frequency!=='单次'&&rule.closedOn&&date>rule.closedOn) return false;
  const weekday=localDay(date).getDay();
  if (rule.frequency==='每天') return true;
  if (rule.frequency==='工作日') return weekday>0&&weekday<6;
  if (rule.frequency==='每周') return weekday===localDay(rule.date).getDay();
  return date===rule.date;
}
function instance(state,rule,origin) {
  const key=rule.id+'@'+origin;
  const edit=state.overrides[key];
  const row={...rule, ...edit, date:edit?.date??origin, origin, key, deadlineDate:origin};
  if (rule.closedOn) row.status=rule.frequency==='单次'||row.date===rule.closedOn?'done':rule.previousStatus;
  return row;
}
export function occurrences(state,from,to) {
  const rows=[];
  for (const rule of state.rules) {
    const origins=new Set();
    for(let date=from;date<=to;date=offsetDay(date,1)) if(matches(rule,date)) origins.add(date);
    for(const override of Object.values(state.overrides)) {
      if(override.ruleId===rule.id&&override.date>=from&&override.date<=to&&matches(rule,override.origin)) origins.add(override.origin);
    }
    for(const origin of origins) {
      const item=instance(state,rule,origin);
      if(item.date>=from&&item.date<=to&&(rule.frequency==='单次'||!rule.closedOn||item.date<=rule.closedOn)) rows.push(item);
    }
  }
  return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)||a.key.localeCompare(b.key));
}
export function conflicts(rows) {
  const pairs=[];
  const ordered=rows.filter(r=>r.status!=='done').sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));
  for(let i=0;i<ordered.length;i++){
    const a=ordered[i];
    for(let j=i+1;j<ordered.length;j++){
      const b=ordered[j];
      if (a.date!==b.date||b.start>=a.end) break;
      if (a.actor===b.actor) pairs.push([a,b]);
    }
  }
  return pairs;
}
export function adjustOccurrence(state,item,change) {
  validateSlot(change);
  const reason=change.reason.trim();
  if (!reason) throw Error('请填写调整原因');
  const rule=state.rules.find(r=>r.id===item.id);
  if (!rule||!matches(rule,item.origin)) throw Error('这次安排已变更，请重新选择');
  const current=instance(state,rule,item.origin);
  if (current.status==='done'||rule.closedOn||['date','start','end'].some(k=>current[k]!==item[k])) throw Error('这次安排已更新，请重新打开');
  const slot=({date,start,end})=>({date,start,end});
  const before=slot(current),after=slot(change);
  if (Object.keys(before).every(k=>before[k]===after[k])) throw Error('请先修改日期或时间');
  const entry={key:item.key,name:item.name,actor:item.actor,before,after,reason,at:new Date().toISOString()};
  return {...state,overrides:{...state.overrides,[item.key]:{...after,ruleId:rule.id,origin:item.origin}},history:[entry,...state.history]};
}
export function completeRule(state,id,date=dayKey()) {
  return {...state,rules:state.rules.map(r=>r.id===id&&r.status!=='done'?{...r,previousStatus:r.status,status:'done',closedOn:date}:r)};
}
