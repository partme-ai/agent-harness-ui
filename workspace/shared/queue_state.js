// 排序锚点语义迁自 ZCode ConversationQueuePanel#resolveV4QueueReorderAnchor (MIT)。
// 本地演示使用该排序规则；不代替执行服务的 queue command / ACK。
export function reorderQueue(items,activeId,overId){
 if(activeId===overId)return items;
 const from=items.findIndex(item=>item.id===activeId),over=items.findIndex(item=>item.id===overId);
 if(from<0||over<0)return items;
 const remaining=items.filter(item=>item.id!==activeId);
 const target=from<over?remaining.findIndex(item=>item.id===overId)+1:remaining.findIndex(item=>item.id===overId);
 const next=[...remaining];next.splice(target,0,items[from]);return next;
}
