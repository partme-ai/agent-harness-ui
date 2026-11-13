// 本地三端交互样本。不能作为发现服务、远程执行或访问控制实现。
export const deviceNames={phone:'我的手机',tablet:'我的平板',desktop:'工作电脑'};
export function initialDeviceWorkspace(){return {devices:[
 {id:'phone',role:'phone',name:deviceNames.phone,bound:true,online:true},
 {id:'tablet',role:'tablet',name:deviceNames.tablet,bound:true,online:true},
 {id:'desktop',role:'desktop',name:deviceNames.desktop,bound:true,online:true},
 {id:'spare',role:'desktop',name:'备用电脑',bound:true,online:false},
 {id:'candidate',role:'tablet',name:'研究平板',bound:false,online:true},
],sessions:[],syncResults:[]};}
export function visibleSessions(sessions,role){return sessions.filter(s=>s.kind==='chat'||s.kind==='work'&&s.owner===role);}
export function selectTarget(devices,id){const device=devices.find(d=>d.id===id);if(!device?.bound)throw new Error('请先绑定该设备');if(!device.online)throw new Error('目标设备已离线，草稿已保留');return device;}
export function capabilityKey(item){return JSON.stringify([item.type,item.scope||'user',item.id]);}
export function planCapabilities(items,targetRole,excluded=[]){return items.map(item=>{const compatible=!item.roles||item.roles.includes(targetRole);const omitted=excluded.includes(capabilityKey(item));return {...item,sync:compatible&&!omitted,compatible,reason:!compatible?'目标设备不适用':omitted?'手动排除':'默认同步'};});}
export function bindDevice(state,id,items,targetRole,excluded){const device=state.devices.find(d=>d.id===id);if(!device)throw new Error('设备不存在');return {...state,devices:state.devices.map(d=>d.id===id?{...d,bound:true}:d),syncResults:[{deviceId:id,targetRole,status:'demo',items:planCapabilities(items,targetRole,excluded)},...state.syncResults]};}
export function resolveTurnTarget(devices,{kind,target,role}){if(kind==='work'){const local=devices.find(d=>d.id===role);if(!local)throw new Error('本机设备信息缺失');return local;}return selectTarget(devices,target);}
