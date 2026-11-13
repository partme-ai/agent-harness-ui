import test from "node:test"
import assert from "node:assert/strict"
import { GENERAL_GROUPS, GENERAL_DEFAULTS } from "./settings_config.js"
import { normalizePreferences, validateEndpoint, validateResource, recordShortcut } from "./settings_state.js"

test("偏好读取拒绝未知字段和非法值，保留安全默认值", () => {
  const result = normalizePreferences({ fontSize: 999, codeSize: 15, lineNumbers: false, apiKey: "test-secret", wrapCode: "yes" })
  assert.equal(result.fontSize, 13)
  assert.equal(result.codeSize, 15)
  assert.equal(result.lineNumbers, false)
  assert.equal(result.wrapCode, true)
  assert.equal("apiKey" in result, false)
  assert.equal(normalizePreferences(null).fontSize, 13)
})
test("连接配置拒绝非 HTTP 协议和 URL 中的凭据", () => {
  assert.equal(validateEndpoint("https://example.test/v1"), "")
  assert.match(validateEndpoint("file:///tmp/key"), /HTTP/)
  assert.match(validateEndpoint("https://user:secret@example.test"), /凭据/)
  assert.match(validateEndpoint("https://example.test?api_key=secret"), /凭据/)
})
test("资源草稿名称必填，同范围重复拒绝，不同范围可用", () => {
  const items = [{ id: "a", name: "review", scope: "user" }]
  assert.match(validateResource({ name: " ", scope: "user", content: "x" }, items), /名称/)
  assert.match(validateResource({ name: " Review ", scope: "user", content: "x" }, items), /存在/)
  assert.equal(validateResource({ name: "review", scope: "workspace", content: "x" }, items), "")
  assert.equal(validateResource({ id: "a", name: "review", scope: "user", content: "x" }, items), "")
})
test("快捷键录入拒绝单修饰键、系统保留键和重复绑定", () => {
  assert.equal(recordShortcut({ key: "Meta", metaKey: true }, {}, "a").binding, undefined)
  assert.match(recordShortcut({ key: "q", metaKey: true }, {}, "a").error, /系统/)
  assert.match(recordShortcut({ key: "k", metaKey: true }, { b: "Mod+K" }, "a").error, /占用/)
  assert.equal(recordShortcut({ key: "k", ctrlKey: true, shiftKey: true }, {}, "a").binding, "Mod+Shift+K")
})

test("常规分组中的字段都有可用定义和默认值，模块可加载", () => {
  const ids = GENERAL_GROUPS.flatMap(group => group.rows.map(row => {
    assert.ok(Array.isArray(row), "导航分组不得包含未定义字段")
    assert.ok(row[1] && row[2], "字段有名称和说明")
    assert.ok(Object.hasOwn(GENERAL_DEFAULTS, row[0]))
    return row[0]
  }))
  assert.equal(ids.length, new Set(ids).size, "每个设置项只展示一次")
})
