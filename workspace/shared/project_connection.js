// 预览连接仅保存非敏感描述；真正的连接和文件权限由宿主运行时提供。
export function validateConnection(method,config){
 if(method==='ssh'){
  if(!/^[a-zA-Z0-9][a-zA-Z0-9.:-]*$/.test(config.host.trim()))return '请输入有效的 SSH 主机名或 IP 地址';
  if(!/^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/.test(config.user.trim()))return '请输入 SSH 用户名';
  if(!/^\d+$/.test(String(config.port))||Number(config.port)<1||Number(config.port)>65535)return '端口需为 1–65535 的整数';
 }else if(method==='docker'){
  if(!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(config.container.trim()))return '请输入容器名称或 ID';
 }else return '请选择连接方式';
 return '';
}
export function validateProjectDirectory(path){
 if(!path.trim().startsWith('/')||/[\x00-\x1f]/.test(path)||path.split('/').includes('..'))return '请输入绝对目录路径，不包含 .. 或控制字符';
 return '';
}
export function remoteProjectDescriptor(method,config,path){
 const error=validateConnection(method,config)||validateProjectDirectory(path);if(error)throw new Error(error);
 const directory=path.trim().replace(/\/+$/,'')||'/';
 return {kind:method,directory,status:'preview',...(method==='ssh'?{host:config.host.trim(),user:config.user.trim(),port:Number(config.port)}:{container:config.container.trim()})};
}
