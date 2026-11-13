import test from 'node:test';
import assert from 'node:assert/strict';
import {listExtendedBotChannels} from './channel_catalog_view.js';
import {channelPresentation} from './channel_presentation.js';

test('every additional bot channel has an icon and concise Chinese and English copy',()=>{
 for(const channel of listExtendedBotChannels()){
  const zh=channelPresentation(channel.id,'zh-CN');
  const en=channelPresentation(channel.id,'en-US');
  assert.ok(zh?.icon,`${channel.id} is missing an icon`);
  assert.ok(zh?.description && zh.description.length<=50,`${channel.id} needs concise Chinese copy`);
  assert.ok(en?.description && en.description.length<=90,`${channel.id} needs concise English copy`);
 }
});
