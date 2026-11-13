const encoder=new TextEncoder();
const collections={keys:[],vault:[]};
let keyPromise;

export async function saveSessionSecret(kind,name,value){
 if(!Object.hasOwn(collections,kind))throw Error('未知凭据类型');
 if(!name.trim()||!value.trim())throw Error('名称和内容不能为空');
 keyPromise??=crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt']);
 const key=await keyPromise,iv=crypto.getRandomValues(new Uint8Array(12));
 const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,encoder.encode(value)));
 const existing=collections[kind].findIndex(entry=>entry.name===name.trim());
 const entry={id:existing<0?crypto.randomUUID():collections[kind][existing].id,name:name.trim(),iv,ciphertext};
 if(existing<0)collections[kind].push(entry);else collections[kind][existing]=entry;
 return listSessionSecrets(kind);
}

export function listSessionSecrets(kind){
 if(!Object.hasOwn(collections,kind))throw Error('未知凭据类型');
 return collections[kind].map(({id,name})=>({id,name}));
}
