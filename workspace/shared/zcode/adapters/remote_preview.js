// 仅供显式点击“模拟连接”后的内存目录；不会读取或创建用户文件。
export const previewDirectoryServices={
 systemService:{info:async()=>({homedir:'/workspace'})},
 fileService:{readdir:async({path,includeHidden})=>{
  const entries={
   '/':[{name:'workspace',path:'/workspace',type:'directory'}],
   '/workspace':[{name:'example-project',path:'/workspace/example-project',type:'directory'},...(includeHidden?[{name:'.config',path:'/workspace/.config',type:'directory'}]:[])],
   '/workspace/example-project':[], '/workspace/.config':[],
  };
  if(!(path in entries))throw new Error('演示目录不存在');
  return entries[path];
 }}
};
