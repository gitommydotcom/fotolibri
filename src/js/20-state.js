/* ============ dati fissi ============ */
const PAGE_PRESETS=[
  ['Orizzontale 29,7×21 cm (A4)',297,210],
  ['Quadrato 20×20 cm',200,200],['Quadrato 21×21 cm',210,210],['Quadrato 25×25 cm',250,250],['Quadrato 30×30 cm',300,300],
  ['Orizzontale 28×21 cm',280,210],['Orizzontale 30×20 cm',300,200],['Orizzontale 32×24 cm',320,240],['Orizzontale 40×30 cm',400,300],
  ['Verticale 21×28 cm',210,280],['Verticale 21×29,7 cm (A4)',210,297],['Verticale 24×30 cm',240,300],
  ['A5',148,210],['A3',297,420],['Foto 20×30 cm',200,300],['Foto 30×40 cm',300,400]
];
function grid(r,c){const a=[];for(let i=0;i<r;i++)for(let j=0;j<c;j++)a.push([j/c,i/r,1/c,1/r]);return a;}
const T3=1/3,T23=2/3;
const TEMPLATES=[
  ['Piena',[[0,0,1,1]]],
  ['Passe-partout',[[.1,.1,.8,.8]]],
  ['Affiancate',grid(1,2)],
  ['In colonna',grid(2,1)],
  ['Grande + stretta',[[0,0,.64,1],[.64,0,.36,1]]],
  ['3 colonne',grid(1,3)],
  ['3 righe',grid(3,1)],
  ['Grande + 2',[[0,0,.6,1],[.6,0,.4,.5],[.6,.5,.4,.5]]],
  ['Grande + 2 sotto',[[0,0,1,.62],[0,.62,.5,.38],[.5,.62,.5,.38]]],
  ['2 sopra + grande',[[0,0,.5,.4],[.5,0,.5,.4],[0,.4,1,.6]]],
  ['2 × 2',grid(2,2)],
  ['Grande + 3',[[0,0,.64,1],[.64,0,.36,T3],[.64,T3,.36,T3],[.64,T23,.36,T3]]],
  ['Grande + 3 sotto',[[0,0,1,.64],[0,.64,T3,.36],[T3,.64,T3,.36],[T23,.64,T3,.36]]],
  ['Striscia',grid(1,4)],
  ['2 + 3',[[0,0,.5,.5],[.5,0,.5,.5],[0,.5,T3,.5],[T3,.5,T3,.5],[T23,.5,T3,.5]]],
  ['Grande + 4',[[0,0,.5,1],[.5,0,.25,.5],[.75,0,.25,.5],[.5,.5,.25,.5],[.75,.5,.25,.5]]],
  ['Banda centrale',[[0,0,1,.25],[0,.25,T3,.5],[T3,.25,T3,.5],[T23,.25,T3,.5],[0,.75,1,.25]]],
  ['2 × 3',grid(2,3)],
  ['3 × 2',grid(3,2)],
  ['Sfalsato',[[0,0,T3,.6],[0,.6,T3,.4],[T3,0,T3,.4],[T3,.4,T3,.6],[T23,0,T3,.6],[T23,.6,T3,.4]]],
  ['Grande + 5',[[0,0,T23,T23],[T23,0,T3,T3],[T23,T3,T3,T3],[0,T23,T3,T3],[T3,T23,T3,T3],[T23,T23,T3,T3]]],
  ['Mosaico',[[0,0,.5,T3],[.5,0,.5,T3],[0,T3,T3,T3],[T3,T3,T3,T3],[T23,T3,T3,T3],[0,T23,.5,T3],[.5,T23,.5,T3]]],
  ['Centro + lati',[[0,0,.25,T3],[0,T3,.25,T3],[0,T23,.25,T3],[.25,0,.5,1],[.75,0,.25,T3],[.75,T3,.25,T3],[.75,T23,.25,T3]]],
  ['2 × 4',grid(2,4)],
  ['3 × 3',grid(3,3)],
];
const SHAPES=[[null,'Rettangolo'],['round','Arrotondato'],['circle','Ovale'],['arch','Arco'],['heart','Cuore']];

/* ============ stato ============ */
const newBook=()=>({v:2,job:{id:uid(),name:'Nuovo fotolibro'},page:{preset:'Orizzontale 29,7×21 cm (A4)',w:297,h:210},
  cover:{on:true,spine:8,wrap:15,over:3},
  endp:{on:true,w:650,h:330,fold:325,bleed:0,visW:0,visH:0},
  firstRight:false,safe:5,mult4:true,
  style:{margin:10,bind:15,gutter:4,radius:0,borderW:0,borderColor:'#ffffff',shadow:0},
  theme:{id:'neutro',colors:{},fonts:{},deco:1,coverLayout:null},
  spreads:[],chapters:[]});
function normBook(b){const d=newBook();b.job=b.job||d.job;b.page={...d.page,...(b.page||{})};
  b.cover={...d.cover,...(b.cover||{})};b.endp={...d.endp,...(b.endp||{})};b.style={...d.style,...(b.style||{})};
  b.theme={...d.theme,...(b.theme||{})};
  if(b.style.bg&&b.theme.id==='neutro'&&!b.theme.colors.paper&&b.style.bg!=='#ffffff')b.theme.colors.paper=b.style.bg;delete b.style.bg;
  for(const k of['safe','mult4','firstRight'])if(b[k]==null)b[k]=d[k];b.chapters=b.chapters||[];b.spreads=b.spreads||[];
  for(const sp of b.spreads){sp.decos=sp.decos||[];sp.texts=sp.texts||[];sp.cells=sp.cells||[];sp.meta=sp.meta||{};if(sp.pat===undefined)sp.pat=null;}
  return b;}
let BOOK=newBook();
const UI={cur:0,side:'R',mode:'photo',tab:'photos',filter:'all',folder:'*',sort:'date',link:true,snap:true,guides:true};
const view={zoom:1,s:1,ox:0,oy:0,b:0,cw:0,ch:0,dpr:1};
const EXP={fmt:'pdf',dpi:300,quality:92,bleed:3,marks:false,name:'fotolibro',cover:true,endp:true,inner:true,pages:'single',from:1,to:9999,zipAll:false};
const DRAFT={pdf:true,flip:true,dpi:120,quality:82,wm:true,wmText:'BOZZA',pages:'spread',name:'fotolibro'};
const LIB=new Map();let ORDER=[];let SIMS=[];
const PREV=new Map();const TSEL=new Set();let lastTSel=null;let thumbGen=0;
let sel=null,drag=null,dropTarget=null,dropPage=null,hoverCursor='';
const mctx=document.createElement('canvas').getContext('2d');
const cur=()=>BOOK.spreads[UI.cur];
const isCover=sp=>!!sp&&sp.kind==='cover';
const isEnd=sp=>!!sp&&(sp.kind==='endF'||sp.kind==='endB');
const isInner=sp=>!!sp&&sp.kind==='inner';
const mkMeta=()=>({lay:null,band:0,full:false});
const mkSpread=kind=>({id:uid(),kind,mode:'pages',bg:null,pat:null,cells:[],texts:[],decos:[],meta:{L:mkMeta(),R:mkMeta(),S:mkMeta()}});
const mkCell=(d,side)=>({id:uid(),side,x:d[0],y:d[1],w:d[2],h:d[3],fill:null,ph:null,shape:null});
const newPh=img=>({img,zoom:1,ox:0,oy:0,rot:0,flip:false,flipV:false,fit:'cover',br:100,ct:100,sat:100,gray:0,sepia:0,blur:0});
const T0={rot:0,ls:0,lh:1.15,op:100,boxColor:'#000000',boxOp:0,strokeW:0,strokeColor:'#000000',shadow:false,bold:false,italic:false,upper:false,align:'center'};
const mkText=o=>({...T0,id:uid(),text:'Testo',font:'Montserrat',size:24,color:'#222222',x:.5,y:.5,...o});
const mkDeco=o=>({id:uid(),m:'star',x:.5,y:.5,s:20,rot:0,c:'#C9A227',c2:null,op:1,flip:false,auto:false,...o});
const byId=id=>cur()?cur().cells.find(c=>c.id===id):null;
const txtById=id=>cur()?cur().texts.find(t=>t.id===id):null;
const decoById=id=>cur()?cur().decos.find(t=>t.id===id):null;
let _thK='',_th=null;
function TH(){const k=JSON.stringify(BOOK.theme);if(k!==_thK){_thK=k;_th=resolveTheme(BOOK.theme);}return _th;}

/* struttura: copertina, risguardo anteriore, interno, risguardo posteriore */
function normalizeOrder(){
  const s=BOOK.spreads,c=s.filter(isCover),f=s.filter(x=>x.kind==='endF'),b=s.filter(x=>x.kind==='endB'),i=s.filter(isInner);
  const curSp=cur();BOOK.spreads=[...c.slice(0,1),...f.slice(0,1),...i,...b.slice(0,1)];
  const k=BOOK.spreads.indexOf(curSp);UI.cur=k>=0?k:clamp(UI.cur,0,BOOK.spreads.length-1);
}
function ensureStructure(){
  const s=BOOK.spreads;
  if(BOOK.cover.on&&!s.some(isCover))s.unshift(makeCoverEmpty());
  if(!BOOK.cover.on)BOOK.spreads=s.filter(x=>!isCover(x));
  if(BOOK.endp.on){if(!BOOK.spreads.some(x=>x.kind==='endF'))BOOK.spreads.push(makeEndpaper('endF'));if(!BOOK.spreads.some(x=>x.kind==='endB'))BOOK.spreads.push(makeEndpaper('endB'));}
  else BOOK.spreads=BOOK.spreads.filter(x=>!isEnd(x));
  if(!BOOK.spreads.some(isInner))BOOK.spreads.push(mkSpread('inner'));
  normalizeOrder();
}

/* ============ geometria (mm) ============ */
function coverPW(){return BOOK.page.w+BOOK.cover.over;}
function pgH(sp){if(isCover(sp))return BOOK.page.h+2*BOOK.cover.over;if(isEnd(sp))return BOOK.endp.h;return BOOK.page.h;}
function spW(sp){if(isCover(sp))return 2*coverPW()+BOOK.cover.spine;if(isEnd(sp))return BOOK.endp.w;return 2*BOOK.page.w;}
function foldX(sp){if(isCover(sp))return coverPW();if(isEnd(sp)){const E=BOOK.endp;return clamp(E.fold||E.w/2,10,E.w-10);}return BOOK.page.w;}
function pageBox(sp,side){const W=spW(sp);if(side==='S')return{x:0,w:W};
  if(isCover(sp)){const pw=coverPW();return side==='L'?{x:0,w:pw}:{x:pw+BOOK.cover.spine,w:pw};}
  const f=foldX(sp);return side==='L'?{x:0,w:f}:{x:f,w:W-f};}
/* parte visibile: per i risguardi è la zona del foglio che si vede a libro finito (affiancata alla piega) */
function visBox(sp,side){
  const H=pgH(sp);
  if(!isEnd(sp)){const pb=pageBox(sp,side);return{x:pb.x,y:0,w:pb.w,h:H};}
  if(side==='S'){const a=visBox(sp,'L'),b=visBox(sp,'R');return{x:a.x,y:Math.min(a.y,b.y),w:b.x+b.w-a.x,h:Math.max(a.h,b.h)};}
  const E=BOOK.endp,pb=pageBox(sp,side),vw=Math.min(E.visW||BOOK.page.w,pb.w),vh=Math.min(E.visH||BOOK.page.h,H),y=(H-vh)/2;
  return side==='L'?{x:pb.x+pb.w-vw,y,w:vw,h:vh}:{x:pb.x,y,w:vw,h:vh};
}
function meta(sp,side){return sp.meta[side]||(sp.meta[side]=mkMeta());}
function areaOf(sp,side){
  const st=BOOK.style,M=meta(sp,side),H=pgH(sp);
  let V=visBox(sp,side);if(M.full&&isEnd(sp)){const pb=pageBox(sp,side);V={x:pb.x,y:0,w:pb.w,h:H};}
  const m=M.full?0:st.margin,bd=M.full?0:(isInner(sp)?st.bind:st.margin);
  let x,w;
  if(side==='L'){x=V.x+m;w=V.w-m-bd;}else if(side==='R'){x=V.x+bd;w=V.w-bd-m;}else{x=V.x+m;w=V.w-2*m;}
  let y=V.y+m,h=V.h-2*m;if(M.band){const bh=(V.h-2*st.margin)*M.band;y=Math.max(y,V.y+st.margin)+bh;h=V.y+V.h-m-y;}
  return{x,y,w:Math.max(1,w),h:Math.max(1,h)};
}
function cellRect(sp,c,bleed=0,spineB=false){
  const I=areaOf(sp,c.side),g=BOOK.style.gutter,e=1e-3;
  let x0=I.x+c.x*I.w,y0=I.y+c.y*I.h,x1=I.x+(c.x+c.w)*I.w,y1=I.y+(c.y+c.h)*I.h;
  if(c.x>e)x0+=g/2;if(c.x+c.w<1-e)x1-=g/2;if(c.y>e)y0+=g/2;if(c.y+c.h<1-e)y1-=g/2;
  if(bleed>0){const W=spW(sp),H=pgH(sp),pb=pageBox(sp,c.side);
    if(x0<=pb.x+.01&&(pb.x<=.01||spineB))x0-=bleed;
    if(x1>=pb.x+pb.w-.01&&(pb.x+pb.w>=W-.01||spineB))x1+=bleed;
    if(y0<=.01)y0-=bleed;if(y1>=H-.01)y1+=bleed;}
  return{x:x0,y:y0,w:x1-x0,h:y1-y0};
}
function sideAt(sp,x){if(sp.mode==='spread')return'S';return x<foldX(sp)+(isCover(sp)?BOOK.cover.spine/2:0)?'L':'R';}
function textStr(t){const s=String(t.text||' ');return t.upper?s.toLocaleUpperCase('it-IT'):s;}
function textBox(sp,t){const m=measureText(mctx,t,1),a=t.rot*Math.PI/180,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));
  const w=m.w+(t.boxOp>0?2*m.pad:0),h=m.h+(t.boxOp>0?1.2*m.pad:0);
  const hw=c*w/2+s*h/2,hh=s*w/2+c*h/2,cx=t.x*spW(sp),cy=t.y*pgH(sp);return{x0:cx-hw,x1:cx+hw,y0:cy-hh,y1:cy+hh,cx,cy};}
function textProblem(sp,t){
  const b=textBox(sp,t),sf=BOOK.safe,H=pgH(sp);
  if(isCover(sp)&&BOOK.cover.spine>0){const s0=coverPW(),s1=s0+BOOK.cover.spine;
    if(b.cx>=s0&&b.cx<=s1)return(b.x0<s0||b.x1>s1)?'esce dal dorso':(b.y0<sf||b.y1>H-sf)?'troppo vicino al bordo':null;
    if((b.x0<s1&&b.x1>s0))return'attraversa il dorso';}
  if(isInner(sp)&&sp.mode!=='spread'&&b.x0<foldX(sp)+2&&b.x1>foldX(sp)-2)return'finisce nella piega';
  const side=sp.mode==='spread'?'S':(b.cx<foldX(sp)?'L':'R'),V=visBox(sp,side);
  if(b.x0<V.x+sf||b.x1>V.x+V.w-sf||b.y0<V.y+sf||b.y1>V.y+V.h-sf)return isEnd(sp)?'fuori dalla zona visibile del risguardo':'fuori dalla zona di sicurezza';
  return null;}
function photoGeom(ph,r){
  const im=LIB.get(ph.img);if(!im)return null;
  const rot=((ph.rot%360)+360)%360,sw=rot%180?im.h:im.w,sh=rot%180?im.w:im.h;
  const base=ph.fit==='contain'?Math.min(r.w/sw,r.h/sh):Math.max(r.w/sw,r.h/sh);
  const k=base*ph.zoom,dw=sw*k,dh=sh*k,mx=(dw-r.w)/2,my=(dh-r.h)/2;
  return{k,dw,dh,mx,my,rot,iw:im.w,ih:im.h,cx:r.x+r.w/2+ph.ox*mx,cy:r.y+r.h/2+ph.oy*my};
}
function effDpi(sp,c){if(!c.ph||!LIB.has(c.ph.img))return null;const g=photoGeom(c.ph,cellRect(sp,c));return g?25.4/g.k:null;}
function phAR(ph){const e=LIB.get(ph.img);if(!e)return null;return(ph.rot%180)?e.h/e.w:e.w/e.h;}
function innerIdx(i){let k=0;for(let j=0;j<i;j++)if(isInner(BOOK.spreads[j]))k++;return k;}
function pageLabel(i,side){const sp=BOOK.spreads[i];if(!sp)return'';
  if(isCover(sp))return side==='L'?'Retro':side==='R'?'Fronte':'Copertina';
  if(isEnd(sp)){const n=sp.kind==='endF'?'Risguardo anteriore':'Risguardo posteriore';return side==='L'?n+' · sinistra':side==='R'?n+' · destra':n;}
  const a=2*innerIdx(i)+1;return side==='L'?`pag. ${a}`:side==='R'?`pag. ${a+1}`:`pag. ${a}–${a+1}`;}
function spreadLabel(i){const sp=BOOK.spreads[i];if(!sp)return'';if(isCover(sp))return'Copertina';if(sp.kind==='endF')return'Risg. ant.';if(sp.kind==='endB')return'Risg. post.';
  const k=innerIdx(i);return`${2*k+1}–${2*k+2}`;}
function innerPages(){return BOOK.spreads.filter(isInner).length*2;}
function bgOf(sp){if(sp.bg)return sp.bg;const C=TH().colors;return isCover(sp)?C.cover:isEnd(sp)?C.endpaper:C.paper;}
function patOf(sp){
  if(sp.pat==='none')return null;if(sp.pat&&typeof sp.pat==='object')return sp.pat;
  const T=TH();if(isCover(sp))return T.coverPatternOn?T.coverPattern||null:null;if(isEnd(sp))return T.endPatternOn?T.endPattern||null:null;
  return T.deco>=2?T.pagePattern||null:null;
}
