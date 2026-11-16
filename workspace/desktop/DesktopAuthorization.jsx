import React, {useEffect, useState} from 'react';
import {Button, Modal} from 'antd';
import {ArrowSquareOut, Key} from '@phosphor-icons/react';
import './desktop_authorization.css';

const messages = {
  idle: ['在系统浏览器中确认身份，完成后将自动返回工作台。', 'Confirm your identity in your browser to return to the workspace.'],
  preview: ['请从 Agent Harness 桌面客户端发起浏览器授权。', 'Open the Agent Harness desktop app to authorize in your browser.'],
  unconfigured: ['此客户端还未配置授权服务。你可以返回本地工作区。', 'Authorization is not configured. You can return to your local workspace.'],
  waiting: ['请在系统浏览器中继续，并允许浏览器打开 Agent Harness UI。', 'Continue in your browser and allow it to open Agent Harness UI.'],
  exchanging: ['已收到浏览器回调，正在确认授权。', 'Browser callback received. Confirming authorization.'],
  denied: ['授权已被拒绝。你可以重新发起授权。', 'Authorization was declined. You can try again.'],
  expired: ['授权已过期，请重新发起。', 'Authorization expired. Please try again.'],
  failed: ['授权未完成，请检查授权服务后重试。', 'Authorization failed. Check your authorization service and retry.'],
  authorized: ['此客户端已获得授权。', 'This client is authorized.'],
};

export function useDesktopAuthorization() {
  const bridge = window.webkit?.messageHandlers?.harnessAuth;
  const [phase, setPhase] = useState(bridge ? 'idle' : 'preview');
  const [visible, show] = useState(false);
  useEffect(() => {
    if (!bridge) return;
    const receive = ({detail}) => {
      if (!Object.hasOwn(messages, detail)) return;
      setPhase(detail);
      if (detail === 'waiting' || detail === 'exchanging') show(true);
    };
    window.addEventListener('harness-auth-status', receive);
    bridge.postMessage('status');
    return () => window.removeEventListener('harness-auth-status', receive);
  }, []);
  const close = () => {
    if (phase === 'waiting' || phase === 'exchanging') bridge?.postMessage('cancel');
    show(false);
  };
  return {phase, visible, native: Boolean(bridge), open: () => show(true), close, send: action => bridge?.postMessage(action)};
}

export function DesktopAuthorization({auth, locale}) {
  const en = (locale === 'system' ? navigator.language : locale)?.startsWith('en');
  const copy = (zh, english) => en ? english : zh;
  const canStart = ['idle','expired','failed','denied'].includes(auth.phase);
  return <Modal open={auth.visible} width={396} centered title={copy('桌面授权','Desktop authorization')}
    className="harness-desktop-auth" onCancel={auth.close} footer={<>
      <Button onClick={auth.close}>{copy('返回工作区','Back to workspace')}</Button>
      {canStart && <Button type="primary" icon={<ArrowSquareOut/>} onClick={() => auth.send('start')}>{copy('在浏览器中授权','Authorize in browser')}</Button>}
    </>}>
    <div className="harness-auth-glass" aria-hidden="true"><i/><i/><span><Key size={32}/></span></div>
    <p role="status">{messages[auth.phase][en ? 1 : 0]}</p>
  </Modal>;
}
