// Crea dist/: l'app in un unico file HTML + i moduli opzionali caricati solo quando servono.
//   fotolibro-studio.html  l'app (doppio clic per aprirla in Chrome o Edge)
//   fotolibro-effetti.js   scontorno del soggetto per le pagine effetto (MediaPipe + DeepLab v3)
//   fotolibro-cmyk.js      conversione CMYK FOGRA39 (ISO Coated v2 ECI) per la copertina
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,readdirSync,statSync} from 'node:fs';
const root=new URL('./',import.meta.url),src=new URL('./src/',root),ven=new URL('./vendor/',root),dist=new URL('./dist/',root);
mkdirSync(dist,{recursive:true});
let html=readFileSync(new URL('index.html',src),'utf8');
html=html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g,(_,p)=>`<style>\n${readFileSync(new URL(p,src),'utf8')}\n</style>`);
const js=[];html=html.replace(/<script src="(js\/[^"]+)"><\/script>\n?/g,(_,p)=>{js.push(`/* ---- ${p} ---- */\n`+readFileSync(new URL(p,src),'utf8'));return '';});
/* sticker illustrati: ogni cartella "stickers <tema>" nella radice del progetto entra nell'app (SVG ripuliti) */
const art=[];
for(const dir of readdirSync(root).filter(d=>/^stickers\s+\S/i.test(d)&&statSync(new URL(d+'/',root)).isDirectory()).sort()){
  const folder=dir.replace(/^stickers\s+/i,'').trim().toLowerCase();
  for(const f of readdirSync(new URL(dir+'/',root)).filter(f=>/\.svg$/i.test(f)).sort((a,b)=>a.localeCompare(b,'it',{numeric:true}))){
    let svg=readFileSync(new URL(dir+'/'+f,root),'utf8');
    svg=svg.replace(/<\?xml[^>]*\?>/g,'').replace(/<!--[\s\S]*?-->/g,'').replace(/<!DOCTYPE[^>]*>/gi,'')
      .replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi,'')
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi,'').replace(/(xlink:)?href\s*=\s*("(?!#)[^"]*"|'(?!#)[^']*')/gi,'')
      .replace(/@import[^;]*;/gi,'').replace(/\s+/g,' ').replace(/>\s+</g,'><').trim();
    const vb=(svg.match(/viewBox\s*=\s*"([^"]+)"/)||[])[1];if(!vb){console.warn('sticker senza viewBox, saltato:',dir+'/'+f);continue;}
    const [,,w,h]=vb.trim().split(/[\s,]+/).map(Number);
    /* dimensione intrinseca grande: il disegno resta nitido anche a 300 dpi */
    const H=2000,W=Math.round(H*w/h);svg=svg.replace(/<svg\b([^>]*)>/,(m,a)=>'<svg'+a.replace(/\s(width|height)\s*=\s*"[^"]*"/g,'')+` width="${W}" height="${H}">`);
    art.push({folder,file:f.replace(/\.svg$/i,''),w,h,svg});}}
js.unshift(`/* ---- sticker illustrati (${art.length}) ---- */\nwindow.__ART=${JSON.stringify(art)};\n`);
const bundle=js.join('\n').replace(/<\/script/gi,'<\\/script');
html=html.replace('</body>',()=>`<script>\n${bundle}\n</script>\n</body>`);
writeFileSync(new URL('fotolibro-studio.html',dist),html);
const b64=p=>readFileSync(new URL(p,ven)).toString('base64');
const fx=`/* Fotolibro Studio · modulo effetti. Contiene @mediapipe/tasks-vision 0.10.14 e il modello DeepLab v3 (Apache License 2.0, Google). */
(function(){var D={loader:"${b64('mediapipe/vision_wasm_internal.js')}",wasm:"${b64('mediapipe/vision_wasm_internal.wasm')}",model:"${b64('mediapipe/deeplab_v3.tflite')}"};
var module={exports:{}},exports=module.exports;
${readFileSync(new URL('mediapipe/vision_bundle.cjs',ven),'utf8').replace(/\/\/# sourceMappingURL=.*$/m,'')}
window.__FXLIB={V:module.exports,D:D};})();\n`;
writeFileSync(new URL('fotolibro-effetti.js',dist),fx);
const cm=`/* Fotolibro Studio · modulo CMYK. Profilo ISO Coated v2 (ECI) per FOGRA39, distribuito senza modifiche con la sua licenza (LICENZE.txt). */
window.__CMYK={grid:33,lut:"${b64('icc/fogra39-lut.bin')}",icc:"${b64('icc/ISOcoated_v2_eci.icc')}",name:"ISO Coated v2 (ECI) · FOGRA39"};\n`;
writeFileSync(new URL('fotolibro-cmyk.js',dist),cm);
writeFileSync(new URL('LICENZE.txt',dist),[readFileSync(new URL('icc/ISOcoated_v2_eci-LICENSE.txt',ven),'utf8'),
  '\n\n@mediapipe/tasks-vision e modello DeepLab v3: Apache License 2.0, https://www.apache.org/licenses/LICENSE-2.0\n'].join(''));
const kb=f=>(readFileSync(new URL(f,dist)).length/1024).toFixed(0)+' KB';
console.log('dist/fotolibro-studio.html',kb('fotolibro-studio.html'),'· sticker',art.length,'· effetti',kb('fotolibro-effetti.js'),'· cmyk',kb('fotolibro-cmyk.js'));
