import React from 'react';
import {MenuOutlined,PlusOutlined,SearchOutlined,SettingOutlined} from '@ant-design/icons';
import {IconAction} from '../shared/IconAction';
// 平板拥有常驻快捷栏及抽屉，保持与桌面相同的功能目的地。
export function TabletWorkspaceShell({children,heading,onDrawer,onNew,onSearch,onSettings,navigation,linkEntry,chat,tools}){
 return <div className="tc-shell tc-wide"><aside className="tc-rail"><strong className="tc-brand" title="Agent Harness UI">AH</strong><IconAction label="新建对话" icon={<PlusOutlined/>} onClick={onNew}/><nav aria-label="主导航">{navigation}</nav><IconAction className="tc-rail-settings" label="设置" icon={<SettingOutlined/>} onClick={onSettings}/></aside><main className="tc-main"><header className="tc-header"><IconAction label="打开抽屉" icon={<MenuOutlined/>} onClick={onDrawer}/>{heading}<span className="tc-header-spacer"/>{chat&&tools}<IconAction label="搜索" icon={<SearchOutlined/>} onClick={onSearch}/>{linkEntry}</header><div className={'tc-body '+(chat?'tc-chat-body':'tc-page-body')}>{children}</div></main></div>;
}
