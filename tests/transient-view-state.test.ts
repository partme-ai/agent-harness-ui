import test from 'node:test';
import assert from 'node:assert/strict';
import {createTransientViewState} from '../workspace/shared/transient_view_state.js';

test('切换 Settings 或工作视图时保留交互模式而不依赖 localStorage', () => {
  const store = createTransientViewState({lens:'status',zoom:100});
  store.patch({lens:'risk',zoom:75,workspaceId:'tenant-a',secret:'not-allowed'});
  assert.deepEqual(store.read(),{lens:'risk',zoom:75});
  const observed = store.read();
  observed.zoom = 10;
  assert.equal(store.read().zoom,75);
  assert.deepEqual(store.reset(),{lens:'status',zoom:100});
});

test('瞬时状态不会接纳对象与凭据，空提交不会覆盖原状态', () => {
  const store = createTransientViewState({lens:'status'});
  store.patch({lens:{token:'private'},unexpected:'ignored'});
  store.patch(null);
  assert.deepEqual(store.read(),{lens:'status'});
});
