import {useState,useSyncExternalStore} from 'react';
import {AntNativeButton as ProButtonControl,AntNativeInput as ProInputControl} from '../ant_controls.jsx';
import {getExtendedBotChannel,listExtendedBotChannels} from './channel_catalog_view.js';
import {channelMockStore,mockChannelKey} from './channel_mock_store.js';
import {setupFieldsFor} from './channel_setup_fields.js';
import {ChannelIcon} from './ChannelIcon.jsx';
import {channelPresentation} from './channel_presentation.js';
import './expanded_bot_channels.css';

const categories={all:'全部',chat:'聊天平台',work:'企业协作',transport:'协议与本地'};
const statusLabels={configured:'待连接',connected:'模拟已连接',failed:'模拟失败',disconnected:'已断开'};
export {getExtendedBotChannel};
function useChannelText(){return text=>text;}

export function ExpandedBotChannelPicker({creatingProvider,mode,onCreate}){
  const t=useChannelText();
  const locale='zh-CN';
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const channels=listExtendedBotChannels();
  const visible=listExtendedBotChannels({query,category});
  return <div className="buddy-expanded-picker" data-testid="expanded-bot-channels">
    <div className="buddy-expanded-picker-heading"><div><strong>{t('更多通信平台')}</strong><p>{t('从现有机器人页创建；扩展平台使用 Mock 仿真。')}</p></div><span>{channels.length} {t('个平台')}</span></div>
    <ProInputControl aria-label={t('搜索机器人平台')} placeholder={t('搜索平台')} value={query} onChange={event=>setQuery(event.target.value)}/>
    <div className="buddy-expanded-filters">{Object.entries(categories).map(([id,label])=><ProButtonControl key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{t(label)}</ProButtonControl>)}</div>
    {mode==='live'&&<p className="buddy-expanded-note" role="status">{t('扩展平台目前仅支持 Mock 仿真。切换底部渠道服务后可创建。')}</p>}
    <div className="buddy-expanded-grid">{visible.map(channel=><ProButtonControl key={channel.id} className="buddy-expanded-card" disabled={mode==='live'||creatingProvider!==null} aria-busy={creatingProvider===channel.id} onClick={()=>onCreate(channel.id)}><ChannelIcon provider={channel.id} className="buddy-expanded-icon"/><span><strong title={channel.name}>{channel.name}</strong><small>{channelPresentation(channel.id,locale)?.description}</small></span></ProButtonControl>)}</div>
    {visible.length===0&&<p className="buddy-expanded-empty">{t('未找到平台')}</p>}
  </div>;
}

export function ExpandedBotChannelSettings({bot,mode}){
  const t=useChannelText();
  const channel=getExtendedBotChannel(bot.provider);
  const rows=useSyncExternalStore(channelMockStore.subscribe,channelMockStore.list,channelMockStore.list);
  const key=mockChannelKey(bot.provider,bot.id);
  const record=rows[key];
  const [endpoint,setEndpoint]=useState(record?.endpoint||'');
  const [credentials,setCredentials]=useState({});
  const [feedback,setFeedback]=useState('');
  if(!channel)return null;
  function run(action){try{const next=action();setFeedback(t(next?.lastResult||'Mock 配置已保存；未连接真实平台'))}catch(error){setFeedback(t(error.message))}}
  return <section className="buddy-expanded-settings" aria-label={`${channel.name} Mock`}>
    <div className="buddy-expanded-settings-heading"><div><strong>{channel.name}</strong><p>{t(channel.setup==='pairing'?'扫码配对':channel.setup==='local'?'本地配置':'凭据配置')} · {t('扩展平台 Mock 仿真')}</p></div><span>{t(record?statusLabels[record.status]:'未配置')}</span></div>
    {mode==='live'?<p role="status">{t('此平台的真实接入尚未实现。切换至 Mock 仿真可预览完整配置流程。')}</p>:<>
      <div className="buddy-expanded-fields"><label>{t('连接地址（可选）')}<ProInputControl value={endpoint} onChange={event=>setEndpoint(event.target.value)} placeholder={t('Webhook 或服务端地址')}/></label>
      {setupFieldsFor(channel).map(field=><label key={field.id}>{field.label} (Mock)<ProInputControl type={field.type} value={credentials[field.id]||''} onChange={event=>setCredentials(current=>({...current,[field.id]:event.target.value}))} placeholder={t('仅用于当前界面，不写入存储')}/></label>)}
      </div>
      <div className="buddy-expanded-actions"><ProButtonControl onClick={()=>run(()=>channelMockStore.configure(channel.id,bot.id,{endpoint}))}>{t('保存 Mock 配置')}</ProButtonControl><ProButtonControl disabled={!record} onClick={()=>run(()=>channelMockStore.simulate(key,'connected'))}>{t('模拟连接成功')}</ProButtonControl><ProButtonControl disabled={!record} onClick={()=>run(()=>channelMockStore.simulate(key,'failed'))}>{t('模拟失败')}</ProButtonControl><ProButtonControl disabled={!record} onClick={()=>run(()=>channelMockStore.test(key))}>{t('模拟收发')}</ProButtonControl><ProButtonControl disabled={!record} onClick={()=>run(()=>channelMockStore.simulate(key,'disconnected'))}>{t('断开')}</ProButtonControl></div>
      <p className="buddy-expanded-feedback" role="status">{feedback||t('保存配置后可以模拟连接与消息收发。')}</p>
    </>}
  </section>;
}
