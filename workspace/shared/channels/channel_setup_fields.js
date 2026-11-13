// Config hints for the prototype. They do not authorize a platform API call.
const specs={
  telegram:['Bot Token'],discord:['Bot Token','Application ID'],slack:['Bot Token','App Token'],
  feishu:['App ID','App Secret'],lark:['App ID','App Secret'],dingtalk:['Client ID','Client Secret'],
  wecom:['Corp ID','Agent ID','Secret'],weixin:['扫码配对'], 'wechat-official':['App ID','App Secret'],
  qq:['App ID','App Secret'],onebot:['Access Token','WebSocket URL'],napcat:['Access Token','WebSocket URL'],
  signal:['Phone number','Signal CLI endpoint'],imessage:['iMessage bridge URL'],
  whatsapp:['Phone number','Access Token'], 'whatsapp-web':['扫码配对'], 'whatsapp-cloud':['Phone Number ID','Access Token'],
  matrix:['Homeserver URL','Access Token'],mattermost:['Server URL','Bot Token'],
  msteams:['App ID','App Password'],googlechat:['Service Account JSON'],
  email:['IMAP URL','SMTP URL','Password'],webex:['Bot Token'],line:['Channel Access Token','Channel Secret'],
  wechat:['扫码配对'],wechatbot:['App ID','App Secret'],
  'wecom-ws':['Bot ID','Secret'],'wecom-callback':['Token','Encoding AES Key'],
  sms:['Sender number','API Token'],irc:['Server URL','Nickname'],webhook:['Webhook URL','Signing Secret'],
  mqtt:['Broker URL','Topic'],amqp:['Broker URL','Queue'],
};
const secret=/secret|token|password|key|json|配对/i;
export function setupFieldsFor(channel){
 if(channel.setup==='local')return [];
 return (specs[channel.id] || (channel.setup==='pairing'?['扫码配对']:['API Token'])).map(label=>({id:label,type:secret.test(label)?'password':'text',label}));
}
