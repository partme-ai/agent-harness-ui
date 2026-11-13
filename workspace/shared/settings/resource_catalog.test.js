import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogSamples, projectResourceGroups, saveResourceDraft } from './resource_catalog.js';
test('插件托管资源分组与用户已安装数独立，搜索不能改变总数', () => {
  const items=[{id:'u',name:'local',scope:'user'},{id:'p',name:'tool',scope:'user',pluginId:'kit',pluginName:'Kit'}];
  const result=projectResourceGroups(items,'user','tool');
  assert.equal(result.total,2);
  assert.equal(result.installed.length,0);
  assert.equal(result.plugins[0].items[0].id,'p');
  assert.equal(projectResourceGroups(items,'workspace','').total,0);
});
test('草稿保留编辑器的工具、颜色、AGENTS.md 和原 ID，拒绝同范围重名', () => {
  const items=[{id:'a',scope:'user',name:'review',content:'old'}];
  const next=saveResourceDraft(items,{id:'a',scope:'user',name:'review',content:'new',tools:['Read'],color:'purple',injectAgentsMd:false});
  assert.equal(next[0].id,'a'); assert.deepEqual(next[0].tools,['Read']); assert.equal(next[0].injectAgentsMd,false);
  assert.throws(()=>saveResourceDraft(items,{scope:'user',name:'Review',content:'x'}),/同名/);
  assert.equal(items[0].content,'old');
});
test('同一生命周期事件允许配置多个钩子，按 ID 编辑而不覆盖其他钩子', () => {
  const items=[{id:'first',scope:'user',name:'Stop',command:'first-command'}];
  const added=saveResourceDraft(items,{scope:'user',name:'Stop',command:'second-command'},{allowDuplicateNames:true});
  assert.equal(added.length,2);
  const edited=saveResourceDraft(added,{...added[1],command:'edited-command'},{allowDuplicateNames:true});
  assert.equal(edited[0].command,'first-command');
  assert.equal(edited[1].command,'edited-command');
});

test('演示资源包含完整正文、有效插件来源和有内容的工作区，样本之间互不污染', () => {
  const samples = createCatalogSamples();
  const plugins = new Map(samples.plugins.map(item => [item.id, item]));
  for (const [kind, items] of Object.entries(samples)) {
    assert.equal(new Set(items.map(item => item.id)).size, items.length, `${kind} ID 唯一`);
    assert.ok(items.some(item => item.scope === 'workspace'), `${kind} 包含工作区样本`);
    const user = projectResourceGroups(items, 'user');
    assert.equal(user.total, user.installed.length + user.plugins.reduce((count, group) => count + group.items.length, 0));
    for (const item of items.filter(item => item.pluginId)) {
      assert.equal(item.pluginName, plugins.get(item.pluginId)?.name);
    }
  }
  assert.ok(samples.agents.length >= 20 && samples.skills.length >= 30);
  assert.ok(samples.agents.every(item => item.systemPrompt.length > 120));
  assert.ok(samples.skills.every(item => item.content.includes('## 执行步骤')));
  assert.ok(samples.commands.some(item => item.source === 'user' && item.location.source === 'zcode'));
  samples.agents[0].tools.push('changed');
  assert.ok(!createCatalogSamples().agents[0].tools.includes('changed'));
});
