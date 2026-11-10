// Sticker illustrati (SVG da "stickers natale/"): creazione automatica, pannello Decori, libri salvati prima (retroattivo), export.
// Uso: node tests/stickers.mjs <out> <cartella-foto>
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const [,,OUT='tests/out',DIR]=process.argv;mkdirSync(OUT,{recursive:true});
const fails=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails.push(m);};
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('XNNPACK'))errs.push(m.text());});
const url='file://'+process.cwd()+'/dist/fotolibro-studio.html',old='tests/fixtures/natale-senza-sticker-svg.fotolibro.json';
const cnt=()=>p.evaluate(()=>({art:BOOK.spreads.reduce((a,s)=>a+(s.decos||[]).filter(d=>d.art).length,0),manual:BOOK.spreads.reduce((a,s)=>a+(s.decos||[]).filter(d=>!d.auto).length,0),
  banner:$('#banner').hidden?'':$('#banner').textContent}));
console.log('1. Sticker caricati');
await p.goto(url);await p.waitForSelector('#start:not([hidden])');
const a=await p.evaluate(async()=>{await ART_READY;return{n:ART.size,ready:[...ART.values()].filter(x=>x.ready).length,natale:artFor('natale').length,nordico:artFor('nordico').length,neutro:artFor('neutro').length};});
ok(a.n===24&&a.ready===24,`${a.ready}/${a.n} sticker SVG caricati`);ok(a.natale===24&&a.nordico===24&&a.neutro===0,'usati dai temi Natale e Natale nordico, non dagli altri');
console.log('2. Libro salvato prima degli sticker (retroattivo)');
await p.setInputFiles('#projIn',old);await p.waitForFunction(()=>$('#toast').textContent.includes('Progetto aperto'),null,{timeout:30000});await p.waitForTimeout(300);
let c0=await cnt();console.log('   ',JSON.stringify(c0).slice(0,160));
ok(c0.art===0,'il libro vecchio non ha sticker illustrati');
if(c0.banner.includes('foto da ricollegare')){await p.click('#banner >> text=Più tardi');await p.waitForTimeout(200);c0=await cnt();}
ok(c0.banner.includes('Nuovi sticker'),'all’apertura propone i nuovi sticker');
await p.screenshot({path:OUT+'/s1-offerta.png'});
await p.click('#banner >> text=Metti gli sticker');await p.waitForTimeout(500);
const c1=await cnt();ok(c1.art>0,`sticker inseriti: ${c1.art}`);ok(c1.manual===c0.manual,`decorazioni messe a mano conservate (${c0.manual} → ${c1.manual})`);
await p.evaluate(()=>undo());ok((await cnt()).art===0,'Annulla toglie gli sticker');await p.evaluate(()=>redo());ok((await cnt()).art===c1.art,'Ripeti li rimette');
await p.evaluate(()=>{const i=BOOK.spreads.findIndex(s=>(s.decos||[]).some(d=>d.art));goSpread(i);});await p.waitForTimeout(500);await p.screenshot({path:OUT+'/s2-inseriti.png'});
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#bSave')]);const pf=OUT+'/con-sticker.fotolibro.json';await dl.saveAs(pf);
const saved=JSON.parse(readFileSync(pf,'utf8'));const ids=saved.book.spreads.flatMap(s=>(s.decos||[]).filter(d=>d.art).map(d=>d.art));
ok(ids.length===c1.art&&!JSON.stringify(saved).includes('<svg'),'nel progetto salvato solo i riferimenti agli sticker, non i disegni');
await p.reload();await p.waitForSelector('#start:not([hidden])');await p.setInputFiles('#projIn',pf);await p.waitForFunction(()=>$('#toast').textContent.includes('Progetto aperto'),null,{timeout:30000});await p.waitForTimeout(300);
const c2=await cnt();ok(c2.art===c1.art&&!c2.banner.includes('Nuovi sticker'),'riaperto: sticker presenti e nessuna nuova proposta');
console.log('3. «No, grazie» non viene richiesto di nuovo');
await p.reload();await p.waitForSelector('#start:not([hidden])');await p.setInputFiles('#projIn',old);await p.waitForFunction(()=>$('#toast').textContent.includes('Progetto aperto'),null,{timeout:30000});await p.waitForTimeout(300);
if((await cnt()).banner.includes('foto da ricollegare')){await p.click('#banner >> text=Più tardi');await p.waitForTimeout(200);}
await p.click('#banner >> text=No, grazie');await p.waitForTimeout(200);
const [dl2]=await Promise.all([p.waitForEvent('download'),p.click('#bSave')]);const pf2=OUT+'/no-grazie.fotolibro.json';await dl2.saveAs(pf2);
await p.reload();await p.waitForSelector('#start:not([hidden])');await p.setInputFiles('#projIn',pf2);await p.waitForFunction(()=>$('#toast').textContent.includes('Progetto aperto'),null,{timeout:30000});await p.waitForTimeout(300);
let c3=await cnt();if(c3.banner.includes('foto da ricollegare')){await p.click('#banner >> text=Più tardi');await p.waitForTimeout(200);c3=await cnt();}
ok(!c3.banner.includes('Nuovi sticker')&&c3.art===0,'dopo «No, grazie» non lo chiede più');
console.log('4. Libro nuovo e cambio tema');
await p.reload();await p.waitForSelector('#start:not([hidden])');await p.setInputFiles('#dirIn',DIR);await p.waitForFunction(()=>!START.prog&&realCount()>10,null,{timeout:90000});
const nb=await p.evaluate(()=>{START.userTheme=true;applyTheme('neutro');WZ.effect=false;WZ.stickers=2;startCreate();const n0=BOOK.spreads.reduce((a,s)=>a+(s.decos||[]).filter(d=>d.art).length,0);
  applyTheme('natale');commit();syncAll();const n1=BOOK.spreads.reduce((a,s)=>a+(s.decos||[]).filter(d=>d.art).length,0);
  const ser=BOOK.spreads.filter(isInner).map(s=>[...new Set((s.decos||[]).filter(d=>d.art).map(d=>ART.get(d.art).series))]);
  BOOK.theme.artSet='risorsa';regenDecos();const only=BOOK.spreads.every(s=>(s.decos||[]).filter(d=>d.art&&d.auto).every(d=>ART.get(d.art).series==='risorsa'));
  return{n0,n1,mixedInSpread:ser.some(x=>x.length>1),only};});
ok(nb.n0===0,'tema Neutro: nessuno sticker di Natale');ok(nb.n1>0,`passando a Natale gli sticker arrivano da soli (${nb.n1})`);
ok(!nb.mixedInSpread,'ogni doppia usa una sola serie');ok(nb.only,'scelta «Disegnati a mano»: solo quella serie');
await p.evaluate(()=>{UI.tab='deco';goSpread(2);renderLeft();});await p.waitForTimeout(300);
const before=await p.evaluate(()=>cur().decos.length);await p.click('.artg .art >> nth=0');await p.waitForTimeout(200);
ok(await p.evaluate(()=>cur().decos.length)===before+1&&await p.evaluate(()=>sel&&decoById(sel.id)&&!!decoById(sel.id).art),'clic su uno sticker del pannello lo aggiunge e lo seleziona');
await p.screenshot({path:OUT+'/s3-pannello.png'});
console.log('5. Export con gli sticker');
const ex=await p.evaluate(async()=>{EXP.dpi=150;openExport('print');await runExport('print');const r=RESULTS.map(r=>[r.name,r.blob.size]);$('#dlg').close();DRAFT.dpi=80;await runExport('draft');$('#dlg').close();return r.concat(RESULTS.map(r=>[r.name,r.blob.size]));});
ok(ex.length>=4&&ex.every(([,s])=>s>1000),'stampa e bozza esportate: '+ex.map(e=>e[0].split('_').pop()).join(', '));
ok(!errs.length,'nessun errore in console'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
console.log(fails.length?`\n${fails.length} CONTROLLI FALLITI`:'\nTUTTI I CONTROLLI SUPERATI');await b.close();process.exit(fails.length?1:0);
