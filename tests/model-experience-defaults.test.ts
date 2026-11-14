import test from 'node:test';
import assert from 'node:assert/strict';
import {experienceDefaults,resolveExperienceVoice,experienceSessionKey,resolveExperienceConnection,validateExperienceParameters} from '../src/model_experience_defaults.ts';
import {configInitial,switchConfigScope,modelConfigSnapshot} from '../src/model_config.ts';
import type {Connection} from '../src/state.ts';
const connection=(role:string,parameters:Record<string,string>,fields:Record<string,string>={}):Connection=>({id:'saved',name:'已配置连接',provider:'MiniMax',model:'saved-model',role,status:'待检测',config:{providerId:'minimax',schemeId:'test',region:'中国',plan:'标准',protocol:'test',auth:'api_key',modelMode:'manual',endpointTemplate:'https://example.com',fields,parameters,credentialRef:'private-reference'}});
test('五类体验读取已保存的模型默认参数，保留零值且不改写连接',()=>{
 const text=connection('LLM',{temperature:'0',maxTokens:'8192',thinking:'开启',stream:'false',timeout:'90',retries:'2'}),before=structuredClone(text);
 assert.equal(experienceDefaults('text',text).temperature,'0');assert.equal(experienceDefaults('text',text).thinking,'开启');assert.equal(experienceDefaults('text',text).maxTokens,'8192');assert.equal(experienceDefaults('text',text).stream,'false');
 assert.equal(experienceDefaults('image',connection('IMAGE',{aspect:'9:16',quality:'hd',count:'4'})).count,'4');
 assert.equal(experienceDefaults('video',connection('VIDEO',{aspect:'9:16',resolution:'720P',duration:'10',sound:'false'})).duration,'10');
 const tts=experienceDefaults('tts',connection('TTS',{speed:'1.3',volume:'0',format:'wav'},{voiceId:'mine'}));assert.equal(tts.voiceId,'mine');assert.equal(tts.speed,'1.3');assert.equal(tts.volume,'0');assert.equal(tts.format,'wav');
 assert.equal(experienceDefaults('asr',connection('ASR',{language:'English'})).language,'English');assert.deepEqual(text,before);
 assert.ok(!('credentialRef' in tts));assert.ok(!('temperature' in tts));
});
test('切换连接或更改保存参数建立新体验，凭据与无关元数据不重置输入',()=>{
 const a=connection('TTS',{speed:'1.2'},{voiceId:'one'}),base=experienceSessionKey('tts','minimax',a);
 assert.notEqual(base,experienceSessionKey('tts','minimax',{...a,id:'other'}));assert.notEqual(base,experienceSessionKey('tts','minimax',{...a,model:'other-model'}));assert.notEqual(base,experienceSessionKey('tts','minimax',{...a,config:{...a.config!,parameters:{speed:'1.5'}}}));assert.equal(base,experienceSessionKey('tts','minimax',{...a,status:'changed',config:{...a.config!,credentialRef:'changed-secret'}}));
});
test('配置音色精确匹配，不可用音色显式保留，切换模型不沿用不兼容音色',()=>{
 const voices=[{key:'a',voiceId:'voice-a',previewUrl:'a.mp3'},{key:'b',voiceId:'voice-b'}];
 assert.equal(resolveExperienceVoice(voices,'voice-b').key,'b');assert.equal(resolveExperienceVoice(voices,'').key,'a');assert.equal(resolveExperienceVoice(voices,'old-voice').key,'');assert.equal(resolveExperienceVoice(voices,'old-voice').customVoice,'old-voice');assert.ok(resolveExperienceVoice(voices,'old-voice').warning);
 assert.equal(resolveExperienceVoice([{key:'c',voiceId:'voice-c'}],'voice-b').key,'');assert.equal(resolveExperienceVoice([{key:'a',voiceId:'same'},{key:'b',voiceId:'same'}],'same').key,'');
});
test('配置模型可保存语音音量与识别语言，其他类别不会串入这些字段',()=>{
 const tts=switchConfigScope(configInitial('minimax'),'role','TTS');tts.parameters={speed:'1.3',volume:'0',format:'wav',language:'English'};assert.equal(modelConfigSnapshot(tts).parameters.volume,'0');assert.equal(modelConfigSnapshot(tts).parameters.language,undefined);
 const asr=switchConfigScope(configInitial('minimax'),'role','ASR');asr.parameters={language:'English',speed:'1.3'};assert.equal(modelConfigSnapshot(asr).parameters.language,'English');assert.equal(modelConfigSnapshot(asr).parameters.speed,undefined);
});

test('不可用连接不能静默替换；缺省连接才能自动选择第一条',()=>{const a=connection('TTS',{}),b={...a,id:'other'};assert.equal(resolveExperienceConnection([b],a.id).unavailable,true);assert.equal(resolveExperienceConnection([{...a,enabled:false},b],a.id).selected,undefined);assert.equal(resolveExperienceConnection([a,b]).id,a.id);assert.equal(resolveExperienceConnection([a,b],b.id).id,b.id);});
test('无效数值阻止请求预览，零温度与零音量仍有效',()=>{assert.equal(validateExperienceParameters('text',{temperature:'0',maxTokens:'4096'}),'');assert.equal(validateExperienceParameters('tts',{speed:'1.3',volume:'0'}),'');assert.ok(validateExperienceParameters('tts',{speed:'NaN'}));assert.ok(validateExperienceParameters('text',{maxTokens:'1.5'}));assert.ok(validateExperienceParameters('asr',{timeout:'0'}));});
