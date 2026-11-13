import React from 'react';
import {MenuOutlined,PlusOutlined} from '@ant-design/icons';
import {IconAction} from '../shared/IconAction';
// 手机拥有单栏、抽屉和顶栏新对话入口；内容与状态由共享工作台提供。
export function MobileWorkspaceShell({children,heading,onDrawer,onNew,chat,tools}){
 return <div className="tc-shell tc-phone"><main className="tc-main"><header className="tc-header"><IconAction label="打开抽屉" icon={<MenuOutlined/>} onClick={onDrawer}/>{heading}<span className="tc-header-spacer"/>{chat&&tools}<IconAction className="tc-new-conversation" label="新建对话" icon={<PlusOutlined/>} onClick={onNew}/></header><div className={'tc-body '+(chat?'tc-chat-body':'tc-page-body')}>{children}</div></main></div>;
}
