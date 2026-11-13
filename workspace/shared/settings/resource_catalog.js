import { AGENT_SAMPLES, PLUGIN_SAMPLES, SKILL_SAMPLES, COMMAND_SAMPLES, MCP_SAMPLES, HOOK_SAMPLES } from './catalog_samples.js';
// 界面底稿使用确定性样本；与本机安装目录、运行权限完全分离。
export const TOOLS=['Read','Grep','Glob','Bash','Edit','Write','WebFetch','WebSearch','TodoWrite'];
export function projectResourceGroups(items,scope,query='') {
  const scoped=items.filter(item=>item.scope===scope);
  const matched=scoped.filter(item=>`${item.name} ${item.description||''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const groups=new Map();
  for(const item of matched.filter(item=>item.pluginId)) {if(!groups.has(item.pluginId))groups.set(item.pluginId,{id:item.pluginId,title:item.pluginName,items:[]});groups.get(item.pluginId).items.push(item)}
  return {total:scoped.length,installed:matched.filter(item=>!item.pluginId),plugins:[...groups.values()]};
}
export function saveResourceDraft(items,draft,{allowDuplicateNames=false}={}) {
  const name=draft.name?.trim(); if(!name)throw new Error('请输入名称');
  if(!allowDuplicateNames&&items.some(item=>item.id!==draft.id&&item.scope===draft.scope&&item.name.toLowerCase()===name.toLowerCase()))throw new Error('当前范围已存在同名配置');
  const next={...draft,name,id:draft.id||crypto.randomUUID(),origin:'会话草稿'};
  return draft.id?items.map(item=>item.id===draft.id?next:item):[...items,next];
}
export function createCatalogSamples() {
  const base=(id,name,description)=>({id,name,description,scope:'user',enabled:true,origin:'界面样例'});
  const managed=(item,pluginId)=>pluginId?{...item,pluginId,pluginName:PLUGIN_SAMPLES.find(plugin=>plugin[0]===pluginId)[1]}:item;
  const models=[['mimo','mimo-v2.6-flash'],['bigmodel','GLM-5.3'],['deepseek','deepseek-chat'],['local','qwen3-coder:30b']];
  const catalog = {
    agents:AGENT_SAMPLES.map(([name,description,color],index)=>({
      ...base(`agent-${name}`,name,description),source:'user',color,enabled:index!==18&&index!==19,
      tools:index%5===4?['Read','Grep','Glob','WebSearch']:[...TOOLS],injectAgentsMd:true,
      modelSelection:{providerId:models[index%models.length][0],modelId:models[index%models.length][1]},
      systemPrompt:`# ${name}\n\n## 职责\n\n${description}\n\n## 执行方法\n\n1. 阅读已有实现、相关约定和任务要求。\n2. 明确输入、输出、依赖和操作范围。\n3. 根据证据制定步骤，逐项记录执行结果。\n4. 验证变更的目标行为与受影响流程。\n\n## 交付要求\n\n提供结论、关键文件、验证结果和待办；对未验证的能力明确说明。`,content:description,
    })),
    plugins:PLUGIN_SAMPLES.map(([id,name,description],index)=>({...base(id,name,description),enabledSource:'user',enabled:index!==10&&index!==11,updateAvailable:index===3||index===12})),
    mcp:MCP_SAMPLES.map(([name,description,pluginId,config],index)=>managed({
      ...base(`mcp-${pluginId||'user'}-${name}`,name,pluginId?`${description} 配置由 ${PLUGIN_SAMPLES.find(plugin=>plugin[0]===pluginId)[1]} 管理。`:description),
      config:config?structuredClone(config):undefined,status:'disconnected',enabled:index!==2,
    },pluginId)),
    skills:SKILL_SAMPLES.map(([name,description,pluginId],index)=>managed({
      ...base(`skill-${name}`,name,description),enabled:index!==6&&index!==23,
      content:`---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n\n## 适用场景\n\n${description}\n\n## 执行步骤\n\n1. 确认目标、输入资料和现有实现。\n2. 列出关键约束与需要核对的信息。\n3. 在确认的范围内执行，保存必要的中间结果。\n4. 对照需求检查输出，整理验证证据。\n\n## 输出要求\n\n给出结果、依据、验证情况和后续建议。此内容用于设置界面演示。`,
    },pluginId)),
    commands:COMMAND_SAMPLES.map(([name,description,argumentHint,pluginId])=>managed({
      ...base(`command-${name}`,`/${name}`,description),argumentHint,
      prompt:`目标：${description}\n\n用户输入：$ARGUMENTS\n\n先核对上下文和已有实现，再列出操作步骤。完成后汇报变更、验证结果与待办。`,
      source:pluginId?'plugin':'user',location:{source:'zcode'},
    },pluginId)),
    hooks:HOOK_SAMPLES.map(([event,description,command,pluginId],index)=>managed({
      ...base(`hook-${pluginId||'user'}-${index}`,event,description),event,command,args:[],enabled:index!==1,
    },pluginId)),
  };
  // 为范围切换提供独立副本，工作区编辑不会更改用户范围的样本。
  for (const [kind,items] of Object.entries(catalog)) {
    const workspaceItems=items.filter(item=>!item.pluginId).slice(0,kind==='agents'||kind==='skills'?8:3);
    items.push(...workspaceItems.map(item=>({...structuredClone(item),id:`workspace-${item.id}`,scope:'workspace',...(kind==='plugins'?{enabledSource:'workspace'}:{})})));
  }
  return catalog;
}
