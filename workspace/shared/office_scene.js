// Partme 原创办公室场景编排：只布局已授权的部门和事实，不生成虚构工位。
export function officeSceneTiles(departments) {
  if (!Array.isArray(departments) || !departments.length) return [];
  const roomTiles = departments.map((department, index) => ({
    kind: 'room', id: department.id, department, number: index + 1,
  }));
  const insertAt = Math.min(2, roomTiles.length);
  return [
    ...roomTiles.slice(0, insertAt),
    {kind: 'command', id: '__workbench_command_center'},
    ...roomTiles.slice(insertAt),
  ];
}

export function officeFitZoom(departmentCount) {
  if (!Number.isSafeInteger(departmentCount) || departmentCount < 0) return 100;
  if (departmentCount <= 3) return 100;
  if (departmentCount <= 6) return 85;
  if (departmentCount <= 9) return 75;
  if (departmentCount <= 12) return 70;
  return 65;
}

export function officeDepartmentSummary(department) {
  const actors = Array.isArray(department?.actors) ? department.actors : [];
  const result = {
    total: actors.length,
    running: 0,
    waiting: 0,
    risk: 0,
    active: 0,
    capacity: 0,
    capacityKnown: true,
  };
  for (const actor of actors) {
    if (actor.state === 'running') result.running++;
    if (actor.state === 'waiting') result.waiting++;
    if (['failed', 'offline', 'unknown', 'waiting'].includes(actor.state)) result.risk++;
    if (actor.active === null || actor.capacity === null || actor.active === undefined || actor.capacity === undefined) {
      result.capacityKnown = false;
    } else {
      result.active += actor.active;
      result.capacity += actor.capacity;
    }
  }
  return result;
}

export function officeEvidenceLabel(snapshot) {
  if (!snapshot) return '等待可信数据';
  if (snapshot.stale) return '数据已过期';
  return snapshot.source ? '已验证来源：' + snapshot.source : '已验证工作台快照';
}
