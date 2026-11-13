import {createCatalogSamples} from './settings/resource_catalog.js';
export const PLUGIN_SCHEMA='https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
const purposes={
 '开发与质量':['superpowers','video2code','42crunch','android-emulator','codeguard'],
 '设计与创作':['video-agent-kit','processon-design','stitch-design','blender-design','comfy-design','image-factory','jianying-edit','design-toolkit'],
 '办公与自动化':['bt-linux-panel','browser-use','computer-use','workspace-tools','automation-kit'],
 '知识与数据':['agentdb'],
};
const samples=createCatalogSamples();
export const publicPluginDirectory=samples.plugins.filter(p=>p.scope==='user').map(p=>({...p,directoryId:`public:${p.id}`,category:Object.entries(purposes).find(([,ids])=>ids.includes(p.id))?.[0]||'其他',sourceType:'public'}));
export const pluginPurposes=['全部',...Object.keys(purposes)];
const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
export function parsePluginManifest(text){
 if(new TextEncoder().encode(text).length>200*1024)throw new Error('plugin.json 不得超过 200 KB');
 let input;try{input=JSON.parse(text)}catch{throw new Error('plugin.json 不是有效 JSON')}
 if(!isObject(input))throw new Error('插件清单必须是 JSON 对象');
 if(input.$schema!==PLUGIN_SCHEMA)throw new Error('需要 Agent Plugins 1.0.0 的规范标识');
 if(typeof input.name!=='string'||input.name.length>64||! /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(input.name)||input.name.includes('--')||input.name.includes('..'))throw new Error('插件标识需为 1–64 位小写字母、数字、点或连字符；首尾为字母或数字，不能连续使用点或连字符');
 const manifest={$schema:PLUGIN_SCHEMA,name:input.name},warnings=[];
 for(const key of ['version','description','homepage','repository','license'])if(key in input){if(typeof input[key]!=='string')throw new Error(`${key} 必须是字符串`);manifest[key]=input[key]}
 if('author' in input){if(!isObject(input.author)||Object.entries(input.author).some(([key,value])=>!['name','email','url'].includes(key)||typeof value!=='string'))throw new Error('author 必须包含有效的 name/email/url 字符串');manifest.author=input.author}
 if('keywords' in input){if(!Array.isArray(input.keywords)||input.keywords.some(v=>typeof v!=='string'))throw new Error('keywords 必须是字符串数组');manifest.keywords=input.keywords}
 if('extensions' in input){if(!isObject(input.extensions))warnings.push('extensions 不是对象，已忽略');else manifest.extensions=input.extensions}
 for(const key of Object.keys(input))if(!['$schema','name','version','description','author','homepage','repository','license','keywords','extensions'].includes(key))warnings.push(`不支持的字段 ${key} 已忽略`);
 return {manifest,warnings};
}
export function addPersonalPlugin(items,draft){
 if(items.some(p=>p.name.toLowerCase()===draft.name.toLowerCase()&&(p.repositoryId||null)===(draft.repositoryId||null)))throw new Error('当前来源已存在同名插件');
 const id=crypto.randomUUID();return [...items,{...draft,id,directoryId:`personal:${id}`,repositoryId:draft.repositoryId||null,sourceType:'personal'}];
}
export function groupPluginDirectory(items,repositories,tab,query='',category='全部'){
 const term=query.trim().toLowerCase();
 const matches=p=>`${p.name} ${p.description||''}`.toLowerCase().includes(term);
 if(tab==='public')return pluginPurposes.slice(1).filter(c=>category==='全部'||category===c).map(c=>({id:c,name:c,items:items.filter(p=>p.category===c&&matches(p))})).filter(g=>g.items.length);
 const ids=new Set(repositories.map(r=>r.id));
 const groups=repositories.map(r=>({...r,items:items.filter(p=>p.repositoryId===r.id&&matches(p))}));
 const local=items.filter(p=>(!p.repositoryId||!ids.has(p.repositoryId))&&matches(p));
 if(local.length)groups.push({id:'local',name:'本地与未分组',items:local});
 return term?groups.filter(g=>g.items.length):groups;
}
export function removePluginRepository(items,repositories,id){return {items:items.map(p=>p.repositoryId===id?{...p,repositoryId:null}:p),repositories:repositories.filter(r=>r.id!==id)}}
export const pluginDirectoryKey=item=>item.directoryId||`personal:${item.id}`;
export function findInstalledPlugin(plugins,item,scope){
 return plugins.find(p=>p.scope===scope&&(p.directoryId?p.directoryId===pluginDirectoryKey(item):item.sourceType==='public'?p.id===(scope==='user'?item.id:`workspace-${item.id}`):(p.id===item.id||(!item.directoryId&&!item.repositoryId&&p.source==='mock-personal'&&p.name.toLowerCase()===item.name.toLowerCase()))));
}
export function installDirectoryPlugin(catalog,item,scope){
 if(!['user','workspace'].includes(scope))throw new Error('请选择安装范围');
 if(findInstalledPlugin(catalog.plugins,item,scope))throw new Error('当前范围已安装该插件');
 const id=crypto.randomUUID(),plugin={id,name:item.name,description:item.description||'',scope,enabled:true,enabledSource:scope,version:item.manifest?.version||item.version||(item.sourceType==='claude-public'?'未声明':'1.0.0'),origin:'目录安装',directoryId:pluginDirectoryKey(item),repositoryId:item.repositoryId||null,source:item.sourceType||'personal',...(item.marketplaceId?{marketplaceId:item.marketplaceId,author:item.author,sourceUrl:item.sourceUrl,claudeInstallCommand:item.claudeInstallCommand}: {})};
 const result={...catalog,plugins:[...catalog.plugins,plugin]};
 // 公共示例恢复对应样本资源；仅导入清单的个人插件不能凭空生成技能或 MCP。
 for(const kind of ['skills','mcp','commands','hooks'])result[kind]=[...catalog[kind],...(item.sourceType==='public'?samples[kind].filter(r=>r.pluginId===item.id&&r.scope==='user').map(r=>({...structuredClone(r),id:crypto.randomUUID(),scope,pluginId:id,pluginName:item.name,pluginEnabled:true})):[])];
 return result;
}
