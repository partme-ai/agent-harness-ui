import catalog from './channel_catalog.json' with {type:'json'};

const sourceOwnedProviders=new Set(['weixin','feishu','lark','telegram']);
export function getExtendedBotChannel(id){return catalog.channels.find(channel=>channel.id===id && !sourceOwnedProviders.has(id));}
export function listExtendedBotChannels({query='',category='all'}={}){
 const needle=query.trim().toLocaleLowerCase();
 return catalog.channels.filter(channel=>!sourceOwnedProviders.has(channel.id)&&(category==='all'||channel.category===category)&&`${channel.name} ${channel.id}`.toLocaleLowerCase().includes(needle));
}
