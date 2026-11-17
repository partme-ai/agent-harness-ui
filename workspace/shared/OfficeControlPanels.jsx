// Partme 自主实现的指挥室与团队详情。展示组件不持有任务事实或权限状态。
import React from 'react';
import {Button} from 'antd';
import {ApartmentOutlined, ArrowLeftOutlined, DatabaseOutlined, SettingOutlined, TeamOutlined} from '@ant-design/icons';
import {officeDepartmentSummary, officeEvidenceLabel} from './office_scene.js';

const numberOrUnknown = value => value == null ? '—' : String(value);
const STATE_NAME = {idle:'空闲',queued:'待调度',running:'执行中',waiting:'待人工处理',failed:'异常',offline:'离线',unknown:'未核实'};
const KIND_NAME = {human:'成员',agent:'Agent',service:'执行节点'};

export function OfficeCommandRoom({snapshot, onSettings}) {
  const authoritative = !!snapshot && !snapshot.stale;
  return <section className="om-command-room" aria-label="工作空间指挥区">
    <div className="om-command-head">
      <ApartmentOutlined/><strong>工作空间指挥区</strong>
      <span className="om-command-chip">{authoritative ? '可信快照' : '等待接入'}</span>
    </div>
    <div className="om-command-visual">
      <div className="om-command-screen" aria-hidden="true">
        <span className="om-screen-bar"/>
        <div className="om-screen-lines"><i/><i/><i/><i/></div>
      </div>
      <div className="om-command-console" aria-hidden="true">
        <div className="om-command-seat"><i/></div>
        <div className="om-command-desk"><span/><span/><span/></div>
      </div>
    </div>
    <div className="om-command-caption">
      <strong>{snapshot?.workspace?.name || 'Partme Agent Fabric'}</strong>
      <small>{officeEvidenceLabel(snapshot)}</small>
    </div>
    <div className="om-command-facts">
      <span><b>{numberOrUnknown(authoritative ? snapshot.runningCount : null)}</b>执行中</span>
      <span><b>{numberOrUnknown(authoritative ? snapshot.metrics.pendingApprovals : null)}</b>待审批</span>
      <span><b>{numberOrUnknown(authoritative ? snapshot.metrics.blockedRuns : null)}</b>阻塞</span>
    </div>
    <Button size="small" type="text" className="om-command-action" icon={<SettingOutlined/>} onClick={() => onSettings?.('agent-connections')}>统一能力与连接设置</Button>
  </section>;
}

export function DepartmentDetailRail({department, onSelectActor, onBack}) {
  const totals = officeDepartmentSummary(department);
  return <div className="om-department-detail">
    <Button type="text" size="small" icon={<ArrowLeftOutlined/>} onClick={onBack}>返回办公室</Button>
    <header><span className="om-department-mark" style={{background:department.accent}}/><div><h2>{department.name}</h2><small>{totals.total} 个实际工位</small></div></header>
    <div className="om-department-facts">
      <div><strong>{totals.running}</strong><small>执行中</small></div>
      <div><strong>{totals.waiting}</strong><small>等待处理</small></div>
      <div><strong>{totals.risk}</strong><small>需关注</small></div>
    </div>
    <div className="om-department-capacity"><span>申报并发占用</span><strong>{totals.capacityKnown ? totals.active + ' / ' + totals.capacity : '数据不足'}</strong></div>
    <h3><TeamOutlined/> 团队和工位</h3>
    <div className="om-department-actors">
      {department.actors.map(actor => <button key={actor.id} onClick={() => onSelectActor(actor.id)} aria-label={'打开工位：'+actor.name}>
        <span className={'om-department-avatar om-'+actor.kind}>{actor.name.slice(0,1)}</span>
        <span><strong>{actor.name}</strong><small>{actor.role||KIND_NAME[actor.kind]}</small></span>
        <em className={'om-state-'+actor.state}>{STATE_NAME[actor.state]||'未核实'}</em>
      </button>)}
      {!department.actors.length && <p className="om-none">这个部门没有已授权的工位记录。</p>}
    </div>
    <p className="om-disclaimer"><DatabaseOutlined/> 数据来自当前授权的工作台投影，成员状态不可在此直接修改。</p>
  </div>;
}

export function TeamRosterRail({departments, onSelectDepartment}) {
  return <div className="om-roster">
    <header><TeamOutlined/><h3>团队画像</h3></header>
    <p>按部门查看当前授权的成员、Agent 和执行节点。能力、状态与并发源于同一份工作台快照。</p>
    {departments.map(group => {
      const stats = officeDepartmentSummary(group);
      return <button key={group.id} onClick={() => onSelectDepartment(group.id)} aria-label={'查看部门：'+group.name}>
        <span className="om-roster-dot" style={{background:group.accent}}/>
        <span className="om-roster-info"><strong>{group.name}</strong><small>{stats.total} 工位 · {stats.running} 执行中</small></span>
        <span className="om-roster-risk">{stats.risk ? stats.risk+' 关注' : '—'}</span>
      </button>;
    })}
    {!departments.length && <p className="om-none">尚无可查看的团队信息。</p>}
  </div>;
}
