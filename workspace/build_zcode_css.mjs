import fs from 'node:fs';
import path from 'node:path';
import {compile} from '@tailwindcss/node';
export async function buildZCodeCss(root){
 const base=path.join(root,'shared/zcode');
 const compiler=await compile(fs.readFileSync(path.join(base,'tailwind.css'),'utf8'),{base,onDependency:()=>{}});
 const tokens=new Set();
 function scan(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())scan(p);else if(/\.(tsx?|jsx?)$/.test(f.name)){for(const token of fs.readFileSync(p,'utf8').matchAll(/[^\s"'`<>]+/g))tokens.add(token[0]);}}}
 scan(base);
 // 非侵入式 utilities：现有 Ant Design 页面保留原样，迁入组件保留上游类名。
 fs.writeFileSync(path.join(base,'generated.css'),compiler.build([...tokens]));
}
