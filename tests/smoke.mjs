// Prova automatica: avvio, temi, copertina, risguardi, esportazioni bozza e stampa.
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');
import {mkdirSync,writeFileSync} from 'node:fs';
const OUT=process.argv[2]||'tests/out';mkdirSync(OUT,{recursive:true});
const url='file://'+process.cwd()+'/dist/fotolibro-studio.html';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950},acceptDownloads:true});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
await p.goto(url);await p.waitForSelector('#start:not([hidden])',{timeout:30000});await p.waitForTimeout(1500);
await p.screenshot({path:OUT+'/01-start.png'});
const shot=async(n)=>{await p.waitForTimeout(400);await p.screenshot({path:`${OUT}/${n}.png`});};
await p.click('text=Guarda l’esempio nell’editor');await shot('02-editor');
for(const id of (process.env.THEMES||'natale,valentino,papa').split(',')){
  await p.evaluate(id=>{applyTheme(id);commit();UI.tab='theme';syncAll();goSpread(0);},id);await shot('03-cover-'+id);
  await p.evaluate(()=>goSpread(1));await shot('04-endp-'+id);
  await p.evaluate(()=>goSpread(2));await shot('05-inner-'+id);
}
const dl=async(fn)=>{const files=[];p.on('download',async d=>{const f=OUT+'/'+d.suggestedFilename();await d.saveAs(f);files.push(f);});await p.evaluate(fn);await p.waitForTimeout(500);return files;};
await p.evaluate(()=>{openExport('draft');});await shot('06-export-draft');
const r1=await p.evaluate(async()=>{DRAFT.dpi=90;await runExport('draft');return RESULTS.map(r=>[r.name,r.blob.size]);});
console.log('draft',r1);
await p.evaluate(()=>{UI.expTab='print';renderExport();});await shot('07-export-print');
const r2=await p.evaluate(async()=>{EXP.dpi=150;EXP.marks=true;await runExport('print');return RESULTS.map(r=>[r.name,r.blob.size]);});
console.log('print',r2);
// salva i file prodotti
const saved=await p.evaluate(async()=>{const o=[];for(const r of RESULTS){const u=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));o.push([r.name,btoa(s)]);}return o;});
for(const[n,d] of saved)writeFileSync(OUT+'/'+n,Buffer.from(d,'base64'));
await p.evaluate(async()=>{DRAFT.pdf=true;DRAFT.flip=true;UI.expTab='draft';await runExport('draft');});
const saved2=await p.evaluate(async()=>{const o=[];for(const r of RESULTS){const u=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));o.push([r.name,btoa(s)]);}return o;});
for(const[n,d] of saved2)writeFileSync(OUT+'/'+n,Buffer.from(d,'base64'));
console.log('ERRORS',errs);
await b.close();
