import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_FORM, formToConfig, formToJsonDraft, jsonDraftToForm } from './zcode/mcpSettingsShared.js';
import { settingsResourceRowInteraction } from './zcode/settingsResourceRowInteraction.js';

test('迁入的 MCP JSON 往返保留 OAuth、请求头、超时和协议版本', () => {
  const config = {
    type: 'http', url: 'https://example.invalid/mcp',
    headers: { 'X-Preview': 'true' }, oauth: { clientId: 'preview-client' },
    timeoutMs: 30000, protocolVersion: '2026-07-28',
  };
  const form = jsonDraftToForm(JSON.stringify({ mcpServers: { preview: config } }), EMPTY_FORM);
  assert.equal(form.name, 'preview');
  assert.deepEqual(formToConfig(form), config);
  assert.deepEqual(JSON.parse(formToJsonDraft(form)), { preview: config });
});

test('迁入的 MCP 配置拒绝非法 JSON、多服务器和缺少名称；非法协议归一为自动', () => {
  assert.throws(() => jsonDraftToForm('{invalid', EMPTY_FORM), SyntaxError);
  assert.throws(() => jsonDraftToForm('{"mcpServers":{"a":{},"b":{}}}', EMPTY_FORM), /一次编辑一个/);
  assert.throws(() => jsonDraftToForm('{"type":"http"}', EMPTY_FORM), /名称/);
  assert.equal(jsonDraftToForm('{"sample":{"command":"preview","protocolVersion":"invalid"}}', EMPTY_FORM).protocolVersion, '');
});

test('原始资源行的内部开关和按钮不会误打开编辑器，整行支持 Enter 与 Space', () => {
  let activated = 0;
  let prevented = 0;
  const interaction = settingsResourceRowInteraction(() => activated++);
  const row = { closest: () => null };
  const child = { closest: () => ({ tagName: 'BUTTON' }) };
  interaction.onClick({ target: child });
  interaction.onKeyDown({ target: child, currentTarget: row, key: 'Enter' });
  assert.equal(activated, 0);
  interaction.onClick({ target: row });
  for (const key of ['Enter', ' ']) {
    interaction.onKeyDown({ target: row, currentTarget: row, key, preventDefault: () => prevented++ });
  }
  assert.equal(activated, 3);
  assert.equal(prevented, 2);
  assert.deepEqual(settingsResourceRowInteraction(undefined), {});
});
