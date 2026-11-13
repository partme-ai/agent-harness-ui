import React,{useRef,useState} from 'react';
import {Button,Dropdown,Input,Modal} from 'antd';
import {PlusOutlined,FolderOpenOutlined,CloudOutlined} from '@ant-design/icons';
import {useMockState} from './mock/use_mock_state.js';
import {initialProjects,validateProjectName} from './workspace_navigation.js';
import {validateProjectDirectory,remoteProjectDescriptor} from './project_connection.js';
import './add_project.css';
import {ZCodeRemoteProject} from './zcode/ZCodeRemoteProject.jsx';

export function AddProject(){
 const [projects,setProjects,storageError]=useMockState('workspaceProjectsV1',initialProjects);
 const [,setSources,sourceError]=useMockState('workspaceProjectSourcesV1',()=>({}));
 const [mode,setMode]=useState(null),[menuOpen,setMenuOpen]=useState(false);
 const [folder,setFolder]=useState(''),[name,setName]=useState(''),[error,setError]=useState('');
 const fileInput=useRef(null),generation=useRef(0);
 function open(next){generation.current++;setMenuOpen(false);setMode(next);setFolder('');setName('');setError('')}
 function close(){generation.current++;setMode(null)}
 async function chooseFolder(){
  const current=++generation.current;setError('');
  if(!window.showDirectoryPicker){fileInput.current?.click();return}
  try{const handle=await window.showDirectoryPicker({mode:'read'});if(current!==generation.current)return;setFolder(handle.name);setName(handle.name)}catch(e){if(current!==generation.current||e.name==='AbortError')return;setError('未能选择文件夹，请重试或检查浏览器权限。')}
 }
 function add(){
  const invalid=validateProjectName(name,projects)||(!folder?'请先选择文件夹':'');
  if(invalid){setError(invalid);return}
  const source={kind:'local',directory:folder,status:'selected',access:'name-only'};
  if(!setSources(old=>({...old,[name.trim()]:source})))return;
  if(setProjects(old=>[...old,name.trim()]))close();
 }
 return <>
 <Dropdown open={menuOpen} onOpenChange={setMenuOpen} trigger={['click']} menu={{items:[{key:'local',label:'打开文件夹',icon:<FolderOpenOutlined/>},{key:'remote',label:'远程连接',icon:<CloudOutlined/>}],onClick:({key})=>open(key)}}><Button type="text" aria-label="添加项目" title="添加项目" icon={<PlusOutlined/>}/></Dropdown>
 <Modal title="打开文件夹" width={480} open={mode==='local'} onCancel={close} footer={mode==='local'?<><Button onClick={close}>取消</Button><Button type="primary" onClick={add}>添加项目</Button></>:null} destroyOnHidden>
 {mode==='local'?<div className="tc-project-form"><Button aria-label="选择文件夹" icon={<FolderOpenOutlined/>} onClick={chooseFolder}>选择文件夹</Button><input ref={fileInput} hidden type="file" webkitdirectory="" multiple onChange={e=>{const first=e.target.files?.[0];if(first){const selected=first.webkitRelativePath.split('/')[0];setFolder(selected);setName(selected)}e.target.value=''}}/>{folder&&<p>已选择：{folder}</p>}<label>项目名称<Input aria-label="项目名称" value={name} onChange={e=>setName(e.target.value)}/></label><p className="tc-project-note">仅保存目录名称，不读取文件内容。刷新后需由运行端重新取得目录访问权限；兼容文件选择器无法选择空目录。</p></div>:null}
 {mode==='local'&&(error||storageError||sourceError)&&<p role="alert">{error||storageError||sourceError}</p>}
 </Modal>
 {mode==='remote'&&<ZCodeRemoteProject onClose={close} storageError={storageError||sourceError} onAdd={({name:remoteName,target,directory:remoteDir})=>{const invalid=validateProjectName(remoteName,projects)||validateProjectDirectory(remoteDir);if(invalid)return invalid;const config={host:target.host,user:target.username,port:target.port,container:target.container};if(!setSources(old=>({...old,[remoteName.trim()]:remoteProjectDescriptor(target.kind,config,remoteDir)})))return "保存项目来源失败";if(setProjects(old=>[...old,remoteName.trim()]))close();else return "保存项目失败";}}/>}
 </>;
}
