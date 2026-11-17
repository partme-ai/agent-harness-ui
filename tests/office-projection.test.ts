import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeOfficeProjection,
  loadOfficeProjection,
  visibleOfficeActors,
  OfficeProjectionError,
  OFFICE_PROJECTION_ENDPOINT,
} from '../workspace/shared/office_projection.js';

const now = Date.parse('2026-11-17T02:00:00Z');
const fixture = () => ({
  schema_version: 1,
  snapshot_at: new Date(now - 1000).toISOString(),
  workspace: {id: 'ws-a', name: '研发工作空间'},
  source: 'Agent-Job / Agent-Link authorized BFF',
  counters: {pending_approvals: 2, blocked_runs: 1, waiting_acceptance: 4},
  departments: [
    {id: 'eng', name: '工程团队', actors: [
      {id: 'agent-a', name: '评审 Agent', kind: 'agent', state: 'running', role: '代码审查',
       run_id: 'run-7', event_id: 'evt-7', task: '检查 PR', capacity: 2, active: 1,
       last_seen_at: new Date(now - 1000).toISOString(), capabilities: ['git.read','test.read']},
      {id: 'agent-b', name: '测试 Agent', kind: 'agent', state: 'waiting', task: '等待审批'},
    ]},
    {id: 'ops', name: '运营', actors: [
      {id: 'user-1', name: '审核人员', kind: 'human', state: 'idle'},
    ]},
  ],
});

test('读取授权快照：部门、成员、可追溯运行和右栏指标共享同一来源', () => {
  const result = normalizeOfficeProjection(fixture(), now);
  assert.equal(result.workspace.id, 'ws-a');
  assert.equal(result.departments.length, 2);
  assert.equal(result.actorsCount, 3);
  assert.equal(result.runningCount, 1);
  assert.equal(result.waitingCount, 1);
  assert.equal(result.stale, false);
  assert.equal(result.metrics.pendingApprovals, 2);
  assert.equal(result.departments[0].actors[0].runId, 'run-7');
  assert.equal(result.departments[0].actors[0].eventId, 'evt-7');
});

test('缺少 Run/event 证据不能显示 Agent 真正在执行', () => {
  const sample = fixture();
  delete sample.departments[0].actors[0].event_id;
  const result = normalizeOfficeProjection(sample, now);
  assert.equal(result.departments[0].actors[0].state, 'unknown');
  assert.equal(result.departments[0].actors[0].originalState, 'running');
  assert.equal(result.runningCount, 0);
});

test('过期快照不能继续显示在线、运行中或待处理 KPI', () => {
  const result = normalizeOfficeProjection(fixture(), now + 500_000);
  assert.equal(result.stale, true);
  assert.equal(result.departments[0].actors[0].state, 'unknown');
  assert.equal(result.runningCount, null);
  assert.equal(result.waitingCount, null);
  assert.equal(result.metrics.blockedRuns, null);
});

test('缺失指标代表未知而非 0；空部门不生成任何虚构工位', () => {
  const sample = fixture();
  delete sample.counters;
  sample.departments = [{id:'eng',name:'工程团队',actors:[]}];
  const result = normalizeOfficeProjection(sample, now);
  assert.equal(result.metrics.pendingApprovals, null);
  assert.equal(result.actorsCount, 0);
  assert.equal(result.runningCount, 0);
  assert.deepEqual(result.departments[0].actors, []);
});

test('重复工位、未知状态、超容量和错误协议拒绝进入工作台', () => {
  const badVersion = fixture();
  badVersion.schema_version = 2;
  assert.throws(() => normalizeOfficeProjection(badVersion,now), /版本不匹配/);
  const duplicate = fixture();
  duplicate.departments[1].actors[0].id = 'agent-a';
  assert.throws(() => normalizeOfficeProjection(duplicate,now), /工位标识重复/);
  const unknown = fixture();
  unknown.departments[0].actors[0].state = 'teleporting';
  assert.throws(() => normalizeOfficeProjection(unknown,now), /工位状态未知/);
  const capacity = fixture();
  capacity.departments[0].actors[0].active = 3;
  assert.throws(() => normalizeOfficeProjection(capacity,now), /超过申报容量/);
});

test('态势、风险与搜索只改变呈现，不修改事实快照', () => {
  const result = normalizeOfficeProjection(fixture(), now);
  const list = visibleOfficeActors(result.departments, 'risk');
  assert.deepEqual(list[0].actors.map(actor=>actor.id), ['agent-b']);
  const searched = visibleOfficeActors(result.departments, 'all', 'PR');
  assert.deepEqual(searched[0].actors.map(actor=>actor.id), ['agent-a']);
  assert.equal(result.departments[0].actors.length, 2);
});

test('HTTP 投影读取使用同源凭据和 no-store，不从浏览器直连业务 MCP', async () => {
  let request;
  const result = await loadOfficeProjection({
    now,
    fetchImpl: async (path, options) => {
      request = {path, options};
      return {ok:true,json:async()=>fixture()};
    },
  });
  assert.equal(request.path, OFFICE_PROJECTION_ENDPOINT);
  assert.equal(request.options.credentials, 'same-origin');
  assert.equal(request.options.cache, 'no-store');
  assert.equal(request.options.method, 'GET');
  assert.equal(result.runningCount, 1);
});

test('未部署服务与授权失败分类不同，且都不会返回模拟成功', async () => {
  for (const [status,code] of [[404,'NOT_CONNECTED'],[501,'NOT_CONNECTED'],[403,'FORBIDDEN'],[503,'UNAVAILABLE']]) {
    await assert.rejects(
      () => loadOfficeProjection({fetchImpl:async()=>({ok:false,status})}),
      error => error instanceof OfficeProjectionError && error.code === code,
    );
  }
  await assert.rejects(
    () => loadOfficeProjection({fetchImpl:async()=>({ok:true,json:async()=>{throw Error('bad json')}})}),
    error => error.code === 'INVALID_PROJECTION',
  );
});
