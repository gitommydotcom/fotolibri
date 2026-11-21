/* ============ pannelli nascondibili ============ */
const PANELS={L:true,R:true,S:true};
try{Object.assign(PANELS,JSON.parse(localStorage.getItem('fotolibro-studio-pannelli')||'{}'));}catch(e){}
function applyPanels(){const m=$('.main');m.classList.toggle('noL',!PANELS.L);m.classList.toggle('noR',!PANELS.R);m.classList.toggle('noS',!PANELS.S);
  const focus=!PANELS.L&&!PANELS.R&&!PANELS.S;$('#tF').classList.toggle('on',focus);$('#tF').title=focus?'Mostra di nuovo i pannelli (F)':'Solo il libro, senza pannelli (F)';
  try{localStorage.setItem('fotolibro-studio-pannelli',JSON.stringify(PANELS));}catch(e){}draw();}
function togglePanel(k){PANELS[k]=!PANELS[k];applyPanels();}
function toggleFocus(){const focus=!PANELS.L&&!PANELS.R&&!PANELS.S;PANELS.L=PANELS.R=PANELS.S=focus;applyPanels();if(!focus)toast('Solo il libro: premi F o il pulsante ⛶ in basso a destra per riavere i pannelli',3500);}
$('#tF').onclick=toggleFocus;
applyPanels();

/* ============ modalità / zoom / tastiera ============ */
/* modalità: 'photo' (inquadrare e scambiare le foto, normale) o 'layout' (spostare e ridimensionare i riquadri), attivata dal pannello della foto o con M */
function setMode(m){UI.mode=m;document.body.classList.toggle('layoutmode',m==='layout');renderProps();renderPbar();if(UI.tab==='pages')renderLeft();draw();}
function setZoom(z){view.zoom=clamp(z,.25,6);draw();}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{UI.tab=b.dataset.t;renderLeft();});
$('#zIn').onclick=()=>setZoom(view.zoom*1.25);$('#zOut').onclick=()=>setZoom(view.zoom/1.25);$('#zLbl').onclick=()=>setZoom(1);
/* menu a tendina (Progetto, Esporta, ⋯): si chiudono con Esc, con un clic fuori o scegliendo una voce */
function closeMenus(except){document.querySelectorAll('.menu.open').forEach(m=>{if(m===except)return;m.classList.remove('open');m.querySelector('.mpop').hidden=true;m.firstElementChild.setAttribute('aria-expanded','false');});}
function wireMenu(m){const b=m.firstElementChild,pop=m.querySelector('.mpop');
  b.addEventListener('click',e=>{e.stopPropagation();const open=!m.classList.contains('open');closeMenus(m);m.classList.toggle('open',open);pop.hidden=!open;b.setAttribute('aria-expanded',String(open));
    if(open){const f=pop.querySelector('button:not(:disabled)');if(f)f.focus();}});
  pop.addEventListener('click',e=>{if(e.target.closest('button'))closeMenus();});
  pop.addEventListener('keydown',e=>{const it=[...pop.querySelectorAll('button:not(:disabled)')],i=it.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();it[(i+1)%it.length].focus();}else if(e.key==='ArrowUp'){e.preventDefault();it[(i-1+it.length)%it.length].focus();}
    else if(e.key==='Escape'){e.stopPropagation();closeMenus();b.focus();}});}
document.querySelectorAll('.menu').forEach(wireMenu);
document.addEventListener('click',e=>{if(!e.target.closest('.menu'))closeMenus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus();});
$('#bUndo').onclick=undo;$('#bRedo').onclick=redo;
new ResizeObserver(()=>draw()).observe(stage);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{renderLeft();draw();});
let fontT=0;if(document.fonts)document.fonts.addEventListener('loadingdone',()=>{draw();THUMBS.clear();scheduleStrip();clearTimeout(fontT);fontT=setTimeout(()=>{TPREV.clear();if(START.open)renderStart();else if(UI.tab==='theme')renderLeft();},250);});
window.addEventListener('keydown',e=>{
  const tag=(e.target.tagName||'').toLowerCase();const typing=tag==='input'||tag==='textarea'||tag==='select';
  if((e.ctrlKey||e.metaKey)&&!typing){const k=e.key.toLowerCase();
    if(k==='z'&&!e.shiftKey){e.preventDefault();undo();return;}
    if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();redo();return;}
    if(k==='s'){e.preventDefault();saveProject();return;}
    if(k==='e'){e.preventDefault();openExport('print');return;}}
  if(typing||$('#dlg').open||$('#wiz').open||$('#flipDlg').open||START.open||($('#keysDlg')&&$('#keysDlg').open))return;
  if(e.key==='?'){showKeys();return;}
  if(e.key==='['){togglePanel('L');return;}
  if(e.key===']'){togglePanel('R');return;}
  if(e.key==='f'||e.key==='F'){toggleFocus();return;}
  if(e.key==='PageDown'){e.preventDefault();goSpread(UI.cur+1);return;}
  if(e.key==='PageUp'){e.preventDefault();goSpread(UI.cur-1);return;}
  if((e.key==='v'||e.key==='V')&&isSpecial(cur(),activeSide(cur()))){toast('Pagina speciale: si modifica dal pannello Pagine');return;}
  if(e.key==='v'||e.key==='V'){const sp=cur(),side=activeSide(sp),M=meta(sp,side),cands=pageCands(sp,side);if(cands.length){const i=cands.findIndex(c=>c.key===M.lay);relayoutPage(sp,side,{key:cands[(i+1)%cands.length].key});sel=null;commit();syncAll();}return;}
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();deleteSelection();}
  else if(e.key==='Escape'){sel=null;TSEL.clear();renderProps();renderLeft();draw();}
  else if(e.key==='m'||e.key==='M'){setMode(UI.mode==='photo'?'layout':'photo');}
  else if(!sel&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();goSpread(UI.cur+(e.key==='ArrowRight'?1:-1));}
  else if(e.key.startsWith('Arrow')&&sel){e.preventDefault();const st=e.shiftKey?.05:.005;
    const dx=e.key==='ArrowLeft'?-st:e.key==='ArrowRight'?st:0,dy=e.key==='ArrowUp'?-st:e.key==='ArrowDown'?st:0;
    if(sel.type==='text'){const t=txtById(sel.id);t.x+=dx/2;t.y+=dy;}
    else if(sel.type==='deco'){const d=decoById(sel.id);d.x+=dx/2;d.y+=dy;}
    else{const c=byId(sel.id);if(UI.mode==='layout'){c.x=clamp(c.x+dx,0,1-c.w);c.y=clamp(c.y+dy,0,1-c.h);}
      else if(c.ph){c.ph.ox=clamp(c.ph.ox-dx*10,-1,1);c.ph.oy=clamp(c.ph.oy-dy*10,-1,1);}}
    draw();clearTimeout(wheelT);wheelT=setTimeout(()=>{commit();renderProps();},350);}
});
function deleteSelection(){
  if(!sel)return;const sp=cur();
  if(sel.type==='text'){sp.texts=sp.texts.filter(t=>t.id!==sel.id);sel=null;}
  else if(sel.type==='deco'){sp.decos=sp.decos.filter(t=>t.id!==sel.id);sel=null;}
  else{const c=byId(sel.id);if(!c)return;if(UI.mode==='photo')removeFromPage(c);else{sp.cells=sp.cells.filter(k=>k!==c);sel=null;}}
  commit();syncAll();
}
/* ============ progetto ============ */
let newArmed=0;
$('#bNew').onclick=e=>{
  if(realCount()&&!confirm('Iniziare un nuovo fotolibro? Il libro attuale viene chiuso (salvalo prima con «Salva» se vuoi riprenderlo).'))return;clearLibrary();idbClear('kv');idbClear('prev');
  BOOK=freshBookKeepingSettings(true);UI.cur=0;sel=null;UI.tab='photos';UI.filter='all';UI.folder='*';WZ.userGroup=false;
  Object.assign(START,{userTheme:false,titleSrc:'theme',sugg:null});WZ.title='';WZ.sub='';WZ.dedica='';
  resetHistory();hideBanner();syncAll();openStart();
};
function clearLibrary(){for(const e of LIB.values()){closeSrc(e.thumbBmp);if(e.thumbURL)URL.revokeObjectURL(e.thumbURL);}for(const b of PREV.values())closeSrc(b);PREV.clear();LIB.clear();ORDER=[];SIMS=[];TSEL.clear();THUMBS.clear();}
function saveProject(){
  if(!realCount()){toast('Aggiungi prima le tue foto: il progetto salva l’impaginazione delle tue foto.');return;}
  download(new Blob([JSON.stringify(projectData())],{type:'application/json'}),(safeName(BOOK.job.name)||'fotolibro')+'.fotolibro.json');
  toast('Progetto salvato nella cartella Download. Le foto restano dove sono: riaprendolo le ricolleghi in un clic.',5000);
}
$('#bSave').onclick=saveProject;
$('#bOpen').onclick=()=>$('#projIn').click();
$('#projIn').addEventListener('change',async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const d=JSON.parse(await f.text());if(d.app!=='fotolibro-studio'&&d.app!=='tavolo-fotolibro')throw 0;if(START.open)closeStart();await loadProject(d);toast('Progetto aperto');}
  catch(err){toast('Questo file non è un progetto di Fotolibro Studio.');}
});
async function loadProject(d){
  clearLibrary();progress('Apro il progetto…',0,d.photos.length);let i=0;
  /* anteprime lette in parallelo (4 alla volta), l'ordine originale resta quello del progetto */
  const ents=d.photos.map(p=>({...p,file:null,prevBlob:null,thumbBmp:null,thumbURL:null,sample:false}));let k=0;
  const work=async()=>{while(k<ents.length){const e=ents[k++];const pb=await idbGet('prev',e.id);
    if(pb){try{const b=await createImageBitmap(pb);const tc=canvasOf(b,320);closeSrc(b);e.prevBlob=pb;await setThumb(e,tc);}catch(err){}}
    progress('Apro il progetto…',++i,d.photos.length);}};
  await Promise.all([work(),work(),work(),work()]);for(const e of ents)LIB.set(e.id,e);
  progress(null);
  BOOK=normBook(d.book);if(d.v!==2)upgradeV1();Object.assign(EXP,d.exp||{});if(EXP.fmt==='zip')EXP.fmt='jpg';Object.assign(DRAFT,d.draft||{});ensureStructure();UI.sort=(d.ui&&d.ui.sort)||'date';UI.cur=Math.max(0,BOOK.spreads.findIndex(isInner));sel=null;TPREV.clear();THUMBS.clear();
  sortOrder();SIMS=findSimilar();syncChapters();resetHistory();updateBanner();syncAll();
  queueNotice(artOffer);
  idbPut('kv','project',projectData());
}
const NOTICES=[];
function hideBanner(){$('#banner').hidden=true;const f=NOTICES.shift();if(f)setTimeout(f,0);}
function queueNotice(f){if($('#banner').hidden)f();else NOTICES.push(f);}
function showBanner(...kids){const b=$('#banner');b.replaceChildren(...kids);b.hidden=false;}
function updateBanner(){
  const miss=[...LIB.values()].filter(e=>!e.sample&&!e.file);
  if(!miss.length){hideBanner();return;}
  showBanner(el('span',{},el('b',{},`${miss.length} foto da ricollegare agli originali. `),'Puoi impaginare con le anteprime; per stampare in alta qualità seleziona di nuovo le foto (anche tutta la cartella): vengono riconosciute dal nome.'),
    btn('Seleziona le foto…',()=>$('#fileIn').click(),'pri'),btn('Seleziona la cartella…',()=>$('#dirIn').click()),btn('Più tardi',hideBanner));
}

/* ============ foto di esempio ============ */
const SAMPLES=[
  {sky:['#F6C28B','#E9806E','#7A5C8C'],sun:'#FFF1C9',hills:['#6B5582','#45395E','#27213A']},
  {sky:['#CFEAF5','#8CC5E3','#4F8DB8'],sun:'#FFFFFF',hills:['#79AA82','#4F8160','#2F5A45']},
  {sky:['#FDE6C4','#F5B97A','#E07A4F'],sun:'#FFF6E0',hills:['#C96B4B','#8E4A3A'],sea:'#3E6E8E'},
  {sky:['#1F2A4A','#3B4C7A','#C98BA1'],sun:'#F7E7C6',hills:['#2A3558','#1A2240','#0E1426']},
  {sky:['#EEF4E8','#C9DFC3','#9CC3A8'],sun:'#FFFDF2',hills:['#7BA98A','#557F68','#36584A']},
  {sky:['#F3D9E2','#E4AFC3','#B9789B'],sun:'#FFF3F6',hills:['#8F5778','#6A3E5A'],sea:'#5A6F9E'},
];
function drawSample(pi,seed,W,H,veil){
  const p=SAMPLES[pi%SAMPLES.length],R=rng(seed*977+13),c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d');
  let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,p.sky[2]);g.addColorStop(.45,p.sky[1]);g.addColorStop(.75,p.sky[0]);
  x.fillStyle=g;x.fillRect(0,0,W,H);
  const sx=W*(.25+R()*.5),sy=H*(.3+R()*.15),sr=Math.min(W,H)*(.07+R()*.05);
  const halo=x.createRadialGradient(sx,sy,sr*.5,sx,sy,sr*5);halo.addColorStop(0,p.sun+'aa');halo.addColorStop(1,p.sun+'00');
  x.fillStyle=halo;x.fillRect(0,0,W,H);
  x.fillStyle=p.sun;x.beginPath();x.arc(sx,sy,sr,0,7);x.fill();
  if(p.sea){const top=H*.66;const sg=x.createLinearGradient(0,top,0,H);sg.addColorStop(0,p.sea);sg.addColorStop(1,'#1d2c3c');x.fillStyle=sg;x.fillRect(0,top,W,H-top);
    x.fillStyle=p.sun+'99';for(let k=0;k<18;k++){const yy=top+8+k*k*1.6;const ww=sr*(1.6-k*.06)*(0.6+R()*.6);x.fillRect(sx-ww/2,yy,ww,3+k*.25);}}
  const base=p.sea?[.6,.66]:[.55,.68,.82];
  p.hills.forEach((col,k)=>{const by=H*base[k];const a1=R()*6,a2=R()*6,f1=1+R()*2,f2=3+R()*3,amp=H*(.05+R()*.05);
    x.fillStyle=col;x.beginPath();x.moveTo(0,H);
    for(let xx=0;xx<=W;xx+=8){const t=xx/W;x.lineTo(xx,by-Math.sin(t*Math.PI*f1+a1)*amp-Math.sin(t*Math.PI*f2+a2)*amp*.35);}
    x.lineTo(W,H);x.closePath();x.fill();});
  if(veil){x.fillStyle='rgba(255,255,255,.05)';x.fillRect(0,0,W,H);}
  return c;
}
async function makeSamples(){
  const base=new Date(2026,6,10,9,0).getTime();const plan=[9,8,7];let n=0;
  progress('Preparo un libro di esempio…',0,26);
  for(let d=0;d<plan.length;d++)for(let k=0;k<plan[d];k++){
    const portrait=(n%3===1),W=portrait?800:1200,H=portrait?1100:800,t=base+d*86400000+k*2400000;
    const burst=(d===0&&k===3)?2:1;
    for(let b=0;b<burst;b++){const c=drawSample(n,n+1,W,H,b>0);const blob=await toBlob(c,'image/jpeg',.86);
      const f=new File([blob],`esempio-${String(n+1).padStart(2,'0')}${b?'-bis':''}.jpg`,{type:'image/jpeg',lastModified:t+b*3000});
      const e=await ingest(f,{id:uid(),fav:n===2||n===13,excl:false,exclWhy:'',sample:true});e.sample=true;progress('Preparo un libro di esempio…',LIB.size,26);}
    n++;}
  progress(null);
}
function upgradeV1(){BOOK.endp.on=false;BOOK.theme={id:'neutro',colors:BOOK.theme.colors||{},fonts:{},deco:1,coverLayout:null};}

/* ============ avvio ============ */
$('#bWizard').onclick=openWizard;
$('#bStart').onclick=()=>openStart();
$('#bKeys').onclick=()=>showKeys();
function showKeys(){let d=$('#keysDlg');if(!d){d=el('dialog',{id:'keysDlg'});document.body.append(d);}
  const K=[['Clic su una foto','inquadrala, regola colori e forma'],['Trascina una foto','sposta l’inquadratura · su un’altra foto: scambiale'],['Doppio clic su un testo','scrivi'],
    ['PagGiù / PagSu','doppia pagina successiva / precedente'],['← →','sfoglia (senza nulla selezionato)'],['V','prova un’altra impaginazione della pagina'],['M','sposta e ridimensiona i riquadri (e ritorno)'],
    ['Canc','togli la foto o l’elemento selezionato'],['Frecce','sposta di poco l’elemento selezionato (Maiusc: di più)'],['Ctrl+Z / Ctrl+Y','annulla / ripeti'],['Ctrl+S','salva il progetto'],['Ctrl+E','file per la tipografia'],
    ['Ctrl+rotellina','zoom della vista'],['F','solo il libro, senza pannelli'],['[ ]','nascondi il pannello sinistro / destro'],['?','questo elenco']];
  d.replaceChildren(el('form',{method:'dialog'},el('h2',{},'Scorciatoie e gesti'),el('div',{class:'keys'},...K.flatMap(([k,v])=>[el('kbd',{},k),el('span',{},v)])),
    el('div',{class:'row',style:'justify-content:flex-end;margin-top:14px'},el('button',{class:'btn pri',value:'ok'},'Ho capito'))));d.showModal();}
$('#bDraft').onclick=()=>openExport('draft');
$('#bPrint').onclick=()=>openExport('print');
$('#bFlip').onclick=()=>previewFlipbook();
$('#bHome').onclick=()=>openStart();
$('#flipClose').onclick=()=>$('#flipDlg').close();
$('#dlg').addEventListener('cancel',e=>{if(exporting){e.preventDefault();expCancel=true;}});
$('#dlg').addEventListener('close',()=>draw());
$('#jobName').addEventListener('change',e=>{BOOK.job.name=e.target.value.trim()||'Nuovo fotolibro';commit();});
const _syncAll=syncAll;
syncAll=function(){_syncAll();const j=$('#jobName');if(document.activeElement!==j)j.value=BOOK.job.name;};
async function init(){
  setMode('photo');
  ensureStructure();UI.cur=0;resetHistory();syncAll();
  await idbOpen();
  const saved=await idbGet('kv','project');
  try{const ln=localStorage.getItem(PROF_KEY+'-ultimo');const p=ln&&allProfiles().find(x=>x.name===ln);if(p)setProfileFields(p);}catch(e){}
  await makeSamples();sortOrder();SIMS=findSimilar();
  const keepEndp=BOOK.endp.on;
  buildBook({...WZ,title:'Estate in collina',sub:'Luglio 2026',similar:true,effect:false});
  WZ.title='';BOOK.job.name='Nuovo fotolibro';
  resetHistory();UI.tab='photos';syncAll();$('#toast').hidden=true;
  if(saved&&saved.photos&&saved.photos.length)START.saved=saved;
  openStart();
}
init();
