import {Button,Input,Modal} from 'antd';
import React,{useState} from 'react';
import {downloadJson} from './resource_operations.js';
// Export the actual mock configuration; no credentials are included.
export function JsonExportDialog({name,value,onClose}) {
 const [message,setMessage]=useState('');const text=JSON.stringify(value,null,2);
 return <Modal open title="导出 JSON" onCancel={onClose} width={680} getContainer={()=>document.getElementById('buddy-root')} styles={{body:{maxHeight:'calc(100dvh - 180px)',overflow:'auto'}}} footer={<><Button onClick={onClose}>关闭</Button><Button onClick={async()=>{try{await navigator.clipboard.writeText(text);setMessage('JSON 已复制')}catch{setMessage('剪贴板不可用，请选择上方 JSON 手动复制')}}}>复制 JSON</Button><Button onClick={()=>{downloadJson(name,value);setMessage('已请求下载；若客户端拦截下载，可复制上方 JSON。')}}>下载 JSON</Button></>}><p>{name} · Mock 配置</p><Input.TextArea aria-label="导出 JSON 内容" readOnly value={text} rows={14}/>{message&&<p role="status">{message}</p>}</Modal>;
}
