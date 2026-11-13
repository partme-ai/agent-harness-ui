import {Modal as AntModal} from 'antd';
import {AntNativeButton} from '../../ant_controls.jsx';
// 宿主适配仅替换账号/API 与基础控件；统计与图表逻辑保留 ZCode 源码。
import React,{createContext,useContext,useMemo,useState,useCallback,useEffect,useRef} from 'react';
import {Check,Info,Gift,Warning,SpinnerGap,ArrowClockwise,X} from '@phosphor-icons/react';
import Tooltip from 'antd/es/tooltip';
import messages from './zcode/messages.json';
import {getAppUsageSnapshot,getPlanUsageSnapshot,makeQuota,mockMcpQuota,MOCK_NOW} from './usage_samples.js';
export {Button,cn} from '../zcode_bridge.jsx';
export {Check,Check as CheckIcon,Info as InfoIcon,Gift as GiftIcon,Warning as AlertTriangle,SpinnerGap as Loader2,ArrowClockwise as RefreshCw,ArrowClockwise as RefreshCcw};
const intl={formatMessage:({id,defaultMessage},values={})=>(messages[id]||defaultMessage||id).replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??''))};
export const useZCodeIntl=()=>({intl,locale:'zh-CN'});
export const APP_USAGE_RANGES=['all','7d','30d'];
export const BUILTIN_MODEL_PROVIDER_IDS={bigmodelIndividualCodingPlan:'bigmodel-plan',zaiIndividualCodingPlan:'zai-plan'};
export const buildUsageEntitlementCacheKey=({providerId,providerFingerprint})=>`${providerId}:${providerFingerprint}`;
export const buildCodingPlanUsageSources=()=>[{id:'mock-personal-plan',providerId:'bigmodel-plan',accountAccess:{planKind:'individual-coding-plan'}}];

// ZCode ControlHintTooltip: top/center, 2px offset, immediate hover and explicit line breaks.
// Reuse the installed host tooltip primitive; do not add wrappers to heatmap grid cells.
export function ControlHintTooltip({title,children}) {return <Tooltip title={title} placement="top" align={{offset:[0,-2]}} mouseEnterDelay={0} mouseLeaveDelay={0} overlayClassName="buddy-usage-hint" destroyTooltipOnHide>{React.cloneElement(React.Children.only(children),{title:undefined})}</Tooltip>;}
const TabsContext=createContext(null);
export function Tabs({value,onValueChange,children,className,...props}) {return <TabsContext.Provider value={{value,onValueChange}}><div {...props} className={className} data-orientation="horizontal">{children}</div></TabsContext.Provider>;}
export function TabsList({children,className,...props}) {return <div {...props} role="tablist" className={`usage-tabs ${className||''}`}>{children}</div>;}
export function TabsTrigger({value,children,className,...props}) {const tabs=useContext(TabsContext);const active=tabs.value===value;return <AntNativeButton {...props} type="button" data-handled="true" role="tab" aria-selected={active} data-state={active?'active':'inactive'} className={className} onClick={()=>tabs.onValueChange(value)} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const items=[...e.currentTarget.parentElement.querySelectorAll('[role="tab"]')];const index=items.indexOf(e.currentTarget);const next=e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowRight'?1:-1)+items.length)%items.length;items[next].focus();items[next].click();}}>{children}</AntNativeButton>;}
function useSnapshot(factory,range) {const {setRefreshState}=useContext(QuotaContext);const [generatedAt,setGeneratedAt]=useState(MOCK_NOW),[loading,setLoading]=useState(false);const snapshot=useMemo(()=>factory(range,generatedAt),[factory,range,generatedAt]);const refresh=useCallback(async()=>{setLoading(true);setRefreshState({loading:true,time:null});try{await new Promise(resolve=>setTimeout(resolve,300));const time=Date.now();setGeneratedAt(time);setRefreshState({loading:false,time});}finally{setLoading(false);}},[setRefreshState]);return {snapshot,loading,error:null,refresh};}
export const useAppUsageStats=range=>useSnapshot(getAppUsageSnapshot,range);
export const useCodingPlanUsageStats=range=>useSnapshot(getPlanUsageSnapshot,range);
const QuotaContext=createContext(null);
export function MockUsageProvider({children}) {const [quota,setQuota]=useState(makeQuota),[refreshState,setRefreshState]=useState({loading:false,time:null});return <QuotaContext.Provider value={{quota,setQuota,refreshState,setRefreshState}}>{children}</QuotaContext.Provider>;}
export function useUsageEntitlement() {const {quota}=useContext(QuotaContext);const [stamp,setStamp]=useState(MOCK_NOW);const refresh=useCallback(async()=>{setStamp(Date.now());},[]);const snapshot=useMemo(()=>({quota,mcpQuota:mockMcpQuota,generatedAt:stamp}),[quota,stamp]);return {snapshot,loading:false,error:null,refresh};}
export function useCodingPlanQuotaResetUi() {const {setQuota}=useContext(QuotaContext);const [counts,setCounts]=useState({FIVE_HOUR:3,WEEK:4}),[processing,setProcessing]=useState(null);const busy=useRef(false);const expiresAt=useRef(Date.now()+86400000).current;const reset=async type=>{if(busy.current||counts[type]===0)return;busy.current=true;setProcessing(type);try{await new Promise(resolve=>setTimeout(resolve,400));setQuota(q=>({...q,limits:q.limits.map(limit=>(type==='WEEK'?limit.unit===6:limit.unit===3)?{...limit,percentage:0,nextResetTime:Date.now()+(type==='WEEK'?7*86400000:18000000)}:limit)}));setCounts(c=>({...c,[type]:Math.max(0,c[type]-1)}));}finally{setProcessing(null);busy.current=false;}};const entry=type=>({status:'available',opportunityCount:counts[type],opportunityExpiresAt:expiresAt,completedAt:null,quotaOverridePending:false});return {entry:entry('FIVE_HOUR'),opportunityVisible:counts.FIVE_HOUR>0,processing:processing==='FIVE_HOUR',reset:()=>reset('FIVE_HOUR'),week:{entry:entry('WEEK'),opportunityVisible:counts.WEEK>0,processing:processing==='WEEK',reset:()=>reset('WEEK')}};}
export class ScopedErrorBoundary extends React.Component {state={error:null};static getDerivedStateFromError(error){return {error};}componentDidUpdate(previous){if(this.state.error&&JSON.stringify(previous.resetKeys)!==JSON.stringify(this.props.resetKeys))this.setState({error:null});}render(){return this.state.error?<div role="alert">图表加载失败：{this.state.error.message}<AntNativeButton onClick={()=>this.setState({error:null})}>重试</AntNativeButton></div>:this.props.children;}}
export const setPendingSettingsSection=()=>window.dispatchEvent(new CustomEvent('buddy:navigate',{detail:{page:'settings',section:'models'}}));
export const formatUsageErrorMessage=(intl,scope,error)=>error?.message||String(error);
export const isUsageCredentialError=error=>/credential|API Key|凭据/.test(String(error));
export const isUsageTeamPlanBusinessError=error=>/团队套餐/.test(String(error));
const DialogContext=createContext(null);
export function Dialog({open,onOpenChange,children}) {return <DialogContext.Provider value={{open,onOpenChange}}>{open?children:null}</DialogContext.Provider>;}
export function DialogContent({children,className}) {const {onOpenChange}=useContext(DialogContext);return <AntModal open title="额度重置" footer={null} width={560} getContainer={()=>document.getElementById('buddy-root')} onCancel={()=>onOpenChange(false)} styles={{body:{maxHeight:'calc(100dvh - 150px)',overflow:'auto'}}}><div className={'usage-dialog-content '+(className||'')}>{children}</div></AntModal>;}
export const DialogTitle=props=><h2 {...props}/>;

export function MockUsageStatus(){const {refreshState}=useContext(QuotaContext);return <p className="usage-mock-note" role="status">Mock · 统计和额度为本地示例数据{refreshState.loading?' · 正在刷新…':refreshState.time?' · 已刷新 '+new Date(refreshState.time).toLocaleTimeString('zh-CN',{hour12:false}):''}</p>;}
