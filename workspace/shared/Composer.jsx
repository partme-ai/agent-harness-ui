import {usePluginResources,pluginOperation,refreshPluginRuntime} from './plugin_runtime.js';
import React,{useEffect,useRef,useState} from 'react';
import {Button,Dropdown,Input,Tag,Tooltip,Image} from 'antd';
import {ArrowUpOutlined,PlusOutlined,DownOutlined,CheckOutlined,BulbOutlined,SafetyOutlined,ExperimentOutlined,PaperClipOutlined,SettingOutlined,OrderedListOutlined,SendOutlined,FileOutlined,CloseOutlined} from '@ant-design/icons';
import {Hand,Brain} from '@phosphor-icons/react';
import {useMockState} from './mock/use_mock_state.js';
import {createProviderSamples} from './settings/settings_samples.js';
import {permissionOptions,thoughtOptions,availableComposerModels,shouldSubmitOnEnter} from './composer_state.js';
import {isCoarseTouchDevice,shouldRestoreChatInputFocusAfterPickerClose} from './pickerFocus.ts';
import './composer.css';
import {ContextPicker,ContextIcon} from './ContextPicker.jsx';
import {createCatalogSamples} from './settings/resource_catalog.js';
import {demoConversations,contextIdentity,contextTypeNames,addContextReference} from './composer_context.js';

// Ant Design rendering adapter for ZCode's exclusive picker owner and draft-only controls.
export function Composer({draft,setDraft,onSubmit,hasRows,desktop,onSettings,queued,setQueued,references=[],setReferences,restoreConfig,targetControl,consoleModels}){
 const [catalog]=usePluginResources();
 const [detail,setDetail]=useState(null);
 const [providers]=useMockState('providers',createProviderSamples);
 const effectiveProviders=consoleModels===null?providers:Object.values(consoleModels.reduce((result,item)=>{const key=item.provider||'自定义';result[key]??={id:key,name:key,models:[],enabledModels:{}};result[key].models.push(item.model);return result},{}));
 const models=availableComposerModels(effectiveProviders);
 const [modelKey,setModelKey]=useState(models.find(m=>m.modelId==='GLM-5.3-Flash')?.key||models[0]?.key);
 const selected=models.find(m=>m.key===modelKey)||models[0];
 const [permission,setPermission]=useState('confirm'),[plan,setPlan]=useState(false),[thought,setThought]=useState('高'),[picker,setPicker]=useState(null),[attachments,setAttachments]=useState([]);
 const input=useRef(null),files=useRef(null),previewUrls=useRef(new Set());
 useEffect(()=>()=>{for(const url of previewUrls.current)URL.revokeObjectURL(url)},[]);
 function attachFiles(list){const additions=Array.from(list).map(file=>{const preview=/^image\/(png|jpeg|gif|webp)$/.test(file.type)?URL.createObjectURL(file):null;if(preview)previewUrls.current.add(preview);return {id:crypto.randomUUID(),name:file.name,size:file.size,type:file.type,preview}});setAttachments(items=>[...items,...additions]);}
 function removeAttachment(file){if(file.preview){URL.revokeObjectURL(file.preview);previewUrls.current.delete(file.preview)}setAttachments(items=>items.filter(i=>i.id!==file.id));}

 useEffect(()=>{if(!restoreConfig)return;setPermission(restoreConfig.permission||'confirm');setPlan(!!restoreConfig.planEnabled);setThought(restoreConfig.reasoningLevel||'高');if(restoreConfig.model)setModelKey(JSON.stringify([restoreConfig.model.providerId,restoreConfig.model.modelId]));setAttachments(restoreConfig.attachments||[])},[restoreConfig]);
 function removeReference(item){setReferences(references.filter(r=>contextIdentity(r)!==contextIdentity(item)));if(detail&&contextIdentity(detail)===contextIdentity(item))setDetail(null);}
 const current=permissionOptions.find(p=>p.value===permission);
 function focusEditor(){if(shouldRestoreChatInputFocusAfterPickerClose({isCoarseTouchDevice:isCoarseTouchDevice()}))requestAnimationFrame(()=>input.current?.focus());}
 function close(){setPicker(null);focusEditor();}
 function changeOpen(name,open){if(open)setPicker(name);else{setPicker(active=>active===name?null:active);focusEditor();}}
 function submit(){if(!draft.trim()&&!attachments.length&&!references.length)return;if(onSubmit({references:references.map(item=>({...item})),permission,planEnabled:plan,model:selected?{providerId:selected.providerId,modelId:selected.modelId}:null,reasoningLevel:thought,attachments:attachments.map(({preview,...metadata})=>metadata)})===false)return;for(const url of previewUrls.current)URL.revokeObjectURL(url);previewUrls.current.clear();setAttachments([]);setReferences?.([]);setDetail(null);setPicker(null);}
 useEffect(()=>{function shortcut(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='m'){e.preventDefault();setPicker('model')}}window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut)},[]);
 const modeMenu={selectable:false,items:[
  {key:'plan',icon:<BulbOutlined/>,label:<span className="tc-picker-description"><strong>计划模式</strong><small>编辑前先出计划。</small></span>,extra:plan?<CheckOutlined/>:null},
  {type:'divider'},...permissionOptions.map(p=>({key:p.value,icon:p.icon==='hand'?<Hand size={16}/>:<SafetyOutlined/>,label:<span className="tc-picker-description"><strong>{p.label}</strong><small>{p.description}</small></span>,extra:permission===p.value?<CheckOutlined/>:null}))
 ],onClick:({key})=>{if(key==='plan')setPlan(!plan);else setPermission(key);close()}};
 const modelMenu={selectedKeys:selected?[selected.key]:[],items:[...effectiveProviders.map(p=>({type:'group',key:p.id,label:p.name,children:models.filter(m=>m.providerId===p.id).map(m=>({key:m.key,label:m.modelId,extra:selected?.key===m.key?<CheckOutlined/>:null}))})).filter(g=>g.children.length),{type:'divider'},{key:'manage',icon:<SettingOutlined/>,label:'管理模型'}],onClick:({key})=>{if(key==='manage')onSettings?.('model-services',draft);else setModelKey(key);close()}};
 const thoughtMenu={selectedKeys:[thought],items:thoughtOptions.map(value=>({key:value,label:value,extra:value===thought?<CheckOutlined/>:null})),onClick:({key})=>{setThought(key);close()}};
 function menu(name,menu,trigger,wide=false){return <Dropdown destroyOnHidden trigger={['click']} placement="topLeft" open={picker===name} onOpenChange={open=>changeOpen(name,open)} menu={menu} classNames={{root:`tc-composer-popup ${name==='mode'?'tc-permission-popup':''} ${wide?'tc-composer-popup-wide':''}`}}>{trigger}</Dropdown>}
 return <div className="conversation-composer tc-composer" onDragOver={e=>{if(e.dataTransfer.types.includes('Files'))e.preventDefault()}} onDrop={e=>{if(e.dataTransfer.files.length){e.preventDefault();attachFiles(e.dataTransfer.files)}}}>
 {references.length>0&&<div className="tc-context-references">{references.map(item=><Tag key={contextIdentity(item)} icon={<ContextIcon type={item.type}/>}><Button type="text" aria-label={`查看引用 ${item.name}`} onClick={()=>setDetail(item)}>{item.name}</Button><Button type="text" size="small" aria-label={`移除引用 ${item.name}`} icon={<CloseOutlined/>} onClick={()=>removeReference(item)}/></Tag>)}</div>}
 {detail&&<div className="tc-context-detail"><strong>{contextTypeNames[detail.type]} · {detail.name}</strong><p>{detail.description}</p><small>{detail.scope==='user'?'用户':'工作区'}范围 · 本地资源引用</small><Button type="text" size="small" aria-label="关闭引用详情" icon={<CloseOutlined/>} onClick={()=>setDetail(null)}/></div>}
 {attachments.length>0&&<div className="tc-composer-attachments">{attachments.map(file=>file.preview?<div key={file.id} className="tc-image-attachment"><Image src={file.preview} alt={file.name} width={96} height={96}/><Button type="text" size="small" aria-label={`移除附件 ${file.name}`} icon={<CloseOutlined/>} onClick={()=>removeAttachment(file)}/></div>:<div key={file.id} className="tc-file-attachment"><FileOutlined/><span><strong title={file.name}>{file.name}</strong><small>{file.size<1024?`${file.size} B`:`${Math.ceil(file.size/1024)} KB`} · 本地附件</small></span><Button type="text" size="small" aria-label={`移除附件 ${file.name}`} icon={<CloseOutlined/>} onClick={()=>removeAttachment(file)}/></div>)}</div>}
 <Input.TextArea onPaste={e=>{if(e.clipboardData.files.length)attachFiles(e.clipboardData.files)}} ref={input} aria-label="输入消息" value={draft} onChange={e=>setDraft(e.target.value)} autoSize={{minRows:2,maxRows:8}} placeholder={hasRows?'提出后续修改要求':'描述任务，或提出问题…'} onKeyDown={e=>{if(shouldSubmitOnEnter({...e.nativeEvent,key:e.key,shiftKey:e.shiftKey,isComposing:e.nativeEvent.isComposing,keyCode:e.nativeEvent.keyCode})){e.preventDefault();submit()}}}/>
 <input ref={files} type="file" multiple hidden onChange={e=>{attachFiles(e.target.files);e.target.value=''}}/>
 <div className="composer-toolbar">
 <div className="tc-composer-left">{targetControl}
 <ContextPicker open={picker==='add'} onOpenChange={open=>changeOpen('add',open)} catalog={catalog} conversations={demoConversations} references={references} onSelect={item=>{setReferences?.(items=>addContextReference(items,item));focusEditor()}} onFiles={()=>files.current.click()} plan={plan} onPlan={()=>setPlan(!plan)}/>
 {menu('mode',modeMenu,<Button type="text" aria-label="权限模式" className={`tc-permission-trigger ${permission==='full'?'tc-permission-full':''}`} title="更改权限" icon={permission==='confirm'?<Hand size={16}/>:<SafetyOutlined/>}><span className="tc-permission-label">{current.label}</span><DownOutlined className="tc-control-caret"/></Button>,true)}
 {plan&&<Tooltip title="计划模式已开启 · 点击取消"><Button type="text" className="tc-plan-trigger" aria-label="取消计划模式" aria-pressed={true} icon={<BulbOutlined/>} onClick={()=>setPlan(false)}><span className="tc-plan-label">计划</span></Button></Tooltip>}
 </div>
 <div className="tc-composer-right">
 {desktop&&<Tooltip title={queued?'加入等待队列':'直接发送'}><Button type="text" aria-label={queued?'直接发送':'加入等待队列'} icon={queued?<OrderedListOutlined/>:<SendOutlined/>} onClick={()=>setQueued(!queued)}/></Tooltip>}
 {menu('model',modelMenu,<Button type="text" aria-label="模型" className="tc-model-trigger" title={selected?`${selected.providerName} / ${selected.modelId}`:'选择模型'}><span>{selected?.modelId||'选择模型'}</span><DownOutlined className="tc-control-caret"/></Button>,true)}
 {menu('thought',thoughtMenu,<Button type="text" aria-label="思考强度" icon={<Brain size={16}/>}><span className="tc-thought-label">{thought}</span><DownOutlined className="tc-control-caret"/></Button>)}
 <Tooltip title="发送 · Enter（Shift+Enter 换行）"><Button className="tc-send" type="primary" aria-label="发送消息" disabled={!draft.trim()&&!attachments.length&&!references.length} icon={<ArrowUpOutlined/>} onClick={submit}/></Tooltip>
 </div>
 </div>
 </div>
}
