import {useEffect} from 'react';
import {BotsDialog as ZCodeBotsDialog} from './zcode/BotsDialog.jsx';
import {MockBotHost} from './bots_bridge.jsx';
import './bots_utilities.css';
import './bots_dialog.css';
export function BotsDialog({entryProvider,onClose,onToast}) {
 useEffect(()=>{const handler=e=>onToast?.(e.detail);window.addEventListener('buddy-mock-toast',handler);return()=>window.removeEventListener('buddy-mock-toast',handler)},[onToast]);
 return <MockBotHost><ZCodeBotsDialog open onOpenChange={onClose} workspacePath="agent-buddy" entryProvider={entryProvider}/></MockBotHost>;
}
