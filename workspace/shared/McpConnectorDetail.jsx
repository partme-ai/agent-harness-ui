import React,{useState} from 'react';
import {PluginMcpPanel} from './PluginMcpPanel.jsx';
import {Button,Tag} from 'antd';
import {ApiOutlined} from '@ant-design/icons';
import {mcpPresentation,mcpExamples} from './mcp_presentation.js';

export function McpConnectorDetail({resource,plugin,installed,onInstall,onConfigure}){
 const [checked,setChecked]=useState(false);
 const {transport,status}=mcpPresentation(resource);
 return <div className="tc-mcp-detail">
  <div className="tc-mcp-identity"><span className="tc-market-icon kind-mcp"><ApiOutlined/></span><div><h2>{resource.name}</h2><Tag color="blue">MCP</Tag><Tag>{transport}</Tag><Tag>{checked?'连接检查通过':status}</Tag></div></div>
  <p>{resource.description}</p>
  {!installed?<><Button type="primary" block onClick={onInstall}>安装 MCP</Button><p className="tc-muted">安装后再配置服务授权；安装不会自动连接。</p></>:<>
   <h3>连接与授权</h3>
   {resource.runtime==='local'&&plugin?<><p className="tc-muted">填写此次连接所需的变量，然后连接并验证可用工具。变量不会保存在浏览器中。</p><PluginMcpPanel key={resource.id} plugin={plugin} server={resource} connectLabel="连接" onChecked={setChecked} showTools={false}/></>:<><p className="tc-muted">此连接器尚未完成授权。请在 MCP 服务器设置中配置服务地址、启动命令与所需凭据，然后检查连接。</p><Button type="primary" block onClick={onConfigure}>连接 · 配置授权</Button></>}
  </>}
  <h3>连接后可以这样使用</h3>
  <ul className="tc-mcp-use-cases">{mcpExamples(resource).map(example=><li key={example}>{example}</li>)}</ul>
  <p className="tc-muted">以上是用途示例；只有授权和连接检查通过后才可调用实际工具。</p>
 </div>;
}
