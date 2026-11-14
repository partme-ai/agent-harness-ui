import test from 'node:test';
import assert from 'node:assert/strict';
import {experienceModes,matchingExperienceConnections,experienceRequest,validateExperienceAudio} from '../src/model_experience.ts';

test('五种体验使用各自的模型分类，连接不能跨能力串用',()=>{
 assert.deepEqual(Object.values(experienceModes).map(mode=>mode.role),['LLM','IMAGE','VIDEO','TTS','ASR']);
 const connections=[
  {id:'text',name:'对话',provider:'示例',model:'text-v1',role:'LLM',status:'待检测'},
  {id:'image',name:'绘图',provider:'示例',model:'image-v1',role:'IMAGE',status:'待检测'},
  {id:'old',name:'停用视频',provider:'示例',model:'video-v1',role:'VIDEO',enabled:false,status:'待检测'}
 ];
 assert.deepEqual(matchingExperienceConnections(connections,'image').map(x=>x.id),['image']);
 assert.deepEqual(matchingExperienceConnections(connections,'video').map(x=>x.id),[]);
 assert.deepEqual(matchingExperienceConnections(connections,'text').map(x=>x.id),['text']);
});

test('体验预览保留输入与参数，同时明确不产生模型输出',()=>{
 const request=experienceRequest('video','  雨夜中的城市  ',{resolution:'1080P',duration:'5 秒'},'model-1');
 assert.equal(request.prompt,'雨夜中的城市');
 assert.equal(request.connectionId,'model-1');
 assert.equal(request.parameters.resolution,'1080P');
 assert.equal(request.mode,'本地请求预览');
 assert.equal('output' in request,false);
});

test('语音识别只接受范围内的音频文件',()=>{
 assert.equal(validateExperienceAudio({name:'sample.wav',type:'audio/wav',size:1024}), '');
 assert.match(validateExperienceAudio({name:'bad.pdf',type:'application/pdf',size:1024}),/音频/);
 assert.match(validateExperienceAudio({name:'large.mp3',type:'audio/mpeg',size:11*1024*1024}),/10 MB/);
});
