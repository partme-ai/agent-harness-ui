import {useState} from 'react';
import {UsageStatsSection} from './zcode/UsageStatsSection.jsx';
import {MockUsageProvider,MockUsageStatus,Tabs,TabsList,TabsTrigger,buildCodingPlanUsageSources} from './usage_bridge.jsx';
const source=buildCodingPlanUsageSources()[0];
export function SourceUsage(){const [tab,setTab]=useState('app');return <MockUsageProvider><div className="zcode-settings zcode-usage"><header className="usage-title"><h1>使用统计</h1><Tabs value={tab} onValueChange={setTab}><TabsList><TabsTrigger value="app">应用用量</TabsTrigger><TabsTrigger value="plan">个人套餐</TabsTrigger></TabsList></Tabs></header><UsageStatsSection activeTab={tab} providerSourcesLoading={false} workspaceIdentity="buddy-mock" workspacePath="" selectedCodingPlanSource={source}/><MockUsageStatus/></div></MockUsageProvider>;}
