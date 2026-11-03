// Crea un unico file HTML (dist/fotolibro-studio.html) da aprire con doppio clic in Chrome o Edge.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const src=new URL('./src/',import.meta.url);
let html=readFileSync(new URL('index.html',src),'utf8');
html=html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g,(_,p)=>`<style>\n${readFileSync(new URL(p,src),'utf8')}\n</style>`);
const js=[];html=html.replace(/<script src="(js\/[^"]+)"><\/script>\n?/g,(_,p)=>{js.push(`/* ---- ${p} ---- */\n`+readFileSync(new URL(p,src),'utf8'));return '';});
const bundle=js.join('\n').replace(/<\/script/gi,'<\\/script');
html=html.replace('</body>',()=>`<script>\n${bundle}\n</script>\n</body>`);
mkdirSync(new URL('./dist/',import.meta.url),{recursive:true});
writeFileSync(new URL('./dist/fotolibro-studio.html',import.meta.url),html);
console.log('dist/fotolibro-studio.html',(html.length/1024).toFixed(0)+' KB');
