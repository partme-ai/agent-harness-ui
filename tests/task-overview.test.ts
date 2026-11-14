import test from 'node:test';
import assert from 'node:assert/strict';
import { occurrences, conflicts, adjustOccurrence, initialSchedule, dayKey, weekOf, completeRule } from '../workspace/shared/task_schedule.js';

const friday = '2026-11-13';
const monday = '2026-11-16';
const base = {id:'brief', name:'简报', actor:'agent', project:'产品研究', date:friday, start:'09:00', end:'09:30', deadline:'11:00', frequency:'工作日', status:'schedule'};
const empty = () => ({rules:[{...base}], overrides:{}, history:[]});

test('按本地日历生成每天、工作日、每周实例，保留规则与原始日期身份',()=>{
 const state=empty();
 state.rules.push({...base,id:'daily',frequency:'每天'},{...base,id:'weekly',frequency:'每周'});
 const rows=occurrences(state,'2026-11-12','2026-11-20');
 assert.deepEqual(rows.filter(r=>r.id==='weekly').map(r=>r.date),[friday,'2026-11-20']);
 assert.equal(rows.filter(r=>r.id==='daily').length,8);
 assert.equal(rows.filter(r=>r.id==='brief').length,6);
 assert.equal(new Set(rows.map(r=>r.key)).size,rows.length);
 assert.equal(dayKey(new Date(2026,10,13,0,5)),friday);
 assert.equal(weekOf('2027-01-01')[0],'2026-12-28');
});

test('同一负责人时间重叠才冲突，相邻及已完成安排不冲突',()=>{
 const state=empty();
 for(const [id,actor,start,status] of [['overlap','agent','09:15','schedule'],['other','person','09:15','schedule'],['edge','agent','09:30','schedule'],['done','agent','09:05','done']]){
   state.rules.push({...base,id,actor,start,end:'09:45',status,frequency:'单次'});
 }
 const pairs=conflicts(occurrences(state,friday,friday)).map(([a,b])=>[a.id,b.id]);
 assert.deepEqual(pairs,[['brief','overlap'],['overlap','edge']]);
});

test('跨周调时只移动所选实例并留下原值、新值、原因，截止时间独立',()=>{
 const state=empty(), [item]=occurrences(state,friday,friday);
 const change={date:monday,start:'10:00',end:'10:30',reason:'避开评审'};
 const next=adjustOccurrence(state,item,change);
 assert.equal(occurrences(next,friday,friday).length,0);
 assert.deepEqual(occurrences(next,monday,monday).map(r=>r.start),['09:00','10:00']);
 assert.equal(occurrences(next,monday,monday)[1].key,item.key);
 assert.equal(occurrences(next,monday,monday)[1].deadlineDate,friday);
 assert.equal(next.history[0].before.start,'09:00');
 assert.equal(next.history[0].after.date,monday);
 assert.equal(next.history[0].reason,change.reason);
 assert.deepEqual(next.rules,state.rules);
 assert.throws(()=>adjustOccurrence(next,item,change));
 assert.throws(()=>adjustOccurrence(state,item,{...change,end:'09:00'}));
 assert.throws(()=>adjustOccurrence(state,item,{...change,reason:' '}));
});

test('结束定时任务后保留之前实例，未来不再重复',()=>{
 const state=completeRule(empty(),'brief',monday);
 assert.equal(occurrences(state,friday,friday).length,1);
 assert.equal(occurrences(state,monday,monday)[0].status,'done');
 assert.equal(occurrences(state,'2026-11-17','2026-11-22').length,0);
});

test('初始工作台保留已有样例，并能实际处理当天的示例冲突',()=>{
 const state=initialSchedule(friday);
 const day=occurrences(state,friday,friday);
 assert.ok(state.rules.some(r=>r.id==='research') && state.rules.some(r=>r.id==='notes'));
 assert.ok(conflicts(day).length);
 assert.ok(new Set(day.map(r=>r.actor)).size>=2);
});

test('完成单次任务保留安排日期，状态随定时任务列表更新',()=>{
 for(const date of [friday,'2026-11-20']){
   const state=empty();
   state.rules=[{...base,date,frequency:'单次'}];
   const next=completeRule(state,'brief',monday);
   assert.equal(occurrences(next,date,date)[0].status,'done');
 }
});
