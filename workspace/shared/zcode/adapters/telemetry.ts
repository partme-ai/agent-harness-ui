// 保留上游动作执行语义；TinyClaw 尚未配置遥测收集端，不发送数据。
export function runUserAction({operation}:{operation:()=>unknown}){return operation();}
