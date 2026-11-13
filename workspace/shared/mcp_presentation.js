// 从已有 MCP 配置提取展示信息，不将收藏或启用等同于已连接。
export function mcpPresentation(resource){
 const transport=(resource.config?.type==='stdio'||resource.config?.command)?'本地进程 · stdio':resource.config?.url?'远程服务 · HTTP':resource.pluginId?'插件提供':'待配置';
 const status=resource.enabled===false?'已停用':resource.status==='connected'&&resource.connectionVerified===true?'已连接':resource.status==='error'?'连接异常':'未连接';
 return {transport,status};
}
export function mcpExamples(resource){
 const name=resource.name;
 if(/filesystem/.test(name))return ['列出工作区文档，按用途整理目录','查找项目中的 README 并总结开发步骤','比较两份本地文档的差异'];
 if(/graph/.test(name))return ['分析当前项目的模块依赖关系','查看目标函数的调用路径','根据代码关系评估本次修改的影响'];
 if(/knowledge|agentdb/.test(name))return ['检索与当前任务有关的知识资料','汇总检索结果并标注来源','查找此前记录的项目约定'];
 return [`使用 ${name} 查看当前可用工具与操作范围`,`使用 ${name} 处理任务：请先确认输入与目标`,`使用 ${name} 查询任务结果并整理交付内容`];
}
