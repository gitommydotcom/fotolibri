/* ============ anteprima ============ */
const cv=$('#cv'),stage=$('#stage');
function bleedOf(sp){return isCover(sp)?EXP.bleed+BOOK.cover.wrap:isEnd(sp)?BOOK.endp.bleed:EXP.bleed;}
function layoutCanvas(){
  const sp=cur(),r=stage.getBoundingClientRect(),b=bleedOf(sp),pad=40,W=spW(sp),H=pgH(sp);
  const fit=Math.max(.2,Math.min((r.width-2*pad)/(W+2*b),(r.height-2*pad-18)/(H+2*b)));
  view.s=fit*view.zoom;view.b=b;
  const cw=Math.round((W+2*b)*view.s+2*pad),ch=Math.round((H+2*b)*view.s+2*pad+18);
  view.ox=pad+b*view.s;view.oy=pad+b*view.s;
  const dpr=window.devicePixelRatio||1;
  if(cw!==view.cw||ch!==view.ch||dpr!==view.dpr){view.cw=cw;view.ch=ch;view.dpr=dpr;cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);cv.style.width=cw+'px';cv.style.height=ch+'px';}
  $('#zLbl').textContent=Math.round(view.zoom*100)+'%';
}
let raf=0;function draw(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;paint();});}
function paint(){
  const sp=cur();if(!sp)return;layoutCanvas();
  const ctx=cv.getContext('2d'),H=pgH(sp),s=view.s,b=view.b,W=spW(sp);
  ctx.setTransform(view.dpr,0,0,view.dpr,0,0);ctx.clearRect(0,0,view.cw,view.ch);
  ctx.save();ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=24;ctx.shadowOffsetY=8;ctx.fillStyle=bgOf(sp);
  ctx.fillRect(view.ox-b*s,view.oy-b*s,(W+2*b)*s,(H+2*b)*s);ctx.restore();
  renderSpread(ctx,sp,{s,ox:view.ox,oy:view.oy,bleed:b,q:'preview'});
  overlays(ctx,sp);
  const P=BOOK.page;
  $('#dimInfo').textContent=isCover(sp)?`Copertina aperta ${nf(W)} × ${nf(H)} mm · dorso ${nf(BOOK.cover.spine)} · cartone +${nf(BOOK.cover.over)} · risvolto ${nf(BOOK.cover.wrap)} mm`
    :isEnd(sp)?`Foglio risguardo ${nf(W)} × ${nf(H)} mm · piega a ${nf(foldX(sp))} mm · zona visibile ${nf(visBox(sp,'L').w)} × ${nf(visBox(sp,'L').h)} mm per lato`
    :`${P.preset==='custom'?'Personalizzato':P.preset} · doppia pagina ${nf(W)} × ${nf(H)} mm · abbondanza ${nf(EXP.bleed)} mm`;
}
const px=(mm,o)=>o+mm*view.s;
function overlays(ctx,sp){
  const A=cssVar('--accent')||'#C2185B',MU=cssVar('--muted')||'#5D6773',H=pgH(sp),FX=foldX(sp),s=view.s,W=spW(sp);
  ctx.save();ctx.lineWidth=1;
  if(isCover(sp)){const x1=px(FX,view.ox),x2=px(FX+BOOK.cover.spine,view.ox);ctx.strokeStyle='rgba(0,150,200,.9)';ctx.setLineDash([3,3]);
    for(const x of[x1,x2]){ctx.beginPath();ctx.moveTo(x+.5,view.oy);ctx.lineTo(x+.5,view.oy+H*s);ctx.stroke();}ctx.setLineDash([]);}
  else if(isEnd(sp)){const x=px(FX,view.ox);ctx.strokeStyle='rgba(0,150,200,.9)';ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(x+.5,view.oy-view.b*s);ctx.lineTo(x+.5,view.oy+(H+view.b)*s);ctx.stroke();ctx.setLineDash([]);}
  else if(sp.mode!=='spread'||true){const x=px(FX,view.ox);const g=ctx.createLinearGradient(x-14,0,x+14,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(0,0,0,.13)');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.fillRect(x-14,view.oy,28,H*s);ctx.strokeStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.moveTo(x+.5,view.oy);ctx.lineTo(x+.5,view.oy+H*s);ctx.stroke();}
  if(UI.guides){
    ctx.setLineDash([4,4]);ctx.strokeStyle='rgba(120,130,145,.6)';
    for(const side of(sp.mode==='spread'?['S']:['L','R'])){const M=meta(sp,side);if(M.full)continue;const I=areaOf(sp,side);ctx.strokeRect(px(I.x,view.ox)+.5,px(I.y,view.oy)+.5,I.w*s,I.h*s);}
    if(view.b>0){ctx.strokeStyle='rgba(0,170,220,.9)';ctx.setLineDash([]);ctx.strokeRect(view.ox+.5,view.oy+.5,W*s,H*s);}
    const sf=BOOK.safe;if(sf>0){ctx.setLineDash([2,4]);ctx.strokeStyle='rgba(220,60,60,.55)';
      for(const side of(sp.mode==='spread'&&!isEnd(sp)?['S']:['L','R'])){const V=visBox(sp,side);ctx.strokeRect(px(V.x+sf,view.ox)+.5,px(V.y+sf,view.oy)+.5,(V.w-2*sf)*s,(V.h-2*sf)*s);}}
    if(isEnd(sp)){ctx.setLineDash([8,4]);ctx.strokeStyle='rgba(30,160,90,.9)';ctx.lineWidth=1.2;
      for(const side of['L','R']){const V=visBox(sp,side);ctx.strokeRect(px(V.x,view.ox)+.5,px(V.y,view.oy)+.5,V.w*s,V.h*s);}
      ctx.font='10px "IBM Plex Mono",monospace';ctx.fillStyle='rgba(30,140,80,.95)';ctx.textAlign='left';ctx.textBaseline='top';const V=visBox(sp,'L');ctx.fillText('zona visibile a libro finito',px(V.x,view.ox)+4,px(V.y,view.oy)+4);}
    if(isCover(sp)&&BOOK.cover.wrap>0){ctx.setLineDash([6,3]);ctx.strokeStyle='rgba(200,120,0,.8)';const w=BOOK.cover.wrap;
      ctx.strokeRect(view.ox-w*s+.5,view.oy-w*s+.5,(W+2*w)*s,(H+2*w)*s);}
    ctx.setLineDash([]);
  }
  for(const t of sp.texts){if(!textProblem(sp,t))continue;const b=textBox(sp,t);ctx.save();ctx.strokeStyle='#E53935';ctx.lineWidth=1.5;ctx.setLineDash([3,2]);
    ctx.strokeRect(px(b.x0,view.ox),px(b.y0,view.oy),(b.x1-b.x0)*s,(b.y1-b.y0)*s);ctx.restore();}
  ctx.font='11px "IBM Plex Mono",Consolas,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  const act=activeSide(sp);const yb=view.oy+(H+view.b)*s+16;
  const sides=sp.mode==='spread'?['S']:['L','R'];
  for(const side of sides){const pb=pageBox(sp,side),cx=px(pb.x+pb.w/2,view.ox),on=side===act;
    ctx.fillStyle=on?A:MU;ctx.fillText(pageLabel(UI.cur,side),cx,yb);
    if(on&&sides.length>1){ctx.fillRect(px(pb.x,view.ox)+pb.w*s*.3,yb+8,pb.w*s*.4,2);}}
  if(isCover(sp)&&BOOK.cover.spine>0){ctx.fillStyle=MU;ctx.fillText('dorso',px(FX+BOOK.cover.spine/2,view.ox),view.oy-(view.b*s)-12);}
  if(isEnd(sp)){ctx.fillStyle=MU;ctx.fillText('piega',px(FX,view.ox),view.oy-(view.b*s)-12);}
  if(UI.mode==='layout'){ctx.strokeStyle='rgba(120,130,145,.55)';ctx.lineWidth=1;for(const c of sp.cells){const r=cellRect(sp,c);ctx.strokeRect(px(r.x,view.ox)+.5,px(r.y,view.oy)+.5,r.w*s-1,r.h*s-1);}}
  const tgt=dropTarget||(drag&&drag.target);
  if(tgt){const c=byId(tgt);if(c){const r=cellRect(sp,c);ctx.fillStyle=A+'33';ctx.fillRect(px(r.x,view.ox),px(r.y,view.oy),r.w*s,r.h*s);ctx.setLineDash([6,4]);ctx.strokeStyle=A;ctx.lineWidth=2;ctx.strokeRect(px(r.x,view.ox)+1,px(r.y,view.oy)+1,r.w*s-2,r.h*s-2);ctx.setLineDash([]);}}
  if(dropPage){const pb=pageBox(sp,dropPage);ctx.setLineDash([8,5]);ctx.strokeStyle=A;ctx.lineWidth=3;ctx.strokeRect(px(pb.x,view.ox)+2,view.oy+2,pb.w*s-4,H*s-4);ctx.setLineDash([]);
    ctx.fillStyle=A;ctx.font='600 13px "Inter",sans-serif';ctx.fillText('+ aggiungi a questa pagina',px(pb.x+pb.w/2,view.ox),view.oy+18);}
  if(sel&&sel.type==='cell'){const c=byId(sel.id);if(c){const r=cellRect(sp,c),X=px(r.x,view.ox),Y=px(r.y,view.oy),Wc=r.w*s,Hc=r.h*s;
    ctx.strokeStyle=A;ctx.lineWidth=2;ctx.strokeRect(X+1,Y+1,Wc-2,Hc-2);
    if(UI.mode==='layout'){ctx.fillStyle='#fff';for(const[hx,hy] of handlePts(c)){ctx.beginPath();ctx.rect(hx-5,hy-5,10,10);ctx.fill();ctx.stroke();}}}}
  if(sel&&sel.type==='deco'){const d=decoById(sel.id);if(d){const cx=px(d.x*W,view.ox),cy=px(d.y*H,view.oy),r=d.s*s/2;ctx.setLineDash([5,4]);ctx.strokeStyle=A;ctx.lineWidth=1.5;ctx.strokeRect(cx-r,cy-r,2*r,2*r);ctx.setLineDash([]);
    ctx.fillStyle='#fff';ctx.beginPath();ctx.rect(cx+r-5,cy+r-5,10,10);ctx.fill();ctx.stroke();}}
  if(sel&&sel.type==='text'){const t=txtById(sel.id);if(t){const m=measureText(mctx,t,s);ctx.translate(view.ox+t.x*W*s,view.oy+t.y*H*s);ctx.rotate(t.rot*Math.PI/180);
    ctx.setLineDash([5,4]);ctx.strokeStyle=A;ctx.lineWidth=1.5;ctx.strokeRect(-m.w/2-m.pad,-m.h/2-m.pad*.6,m.w+2*m.pad,m.h+1.2*m.pad);}}
  ctx.restore();
}

/* ============ striscia delle doppie pagine ============ */
const THUMBS=new Map();
function thumbFor(sp){
  const key=JSON.stringify(sp)+'|'+JSON.stringify(BOOK.style)+'|'+JSON.stringify(BOOK.theme)+'|'+BOOK.page.w+'x'+BOOK.page.h+'|'+JSON.stringify(BOOK.cover)+JSON.stringify(BOOK.endp)+'|'+thumbGen;
  const c0=THUMBS.get(sp.id);if(c0&&c0.key===key)return c0.cv;
  const H=62,s=H/pgH(sp),W=spW(sp)*s,dpr=window.devicePixelRatio||1;
  const c=c0?c0.cv:document.createElement('canvas');c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);c.style.width=W+'px';c.style.height=H+'px';
  const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);renderSpread(x,sp,{s,ox:0,oy:0,q:'thumb'});
  if(isInner(sp)){x.fillStyle='rgba(0,0,0,.18)';x.fillRect(W/2-.5,0,1,H);}
  THUMBS.set(sp.id,{key,cv:c});return c;
}
let stripT=0;function scheduleStrip(){clearTimeout(stripT);stripT=setTimeout(renderStrip,120);}
function renderStrip(){
  const S=$('#strip'),y=S.scrollLeft;
  const ids=new Set(BOOK.spreads.map(s=>s.id));for(const k of THUMBS.keys())if(!ids.has(k))THUMBS.delete(k);
  const items=BOOK.spreads.map((sp,i)=>{const fixed=!isInner(sp);
    const b=el('button',{type:'button',class:'sth'+(i===UI.cur?' on':'')+(fixed?' fixed':''),draggable:fixed?'false':'true',title:isCover(sp)?'Copertina (retro · dorso · fronte)':isEnd(sp)?pageLabel(i,'S'):`Pagine ${spreadLabel(i)}`,
      onclick:()=>goSpread(i),
      ondragstart:e=>{e.dataTransfer.setData('text/x-spread',String(i));e.dataTransfer.effectAllowed='move';},
      ondragover:e=>{e.preventDefault();b.classList.add('over');},ondragleave:()=>b.classList.remove('over'),
      ondrop:e=>{e.preventDefault();e.stopPropagation();b.classList.remove('over');
        const si=e.dataTransfer.getData('text/x-spread');
        if(si!==''){moveSpread(+si,i);return;}
        const ids=dragIds(e);if(ids.length){const side=sp.mode==='spread'?'S':(pagePhs(sp,'L').length<=pagePhs(sp,'R').length?'L':'R');addToPage(sp,side,ids);UI.cur=i;sel=null;commit();syncAll();toast(`${ids.length} foto aggiunte a ${pageLabel(i,side)}`);}
      }},thumbFor(sp),el('span',{},spreadLabel(i)));return b;});
  const endB=BOOK.spreads.findIndex(s=>s.kind==='endB');
  const add=el('button',{type:'button',class:'sadd',onclick:()=>{UI.cur=lastInnerIdx();addSpread();},title:'Aggiungi una doppia pagina in fondo all’interno'},'+ doppia pagina');
  if(endB>=0)items.splice(endB,0,add);else items.push(add);
  S.replaceChildren(...items);
  S.scrollLeft=y;const on=S.querySelector('.sth.on');if(on){const r=on.getBoundingClientRect(),R=S.getBoundingClientRect();if(r.left<R.left||r.right>R.right)on.scrollIntoView({block:'nearest',inline:'center'});}
}
function goSpread(i){if(i<0||i>=BOOK.spreads.length)return;UI.cur=i;sel=null;UI.side=BOOK.spreads[i].mode==='spread'?'S':'L';syncAll();}
function moveSpread(a,b){const sps=BOOK.spreads;if(a===b||!isInner(sps[a]))return;
  const[x]=sps.splice(a,1);sps.splice(Math.min(b,sps.length),0,x);normalizeOrder();UI.cur=sps.indexOf(x);UI.cur=BOOK.spreads.indexOf(x);commit();syncAll();}
function addSpread(){const sp=mkSpread('inner');let at=UI.cur+1;const s=BOOK.spreads;
  if(!isInner(s[UI.cur])){at=s[UI.cur]&&s[UI.cur].kind==='endB'?UI.cur:Math.max(0,s.findIndex(isInner));}
  s.splice(at,0,sp);normalizeOrder();UI.cur=BOOK.spreads.indexOf(sp);sel=null;commit();syncAll();toast('Doppia pagina aggiunta: trascinaci le foto');}
let delArmed=0;
function renderPbar(){
  const sp=cur(),i=UI.cur,n=BOOK.spreads.length;if(!sp)return;
  const ttl=isCover(sp)?'Copertina':isEnd(sp)?(sp.kind==='endF'?'Risguardo anteriore':'Risguardo posteriore'):`Pagine ${spreadLabel(i)}`;
  const N=bookPages(),sub=isCover(sp)?`pag. 1 e ${N} · retro · dorso · fronte`:isEnd(sp)?(sp.kind==='endF'?'pag. 2–3 · foglio dei risguardi':`pag. ${N-2}–${N-1} · foglio dei risguardi`):`${innerIdx(i)+1} di ${innerPages()/2} doppie · libro di ${N} pagine`;
  const del=btn('Elimina',e=>{if(Date.now()-delArmed>3000){delArmed=Date.now();e.currentTarget.textContent='Confermi?';return;}delArmed=0;
    if(BOOK.spreads.filter(isInner).length<=1){toast('L’interno deve avere almeno una doppia pagina');return;}
    const old=BOOK.spreads[i],ph=old.cells.filter(c=>c.ph&&!c.fx&&!c.epPh).map(c=>c.ph),pos=pageNum(i,'L');BOOK.spreads.splice(i,1);
    const keep=ph.filter(p=>!usedInInterior(p.img));const r=redistribute(keep,pos,{afterIdx:Math.max(0,i-1)});
    UI.cur=Math.min(i,BOOK.spreads.length-1);sel=null;commit();syncAll();toast('Doppia pagina eliminata'+redistMsg(r),4500,'undo');},'danger','Elimina questa doppia pagina: le sue foto vanno nelle pagine vicine (clicca due volte)');
  $('#pbar').replaceChildren(...[
    btn('◀',()=>goSpread(i-1),'nav','Doppia pagina precedente (PagSu)'),
    el('div',{class:'ttl'},ttl,el('small',{},sub)),
    btn('▶',()=>goSpread(i+1),'nav','Doppia pagina successiva (PagGiù)'),
    el('div',{class:'sep'}),
    btn('+ Doppia pagina',addSpread,null,'Aggiunge una doppia pagina vuota dopo questa'),
    isInner(sp)?btn('Duplica',()=>{const d=clone(sp);d.id=uid();d.cells.forEach(c=>c.id=uid());d.texts.forEach(t=>t.id=uid());(d.decos||[]).forEach(t=>t.id=uid());BOOK.spreads.splice(i+1,0,d);UI.cur++;commit();syncAll();}):null,
    isInner(sp)?del:null,
    isCover(sp)?btn('Rigenera copertina dal tema',()=>{rebuildCover();sel=null;commit();syncAll();toast('Copertina ricreata con le stesse foto e titoli (Ctrl+Z per annullare)');},'alt'):null,
    el('div',{class:'sep'}),
    isCover(sp)||(isInner(sp)&&(isVerso(i,'L')||isVerso(i,'R')))?null:el('label',{class:'chk',title:'Una sola impaginazione su entrambe le pagine, anche attraverso la piega'},
      el('input',{type:'checkbox',checked:sp.mode==='spread',onchange:e=>{setSpreadMode(sp,e.target.checked?'spread':'pages');UI.side=e.target.checked?'S':'L';sel=null;commit();syncAll();}}),'Unisci le due pagine')].filter(Boolean));
}

/* ============ storia e autosalvataggio ============ */
const HIST={past:[],future:[]};
function snap(){return JSON.stringify(BOOK);}
function commit(){const s=snap();if(HIST.past[HIST.past.length-1]===s){scheduleStrip();return;}HIST.past.push(s);if(HIST.past.length>80)HIST.past.shift();HIST.future=[];updUndo();scheduleStrip();scheduleSave();}
function resetHistory(){HIST.past=[snap()];HIST.future=[];updUndo();}
function restore(s){BOOK=JSON.parse(s);UI.cur=clamp(UI.cur,0,BOOK.spreads.length-1);
  if(sel&&!(sel.type==='cell'?byId(sel.id):sel.type==='deco'?decoById(sel.id):txtById(sel.id)))sel=null;syncAll();scheduleSave();}
function undo(){if(HIST.past.length<2)return;HIST.future.push(HIST.past.pop());restore(HIST.past[HIST.past.length-1]);updUndo();}
function redo(){if(!HIST.future.length)return;const s=HIST.future.pop();HIST.past.push(s);restore(s);updUndo();}
function updUndo(){$('#bUndo').disabled=HIST.past.length<2;$('#bRedo').disabled=!HIST.future.length;}
function syncAll(){renderLeft();renderProps();renderPbar();scheduleStrip();draw();}

const DB={db:null};
function idbOpen(){return new Promise(res=>{try{const r=indexedDB.open('fotolibro-studio',1);
  r.onupgradeneeded=()=>{r.result.createObjectStore('kv');r.result.createObjectStore('prev');};
  r.onsuccess=()=>res(DB.db=r.result);r.onerror=()=>res(null);r.onblocked=()=>res(null);}catch(e){res(null);}});}
function idbPut(store,key,val){try{if(!DB.db)return;DB.db.transaction(store,'readwrite').objectStore(store).put(val,key);}catch(e){}}
function idbDel(store,key){try{if(!DB.db)return;DB.db.transaction(store,'readwrite').objectStore(store).delete(key);}catch(e){}}
function idbClear(store){try{if(!DB.db)return;DB.db.transaction(store,'readwrite').objectStore(store).clear();}catch(e){}}
function idbGet(store,key){return new Promise(res=>{try{if(!DB.db)return res(null);const r=DB.db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>res(r.result||null);r.onerror=()=>res(null);}catch(e){res(null);}});}
function projectData(){return{app:'fotolibro-studio',v:2,saved:Date.now(),book:BOOK,exp:EXP,draft:DRAFT,ui:{sort:UI.sort},
  photos:[...LIB.values()].filter(e=>!e.sample).map(e=>({id:e.id,name:e.name,size:e.size,lm:e.lm,w:e.w,h:e.h,date:e.date,dateSrc:e.dateSrc,fav:e.fav,excl:e.excl,exclWhy:e.exclWhy,hash:e.hash,sharp:e.sharp,folder:e.folder||''}))};}
let saveT=0;function scheduleSave(){clearTimeout(saveT);saveT=setTimeout(()=>{if(!realCount())return;if([...LIB.values()].some(e=>e.sample))return;idbPut('kv','project',projectData());},1500);}

/* ============ interazione sul foglio ============ */
function toMM(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left-view.ox)/view.s,y:(e.clientY-r.top-view.oy)/view.s};}
function inSpread(p){const sp=cur();return p.x>=0&&p.x<=spW(sp)&&p.y>=0&&p.y<=pgH(sp);}
function hitCell(p){const sp=cur();for(let i=sp.cells.length-1;i>=0;i--){const r=cellRect(sp,sp.cells[i]);if(p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h)return sp.cells[i];}return null;}
function hitText(p){const sp=cur(),H=pgH(sp),W=spW(sp);for(let i=sp.texts.length-1;i>=0;i--){const t=sp.texts[i],m=measureText(mctx,t,10);
  const hw=(m.w/2+m.pad)/10,hh=(m.h/2+m.pad*.6)/10,dx=p.x-t.x*W,dy=p.y-t.y*H,a=-t.rot*Math.PI/180;
  const lx=dx*Math.cos(a)-dy*Math.sin(a),ly=dx*Math.sin(a)+dy*Math.cos(a);if(Math.abs(lx)<=hw&&Math.abs(ly)<=hh)return t;}return null;}
function hitDeco(p){const sp=cur(),H=pgH(sp),W=spW(sp);for(let i=(sp.decos||[]).length-1;i>=0;i--){const d=sp.decos[i];let rx=d.s/2,ry=d.s/2;if(d.txt){const B=badgeBox(d,1);rx=B.w/2+d.s*.3;ry=B.h/2;}if(Math.abs(p.x-d.x*W)<=rx&&Math.abs(p.y-d.y*H)<=ry)return d;}return null;}
function hitDecoHandle(d,e){const sp=cur(),r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,cx=px(d.x*spW(sp),view.ox),cy=px(d.y*pgH(sp),view.oy),h=d.s*view.s/2;return Math.abs(mx-(cx+h))<=8&&Math.abs(my-(cy+h))<=8;}
const HCODES=['tl','t','tr','r','br','b','bl','l'];
function handlePts(c){const r=cellRect(cur(),c),s=view.s,X=px(r.x,view.ox),Y=px(r.y,view.oy),W=r.w*s,H=r.h*s;
  return[[X,Y],[X+W/2,Y],[X+W,Y],[X+W,Y+H/2],[X+W,Y+H],[X+W/2,Y+H],[X,Y+H],[X,Y+H/2]];}
function hitHandle(c,e){const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;const pts=handlePts(c);
  for(let i=0;i<8;i++)if(Math.abs(pts[i][0]-mx)<=8&&Math.abs(pts[i][1]-my)<=8)return HCODES[i];
  const R=cellRect(cur(),c),X=px(R.x,view.ox),Y=px(R.y,view.oy),W=R.w*view.s,H=R.h*view.s;
  if(my>Y&&my<Y+H){if(Math.abs(mx-X)<=5)return'l';if(Math.abs(mx-X-W)<=5)return'r';}
  if(mx>X&&mx<X+W){if(Math.abs(my-Y)<=5)return't';if(Math.abs(my-Y-H)<=5)return'b';}
  return null;}
const CURS={tl:'nwse-resize',br:'nwse-resize',tr:'nesw-resize',bl:'nesw-resize',t:'ns-resize',b:'ns-resize',l:'ew-resize',r:'ew-resize'};
function linkedMembers(c,axis,v0){
  const e=.004,pos=axis,len=axis==='x'?'w':'h',pp=axis==='x'?'y':'x',pl=axis==='x'?'h':'w';
  const at=k=>Math.abs(k[pos]-v0)<e?'start':Math.abs(k[pos]+k[len]-v0)<e?'end':null;
  if(!UI.link)return[{id:c.id,side:at(c)}];
  const cand=cur().cells.filter(k=>k.side===c.side&&at(k));const set=new Set([c.id]);let ch=true;
  while(ch){ch=false;for(const k of cand){if(set.has(k.id))continue;for(const id of set){const m=byId(id);
    if(k[pp]<=m[pp]+m[pl]+e&&m[pp]<=k[pp]+k[pl]+e){set.add(k.id);ch=true;break;}}}}
  return cand.filter(k=>set.has(k.id)).map(k=>({id:k.id,side:at(k)}));
}
function snapVal(v,axis,exclude,thr,side){
  if(!UI.snap)return v;const len=axis==='x'?'w':'h';const cands=[0,1,.5,T3,T23,.25,.75];
  for(const k of cur().cells){if(exclude.has(k.id)||k.side!==side)continue;cands.push(k[axis],k[axis]+k[len]);}
  let best=v,bd=thr;for(const c of cands){const d=Math.abs(c-v);if(d<bd){bd=d;best=c;}}return best;
}
function setSideFrom(p){const sp=cur();if(!inSpread(p))return;const s=sideAt(sp,p.x);if(s!==UI.side){UI.side=s;if(UI.tab==='layout'||UI.tab==='text')renderLeft();}}
cv.addEventListener('pointerdown',e=>{
  if(e.button!==0&&e.pointerType==='mouse')return;
  const p=toMM(e);cv.setPointerCapture(e.pointerId);setSideFrom(p);
  if(UI.mode==='layout'&&sel&&sel.type==='cell'){const c=byId(sel.id);const h=c&&hitHandle(c,e);
    if(h){const orig=new Map(cur().cells.map(k=>[k.id,{x:k.x,y:k.y,w:k.w,h:k.h}]));const edges=[];
      if(h.includes('l'))edges.push({axis:'x',v0:c.x});if(h.includes('r'))edges.push({axis:'x',v0:c.x+c.w});
      if(h.includes('t'))edges.push({axis:'y',v0:c.y});if(h.includes('b'))edges.push({axis:'y',v0:c.y+c.h});
      edges.forEach(ed=>ed.members=linkedMembers(c,ed.axis,ed.v0));drag={kind:'resize',start:p,orig,edges,side:c.side};return;}}
  if(sel&&sel.type==='deco'){const d=decoById(sel.id);if(d&&hitDecoHandle(d,e)){drag={kind:'dscale',id:d.id,start:p,s0:d.s,cx:d.x*spW(cur()),cy:d.y*pgH(cur())};return;}}
  const t=hitText(p);
  if(t){sel={type:'text',id:t.id};drag={kind:'text',id:t.id,start:p,x0:t.x,y0:t.y};renderProps();draw();return;}
  const dk=hitDeco(p);
  if(dk&&!(UI.mode==='photo'&&dk.back)){sel={type:'deco',id:dk.id};drag={kind:'deco',id:dk.id,start:p,x0:dk.x,y0:dk.y};renderProps();draw();return;}
  const c=hitCell(p);
  if(c){const changed=!sel||sel.id!==c.id;sel={type:'cell',id:c.id};
    if(UI.mode==='layout')drag={kind:'move',id:c.id,start:p,x0:c.x,y0:c.y};
    else if(c.ph&&LIB.has(c.ph.img)){drag={kind:'pan',id:c.id,start:p,ox:c.ph.ox,oy:c.ph.oy,target:null};cv.style.cursor='grabbing';}
    if(changed)renderProps();
  }else{sel=null;renderProps();}
  draw();
});
cv.addEventListener('pointermove',e=>{
  const p=toMM(e);
  if(!drag){let curs='default';
    if(UI.mode==='layout'&&sel&&sel.type==='cell'){const c=byId(sel.id);const h=c&&hitHandle(c,e);if(h)curs=CURS[h];}
    if(sel&&sel.type==='deco'){const d=decoById(sel.id);if(d&&hitDecoHandle(d,e))curs='nwse-resize';}
    if(curs==='default'){if(hitText(p)||hitDeco(p))curs='move';else{const c=hitCell(p);if(c)curs=UI.mode==='layout'?'move':(c.ph?'grab':'pointer');}}
    if(curs!==hoverCursor){cv.style.cursor=curs;hoverCursor=curs;}return;}
  const sp=cur(),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
  if(drag.kind==='text'){const t=txtById(drag.id),W=spW(sp),H=pgH(sp);let nx=drag.x0+dx/W,ny=drag.y0+dy/H;
    if(UI.snap){for(const side of['L','R']){const pb=pageBox(sp,side),cx=(pb.x+pb.w/2)/W;if(Math.abs(nx-cx)<6/(W*view.s))nx=cx;}if(Math.abs(nx-.5)<6/(W*view.s))nx=.5;if(Math.abs(ny-.5)<6/(H*view.s))ny=.5;}t.x=nx;t.y=ny;}
  else if(drag.kind==='deco'){const d=decoById(drag.id);d.x=drag.x0+dx/spW(sp);d.y=drag.y0+dy/pgH(sp);}
  else if(drag.kind==='dscale'){const d=decoById(drag.id),r0=Math.max(1,Math.hypot(drag.start.x-drag.cx,drag.start.y-drag.cy)),r1=Math.hypot(p.x-drag.cx,p.y-drag.cy);d.s=clamp(drag.s0*r1/r0,2,400);}
  else if(drag.kind==='move'){const c=byId(drag.id),I=areaOf(sp,c.side),thrX=7/(I.w*view.s),thrY=7/(I.h*view.s),ex=new Set([c.id]);let nx=drag.x0+dx/I.w,ny=drag.y0+dy/I.h;
    const sx1=snapVal(nx,'x',ex,thrX,c.side),sx2=snapVal(nx+c.w,'x',ex,thrX,c.side)-c.w;nx=Math.abs(sx1-nx)<=Math.abs(sx2-nx)?sx1:sx2;
    const sy1=snapVal(ny,'y',ex,thrY,c.side),sy2=snapVal(ny+c.h,'y',ex,thrY,c.side)-c.h;ny=Math.abs(sy1-ny)<=Math.abs(sy2-ny)?sy1:sy2;
    c.x=clamp(nx,0,1-c.w);c.y=clamp(ny,0,1-c.h);}
  else if(drag.kind==='resize'){const I=areaOf(sp,drag.side),thrX=7/(I.w*view.s),thrY=7/(I.h*view.s);
    for(const ed of drag.edges){const ax=ed.axis,len=ax==='x'?'w':'h',d=ax==='x'?dx/I.w:dy/I.h,MIN=.02;
      let lo=0,hi=1;for(const m of ed.members){const o=drag.orig.get(m.id);if(m.side==='start')hi=Math.min(hi,o[ax]+o[len]-MIN);else lo=Math.max(lo,o[ax]+MIN);}
      const ex=new Set(ed.members.map(m=>m.id));const v=clamp(snapVal(ed.v0+d,ax,ex,ax==='x'?thrX:thrY,drag.side),lo,hi);
      for(const m of ed.members){const c=byId(m.id),o=drag.orig.get(m.id);if(m.side==='start'){c[ax]=v;c[len]=o[ax]+o[len]-v;}else{c[len]=v-o[ax];}}}}
  else if(drag.kind==='pan'){const c=byId(drag.id),h=hitCell(p);
    if(h&&h.id!==c.id){drag.target=h.id;c.ph.ox=drag.ox;c.ph.oy=drag.oy;}
    else{drag.target=null;const g=photoGeom(c.ph,cellRect(sp,c));
      if(g){if(Math.abs(g.mx)>.05)c.ph.ox=clamp(drag.ox+dx/g.mx,-1,1);if(Math.abs(g.my)>.05)c.ph.oy=clamp(drag.oy+dy/g.my,-1,1);}}}
  draw();
});
function endDrag(){
  if(!drag)return;
  if(drag.kind==='pan'&&drag.target){const a=byId(drag.id),b=byId(drag.target);const t=a.ph;a.ph=b.ph;b.ph=t;if(a.ph){a.ph.ox=a.ph.oy=0;}if(b.ph){b.ph.ox=b.ph.oy=0;}sel={type:'cell',id:b.id};toast('Foto scambiate');}
  drag=null;hoverCursor='';commit();renderProps();renderLeft();draw();
}
cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);
let wheelT=0;
stage.addEventListener('wheel',e=>{
  if(e.ctrlKey){e.preventDefault();setZoom(view.zoom*(e.deltaY<0?1.1:1/1.1));return;}
  if(UI.mode!=='photo'||!sel||sel.type!=='cell')return;
  const c=byId(sel.id),p=toMM(e);if(!c||!c.ph||hitCell(p)!==c)return;
  e.preventDefault();c.ph.zoom=clamp(c.ph.zoom*Math.exp(-e.deltaY*.0015),1,8);draw();
  clearTimeout(wheelT);wheelT=setTimeout(()=>{commit();renderProps();},300);
},{passive:false});
cv.addEventListener('dblclick',e=>{const p=toMM(e);if(hitText(p)){const ta=$('#props textarea');if(ta){ta.focus();ta.select();}return;}
  const c=hitCell(p);if(c&&!c.ph){pickFor=c.id;$('#fileIn').click();}});
function dragIds(e){try{const j=e.dataTransfer.getData('text/x-imgs');if(j)return JSON.parse(j).filter(id=>LIB.has(id));}catch(err){}return[];}
let dragKind=null;
cv.addEventListener('dragover',e=>{e.preventDefault();const p=toMM(e),sp=cur();
  const c=e.altKey||dragKind==='multi'||dragKind==='motif'?null:hitCell(p);const id=c?c.id:null;const pg=!c&&dragKind!=='motif'&&inSpread(p)?sideAt(sp,p.x):null;
  if(id!==dropTarget||pg!==dropPage){dropTarget=id;dropPage=pg;draw();}});
cv.addEventListener('dragleave',()=>{dropTarget=null;dropPage=null;draw();});
cv.addEventListener('drop',async e=>{
  e.preventDefault();e.stopPropagation();const p=toMM(e),multi=dragKind==='multi';
  const mot=e.dataTransfer.getData('text/x-motif');
  if(mot){dropTarget=null;dropPage=null;dragKind=null;addDeco(mot,p.x/spW(cur()),p.y/pgH(cur()));return;}
  dropTarget=null;dropPage=null;dragKind=null;
  let ids=dragIds(e);
  const fp=!ids.length&&e.dataTransfer.files.length?filesFromDT(e.dataTransfer):null;
  if(fp){const files=await fp;ids=await importFiles(files);if(!ids.length){syncAll();return;}
    if(new Set(files.map(folderOf)).size>1){afterImport(ids);return;}
    if(!bookHasRealPhotos()&&ids.length>8){afterImport(ids);return;}}
  if(!ids.length){draw();return;}
  const sp=cur(),c=e.altKey||multi?null:hitCell(p),pg=inSpread(p)?sideAt(sp,p.x):activeSide(sp);
  if(c&&ids.length===1){c.ph=newPh(ids[0]);sel={type:'cell',id:c.id};toast('Foto sostituita');}
  else{addToPage(sp,pg,ids);sel=null;toast(`${ids.length} foto aggiunte a ${pageLabel(UI.cur,sp.mode==='spread'?'S':pg)}`);}
  UI.side=pg;commit();syncAll();
});
window.addEventListener('dragover',e=>e.preventDefault());
window.addEventListener('drop',async e=>{e.preventDefault();if(e.dataTransfer.files.length){const fp=filesFromDT(e.dataTransfer);const ids=await importFiles(await fp);afterImport(ids);}});
window.addEventListener('dragend',()=>{dragKind=null;dropTarget=null;dropPage=null;draw();});
window.addEventListener('paste',async e=>{const fs=[...(e.clipboardData?.files||[])];if(!fs.length)return;const ids=await importFiles(fs);if(!ids.length)return;
  const c=sel&&sel.type==='cell'&&byId(sel.id);if(c&&!c.ph){c.ph=newPh(ids[0]);commit();syncAll();toast('Foto incollata');}else afterImport(ids);});

let pickFor=null;
$('#fileIn').addEventListener('change',async e=>{const files=[...e.target.files];e.target.value='';const ids=await importFiles(files);if(!ids.length){syncAll();return;}
  if(pickFor&&byId(pickFor)&&ids.length===1){byId(pickFor).ph=newPh(ids[0]);sel={type:'cell',id:pickFor};pickFor=null;commit();syncAll();return;}
  pickFor=null;afterImport(ids);});
$('#dirIn').addEventListener('change',async e=>{const files=[...e.target.files];e.target.value='';const ids=await importFiles(files);afterImport(ids);});
