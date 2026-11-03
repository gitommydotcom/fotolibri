// Flusso reale: scelta cartella → tema → crea → modifica → salva/riapri progetto.
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');
import {mkdirSync} from 'node:fs';
const [,,OUT='tests/out',DIR]=process.argv;mkdirSync(OUT,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:950},acceptDownloads:true});
const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('file://'+process.cwd()+'/dist/fotolibro-studio.html');await p.waitForSelector('#start:not([hidden])');
await p.setInputFiles('#dirIn',DIR);
await p.waitForFunction(()=>realCount()>=22,null,{timeout:60000});await p.waitForTimeout(800);
await p.click('.sthemes .thc:has-text("Natale")');await p.waitForTimeout(600);
await p.fill('.scol:nth-child(3) input.inp >> nth=0','Il nostro Natale');
await p.fill('.scol:nth-child(3) input.inp >> nth=2','Per la nonna Maria, con tanto amore');
await p.screenshot({path:OUT+'/10-start-filled.png'});
await p.click('text=Crea il fotolibro');await p.waitForTimeout(1200);
const info=await p.evaluate(()=>({spreads:BOOK.spreads.map(s=>s.kind),inner:innerPages(),chapters:BOOK.chapters.map(c=>c.title),start:START.open,texts:BOOK.spreads.flatMap(s=>s.texts.map(t=>t.role+':'+t.text)).slice(0,14)}));
console.log(JSON.stringify(info,null,1));
await p.screenshot({path:OUT+'/11-editor.png'});
for(const t of ['theme','layout','text','deco','book','photos']){await p.click(`#tabs button[data-t="${t}"]`);await p.waitForTimeout(250);await p.screenshot({path:`${OUT}/12-tab-${t}.png`});}
// seleziona una foto e una decorazione
await p.evaluate(()=>goSpread(2));await p.waitForTimeout(300);
const box=await p.locator('#cv').boundingBox();await p.mouse.click(box.x+box.width*0.72,box.y+box.height*0.5);await p.waitForTimeout(300);await p.screenshot({path:OUT+'/13-cellprops.png'});
await p.evaluate(()=>{UI.tab='deco';renderLeft();});await p.click('.motifs .mt >> nth=0');await p.waitForTimeout(300);await p.screenshot({path:OUT+'/14-decoprops.png'});
// cambio tema dopo la creazione
await p.evaluate(()=>{applyTheme('valentino');commit();syncAll();goSpread(0);});await p.waitForTimeout(400);await p.screenshot({path:OUT+'/15-retheme.png'});
await p.evaluate(()=>{undo();});await p.waitForTimeout(300);
const th=await p.evaluate(()=>BOOK.theme.id);console.log('after undo theme',th);
// wizard
await p.click('#bWizard');await p.waitForTimeout(300);await p.screenshot({path:OUT+'/16-wizard.png'});await p.keyboard.press('Escape');
// salva e riapri progetto
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#bSave')]);const pf=OUT+'/'+dl.suggestedFilename();await dl.saveAs(pf);
await p.reload();await p.waitForSelector('#start:not([hidden])');await p.waitForTimeout(800);
await p.screenshot({path:OUT+'/17-start-resume.png'});
await p.setInputFiles('#projIn',pf);await p.waitForTimeout(1500);
const r=await p.evaluate(()=>({n:realCount(),theme:BOOK.theme.id,inner:innerPages(),miss:[...LIB.values()].filter(e=>!e.file).length,start:START.open}));console.log('reopened',r);
await p.screenshot({path:OUT+'/18-reopened.png'});
console.log('ERRORS',errs);await b.close();
