import test from 'node:test';
import assert from 'node:assert/strict';
import {pages} from '../src/catalog.ts';
import {workspaceNavigation,workspaceNavigationForMode,modeForSpace,spaceForMode} from '../workspace/shared/workspace_navigation.js';
import {taskHomeScenes} from '../workspace/shared/task_home.js';
import {HARNESS_SETTINGS_GROUPS,CONSOLE_SECTIONS,consolePath,modelSettingsParent,modelSettingsTabs,modelSettingsActiveTab} from '../workspace/shared/settings/harness_sections.js';
import {publicModelOptions} from '../src/harness_bridge.ts';
import {listSessionSecrets,saveSessionSecret} from '../workspace/shared/settings/secret_memory.js';

test('工作台主菜单覆盖任务、资料库和三类协作空间',()=>{
 assert.deepEqual(workspaceNavigation.map(item=>item.label),['新建任务','任务总览','定时任务','插件市场','资料库','项目空间','工作空间','创作空间']);
 assert.equal(new Set(workspaceNavigation.map(item=>item.id)).size,workspaceNavigation.length);
});

test('办公、编程、创作模式各只显示自己的空间入口',()=>{
 assert.deepEqual(Object.keys(taskHomeScenes.chat),['办公','编程','创作']);
 assert.deepEqual(workspaceNavigationForMode('办公').map(item=>item.id),['home','work','tasks','plugins','knowledge','office']);
 assert.deepEqual(workspaceNavigationForMode('编程').map(item=>item.id),['home','work','tasks','plugins','knowledge','project']);
 assert.deepEqual(workspaceNavigationForMode('创作').map(item=>item.id),['home','work','tasks','plugins','knowledge','creative']);
 assert.equal(modeForSpace('project'),'编程');
 assert.equal(modeForSpace('office'),'办公');
 assert.equal(modeForSpace('creative'),'创作');
 assert.equal(spaceForMode('办公'),'office');
 assert.equal(spaceForMode('编程'),'project');
 assert.equal(spaceForMode('创作'),'creative');
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

test('模型服务、本地模型与模型网关在侧栏各占一个入口，分类由内部页签访问',()=>{
 const modelGroup=HARNESS_SETTINGS_GROUPS.find(group=>group.title==='模型设置');
 assert.deepEqual(modelGroup?.items.map(item=>item.id),['model-services','local-model','model-gateway','model-stats']);
 assert.deepEqual(modelSettingsTabs('model-services')?.map(item=>item.label),['文本生成','图片生成','视频生成','语音合成','语音识别']);
 assert.deepEqual(modelSettingsTabs('model-services')?.map(item=>item.item),['text','image','video','tts','asr']);
 assert.equal(modelSettingsParent('model-service-asr'),'model-services');
 assert.equal(modelSettingsActiveTab('model-services'),'model-service-text');
 assert.equal(consolePath('model-service-asr'),'#/w/demo/models?item=asr');
 assert.deepEqual(modelSettingsTabs('local-model')?.map(item=>item.label),['运行环境','模型列表']);
 assert.deepEqual(modelSettingsTabs('model-gateway')?.map(item=>item.label),['默认模型','模型 API','模型负载','模型降级','模型限流','模型熔断']);
 assert.equal(modelSettingsParent('local-catalog'),'local-model');
 assert.equal(modelSettingsParent('model-breaker'),'model-gateway');
 assert.equal(modelSettingsActiveTab('local-model'),'local-runtime');
 assert.equal(modelSettingsActiveTab('model-gateway'),'model-defaults');
 assert.equal(consolePath('local-catalog'),'#/w/demo/models/local/catalog');
 assert.equal(consolePath('model-breaker'),'#/w/demo/models/gateway/breaker');
});
