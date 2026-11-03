/* ============ esportazione: bozza per il cliente e file per la stampa ============ */
UI.expTab='draft';
let RESULTS=[],expCancel=false,exporting=false;
function openExport(tab){if(tab)UI.expTab=tab;RESULTS=[];
  const ir=interiorRange();EXP.from=ir[0];EXP.to=ir[1];
  if(EXP.name==='fotolibro'&&BOOK.job.name&&BOOK.job.name!=='Nuovo fotolibro')EXP.name=DRAFT.name=safeName(BOOK.job.name);
  renderExport();if(!$('#dlg').open)$('#dlg').showModal();}
/* ---------- problemi ---------- */
function bookIssues(){
  const low=[],empty=[];const miss=new Set();
  BOOK.spreads.forEach((sp,i)=>sp.cells.forEach(c=>{
    if(!c.ph){if(!c.fill)empty.push({i,side:c.side});return;}
    const e=LIB.get(c.ph.img);if(!e||(!e.file&&!e.sample))miss.add(c.ph.img);
    const d=effDpi(sp,c);if(d!=null&&d<200)low.push({i,side:c.side,d,name:e?e.name:''});}));
  const txt=[];BOOK.spreads.forEach((sp,i)=>sp.texts.forEach(t=>{const pr=textProblem(sp,t);if(pr)txt.push({i,pr,t});}));
  low.sort((a,b)=>a.d-b.d);return{low,empty,miss,txt};
}
function issueList(forPrint){
  const{low,empty,miss,txt}=bookIssues(),ws=[],go=i=>()=>{$('#dlg').close();goSpread(i);};
  const L=(cls,...k)=>el('div',{},el('span',{class:cls},'●'),el('span',{},...k));
  if(txt.length)ws.push(L('e',`${txt.length} ${txt.length>1?'testi':'testo'} a rischio taglio: “${String(txt[0].t.text).split('\n')[0].slice(0,30)}” ${txt[0].pr}, in `,el('button',{type:'button',class:'linkb',onclick:()=>{$('#dlg').close();goSpread(txt[0].i);sel={type:'text',id:txt[0].t.id};syncAll();}},spreadLabel(txt[0].i)),'.'));
  const ip=printPages();if(forPrint&&ip%4)ws.push(L('w',`Interno: ${ip} pagine. Molte tipografie vogliono un multiplo di 4.`));
  if(forPrint&&miss.size)ws.push(L('e',`${miss.size} foto senza originale: verrebbero stampate dall’anteprima (bassa qualità). `,el('button',{type:'button',class:'linkb',onclick:()=>$('#dirIn').click()},'Ricollega la cartella')));
  if(forPrint&&low.length)ws.push(L('w',`${low.length} foto sotto i 200 dpi, la peggiore ${Math.round(low[0].d)} dpi in `,el('button',{type:'button',class:'linkb',onclick:go(low[0].i)},pageLabel(low[0].i,low[0].side)),'.'));
  if(empty.length)ws.push(L('w',`${empty.length} riquadri vuoti, il primo in `,el('button',{type:'button',class:'linkb',onclick:go(empty[0].i)},pageLabel(empty[0].i,empty[0].side)),'.'));
  if(!ws.length)ws.push(L('o',forPrint?'Nessun problema: risoluzione buona, testi al sicuro, nessun riquadro vuoto.':'Nessun problema trovato.'));
  return el('div',{class:'warnl'},...ws);
}
/* ---------- pagine della bozza (ordine di lettura) ---------- */
function readingPages(){
  /* ogni elemento: {sp, x,y,w,h (mm), label} — singole facciate come le vede il cliente */
  const out=[],cov=BOOK.spreads.find(isCover);
  if(cov){const R=pageBox(cov,'R');out.push({sp:cov,x:R.x,y:0,w:R.w,h:pgH(cov),label:'Copertina'});}
  for(const sp of BOOK.spreads){if(isCover(sp))continue;
    const i=BOOK.spreads.indexOf(sp);
    for(const side of['L','R']){const V=visBox(sp,side);out.push({sp,x:V.x,y:V.y,w:V.w,h:V.h,label:isEnd(sp)?(sp.kind==='endF'?'Risguardo anteriore':'Risguardo posteriore'):pageLabel(i,side)});}}
  if(cov){const L=pageBox(cov,'L');out.push({sp:cov,x:L.x,y:0,w:L.w,h:pgH(cov),label:'Retro di copertina'});}
  return out;
}
function draftSpreads(){
  return BOOK.spreads.map((sp,i)=>{if(isEnd(sp)){const V=visBox(sp,'S');return{sp,x:V.x,y:V.y,w:V.w,h:V.h,label:pageLabel(i,'S')};}
    return{sp,x:0,y:0,w:spW(sp),h:pgH(sp),label:isCover(sp)?'Copertina (retro · dorso · fronte)':'Pagine '+spreadLabel(i)};});
}
function watermark(ctx,W,H,text){if(!text)return;ctx.save();ctx.translate(W/2,H/2);ctx.rotate(-Math.atan2(H,W));
  const fs=Math.min(W,H)*.16;ctx.font=`700 ${fs}px "Montserrat",Arial,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';try{ctx.letterSpacing=(fs*.12)+'px';}catch(e){}
  ctx.fillStyle='rgba(255,255,255,.22)';ctx.strokeStyle='rgba(0,0,0,.16)';ctx.lineWidth=Math.max(1,fs*.015);ctx.fillText(text,0,0);ctx.strokeText(text,0,0);ctx.restore();}
async function renderDraftItem(it,pxmm){
  const c=await renderRegion(it.sp,it.x,it.y,it.w,it.h,pxmm,'draft');
  if(DRAFT.wm)watermark(c.getContext('2d'),c.width,c.height,DRAFT.wmText);
  return c;}
async function canvasJpeg(c,q,dpi){const blob=await toBlob(c,'image/jpeg',q);const head=setJfifDpi(new Uint8Array(await blob.slice(0,20).arrayBuffer()),dpi||72);return new Blob([head,blob.slice(20)],{type:'image/jpeg'});}
/* ---------- flipbook ---------- */
async function flipbookPages(maxW,onProg,asURL){
  const pages=readingPages(),out=[];const pw=BOOK.page.w,ph=BOOK.page.h;
  for(let i=0;i<pages.length;i++){if(expCancel)throw new Error('annullato');
    const it=pages[i],pxmm=Math.min(maxW/it.w,maxW*(ph/pw)/it.h);
    const c=await renderDraftItem(it,pxmm);
    const b=await toBlob(c,'image/jpeg',DRAFT.quality/100);c.width=c.height=0;
    out.push({label:it.label,src:asURL?URL.createObjectURL(b):'data:image/jpeg;base64,'+b64(new Uint8Array(await b.arrayBuffer())),size:b.size});
    onProg&&onProg(i+1,pages.length);await sleep(0);}
  return out;
}
async function previewFlipbook(){
  const d=$('#flipDlg');d.showModal();const fr=$('#flipFrame');fr.srcdoc='<p style="font:14px sans-serif;color:#888;text-align:center;margin-top:40vh">Preparo l’anteprima…</p>';
  try{expCancel=false;const pages=await flipbookPages(900,null,true);
    fr.srcdoc=flipbookHTML({title:BOOK.job.name&&BOOK.job.name!=='Nuovo fotolibro'?BOOK.job.name:coverTitle(),pages,aspect:BOOK.page.w/BOOK.page.h,wm:false,embedded:true});
    d.addEventListener('close',()=>pages.forEach(p=>URL.revokeObjectURL(p.src)),{once:true});}
  catch(e){console.error(e);fr.srcdoc='<p>Anteprima non riuscita.</p>';}
}
function coverTitle(){const c=BOOK.spreads.find(isCover);const t=c&&c.texts.find(t=>t.role==='cover-title');return t?t.text:'Fotolibro';}
/* ---------- stampa ---------- */
function expGeom(bleed){const b=bleed,off=Math.max(b,3),mlen=5,ext=EXP.marks?off+mlen+1:b,k=EXP.dpi/25.4;return{b,off,mlen,ext,k};}
function printJobs(){
  const out=[],P=BOOK.page,E=BOOK.endp,V=versoOn();
  const cov=BOOK.spreads.find(isCover),eF=BOOK.spreads.find(s=>s.kind==='endF'),eB=BOOK.spreads.find(s=>s.kind==='endB');
  if(cov&&EXP.cover)out.push({sp:cov,file:'copertina',x:0,w:spW(cov),bleed:EXP.bleed+BOOK.cover.wrap,sides:null,label:'copertina'});
  if(E.on&&EXP.endp){const fi=firstInnerIdx(),li=lastInnerIdx(),N=bookPages();
    if(eF)out.push({sp:eF,file:'risguardi',x:0,w:spW(eF),bleed:E.bleed,sides:null,label:'risguardi-pag2-3',title:'Risguardo anteriore (pag. 2–3)'});
    if(V&&fi>=0)out.push({verso:true,src:BOOK.spreads[fi],srcSide:'L',sheet:eF||mkSpread('endF'),side:E.sideF||'L',file:'risguardi',label:'risguardi-pag4',title:'Retro del risguardo (pag. 4)'});
    if(V&&li>=0)out.push({verso:true,src:BOOK.spreads[li],srcSide:'R',sheet:eB||mkSpread('endB'),side:E.sideB||'R',file:'risguardi',label:`risguardi-pag${N-3}`,title:`Retro del risguardo (pag. ${N-3})`});
    if(eB)out.push({sp:eB,file:'risguardi',x:0,w:spW(eB),bleed:E.bleed,sides:null,label:`risguardi-pag${N-2}-${N-1}`,title:`Risguardo posteriore (pag. ${N-2}–${N-1})`});}
  if(EXP.inner)BOOK.spreads.forEach((sp,i)=>{if(!isInner(sp))return;
    const a=pageNum(i,'L'),b=a+1,inR=n=>n>=EXP.from&&n<=EXP.to,okL=!isVerso(i,'L')&&inR(a),okR=!isVerso(i,'R')&&inR(b);
    if(EXP.pages==='single'||!okL||!okR){
      if(okL)out.push({sp,file:'interno',x:0,w:P.w,sides:['L','S'],bleed:EXP.bleed,label:'p'+pad3(a),pg:a});
      if(okR)out.push({sp,file:'interno',x:P.w,w:P.w,sides:['R','S'],bleed:EXP.bleed,label:'p'+pad3(b),pg:b});}
    else out.push({sp,file:'interno',x:0,w:spW(sp),sides:null,bleed:EXP.bleed,label:`p${pad3(a)}-${pad3(b)}`,pg:a});});
  return out;
}
function interiorRange(){const s=[];BOOK.spreads.forEach((sp,i)=>{if(!isInner(sp))return;for(const side of['L','R'])if(!isVerso(i,side))s.push(pageNum(i,side));});return s.length?[s[0],s[s.length-1]]:[1,1];}
/* pag. 4 / terzultima: la pagina interna impaginata sul foglio dei risguardi, nella metà indicata */
async function renderVersoJob(j){
  const sh=j.sheet,E=BOOK.endp,g=expGeom(E.bleed),PH=pgH(sh),SW=spW(sh),W=Math.round((SW+2*g.ext)*g.k),H=Math.round((PH+2*g.ext)*g.k);
  const src=j.src,P=BOOK.page,half=pageBox(sh,j.side),vis=visBox(sh,j.side),sb=pageBox(src,j.srcSide);
  const map=await loadOriginals(src),fxmap=await loadCutouts(src,true);await loadSpreadFonts(src);
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.imageSmoothingQuality='high';
  /* zona: metà foglio (con abbondanza verso l'esterno), senza superare la piega */
  const atLeft=half.x<=.01,x0=atLeft?-g.b:half.x,x1=atLeft?half.x+half.w:SW+g.b;
  ctx.save();ctx.beginPath();ctx.rect((g.ext+x0)*g.k,(g.ext-g.b)*g.k,(x1-x0)*g.k,(PH+2*g.b)*g.k);ctx.clip();
  ctx.fillStyle=bgOf(src,j.srcSide);ctx.fillRect(0,0,W,H);
  /* la pagina va con il lato della rilegatura sulla piega del foglio */
  const bindLeft=j.srcSide==='R',px=bindLeft?vis.x:vis.x+vis.w-P.w,py=vis.y,ext=Math.max(8,Math.min(60,Math.max(vis.x-half.x,half.x+half.w-vis.x-vis.w,vis.y)+g.b));
  ctx.beginPath();ctx.rect((g.ext+(bindLeft?px:px-ext))*g.k,(g.ext+py-ext)*g.k,(P.w+ext)*g.k,(P.h+2*ext)*g.k);ctx.clip();
  renderSpread(ctx,src,{s:g.k,ox:(g.ext+px-sb.x)*g.k,oy:(g.ext+py)*g.k,bleed:ext,spineBleed:false,q:'full',map,fxmap,sides:[j.srcSide]});
  ctx.restore();
  if(EXP.marks){drawMarks(ctx,g,SW,PH);const X=(g.ext+foldX(sh))*g.k;ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,.1*g.k);ctx.beginPath();
    ctx.moveTo(X,(g.ext-g.off-g.mlen)*g.k);ctx.lineTo(X,(g.ext-g.off)*g.k);ctx.moveTo(X,(g.ext+PH+g.off)*g.k);ctx.lineTo(X,(g.ext+PH+g.off+g.mlen)*g.k);ctx.stroke();ctx.restore();}
  for(const s of map.values())closeSrc(s);
  return{canvas:c,pw:W,ph:H,Wmm:SW+2*g.ext,Hmm:PH+2*g.ext,ext:g.ext,b:g.b};
}
async function renderJobCanvas(j){
  if(j.verso)return renderVersoJob(j);
  const PH=pgH(j.sp),g=expGeom(j.bleed),W=Math.round((j.w+2*g.ext)*g.k),H=Math.round((PH+2*g.ext)*g.k);
  if(W*H>260e6)throw new Error('troppo grande');
  const map=await loadOriginals(j.sp),fxmap=await loadCutouts(j.sp,true);await loadSpreadFonts(j.sp);
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.imageSmoothingQuality='high';
  ctx.save();ctx.beginPath();ctx.rect((g.ext-g.b)*g.k,(g.ext-g.b)*g.k,(j.w+2*g.b)*g.k,(PH+2*g.b)*g.k);ctx.clip();
  renderSpread(ctx,j.sp,{s:g.k,ox:(g.ext-j.x)*g.k,oy:g.ext*g.k,bleed:g.b,spineBleed:!!j.sides,q:'full',map,fxmap,sides:j.sides});
  ctx.restore();
  if(EXP.marks){drawMarks(ctx,g,j.w,PH);
    if(isCover(j.sp)||isEnd(j.sp)){const xs=isCover(j.sp)?[coverPW(),coverPW()+BOOK.cover.spine]:[foldX(j.sp)];
      ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,.1*g.k);ctx.beginPath();
      for(const x of xs){const X=(g.ext+x)*g.k;ctx.moveTo(X,(g.ext-g.off-g.mlen)*g.k);ctx.lineTo(X,(g.ext-g.off)*g.k);ctx.moveTo(X,(g.ext+PH+g.off)*g.k);ctx.lineTo(X,(g.ext+PH+g.off+g.mlen)*g.k);}
      ctx.stroke();ctx.restore();}}
  for(const s of map.values())closeSrc(s);
  return{canvas:c,pw:W,ph:H,Wmm:j.w+2*g.ext,Hmm:PH+2*g.ext,ext:g.ext,b:g.b};
}
async function renderJob(j,fmt,onProg){
  const r=await renderJobCanvas(j);let blob;
  if(fmt==='cmyk')blob=await encodeCmykJpeg(r.canvas,EXP.quality,EXP.dpi,onProg);
  else blob=await canvasJpeg(r.canvas,EXP.quality/100,EXP.dpi);
  r.canvas.width=r.canvas.height=0;delete r.canvas;return{...r,blob};
}
function specSheet(){
  const P=BOOK.page,C=BOOK.cover,E=BOOK.endp,cov=BOOK.spreads.find(isCover),L=[];
  L.push(`FOTOLIBRO STUDIO · scheda tecnica`,`Lavoro: ${BOOK.job.name}`,`Data: ${new Date().toLocaleString('it-IT')}`,`Tema: ${TH().name}`,'');
  L.push(`Formato pagina rifilata: ${nf(P.w)} × ${nf(P.h)} mm`,`Pagine del libro: ${bookPages()}`,`Abbondanza interno: ${nf(EXP.bleed)} mm`,`Risoluzione: ${EXP.dpi} dpi · JPEG q${EXP.quality} · RGB`,'');
  if(cov)L.push(`Copertina aperta (rifilata): ${nf(spW(cov))} × ${nf(pgH(cov))} mm`,`  dorso ${nf(C.spine)} mm · cartone +${nf(C.over)} mm/lato · risvolto ${nf(C.wrap)} mm + abbondanza ${nf(EXP.bleed)} mm`,
    `  file copertina: ${nf(spW(cov)+2*(C.wrap+EXP.bleed))} × ${nf(pgH(cov)+2*(C.wrap+EXP.bleed))} mm`,'');
  if(E.on){const N=bookPages();L.push(`Risguardi: fogli ${nf(E.w)} × ${nf(E.h)} mm (+${nf(E.bleed)} mm abbondanza), piega a ${nf(E.fold)} mm da sinistra`);
    if(versoOn())L.push(`  PDF di 4 pagine: 1) pag. 2–3 · 2) pag. 4 sul lato ${E.sideF==='R'?'destro':'sinistro'} · 3) pag. ${N-3} sul lato ${E.sideB==='L'?'sinistro':'destro'} · 4) pag. ${N-2}–${N-1}`,'');
    else L.push('  PDF di 2 pagine: risguardo anteriore e posteriore','');}
  const ir=interiorRange();L.push(`Interno: pag. ${ir[0]}–${ir[1]} (${printPages()} pagine)`,`Copertina: ${EXP.covFmt==='cmyk'?'JPEG CMYK · '+(CMYK?CMYK.name:'ISO Coated v2 (ECI) · FOGRA39'):EXP.covFmt==='jpg'?'JPEG RGB':'PDF RGB'} · ${EXP.dpi} dpi`,'');
  return L.join('\r\n');
}
/* ---------- esecuzione ---------- */
async function runExport(kind){
  if(exporting)return;exporting=true;expCancel=false;RESULTS=[];renderExport();
  const pb=$('#eProgB'),pl=$('#eProgL'),prog=(t,a,b)=>{pl.textContent=t;pb.style.width=(b?100*a/b:0)+'%';};
  try{
    if(kind==='draft'){
      const name=safeName(DRAFT.name)||'fotolibro';
      if(DRAFT.pdf){const items=DRAFT.pages==='spread'?draftSpreads():readingPages(),pages=[];const pxmm=DRAFT.dpi/25.4;
        for(let i=0;i<items.length;i++){if(expCancel)throw new Error('annullato');prog(`Bozza PDF · ${items[i].label} · ${i+1} di ${items.length}`,i,items.length);await sleep(5);
          const c=await renderDraftItem(items[i],pxmm),blob=await canvasJpeg(c,DRAFT.quality/100,DRAFT.dpi);
          pages.push({blob,pw:c.width,ph:c.height,Wmm:items[i].w,Hmm:items[i].h,ext:0,b:0});c.width=c.height=0;}
        RESULTS.push({name:`${name}_bozza.pdf`,blob:buildPDF(pages)});}
      if(DRAFT.flip){const pages=await flipbookPages(Math.round(BOOK.page.w/25.4*DRAFT.dpi*1.1),(a,b)=>prog(`Flipbook · pagina ${a} di ${b}`,a,b));
        prog('Creo il flipbook…',1,1);
        const html=flipbookHTML({title:coverTitle(),pages,aspect:BOOK.page.w/BOOK.page.h,wm:false});
        RESULTS.push({name:`${name}_sfogliabile.html`,blob:new Blob([html],{type:'text/html'})});}
    }else{
      const jobs=printJobs();if(!jobs.length)throw new Error('vuoto');
      const name=safeName(EXP.name)||'fotolibro',done=[],files=[];
      if(jobs.some(j=>j.file==='copertina')&&EXP.covFmt==='cmyk')await cmykInit();
      for(let i=0;i<jobs.length;i++){if(expCancel)throw new Error('annullato');
        const j=jobs[i],fmt=j.file==='copertina'?(EXP.covFmt==='cmyk'?'cmyk':'rgb'):'rgb',lab=j.title||(j.file==='copertina'?'Copertina':`Pagina ${j.pg}`);
        prog(`${lab} · ${i+1} di ${jobs.length}`,i,jobs.length);await sleep(5);
        const r=await renderJob(j,fmt,f=>prog(`${lab} · conversione CMYK FOGRA39 ${Math.round(f*100)}%`,i+f,jobs.length));
        if(j.file==='copertina'&&EXP.covFmt!=='pdf'){files.push({name:`${name}_copertina${fmt==='cmyk'?'_CMYK-FOGRA39':''}.jpg`,blob:r.blob});continue;}
        done.push({...r,job:j});}
      prog('Creo i file…',1,1);await sleep(5);
      const part=EXP.inner&&(()=>{const ir=interiorRange();return EXP.from>ir[0]||EXP.to<ir[1];})(),suf=part?`_p${pad3(EXP.from)}-${pad3(EXP.to)}`:'';
      for(const f of['copertina','risguardi','interno']){const d=done.filter(x=>x.job.file===f);if(!d.length)continue;
        const fm=f==='risguardi'?EXP.endFmt:f==='interno'?EXP.fmt:'pdf';
        if(fm==='pdf')files.push({name:`${name}_${f}${f==='interno'?suf:''}.pdf`,blob:buildPDF(d)});
        else d.forEach(x=>files.push({name:`${name}_${f==='interno'?'interno_'+x.job.label:x.job.label}.jpg`,blob:x.blob}));}
      done.length=0;
      if(EXP.zipAll||files.length>4){files.push({name:`${name}_scheda-tecnica.txt`,blob:new Blob([specSheet()],{type:'text/plain'})});
        RESULTS.push({name:`${name}_stampa.zip`,blob:await buildZip(files)});}
      else RESULTS.push(...files);
    }
    prog('Fatto',1,1);
    download(RESULTS[0].blob,RESULTS[0].name);
    toast(RESULTS.length>1?'Primo file in download: scarica gli altri dalla finestra':'File in download nella cartella Download',5000);
  }catch(err){if(err.message==='annullato')toast('Esportazione annullata');else if(err.message==='vuoto')toast('Scegli almeno un file da creare');else{console.error(err);toast('Esportazione non riuscita: prova una risoluzione più bassa.',4500);}}
  finally{exporting=false;renderExport();}
}
/* ---------- finestra ---------- */
function renderExport(){
  const F=$('#expForm'),tab=UI.expTab,P=BOOK.page,ip=innerPages();
  const on=v=>tab===v?'on':'';
  const head=el('div',{class:'dlg-h'},'Esporta',el('div',{class:'seg etabs'},
    el('button',{type:'button',class:on('draft'),onclick:()=>{UI.expTab='draft';RESULTS=[];renderExport();}},'1 · Bozza per il cliente'),
    el('button',{type:'button',class:on('print'),onclick:()=>{UI.expTab='print';RESULTS=[];renderExport();}},'2 · File per la stampa')));
  const ck=(obj,key,lab,sub)=>el('label',{class:'opt'+(obj[key]?' on':'')},el('input',{type:'checkbox',checked:obj[key],onchange:e=>{obj[key]=e.target.checked;renderExport();}}),el('span',{},el('b',{},lab),sub?el('small',{},sub):null));
  const sel2=(obj,key,lab,opts,num)=>el('label',{class:'lbl'},el('span',{},lab),el('select',{onchange:e=>{obj[key]=num?+e.target.value:e.target.value;renderExport();}},...opts.map(([v,l])=>el('option',{value:v,selected:String(obj[key])===String(v)},l))));
  let body;
  if(tab==='draft'){
    const n=readingPages().length;
    body=[el('div',{class:'dlg-s'},'Da mandare al cliente per l’approvazione: file leggeri, a bassa risoluzione, con la scritta BOZZA. Si apre su computer, tablet e telefono.'),
      el('div',{class:'opts'},ck(DRAFT,'pdf','PDF semplice',DRAFT.pages==='spread'?`${BOOK.spreads.length} pagine PDF, una per doppia pagina`:`${n} pagine PDF, una per facciata`),
        ck(DRAFT,'flip','Flipbook sfogliabile',`un file .html con ${n} pagine che si girano come un libro vero`)),
      el('div',{class:'row2'},sel2(DRAFT,'dpi','Qualità',[[90,'Leggera · per email'],[120,'Media · consigliata'],[160,'Alta']],true),
        sel2(DRAFT,'pages','Il PDF mostra',[['spread','Doppie pagine aperte'],['single','Pagine singole']])),
      el('div',{class:'row2'},el('label',{class:'chk'},el('input',{type:'checkbox',checked:DRAFT.wm,onchange:e=>{DRAFT.wm=e.target.checked;renderExport();}}),'Scritta in filigrana'),
        el('input',{class:'inp',value:DRAFT.wmText,disabled:!DRAFT.wm,'aria-label':'Testo filigrana',oninput:e=>DRAFT.wmText=e.target.value})),
      el('label',{class:'lbl'},el('span',{},'Nome dei file'),el('input',{class:'inp',value:DRAFT.name,oninput:e=>DRAFT.name=e.target.value})),
      issueList(false)];
  }else{
    const cov=BOOK.spreads.find(isCover),E=BOOK.endp,gC=expGeom(EXP.bleed+BOOK.cover.wrap),gE=expGeom(E.bleed),gI=expGeom(EXP.bleed),N=bookPages(),ir=interiorRange(),V=versoOn();
    const dims=(w,h,g)=>`${nf(w+2*g.ext)} × ${nf(h+2*g.ext)} mm`;
    if(EXP.from<ir[0]||EXP.from>ir[1])EXP.from=ir[0];if(EXP.to>ir[1]||EXP.to<EXP.from)EXP.to=ir[1];
    const rng=el('div',{class:'row'},el('span',{class:'u'},'da pag.'),el('input',{type:'number',class:'num','aria-label':'Dalla pagina',min:ir[0],max:ir[1],value:EXP.from,onchange:e=>{EXP.from=clamp(parseInt(e.target.value)||ir[0],ir[0],ir[1]);EXP.to=Math.max(EXP.to,EXP.from);renderExport();}}),
      el('span',{class:'u'},'a pag.'),el('input',{type:'number',class:'num','aria-label':'Alla pagina',min:ir[0],max:ir[1],value:EXP.to,onchange:e=>{EXP.to=clamp(parseInt(e.target.value)||ir[1],EXP.from,ir[1]);renderExport();}}),
      btn('Tutte',()=>{EXP.from=ir[0];EXP.to=ir[1];renderExport();}));
    const covF={cmyk:'JPEG · CMYK FOGRA39',jpg:'JPEG · RGB',pdf:'PDF · RGB'};
    body=[el('div',{class:'dlg-s'},'Tre file per la tipografia. Tutto viene renderizzato dalle foto originali.'),
      el('div',{class:'opts'},
        cov?ck(EXP,'cover','Copertina',`${covF[EXP.covFmt]} · ${EXP.dpi} dpi · retro + dorso + fronte · ${dims(spW(cov),pgH(cov),gC)}`):null,
        E.on?ck(EXP,'endp','Risguardi',V?`PDF di 4 pagine su fogli ${dims(E.w,E.h,gE)}: pag. 2–3 · pag. 4 · pag. ${N-3} · pag. ${N-2}–${N-1}`:`PDF di 2 pagine · ${dims(E.w,E.h,gE)}`):null,
        ck(EXP,'inner','Interno',`PDF · ${EXP.dpi} dpi · pag. ${ir[0]}–${ir[1]} (${printPages()} pagine) · ${EXP.pages==='single'?dims(P.w,P.h,gI)+' ciascuna':'a doppie pagine'}`)),
      el('div',{class:'row3'},
        cov?sel2(EXP,'covFmt','Copertina',[['cmyk','JPEG CMYK FOGRA39'],['jpg','JPEG RGB'],['pdf','PDF RGB']]):el('span'),
        E.on?sel2(EXP,'endFmt','Risguardi',[['pdf','PDF'],['jpg','JPEG']]):el('span'),
        sel2(EXP,'fmt','Interno',[['pdf','PDF'],['jpg','JPEG']])),
      E.on&&V?el('div',{class:'row2'},
        sel2(E,'sideF',`Pag. 4 sul foglio`,[['L','Lato sinistro'],['R','Lato destro']]),
        sel2(E,'sideB',`Pag. ${N-3} sul foglio`,[['L','Lato sinistro'],['R','Lato destro']])):null,
      EXP.inner?el('div',{class:'row2'},sel2(EXP,'pages','Interno come',[['single','Pagine singole'],['spread','Doppie pagine affiancate']]),el('div',{class:'lbl'},el('span',{},'Quali pagine'),rng)):null,
      el('div',{class:'row3'},
        sel2(EXP,'dpi','Risoluzione',[[200,'200 dpi'],[300,'300 dpi · stampa'],[400,'400 dpi']],true),
        sel2(EXP,'quality','Qualità JPEG',[[85,'85'],[92,'92 · consigliata'],[100,'100 · massima']],true),
        sel2(EXP,'bleed','Abbondanza interno e copertina',[[0,'Nessuna'],[2,'2 mm'],[3,'3 mm'],[5,'5 mm']],true)),
      el('div',{class:'row2'},
        el('label',{class:'chk'},el('input',{type:'checkbox',checked:EXP.marks,onchange:e=>{EXP.marks=e.target.checked;renderExport();}}),'Crocini di taglio e piega'),
        el('label',{class:'chk'},el('input',{type:'checkbox',checked:EXP.zipAll,onchange:e=>{EXP.zipAll=e.target.checked;renderExport();}}),'Tutto in un .zip con scheda tecnica')),
      el('label',{class:'lbl'},el('span',{},'Nome dei file'),el('input',{class:'inp',value:EXP.name,oninput:e=>EXP.name=e.target.value})),
      el('p',{class:'u'},`CMYK: profilo ISO Coated v2 (ECI) per FOGRA39, intento colorimetrico relativo con compensazione del punto nero, profilo incorporato nel file. Misure dei risguardi nel pannello Libro (abbondanza ${nf(E.bleed)} mm).`),
      issueList(true)];
  }
  const res=RESULTS.length?el('div',{class:'eres'},el('b',{},RESULTS.length>1?'File pronti':'File pronto'),
    ...RESULTS.map(f=>el('div',{class:'srow'},el('span',{title:f.name},`${f.name} · ${nf(f.blob.size/1048576,1)} MB`),
      el('button',{type:'button',class:'btn sm pri',onclick:e=>{download(f.blob,f.name);e.currentTarget.textContent='Scaricato ✓';}},'Scarica')))):null;
  const prog=el('div',{class:'row',hidden:!exporting},el('div',{class:'pb',style:'flex:1;width:auto'},el('i',{id:'eProgB'})),el('span',{id:'eProgL',class:'u'}));
  const can=tab==='draft'?(DRAFT.pdf||DRAFT.flip):(printJobs().length>0);
  F.replaceChildren(head,el('div',{class:'dlg-b'},...body,res,prog),
    el('div',{class:'dlg-f'},
      tab==='draft'?el('button',{type:'button',class:'btn',disabled:exporting,onclick:()=>previewFlipbook()},'Anteprima sfogliabile'):null,
      el('span',{class:'grow'}),
      el('button',{type:'button',class:'btn',onclick:()=>{if(exporting){expCancel=true;return;}$('#dlg').close();}},exporting?'Annulla':'Chiudi'),
      el('button',{type:'button',class:'btn pri',disabled:exporting||!can,onclick:()=>runExport(tab)},tab==='draft'?'Crea la bozza':'Crea i file di stampa')));
}
