import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
import {buildZCodeCss} from '../workspace/build_zcode_css.mjs';

const root=path.resolve(import.meta.dirname,'../workspace');
const output=path.resolve(root,'../dist');
await buildZCodeCss(root);
const zroot=path.join(root,'shared/zcode');
const alias={
  '@/components/ui/dropdown-menu.js':path.join(zroot,'adapters/dropdown_menu.tsx'),
  '@/i18n/IntlProvider.js':path.join(zroot,'adapters/intl.ts'),
  '@/hooks/usePlatform.js':path.join(zroot,'adapters/platform.jsx'),
  '@/hooks/useInterfaceMode.js':path.join(zroot,'adapters/interface_mode.ts'),
  '@/lib/userActionTelemetry.js':path.join(zroot,'adapters/telemetry.ts'),
  '@/logger.js':path.join(zroot,'adapters/logger.ts'),
  '@zcode/shared':path.join(zroot,'shared/index.ts'),
  '@':path.join(zroot,'ui'),
};
const boundaryPlugin={name:'zcode-local-boundaries',setup(b){b.onResolve({filter:/^(\.\/i18n\/IntlProvider|\.\/logger)\.js$/},args=>({path:path.join(zroot,args.path.includes('IntlProvider')?'adapters/intl.ts':'adapters/logger.ts')}));}};
const bootstrap=`let storage;try{storage=window.localStorage;storage.getItem('harness.probe');}catch{const values=new Map();storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k),clear:()=>values.clear()};Object.defineProperty(window,'localStorage',{value:storage});}if(!crypto.randomUUID)crypto.randomUUID=()=>{const b=crypto.getRandomValues(new Uint8Array(16));return [...b].map(v=>v.toString(16).padStart(2,'0')).join('');};`;
async function bundle(entry){return build({entryPoints:[path.join(root,entry)],alias,plugins:[boundaryPlugin],bundle:true,write:false,outdir:'out',format:'iife',platform:'browser',jsx:'automatic',target:'es2022',minify:true,legalComments:'inline',loader:{'.png':'dataurl','.svg':'dataurl'},define:{'process.env.NODE_ENV':'"production"'}});}
function writeHtml(file,result,title){
  const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text;
  const css=result.outputFiles.find(f=>f.path.endsWith('.css'))?.text||'';
  const target=path.join(output,file);fs.mkdirSync(path.dirname(target),{recursive:true});
  const name=file.replaceAll('/','-').replace('.html','');
  const assets=path.join(output,'assets');fs.mkdirSync(assets,{recursive:true});
  fs.writeFileSync(path.join(assets,`workspace-${name}.js`),bootstrap+'\n'+js);
  fs.writeFileSync(path.join(assets,`workspace-${name}.css`),css);
  const prefix=file.includes('/')?'../':'./';
  fs.writeFileSync(target,`<!doctype html><html lang="zh-CN" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="${prefix}assets/workspace-${name}.css"></head><body><div id="buddy-root"></div><script defer src="${prefix}assets/workspace-${name}.js"></script></body></html>`);
}
for(const [entry,file] of [['AutoEntry.jsx','index.html'],['mobile/main.jsx','mobile/index.html'],['tablet/main.jsx','tablet/index.html'],['desktop/main.jsx','desktop/index.html']])writeHtml(file,await bundle(entry),'Agent Harness UI · 智能体工作台');
writeHtml('compare.html',await bundle('Compare.jsx'),'Agent Harness UI · 三端界面设计');
fs.mkdirSync(path.join(output,'licenses'),{recursive:true});
fs.copyFileSync(path.join(root,'UPSTREAM-LICENSE'),path.join(output,'licenses/workspace-MIT.txt'));
fs.cpSync(path.join(root,'third_party/zcode'),path.join(output,'licenses/zcode'),{recursive:true});
console.log('Built Agent Harness UI workspace for desktop, tablet, mobile and comparison.');
