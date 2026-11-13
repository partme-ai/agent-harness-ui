import type {ComponentProps} from 'react';
import {DropdownMenu as SourceDropdownMenu} from '../ui/components/ui/dropdown-menu';
export * from '../ui/components/ui/dropdown-menu';
// 迁入菜单和现有 Ant Design 抽屉共存；保留菜单键盘导航，避免两个焦点锁相互抢焦点。
export function DropdownMenu(props:ComponentProps<typeof SourceDropdownMenu>){
 return <SourceDropdownMenu {...props} modal={false}/>;
}
