import {AppleLogo,ArrowsLeftRight,Bell,BracketsCurly,Broadcast,Butterfly,Camera,ChatCircleDots,Cloud,Cpu,EnvelopeSimple,FolderSimple,GitBranch,Globe,GoogleLogo,Hash,House,Lightning,MatrixLogo,Microphone,MicrosoftTeamsLogo,Network,NotionLogo,Phone,PuzzlePiece,Queue,RedditLogo,SlackLogo,Stack,TerminalWindow,TwitchLogo,WebhooksLogo,WechatLogo,WhatsappLogo,WindowsLogo,XLogo} from '@phosphor-icons/react';
import {channelPresentation} from './channel_presentation.js';
import dingtalkIcon from './channel_icons/dingding.png';
import discordIcon from './channel_icons/discord.png';
import wecomIcon from './channel_icons/wecom.png';
import wechatIcon from './channel_icons/weixin.png';
import a2aIcon from './channel_icons/openclaw/a2a.png';
import buzzIcon from './channel_icons/openclaw/buzz.png';
import clickclackIcon from './channel_icons/openclaw/clickclack.png';
import googlechatIcon from './channel_icons/openclaw/googlechat.png';
import imessageIcon from './channel_icons/openclaw/imessage.png';
import ircIcon from './channel_icons/openclaw/irc.png';
import lineIcon from './channel_icons/openclaw/line.png';
import matrixIcon from './channel_icons/openclaw/matrix.png';
import mattermostIcon from './channel_icons/openclaw/mattermost.png';
import msteamsIcon from './channel_icons/openclaw/msteams.png';
import nextcloudTalkIcon from './channel_icons/openclaw/nextcloud-talk.png';
import nostrIcon from './channel_icons/openclaw/nostr.png';
import raftIcon from './channel_icons/openclaw/raft.png';
import signalIcon from './channel_icons/openclaw/signal.png';
import slackIcon from './channel_icons/openclaw/slack.png';
import smsIcon from './channel_icons/openclaw/sms.png';
import synologyChatIcon from './channel_icons/openclaw/synology-chat.png';
import tlonIcon from './channel_icons/openclaw/tlon.png';
import twitchIcon from './channel_icons/openclaw/twitch.png';
import whatsappIcon from './channel_icons/openclaw/whatsapp.png';
import zaloIcon from './channel_icons/openclaw/zalo.png';

const glyphs={apple:AppleLogo,bell:Bell,api:BracketsCurly,broadcast:Broadcast,butterfly:Butterfly,camera:Camera,chat:ChatCircleDots,cloud:Cloud,cpu:Cpu,git:GitBranch,globe:Globe,google:GoogleLogo,hash:Hash,home:House,lightning:Lightning,mail:EnvelopeSimple,matrix:MatrixLogo,mic:Microphone,microsoft:WindowsLogo,network:Network,notion:NotionLogo,phone:Phone,plugin:PuzzlePiece,queue:Queue,reddit:RedditLogo,relay:ArrowsLeftRight,slack:SlackLogo,stack:Stack,teams:MicrosoftTeamsLogo,terminal:TerminalWindow,twitch:TwitchLogo,webhook:WebhooksLogo,wechat:WechatLogo,whatsapp:WhatsappLogo,x:XLogo,folder:FolderSimple};
const images={dingtalk:dingtalkIcon,discord:discordIcon,wecom:wecomIcon,wechat:wechatIcon};
const referenceImages={a2a:a2aIcon,buzz:buzzIcon,clickclack:clickclackIcon,googlechat:googlechatIcon,imessage:imessageIcon,irc:ircIcon,line:lineIcon,matrix:matrixIcon,mattermost:mattermostIcon,msteams:msteamsIcon,'nextcloud-talk':nextcloudTalkIcon,nostr:nostrIcon,raft:raftIcon,signal:signalIcon,slack:slackIcon,sms:smsIcon,'synology-chat':synologyChatIcon,tlon:tlonIcon,twitch:twitchIcon,whatsapp:whatsappIcon,zalo:zaloIcon};
const referenceAlias={reef:'raft','voice-call':'sms',zalouser:'zalo','slack-webhook':'slack','teams-webhook':'msteams','whatsapp-cloud':'whatsapp','whatsapp-web':'whatsapp'};
const accent={apple:'#a5a5ad',bell:'#eb9c39',butterfly:'#1685e8',chat:'#44a8e8',dingtalk:'#1589db',discord:'#7289ed',google:'#4285f4',mail:'#e7a447',matrix:'#57b987',microsoft:'#5a9cea',network:'#8c83dc',notion:'#a3a3a3',reddit:'#f45035',slack:'#b056a6',teams:'#7565ce',terminal:'#9b9aa6',twitch:'#9464e9',wecom:'#36bc8a',wechat:'#28ba53',whatsapp:'#25ba69',x:'#a2a2a2'};

export function ChannelIcon({provider,className=''}){
 const presentation=channelPresentation(provider);
 if(!presentation)return null;
 const key=presentation.icon;
 const image=images[key]||referenceImages[referenceAlias[provider]||provider];
 const Glyph=glyphs[key]||ChatCircleDots;
 return <span className={`buddy-channel-visual ${className}`} data-channel-icon={provider} data-brand-image={Boolean(image)} style={{'--buddy-channel-accent':accent[key]||'#7193b8'}} aria-hidden="true">
   {image?<img src={image} alt=""/>:<Glyph weight="fill"/>}
 </span>;
}
