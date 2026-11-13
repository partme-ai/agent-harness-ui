// The workbench keeps ZCode's settings presentation. Existing Agent Harness
// configuration pages remain mounted in the companion console until migrated.
const native=(id,label,icon)=>({id,label,icon});
const consolePage=(id,label,icon,page,item)=>({id,label,icon,page,item});
export const HARNESS_SETTINGS_GROUPS=[
  {title:'账户设置',items:[consolePage('account-profile','用户信息','Robot','account/profile'),native('sandbox-keys','沙箱密钥','Anchor'),native('vault','凭据保险库','ShieldCheck'),native('personalization','个性化','SlidersHorizontal'),native('bot','Bot','Robot')]},
  {title:'基础设置',items:[native('general','常规','SlidersHorizontal'),native('appearance','外观','Palette'),consolePage('system-theme','系统主题','Palette','settings/general','theme'),native('notifications','通知','ChartBar'),consolePage('voice','语音','Robot','models/voice-pipeline'),consolePage('storage','存储','Cube','settings/storage'),native('shortcuts','键盘快捷键','Keyboard')]},
  {title:'模型设置',items:[consolePage('model-services','模型服务','Cube','models'),consolePage('local-runtime','本地模型 · 运行环境','Cube','models/local/environments'),consolePage('local-catalog','本地模型 · 模型列表','Cube','models/local/catalog'),consolePage('model-defaults','模型网关 · 默认模型','Cube','models/defaults'),consolePage('model-api','模型网关 · 模型 API','Cube','models/gateway/api'),consolePage('model-load','模型网关 · 模型负载','Cube','models/gateway/load'),consolePage('model-fallback','模型网关 · 模型降级','Cube','models/gateway/fallback'),consolePage('model-rate','模型网关 · 模型限流','Cube','models/gateway/rate'),consolePage('model-breaker','模型网关 · 模型熔断','Cube','models/gateway/breaker'),consolePage('model-stats','数据与统计','ChartBar','models/reports')]},
  {title:'知识库',items:[consolePage('knowledge-public','公共知识库','Brain','knowledge/market'),consolePage('knowledge-manage','知识库管理','Brain','knowledge'),consolePage('knowledge-shared','共享空间','Brain','knowledge/spaces'),consolePage('knowledge-mcp','MCP 服务','Plug','knowledge/mcp')]},
  {title:'智能体',items:[consolePage('agent-market','市场','Robot','agents/templates'),consolePage('agent-plugins','插件','PuzzlePiece','agents/plugins'),consolePage('agent-connections','连接 · MCP','Plug','agents/connections'),consolePage('agent-skills','技能','Sparkle','agents/skills'),native('commands','命令','Terminal'),native('hooks','钩子','Anchor'),consolePage('agent-installed','已安装','Robot','agents'),consolePage('agent-memory','记忆','Brain','agents/memory'),consolePage('agent-stats','数据与统计','ChartBar','agents/reports')]},
  {title:'内置工具',items:[native('computer','电脑控制','Monitor'),native('browser','浏览器','Globe'),consolePage('web-search','网页搜索','Globe','agents/tools','search'),consolePage('web-fetch','网页抓取','Globe','agents/tools','fetch'),consolePage('document-parser','文档解析','Cube','agents/tools','documents'),consolePage('ocr','OCR','Palette','agents/tools','ocr')]},
  {title:'资源管理',items:[consolePage('resource-info','基础信息','Cube','resources/info'),consolePage('resource-spaces','资源空间','Cube','resources/spaces'),consolePage('storage-engines','存储引擎','Cube','settings/storage')]},
  {title:'数据与扩展',items:[native('vector-engines','向量数据库引擎','Cube'),consolePage('sandbox','沙箱设置','Robot','agents/sandbox'),native('archives','归档管理','Cube')]},
  {title:'其他',items:[native('guide','引导','Sparkle'),native('about','关于','Robot')]},
];
export const SETTINGS_GROUPS=HARNESS_SETTINGS_GROUPS.map(group=>({title:group.title,items:group.items.map(({id,label,icon})=>[id,label,icon])}));
export const CONSOLE_SECTIONS=Object.fromEntries(HARNESS_SETTINGS_GROUPS.flatMap(group=>group.items.filter(item=>item.page).map(item=>[item.id,item])));
export function consolePath(section){
 const item=CONSOLE_SECTIONS[section];
 if(!item)return null;
 const query=item.item?`?item=${encodeURIComponent(item.item)}`:'';
 return `#/w/demo/${item.page}${query}`;
}
