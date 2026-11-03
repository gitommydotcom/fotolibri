/* ============ impaginazione automatica ============ */
const WZ={effect:true,quotes:1,stickers:1,sub:'',dedica:'',title:'I nostri ricordi',min:2,target:4,max:6,group:'day',gapH:3,subDay:false,newSpread:false,titles:true,opener:'band',favFull:true,similar:true,cover:true,order:'date',pagesMode:'auto',pages:40,userGroup:false};
function splitSizes(k,o,R){
  const mn=Math.max(1,o.min|0),mx=Math.max(mn,o.max|0),t=clamp(o.target|0||mn,mn,mx);
  let p=Math.max(Math.ceil(k/mx),Math.round(k/t)||1);p=Math.min(p,Math.max(1,Math.floor(k/mn)));p=Math.max(p,Math.ceil(k/mx));
  const s=Array(p).fill(Math.floor(k/p));for(let i=0;i<k%p;i++)s[i]++;
  for(let i=0;i+1<p;i+=2){if(R()<.6){const d=R()<.5?1:-1,a=s[i]+d,b=s[i+1]-d;if(a>=mn&&a<=mx&&b>=mn&&b<=mx){s[i]=a;s[i+1]=b;}}}
  return s;
}
function splitExact(k,p){p=clamp(p|0,1,Math.max(1,k));const s=Array(p).fill(Math.floor(k/p));for(let i=0;i<k%p;i++)s[i]++;return s;}
function splitLargest(pages,from=0){let bi=-1;for(let i=from;i<pages.length;i++){const p=pages[i];if(!p.blank&&!p.full&&p.ids.length>=2&&(bi<0||p.ids.length>pages[bi].ids.length))bi=i;}
  if(bi<0)return false;const p=pages[bi],h=Math.ceil(p.ids.length/2);pages.splice(bi,1,{...p,ids:p.ids.slice(0,h)},{ids:p.ids.slice(h),title:null});return true;}
function groupTitle(g){const ds=g.map(id=>LIB.get(id).date).filter(d=>d!=null);if(!ds.length)return null;
  const a=Math.min(...ds),b=Math.max(...ds);if(dayKey(a)===dayKey(b))return fmtDay(a);
  const A=new Date(a),B=new Date(b);
  if(A.getMonth()===B.getMonth()&&A.getFullYear()===B.getFullYear())return`${A.getDate()}–${fmtDay(b,false)}`;
  return`${fmtDay(a,false)} – ${fmtDay(b,false)}`;}
/* capitoli = cartelle */
function cleanFolder(f){if(!f)return'Foto sparse';const last=f.split('/').filter(Boolean).pop()||f;
  const t=last.replace(/^\d+[\s._\-)]*/,'').replace(/_+/g,' ').replace(/\s+/g,' ').trim();return cap(t||last);}
function syncChapters(){
  const counts=new Map();for(const e of LIB.values())if(!e.sample)counts.set(e.folder||'',(counts.get(e.folder||'')||0)+1);
  const known=new Set(BOOK.chapters.map(c=>c.folder));
  BOOK.chapters=BOOK.chapters.filter(c=>counts.has(c.folder));
  const fresh=[...counts.keys()].filter(f=>!known.has(f)).sort((a,b)=>a.localeCompare(b,'it',{numeric:true}));
  for(const f of fresh)BOOK.chapters.push({folder:f,title:cleanFolder(f),on:true});
}
function folderGroups(ids,o){
  const by=new Map();for(const id of ids){const f=LIB.get(id).folder||'';if(!by.has(f))by.set(f,[]);by.get(f).push(id);}
  const out=[];
  for(const ch of BOOK.chapters){if(!ch.on)continue;const g=by.get(ch.folder);if(!g||!g.length)continue;
    if(o.subDay){let sub=[],prev=null,first=true;
      const push=()=>{out.push({ids:sub,title:first?ch.title:null,sub:groupTitle(sub),start:first});first=false;sub=[];};
      for(const id of g){const d=LIB.get(id).date;if(prev!=null&&d!=null&&dayKey(d)!==dayKey(prev)&&sub.length)push();sub.push(id);if(d!=null)prev=d;}
      if(sub.length)push();}
    else out.push({ids:g,title:ch.title,sub:groupTitle(g),start:true});}
  return out;
}
function planBook(o,exclSet){
  const R=rng(4242);
  let ids=ORDER.filter(id=>{const e=LIB.get(id);return e&&!e.excl&&!(exclSet&&exclSet.has(id))&&(e.thumbBmp||e.prevBlob||e.file);});
  const byName=(a,b)=>LIB.get(a).name.localeCompare(LIB.get(b).name,'it',{numeric:true});
  if(o.order==='name')ids.sort(byName);else ids.sort((a,b)=>((LIB.get(a).date??9e15)-(LIB.get(b).date??9e15))||byName(a,b));
  let groups=[];
  if(o.group==='folder')groups=folderGroups(ids,o);
  else if(o.group==='none'||o.order==='name')groups=[{ids,title:null,start:true}];
  else{let g=[],prev=null;const push=()=>{groups.push({ids:g,title:groupTitle(g),start:true});g=[];};
    for(const id of ids){const d=LIB.get(id).date;let split=false;
      if(prev!=null&&d!=null)split=o.group==='day'?dayKey(d)!==dayKey(prev):(d-prev)>o.gapH*3600000;
      if(split&&g.length)push();g.push(id);if(d!=null)prev=d;}
    if(g.length)push();}
  const useTitles=o.titles&&(groups.length>1||o.group==='folder');
  const qEvery=o.quotes>=2?1:o.quotes===1?2:0,nq=qEvery&&groups.length>1?Math.floor((groups.length-1)/qEvery):0;
  const off=versoOn()?0:(BOOK.firstRight?1:0),pages=[],ded=!versoOn()&&o.dedica&&o.dedica.trim()?1:0;if(ded)pages.push({ids:[],dedica:true});
  let alloc=null;
  if(o.pagesMode==='fixed'&&groups.length){
    const tp=(useTitles&&o.opener==='page'?groups.filter(g=>g.title).length:0)+nq;
    const avail=Math.max(groups.length,o.pages-off-tp-ded);
    const tot=groups.reduce((a,g)=>a+g.ids.length,0)||1;
    const raw=groups.map(g=>g.ids.length/tot*avail);alloc=raw.map(v=>Math.max(1,Math.floor(v)));
    let rest=avail-alloc.reduce((a,b)=>a+b,0);const ord=raw.map((v,i)=>[v-Math.floor(v),i]).sort((a,b)=>b[0]-a[0]);
    for(let k=0;rest>0&&k<ord.length*20;k++){const i=ord[k%ord.length][1];if(alloc[i]<groups[i].ids.length){alloc[i]++;rest--;}}
    alloc=alloc.map((a,i)=>Math.min(a,groups[i].ids.length));
  }
  groups.forEach((g,gi)=>{
    if(!g.ids.length)return;
    if(qEvery&&gi>0&&gi%qEvery===0&&groups.length>1)pages.push({ids:[],quote:true});
    if(o.newSpread&&g.start&&pages.length&&(pages.length+off)%2===1){if(!splitLargest(pages))pages.push({ids:[],blank:true});}
    const titled=useTitles&&!!g.title;
    if(titled&&o.opener==='page')pages.push({ids:[],titlePage:true,title:g.title,sub:o.group==='folder'?g.sub:null});
    const start=pages.length;
    const segs=[];let run=[];
    g.ids.forEach((id,i)=>{const opener=titled&&o.opener==='photo'&&i===0;
      if(opener||(o.favFull&&LIB.get(id).fav)){if(run.length)segs.push(run);segs.push({solo:id,opener});run=[];}else run.push(id);});
    if(run.length)segs.push(run);
    const runs=segs.filter(s=>Array.isArray(s)),solos=segs.length-runs.length;
    let runPages=null;
    if(alloc&&runs.length){const target=Math.max(runs.length,alloc[gi]-solos);const tl=runs.reduce((a,r)=>a+r.length,0)||1;
      runPages=runs.map(r=>Math.max(1,Math.round(r.length/tl*target)));
      let diff=target-runPages.reduce((a,b)=>a+b,0);
      for(let k=0;diff!==0&&k<500;k++){const i=k%runPages.length;if(diff>0&&runPages[i]<runs[i].length){runPages[i]++;diff--;}else if(diff<0&&runPages[i]>1){runPages[i]--;diff++;}}}
    let ri=0;
    for(const s of segs){
      if(!Array.isArray(s)){pages.push({ids:[s.solo],full:true,overlay:s.opener?g.title:null});continue;}
      const sizes=runPages?splitExact(s.length,runPages[ri]):splitSizes(s.length,o,R);ri++;
      let i=0;for(const sz of sizes){pages.push({ids:s.slice(i,i+sz)});i+=sz;}
    }
    if(titled&&o.opener==='band'&&pages[start])pages[start].title=g.title;
  });
  if(qEvery&&groups.length<=1){const step=o.quotes>=2?8:16;for(let k=step;k<pages.length-2;k+=step+1)pages.splice(k,0,{ids:[],quote:true});}
  let guard=0;
  if(o.pagesMode==='fixed'){while(pages.length+off<o.pages&&guard++<600){if(!splitLargest(pages))pages.push({ids:[],blank:true});}}
  else if(BOOK.mult4&&pages.length){const want=Math.ceil((pages.length+off)/4)*4;while(pages.length+off<want&&guard++<8){if(!splitLargest(pages))pages.push({ids:[],blank:true});}}
  if((pages.length+off)%2===1){if(!splitLargest(pages))pages.push({ids:[],blank:true});}
  return pages;
}

/* ============ generazione a tema: copertina, risguardi, titoli ============ */
const FONT_SCALE={'Great Vibes':1.35,'Dancing Script':1.12,'Pacifico':.9,'Amatic SC':1.4,'Bebas Neue':1.25,'Caveat':1.25,'Fredoka':.95,'Josefin Sans':.92,'Mountains of Christmas':1.1,'Cormorant Garamond':1.12};
const fScale=f=>FONT_SCALE[f]||1;
const ptOf=mm=>mm*72/25.4;
/* riduce il corpo finché il testo sta nella larghezza indicata (mm) */
function fitText(t,maxW){for(let i=0;i<40;i++){const m=measureText(mctx,t,1);if(m.w<=maxW||t.size<=6)break;t.size=Math.max(6,+(t.size*.94).toFixed(1));}return t;}
function roleText(sp,role,text,x,y,size,extra){const T=TH();return mkText({role,text,x,y,size,...roleStyle(role,T,bgOf(sp)),...(extra||{})});}
function makeCoverEmpty(){const sp=mkSpread('cover');return sp;}
function makeEndpaper(kind){const sp=mkSpread(kind);return sp;}
/* foto per la copertina: preferite prima, poi le prime orizzontali */
function coverPicks(ids,n){const favs=ids.filter(id=>LIB.get(id)&&LIB.get(id).fav),rest=ids.filter(id=>!favs.includes(id));return[...favs,...rest].slice(0,n);}
function makeCover(o,ids,keep){
  const T=TH(),sp=mkSpread('cover'),W=spW(sp),H=pgH(sp),pw=coverPW(),sv=BOOK.cover.spine,P=pageBox(sp,'R'),sf=BOOK.safe+2,L=T.coverLayout;
  const M=meta(sp,'R');M.full=true;M.lay='cover:'+L;
  const bgS=T.coverBg||'motivo';
  if(bgS==='tinta')sp.pat='none';
  else if(bgS==='fitto')sp.pat=T.endPattern?clone(T.endPattern):(T.coverPattern?{...clone(T.coverPattern),gap:(T.coverPattern.gap||20)*.7}:'none');
  else if(bgS==='chiaro'){sp.bg=T.colors.paper;const pp=T.pagePattern||T.coverPattern;sp.pat=pp?{...clone(pp),op:Math.min(.3,Math.max(.12,(pp.op||.1)*2))}:'none';}
  const want=L==='collage'?3:L==='type'?0:1;
  const phs=(keep&&keep.phs&&keep.phs.length?keep.phs:coverPicks(ids,want).map(newPh)).slice(0,want);
  while(phs.length<want)phs.push(null);
  const fx=mm=>mm/W,fy=mm=>mm/H,cx=fx(P.x+P.w/2),minD=Math.min(P.w,H);
  if(bgS==='sfocata'&&phs[0]&&L!=='full'){meta(sp,'L').full=true;for(const side of['L','R']){const c=mkCell([0,0,1,1],side);c.bgPh=true;c.ph={...phs[0],blur:24,br:78,sat:90,ox:side==='L'?-.6:.6,oy:0,zoom:1.15};sp.cells.push(c);}}
  const add=(d,shape,ph,border)=>{const c=mkCell(d,'R');c.shape=shape||null;c.ph=ph||null;if(c.ph){c.ph.ox=0;c.ph.oy=0;c.ph.zoom=1;}if(border){c.bw=border;c.bc=T.colors.paper==='#151515'?'#ffffff':'#ffffff';}sp.cells.push(c);return c;};
  let ty=.8,sy=.89;/* posizione titolo e sottotitolo (frazione dell'altezza) */
  const sq=(dmm,top)=>{const w=dmm/P.w,h=dmm/H;return[(1-w)/2,top,w,h];};
  if(L==='full'){add([0,0,1,1],null,phs[0]);ty=1-fy(sf+18);sy=ty-fy(minD*.09);}
  else if(L==='framed'){const r=P.w/H;const w=r>1.15?.7:.76,h=r>1.15?.64:.6;add([(1-w)/2,.085,w,h],null,phs[0],T.colors.cover&&lum(T.colors.cover)<200?2.2:0);ty=.085+h+(1-.085-h)*.42;sy=ty+(1-ty)*.45;}
  else if(L==='arch'){const w=Math.min(.64,(H*.62)/P.w*.78),h=.62;add([(1-w)/2,.08,w,h],'arch',phs[0]);ty=.81;sy=.9;}
  else if(L==='circle'||L==='heart'){const d=Math.min(P.w*.66,H*(L==='heart'?.64:.6));const c=add(sq(d,.07),L,phs[0]);ty=c.y+c.h+(1-c.y-c.h)*.42;sy=ty+(1-ty)*.48;}
  else if(L==='collage'){const g=.025,w=(.86-2*g)/3,h=Math.min(.5,(w*P.w*1.3)/H);for(let i=0;i<3;i++)add([.07+i*(w+g),.12,w,h],'round',phs[i]);ty=.12+h+(1-.12-h)*.4;sy=ty+(1-ty)*.45;}
  else{ty=.46;sy=.58;}
  const title=keep&&keep.title!=null?keep.title:fillTpl(o.title||T.texts.title),sub=keep&&keep.sub!=null?keep.sub:fillTpl(o.sub!=null&&o.sub!==''?o.sub:T.texts.sub);
  const big=L==='type'?.13:L==='full'?.1:.085;
  const tt=roleText(sp,'cover-title',title,cx,ty,clamp(ptOf(minD*big)*fScale(T.fonts.title),18,140));
  if(L==='full'||(bgS==='sfocata'&&phs[0])){tt.color='#ffffff';tt.shadow=true;}
  fitText(tt,P.w-2*sf-6);sp.texts.push(tt);
  if(sub){const st=roleText(sp,'cover-sub',sub,cx,sy,clamp(ptOf(minD*.03)*fScale(T.fonts.sub),8,30));if(L==='full'||(bgS==='sfocata'&&phs[0])){st.color='#ffffff';st.shadow=true;}fitText(st,P.w-2*sf-6);sp.texts.push(st);}
  if(sv>=6){const s=roleText(sp,'spine',title,fx(pw+sv/2),.5,clamp(ptOf(sv*.42),5,28),{rot:90});fitText(s,H-2*sf-10);sp.texts.push(s);}
  if(sub)sp.texts.push(roleText(sp,'back',sub,fx(pw/2),1-fy(sf+8),clamp(ptOf(minD*.022),7,14)));
  themeDecos(sp);
  return sp;
}
function coverKeep(sp){if(!sp)return null;const g=r=>{const t=sp.texts.find(t=>t.role===r);return t?t.text:null;};
  return{phs:sp.cells.filter(c=>c.ph&&!c.bgPh).map(c=>({...c.ph,ox:0,oy:0,zoom:1})),title:g('cover-title'),sub:g('cover-sub')};}
function rebuildCover(){const i=BOOK.spreads.findIndex(isCover);if(i<0)return;const old=BOOK.spreads[i],keep=coverKeep(old);
  const used=[...usage().keys()];const sp=makeCover({},used,keep);sp.id=old.id;
  if(keep.phs.length<(TH().coverLayout==='collage'?3:1)){const more=coverPicks(used.filter(id=>!keep.phs.some(p=>p.img===id)),3);let k=0;for(const c of sp.cells)if(!c.ph&&more[k])c.ph=newPh(more[k++]);}
  BOOK.spreads[i]=sp;}
function titleText(sp,side,txt){
  const V=visBox(sp,side),st=BOOK.style,M=meta(sp,side),W=spW(sp),H=pgH(sp);
  const top=V.y+st.margin,bh=(V.h-2*st.margin)*M.band;
  const t=roleText(sp,'band',txt,(V.x+V.w/2)/W,(top+bh*.5)/H,clamp(Math.round(ptOf(bh*.42)*fScale(TH().fonts.title)),12,40));
  return fitText(t,V.w*.7);
}
function titlePageTexts(sp,side,pg){
  const V=visBox(sp,side),W=spW(sp),H=pgH(sp),x=(V.x+V.w/2)/W,T=TH();
  const t=roleText(sp,'chapter',pg.title,x,(V.y+V.h*.47)/H,clamp(Math.round(ptOf(Math.min(V.h,V.w)*.075)*fScale(T.fonts.title)),20,72));fitText(t,V.w-2*BOOK.safe-10);
  const out=[t];
  if(pg.sub)out.push(fitText(roleText(sp,'chapter-sub',pg.sub,x,(V.y+V.h*.57)/H,10),V.w-2*BOOK.safe-10));
  return out;
}
function dedicaTexts(sp,side,txt){
  const V=visBox(sp,side),W=spW(sp),H=pgH(sp),T=TH();
  const t=roleText(sp,'dedica',txt,(V.x+V.w/2)/W,(V.y+V.h*.5)/H,clamp(Math.round(ptOf(Math.min(V.h,V.w)*.05)*fScale(T.fonts.title)),14,48));
  return[fitText(t,V.w-2*BOOK.safe-16)];
}
function overlayText(sp,side,txt){const V=visBox(sp,side),W=spW(sp),H=pgH(sp);
  const t=roleText(sp,'overlay',txt,(V.x+V.w/2)/W,clamp((V.y+V.h-(BOOK.safe+16))/H,.7,.9),clamp(Math.round(ptOf(Math.min(V.h,V.w)*.06)*fScale(TH().fonts.title)),18,56));
  return fitText(t,V.w-2*BOOK.safe-10);}
/* decorazioni automatiche del tema (contrassegnate auto: si rigenerano cambiando tema) */
function themeDecos(sp){
  const T=TH();sp.decos=(sp.decos||[]).filter(d=>!d.auto);autoStickers(sp);if(T.deco<1)return;
  const W=spW(sp),H=pgH(sp),orn=T.ornament,mc=T.motifColors&&T.motifColors.length?T.motifColors:[T.colors.accent],acc=T.colors.accent;
  const put=(m,xmm,ymm,smm,o={})=>{if(!MOTIFS[m])return;sp.decos.push(mkDeco({m,x:xmm/W,y:ymm/H,s:smm,c:o.c||acc,c2:o.c2||T.c2||T.colors.accent2,rot:o.rot||0,op:o.op==null?1:o.op,flip:!!o.flip,auto:true}));};
  const tb=t=>{const b=textBox(sp,t);return b;};
  for(const t of sp.texts){
    if(!orn)break;
    const b=tb(t),hh=b.y1-b.y0,ww=b.x1-b.x0;
    if(t.role==='chapter'||t.role==='dedica'){const s=clamp(hh*1.5,12,34);
      if(orn==='flourish'||orn==='rule')put(orn,b.cx,b.y1+s*.5,Math.min(70,ww*.8),{c:acc});
      else{put(orn,b.cx,b.y0-s*.75,s,{c:mc[0]});}}
    else if(t.role==='band'&&T.deco>=1){const s=Math.max(5,hh*.7);
      if(orn==='flourish'||orn==='rule'){put(orn,b.cx,b.y1+s*.35,Math.min(50,ww*.7),{c:acc});}
      else{put(orn,b.x0-s*.9,b.cy,s,{c:mc[0],rot:-12});put(orn,b.x1+s*.9,b.cy,s,{c:mc[0],rot:12,flip:true});}}
  }
  if(isCover(sp)){
    const P=pageBox(sp,'R'),L=T.coverLayout,ttl=sp.texts.find(t=>t.role==='cover-title'),cell=sp.cells.find(c=>c.side==='R'&&!c.bgPh);
    const minD=Math.min(P.w,H),onC=lum(bgOf(sp))<140?mix(mc[0],'#ffffff',.15):mc[0];
    if(ttl&&L!=='full'&&orn){const b=tb(ttl),s=clamp((b.y1-b.y0)*.55,6,22);
      if(orn==='flourish'||orn==='rule')put(orn,b.cx,b.y1+s*.6,Math.min(80,(b.x1-b.x0)*.7),{c:T.colors.accent2&&lum(T.colors.cover)<140?T.colors.accent2:acc});
      else if(L==='type')put(orn,b.cx,b.y0-s*1.3,s*1.5,{c:onC});}
    if(cell&&T.motifs&&T.motifs.length&&L!=='full'&&L!=='type'&&!['flourish','rule'].includes(T.motifs[0])){
      const r=cellRect(sp,cell),s=minD*.15,m1=T.motifs[0],m2=T.motifs[1]||m1;
      if(L==='framed'||L==='collage'){put(m1,r.x+s*.15,r.y+s*.12,s,{c:onC,rot:-18});put(m2,r.x+r.w-s*.15,r.y+r.h-s*.1,s*.85,{c:mc[1%mc.length],rot:15});}
      else{put(m1,r.x+r.w*.1,r.y+r.h*.86,s*.9,{c:onC,rot:-14});put(m2,r.x+r.w*.9,r.y+r.h*.88,s*.75,{c:mc[1%mc.length],rot:14,flip:true});}}
    if(L==='type'&&T.motifs&&T.motifs.length&&T.deco>=1&&!['flourish','rule'].includes(T.motifs[0])){/* cornice di motivi agli angoli */
      const s=minD*.1;[[.14,.12],[.86,.12],[.14,.88],[.86,.88]].forEach(([a,b],k)=>put(T.motifs[k%T.motifs.length],P.x+P.w*a,H*b,s,{c:mc[k%mc.length],rot:(k%2?1:-1)*15}));}
    if(T.deco>=1&&T.motifs&&T.motifs.length&&!['flourish','rule'].includes(T.motifs[0])){const B=pageBox(sp,'L');put(orn&&MOTIFS[orn]?orn:T.motifs[0],B.x+B.w/2,H*.46,minD*.12,{c:onC});}
  }
}
function applyTheme(id,opts={}){
  const oldT=TH();const keepDeco=BOOK.theme.deco==null?1:BOOK.theme.deco;
  BOOK.theme={id,colors:{},fonts:{},deco:keepDeco,coverLayout:null,stickers:BOOK.theme.stickers||0};
  const T=TH();
  Object.assign(BOOK.style,{radius:0,borderW:0,shadow:0,borderColor:'#ffffff',...(T.frame||{})});
  for(const sp of BOOK.spreads){if(!opts.keepBg){sp.bg=null;if(isEnd(sp)){sp.pat=null;sp.endv=null;sp.cells=sp.cells.filter(c=>!c.epPh);if(!sp.cells.length)sp.mode='pages';}}
    for(const t of sp.texts){if(!t.role)continue;
      const st=roleStyle(t.role,T,bgOf(sp));const of=t.font;Object.assign(t,st);
      t.size=+(t.size/fScale(of)*fScale(t.font)).toFixed(1);
      if(t.role==='cover-title'&&t.text===fillTpl(oldT.texts.title))t.text=fillTpl(T.texts.title);
      if((t.role==='cover-sub'||t.role==='back')&&t.text===fillTpl(oldT.texts.sub))t.text=fillTpl(T.texts.sub);}
    themeDecos(sp);}
  rebuildCover();
}
function buildBook(o){
  if(o.similar)applySimilar();
  const pages=planBook(o);
  if(!pages.some(p=>p.ids.length)){toast('Non ci sono foto da impaginare: aggiungine qualcuna.');return false;}
  const seq=versoOn()?[{ids:[],frontis:true},...pages,{ids:[],closing:true}]:(BOOK.firstRight?[{ids:[],blank:true}]:[]).concat(pages);if(seq.length%2)seq.push({ids:[],blank:true});
  let qk=0;
  const R=rng(777);BOOK.spreads=[];
  const used=pages.flatMap(p=>p.ids);
  BOOK.cover.on=!!o.cover;
  BOOK.theme.stickers=o.stickers==null?(BOOK.theme.stickers||0):o.stickers;
  if(o.cover)BOOK.spreads.push(makeCover(o,used));
  let prev=null;
  for(let i=0;i<seq.length;i+=2){const sp=mkSpread('inner');BOOK.spreads.push(sp);
    [['L',seq[i]],['R',seq[i+1]]].forEach(([side,pg])=>{if(!pg||pg.blank)return;
      if(pg.dedica){sp.texts.push(...dedicaTexts(sp,side,o.dedica.trim()));meta(sp,side).special='dedica';return;}
      if(pg.frontis){if(o.dedica&&o.dedica.trim())buildSpecial(sp,side,'dedica',{text:o.dedica.trim()});else buildSpecial(sp,side,'chapter',{text:fillTpl(o.title||TH().texts.title),sub:fillTpl(o.sub||TH().texts.sub)});meta(sp,side).special='frontis';return;}
      if(pg.closing){buildSpecial(sp,side,'quote',{quote:QUOTES.fine[Math.floor(rng(hashStr(BOOK.job.id))()*QUOTES.fine.length)]});return;}
      if(pg.quote){buildSpecial(sp,side,(qk++)%2?'quote-color':'quote');return;}
      if(pg.titlePage){sp.texts.push(...titlePageTexts(sp,side,pg));meta(sp,side).special='chapter';return;}
      if(!pg.ids.length)return;const M=meta(sp,side);
      M.full=!!pg.full&&!pg.title;if(pg.title)M.band=.13;
      const ch=relayoutPage(sp,side,{phs:pg.ids.map(newPh),rng:R,avoid:prev&&prev.key,avoidSig:prev&&shapeSig(prev.defs)});prev=ch;
      if(pg.title)sp.texts.push(titleText(sp,side,pg.title));
      if(pg.overlay)sp.texts.push(overlayText(sp,side,pg.overlay));});
    themeDecos(sp);}
  ensureStructure();
  if(o.title&&(!BOOK.job.name||BOOK.job.name==='Nuovo fotolibro'))BOOK.job.name=o.title;
  UI.cur=Math.max(0,BOOK.spreads.findIndex(isInner));UI.side='L';sel=null;commit();syncAll();
  toast(`Libro creato: ${used.length} foto, ${bookPages()} pagine in tutto. Tutto si può modificare.`,4500);
  if(o.effect)addEffectAfterBuild(used);
  return true;
}

/* dopo la creazione: cerca le foto migliori e sostituisce una doppia pagina centrale con la pagina effetto (foto ridistribuite) */
async function addEffectAfterBuild(ids){
  try{progress('Cerco le foto migliori per la pagina effetto…',0,1);
    const best=await fxFindBest(ids,(a,b)=>progress('Cerco le foto migliori per la pagina effetto…',a,b));
    progress(null);if(!best.length){toast('Pagina effetto saltata: nessuna foto con una persona o un animale ben visibile. Il resto del libro è pronto.',4500);return;}
    const inn=BOOK.spreads.map((s,i)=>[s,i]).filter(([s,i])=>isInner(s)&&i!==firstInnerIdx()&&i!==lastInnerIdx()&&!isSpecial(s,'L')&&!isSpecial(s,'R')&&s.mode!=='spread');
    if(!inn.length){toast('Pagina effetto saltata: il libro è troppo corto per ospitarla.');return;}
    const mid=(firstInnerIdx()+lastInnerIdx())/2,[sp,i]=inn.sort((a,b)=>Math.abs(a[1]-mid)-Math.abs(b[1]-mid))[0];
    const phs=[...clearSide(sp,'L'),...clearSide(sp,'R')].filter(ph=>!usedInInterior(ph.img,sp));
    const fx=makeEffectSpread(best[0],best[1]||null);fx.id=sp.id+'x';BOOK.spreads.splice(i,1,fx);normalizeOrder();
    for(const c of fx.cells)if(c.fx==='pop')fxPopFrame(fx,c);themeDecos(fx);
    const r=redistribute(phs,pageNum(BOOK.spreads.indexOf(fx),'L'));
    THUMBS.clear();commit();syncAll();toast(`Pagina effetto creata (pag. ${spreadLabel(BOOK.spreads.indexOf(fx))})${redistMsg(r)}`,5000);
  }catch(e){progress(null);console.warn(e);toast('Pagina effetto non disponibile: '+(FX.failed||e.message),5000);}
}
