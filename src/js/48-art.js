/* ============ sticker illustrati (SVG) dalle cartelle "stickers <tema>" del progetto ============
   Nel progetto salvato c'è solo il riferimento (d.art = id): i disegni stanno nell'app, quindi valgono anche
   per i libri salvati prima e per quelli che verranno. */
const ART_SERIES={aaa:{name:'Cartoon',shadow:false},risorsa:{name:'Disegnati a mano',shadow:true}};
/* a quali temi appartiene ogni cartella */
const ART_THEMES={natale:['natale','nordico']};
const ART_NAMES={
  'natale/AAA 2':'Regalo','natale/AAA 3':'Stella','natale/AAA 4':'Pallina','natale/AAA 5':'Pupazzo di neve','natale/AAA 6':'Babbo Natale','natale/AAA 7':'Renna',
  'natale/AAA 8':'Candela','natale/AAA 9':'Albero','natale/AAA 10':'Fiocco di neve','natale/AAA 11':'Campana','natale/AAA 12':'Calza','natale/AAA 13':'Agrifoglio',
  'natale/Risorsa 1':'Bastoncini di zucchero','natale/Risorsa 2':'Stelle','natale/Risorsa 3':'Agrifoglio','natale/Risorsa 4':'Palline','natale/Risorsa 5':'Caramelle','natale/Risorsa 6':'Albero',
  'natale/Risorsa 7':'Babbo Natale','natale/Risorsa 8':'Pupazzo di neve','natale/Risorsa 9':'Campana','natale/Risorsa 10':'Regalo','natale/Risorsa 11':'Cappello di Babbo Natale','natale/Risorsa 12':'Calza'};
const ART=new Map();
(function(){for(const a of(window.__ART||[])){
  const series=a.file.replace(/\s*\d+$/,'').trim().toLowerCase()||'altri',S=ART_SERIES[series]||{name:a.file.replace(/\s*\d+$/,''),shadow:true};
  const id=(a.folder+'/'+a.file).toLowerCase().replace(/\s+/g,'-');
  ART.set(id,{id,folder:a.folder,series,sname:S.name,shadow:S.shadow,name:ART_NAMES[a.folder+'/'+a.file]||a.file,w:a.w,h:a.h,
    url:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(a.svg),img:null,ready:false});}})();
/* caricamento: una volta sola all'avvio; export e anteprime aspettano questa promessa */
const ART_READY=Promise.all([...ART.values()].map(a=>new Promise(res=>{const im=new Image();im.decoding='async';
  im.onload=()=>{a.img=im;a.ready=true;res();};im.onerror=()=>{console.warn('sticker non leggibile',a.id);res();};im.src=a.url;}))).then(()=>{
  if(typeof THUMBS!=='undefined'){THUMBS.clear();if(typeof draw==='function')try{draw();scheduleStrip();}catch(e){}}});
const artFolders=themeId=>Object.keys(ART_THEMES).filter(f=>ART_THEMES[f].includes(themeId)).concat([...new Set([...ART.values()].map(a=>a.folder))].filter(f=>f===themeId));
function artFor(themeId,series){const fs=new Set(artFolders(themeId));return[...ART.values()].filter(a=>fs.has(a.folder)&&(!series||series==='tutti'||a.series===series));}
function artSeries(themeId){const m=new Map();for(const a of artFor(themeId))if(!m.has(a.series))m.set(a.series,a.sname);return[...m];}
const artAspect=d=>{const a=ART.get(d.art);return a?a.w/a.h:1;};
/* mezza larghezza e mezza altezza (mm) di una decorazione, per selezione e maniglie */
function decoHalf(d){if(d.art)return[d.s*artAspect(d)/2,d.s/2];if(d.txt){const B=badgeBox(d,1);return[B.w/2+d.s*.3,B.h/2];}return[d.s/2,d.s/2];}
function drawArt(ctx,d,x,y,s){
  const a=ART.get(d.art);if(!a||!a.ready)return;const h=d.s*s,w=h*a.w/a.h;
  ctx.save();ctx.translate(x,y);if(d.rot)ctx.rotate(d.rot*Math.PI/180);if(d.flip)ctx.scale(-1,1);ctx.globalAlpha*=d.op==null?1:d.op;
  if(a.shadow){ctx.shadowColor='rgba(0,0,0,.26)';ctx.shadowBlur=h*.045;ctx.shadowOffsetY=h*.018;}
  ctx.drawImage(a.img,-w/2,-h/2,w,h);ctx.restore();
}
/* serie usata in una doppia pagina: con "tutte" ogni doppia resta coerente con una sola serie */
function spreadArt(sp){
  const set=BOOK.theme.artSet||'tutti',all=artFor(BOOK.theme.id,set);if(!all.length)return[];
  if(set!=='tutti')return all;const ser=artSeries(BOOK.theme.id).map(x=>x[0]);if(ser.length<2)return all;
  const i=BOOK.spreads.filter(isInner).indexOf(sp);return all.filter(a=>a.series===ser[Math.max(0,i)%ser.length]);
}
/* sceglie lo sticker meno usato nel libro, diverso da quelli già sulla doppia */
function pickArt(sp,R){
  const list=spreadArt(sp);if(!list.length)return null;const here=new Set((sp.decos||[]).filter(d=>d.art).map(d=>d.art)),cnt=new Map();
  for(const s of BOOK.spreads)for(const d of s.decos||[])if(d.art)cnt.set(d.art,(cnt.get(d.art)||0)+1);
  const pool=list.filter(a=>!here.has(a.id)),src=pool.length?pool:list,min=Math.min(...src.map(a=>cnt.get(a.id)||0));
  const best=src.filter(a=>(cnt.get(a.id)||0)===min);return best[Math.floor(R()*best.length)];
}
function addArt(id,x,y,o={}){const sp=cur(),a=ART.get(id);if(!a)return;if(x==null){const pb=visBox(sp,activeSide(sp));x=(pb.x+pb.w/2)/spW(sp);y=.5;}
  const d=mkDeco({art:id,m:null,x,y,s:o.s||Math.round(Math.min(BOOK.page.w,BOOK.page.h)*.2),rot:o.rot!=null?o.rot:Math.round(Math.random()*16-8),c:null});
  sp.decos.push(d);sel={type:'deco',id:d.id};commit();syncAll();return d;}
/* griglia di sticker per i pannelli */
function artGrid(list,onPick,cur){return el('div',{class:'artg'},...list.map(a=>el('button',{type:'button',class:'art'+(cur===a.id?' on':''),title:`${a.name} · ${a.sname} — clic per aggiungere, oppure trascina sul foglio`,draggable:'true',
  ondragstart:e=>{e.dataTransfer.setData('text/x-art',a.id);e.dataTransfer.effectAllowed='copy';dragKind='motif';},onclick:()=>onPick(a)},
  el('img',{src:a.url,alt:a.name,loading:'lazy'}))));}
/* libri salvati prima di questi sticker: proposta una tantum quando si riaprono */
function artOffer(){
  const list=artFor(BOOK.theme.id);if(!list.length||BOOK.artAsked)return;
  if(BOOK.spreads.some(s=>(s.decos||[]).some(d=>d.art)))return;
  const T=TH(),done=()=>{BOOK.artAsked=true;commit();hideBanner();};
  showBanner(el('span',{},el('b',{},`Nuovi sticker per il tema ${T.name}: `),`${list.length} disegni illustrati. Vuoi metterli in questo libro? Sostituiscono solo gli sticker messi in automatico, quelli aggiunti da te restano.`),
    btn('Metti gli sticker',()=>{if(!BOOK.theme.stickers)BOOK.theme.stickers=1;BOOK.artAsked=true;regenDecos();THUMBS.clear();commit();syncAll();hideBanner();
      const n=BOOK.spreads.reduce((a,s)=>a+(s.decos||[]).filter(d=>d.art).length,0);toast(`${n} sticker inseriti nel libro`,4500,'undo');},'pri'),
    btn('Li scelgo io',()=>{UI.tab='deco';done();renderLeft();}),btn('No, grazie',done));
}
