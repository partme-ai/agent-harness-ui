import React from 'react';
import {Button,Tag} from 'antd';
import {CloseOutlined} from '@ant-design/icons';
import {deviceNames} from './device_workspace.js';
import {sampleConversation} from './conversation_state.js';

export function ConversationStatusPanel({workspace,onClose}){
 const session=workspace.state.sessions.find(item=>item.id===workspace.session&&item.kind===workspace.kind);
 const target=workspace.state.devices.find(item=>item.id===(workspace.kind==='work'?workspace.role:workspace.target));
 const count=session?.rows.length??sampleConversation.rows.length;
 return <aside className="tc-goals" aria-label="状态看板"><header><h3>状态看板</h3><Tag color="default">本地预览</Tag><Button type="text" aria-label="关闭状态看板" icon={<CloseOutlined/>} onClick={onClose}/></header><div className="tc-goal-scroll"><dl className="harness-status-list"><div><dt>会话模式</dt><dd>{workspace.kind==='chat'?'聊天 · 绑定设备可见':'工作 · 仅本机'}</dd></div><div><dt>目标设备</dt><dd>{target?.name||deviceNames[workspace.role]} · {target?.online?'在线':'离线'}</dd></div><div><dt>当前会话</dt><dd>{session?.title||'示例会话'}</dd></div><div><dt>对话记录</dt><dd>{count} 条{session?'':'示例'}</dd></div><div><dt>执行服务</dt><dd>未连接</dd></div></dl><p>{session?'消息保存在本地演示工作区。':'当前展示固定示例会话。'}没有启动模型、工具或命令执行。</p></div></aside>;
}
