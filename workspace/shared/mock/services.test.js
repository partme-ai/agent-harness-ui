import test from 'node:test';
import assert from 'node:assert/strict';
import {createMockServices} from './services.js';
const make=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}};
test('configuration survives service restart and failed writes do not replace state',async()=>{const store=make(),a=createMockServices({storage:store,delay:0});a.write('general',{proxy:'https://example.test'});assert.equal(createMockServices({storage:store}).read('general').proxy,'https://example.test');a.failNext('write');assert.throws(()=>a.write('general',{proxy:'bad'}));assert.equal(a.read('general').proxy,'https://example.test')});
test('registration waits for scan confirmation; expired and revoked codes cannot bind',async()=>{let now=1000;const s=createMockServices({storage:make(),delay:0,now:()=>now});const b=await s.botsService.saveBot({bot:{id:'b',name:'',provider:'feishu',enabled:true,allowedWorkspaces:['*']}});const r=await s.botsService.beginFeishuRegistration({domain:'feishu'});assert.equal((await s.botsService.pollFeishuRegistration(r)).status,'pending');s.confirmRegistration(r.deviceCode);assert.equal((await s.botsService.pollFeishuRegistration(r)).status,'success');await s.botsService.saveBot({bot:b,credentialValue:'mock-secret'});const c=await s.botsService.createBindCode({botId:'b',ttlMs:30000});s.bind(c.code);assert.equal((await s.botsService.getConfig()).bots[0].providerUserId,'mock-user');await s.botsService.resetBotState('b');assert.throws(()=>s.bind(c.code));const expired=await s.botsService.createBindCode({botId:'b',ttlMs:100});now+=101;assert.throws(()=>s.bind(expired.code));await s.botsService.deleteBot('b');assert.equal((await s.botsService.getConfig()).bots.length,0)});
test('phone refresh and stop revoke previous tokens',()=>{let now=1;const s=createMockServices({storage:make(),now:()=>now});const a=s.startPhone();const b=s.startPhone();assert.throws(()=>s.connectPhone(a.token));s.connectPhone(b.token);assert.equal(s.read('phone').status,'connected');s.stopPhone();assert.throws(()=>s.connectPhone(b.token));const c=s.startPhone();now=c.expiresAt+1;assert.throws(()=>s.connectPhone(c.token))});
test('secrets are discarded, failures preserve bots, and deleted registrations cannot return',async()=>{const store=make(),s=createMockServices({storage:store,delay:0});await s.botsService.saveBot({bot:{id:'b',provider:'telegram',enabled:true,allowedWorkspaces:['*'],name:''},credentialValue:'actual-secret-must-not-persist'});assert.ok(!store.getItem('agent-surfium.buddy.mock.v1').includes('actual-secret'));s.failNext('saveBot');await assert.rejects(s.botsService.saveBot({bot:{id:'b',name:'bad'}}));assert.equal((await s.botsService.getConfig()).bots[0].name,'');});
test('late save after deletion cannot resurrect a bot',async()=>{const s=createMockServices({storage:make(),delay:0});const bot={id:'gone',name:'',provider:'weixin',enabled:true,allowedWorkspaces:['*']};await s.botsService.saveBot({bot});await s.botsService.deleteBot('gone');await assert.rejects(s.botsService.saveBot({bot,credentialValue:'mock-secret'}),/已删除/);assert.equal((await s.botsService.getConfig()).bots.length,0)});
test('cancelled or confirmed registration cannot be confirmed again',async()=>{const s=createMockServices({storage:make(),delay:0});const r=await s.botsService.beginWeixinRegistration();s.rejectRegistration(r.qrCode);assert.throws(()=>s.confirmRegistration(r.qrCode),/已结束/)});

for(const provider of ['weixin','feishu','lark','telegram']){
 test(`${provider} mock registration/binding, disable, unbind and retry follow the source contract`,async()=>{
  const store=make(),s=createMockServices({storage:store,delay:0});
  let bot=await s.botsService.saveBot({bot:{id:provider,provider,name:'QA',enabled:true,allowedWorkspaces:['*']}});
  if(provider!=='telegram'){
   const wx=provider==='weixin';
   const r=await (wx?s.botsService.beginWeixinRegistration():s.botsService.beginFeishuRegistration({domain:provider}));
   const poll=()=>wx?s.botsService.pollWeixinRegistration(r):s.botsService.pollFeishuRegistration(r);
   assert.equal((await poll()).status,'pending');s.rejectRegistration(r.token);assert.equal((await poll()).status,'access_denied');
   const fresh=await (wx?s.botsService.beginWeixinRegistration():s.botsService.beginFeishuRegistration({domain:provider}));
   s.confirmRegistration(fresh.token);
   const result=await (wx?s.botsService.pollWeixinRegistration(fresh):s.botsService.pollFeishuRegistration(fresh));
   assert.equal(result.status,'success');assert.equal(fresh.domain,provider);
  }
  s.failNext('saveBot');await assert.rejects(s.botsService.saveBot({bot,credentialValue:'mock-only'}));
  assert.equal((await s.botsService.getConfig()).bots[0].credentialRef,undefined);
  bot=await s.botsService.saveBot({bot,credentialValue:'mock-only'});
  const code=await s.botsService.createBindCode({botId:bot.id});s.bind(code.code);
  assert.equal((await s.botsService.getStatus()).botRuntime[0].status,'connected');
  bot=(await s.botsService.getConfig()).bots[0];await s.botsService.saveBot({bot:{...bot,enabled:false}});
  assert.equal((await s.botsService.getStatus()).botRuntime[0].status,'disabled');
  await s.botsService.resetBotState(bot.id);assert.throws(()=>s.bind(code.code));
  assert.equal(createMockServices({storage:store,delay:0}).read('general',null),null);
  assert.equal((await createMockServices({storage:store,delay:0}).botsService.getConfig()).bots[0].providerUserId,undefined);
 });
}
test('phone binding and capability plan commit together, expired review cannot bind',()=>{
 let now=1000;const s=createMockServices({storage:make(),delay:0,now:()=>now});const p=s.startPhone('tablet');
 assert.equal(p.ownerRole,'tablet');
 now=p.expiresAt+1;assert.throws(()=>s.confirmPhoneCapabilities(p.token,{devices:[],syncResults:[]}),/失效/);
 assert.equal(s.read('deviceWorkspaceV1',null),null);
 const fresh=s.startPhone('desktop');s.confirmPhoneCapabilities(fresh.token,{devices:[{id:'desktop',bound:true}],syncResults:[{status:'demo'}]});
 assert.equal(s.getPhone().status,'connected');assert.equal(s.read('deviceWorkspaceV1').syncResults[0].status,'demo');
});
