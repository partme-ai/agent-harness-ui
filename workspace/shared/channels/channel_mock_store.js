const KEY = 'tinyclaw.channel-prototype.v1';
export const mockChannelKey = (channelId, identity) => `${channelId}:${identity.trim().toLowerCase()}`;
function readStorage(storage) {
  try { const value=JSON.parse(storage?.getItem(KEY) || '{}'); return value && typeof value==='object' && !Array.isArray(value) ? value : {}; }
  catch { return {}; }
}
export function createChannelMockStore(storage=globalThis.localStorage) {
  let rows=readStorage(storage);
  const listeners=new Set();
  const notify=()=>{for(const callback of listeners) callback();};
  const save=()=>{storage?.setItem(KEY,JSON.stringify(rows));notify();};
  return {
    list:()=>rows,
    subscribe:callback=>{listeners.add(callback);return()=>listeners.delete(callback);},
    configure:(channelId,identity,{endpoint='',scope='current',reply='summary'}={})=>{
      const clean=identity.trim(); if(!clean) throw new Error('请输入实例名称');
      const key=mockChannelKey(channelId,clean);
      rows={...rows,[key]:{channelId,identity:clean,endpoint:endpoint.trim(),scope,reply,status:'configured',updatedAt:new Date().toISOString(),lastResult:''}};
      save();return rows[key];
    },
    simulate:(key,result='connected')=>{
      if(!rows[key])throw new Error('请先保存配置');
      if(!['connected','failed','disconnected'].includes(result))throw new Error('未知仿真结果');
      rows={...rows,[key]:{...rows[key],status:result,updatedAt:new Date().toISOString(),lastResult:result==='connected'?'模拟连接成功':result==='failed'?'模拟连接失败':'已断开'}};
      save();return rows[key];
    },
    test:(key)=>{
      if(!rows[key])throw new Error('请先保存配置');
      if(rows[key].status!=='connected')throw new Error('请先完成模拟连接');
      rows={...rows,[key]:{...rows[key],lastResult:'模拟收发成功',updatedAt:new Date().toISOString()}};
      save();return rows[key];
    },
    remove:key=>{const next={...rows};delete next[key];rows=next;save();}
  };
}
export const channelMockStore=createChannelMockStore();
