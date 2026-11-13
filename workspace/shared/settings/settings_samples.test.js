import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogSamples } from './resource_catalog.js';
import { createMemorySamples, createProviderSamples, SAMPLE_MODEL_GROUPS, getUsageSamples } from './settings_samples.js';

test('记忆文件路径跨工作区唯一，正文和文件大小一致', () => {
  const workspaces = createMemorySamples();
  const files = workspaces.flatMap(workspace => workspace.files);
  assert.equal(new Set(files.map(file => file.path)).size, files.length);
  for (const workspace of workspaces) {
    assert.ok(workspace.files.length > 1);
    assert.equal(workspace.files[0].name, 'MEMORY.md');
    for (const file of workspace.files) {
      assert.ok(file.content.includes(workspace.label));
      assert.equal(file.size, new TextEncoder().encode(file.content).length);
    }
  }
});

test('子智能体选用的演示模型可在编辑器选项中找到，供应商草稿不会污染初始样本', () => {
  const options = new Set(SAMPLE_MODEL_GROUPS.flatMap(group => group.models.map(model => model.value)));
  for (const agent of createCatalogSamples().agents) {
    assert.ok(options.has(`${agent.modelSelection.providerId}/${agent.modelSelection.modelId}`));
  }
  const providers = createProviderSamples();
  providers[0].models.push('edited');
  assert.ok(!createProviderSamples()[0].models.includes('edited'));
});

test('两种统计周期返回独立数据，长周期包含短周期用量', () => {
  const week = getUsageSamples('7d');
  const month = getUsageSamples('30d');
  assert.equal(week.length, month.length);
  for (let index = 0; index < week.length; index++) {
    assert.equal(week[index].model, month[index].model);
    assert.ok(month[index].input >= week[index].input);
    assert.ok(month[index].output >= week[index].output);
    assert.ok(month[index].sessions >= week[index].sessions);
  }
  week[0].input = 0;
  assert.ok(getUsageSamples('7d')[0].input > 0);
});
