// ZCode V4ComposerModeControls: Plan 独立于三种权限；配置属于提交草稿。
export const permissionOptions = [
 {value:'confirm',label:'变更前确认',description:'改文件前先问我。',icon:'hand'},
 {value:'auto',label:'自动编辑',description:'自动编辑文件。',icon:'shield'},
 {value:'full',label:'完全访问',description:'减少确认次数。',icon:'shield'},
];
export const thoughtOptions = ['低','中','高','最高'];
export function availableComposerModels(providers){
 return providers.flatMap(provider=>(provider.models||[]).filter(model=>provider.enabledModels?.[model]!==false).map(model=>({key:JSON.stringify([provider.id,model]),providerId:provider.id,providerName:provider.name,modelId:model})));
}
export function shouldSubmitOnEnter(event){
 return event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&event.keyCode!==229;
}
