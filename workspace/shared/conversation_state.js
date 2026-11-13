// Portable projection contract adapted from ZCode v4 rows/deltas (29628c9).
// Runtime facts and UI preferences are separate; never fabricate tool results from text.
export function applyFrame(current,frame){
 if(frame.kind==='snapshot')return structuredClone(frame.snapshot);
 if(!current||frame.epoch!==current.epoch||frame.fromSeq!==current.seq){
  if(current&&frame.epoch===current.epoch&&frame.toSeq<=current.seq)return current;
  throw new Error('需要重新获取会话快照');
 }
 const next=structuredClone(current);
 for(const delta of frame.deltas){
  if(delta.op==='row.appended'){if(next.rows.some(r=>r.rowId===delta.row.rowId))throw new Error('重复行标识');next.rows.push(delta.row);}
  else if(delta.op==='row.upserted'){const index=next.rows.findIndex(r=>r.rowId===delta.row.rowId);if(index<0)next.rows.push(delta.row);else next.rows[index]=delta.row;}
  else if(delta.op==='row.removed')next.rows=next.rows.filter(r=>r.rowId<delta.fromRowId);
  else if(delta.op==='row.delta'){const row=next.rows.find(r=>r.rowId===delta.rowId);if(!row||row.state!=='streaming')throw new Error('文本增量目标无效');row.text+=delta.append;}
 }
 next.seq=frame.toSeq;return next;
}
export const sampleConversation={epoch:'fixture',seq:0,rows:[
 {rowId:1,turnId:'sample',kind:'userInput',text:'请整理一份智能体界面实施方案。',createdAt:'示例会话'},
 {rowId:2,turnId:'sample',kind:'assistantText',state:'complete',text:'先整理已有页面与交互，保留手机、平板与桌面的共同功能。',createdAt:'示例'},
 {rowId:3,turnId:'sample',kind:'toolCall',status:'success',title:'读取页面与组件清单',output:'示例结果：设置、模型、资源管理、手机联动、使用统计。'},
 {rowId:4,turnId:'sample',kind:'assistantText',state:'complete',text:'### 实施步骤\n\n1. 合并已有源码和 Pad 适配。\n2. 统一组件、主题与响应式规则。\n3. 接入真实服务，验证保存、审批与断线恢复。\n\n**界面预览并不代表生产功能已经完成。**'},
]};
