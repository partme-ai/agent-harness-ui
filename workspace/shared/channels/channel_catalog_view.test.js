import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from './channel_catalog.json' with {type:'json'};
import {getExtendedBotChannel,listExtendedBotChannels} from './channel_catalog_view.js';
import {createMockServices} from '../mock/services.js';

test('robot new page keeps four source-owned channels and exposes each additional catalog channel once',()=>{
 const additional=listExtendedBotChannels();
 assert.equal(additional.length,catalog.channels.length-4);
 assert.equal(new Set(additional.map(channel=>channel.id)).size,additional.length);
 for(const id of ['weixin','feishu','lark','telegram'])assert.equal(getExtendedBotChannel(id),undefined);
 assert.equal(getExtendedBotChannel('discord')?.name,'Discord');
 assert.ok(additional.some(channel=>channel.id==='dingtalk'));
});

test('robot platform picker searches names and IDs without using developer provenance',()=>{
 const match=listExtendedBotChannels({query:'DISCORD',category:'chat'});
 assert.deepEqual(match.map(channel=>channel.id),['discord']);
 assert.deepEqual(listExtendedBotChannels({query:'discord',category:'work'}),[]);
});

test('an additional channel can be created in the existing mock bot service',async()=>{
 const memory=new Map();
 const storage={getItem:key=>memory.get(key),setItem:(key,value)=>memory.set(key,value)};
 const service=createMockServices({storage,delay:0});
 const channel=getExtendedBotChannel('discord');
 const saved=await service.botsService.saveBot({bot:{id:'bot-discord',name:'',provider:channel.id,enabled:true,allowedWorkspaces:['*']}});
 assert.equal(saved.provider,'discord');
 assert.equal((await service.botsService.getConfig()).bots[0].id,'bot-discord');
});
