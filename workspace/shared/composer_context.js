// 草稿引用协议：类型、范围与资源 ID 独立于用户正文，供后续原生端复用。
export const contextTypeNames={conversation:'会话',plugin:'插件',skill:'技能',workflow:'工作流'};
export const demoConversations=[{id:'research',name:'新产品市场调研',description:'示例会话 · 已整理资料，等待确认'},{id:'notes',name:'整理会议纪要',description:'示例会话 · 上次更新：昨天'}];
export const demoWorkflows=[{id:'research-report',name:'资料研究 → 报告',description:'示例工作流 · 检索、核对来源、整理报告'},{id:'document-actions',name:'文档 → 行动清单',description:'示例工作流 · 提取要点、确认待办'}];
export function contextResources(catalog,conversations=[],query=''){
 const map=(items,type)=>(items||[]).filter(i=>i.enabled!==false&&i.pluginEnabled!==false&&(!i.pluginId||(catalog.plugins||[]).some(p=>p.id===i.pluginId&&p.scope===i.scope&&p.enabled!==false))).map(i=>({type,resourceId:i.id,scope:i.scope||'workspace',name:i.name,description:i.description||''}));
 const all=[...map(conversations,'conversation'),...map(catalog.plugins,'plugin'),...map(catalog.skills,'skill'),...map(demoWorkflows,'workflow')];
 const text=query.trim().toLowerCase();return all.filter(i=>`${contextTypeNames[i.type]} ${i.name} ${i.description}`.toLowerCase().includes(text));
}
export function contextIdentity(item){return JSON.stringify([item.type,item.scope,item.resourceId]);}
export function addContextReference(items,item){return items.some(i=>contextIdentity(i)===contextIdentity(item))?items:[...items,{...item}];}
