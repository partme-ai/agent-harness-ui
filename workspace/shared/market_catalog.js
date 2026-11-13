export const resourceKey=(type,r)=>JSON.stringify([type,r.scope,r.id]);
export const categories=['全部','开发工具','办公协同','数据分析','内容创作','运行维护'];
export function categoryOf(r){
 const text=`${r.name} ${r.description||''}`;
 if(/data|数据|分析|database/i.test(text))return '数据分析';
 if(/文档|office|pdf|excel|word|会议/i.test(text))return '办公协同';
 if(/创作|视觉设计|image|video|blender|写作/i.test(text))return '内容创作';
 if(/运维|security|sre|deploy|安全|监控/i.test(text))return '运行维护';
 return '开发工具';
}
export function filterMarket(items,{query='',category='全部',suite=false}={}){
 return items.filter(r=>(category==='全部'||categoryOf(r)===category)&&(!suite||r.pluginId)&&`${r.name} ${r.description||''}`.toLowerCase().includes(query.trim().toLowerCase()));
}
export function skillDraft(filename,content){
 if(!/\.md$/i.test(filename))throw new Error('请选择 Markdown (.md) 文件');
 if(!content.trim())throw new Error('技能内容不能为空');
 if(content.length>200000)throw new Error('技能内容不能超过 200 KB');
 return {name:filename.replace(/\.md$/i,''),description:'导入的本地技能草稿',content,scope:'user',enabled:true};
}
export const scenes=[
 {title:'软件开发',description:'从需求分析到代码交付',match:/architect|developer|reviewer/},
 {title:'文档与知识',description:'整理资料，沉淀可用知识',match:/writer|skills|prompt/},
 {title:'数据研究',description:'汇总信息，验证分析结论',match:/data|research|database/},
 {title:'工程保障',description:'测试、部署与稳定性',match:/test|security|sre|devops/},
];
export function expertTeams(agents){return scenes.map((scene,index)=>({id:`team-${index}`,scope:'user',name:`${scene.title}协作组`,description:scene.description,members:agents.filter(a=>a.scope==='user'&&scene.match.test(a.name)).slice(0,4),enabled:true,team:true}));}
