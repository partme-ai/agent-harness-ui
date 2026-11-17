import test from 'node:test';
import assert from 'node:assert/strict';
import {officeSceneTiles, officeFitZoom, officeDepartmentSummary, officeEvidenceLabel} from '../workspace/shared/office_scene.js';

test('办公室中央指挥区插在真实部门之间，部门顺序和对象不发生改变', () => {
  const departments = Array.from({length: 5}, (_, index) => ({id: 'dept-' + index, actors: []}));
  const tiles = officeSceneTiles(departments);
  assert.deepEqual(tiles.map(item => item.id), ['dept-0', 'dept-1', '__workbench_command_center', 'dept-2', 'dept-3', 'dept-4']);
  assert.equal(tiles.filter(item => item.kind === 'room').length, 5);
  assert.deepEqual(officeSceneTiles([]), []);
  assert.equal(officeSceneTiles([departments[0]])[1].kind, 'command');
});

test('根据部门数量给出可解释的鸟瞰缩放，不随刷新变成虚假状态', () => {
  assert.equal(officeFitZoom(0),100);
  assert.equal(officeFitZoom(1),100);
  assert.equal(officeFitZoom(4),85);
  assert.equal(officeFitZoom(8),75);
  assert.equal(officeFitZoom(12),70);
  assert.equal(officeFitZoom(30),65);
});

test('工位统计只能从真实投影派生，缺失容量不能按 0 填充', () => {
  const state = officeDepartmentSummary({actors: [
    {state:'running', active:1, capacity:3},
    {state:'waiting', active:null, capacity:null},
    {state:'failed', active:0, capacity:1},
  ]});
  assert.equal(state.total, 3);
  assert.equal(state.running, 1);
  assert.equal(state.waiting, 1);
  assert.equal(state.risk, 2);
  assert.equal(state.capacityKnown, false);
  assert.deepEqual(officeDepartmentSummary({actors:[]}), {total:0,running:0,waiting:0,risk:0,active:0,capacity:0,capacityKnown:true});
});

test('业务快照的来源必须可辨认，过期状态不能标成实时', () => {
  assert.equal(officeEvidenceLabel(null), '等待可信数据');
  assert.equal(officeEvidenceLabel({stale:true,source:'example'}), '数据已过期');
  assert.equal(officeEvidenceLabel({stale:false,source:'agent-job'}), '已验证来源：agent-job');
});
