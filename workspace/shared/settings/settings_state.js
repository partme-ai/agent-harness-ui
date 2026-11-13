// 仅允许界面偏好落入浏览器存储。运行配置和凭据不经过此入口。
export const PREFERENCES_KEY = "agent-surfium.buddy.settings.appearance.v1"
export const DEFAULT_PREFERENCES = { fontSize: 13, codeSize: 13, lineNumbers: true, wrapCode: true, lightCode: "github", darkCode: "github" }
export function normalizePreferences(value) {
  const result = { ...DEFAULT_PREFERENCES }
  if (!value || typeof value !== "object") return result
  for (const key of ["fontSize", "codeSize"]) {
    if (Number.isInteger(value[key]) && value[key] >= 12 && value[key] <= 18) result[key] = value[key]
  }
  for (const key of ["lineNumbers", "wrapCode"]) if (typeof value[key] === "boolean") result[key] = value[key]
  for (const key of ["lightCode", "darkCode"]) if (["github", "quiet"].includes(value[key])) result[key] = value[key]
  return result
}
export function validateEndpoint(value) {
  try {
    const url = new URL(value)
    if (!["https:", "http:"].includes(url.protocol)) return "请输入 HTTP 或 HTTPS 地址"
    if (url.username || url.password || url.search || url.hash) return "地址不能包含凭据、查询参数或片段"
    return ""
  } catch { return "请输入有效的 HTTP 或 HTTPS 地址" }
}
export function validateResource(draft, items) {
  if (!draft.name.trim()) return "请输入名称"
  if (!draft.content.trim()) return "请输入配置内容"
  if (items.some(item => item.id !== draft.id && item.scope === draft.scope && item.name.toLowerCase() === draft.name.trim().toLowerCase())) return "当前范围已存在同名配置"
  return ""
}
export function recordShortcut(event, bindings, id) {
  if (["Meta", "Control", "Alt", "Shift"].includes(event.key)) return {}
  if (!(event.metaKey || event.ctrlKey || event.altKey)) return { error: "请使用 ⌘ / Ctrl / Alt 组合键" }
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key
  const binding = [event.metaKey || event.ctrlKey ? "Mod" : "", event.altKey ? "Alt" : "", event.shiftKey ? "Shift" : "", key].filter(Boolean).join("+")
  if (["Mod+Q", "Mod+W", "Mod+R", "Mod+L", "Mod+T", "Mod+N", "Alt+F4"].includes(binding)) return { error: "这是系统或浏览器保留快捷键" }
  if (Object.entries(bindings).some(([other, value]) => other !== id && value === binding)) return { error: "该快捷键已被其他操作占用，请换一组按键" }
  return { binding }
}
