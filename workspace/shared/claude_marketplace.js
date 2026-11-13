// Claude marketplace 是宿主目录格式，不是 Agent Plugins 可移植清单。
export const CLAUDE_MARKETPLACE_ID='claude-plugins-official';
export const CLAUDE_MARKETPLACE_REPOSITORY='https://github.com/anthropics/claude-plugins-official';
export const CLAUDE_MARKETPLACE_URL='https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json';
const categories={development:'开发与质量',testing:'开发与质量',security:'安全',design:'设计与创作',productivity:'办公与自动化',automation:'办公与自动化',database:'知识与数据',learning:'学习',deployment:'部署与运维',monitoring:'部署与运维',migration:'部署与运维',location:'位置服务',math:'数学'};
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function safeUrl(value){
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password)throw new Error('目录包含无效的 HTTPS 来源');
 return url.href;
}
function safePath(value){
 if(typeof value!=='string'||!value||value.startsWith('/')||/[\\%?#\x00-\x1f]/.test(value)||value.split('/').some(p=>!p||p==='..'||p==='.'))throw new Error('目录包含无效的源码路径');
 return value.split('/').map(encodeURIComponent).join('/');
}
function sourceUrl(source){
 if(typeof source==='string'&&source.startsWith('./'))return `${CLAUDE_MARKETPLACE_REPOSITORY}/tree/main/${safePath(source.slice(2))}`;
 if(!object(source))throw new Error('目录缺少有效的插件来源');
 if(source.source==='github'){
  if(!/^[\w.-]+\/[\w.-]+$/.test(source.repo||''))throw new Error('目录包含无效的 GitHub 仓库');
  return `https://github.com/${source.repo}`;
 }
 if(['url','git-subdir'].includes(source.source)){
  const url=safeUrl(source.url);
  if(source.source==='git-subdir'){
   const path=safePath(source.path);
   if(new URL(url).hostname==='github.com')return `${url.replace(/\.git$/,'').replace(/\/$/,'')}/tree/${encodeURIComponent(source.sha||source.ref||'HEAD')}/${path}`;
  }
  return url;
 }
 throw new Error('目录包含暂不支持的插件来源');
}
export function parseClaudeMarketplace(data){
 if(!object(data)||data.name!==CLAUDE_MARKETPLACE_ID||!Array.isArray(data.plugins)||!data.plugins.length||data.plugins.length>5000)throw new Error('Claude 插件目录格式无效');
 const names=new Set();
 return data.plugins.map(p=>{
  if(!object(p)||typeof p.name!=='string'||! /^[a-z0-9][a-z0-9._-]{0,127}$/.test(p.name)||names.has(p.name))throw new Error('Claude 目录包含无效或重复插件标识');
  names.add(p.name);
  if(p.description!==undefined&&typeof p.description!=='string')throw new Error('Claude 目录描述格式无效');
  return {id:`claude:${p.name}`,directoryId:`${CLAUDE_MARKETPLACE_ID}:${p.name}`,name:p.name,description:p.description||'',sourceType:'claude-public',marketplaceId:CLAUDE_MARKETPLACE_ID,repositoryId:CLAUDE_MARKETPLACE_ID,category:categories[p.category]||'其他',author:typeof p.author?.name==='string'?p.author.name:'未提供',version:typeof p.version==='string'?p.version:undefined,source:structuredClone(p.source),sourceUrl:sourceUrl(p.source),homepage:p.homepage?safeUrl(p.homepage):undefined,claudeInstallCommand:`claude plugin install ${p.name}@${CLAUDE_MARKETPLACE_ID}`};
 });
}
export async function fetchClaudeMarketplace(fetcher=globalThis.fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetcher(CLAUDE_MARKETPLACE_URL,{signal:controller.signal,credentials:'omit',cache:'no-store',redirect:'error'});
  if(!response.ok)throw new Error(`Claude 目录请求失败（HTTP ${response.status}）`);
  if(Number(response.headers.get('content-length'))>2*1024*1024)throw new Error('Claude 目录超过 2 MB');
  const raw=await response.text();
  if(new TextEncoder().encode(raw).length>2*1024*1024)throw new Error('Claude 目录超过 2 MB');
  const catalog=JSON.parse(raw),items=parseClaudeMarketplace(catalog);
  return {catalog,items,fetchedAt:new Date().toISOString()};
 }finally{clearTimeout(timer)}
}
