import {DEVICE_PRESETS} from './device_presets.js';
import {SETTINGS_GROUPS} from './shared/settings/settings_config.js';
import {workspaceNavigation} from './shared/workspace_navigation.js';

export const COMPARE_STATE_KEY='tinyclawCompareControlsV1';
const deviceIds=Object.keys(DEVICE_PRESETS);
const sections=new Set(SETTINGS_GROUPS.flatMap(group=>group.items.map(([id])=>id)));
const surfaces=new Set(['home','work','settings','conversation','mobile','search','new',...workspaceNavigation.map(item=>item.id)]);
const scales=new Set([.5,.65,.75,.85,1]);
const defaults={section:'general',dark:false,style:'zcode',surface:'home',sync:true,scale:.65,landscape:{},presets:{},enabled:Object.fromEntries(deviceIds.map(id=>[id,true]))};

export function normalizeCompareState(raw){
 const input=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 return {
  section:sections.has(input.section)?input.section:defaults.section,
  dark:typeof input.dark==='boolean'?input.dark:defaults.dark,
  style:defaults.style,
  surface:surfaces.has(input.surface)?input.surface:defaults.surface,
  sync:typeof input.sync==='boolean'?input.sync:defaults.sync,
  scale:scales.has(input.scale)?input.scale:defaults.scale,
  landscape:Object.fromEntries(deviceIds.filter(id=>input.landscape?.[id]===true).map(id=>[id,true])),
  presets:Object.fromEntries(deviceIds.filter(id=>DEVICE_PRESETS[id].some(preset=>preset.id===input.presets?.[id])).map(id=>[id,input.presets[id]])),
  enabled:Object.fromEntries(deviceIds.map(id=>[id,typeof input.enabled?.[id]==='boolean'?input.enabled[id]:true])),
 };
}

export function readCompareState(storage){
 try{return normalizeCompareState(JSON.parse((storage??globalThis.localStorage)?.getItem(COMPARE_STATE_KEY)||'null'))}catch{return normalizeCompareState(null)}
}

export function writeCompareState(storage,state){
 try{storage.setItem(COMPARE_STATE_KEY,JSON.stringify(normalizeCompareState(state)));return true}catch{return false}
}
