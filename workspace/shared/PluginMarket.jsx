import {PluginMcpPanel} from './PluginMcpPanel.jsx';
import {usePluginResources,pluginOperation,refreshPluginRuntime} from './plugin_runtime.js';
import React,{useRef,useState,useEffect,useMemo} from 'react';
import {Alert,Button,Drawer,Dropdown,Empty,Input,Modal,Select,Switch,Tag} from 'antd';
import {DownOutlined,PlusOutlined,ReloadOutlined,SettingOutlined} from '@ant-design/icons';
import {useMockState} from './mock/use_mock_state.js';
import {downloadJson,setResourceEnabled,removeResource} from './mock/resource_operations.js';
import {createCatalogSamples} from './settings/resource_catalog.js';
import {PLUGIN_SCHEMA,publicPluginDirectory,parsePluginManifest,addPersonalPlugin,findInstalledPlugin,installDirectoryPlugin,removePluginRepository} from './plugin_directory.js';
import './plugin_market.css';
import claudeSnapshot from './catalogs/claude_official.json';
import {parseClaudeMarketplace,fetchClaudeMarketplace,CLAUDE_MARKETPLACE_ID,CLAUDE_MARKETPLACE_REPOSITORY} from './claude_marketplace.js';
import {PluginDirectory} from './zcode/PluginDirectory.jsx';

export function PluginMarket({onSettings,initialAction}){
 const [claudeCache,setClaudeCache,claudeCacheError]=useMockState('claudeMarketplaceV1',()=>claudeSnapshot);
 const [refreshing,setRefreshing]=useState(false);
 const refreshLock=useRef(false);
 const claudeCatalog=useMemo(()=>{try{return {items:parseClaudeMarketplace(claudeCache.catalog),fetchedAt:claudeCache.fetchedAt,revision:claudeCache.revision}}catch{return {items:parseClaudeMarketplace(claudeSnapshot.catalog),fetchedAt:claudeSnapshot.fetchedAt,revision:claudeSnapshot.revision}}},[claudeCache]);
 const publicItems=useMemo(()=>[...claudeCatalog.items,...publicPluginDirectory],[claudeCatalog]);
 const [resources,setResources,storageError,runtime]=usePluginResources();
 const [personal,setPersonal,personalError]=useMockState('personalPluginDirectoryV1',()=>[]);
 const [repositories,setRepositories,repoError]=useMockState('pluginRepositoriesV1',()=>[]);
 const [scope,setScope]=useMockState('pluginInstallScopeV1','user');
 const [view,setView]=useMockState('pluginDirectoryViewV1',()=>({tab:'public',query:'',category:'全部'}));
 const [dialog,setDialog]=useState(null),[name,setName]=useState(''),[description,setDescription]=useState(''),[address,setAddress]=useState(''),[repositoryId,setRepositoryId]=useState(null);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[detail,setDetail]=useState(null),[preview,setPreview]=useState(null),[warnings,setWarnings]=useState([]),[removing,setRemoving]=useState(null),[uninstalling,setUninstalling]=useState(null);
 const fileRef=useRef(null),readGeneration=useRef(0);
 const [operation,setOperation]=useState(false),[runtimeError,setRuntimeError]=useState('');
 async function run(action,data){setOperation(true);setRuntimeError('');try{await pluginOperation(action,data);return true}catch(e){setRuntimeError(e.message);return false}finally{setOperation(false)}}
 async function togglePlugin(item,enabled){if(item.runtime==='local')return run('enable',{id:item.id,enabled});return setResources(old=>setResourceEnabled(old,'plugins',item,enabled))}
 async function removePlugin(item){return item.runtime==='local'?run('uninstall',{id:item.id}):setResources(old=>removeResource(old,'plugins',item))}
 async function updatePlugin(item){if(item.runtime==='local')return run('update',{id:item.id});setResources(old=>({...old,plugins:old.plugins.map(p=>p.id===item.id?{...p,updateAvailable:false,version:'1.1.0'}:p)}))}
 const installed=resources.plugins.filter(p=>p.scope===scope);
 const legacy=resources.plugins.filter(p=>p.origin==='会话草稿'&&!p.directoryId&&!personal.some(d=>d.name.toLowerCase()===p.name.toLowerCase()));
 const personalItems=[...personal,...legacy];
 const selected=detail&&(detail.installedId?installed.find(p=>p.id===detail.installedId):findInstalledPlugin(resources.plugins,detail,scope));
 function open(type){readGeneration.current++;setDialog(type);setName('');setDescription('');setAddress('');setRepositoryId(null);setError('');setPreview(null);setWarnings([])}
 useEffect(()=>{if(["create","import","repository"].includes(initialAction))open(initialAction)},[initialAction]);
 function close(){readGeneration.current++;setDialog(null)}
 function saveRepository(){
  try{
   if(!name.trim())throw new Error('请输入仓库名称');
   let url;try{url=new URL(address.trim());if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error()}catch{throw new Error('请输入不含凭据的 HTTP 或 HTTPS 仓库地址')}
   if(repositories.some(r=>r.url===url.href))throw new Error('仓库地址已存在');
   if(!setRepositories(old=>[...old,{id:crypto.randomUUID(),name:name.trim(),url:url.href}]))return;
   setView({...view,tab:'personal',query:''});setMessage('已添加仓库来源，远程目录同步尚未接入。');close();
  }catch(e){setError(e.message)}
 }
 function createPreview(){try{const result=parsePluginManifest(JSON.stringify({$schema:PLUGIN_SCHEMA,name:name.trim(),version:'1.0.0',description:description.trim()}));setPreview(result.manifest);setWarnings(result.warnings);setError('')}catch(e){setError(e.message)}}
 async function readManifest(event){
  const file=event.target.files?.[0],generation=++readGeneration.current;event.target.value='';setPreview(null);setError('');if(!file)return;
  try{if(file.name!=='plugin.json')throw new Error('请选择插件根目录的 plugin.json');if(file.size>200*1024)throw new Error('plugin.json 不得超过 200 KB');const result=parsePluginManifest(await file.text());if(generation!==readGeneration.current)return;setPreview(result.manifest);setWarnings(result.warnings)}catch(e){if(generation===readGeneration.current)setError(e.message)}
 }
 function savePlugin(){try{
  if(!preview)throw new Error('请先预览有效的插件清单');
  if(!setPersonal(old=>addPersonalPlugin(old,{name:preview.name,description:preview.description||'',manifest:preview,repositoryId,origin:dialog==='import'?'本地清单导入':'创建插件'})))return;
  setView({...view,tab:'personal',query:''});setMessage('插件已保存到个人目录；可打开详情选择安装范围。');close();
 }catch(e){setError(e.message)}}
 async function install(item){
  if(item.marketplaceId===CLAUDE_MARKETPLACE_ID){if(await run('install',{name:item.name,scope}))setMessage(`${item.name} 已安装并从本机加载。`);return}
  try{if(setResources(old=>installDirectoryPlugin(old,item,scope)))setMessage(`${item.name} 已模拟安装到${scope==='user'?'用户':'项目'}范围。`)}catch(e){setMessage(e.message)}
 }

 async function refresh(){
  if(refreshLock.current)return;
  refreshLock.current=true;setRefreshing(true);setMessage('');
  try{
   await refreshPluginRuntime();
   const next=await fetchClaudeMarketplace();
   if(setClaudeCache({catalog:next.catalog,fetchedAt:next.fetchedAt}))setMessage(`已刷新 Claude 官方插件目录：${next.items.length} 个插件。`);
  }catch(e){setMessage(`刷新失败，已保留上次可用目录。${e.name==='AbortError'?'请求超时，请重试。':e.message}`)}
  finally{refreshLock.current=false;setRefreshing(false)}
 }

 return <section className="tc-plugin-market">
  <header><div><h1>插件市场</h1><p>发现和组合技能、MCP 与工作流程。</p></div><div className="tc-plugin-actions">
   <Button aria-label="刷新插件" title="刷新" icon={<ReloadOutlined/>} loading={refreshing} onClick={refresh}/>
   <Button aria-label="管理插件仓库" title="管理插件仓库" icon={<SettingOutlined/>} onClick={()=>open('repositories')}/>
   <Dropdown trigger={['click']} menu={{items:[{key:'create',label:'创建插件'},{key:'import',label:'导入本地插件'},{key:'repository',label:'添加插件仓库'}],onClick:({key})=>open(key)}}><Button aria-label="添加插件" icon={<PlusOutlined/>}>添加 <DownOutlined/></Button></Dropdown>
  </div></header>
  {(storageError||personalError||repoError||claudeCacheError)&&<Alert type="error" title={storageError||personalError||repoError||claudeCacheError}/>}
  {(runtime.error||runtimeError)&&<Alert type="error" title={runtimeError||runtime.error} action={<Button onClick={()=>{setRuntimeError('');refreshPluginRuntime()}}>重试</Button>}/>}
  {message&&<p role="status">{message}</p>}
  <PluginDirectory directory={[...publicItems,...personalItems]} installed={installed} allPlugins={resources.plugins} repositories={repositories} scope={scope} view={view} onView={setView} onDetail={setDetail} onManage={()=>onSettings('plugins')} onSetEnabled={togglePlugin} onUninstall={setUninstalling} onUpdate={updatePlugin}/>
  <Drawer title={detail?.name} width={480} open={!!detail} onClose={()=>setDetail(null)}>
   <p>{detail?.description}</p>
   {detail?.marketplaceId===CLAUDE_MARKETPLACE_ID&&<section className="tc-plugin-source-detail"><Tag>Claude Code 插件</Tag><p>来源市场：Claude 官方插件市场</p><p>作者：{detail.author}</p><a href={detail.sourceUrl} target="_blank" rel="noreferrer">查看插件源码</a><h3>在 Claude Code 中安装</h3><pre className="tc-plugin-manifest">{detail.claudeInstallCommand}</pre><p>此命令供 Claude Code 使用。也可直接安装到 Agent Harness UI，由本机插件服务下载并加载支持的能力。</p></section>}
<div className="tc-plugin-detail-scope"><label>安装范围 <Select virtual={false} aria-label="插件安装范围" value={scope} onChange={value=>{setScope(value);if(detail?.installedId){const directory=[...publicItems,...personalItems].find(p=>p.directoryId===detail.directoryId||p.id===detail.id||`workspace-${p.id}`===detail.id);setDetail(directory||{...detail,installedId:undefined})}}} options={[{value:'user',label:'用户'},{value:'workspace',label:`项目 · ${runtime.workspaceName}`}]}/></label></div>
   {selected?.runtime==='local'&&<section className="tc-plugin-source-detail"><Tag color="green">本机已安装</Tag><p className="tc-plugin-url">{selected.installPath}</p><small>版本：{selected.version} · SHA-256：{selected.archiveSha256?.slice(0,12)}</small>{selected.diagnostics?.map((line,i)=><p key={i}>{line}</p>)}<Button loading={operation} onClick={()=>updatePlugin(selected)}>检查并更新</Button></section>}
   <p><Tag>{selected?'已安装':'未安装'}</Tag>{selected?.version&&<Tag>{selected.version}</Tag>}{selected?.updateAvailable&&<Tag color="green">可更新</Tag>}</p>
   {selected?<><Switch aria-label={`启用插件 ${selected.name}`} checked={selected.enabled!==false} disabled={operation} onChange={enabled=>togglePlugin(selected,enabled)}/><h3>插件提供的资源</h3>{[['skills','技能'],['mcp','MCP 服务器'],['commands','命令'],['hooks','钩子']].map(([key,label])=>{const children=resources[key].filter(r=>r.pluginId===selected.id&&r.scope===scope);return <section key={key}><h4>{label} · {children.length}</h4>{children.map(r=><div key={r.id}><p>{r.name}</p>{r.runtime==='local'&&r.content&&<details><summary>查看内容</summary><pre className="tc-plugin-manifest">{r.content}</pre></details>}{r.runtime==='local'&&key==='mcp'&&<PluginMcpPanel plugin={selected} server={r}/>}</div>)}</section>})}<Button onClick={()=>onSettings('plugins')}>在设置中管理</Button></>:<Button type="primary" loading={operation} disabled={detail?.marketplaceId===CLAUDE_MARKETPLACE_ID&&(runtime.loading||!!runtime.error)} onClick={()=>install(detail)}>{detail?.marketplaceId===CLAUDE_MARKETPLACE_ID?'安装':'模拟安装'}</Button>}
   {runtimeError&&<p role="alert">{runtimeError}</p>}
   {detail?.manifest&&<><h3>plugin.json</h3><pre className="tc-plugin-manifest">{JSON.stringify(detail.manifest,null,2)}</pre><Button onClick={()=>downloadJson('plugin.json',detail.manifest)}>导出清单</Button></>}
  </Drawer>
  <Modal title={{repositories:'管理插件仓库',repository:'添加插件仓库',create:'创建插件',import:'导入本地插件'}[dialog]} open={!!dialog} onCancel={close} footer={dialog==='repositories'?<Button onClick={()=>open('repository')}>添加插件仓库</Button>:dialog==='repository'?<Button type="primary" onClick={saveRepository}>保存仓库</Button>:<><Button onClick={close}>取消</Button>{preview?<Button type="primary" onClick={savePlugin}>保存到个人插件</Button>:dialog==='create'?<Button type="primary" onClick={createPreview}>预览清单</Button>:null}</>}>
   {dialog==='repositories'?<><div className="tc-plugin-repository"><strong>Claude 官方插件市场 <Tag>内置公共仓库</Tag></strong><a href={CLAUDE_MARKETPLACE_REPOSITORY} target="_blank" rel="noreferrer">{CLAUDE_MARKETPLACE_REPOSITORY}</a><small>{claudeCatalog.items.length} 个插件 · {new Date(claudeCatalog.fetchedAt).toLocaleString()}</small>{claudeCatalog.revision&&<small>快照版本：{claudeCatalog.revision.slice(0,12)}</small>}<Button loading={refreshing} onClick={refresh}>刷新公共目录</Button></div><p>管理个人插件的目录来源，移除来源不会卸载已安装插件。</p>{repositories.map(r=><div className="tc-plugin-repository" key={r.id}><strong>{r.name}</strong><small>{r.url}</small><Button onClick={()=>setRemoving(r)}>移除来源</Button></div>)}{!repositories.length&&<Empty description="尚未添加个人插件仓库" image={Empty.PRESENTED_IMAGE_SIMPLE}/>}</>:dialog==='repository'?<div className="tc-plugin-form"><label>仓库名称<Input aria-label="仓库名称" value={name} onChange={e=>setName(e.target.value)}/></label><label>仓库地址<Input aria-label="仓库地址" value={address} onChange={e=>setAddress(e.target.value)}/></label><p>当前仅保存来源地址，尚未接入远程目录同步。</p></div>:<div className="tc-plugin-form">
   <label>所属仓库<Select virtual={false} aria-label="所属仓库" value={repositoryId||'local'} onChange={value=>setRepositoryId(value==='local'?null:value)} options={[{value:'local',label:'本地与未分组'},...repositories.map(r=>({value:r.id,label:r.name}))]}/></label>
   {dialog==='create'&&!preview&&<><label>插件标识<Input aria-label="插件标识" placeholder="my-plugin" value={name} onChange={e=>setName(e.target.value)}/></label><label>用途描述<Input.TextArea aria-label="插件用途" value={description} onChange={e=>setDescription(e.target.value)}/></label></>}
   {dialog==='import'&&<><Button onClick={()=>fileRef.current?.click()}>选择 plugin.json</Button><input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={readManifest}/><p>读取插件根目录的清单，预览后保存；不会导入整个文件夹或执行其中代码。</p></>}
   {preview&&<><h3>清单预览</h3><pre className="tc-plugin-manifest">{JSON.stringify(preview,null,2)}</pre><p>技能与 MCP 文件需后续由运行端加载，清单本身不包含可运行资源。</p>{dialog==='create'&&<Button onClick={()=>setPreview(null)}>返回编辑</Button>}</>}
   {warnings.map(w=><p key={w} role="note">{w}</p>)}
  </div>}
  {error&&<p role="alert">{error}</p>}
 </Modal>
 <Modal title="卸载插件" open={!!uninstalling} onCancel={()=>setUninstalling(null)} okText="卸载" confirmLoading={operation} onOk={async()=>{if(await removePlugin(uninstalling))setUninstalling(null);}}><p>从当前安装范围移除“{uninstalling?.name}”及其附属资源？{uninstalling?.runtime==='local'?'将删除此范围的已下载插件包。':'不会删除本机文件。'}</p></Modal>
 <Modal title="移除插件仓库" open={!!removing} onCancel={()=>setRemoving(null)} okText="移除来源" onOk={()=>{const next=removePluginRepository(personal,repositories,removing.id);if(!setPersonal(next.items)||!setRepositories(next.repositories))return;setRemoving(null)}}><p>移除“{removing?.name}”后，已有个人插件转入“本地与未分组”，已安装插件保留。</p></Modal>
 </section>;
}
