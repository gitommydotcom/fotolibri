/* ============ esportazione: bozza per il cliente e file per la stampa ============ */
UI.expTab='draft';
let RESULTS=[],expCancel=false,exporting=false;
function openExport(tab){if(tab)UI.expTab=tab;RESULTS=[];
  const ip=innerPages();EXP.from=clamp(EXP.from,1,Math.max(1,ip));EXP.to=EXP.to>=ip||EXP.to<EXP.from?ip:EXP.to;
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
  const ip=innerPages();if(forPrint&&ip%4)ws.push(L('w',`Pagine interne: ${ip}. Molte tipografie vogliono un multiplo di 4.`));
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
  const out=[],P=BOOK.page;let pg=1;
  for(const sp of BOOK.spreads){
    if(isCover(sp)){if(EXP.cover)out.push({sp,file:'copertina',x:0,w:spW(sp),bleed:EXP.bleed+BOOK.cover.wrap,sides:null,label:'copertina'});continue;}
    if(isEnd(sp)){if(EXP.endp)out.push({sp,file:'risguardi',x:0,w:spW(sp),bleed:BOOK.endp.bleed,sides:null,label:sp.kind==='endF'?'risguardo-anteriore':'risguardo-posteriore'});continue;}
    if(!EXP.inner){pg+=2;continue;}
    const a=EXP.from,b=EXP.to,inR=n=>n>=a&&n<=b;
    if(EXP.pages==='single'){
      if(inR(pg))out.push({sp,file:'interno',x:0,w:P.w,sides:['L','S'],bleed:EXP.bleed,label:'p'+pad3(pg),pg});
      if(inR(pg+1))out.push({sp,file:'interno',x:P.w,w:P.w,sides:['R','S'],bleed:EXP.bleed,label:'p'+pad3(pg+1),pg:pg+1});}
    else if(inR(pg)||inR(pg+1))out.push({sp,file:'interno',x:0,w:spW(sp),sides:null,bleed:EXP.bleed,label:`p${pad3(pg)}-${pad3(pg+1)}`,pg});
    pg+=2;}
  return out;
}
async function renderJob(j){
  const PH=pgH(j.sp),g=expGeom(j.bleed),W=Math.round((j.w+2*g.ext)*g.k),H=Math.round((PH+2*g.ext)*g.k);
  if(W*H>260e6)throw new Error('troppo grande');
  const map=await loadOriginals(j.sp);await loadSpreadFonts(j.sp);
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.imageSmoothingQuality='high';
  ctx.save();ctx.beginPath();ctx.rect((g.ext-g.b)*g.k,(g.ext-g.b)*g.k,(j.w+2*g.b)*g.k,(PH+2*g.b)*g.k);ctx.clip();
  renderSpread(ctx,j.sp,{s:g.k,ox:(g.ext-j.x)*g.k,oy:g.ext*g.k,bleed:g.b,spineBleed:!!j.sides,q:'full',map,sides:j.sides});
  ctx.restore();
  if(EXP.marks){drawMarks(ctx,g,j.w,PH);
    if(isCover(j.sp)||isEnd(j.sp)){/* segni di piega/dorso fuori dal formato */const xs=isCover(j.sp)?[coverPW(),coverPW()+BOOK.cover.spine]:[foldX(j.sp)];
      ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,.1*g.k);ctx.beginPath();
      for(const x of xs){const X=(g.ext+x)*g.k;ctx.moveTo(X,(g.ext-g.off-g.mlen)*g.k);ctx.lineTo(X,(g.ext-g.off)*g.k);ctx.moveTo(X,(g.ext+PH+g.off)*g.k);ctx.lineTo(X,(g.ext+PH+g.off+g.mlen)*g.k);}
      ctx.stroke();ctx.restore();}}
  for(const s of map.values())closeSrc(s);
  const blob=await canvasJpeg(c,EXP.quality/100,EXP.dpi);c.width=c.height=0;
  return{blob,pw:W,ph:H,Wmm:j.w+2*g.ext,Hmm:PH+2*g.ext,ext:g.ext,b:g.b};
}
function specSheet(){
  const P=BOOK.page,C=BOOK.cover,E=BOOK.endp,cov=BOOK.spreads.find(isCover),L=[];
  L.push(`FOTOLIBRO STUDIO · scheda tecnica`,`Lavoro: ${BOOK.job.name}`,`Data: ${new Date().toLocaleString('it-IT')}`,`Tema: ${TH().name}`,'');
  L.push(`Formato pagina rifilata: ${nf(P.w)} × ${nf(P.h)} mm`,`Pagine interne: ${innerPages()}`,`Abbondanza interno: ${nf(EXP.bleed)} mm`,`Risoluzione: ${EXP.dpi} dpi · JPEG q${EXP.quality} · RGB`,'');
  if(cov)L.push(`Copertina aperta (rifilata): ${nf(spW(cov))} × ${nf(pgH(cov))} mm`,`  dorso ${nf(C.spine)} mm · cartone +${nf(C.over)} mm/lato · risvolto ${nf(C.wrap)} mm + abbondanza ${nf(EXP.bleed)} mm`,
    `  file copertina: ${nf(spW(cov)+2*(C.wrap+EXP.bleed))} × ${nf(pgH(cov)+2*(C.wrap+EXP.bleed))} mm`,'');
  if(E.on)L.push(`Risguardi: 2 fogli ${nf(E.w)} × ${nf(E.h)} mm (+${nf(E.bleed)} mm abbondanza), piega a ${nf(E.fold)} mm da sinistra`,`  anteriore = pag. 2 · posteriore = penultima pagina`,'');
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
      const name=safeName(EXP.name)||'fotolibro',done=[];
      const part=EXP.inner&&(EXP.from>1||EXP.to<innerPages()),suf=part?`_p${pad3(EXP.from)}-${pad3(EXP.to)}`:'';
      for(let i=0;i<jobs.length;i++){if(expCancel)throw new Error('annullato');
        const j=jobs[i];prog(`${j.file==='copertina'?'Copertina':j.file==='risguardi'?(j.label==='risguardo-anteriore'?'Risguardo anteriore':'Risguardo posteriore'):(EXP.pages==='single'?'Pagina ':'Pagine ')+j.label.slice(1).replace(/^0+/,'').replace(/-0*/,'–')} · ${i+1} di ${jobs.length}`,i,jobs.length);
        await sleep(5);done.push({...await renderJob(j),job:j});}
      prog('Creo i file…',1,1);await sleep(5);
      const files=[];
      for(const f of['copertina','risguardi','interno']){const d=done.filter(x=>x.job.file===f);if(!d.length)continue;
        if(EXP.fmt==='pdf')files.push({name:`${name}_${f}${f==='interno'?suf:''}.pdf`,blob:buildPDF(d)});
        else d.forEach(x=>files.push({name:`${name}_${f==='interno'?'interno_'+x.job.label:x.job.label}.jpg`,blob:x.blob,jpg:true}));}
      done.length=0;
      if(EXP.zipAll||EXP.fmt==='jpg'){files.push({name:`${name}_scheda-tecnica.txt`,blob:new Blob([specSheet()],{type:'text/plain'})});
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
    const cov=BOOK.spreads.find(isCover),E=BOOK.endp,gC=expGeom(EXP.bleed+BOOK.cover.wrap),gE=expGeom(E.bleed),gI=expGeom(EXP.bleed);
    const dims=(w,h,g)=>`${nf(w+2*g.ext)} × ${nf(h+2*g.ext)} mm`;
    const rng=el('div',{class:'row'},el('span',{class:'u'},'da pag.'),el('input',{type:'number',class:'num',min:1,max:ip,value:EXP.from,onchange:e=>{EXP.from=clamp(parseInt(e.target.value)||1,1,ip);EXP.to=Math.max(EXP.to,EXP.from);renderExport();}}),
      el('span',{class:'u'},'a pag.'),el('input',{type:'number',class:'num',min:1,max:ip,value:EXP.to,onchange:e=>{EXP.to=clamp(parseInt(e.target.value)||ip,EXP.from,ip);renderExport();}}),
      btn('Tutte',()=>{EXP.from=1;EXP.to=ip;renderExport();}));
    body=[el('div',{class:'dlg-s'},'File separati come li chiedono le tipografie: copertina con dorso e risvolti, risguardi su foglio a parte, interno. Renderizzati dalle foto originali.'),
      el('div',{class:'opts'},
        cov?ck(EXP,'cover','Copertina',`retro + dorso + fronte · ${dims(spW(cov),pgH(cov),gC)}`):null,
        E.on?ck(EXP,'endp','Risguardi',`2 fogli (pag. 2 e penultima) · ${dims(E.w,E.h,gE)} ciascuno`):null,
        ck(EXP,'inner','Interno',`${ip} pagine · ${EXP.pages==='single'?dims(P.w,P.h,gI)+' ciascuna':dims(2*P.w,P.h,gI)+' a doppia pagina'}`)),
      EXP.inner?el('div',{class:'row2'},sel2(EXP,'pages','Interno come',[['single','Pagine singole'],['spread','Doppie pagine affiancate']]),el('div',{class:'lbl'},el('span',{},'Quali pagine'),rng)):null,
      el('div',{class:'row3'},sel2(EXP,'fmt','Formato',[['pdf','PDF'],['jpg','JPEG (in .zip)']]),
        sel2(EXP,'dpi','Risoluzione',[[200,'200 dpi'],[300,'300 dpi · stampa foto'],[400,'400 dpi']],true),
        sel2(EXP,'quality','Qualità JPEG',[[85,'85'],[92,'92 · consigliata'],[100,'100 · massima']],true)),
      el('div',{class:'row3'},sel2(EXP,'bleed','Abbondanza interno e copertina',[[0,'Nessuna'],[2,'2 mm'],[3,'3 mm'],[5,'5 mm']],true),
        el('label',{class:'chk'},el('input',{type:'checkbox',checked:EXP.marks,onchange:e=>{EXP.marks=e.target.checked;renderExport();}}),'Crocini di taglio e piega'),
        el('label',{class:'chk'},el('input',{type:'checkbox',checked:EXP.zipAll||EXP.fmt==='jpg',disabled:EXP.fmt==='jpg',onchange:e=>{EXP.zipAll=e.target.checked;renderExport();}}),'Tutto in un .zip con scheda tecnica')),
      el('label',{class:'lbl'},el('span',{},'Nome dei file'),el('input',{class:'inp',value:EXP.name,oninput:e=>EXP.name=e.target.value})),
      el('p',{class:'u'},`Misure e risguardi si impostano nel pannello Libro. Risguardi: abbondanza ${nf(E.bleed)} mm.`),
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
