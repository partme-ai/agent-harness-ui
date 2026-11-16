export type EditorSectionItem={key:string;label:string;description:string;icon:string;fields:string[]};
export type EditorKind='model';
const section=(key:string,label:string,description:string,icon:string,fields:string[]):EditorSectionItem=>({key,label,description,icon,fields});
const groups:Record<EditorKind,EditorSectionItem[]>={
 model:[section('access','来源与接入','按厂商配置区域、套餐、协议与鉴权。','models',['providerId','role','name','endpoint','auth','credential']),section('parameters','模型与参数','选择模型并配置对应能力的请求参数。','models',['model']),section('review','检查与保存','核对连接摘要、启用状态和字段校验结果。','tasks',['enabled'])]
};
/** 返回独立的分区元数据，避免调用方修改影响后续编辑。 */
export function editorSectionItems(kind:EditorKind):EditorSectionItem[]{return groups[kind].map(s=>({...s,fields:[...s.fields]}));}
export function resolveEditorSection(items:EditorSectionItem[],key:string){return items.some(s=>s.key===key)?key:items[0]?.key||'';}
