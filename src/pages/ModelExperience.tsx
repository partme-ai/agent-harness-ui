import {useEffect,useRef,useState} from 'react';
import {Alert,Button,Input,Select,Segmented,Space,Switch,Tag,Upload} from 'antd';
import {AudioOutlined,ArrowUpOutlined,PauseCircleOutlined,PlayCircleOutlined,PlusOutlined,SoundOutlined} from '@ant-design/icons';
import {useConsole} from '../context';
import {experienceModes,experienceRequest,matchingExperienceConnections,validateExperienceAudio,type ExperienceKind} from '../model_experience';
import {ttsModels,voicesForModel} from '../voice_catalog';
import {useVoicePreview} from '../use_voice_preview';
import './model_experience.css';

const textIdeas=[['创意写作','写一段温暖的智能体自我介绍。'],['数理逻辑','解释一道简单的逻辑题，并列出推理步骤。'],['代码开发','写一个 TypeScript 数组去重函数。'],['信息问答','用三句话说明什么是向量检索。'],['文本翻译','把“欢迎使用 Agent Harness UI”翻译成英文。']];
const imageIdeas=[['海边午后','阳光穿过海边咖啡馆的落地窗，电影感，暖色调'],['绿色植物','热带植物图鉴海报，细节丰富的绿色复古插画'],['未来城市','雨夜里的未来城市，霓虹灯与行人倒影']];
const videoIdeas=[['山野对决','黄昏的草原上，两名侠客相向而行，镜头缓慢推进'],['机械莲花','一朵机械莲花在雨后缓缓展开，微距镜头与柔和光线']];

export function ModelExperience({kind,onConfigure,onOpenVoices}:{kind:ExperienceKind;onConfigure:()=>void;onOpenVoices:()=>void}){
 const c=useConsole(),mode=experienceModes[kind],connections=matchingExperienceConnections(c.store.connections,kind);
 const [connectionId,setConnectionId]=useState(connections[0]?.id||''),[input,setInput]=useState(''),[result,setResult]=useState<ReturnType<typeof experienceRequest>|null>(null),[error,setError]=useState('');
 const [aspect,setAspect]=useState('1:1'),[count,setCount]=useState(1),[resolution,setResolution]=useState('1080P'),[duration,setDuration]=useState('5 秒'),[withSound,setWithSound]=useState(true);
 const [reasoning,setReasoning]=useState(false),[online,setOnline]=useState(false),[speed,setSpeed]=useState('1x'),[volume,setVolume]=useState('50'),[language,setLanguage]=useState('自动识别');
 const defaultVoiceModel=ttsModels.find(model=>model.id==='aliyun-voice:qwen-audio-3.1-tts-flash')||ttsModels[0];
 const [voiceModelId,setVoiceModelId]=useState(defaultVoiceModel.id),[voiceKey,setVoiceKey]=useState('');
 const voiceModel=ttsModels.find(model=>model.id===voiceModelId)||defaultVoiceModel,voices=voicesForModel(voiceModel,c.store.voiceAssets),selectedVoice=voices.find(voice=>voice.key===voiceKey)||voices[0];
 const preview=useVoicePreview(`${kind}:${voiceModelId}`);
 const [audioName,setAudioName]=useState(''),[audioUrl,setAudioUrl]=useState(''),[recording,setRecording]=useState(false);
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),recordTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{if(!connections.some(connection=>connection.id===connectionId))setConnectionId(connections[0]?.id||'');},[connections.map(connection=>connection.id).join('|'),connectionId]);
 useEffect(()=>()=>{if(audioUrl)URL.revokeObjectURL(audioUrl);},[audioUrl]);
 useEffect(()=>()=>{if(recordTimer.current)clearTimeout(recordTimer.current);if(recorder.current){recorder.current.onstop=null;if(recorder.current.state!=='inactive')recorder.current.stop();}stream.current?.getTracks().forEach(track=>track.stop());preview.stop();},[]);
 const parameters:Record<string,string>=kind==='text'?{reasoning:String(reasoning),online:String(online)}:kind==='image'?{aspect,count:String(count)}:kind==='video'?{resolution,duration,sound:String(withSound)}:kind==='tts'?{voiceModel:voiceModel.modelId,voiceId:selectedVoice?.voiceId||'',speed,volume}:{language,audioName};
 function submit(){try{setResult(experienceRequest(kind,kind==='asr'?audioName:input,parameters,connectionId));setError('');}catch(e){setError((e as Error).message);}}
 function upload(file:File){const issue=validateExperienceAudio(file);if(issue){setError(issue);return false;}setAudioName(file.name);setAudioUrl(URL.createObjectURL(file));setResult(null);setError('');return false;}
 async function startRecording(){
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){setError('当前浏览器不支持录音，请上传音频文件。');return;}
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:true});stream.current=media;
   const next=new MediaRecorder(media),chunks:BlobPart[]=[];recorder.current=next;
   next.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
   next.onstop=()=>{media.getTracks().forEach(track=>track.stop());stream.current=null;setRecording(false);if(recordTimer.current)clearTimeout(recordTimer.current);const blob=new Blob(chunks,{type:next.mimeType||'audio/webm'});if(!blob.size){setError('没有录到声音，请重试。');return;}if(blob.size>10*1024*1024){setError('录音不能超过 10 MB');return;}setAudioName('本地录音.webm');setAudioUrl(URL.createObjectURL(blob));setResult(null);};
   next.start();setRecording(true);setError('');recordTimer.current=setTimeout(()=>{if(next.state==='recording')next.stop();},60000);
  }catch{stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;setRecording(false);setError('无法使用麦克风，请检查浏览器权限或改用上传。');}
 }
 function stopRecording(){if(recorder.current?.state==='recording')recorder.current.stop();}
 const selectedConnection=connections.find(connection=>connection.id===connectionId);
 const suggestions=kind==='text'?textIdeas:kind==='image'?imageIdeas:videoIdeas;
 return <section className="model-experience" aria-label={`${mode.title}模型体验`}>
  <header className="experience-hero"><span className="experience-eyebrow">模型体验</span><h2>欢迎体验 <em>{mode.title}</em>，今天你想创造什么？</h2><p>{mode.description}</p><div className="experience-model-line"><Select aria-label="体验模型连接" value={connectionId||undefined} onChange={value=>{setConnectionId(value);setResult(null);}} placeholder="尚未配置模型连接" options={connections.map(connection=>({value:connection.id,label:`${connection.name} · ${connection.model}`}))} notFoundContent="暂无对应分类的模型连接"/><Button type="link" onClick={onConfigure}>配置模型</Button></div></header>
  {kind!=='asr'?<div className="experience-composer"><Input.TextArea aria-label={`${mode.title}体验输入`} value={input} onChange={event=>{setInput(event.target.value);setResult(null);}} placeholder={mode.placeholder} autoSize={{minRows:3,maxRows:7}} maxLength={kind==='tts'?2000:4000}/><div className="experience-composer-footer"><div className="experience-controls">
   {kind==='text'&&<><label><Switch size="small" checked={reasoning} onChange={setReasoning}/> 深度思考</label><label><Switch size="small" checked={online} onChange={setOnline}/> 联网搜索</label></>}
   {kind==='image'&&<><Select aria-label="图片比例" value={aspect} onChange={setAspect} options={['1:1','4:3','3:4','16:9'].map(value=>({value,label:value}))}/><Segmented aria-label="图片张数" value={count} onChange={setCount} options={[1,2,4].map(value=>({value,label:`${value} 张`}))}/></>}
   {kind==='video'&&<><Select aria-label="视频清晰度" value={resolution} onChange={setResolution} options={['720P','1080P'].map(value=>({value,label:value}))}/><Select aria-label="视频时长" value={duration} onChange={setDuration} options={['5 秒','10 秒'].map(value=>({value,label:value}))}/><label><Switch size="small" checked={withSound} onChange={setWithSound}/> 声音</label></>}
   {kind==='tts'&&<><Select aria-label="音色模型" value={voiceModelId} onChange={value=>{setVoiceModelId(value);setVoiceKey('');}} options={ttsModels.map(model=>({value:model.id,label:`${model.provider} · ${model.displayName||model.modelId}`}))}/><Select aria-label="语音语速" value={speed} onChange={setSpeed} options={['0.8x','1x','1.2x','1.5x'].map(value=>({value,label:value}))}/><Select aria-label="语音音量" value={volume} onChange={setVolume} options={['25','50','75','100'].map(value=>({value,label:`${value}%`}))}/></>}
  </div><Button type="primary" shape="circle" icon={<ArrowUpOutlined/>} aria-label="预览体验请求" disabled={!input.trim()} onClick={submit}/></div></div>:<><div className="experience-asr-input"><Upload.Dragger accept=".wav,.mp3,.m4a,.webm,.ogg,audio/*" multiple={false} showUploadList={false} beforeUpload={upload}><PlusOutlined/><strong>上传音频</strong><small>wav / mp3 / m4a，建议 10 秒以上，文件小于 10 MB</small></Upload.Dragger><div className="experience-record"><Button type={recording?'default':'primary'} icon={recording?<PauseCircleOutlined/>:<AudioOutlined/>} onClick={recording?stopRecording:startRecording}>{recording?'停止录音':'点击开始录音'}</Button><small>录音只保留在当前浏览器，最长 60 秒</small></div></div><div className="experience-asr-actions"><Select aria-label="识别语言" value={language} onChange={setLanguage} options={['自动识别','中文','English','日本語'].map(value=>({value,label:value}))}/><Button type="primary" disabled={!audioName} onClick={submit}>预览识别请求</Button></div>{audioName&&<div className="experience-audio-file"><SoundOutlined/><span>{audioName}</span>{audioUrl&&<audio controls src={audioUrl} aria-label="试听已选择的音频"/>}<Button size="small" onClick={()=>{setAudioName('');setAudioUrl('');setResult(null);}}>移除</Button></div>}</>}
  {error&&<Alert className="experience-feedback" type="error" showIcon title={error}/>}
  {result&&<Alert className="experience-feedback" type="info" showIcon title="本地请求预览已生成" description={<div><p>已记录{selectedConnection?`「${selectedConnection.model}」`:'未选择模型'}的输入与参数；当前未调用模型，不会产生生成内容或识别文本。</p><pre>{JSON.stringify(result,null,2)}</pre></div>}/>}
  {kind==='text'&&<div className="experience-ideas">{suggestions.map(([label,prompt])=><Button key={label} shape="round" onClick={()=>{setInput(prompt);setResult(null);}}>{label}</Button>)}</div>}
  {(kind==='image'||kind==='video')&&<div className="experience-inspiration"><h3>灵感浏览 <Tag>提示词示例</Tag></h3><div className={`experience-inspiration-grid ${kind}`}>{suggestions.map(([label,prompt],index)=><button className={`experience-inspiration-card inspiration-${index}`} type="button" key={label} onClick={()=>{setInput(prompt);setResult(null);}}><span className="experience-art" aria-hidden="true"><i/><b/><em/></span><strong>{label}</strong><small>{prompt}</small>{kind==='video'&&<PlayCircleOutlined className="experience-play-mark"/>}</button>)}</div></div>}
  {kind==='tts'&&<div className="experience-voice-library"><div className="experience-section-heading"><h3>音色库 <Tag>{voiceModel.provider}</Tag></h3><Button type="link" onClick={onOpenVoices}>查看全部音色</Button></div><div className="experience-voice-grid">{voices.slice(0,8).map(voice=><div key={voice.key} className={`experience-voice-card ${selectedVoice?.key===voice.key?'selected':''}`}><button type="button" className="experience-voice-choose" aria-label={`选择音色 ${voice.name}`} aria-pressed={selectedVoice?.key===voice.key} onClick={()=>setVoiceKey(voice.key)}><span className="experience-voice-avatar">{voice.name.slice(0,1)}</span><span className="experience-voice-identity"><strong>{voice.name}</strong><small>{voice.language}</small></span></button><Button type="text" className="experience-voice-play" aria-label={`${preview.state.key===voice.key?'停止试听':'试听音色'} ${voice.name}`} disabled={!voice.previewUrl} icon={preview.state.key===voice.key&&preview.state.status!=='error'?<PauseCircleOutlined/>:<PlayCircleOutlined/>} onClick={()=>preview.toggle(voice.key,voice.previewUrl)}/></div>)}</div>{preview.state.error&&<p role="alert">{preview.state.error}</p>}</div>}
  <p className="experience-disclaimer">当前为本地界面演示。官方样本可试听；生成、合成和识别需要接入真实模型服务。</p>
 </section>;
}
