import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleSessions,selectTarget,planCapabilities,bindDevice,initialDeviceWorkspace,capabilityKey,resolveTurnTarget} from '../device_workspace.js';
test('Chat is visible across bound roles; Work stays with its owner',()=>{
 const items=[{id:'chat',kind:'chat',owner:'phone'},{id:'work',kind:'work',owner:'desktop'},{id:'own',kind:'work',owner:'phone'}];
 assert.deepEqual(visibleSessions(items,'phone').map(s=>s.id),['chat','own']);
 assert.deepEqual(visibleSessions(items,'tablet').map(s=>s.id),['chat']);
});
test('Offline and unbound targets cannot silently take a turn',()=>{
 const state=initialDeviceWorkspace();
 assert.equal(selectTarget(state.devices,'desktop').id,'desktop');
 assert.throws(()=>selectTarget(state.devices,'spare'),/离线/);
 assert.throws(()=>selectTarget(state.devices,'candidate'),/绑定/);
});
test('Sync checks each type, destination compatibility and manual exclusions',()=>{
 const resources=[{type:'plugin',id:'a',name:'研究插件'},{type:'mcp',id:'b',name:'文件系统',roles:['desktop']},{type:'skill',id:'c',name:'写作'},{type:'command',id:'d',name:'/review'}];
 const plan=planCapabilities(resources,'phone',[capabilityKey(resources[2])]);
 assert.deepEqual(plan.filter(r=>r.sync).map(r=>r.id),['a','d']);
 assert.equal(plan.find(r=>r.id==='b').reason,'目标设备不适用');
 assert.equal(plan.find(r=>r.id==='c').reason,'手动排除');
});
test('Binding records a reviewable plan without executing an installer',()=>{
 const state=initialDeviceWorkspace();
 const next=bindDevice(state,'candidate',[{type:'command',id:'a',name:'/review'}],'phone',[]);
 assert.equal(state.devices.find(d=>d.id==='candidate').bound,false);
 assert.equal(next.devices.find(d=>d.id==='candidate').bound,true);
 assert.equal(next.syncResults[0].items[0].sync,true);
 assert.equal(next.syncResults[0].status,'demo');
});
test('Local Work remains local when this device is offline; Chat still requires an online target',()=>{
 const devices=[{id:'phone',role:'phone',bound:true,online:false}];
 assert.equal(resolveTurnTarget(devices,{kind:'work',role:'phone',target:'desktop'}).id,'phone');
 assert.throws(()=>resolveTurnTarget(devices,{kind:'chat',role:'phone',target:'phone'}),/离线/);
});
