// Controllo completo: creazione guidata, tutti i temi, pagine speciali senza perdita di foto, undo,
// tasti, export (CMYK, risguardi, interno, bozza, flipbook), salva/riapri, finestre di varie dimensioni.
// Uso: node tests/full.mjs <out> <cartella-foto>
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');
import {mkdirSync,writeFileSync} from 'node:fs';
const [,,OUT='tests/out',DIR]=process.argv;mkdirSync(OUT,{recursive:true});
const fails=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails.push(m);};
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('XNNPACK'))errs.push(m.text());});
const url='file://'+process.cwd()+'/dist/fotolibro-studio.html';
console.log('1. Schermata iniziale');
await p.goto(url);await p.waitForSelector('#start:not([hidden])');
ok(await p.textContent('#sbar .btn.pri')==='Scegli la cartella delle foto','senza foto il pulsante principale apre la scelta della cartella');
const t0=Date.now();await p.setInputFiles('#dirIn',DIR);
await p.waitForTimeout(600);const busy=await p.evaluate(()=>!!document.querySelector('#sprog'));
await p.waitForFunction(()=>!START.prog&&realCount()>0&&!document.querySelector('#sprog'),null,{timeout:180000});
const n=await p.evaluate(()=>realCount());console.log(`   ${n} foto importate in ${((Date.now()-t0)/1000).toFixed(1)} s`);
ok(busy||n<40,'durante l’importazione la schermata mostra il progresso');
const sg=await p.evaluate(()=>({theme:BOOK.theme.id,sugg:START.sugg,title:WZ.title,sub:$('#sSub').placeholder,est:estimatePages(),cta:$('#sbar .btn.pri').textContent,sum:$('#sbar .ssum').textContent}));
console.log('   suggerimenti:',JSON.stringify(sg));
ok(sg.cta.startsWith('Crea il fotolibro'),'dopo l’importazione il pulsante è «Crea il fotolibro»');
const cta=await p.locator('#sbar .btn.pri').boundingBox();ok(cta&&cta.y+cta.height<=900,'pulsante Crea visibile senza scorrere');
await p.screenshot({path:OUT+'/f1-start.png'});
console.log('2. Creazione (Ctrl+Invio)');
await p.keyboard.press('Control+Enter');await p.waitForFunction(()=>!START.open,null,{timeout:60000});
await p.waitForFunction(()=>document.querySelector('#prog').hidden,null,{timeout:120000});await p.waitForTimeout(500);
const bk=await p.evaluate(()=>({pages:bookPages(),used:usage().size,banner:!$('#banner').hidden,fx:effectIdx(),title:BOOK.spreads[0].texts.map(t=>t.text)}));
console.log('   ',JSON.stringify(bk));
ok(bk.pages===sg.est.total||(bk.fx>=0&&Math.abs(bk.pages-sg.est.total)<=2),`stima pagine corretta (${sg.est.total} stimate, ${bk.pages} create)`);
ok(bk.banner,'banner «Il libro è pronto» con i passi successivi');
ok(bk.title.some(t=>t===sg.title),'titolo suggerito in copertina');
await p.screenshot({path:OUT+'/f2-editor.png'});
console.log('3. Tutti i temi');
const th=await p.evaluate(async()=>{const out=[];const cv=document.createElement('canvas');cv.width=600;cv.height=220;const x=cv.getContext('2d');
  for(const t of THEMES){try{applyTheme(t.id);commit();for(const sp of BOOK.spreads){x.clearRect(0,0,600,220);renderSpread(x,sp,{s:600/spW(sp)*.95,ox:5,oy:5,bleed:0});}
    const cover=BOOK.spreads.find(isCover);out.push([t.id,true,cover.texts.length,BOOK.spreads.filter(isEnd).length]);}catch(e){out.push([t.id,false,e.message]);}}
  return out;});
for(const r of th)ok(r[1],`tema ${r[0]}: tutte le pagine disegnate${r[1]?'':' — '+r[2]}`);
console.log('4. Pagine speciali e ridistribuzione');
const sp=await p.evaluate(()=>{applyTheme('matrimonio');commit();const res=[];const cnt=()=>usage().size;
  const inner=()=>BOOK.spreads.map((s,i)=>[s,i]).filter(([s])=>isInner(s)&&!isSpecial(s,'L')&&!isSpecial(s,'R')&&s.cells.some(c=>c.ph));
  for(const [k] of SPECIALS)for(const where of ['replace','after']){const before=cnt();const t=inner();const [s,i]=t[Math.floor(t.length/2)];goSpread(i);UI.side='R';
    try{placeSpecial(k,where,{quote:themeQuotes()[0],text:'Prova dedica'});res.push([k,where,before,cnt()]);}catch(e){res.push([k,where,before,'ERR '+e.message]);}}
  return res;});
for(const [k,w,a,c] of sp)ok(a===c,`${k} (${w==='replace'?'al posto della pagina':'nuova doppia'}): foto ${a} → ${c}`);
const del=await p.evaluate(async()=>{const before=usage().size,snap=JSON.stringify(BOOK.spreads.map(s=>s.cells.map(c=>c.ph&&c.ph.img)));
  const i=BOOK.spreads.findIndex((s,j)=>isInner(s)&&j>3&&s.cells.some(c=>c.ph));goSpread(i);
  const btn=[...document.querySelectorAll('#pbar button')].find(b=>b.textContent.trim()==='Elimina');btn.click();const armed=btn.textContent;btn.click();
  const afterDel=usage().size,n1=BOOK.spreads.length;undo();const back=JSON.stringify(BOOK.spreads.map(s=>s.cells.map(c=>c.ph&&c.ph.img)))===snap;return{before,armed,afterDel,back};});
ok(del.armed.includes('Confermi'),'Elimina chiede conferma');
ok(del.before===del.afterDel,`doppia eliminata: foto ${del.before} → ${del.afterDel}`);ok(del.back,'Annulla ripristina esattamente il libro');
console.log('5. Tastiera');
const kb=await p.evaluate(()=>{sel=null;goSpread(2);return UI.cur;});await p.locator('#cv').click({position:{x:3,y:3}});await p.keyboard.press('PageDown');
ok(await p.evaluate(()=>UI.cur)===kb+1,'PagGiù va alla doppia successiva');
await p.keyboard.press('Tab');ok(await p.evaluate(()=>document.activeElement!==document.body),'il fuoco si sposta con Tab');
console.log('6. Export');
const ex=await p.evaluate(async()=>{EXP.dpi=150;openExport('print');await runExport('print');const o=[];
  for(const r of RESULTS){const u=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));o.push([r.name,btoa(s)]);}
  $('#dlg').close();DRAFT.dpi=80;await runExport('draft');for(const r of RESULTS){const u=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));o.push([r.name,btoa(s)]);}
  $('#dlg').close();return{files:o,N:bookPages(),ir:interiorRange()};});
for(const [nm,d] of ex.files)writeFileSync(OUT+'/'+nm,Buffer.from(d,'base64'));
writeFileSync(OUT+'/export.json',JSON.stringify({N:ex.N,ir:ex.ir,files:ex.files.map(f=>f[0])}));
console.log('   file:',ex.files.map(f=>f[0]).join(', '));
console.log('7. Salva e riapri');
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#bSave')]);const pf=OUT+'/progetto.fotolibro.json';await dl.saveAs(pf);
const before=await p.evaluate(()=>({sp:BOOK.spreads.length,theme:BOOK.theme.id,used:usage().size}));
await p.reload();await p.waitForSelector('#start:not([hidden])');const tl=Date.now();await p.setInputFiles('#projIn',pf);
await p.waitForFunction(()=>$('#toast').textContent.includes('Progetto aperto'),null,{timeout:60000});console.log(`   riaperto in ${((Date.now()-tl)/1000).toFixed(1)} s`);
const after=await p.evaluate(()=>({sp:BOOK.spreads.length,theme:BOOK.theme.id,used:usage().size}));
ok(JSON.stringify(before)===JSON.stringify(after),`progetto riaperto uguale (${JSON.stringify(after)})`);
console.log('8. Dimensioni della finestra');
for(const [w,h] of [[1024,768],[1280,720],[1366,768],[1920,1080]]){await p.setViewportSize({width:w,height:h});await p.waitForTimeout(400);
  const r=await p.evaluate(()=>{const pr=$('#bPrint').getBoundingClientRect();return{print:pr.right<=innerWidth&&pr.width>0,over:document.documentElement.scrollWidth-innerWidth};});
  ok(r.print&&r.over<=0,`${w}×${h}: «Stampa» visibile, nessuno scorrimento orizzontale`);
  await p.evaluate(()=>openStart());await p.waitForTimeout(300);const c=await p.locator('#sbar .btn.pri').boundingBox();ok(c&&c.y+c.height<=h&&c.x+c.width<=w,`${w}×${h}: pulsante Crea visibile nella schermata iniziale`);
  await p.screenshot({path:`${OUT}/f-start-${w}.png`});await p.evaluate(()=>closeStart());}
ok(!errs.length,'nessun errore in console'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
console.log(fails.length?`\n${fails.length} CONTROLLI FALLITI`:'\nTUTTI I CONTROLLI SUPERATI');await b.close();process.exit(fails.length?1:0);
