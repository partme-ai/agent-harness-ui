import React from 'react';
import {Button,Tooltip} from 'antd';
export function IconAction({label,icon,onClick,...props}){return <Tooltip title={label}><Button type="text" aria-label={label} title={label} icon={icon} onClick={onClick} {...props}/></Tooltip>}
