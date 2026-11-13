import test from 'node:test';
import assert from 'node:assert/strict';
import {contextResources,addContextReference} from '../composer_context.js';
test('能力选择排除停用插件及其技能，按类型和范围搜索',()=>{
 const catalog={plugins:[{id:'p',name:'Plugin',scope:'user',enabled:false},{id:'q',name:'Other',scope:'workspace',enabled:true}],skills:[{id:'s',name:'Skill',pluginId:'p',scope:'user',enabled:true},{id:'t',name:'Search',scope:'workspace',enabled:true}]};
 const items=contextResources(catalog,[{id:'c',name:'会话'}]);
 assert.equal(items.some(i=>i.resourceId==='p'||i.resourceId==='s'),false);
 assert.equal(contextResources(catalog,[],'search')[0].resourceId,'t');
 assert.equal(items.find(i=>i.resourceId==='q').scope,'workspace');
});
test('引用身份含类型与范围，重复选择幂等，不将 ID 拼成正文',()=>{
 const a={type:'skill',resourceId:'a',scope:'user',name:'同名'},b={...a,scope:'workspace'};
 const items=addContextReference(addContextReference([],a),a);
 assert.equal(items.length,1);assert.equal(addContextReference(items,b).length,2);assert.equal(items[0].resourceId,'a');
});
