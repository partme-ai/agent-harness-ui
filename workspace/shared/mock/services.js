// ZCode 服务契约的本地 mock 实现。所有状态位于独立命名空间；输入的凭据不会落盘。
export const MOCK_KEY='agent-surfium.buddy.mock.v1';
export function createMockServices({storage,delay=120,now=Date.now}={}) {
 const listeners=new Set();let fault=null;
 const initial={version:1,values:{},bots:[],deletedBots:[],registrations:{},bindCodes:{},phone:null};
 const load=()=>{const raw=storage?.getItem(MOCK_KEY);if(!raw)return structuredClone(initial);try{const data=JSON.parse(raw);return data.version===1?data:structuredClone(initial)}catch{throw new Error('模拟配置损坏，请导出备份后重置模拟数据')}};
 function check(action){if(fault===action||fault==='*'){fault=null;throw new Error(`模拟接口 ${action} 失败，请重试`)}}
 function change(action,fn){check(action);const state=load();const result=fn(state);storage?.setItem(MOCK_KEY,JSON.stringify(state));listeners.forEach(fn=>fn());return structuredClone(result??state)}
 async function request(action,fn){if(delay)await new Promise(resolve=>setTimeout(resolve,delay));return change(action,fn)}
 const uid=()=>globalThis.crypto.randomUUID();
 const url=(key,value)=>`${globalThis.location?.origin||'http://127.0.0.1:1420'}${globalThis.location?.pathname||'/'}?mockPair=${key}&token=${encodeURIComponent(value)}`;
 const requireBot=(s,id)=>{const bot=s.bots.find(b=>b.id===id);if(!bot)throw new Error('机器人已删除');return bot};
 const revoke=(s,id)=>{for(const [code,b] of Object.entries(s.bindCodes))if(b.botId===id)delete s.bindCodes[code]};
 const validateCode=(s,code)=>{const b=s.bindCodes[code];if(!b||b.expiresAt<=now())throw new Error('绑定码无效或已过期，请重新生成');requireBot(s,b.botId);return b};
 function registration(s,type,domain){const token=uid(),r={token,type,domain,deviceCode:token,qrCode:token,qrUrl:url('registration',token),userCode:token.slice(0,6),interval:1,expiresAt:now()+120000,status:'pending'};s.registrations[token]=r;return r}
 function poll(s,token,type){const r=s.registrations[token];if(!r||r.type!==type)throw new Error('扫码会话已失效');if(r.expiresAt<=now())r.status='expired';return r.status==='success'?{...r,appId:'mock-app',appName:'Agent Harness UI 演示机器人',appSecret:'mock-secret',botId:'mock-weixin',botToken:'mock-token'}:r}
 const api={
 read:(key,fallback)=>structuredClone(load().values[key]??fallback),
 write:(key,value)=>change('write',s=>{s.values[key]=structuredClone(value);return value}),
 subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)},
 failNext:action=>{fault=action},
 perform:(action,fn=()=>({ok:true,mock:true}))=>request(action,s=>fn(s.values)),
 inspectPair:(kind,token)=>{const s=load();if(kind==='phone'){if(!s.phone||s.phone.token!==token||s.phone.expiresAt<=now()||s.phone.status==='stopped')throw new Error('手机链接已失效，请刷新二维码');return s.phone}if(kind==='registration'){const r=s.registrations[token];if(!r||r.expiresAt<=now())throw new Error('扫码链接已过期');return r}return validateCode(s,token)},
 confirmRegistration:token=>change('confirmRegistration',s=>{const r=s.registrations[token];if(!r||r.expiresAt<=now())throw new Error('扫码链接已过期');if(r.status!=='pending')throw new Error('扫码会话已结束，请重新生成');r.status='success';return r}),
 rejectRegistration:token=>change('rejectRegistration',s=>{if(s.registrations[token])s.registrations[token].status='access_denied'}),
 bind:code=>change('bind',s=>{const b=validateCode(s,code),bot=requireBot(s,b.botId);if(!bot.credentialRef)throw new Error('请先配置机器人凭据');bot.providerUserId='mock-user';bot.displayName='演示用户';revoke(s,b.botId);return bot}),
 startPhone:(ownerRole='desktop')=>change('startPhone',s=>{const token=uid();s.phone={ownerRole,token,url:url('phone',token),expiresAt:now()+300000,status:'waiting'};s.values.phone=s.phone;return s.phone}),
 confirmPhoneCapabilities:(token,workspace)=>change('confirmPhoneCapabilities',s=>{if(!s.phone||s.phone.token!==token||s.phone.expiresAt<=now()||s.phone.status==='stopped')throw new Error('手机链接已失效，请重新识别');s.phone.status='connected';s.values.phone=s.phone;s.values.deviceWorkspaceV1=structuredClone(workspace);return s.phone}),
 connectPhone:token=>change('connectPhone',s=>{if(!s.phone||s.phone.token!==token||s.phone.expiresAt<=now()||s.phone.status==='stopped')throw new Error('手机链接已失效');s.phone.status='connected';s.values.phone=s.phone;return s.phone}),
 stopPhone:()=>change('stopPhone',s=>{if(s.phone)s.phone.status='stopped';s.values.phone=s.phone}),
 getPhone:()=>structuredClone(load().phone),
 botsService:{
 getConfig:async()=>({version:3,bots:load().bots}),
 getStatus:async()=>({botsCount:load().bots.length,enabledBotsCount:load().bots.filter(b=>b.enabled).length,contextsCount:0,botRuntime:load().bots.map(b=>({botId:b.id,provider:b.provider,status:!b.enabled?'disabled':b.providerUserId?'connected':'idle',message:!b.enabled?'模拟服务已停用':b.providerUserId?'Mock · 已连通':'未绑定'}))}),
 listWorkspaceRefs:async({currentWorkspace})=>[currentWorkspace,{id:'example-project',label:'示例工作区',workspacePath:'example-project'}],
 getBotStates:async()=>load().bots.filter(b=>b.providerUserId).map(b=>({botId:b.id,weixinActivatedAt:now()})),
 saveBot:({bot,credentialValue})=>request('saveBot',s=>{if(s.deletedBots?.includes(bot.id))throw new Error('机器人已删除，不能再次保存');if(!bot.id||!bot.provider)throw new Error('缺少机器人配置');if(credentialValue!==undefined&&!credentialValue.trim())throw new Error('请输入模拟凭据');const next={...bot,...(credentialValue!==undefined?{credentialRef:`mock:${bot.id}`}:{})};s.bots=[...s.bots.filter(b=>b.id!==bot.id),next];return next}),
 deleteBot:id=>request('deleteBot',s=>{requireBot(s,id);s.bots=s.bots.filter(b=>b.id!==id);s.deletedBots=[...(s.deletedBots||[]),id];revoke(s,id)}),
 resetBotState:id=>request('resetBotState',s=>{const bot=requireBot(s,id);delete bot.providerUserId;delete bot.displayName;revoke(s,id);return bot}),
 removeBotSecret:id=>request('removeBotSecret',s=>{const bot=requireBot(s,id);delete bot.credentialRef;delete bot.providerUserId;delete bot.displayName;revoke(s,id);return bot}),
 createBindCode:({botId,ttlMs=30000,allowedWorkspaces})=>request('createBindCode',s=>{requireBot(s,botId);revoke(s,botId);const code=uid().slice(0,6).toUpperCase(),result={code,botId,expiresAt:now()+ttlMs,allowedWorkspaces};s.bindCodes[code]=result;return result}),
 beginFeishuRegistration:({domain})=>request('beginFeishuRegistration',s=>registration(s,'feishu',domain)),
 pollFeishuRegistration:({deviceCode})=>request('pollFeishuRegistration',s=>poll(s,deviceCode,'feishu')),
 beginWeixinRegistration:()=>request('beginWeixinRegistration',s=>registration(s,'weixin','weixin')),
 pollWeixinRegistration:({qrCode})=>request('pollWeixinRegistration',s=>poll(s,qrCode,'weixin')),
 }
 };
 return api;
}
export const mockServices=createMockServices({storage:globalThis.localStorage});
