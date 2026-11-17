// Partme original office-style workbench view. Read-only until the BFF is connected.
import React, {useEffect, useMemo, useState} from 'react';
import {Button, Input, Segmented, Tooltip} from 'antd';
import {ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, SearchOutlined, SettingOutlined, WarningOutlined, ZoomInOutlined, ZoomOutOutlined} from '@ant-design/icons';
import {loadOfficeProjection, visibleOfficeActors} from './office_projection.js';
import {officeSceneTiles, officeFitZoom} from './office_scene.js';
import {OfficeCommandRoom, DepartmentDetailRail, TeamRosterRail} from './OfficeControlPanels.jsx';
import {createTransientViewState} from './transient_view_state.js';
import './office_map.css';
import './office_panorama.css';

const STATES = {
  idle: {name: '空闲', tone: 'idle'},
  queued: {name: '待调度', tone: 'queued'},
  running: {name: '执行中', tone: 'running'},
  waiting: {name: '待人工处理', tone: 'waiting'},
  failed: {name: '异常', tone: 'failed'},
  offline: {name: '离线', tone: 'offline'},
  unknown: {name: '未核实', tone: 'unknown'},
};
const KINDS = {human: '成员', agent: 'Agent', service: '执行节点'};
const formatCount = value => value === null || value === undefined ? '—' : String(value);
const formatTime = value => value ? new Date(value).toLocaleString('zh-CN', {month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : '—';
const avatarText = actor => actor.name.slice(0, 1).toLocaleUpperCase();

function Counter({name, value, caption, tone}) {
  return <div className={'om-counter ' + (tone ? 'tone-' + tone : '')}>
    <span>{name}</span><strong>{formatCount(value)}</strong>{caption&&<small>{caption}</small>}
  </div>;
}

function ActorSeat({actor, selected, onSelect, lens}) {
  const state = STATES[actor.state] || STATES.unknown;
  const focus = lens === 'risk' && ['waiting', 'failed', 'offline', 'unknown'].includes(actor.state);
  const load = actor.capacity && actor.active !== null
    ? Math.min(100, Math.round(actor.active * 100 / actor.capacity))
    : null;
  return <button type="button"
    className={'om-seat ' + (selected ? 'selected ' : '') + (focus ? 'highlight ' : '')}
    data-state={state.tone} aria-pressed={selected}
    aria-label={actor.name + '，' + KINDS[actor.kind] + '，' + state.name}
    onClick={() => onSelect(actor.id)}>
    <span className="om-desk" aria-hidden="true"><span className="om-screen"/><span className="om-keyboard"/></span>
    <span className={'om-avatar om-' + actor.kind} aria-hidden="true">{avatarText(actor)}</span>
    <span className="om-seat-name">{actor.name}</span>
    <span className="om-seat-role">{actor.role || KINDS[actor.kind]}</span>
    {lens === 'load' && load !== null
      ? <span className="om-load-mini" aria-label={'并发占用 ' + load + '%'}><i style={{width: load + '%'}}/></span>
      : <span className={'om-seat-state om-state-' + state.tone}>{state.name}</span>}
  </button>;
}

function DepartmentRoom({department, selectedId, onSelect, onSelectDepartment, lens, dense}) {
  const active = department.actors.filter(actor => actor.state === 'running').length;
  return <section className="om-room" style={{'--om-room-accent': department.accent}}
    aria-label={department.name + '，' + department.actors.length + ' 位成员或智能体'}>
    <header className="om-room-head">
      <button type="button" className="om-room-select" onClick={() => onSelectDepartment(department.id)} aria-label={'查看部门：'+department.name}>
        <span className="om-room-number" aria-hidden="true"/>
        <strong>{department.name}</strong>
        <small>{department.actors.length} 个工位</small>
      </button>
      {active > 0 && <span className="om-room-active">{active} 执行中</span>}
    </header>
    <div className={'om-seat-grid ' + (dense ? 'dense' : '')}>
      {department.actors.map(actor=><ActorSeat key={actor.id} actor={actor} lens={lens} selected={selectedId === actor.id} onSelect={onSelect}/>)}
      {!department.actors.length && <div className="om-empty-room">尚无可显示工位</div>}
    </div>
  </section>;
}

function MemberDetails({actor, onBack}) {
  const [copyStatus, setCopyStatus] = useState('');
  useEffect(() => setCopyStatus(''), [actor?.id]);
  if (!actor) return null;
  const state = STATES[actor.state] || STATES.unknown;
  async function copyRun() {
    try {
      await navigator.clipboard.writeText(actor.runId);
      setCopyStatus('Run ID 已复制');
    } catch {
      setCopyStatus('复制失败，请手动选择标识');
    }
  }
  return <section className="om-detail">
    <button type="button" className="om-back" onClick={onBack}><ArrowLeftOutlined/> 返回概览</button>
    <div className="om-profile-head"><span className={'om-profile-avatar om-' + actor.kind}>{avatarText(actor)}</span><div><strong>{actor.name}</strong><small>{actor.role || KINDS[actor.kind]}</small></div></div>
    <div className={'om-detail-state om-state-' + state.tone}><span className="om-status-dot"/>{state.name}</div>
    <dl className="om-kv">
      <div><dt>身份</dt><dd>{KINDS[actor.kind]}</dd></div>
      <div><dt>当前任务</dt><dd>{actor.task || '—'}</dd></div>
      <div><dt>并发占用</dt><dd>{actor.capacity === null || actor.active === null ? '暂无容量证据' : actor.active + ' / ' + actor.capacity}</dd></div>
      <div><dt>最后观测</dt><dd>{formatTime(actor.lastSeen)}</dd></div>
      <div><dt>Run ID</dt><dd className="om-mono">{actor.runId || '—'}</dd></div>
      <div><dt>事件标识</dt><dd className="om-mono">{actor.eventId || '—'}</dd></div>
    </dl>
    <h3>已授权能力（投影）</h3>
    <div className="om-capabilities">{actor.capabilities.length
      ? actor.capabilities.map(item => <span key={item}>{item}</span>)
      : <p>没有可供显示的能力记录</p>}</div>
    {actor.runId && <Button size="small" onClick={copyRun}>复制 Run ID</Button>}
    {copyStatus && <p role="status" className="om-copy-feedback">{copyStatus}</p>}
    <p className="om-disclaimer">这里只显示已授权的只读数据；重试、审批和验收应在拥有权限的执行中心完成。</p>
  </section>;
}

function OverviewRail({data, error, onSettings}) {
  const connected = !!data && !data.stale && !error;
  return <div className="om-rail-content">
    <section className="om-rail-block">
      <h3>今日概览</h3>
      <p className="om-rail-date">{new Date().toLocaleDateString('zh-CN', {month:'long',day:'numeric',weekday:'long'})}</p>
      <div className="om-kpis">
        <Counter name="主体总数" value={connected ? data.actorsCount : null}/>
        <Counter name="正在执行" value={connected ? data.runningCount : null} tone="blue"/>
        <Counter name="等待人工" value={connected ? data.waitingCount : null} tone="orange"/>
      </div>
      <small className="om-source-note">当前为 Agent Fabric 只读快照，非手工填写的任务完成率。</small>
    </section>
    <section className="om-rail-block">
      <h3>需要关注</h3>
      <div className="om-rail-metrics">
        <div><span>待审批</span><b>{formatCount(connected ? data.metrics.pendingApprovals : null)}</b></div>
        <div><span>阻塞运行</span><b>{formatCount(connected ? data.metrics.blockedRuns : null)}</b></div>
        <div><span>待交付验收</span><b>{formatCount(connected ? data.metrics.waitingAcceptance : null)}</b></div>
      </div>
      <small className="om-source-note">— 表示未连接、快照过期或事实源未提供，不能理解为零。</small>
    </section>
    <section className="om-rail-block">
      <h3>工作台来源</h3>
      <div className="om-source-box">
        <span className={'om-source-dot ' + (connected ? 'ok' : '')}/>
        <strong>{connected ? '已获取可信快照' : data ? '快照不可作为实时状态' : '等待真实服务'}</strong>
      </div>
      <p>最近更新：{formatTime(data?.snapshotAt)}</p>
      <p>来源：{data?.source || '尚未接入 MCP / Agent Job 投影服务'}</p>
      <Button size="small" icon={<SettingOutlined/>} onClick={() => onSettings?.('agent-connections')}>连接与设置</Button>
    </section>
  </div>;
}

// 保存视图镜头/过滤/侧栏的瞬时 UI 偏好，避免切换统一 Settings 后重置；不保存凭据或 Run 数据。
const officeViewState = createTransientViewState({lens:'status',presentation:'map',railTab:'today',zoom:100,zoomTouched:false});

export function OfficeMapView({onSettings}) {
  const [projection, setProjection] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [railTab, setRailTab] = useState(() => officeViewState.read().railTab);
  const [lens, setLens] = useState(() => officeViewState.read().lens);
  const [presentation, setPresentation] = useState(() => officeViewState.read().presentation);
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState(() => officeViewState.read().zoom);
  const [zoomTouched, setZoomTouched] = useState(() => officeViewState.read().zoomTouched);
  useEffect(() => {
    officeViewState.patch({railTab,lens,presentation,zoom,zoomTouched});
  }, [railTab,lens,presentation,zoom,zoomTouched]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    setPhase('loading');
    loadOfficeProjection({signal:controller.signal}).then(result => {
      if (!mounted) return;
      setProjection(result);
      setError(null);
      setPhase('ready');
    }).catch(cause => {
      if (!mounted || cause?.name === 'AbortError') return;
      // Never keep a previously live-looking map on a failed refresh.
      setProjection(null);
      setSelectedId(null);
      setSelectedDepartmentId(null);
      setError(cause);
      setPhase('error');
    });
    return () => { mounted = false; controller.abort(); };
  }, [revision]);
  useEffect(() => {
    if (phase !== 'ready') return;
    const timer = setInterval(() => setRevision(value => value + 1), 30_000);
    return () => clearInterval(timer);
  }, [phase]);

  const groups = useMemo(() => visibleOfficeActors(projection?.departments || [], lens === 'risk' ? 'risk' : lens === 'running' ? 'running' : 'all', search), [projection, lens, search]);
  const sceneTiles = useMemo(() => officeSceneTiles(groups), [groups]);
  useEffect(() => {
    if (!zoomTouched && projection) setZoom(officeFitZoom(projection.departments.length));
  }, [projection?.departments.length, zoomTouched]);
  const actors = projection?.departments.flatMap(group => group.actors) || [];
  const selected = actors.find(item => item.id === selectedId) || null;
  const selectedDepartment = projection?.departments.find(item => item.id === selectedDepartmentId) || null;
  const selectActor = id => {setSelectedId(id);setSelectedDepartmentId(null);};
  const selectDepartment = id => {setSelectedDepartmentId(id);setSelectedId(null);};
  const muted = !!error || projection?.stale;
  const disconnected = phase === 'error' && !projection;
  const stateText = error ? error.message : projection?.stale ? '运行快照已过期' : phase === 'ready' ? '数据已校验' : '正在读取工作台…';
  return <section className="om-root" aria-label="数字办公室">
    <header className="om-toolbar">
      <div className="om-heading"><small>AGENT FABRIC / WORKSPACE</small><h1>数字办公室 <span>{projection?.workspace.name || '工作空间'}</span></h1><p>从全局态势进入真实 Agent、任务与运行证据</p></div>
      <div className="om-toolbar-actions">
        <span className={'om-health ' + (muted || disconnected ? 'warn' : '')} role="status"><span/>{stateText}</span>
        <Tooltip title="从事实源重新获取数据"><Button aria-label="刷新数字办公室" icon={<ReloadOutlined/>} onClick={() => setRevision(value => value + 1)} loading={phase === 'loading'}/></Tooltip>
        <Button icon={<SettingOutlined/>} onClick={() => onSettings?.('agent-connections')}>设置</Button>
      </div>
    </header>
    <div className="om-main">
      <div className="om-center">
        <div className="om-filters">
          <span className="om-filter-copy">按工作空间观察真实协同</span>
          <span className="om-filter-spacer"/>
          <Input size="small" allowClear prefix={<SearchOutlined/>} aria-label="搜索工位" placeholder="搜索人员 / Agent / 任务" value={search} onChange={event => setSearch(event.target.value)}/>
          <Segmented size="small" aria-label="办公室呈现方式" value={presentation} onChange={setPresentation} options={[{value:'map',label:'空间'},{value:'list',label:'列表'}]}/>
        </div>
        {(disconnected || error || projection?.stale) && <div className="om-status-alert" role="alert">
          <WarningOutlined/><div><strong>{error ? error.message : '快照过期，已停止展示实时运行状态'}</strong><p>未接入时不生成模拟员工或运行进度。请在统一设置中心配置真实连接，并由受权服务提供办公室投影。</p></div>
        </div>}
        {presentation === 'map'
          ? <div className="om-stage-scroll">
              <div className="om-stage-tools">
                <span>{projection?.workspace.name || 'Partme Agent Fabric'} · 空间视图</span>
                <div><Button size="small" aria-label="缩小办公室" icon={<ZoomOutOutlined/>} disabled={zoom <= 65} onClick={() => {setZoomTouched(true); setZoom(value => Math.max(65, value - 10));}}/>
                  <span>{zoom}%</span>
                  <Button size="small" aria-label="放大办公室" icon={<ZoomInOutlined/>} disabled={zoom >= 140} onClick={() => {setZoomTouched(true); setZoom(value => Math.min(140, value + 10));}}/>
                  <Button size="small" onClick={() => {setZoomTouched(false); setZoom(officeFitZoom(projection?.departments.length || 0));}}>适应</Button></div>
              </div>
              <div className="om-map-surface" style={{'--om-zoom':zoom / 100}}>
                {groups.length
                  ? <div className="om-rooms">{sceneTiles.map(tile=>tile.kind==='command'
                      ? <OfficeCommandRoom key={'command:'+tile.id} snapshot={projection} onSettings={onSettings}/>
                      : <DepartmentRoom key={'room:'+tile.id} department={tile.department} selectedId={selectedId} onSelect={selectActor} onSelectDepartment={selectDepartment} lens={lens} dense={tile.department.actors.length > 8}/>)}</div>
                  : <div className="om-awaiting-room"><span className="om-awaiting-icon"><ClockCircleOutlined/></span><h2>{phase === 'loading' ? '正在获取工作空间…' : '等待真实工位数据'}</h2><p>授权后，这里将按部门呈现人类成员、Agent 和服务执行节点。当前不显示虚构工位。</p></div>}
              </div>
            </div>
          : <div className="om-list">
              {groups.flatMap(group=>group.actors.map(actor => {
                const state=STATES[actor.state]||STATES.unknown;
                return <button type="button" key={actor.id} onClick={() => selectActor(actor.id)} className={'om-list-row ' + (selectedId === actor.id ? 'selected':'')}>
                  <span className={'om-list-avatar om-' + actor.kind}>{avatarText(actor)}</span>
                  <span className="om-list-name"><strong>{actor.name}</strong><small>{group.name} · {actor.role || KINDS[actor.kind]}</small></span>
                  <span>{actor.task || '未提供当前任务'}</span>
                  <span className={'om-state-label om-state-' + state.tone}>{state.name}</span>
                </button>;
              }))}
              {!groups.some(group=>group.actors.length) && <div className="om-list-empty">没有符合条件的工位记录</div>}
            </div>}
        <div className="om-dock" role="group" aria-label="办公室观察模式">
          <Segmented aria-label="办公室观察维度" value={lens} onChange={setLens} options={[{value:'status',label:'日常'},{value:'running',label:'执行中'},{value:'load',label:'负载'},{value:'risk',label:'风险'}]}/>
        </div>
      </div>
      <aside className="om-rail" aria-label={selected ? '工位详情' : selectedDepartment ? '部门详情' : '办公室概览'}>
        {selected ? <MemberDetails actor={selected} onBack={() => setSelectedId(null)}/>
          : selectedDepartment ? <DepartmentDetailRail department={selectedDepartment} onBack={() => setSelectedDepartmentId(null)} onSelectActor={selectActor}/>
          : <>
            <div className="om-rail-tabs" role="tablist" aria-label="右侧信息面板">
              <button role="tab" aria-selected={railTab==='today'} onClick={() => setRailTab('today')}>今日概览</button>
              <button role="tab" aria-selected={railTab==='team'} onClick={() => setRailTab('team')}>团队画像</button>
            </div>
            {railTab==='today'
              ? <OverviewRail data={projection} error={error || (projection?.stale ? new Error('stale') : null)} onSettings={onSettings}/>
              : <TeamRosterRail departments={projection?.departments || []} onSelectDepartment={selectDepartment}/>}
          </>}
      </aside>
    </div>
    <footer className="om-footer"><span><CheckCircleOutlined/> 工作状态必须有真实事件证据</span><span>统一设置中心保持独立 · MCP 连接业务 · Agent-Job 负责执行事实</span></footer>
  </section>;
}
