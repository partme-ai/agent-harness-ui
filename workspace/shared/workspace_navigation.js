// 三端共享产品导航；账户与设备控制不占用业务栏目。
export const workspaceNavigation=[
 {id:'home',label:'新建任务',icon:'new'},
 {id:'tasks',label:'定时任务',icon:'tasks'},
 {id:'plugins',label:'插件市场',icon:'plugins'},
 {id:'knowledge',label:'资料库',icon:'library'},
 {id:'project',label:'项目空间',icon:'project'},
 {id:'office',label:'工作空间',icon:'office'},
 {id:'creative',label:'创作空间',icon:'creative'},
];
const modeSpaces={'办公':'office','编程':'project','创作':'creative'};
const spaceModes=Object.fromEntries(Object.entries(modeSpaces).map(([mode,space])=>[space,mode]));
export function modeForSpace(page){return spaceModes[page]||null;}
export function spaceForMode(mode){return modeSpaces[mode]||modeSpaces['办公'];}
export function workspaceNavigationForMode(mode){
 const space=spaceForMode(mode);
 return workspaceNavigation.filter(item=>!spaceModes[item.id]||item.id===space);
}
export const initialProjects=()=>['示例工作区','产品研究'];
export function validateProjectName(name,names){
 if(!name.trim())return '请填写项目名称';
 if(names.includes(name.trim()))return '项目名称已存在';
 return '';
}
