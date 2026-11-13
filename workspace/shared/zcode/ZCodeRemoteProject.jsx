import React,{useState} from 'react';
import {Alert,Input} from 'antd';
import {Dialog,DialogContent} from './ui/components/ui/dialog';
import {Button} from './ui/components/ui/button';
import {RemoteConnectionWizardSidebar,RemoteConnectionWizardHeader} from './ui/RemoteConnectionWizardChrome';
import {RemoteConnectionKindStep,RemoteConnectionSettingsStep} from './ui/RemoteConnectionDialogContent';
import {useRemoteConnectionForm} from './ui/hooks/useRemoteConnectionForm';
import {buildRemoteTarget,getRemoteWizardStepCopy} from './ui/lib/remoteConnectionWizard';
import {DirectoryBrowser} from './ui/DirectoryBrowser';
import {useZCodeIntl} from './adapters/intl';
import {previewDirectoryServices} from './adapters/remote_preview';

// 上游组件负责字段、校验、历史建议和目录导航；此层只桥接 TinyClaw 的项目存储。
export function ZCodeRemoteProject({onClose,onAdd,storageError}){
 const [step,setStep]=useState('kind'),[error,setError]=useState(''),[target,setTarget]=useState(null),[name,setName]=useState(''),[selectedDirectory,setSelectedDirectory]=useState('');
 const form=useRemoteConnectionForm({open:true,isWindowsDesktop:false});
 const {intl}=useZCodeIntl(),copy=getRemoteWizardStepCopy(intl,step,form.kind);
 function connect(){
  const result=buildRemoteTarget(intl,form);
  if(result.errorMessage){setError(result.errorMessage);return;}
  if(form.kind==='ssh'&&(!/^\d+$/.test(form.port)||Number(form.port)<1||Number(form.port)>65535)){setError('端口必须在 1–65535 之间');return;}
  // 凭据不传给演示服务，也不写入任何持久化状态。
  const {password,privateKeyPassphrase,privateKeyPath,...descriptor}=result.target;
  setTarget(descriptor);setError('');setStep('connecting');
 }
 const handlers={};
 for(const field of ['Host','Port','Username','SshAuthMethod','AssetInstallMode','Password','PrivateKeyPath','PrivateKeyPassphrase','WslDistro','WslUser','DockerContainer','ManualDockerContainer'])handlers['on'+field+'Change']=form['set'+field];
 return <Dialog open onOpenChange={open=>{if(!open)onClose();}}><DialogContent showCloseButton={false} className="tc-zcode-remote-dialog zcode-surface">
  <RemoteConnectionWizardSidebar currentStep={step}/>
  <section className="tc-zcode-remote-main">
   <RemoteConnectionWizardHeader {...copy} onClose={onClose}/>
   {step==='kind'&&<RemoteConnectionKindStep kind={form.kind} availableKinds={form.availableKinds} onKindChange={form.setKind} onCancel={onClose} onNext={()=>setStep('settings')}/>}
   {step==='settings'&&<RemoteConnectionSettingsStep {...form} {...handlers} validationMessage={error} loading={false} onBack={()=>setStep('kind')} onConnect={connect} onApplySshConfigAlias={form.applySshConfigAlias} onClearSelectedSshConfigAlias={form.clearSelectedSshConfigAlias} onDockerContainersRefresh={form.refreshDockerContainers}/>}
   {step==='connecting'&&<div className="tc-zcode-remote-result"><Alert type="info" showIcon title="尚未连接" description="当前三端预览未接入 SSH / Docker 运行端。可显式模拟进入目录浏览，不会发起真实连接。"/><footer><Button variant="secondary" onClick={()=>setStep('settings')}>上一步</Button><Button onClick={()=>setStep('directory')}>模拟连接，继续</Button></footer></div>}
   {step==='directory'&&<div className="tc-zcode-directory"><Alert type="info" title="演示目录" description="以下是内存目录，不是远程文件系统。"/><label>项目名称<Input aria-label="项目名称" value={name} onChange={e=>setName(e.target.value)}/></label><DirectoryBrowser services={previewDirectoryServices} embedded onPathChange={path=>{setSelectedDirectory(path);setName(path.split('/').filter(Boolean).at(-1)||'')}} onCancel={()=>setStep('settings')} onSelect={directory=>{const invalid=onAdd({name,target,directory});if(invalid)setError(invalid);}}/><footer className="flex justify-end gap-3"><Button variant="secondary" onClick={()=>setStep('settings')}>上一步</Button><Button disabled={!selectedDirectory} onClick={()=>{try{const invalid=onAdd({name,target,directory:selectedDirectory});if(invalid)setError(invalid);}catch(e){setError(e.message);}}}>添加演示项目</Button></footer></div>}
   {(storageError||(step!=='settings'&&error))&&<p role="alert">{storageError||error}</p>}
  </section>
 </DialogContent></Dialog>;
}
