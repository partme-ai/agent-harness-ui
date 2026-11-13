// 以参考截图为基线，按 ZCode 原统计接口的完整快照结构提供本地数据。
export const MOCK_NOW=Date.parse('2026-09-30T15:06:00+08:00');
const day=86400000;
const date=n=>new Date(n).toISOString().slice(0,10);
const sum=xs=>xs.reduce((a,b)=>a+b,0);
const scaled=(xs,total)=>{const values=xs.map(v=>Math.round(v/sum(xs)*total));values[values.length-1]+=total-sum(values);return values;};
export function makeHeatmap(plan=false){
 const start=Date.parse('2025-10-06T00:00:00Z');
 const weeks=Array.from({length:52},(_,weekIndex)=>({weekIndex,days:Array.from({length:7},(_,d)=>{
  const stamp=start+(weekIndex*7+d)*day;
  if(stamp>Date.parse('2026-09-30T00:00:00Z'))return null;
  const i=weekIndex*7+d,active=plan?weekIndex>=23&&(i%13!==0):weekIndex>=47;
  const level=active?(weekIndex>49?1+(i*7+i%5)%4:1):0;
  return {date:date(stamp),level,totalTokens:level*85000000+(active?(i%5)*9000000:0),turnCount:active?12+i%41:0,toolCallCount:active?i%9:0};
 })}));
 return {startDate:date(start),endDate:'2026-09-30',maxTokens:400000000,weeks};
}
const appModelNames=['GLM-5.3-Flash','mimo-v2.6-pro','MiniMax-M3.1-Flash-Preview','kimi-for-coding','GLM-5.3','MiniMax-M3'];
const appWeights=[40.96,20.3,10.46,5.19,4.59,4];
const appPatterns=[[1,0.3,0.3,0,0,6,15,1],[3,5,0,0,1,2,0,0],[0,0,0,0,0,2,2,1.5],[0,0,0,0,0,2,1,0],[0,0,0,0,0,1,1,0],[0.8,0.5,0,0,0,0.2,0.1,0]];
export function getAppUsageSnapshot(range='7d',generatedAt=MOCK_NOW){
 const count=range==='30d'?30:8;
 const dates=Array.from({length:count},(_,i)=>date(Date.parse('2026-09-30')-(count-1-i)*day));
 const patterns=appPatterns.map(pattern=>Array.from({length:count},(_,i)=>count===8?pattern[i]:(i%7===0?pattern[i%8]:pattern[i%8]*.15)));
 const series=patterns.map((pattern,i)=>scaled(pattern,Math.round(appWeights[i]*1e8*(count===30?2.8:1))));
 const models=appModelNames.map((modelId,i)=>({modelId,totalTokens:sum(series[i]),inputTokens:appWeights[i]*.8e8,outputTokens:appWeights[i]*.2e8,requestCount:1200-i*90,share:appWeights[i]/85.6}));
 models.push({modelId:'其他演示模型',totalTokens:Math.round(.1e8*(count===30?2.8:1)),share:.1/85.6});
 const otherSeries=scaled(Array.from({length:count},()=>1),models.at(-1).totalTokens);
 return {range,generatedAt,timeZone:'Asia/Shanghai',source:'agent-db',summary:{totalTokens:3471.1e8,peakDayTokens:35.3e8,longestSessionMs:(45*60+8)*60000,currentStreakDays:30,longestStreakDays:30,totalSessions:216,totalMessages:3428,activeDays:30,favoriteModel:{modelId:appModelNames[0],totalTokens:41e8}},heatmap:makeHeatmap(),models,tools:[],dailyModelUsage:dates.map((date,i)=>({date,models:[...appModelNames.map((modelId,m)=>({modelId,totalTokens:series[m][i]})),{modelId:'其他演示模型',totalTokens:otherSeries[i]}]}))};
}
export function makeQuota(){return {limits:[{type:'TOKENS_LIMIT',unit:3,number:5,percentage:2,nextResetTime:Date.parse('2026-09-30T19:08:00+08:00')},{type:'TOKENS_LIMIT',unit:6,number:1,percentage:5,nextResetTime:Date.parse('2026-10-06T20:49:00+08:00')},{type:'TIME_LIMIT',unit:5,number:1,percentage:1,nextResetTime:Date.parse('2026-10-14T16:28:00+08:00')}],authenticated:true};}
export const mockMcpQuota={aggregate:{type:'TIME_LIMIT',unit:5,number:1,percentage:0,nextResetTime:Date.parse('2026-10-01T00:00:00+08:00')}};
export function getPlanUsageSnapshot(range='7d',generatedAt=MOCK_NOW){
 const count=range==='30d'?30:7;
 const dates=Array.from({length:count},(_,i)=>date(Date.parse('2026-09-30')-(count-1-i)*day));
 const blue=count===7?[1,0,2,0,4,6,0.1]:Array.from({length:30},(_,i)=>[6,2,1,5,0,0,0,0,0,0,0,0,0,0,4,2,0,1,1,6,0,0,0,1,0,2,0,7,10,0][i]);
 const green=count===7?[.2,1,.1,0,16,50,3]:[6,25,17,16,15,0,0,0,5,40,8,0,2,0,0,3,20,39,31,25,34,29,18,12,0,0,0,16,54,3];
 const modelDataList=[['GLM-5.3',blue,count===7?8.9e8:22.6e8],['GLM-5.3-Flash',green,count===7?39e8:220.8e8]].map(([modelName,pattern,total],sortOrder)=>({modelName,sortOrder,tokensUsage:scaled(pattern,total),totalTokens:total}));
 const toolDataList=[['search','联网搜索 MCP',count===7?[0,3,0,2,0,4,0]:[0,24,12,0,0,0,0,0,0,0,0,0,0,0,0,1,4,0,3,0,11,5,0,1,0,0,9,0,0,0]],['reader','网页读取 MCP',count===7?[0,0,0,1,0,0,0]:Array.from({length:30},(_,i)=>[17,26,27].includes(i)?1:0)]].map(([toolCode,toolName,usageCount],sortOrder)=>({toolCode,toolName,sortOrder,usageCount,totalUsageCount:sum(usageCount)}));
 return {range,rangeStartDate:dates[0],rangeEndDate:dates.at(-1),generatedAt,sourceProvider:{id:'bigmodel-plan',name:'BigModel'},quota:makeQuota(),activity:{summary:{totalTokens:411.1e8,peakDailyTokens:31.8e8,peakDailyTokensDate:'2026-09-29',totalUsageDurationMs:((26*24+12)*60+31)*60000,currentStreakDays:17,longestStreakDays:81,favoriteModelName:'GLM-5.3-Flash'},heatmap:makeHeatmap(true)},detail:{model:{totalCredits:0,averageDailyCredits:0,cacheHitRate:null,totalCreditsTrend:null,averageDailyCreditsTrend:null,cacheHitRateTrend:null},tool:{totalCredits:0,averageDailyCredits:0,cacheHitRate:null}},modelUsage:{xTime:dates,granularity:'day',modelDataList,modelSummaryList:[],totalModelCallCount:3254,totalTokensUsage:sum(modelDataList.map(m=>m.totalTokens))},toolUsage:{xTime:dates,granularity:'day',toolDataList,toolSummaryList:[]},health:{xTime:Array.from({length:7},(_,i)=>date(Date.parse('2026-09-30')-(6-i)*day)),proMaxDecodeSpeed:[90,94,93,95,89,87,89],liteDecodeSpeed:[78,77,79,77,71,73,70]}};
}
