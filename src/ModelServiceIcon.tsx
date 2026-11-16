import type {ReactNode} from 'react';
const scenePaths:Record<string,ReactNode>={
  'message-outlined':<><path d="M8 9h8"/><path d="M8 13h6"/><path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12"/></>,
  'photo-outlined':<><path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/></>,
  'movie-outlined':<><path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12"/><path d="M8 4l0 16"/><path d="M16 4l0 16"/><path d="M4 8l4 0"/><path d="M4 16l4 0"/><path d="M4 12l16 0"/><path d="M16 8l4 0"/><path d="M16 16l4 0"/></>,
  'microphone-outlined':<><path d="M9 5a3 3 0 0 1 3 -3a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3a3 3 0 0 1 -3 -3l0 -5"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M8 21l8 0"/><path d="M12 17l0 4"/></>,
  'chart-column-outlined':<><path d="M4 20h3"/><path d="M17 20h3"/><path d="M10.5 20h3"/><path d="M4 16h3"/><path d="M17 16h3"/><path d="M10.5 16h3"/><path d="M4 12h3"/><path d="M17 12h3"/><path d="M10.5 12h3"/><path d="M4 8h3"/><path d="M17 8h3"/><path d="M4 4h3"/></>
 };
export function isModelServiceIcon(name:string){return Object.hasOwn(scenePaths,name);}
export function ModelServiceIcon({name,className}:{name:string;className?:string}){
 return <svg className={className} width="1em" height="1em" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" data-icon={name} aria-hidden="true">{scenePaths[name]}</svg>;
}
