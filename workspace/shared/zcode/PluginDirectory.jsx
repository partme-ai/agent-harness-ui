import React from 'react';
import {PluginStoreListView} from './ui/settings/PluginStoreListView';
import {TooltipProvider} from './ui/components/ui/tooltip';
import {findInstalledPlugin} from '../plugin_directory';
import {ZCODE_OFFICIAL_PLUGIN_MARKETPLACE_ID} from './shared/plugin-marketplaces';

// 将现有单一安装事实源投影为 ZCode StorePluginItem；不创建第二套安装状态。
export function PluginDirectory({directory,installed,allPlugins,repositories,scope,view,onView,onDetail,onManage,onSetEnabled,onUpdate,onUninstall}){
 const entries=directory.map(p=>{
  const current=findInstalledPlugin(allPlugins,p,scope);
  return {id:p.directoryId||p.id,name:p.name,marketplace:p.marketplaceId||(p.sourceType==='public'?ZCODE_OFFICIAL_PLUGIN_MARKETPLACE_ID:(p.repositoryId||'local')),installed:!!current,restorable:false,orphaned:false,
   listing:{displayName:p.name,category:p.category||'other'},summary:{description:p.description},info:current?{...current,enabled:current.enabled!==false}:undefined,installedMeta:current?{...current,updateStatus:current.updateAvailable?'update-available':'none'}:undefined,original:p};
 });
 for(const p of installed){if(!entries.some(e=>e.info?.id===p.id))entries.push({id:'installed:'+p.id,name:p.name,marketplace:p.repositoryId||'local',installed:true,restorable:false,orphaned:true,listing:{displayName:p.name},summary:{description:p.description},info:p,installedMeta:p,original:{...p,installedId:p.id}});}
 const detail=id=>{const item=entries.find(e=>e.id===id);if(item)onDetail(item.original);};
 const installedItem=id=>entries.find(e=>e.id===id)?.info;
 const actions={onOpenDetail:detail,onInstall:item=>detail(item.id),onSetEnabled:(id,enabled)=>{const item=installedItem(id);if(item)onSetEnabled(item,enabled);},onUninstall:id=>{const item=installedItem(id);if(item)onUninstall(item);},onUpdate:id=>{const item=installedItem(id);if(item)onUpdate(item);},operationId:null,togglingPluginId:null};
 return <div className="zcode-surface tc-zcode-plugin-directory"><TooltipProvider><PluginStoreListView items={entries} marketplaces={[{id:'claude-plugins-official',name:'Claude 官方插件市场'},{id:'local',name:'本地与未分组'},...repositories]} actions={actions} loading={false} query={view.query} onQueryChange={query=>onView({...view,query})} segment={view.tab} onSegmentChange={tab=>onView({...view,tab})} onOpenManage={onManage}/></TooltipProvider></div>;
}
