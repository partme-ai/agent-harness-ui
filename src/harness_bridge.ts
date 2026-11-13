import type {Connection} from './state';

// Only non-secret model identity crosses from the embedded console to the workbench.
export function publicModelOptions(connections:Connection[]){
 return connections.filter(item=>item.enabled!==false&&item.model).map(item=>({id:item.id,provider:item.provider,model:item.model,isDefault:item.isDefault===true}));
}
