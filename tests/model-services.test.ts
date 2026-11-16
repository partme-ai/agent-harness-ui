import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {modelServices,resolveModelService,serviceCategoryAllowed} from '../src/model_services.ts';
import {modelSettingsTabs,consolePath} from '../workspace/shared/settings/harness_sections.js';
import {experienceModes,matchingExperienceConnections,experienceRequest,validateExperienceAudio} from '../src/model_experience.ts';
import {experienceWav} from '../src/experience_audio.ts';
import {configInitial,switchConfigScope,modelConfigSnapshot,validateModelConfig} from '../src/model_config.ts';

test('设置的模型服务都有五类入口，原来细粒度用途继续可配置',()=>{
 assert.deepEqual(modelServices.map(s=>s.title),['文本生成','图片生成','视频生成','语音合成','语音识别']);
 const tabs=modelSettingsTabs('model-services');
 assert.deepEqual(tabs.map(t=>t.label),modelServices.map(s=>s.title));
 assert.deepEqual(tabs.map(t=>consolePath(t.id)),modelServices.map(s=>'#/w/demo/models?item='+s.key));
 assert.ok(serviceCategoryAllowed('text','Embedding'));assert.ok(serviceCategoryAllowed('text','Rerank'));assert.ok(serviceCategoryAllowed('asr','VAD'));
 assert.equal(serviceCategoryAllowed('text','IMAGE'),false);assert.equal(serviceCategoryAllowed('asr','TTS'),false);
 assert.equal(resolveModelService('unknown').key,'text');assert.equal(resolveModelService('connections').key,'text');
 assert.equal(resolveModelService('saved',[{id:'saved',role:'VIDEO'}]).key,'video');
});
test('五种体验不能串用其他分类和停用连接，不改写原配置',()=>{
 const rows=['LLM','SLM','VLLM','IMAGE','VIDEO','TTS','ASR','Embedding'].map((role,i)=>({id:String(i),name:role,provider:'sample',model:role,role,status:'待检测'}));
 const before=structuredClone(rows);assert.deepEqual(matchingExperienceConnections(rows,'text').map(x=>x.role),['LLM','SLM','VLLM']);
 for(const kind of ['image','video','tts','asr'] as const)assert.deepEqual(matchingExperienceConnections([...rows,{...rows[0],role:experienceModes[kind].role,enabled:false}],kind).map(x=>x.role),[experienceModes[kind].role]);
 assert.deepEqual(rows,before);const parameters={resolution:'1080P',duration:'5 秒'};const req=experienceRequest('video','  雨夜城市  ',parameters,'m1');parameters.duration='10 秒';assert.equal(req.parameters.duration,'5 秒');assert.equal(req.prompt,'雨夜城市');assert.ok(!('output' in req));assert.throws(()=>experienceRequest('text','   ',{},''));
});
test('图片和视频参数独立校验、保存与恢复，不能留下语言参数或凭据',()=>{
 for(const role of ['IMAGE','VIDEO']){const d=switchConfigScope(configInitial('bailian'),'role',role);d.model='custom-media';d.modelMode='manual';d.parameters={aspect:'16:9',quality:'hd',count:'2',resolution:'1080P',duration:'5',temperature:'0.9',apiKey:'do-not-store'};const snapshot=modelConfigSnapshot(d);assert.equal(snapshot.parameters.aspect,'16:9');assert.equal(snapshot.parameters.temperature,undefined);assert.equal(snapshot.parameters.apiKey,undefined);if(role==='IMAGE')assert.equal(snapshot.parameters.quality,'hd');else assert.equal(snapshot.parameters.duration,'5');assert.ok(validateModelConfig({...d,parameters:{aspect:'invalid'}}).aspect);}
});
test('音频上传有类型和大小边界，本地 PCM 导出为有效 WAV',()=>{
 assert.equal(validateExperienceAudio({name:'sample.wav',type:'audio/wav',size:1024}),'');
 for(const file of [{name:'x.pdf',type:'application/pdf',size:8},{name:'x.mp3',type:'audio/mpeg',size:0},{name:'x.wav',type:'audio/wav',size:11*1024*1024}])assert.ok(validateExperienceAudio(file));
 const bytes=experienceWav([new Int16Array([-32768,0]),new Int16Array([32767])],16000),view=new DataView(bytes.buffer);
 assert.equal(new TextDecoder().decode(bytes.slice(0,4)),'RIFF');assert.equal(view.getUint32(24,true),16000);assert.equal(view.getUint32(40,true),6);assert.equal(view.getInt16(44,true),-32768);assert.equal(view.getInt16(48,true),32767);
 assert.throws(()=>experienceWav([],16000));assert.throws(()=>experienceWav([new Int16Array(1)],0));assert.throws(()=>experienceWav([new Int16Array(16000*60+1)],16000));
});
test('模型体验替代旧测试页签，真实采集复用 Recorder 生命周期，不调用远程生成接口',()=>{
 const page=readFileSync(new URL('../src/pages/ProviderSettings.tsx',import.meta.url),'utf8'),experience=readFileSync(new URL('../src/pages/ModelExperience.tsx',import.meta.url),'utf8');
 assert.match(page,/key:'experience',label:'模型体验'/);assert.doesNotMatch(page,/ModelProbe|label:'模型测试'|setTab\('test'\)/);
 assert.match(experience,/useMicrophoneCapture/);assert.match(experience,/Object.entries\(result.parameters\)/);assert.match(experience,/搜索体验音色/);assert.match(experience,/currentVoicePage/);assert.match(experience,/connectionProviderId\(m\)===providerId/);assert.doesNotMatch(experience,/fetch\(|XMLHttpRequest|new MediaRecorder/);
});
test('五类演示可直接体验，保留现有连接ID和默认标记',async()=>{
 const {initialStore}=await import('../src/state.ts');
 const {withModelServiceExamples}=await import('../src/model_services.ts');
 const original=initialStore().connections, seed=withModelServiceExamples(original);
 assert.deepEqual(seed.slice(0,original.length),original);
 assert.deepEqual(withModelServiceExamples(seed),seed);
 for(const service of modelServices)assert.ok(matchingExperienceConnections(seed,service.key).length>0);
 assert.deepEqual(seed.filter(c=>c.isDefault),original.filter(c=>c.isDefault));
});
test('设置中五类模型服务使用 TinyBot 的五个独立图标',()=>{
 assert.deepEqual(modelSettingsTabs('model-services').map(t=>t.icon),['message-outlined','photo-outlined','movie-outlined','microphone-outlined','chart-column-outlined']);
});
