import type {Connection} from './state.ts';
import {simulateRule,type GatewayRule,type RuleKind,type UsageRow} from './product_state.ts';

export const modelReference=(connection:Pick<Connection,'model'|'role'>)=>'model:'+JSON.stringify([connection.role||'LLM',connection.model]);
export function resolveModelConnection<T extends Pick<Connection,'model'|'id'|'role'|'enabled'|'isDefault'>>(connections:readonly T[],reference?:string){
 const exact=connections.find(c=>c.id===reference);
 if(exact)return exact;
 const matches=connections.filter(c=>c.enabled!==false&&modelReference(c)===reference);
 return matches.find(c=>c.isDefault)||matches[0];
}
export type GatewayRequest={
 model:string;pin?:string;app:string;platform:string;source:'模型体验'|'智能体对话'|'智能体调试'|'网关演练';
 agent?:string;fault?:'timeout'|'auth'|'none';
};
export type GatewayCall={
 id:string;time:number;app:string;source:GatewayRequest['source'];agent:string;platform:string;
 requested:string;requestedModel:string;connectionId:string;provider:string;model:string;
 status:'成功'|'降级成功'|'已限流'|'失败';reason:string;rules:Partial<Record<RuleKind,string>>;
 attempts:{id:string;model:string;ok:boolean}[];
};

/** 本地一次调用留一条记录。负载只在同模型连接间分流，跨模型切换必须由后备规则显式授权。 */
export function dispatchModel(connections:readonly Connection[],rules:readonly GatewayRule[],history:readonly GatewayCall[],request:GatewayRequest,now=Date.now()):GatewayCall{
 const selected=resolveModelConnection(connections,request.model);
 const call:GatewayCall={id:crypto.randomUUID(),time:now,app:request.app,source:request.source,platform:request.platform,
  agent:request.agent||'',requested:request.model,requestedModel:selected?.model||'',connectionId:'',provider:'',model:'',
  status:'失败',reason:'所选模型没有可用连接',rules:{},attempts:[]};
 if(!selected||selected.enabled===false)return call;
 const enabled=connections.filter(c=>c.enabled!==false);
 const pool=enabled.filter(c=>modelReference(c)===modelReference(selected));
 const pinned=request.pin?pool.find(c=>c.id===request.pin):undefined;
 if(request.pin&&!pinned)return call;
 // 具体应用覆盖通用规则；同一范围后保存的规则优先。
 function matching(kind:RuleKind,ids:string[]){
  const candidates=rules.filter(r=>r.kind===kind&&r.enabled&&r.targets.some(id=>ids.includes(id)));
  candidates.reverse();
  return candidates.find(r=>r.app===request.app)||candidates.find(r=>r.app==='全部应用');
 }
 const ids=pinned?[pinned.id]:pool.map(c=>c.id);
 const rate=matching('rate',ids);
 if(rate){
  call.rules.rate=rate.id;
  const count=history.filter(h=>h.app===request.app&&h.rules.rate===rate.id&&h.attempts.length>0&&h.time>now-rate.window*1000).length;
  if(simulateRule(rate,{requests:count}).decision==='拒绝'){
   call.status='已限流';call.reason=`${rate.name} · ${rate.window} 秒内最多 ${rate.limit} 次`;return call;
  }
 }
 let primary=pinned||selected;
 const load=!pinned&&matching('load',ids);
 if(load){
  call.rules.load=load.id;
  const group=modelReference(selected);
  const sequence=history.filter(h=>h.app===request.app&&h.rules.load===load.id&&h.requestedModel===selected.model&&h.attempts.length).length;
  const choice=simulateRule(load,{sequence,failed:load.targets.filter(id=>!pool.some(c=>c.id===id&&modelReference(c)===group))});
  primary=pool.find(c=>c.id===choice.target)||primary;
 }
 const fallback=!pinned&&matching('fallback',[primary.id]);
 const backups=fallback?fallback.targets.flatMap(id=>{
  const target=enabled.find(c=>c.id===id&&c.id!==primary.id&&(c.role||'LLM')===(primary.role||'LLM'));
  return target?[target]:[];
 }):[];
 for(const target of [primary,...backups]){
  const breaker=matching('breaker',[target.id]);
  if(breaker){
   call.rules.breaker=breaker.id;
   let failures=0,lastFailure=0;
   for(const h of history){
    if(h.app!==request.app||h.rules.breaker!==breaker.id)continue;
    const attempt=h.attempts.find(a=>a.id===target.id);
    if(attempt?.ok)break;
    if(attempt){failures++;lastFailure ||= h.time;}
   }
   if(failures>=breaker.limit&&now-lastFailure<breaker.window*1000){
    call.reason='渠道熔断冷却中';if(fallback)call.rules.fallback=fallback.id;continue;
   }
  }
  const failed=target.id===primary.id&&!!request.fault&&request.fault!=='none';
  call.attempts.push({id:target.id,model:target.model,ok:!failed});
  call.connectionId=target.id;call.model=target.model;call.provider=target.provider;
  if(!failed){
   call.status=target.id===primary.id?'成功':'降级成功';call.reason=target.name;return call;
  }
  if(request.fault==='auth'){call.reason='鉴权失败，不重试';return call;}
  call.reason='主连接超时';if(fallback)call.rules.fallback=fallback.id;
 }
 return call;
}
export function gatewayUsage(call:GatewayCall):UsageRow{
 return {id:call.id,date:new Date(call.time).toLocaleDateString('sv-SE'),app:call.app,platform:call.platform,
  provider:call.provider||'未转发',model:call.model||call.requestedModel||'不可用模型',agent:call.agent,device:'',
  requests:1,failed:Number(call.status==='失败'||call.status==='已限流'),tokens:null,cost:null,cached:0,baseline:0};
}
