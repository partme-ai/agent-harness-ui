import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from './channel_catalog.json' with {type:'json'};
import {createChannelMockStore,mockChannelKey} from './channel_mock_store.js';

test('every catalog channel has a unique identity and pinned local source',()=>{
  assert.equal(new Set(catalog.channels.map(row=>row.id)).size,catalog.channels.length);
  assert.deepEqual(new Set(catalog.projects.map(row=>row.id)),new Set(['nullclaw','nanoclaw','nanobot','microclaw','openclaw','picoclaw','zeroclaw','hermes-agent']));
  for(const row of catalog.channels){
    assert.ok(row.sources.length,`${row.id} has no evidence`);
    for(const source of row.sources)assert.ok(catalog.projects.some(project=>project.id===source.project),`${row.id} has an unknown project`);
  }
});
test('mock channel lifecycle persists safe state and sends only after connected',()=>{
  const memory=new Map();const storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
  const store=createChannelMockStore(storage);let updates=0;const unsubscribe=store.subscribe(()=>updates++);
  const row=store.configure('telegram','  Work Bot ',{endpoint:'https://example.test/hook',scope:'all',reply:'changes'});
  const key=mockChannelKey('telegram','work bot');assert.equal(row.status,'configured');
  assert.throws(()=>store.test(key),/先完成模拟连接/);
  store.simulate(key,'failed');assert.equal(store.list()[key].status,'failed');
  store.simulate(key,'connected');assert.equal(store.test(key).lastResult,'模拟收发成功');
  const raw=[...memory.values()][0];assert.equal(raw.includes('secret'),false);
  assert.equal(createChannelMockStore(storage).list()[key].scope,'all');
  store.remove(key);assert.equal(store.list()[key],undefined);unsubscribe();assert.equal(updates,5);
});
