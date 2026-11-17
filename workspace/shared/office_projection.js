// Agent Fabric office projection: read-only, bounded, and explicit about evidence.
// Independent implementation; no source or visual assets copied from workstation-BOSS.
export const OFFICE_PROTOCOL_VERSION = 1;
export const OFFICE_PROJECTION_ENDPOINT = '/api/workbench/v1/office';
export const OFFICE_MAX_AGE_MS = 90_000;

const TYPES = new Set(['human', 'agent', 'service']);
const STATES = new Set(['idle', 'queued', 'running', 'waiting', 'failed', 'offline', 'unknown']);
const ACCENTS = ['#5086d4', '#aa72bb', '#47a79b', '#e59a53', '#dc7390', '#7e91c8'];

export class OfficeProjectionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OfficeProjectionError';
    this.code = code;
  }
}

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function label(value, field, required = true, limit = 160) {
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > limit) {
    throw new OfficeProjectionError('INVALID_PROJECTION', '字段无效：' + field);
  }
  return value.trim();
}

function optional(value, field, limit = 160) {
  return value === undefined || value === null ? '' : label(value, field, false, limit);
}

function count(value, field) {
  if (value === undefined || value === null) return null;
  if (!Number.isSafeInteger(value) || value < 0) throw new OfficeProjectionError('INVALID_PROJECTION', '计数无效：' + field);
  return value;
}

function iso(value, field) {
  const str = label(value, field);
  const at = Date.parse(str);
  if (!Number.isFinite(at)) throw new OfficeProjectionError('INVALID_PROJECTION', '时间无效：' + field);
  return { text: str, at };
}

/**
 * The BFF must authorize the actor + workspace before returning this snapshot.
 * A running Agent requires a real run ID and event ID; stale projections never
 * claim live execution. A transport ACK is not a business completion signal.
 */
export function normalizeOfficeProjection(payload, now = Date.now()) {
  if (!object(payload) || payload.schema_version !== OFFICE_PROTOCOL_VERSION) {
    throw new OfficeProjectionError('VERSION_MISMATCH', '数字办公室数据协议版本不匹配');
  }
  if (!object(payload.workspace)) throw new OfficeProjectionError('INVALID_PROJECTION', '缺少工作空间');
  const workspace = {
    id: label(payload.workspace.id, 'workspace.id'),
    name: label(payload.workspace.name, 'workspace.name'),
  };
  const snapshot = iso(payload.snapshot_at, 'snapshot_at');
  const stale = snapshot.at > now + 30_000 || now - snapshot.at > OFFICE_MAX_AGE_MS;
  if (!Array.isArray(payload.departments) || payload.departments.length > 30) {
    throw new OfficeProjectionError('INVALID_PROJECTION', '部门列表缺失或超出限制');
  }

  const ids = new Set();
  let total = 0;
  const departments = payload.departments.map((item, index) => {
    if (!object(item) || !Array.isArray(item.actors) || item.actors.length > 80) {
      throw new OfficeProjectionError('INVALID_PROJECTION', '部门结构无效');
    }
    const actors = item.actors.map(actor => {
      if (!object(actor)) throw new OfficeProjectionError('INVALID_PROJECTION', '工位数据无效');
      const id = label(actor.id, 'actor.id');
      if (ids.has(id)) throw new OfficeProjectionError('INVALID_PROJECTION', '工位标识重复');
      ids.add(id);
      if (!TYPES.has(actor.kind)) throw new OfficeProjectionError('INVALID_PROJECTION', '工位类型未知');
      if (!STATES.has(actor.state)) throw new OfficeProjectionError('INVALID_PROJECTION', '工位状态未知');
      const runId = optional(actor.run_id, 'actor.run_id');
      const eventId = optional(actor.event_id, 'actor.event_id');
      const evidenceMissing = actor.kind !== 'human' && actor.state === 'running' && (!runId || !eventId);
      const state = stale || evidenceMissing ? 'unknown' : actor.state;
      const lastSeen = actor.last_seen_at ? iso(actor.last_seen_at, 'actor.last_seen_at').text : null;
      const capacity = actor.capacity === undefined || actor.capacity === null ? null : count(actor.capacity, 'actor.capacity');
      const active = actor.active === undefined || actor.active === null ? null : count(actor.active, 'actor.active');
      if (capacity !== null && active !== null && active > capacity) {
        throw new OfficeProjectionError('INVALID_PROJECTION', '负载超过申报容量');
      }
      return {
        id,
        name: label(actor.name, 'actor.name', true, 80),
        role: optional(actor.role, 'actor.role', 80),
        kind: actor.kind,
        state,
        originalState: actor.state,
        runId,
        eventId,
        task: optional(actor.task, 'actor.task', 240),
        lastSeen,
        capacity,
        active,
        capabilities: Array.isArray(actor.capabilities)
          ? actor.capabilities.slice(0, 12).map(value => label(value, 'actor.capabilities', true, 80))
          : [],
      };
    });
    total += actors.length;
    return {
      id: label(item.id, 'department.id'),
      name: label(item.name, 'department.name', true, 80),
      accent: ACCENTS[index % ACCENTS.length],
      actors,
    };
  });
  if (total > 350) throw new OfficeProjectionError('INVALID_PROJECTION', '工位数量超出限制');

  const counters = object(payload.counters) ? payload.counters : {};
  const metrics = {
    pendingApprovals: stale ? null : count(counters.pending_approvals, 'counters.pending_approvals'),
    blockedRuns: stale ? null : count(counters.blocked_runs, 'counters.blocked_runs'),
    waitingAcceptance: stale ? null : count(counters.waiting_acceptance, 'counters.waiting_acceptance'),
  };
  return {
    workspace,
    departments,
    snapshotAt: snapshot.text,
    stale,
    metrics,
    actorsCount: total,
    runningCount: stale ? null : departments.flatMap(group => group.actors).filter(actor => actor.state === 'running').length,
    waitingCount: stale ? null : departments.flatMap(group => group.actors).filter(actor => actor.state === 'waiting').length,
    source: optional(payload.source, 'source', 100),
  };
}

/** This same-origin endpoint is a future authenticated BFF; never fetch an MCP server URL in the browser. */
export async function loadOfficeProjection({ fetchImpl = globalThis.fetch, endpoint = OFFICE_PROJECTION_ENDPOINT, signal, now = Date.now() } = {}) {
  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new OfficeProjectionError('NOT_CONNECTED', '数字办公室尚未连接工作台数据服务');
  }
  if (!response.ok) {
    const status = response.status;
    if (status === 401 || status === 403) throw new OfficeProjectionError('FORBIDDEN', '当前身份没有工作空间读取权限');
    if (status === 404 || status === 501) throw new OfficeProjectionError('NOT_CONNECTED', '数字办公室尚未接入 Agent Fabric 工作台服务');
    throw new OfficeProjectionError('UNAVAILABLE', '读取工作台数据失败（HTTP ' + status + '）');
  }
  let payload;
  try { payload = await response.json(); }
  catch { throw new OfficeProjectionError('INVALID_PROJECTION', '工作台服务返回的数据无法解析'); }
  return normalizeOfficeProjection(payload, now);
}

export function visibleOfficeActors(departments, filter = 'all', query = '') {
  const key = String(query || '').trim().toLocaleLowerCase();
  return departments.map(group => ({
    ...group,
    actors: group.actors.filter(actor => {
      if (filter === 'risk' && !['failed', 'waiting', 'offline', 'unknown'].includes(actor.state)) return false;
      if (filter === 'running' && actor.state !== 'running') return false;
      return !key || [actor.name, actor.role, actor.task].some(value => value.toLocaleLowerCase().includes(key));
    }),
  }));
}
