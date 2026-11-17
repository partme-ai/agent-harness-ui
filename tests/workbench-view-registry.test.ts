import test from 'node:test';
import assert from 'node:assert/strict';
import {BUILTIN_WORKBENCH_VIEWS,findBuiltinWorkbenchView} from '../workspace/shared/view_registry.js';
import {workspaceNavigationForMode} from '../workspace/shared/workspace_navigation.js';

test('数字办公室以 View 注册，不是固定绑定办公/编程/创作业务包', () => {
  const view = findBuiltinWorkbenchView('office-map');
  assert.ok(view);
  assert.equal(view.provider, 'agent-fabric-projection');
  assert.equal(view.readOnly, true);
  assert.ok(view.requiredCapabilities.includes('workbench.office.read'));
  assert.deepEqual(view.layouts,['desktop','tablet','mobile']);
  for (const mode of ['办公','编程','创作']) {
    assert.ok(workspaceNavigationForMode(mode).some(item=>item.id===view.id));
  }
  assert.equal(findBuiltinWorkbenchView('nonexistent'), null);
});

test('注册表键唯一，不包含业务模型和 Settings 凭据', () => {
  const ids = BUILTIN_WORKBENCH_VIEWS.map(item=>item.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.ok(BUILTIN_WORKBENCH_VIEWS.every(view=>!('secret' in view)&&!('credential' in view)&&!('settingsState' in view)));
});
