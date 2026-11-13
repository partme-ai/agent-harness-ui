import React,{createContext,useContext} from 'react';
const unavailable=async()=>{throw new Error('当前浏览器未接入运行端');};
export const browserPlatform={listSSHConfigAliases:unavailable,listWSLDistros:unavailable,isDockerAvailable:unavailable,listDockerContainers:unavailable,selectFile:async()=>null};
const PlatformContext=createContext(browserPlatform);
export const PlatformProvider=PlatformContext.Provider;
export function usePlatform(){return useContext(PlatformContext);}
