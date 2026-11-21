// Pagine speciali, effetto, sticker, ridistribuzione ed export di stampa (CMYK, risguardi 4 pagine, interno).
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');
import {mkdirSync,writeFileSync} from 'node:fs';
const [,,OUT='tests/out',DIR]=process.argv;mkdirSync(OUT,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950}});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('file://'+process.cwd()+'/dist/fotolibro-studio.html');await p.waitForSelector('#start:not([hidden])');
await p.setInputFiles('#dirIn',DIR);await p.waitForFunction(()=>realCount()>=25,null,{timeout:60000});await p.waitForTimeout(500);
await p.click('.sthemes .thc:has-text("Natale")');await p.waitForTimeout(300);
await p.screenshot({path:OUT+'/20-start.png'});
await p.click('text=Crea il fotolibro');
await p.waitForFunction(()=>effectIdx()>=0||document.querySelector('#toast').textContent.includes('effetto'),null,{timeout:90000});await p.waitForTimeout(800);
const info=await p.evaluate(()=>({N:bookPages(),print:printPages(),kinds:BOOK.spreads.map((s,i)=>s.kind==='inner'?`${spreadLabel(i)}[${meta(s,'L').special||'-'}|${meta(s,'R').special||'-'}]`:s.kind),
  eff:effectIdx(),used:usage().size,stickers:BOOK.spreads.reduce((a,s)=>a+s.decos.filter(d=>d.sk).length,0),toast:document.querySelector('#toast').textContent}));
console.log(JSON.stringify(info));
const shot=async(n,i)=>{await p.evaluate(i=>goSpread(i),i);await p.waitForTimeout(700);await p.screenshot({path:`${OUT}/${n}.png`,clip:{x:330,y:90,width:980,height:700}});};
await p.evaluate(()=>{UI.tab='pages';renderLeft();});
await shot('21-p4',2);if(info.eff>=0)await shot('22-effect',info.eff);await shot('23-inner',3);await shot('24-last',info.kinds.length-2);
// sostituisci una pagina con frase: nessuna foto deve sparire
const r=await p.evaluate(()=>{const before=usage().size;goSpread(4);UI.side='R';placeSpecial('quote','replace',{quote:themeQuotes()[1]});const a1=usage().size;
  goSpread(5);UI.side='L';placeSpecial('scrap','after',{});const a2=usage().size;
  const i=6;goSpread(i);const n0=BOOK.spreads.length;const ph=BOOK.spreads[i].cells.filter(c=>c.ph&&!c.fx).map(c=>c.ph);BOOK.spreads.splice(i,1);redistribute(ph.filter(x=>!usedInInterior(x.img)),pageNum(i-1,'R'));const a3=usage().size;
  commit();syncAll();return{before,a1,a2,a3};});
console.log('photos kept',JSON.stringify(r));
await shot('25-quote',4);await shot('26-scrap',6);
await p.screenshot({path:OUT+'/27-pages-panel.png'});
// export stampa
const ex=await p.evaluate(async()=>{EXP.dpi=150;EXP.marks=false;openExport('print');await runExport('print');
  const o=[];for(const r of RESULTS){const u=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));o.push([r.name,btoa(s)]);}return o;});
for(const[n,d] of ex){writeFileSync(OUT+'/'+n,Buffer.from(d,'base64'));console.log('file',n,Buffer.from(d,'base64').length);}
await p.screenshot({path:OUT+'/28-export.png'});
const dr=await p.evaluate(async()=>{DRAFT.dpi=90;DRAFT.pdf=true;DRAFT.flip=true;await runExport('draft');const r=RESULTS.find(r=>r.name.endsWith('.pdf'));
  const u=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return[r.name,btoa(s)];});
writeFileSync(OUT+'/'+dr[0],Buffer.from(dr[1],'base64'));console.log('draft',dr[0]);
console.log('ERRORS',errs.filter(e=>!e.includes('XNNPACK')));await b.close();
