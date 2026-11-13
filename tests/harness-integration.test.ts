import test from 'node:test';
import assert from 'node:assert/strict';
import {pages} from '../src/catalog.ts';
import {workspaceNavigation} from '../workspace/shared/workspace_navigation.js';
import {HARNESS_SETTINGS_GROUPS,CONSOLE_SECTIONS,consolePath} from '../workspace/shared/settings/harness_sections.js';
import {publicModelOptions} from '../src/harness_bridge.ts';
import {listSessionSecrets,saveSessionSecret} from '../workspace/shared/settings/secret_memory.js';

test('工作台主菜单覆盖任务、资料库和三类协作空间',()=>{
 assert.deepEqual(workspaceNavigation.map(item=>item.label),['新建任务','定时任务','插件市场','资料库','项目空间','工作空间','创作空间']);
 assert.equal(new Set(workspaceNavigation.map(item=>item.id)).size,workspaceNavigation.length);
});

test('配置模型同步到工作台时不传递凭据',()=>{
 const result=publicModelOptions([{id:'m1',name:'测试连接',provider:'演示厂商',model:'test-model',status:'待检测',enabled:true,isDefault:true,endpoint:'https://example.test',config:{providerId:'p',schemeId:'s',region:'',plan:'',protocol:'',auth:'secret',modelMode:'catalog',endpointTemplate:'',fields:{apiKey:'secret'},parameters:{},credentialRef:'secret'}}]);
 assert.deepEqual(result,[{id:'m1',provider:'演示厂商',model:'test-model',isDefault:true}]);
});

test('沙箱密钥与凭据只返回名称和标识，彼此隔离',async()=>{
 const saved=await saveSessionSecret('vault','演示站点','example-password');
 assert.equal(saved.length,1);
 assert.deepEqual(Object.keys(saved[0]).sort(),['id','name']);
 assert.equal(saved[0].name,'演示站点');
 assert.deepEqual(listSessionSecrets('keys'),[]);
 assert.equal(JSON.stringify(saved).includes('example-password'),false);
 const replaced=await saveSessionSecret('vault','演示站点','replacement-password');
 assert.equal(replaced.length,1);
 assert.equal(replaced[0].id,saved[0].id);
 assert.equal(JSON.stringify(replaced).includes('replacement-password'),false);
});

test('配置菜单中的现有功能都指向实际页面，且菜单键不重复',()=>{
 const sections=HARNESS_SETTINGS_GROUPS.flatMap(group=>group.items);
 assert.equal(new Set(sections.map(item=>item.id)).size,sections.length);
 const paths=new Set(pages.map(page=>page.path));
 for(const item of Object.values(CONSOLE_SECTIONS)){
  assert.ok(paths.has(item.page),`${item.label} 缺少页面 ${item.page}`);
  assert.equal(consolePath(item.id),`#/w/demo/${item.page}${item.item?`?item=${encodeURIComponent(item.item)}`:''}`);
 }
 for(const name of ['账户设置','基础设置','模型设置','知识库','智能体','内置工具','资源管理','数据与扩展'])assert.ok(HARNESS_SETTINGS_GROUPS.some(group=>group.title===name));
});
