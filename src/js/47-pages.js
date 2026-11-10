/* ============ frasi, sticker, pagine speciali e ridistribuzione delle foto ============ */
const QUOTES={
  generico:[['Le cose più belle non si raccontano: si ricordano.',''],['La felicità è fatta di piccoli momenti come questi.',''],['Ogni foto è un piccolo viaggio nel tempo.',''],
    ['Carpe diem.','Orazio'],['Ci sono ricordi che il tempo non cancella.',''],['Chi trova un amico trova un tesoro.','Proverbio'],['Il vero viaggio di scoperta non consiste nel cercare nuove terre, ma nell’avere nuovi occhi.','Marcel Proust'],
    ['Casa è dove sono le persone che ami.',''],['Raccogliamo momenti, non cose.',''],['La bellezza salverà il mondo.','Fëdor Dostoevskij']],
  natale:[['A Natale si accendono le luci, ma soprattutto i cuori.',''],['Il regalo più bello è stare insieme.',''],['Profumo di biscotti, risate e lucine: è Natale.',''],
    ['Che la magia di queste feste resti con noi tutto l’anno.',''],['Pace in terra agli uomini di buona volontà.','Vangelo di Luca'],['Il Natale non è un momento né una stagione, ma uno stato d’animo.','Calvin Coolidge'],['Non c’è neve più calda di quella vista da casa, insieme.','']],
  valentino:[['Amor, ch’a nullo amato amar perdona.','Dante Alighieri'],['Con te anche i giorni normali diventano speciali.',''],['Il posto più bello del mondo è accanto a te.',''],
    ['Due cuori, una sola storia.',''],['L’amore non guarda con gli occhi, ma con l’anima.','William Shakespeare'],['Amare è trovare nella felicità altrui la propria felicità.','Gottfried Leibniz'],['Tu sei il mio posto preferito.','']],
  papa:[['Papà: il primo eroe, per sempre.',''],['Grazie per avermi insegnato a camminare, e poi a correre da solo.',''],['Non c’è supereroe più forte di un papà.',''],
    ['Le mani più grandi, il cuore più grande.',''],['Un padre vale più di cento maestri.','George Herbert'],['Tutto quello che so fare bene, l’ho imparato guardando te.','']],
  mamma:[['Dove c’è una mamma, c’è casa.',''],['Mamma: la prima parola, l’amore più grande.',''],['Grazie per ogni abbraccio, anche quelli che non ho chiesto.',''],
    ['Il cuore di una madre è un abisso in fondo al quale si trova sempre il perdono.','Honoré de Balzac'],['Dio non poteva essere ovunque, perciò creò le madri.','Proverbio ebraico'],['Sei il mio primo amore e la mia casa per sempre.','']],
  compleanno:[['Un anno in più di sorrisi, avventure e ricordi.',''],['Gli anni non contano: contano i momenti.',''],['Esprimi un desiderio: il resto lo facciamo insieme.',''],
    ['Tanti auguri a chi rende speciale ogni giorno!',''],['La torta passa, i ricordi restano.',''],['Che sia l’anno più bello di sempre!','']],
  matrimonio:[['L’amor che move il sole e l’altre stelle.','Dante Alighieri'],['Il giorno in cui due strade sono diventate una.',''],['E vissero felici, a cominciare da oggi.',''],
    ['Sposarsi è promettersi il futuro, un giorno alla volta.',''],['L’amore è paziente, l’amore è benigno.','San Paolo'],['Sì, per sempre.','']],
  nascita:[['Benvenuto al mondo, piccolo grande amore.',''],['Dieci ditini e un cuore che ha cambiato tutto.',''],['Ogni bambino che nasce porta il messaggio che Dio non è ancora stanco degli uomini.','Rabindranath Tagore'],
    ['Sei arrivato e il mondo ha cambiato colore.',''],['Le cose più grandi arrivano in piccole mani.',''],['La felicità ha il tuo profumo.','']],
  estate:[['Il mondo è un libro, e chi non viaggia ne legge solo una pagina.','Sant’Agostino'],['Sale sulla pelle, sole nel cuore.',''],['Partire è un po’ come rinascere.',''],
    ['Il vero viaggio di scoperta non consiste nel cercare nuove terre, ma nell’avere nuovi occhi.','Marcel Proust'],['Collezioniamo tramonti.',''],['L’estate è uno stato d’animo.','']],
  pasqua:[['Che la Pasqua porti pace, gioia e primavera nel cuore.',''],['Rinascere ogni primavera, insieme.',''],['Uova colorate, sorrisi e campane a festa.',''],['La primavera è la stagione della speranza.','']],
  laurea:[['Fatti non foste a viver come bruti, ma per seguir virtute e canoscenza.','Dante Alighieri'],['Ce l’hai fatta: ora inizia il bello.',''],['Ogni traguardo è l’inizio di un nuovo viaggio.',''],
    ['Il sapere è l’unico tesoro che cresce quando lo si condivide.',''],['Sapere aude.','Orazio']],
  autunno:[['Foglie che cadono, ricordi che restano.',''],['Colori caldi, cuori ancora più caldi.',''],['L’autunno è la stagione in cui tutto diventa oro.',''],['Castagne, coperte e chiacchiere lunghe.','']],
  fine:[['Fine… o forse solo l’inizio.',''],['Il resto lo scriveremo insieme.',''],['Alla prossima avventura!',''],['Grazie per tutti questi ricordi.',''],['Continua…','']],
};
const QUOTE_SET={neutro:'generico',avorio:'generico',galleria:'generico',natale:'natale',nordico:'natale',valentino:'valentino',papa:'papa',mamma:'mamma',
  compleanno:'compleanno',matrimonio:'matrimonio',bimbo:'nascita',bimba:'nascita',estate:'estate',pasqua:'pasqua',laurea:'laurea',autunno:'autunno'};
function themeQuotes(){const k=QUOTE_SET[BOOK.theme.id]||'generico';return[...(QUOTES[k]||[]),...(k!=='generico'?QUOTES.generico.slice(0,4):[])];}
let quoteCursor=0;
function nextQuote(R){const q=themeQuotes();if(R)return q[Math.floor(R()*q.length)];return q[(quoteCursor++)%q.length];}
/* sticker a tema: motivi con bordo bianco + scritte */
const STICKERS={
  neutro:{w:['Wow','Che bello!','Ricordi','Ti voglio bene'],m:['heart','star','sparkle']},
  avorio:{w:['Ricordi','Che bello','Sempre'],m:['flourish','leaf','heart']},
  galleria:{w:['Wow','Mood','Ricordi'],m:['star','sparkle','circle']},
  natale:{w:['Ho ho ho!','Buone feste','Magia','Auguri!'],m:['holly','bauble','gift','tree','candy','bell','star','snowflake']},
  nordico:{w:['Let it snow','Inverno','Auguri!'],m:['snowflake','tree','star']},
  valentino:{w:['Ti amo','Love','Noi due','Per sempre'],m:['heart','heartLine','sparkle']},
  papa:{w:['Super papà','N° 1','Grazie papà','Eroe'],m:['tie','mustache','bowtie','star']},
  mamma:{w:['Mamma ♥','Grazie','Unica','Love'],m:['flower','tulip','butterfly','daisy','heart']},
  compleanno:{w:['Auguri!','Party!','Yeah!','Wow'],m:['balloon','partyhat','confetti','star','gift']},
  matrimonio:{w:['Sì!','Just married','Per sempre','Amore'],m:['rings','heart','branch','leaf']},
  bimbo:{w:['Ciao!','Benvenuto','Nanna','Piccolo amore'],m:['star','moon','cloud','heart']},
  bimba:{w:['Ciao!','Benvenuta','Nanna','Piccolo amore'],m:['star','heart','cloud','butterfly']},
  estate:{w:['Summer','Mare','Relax','Viaggio!'],m:['sun','shell','palm','plane','wave']},
  pasqua:{w:['Buona Pasqua','Primavera','Auguri!'],m:['egg','bunny','tulip','flower']},
  laurea:{w:['Dottore!','Ce l’ho fatta','110 e lode','Brava!'],m:['cap','laurel','star']},
  autunno:{w:['Autunno','Cozy','Castagne'],m:['leaf','pumpkin','branch']},
};
const BADGES=['badge','ribbon','stamp','bubble','tag'];
function themeStickers(){return STICKERS[BOOK.theme.id]||STICKERS.neutro;}
function stickerDeco(sp,xmm,ymm,smm,R,kind){
  const T=TH(),S=themeStickers(),W=spW(sp),H=pgH(sp),cols=T.motifColors&&T.motifColors.length?T.motifColors:[T.colors.accent];
  /* temi con sticker illustrati (es. Natale): soprattutto quelli, qualche scritta ogni tanto */
  const hasArt=kind!=='word'&&kind!=='motif'&&spreadArt(sp).length>0,art=hasArt&&R()<.82?pickArt(sp,R):null;
  if(art)return mkDeco({art:art.id,m:null,c:null,x:xmm/W,y:ymm/H,s:smm*1.6,rot:Math.round(R()*24-12),auto:true,sk:1});
  const word=kind==='word'||hasArt||(kind!=='motif'&&R()<.32);
  if(word){const c=cols[Math.floor(R()*cols.length)];
    return mkDeco({m:BADGES[Math.floor(R()*BADGES.length)],txt:S.w[Math.floor(R()*S.w.length)],f:T.fonts.sub==='Montserrat'||T.fonts.sub==='Josefin Sans'?'Fredoka':T.fonts.sub,
      x:xmm/W,y:ymm/H,s:Math.max(7,smm*.5),rot:(R()*30-15),c,c2:contrastInk(c),auto:true,sk:1});}
  const m=S.m[Math.floor(R()*S.m.length)];
  return mkDeco({m,x:xmm/W,y:ymm/H,s:smm,rot:(R()*36-18),c:cols[Math.floor(R()*cols.length)],c2:T.c2||T.colors.accent2,st:true,auto:true,sk:1,flip:R()<.5});
}
/* sticker automatici tra le foto: sugli angoli dei riquadri, lontano dai testi */
function autoStickers(sp){
  const lvl=BOOK.theme.stickers||0;if(!lvl||!isInner(sp))return;
  const R=rng(hashStr(sp.id+'st'+(BOOK.stSeed||''))),i=BOOK.spreads.indexOf(sp);
  for(const side of(sp.mode==='spread'?['S']:['L','R'])){
    if(isSpecial(sp,side)||(i>=0&&isVerso(i,side)))continue;
    const cells=sp.cells.filter(c=>c.side===side&&c.ph);if(!cells.length)continue;
    const want=lvl>=2?(R()<.7?2:1):(R()<.5?1:0);if(!want)continue;
    const V=visBox(sp,side),smm=Math.min(V.w,V.h)*(.13+R()*.04),tb=sp.texts.map(t=>textBox(sp,t));
    const pts=[];for(const c of cells){const r=cellRect(sp,c);pts.push([r.x+r.w,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h],[r.x,r.y]);}
    /* gli angoli vicini al bordo vengono spostati un po' verso l'interno invece di essere scartati */
    const big=spreadArt(sp).length?smm*1.6:smm,in_=big*.62,inside=([x,y])=>[clamp(x,V.x+in_,V.x+V.w-in_),clamp(y,V.y+in_,V.y+V.h-in_)];
    const ok=([x,y])=>!tb.some(b=>x>b.x0-big*.6&&x<b.x1+big*.6&&y>b.y0-big*.6&&y<b.y1+big*.6);
    const cand=pts.map(inside).filter(ok);for(let k=0;k<want&&cand.length;k++){const j=Math.floor(R()*cand.length),[x,y]=cand.splice(j,1)[0];
      const jx=(R()-.5)*smm*.3,jy=(R()-.5)*smm*.3;sp.decos.push(stickerDeco(sp,x+jx,y+jy,smm,R));
      for(let q=cand.length-1;q>=0;q--)if(Math.hypot(cand[q][0]-x,cand[q][1]-y)<big*1.4)cand.splice(q,1);}
  }
}

/* ---------- ridistribuzione: le foto di una pagina sostituita o eliminata non si perdono ---------- */
function pageSlots(){const out=[];BOOK.spreads.forEach((sp,i)=>{if(!isInner(sp))return;
  for(const side of(sp.mode==='spread'?['S']:['L','R']))out.push({sp,i,side,pos:pageNum(i,side==='S'?'L':side)});});return out;}
function canHost(sl){return!isSpecial(sl.sp,sl.side)&&!isVerso(sl.i,sl.side==='S'?'L':sl.side)&&!isVerso(sl.i,sl.side==='S'?'R':sl.side);}
/* foto ancora usate altrove nel libro: non vanno duplicate */
function usedInInterior(img,exceptSp,exceptSide){for(const sp of BOOK.spreads){if(!isInner(sp))continue;for(const c of sp.cells){if(!c.ph||c.ph.img!==img)continue;if(sp===exceptSp&&(exceptSide==null||c.side===exceptSide))continue;if(c.fx)continue;return true;}}return false;}
function redistribute(phs,fromPos,opts={}){
  phs=phs.filter(ph=>ph&&LIB.has(ph.img)).map(ph=>({...ph,ox:0,oy:0,zoom:1}));if(!phs.length)return{n:0,pages:[]};
  const cap=Math.max(6,(WZ&&WZ.max)||6),slots=pageSlots().filter(s=>canHost(s)&&!(opts.exclude&&opts.exclude(s)));
  const add=new Map(),touched=new Set();
  for(const ph of phs){let best=null,bv=Infinity;
    for(const sl of slots){const n=sl.sp.cells.filter(c=>c.side===sl.side).length+(add.get(sl)||[]).length;if(n>=cap)continue;
      const v=Math.abs(sl.pos-fromPos)+1.6*(add.get(sl)||[]).length+.25*n;if(v<bv){bv=v;best=sl;}}
    if(!best)break;if(!add.has(best))add.set(best,[]);add.get(best).push(ph);}
  let placed=0;
  for(const[sl,list] of add){const cur0=pagePhs(sl.sp,sl.side);relayoutPage(sl.sp,sl.side,{phs:cur0.concat(list)});placed+=list.length;touched.add(pageLabel(sl.i,sl.side));
    themeDecos(sl.sp);}
  const rest=phs.slice(placed);
  if(rest.length){/* niente spazio: una doppia pagina nuova */const sp=mkSpread('inner'),h=Math.ceil(rest.length/2);
    const at=Math.min(BOOK.spreads.length,(opts.afterIdx!=null?opts.afterIdx:lastInnerIdx())+1);BOOK.spreads.splice(at,0,sp);normalizeOrder();
    relayoutPage(sp,'L',{phs:rest.slice(0,h)});if(rest.length>h)relayoutPage(sp,'R',{phs:rest.slice(h)});themeDecos(sp);touched.add('nuova doppia pagina');}
  return{n:phs.length,pages:[...touched]};
}
function redistMsg(r){return r.n?` · ${r.n} ${r.n>1?'foto spostate':'foto spostata'} in ${r.pages.slice(0,3).join(', ')}${r.pages.length>3?'…':''}`:'';}
/* toglie tutto da una pagina e restituisce le foto che c'erano */
function clearSide(sp,side){
  const phs=sp.cells.filter(c=>c.side===side&&c.ph&&!c.fx&&!c.bgPh).map(c=>c.ph);
  const f=foldX(sp),onSide=x=>side==='S'||(side==='L'?x*spW(sp)<f:x*spW(sp)>=f);
  sp.cells=sp.cells.filter(c=>c.side!==side);sp.texts=sp.texts.filter(t=>!onSide(t.x));sp.decos=(sp.decos||[]).filter(d=>!onSide(d.x));
  const M=meta(sp,side);Object.assign(M,mkMeta());return phs;
}
/* ---------- costruttori di pagine speciali (agiscono su un lato della doppia pagina) ---------- */
const SPECIALS=[
  ['quote','Frase','Una frase o citazione al centro, con ornamento'],
  ['quote-color','Frase su colore','Pagina a tinta piena con la frase in evidenza'],
  ['quote-frame','Frase con cornice','Frase incorniciata da motivi del tema'],
  ['quote-photo','Frase sulla foto','Foto a tutta pagina, frase sovrapposta'],
  ['photo-quote','Foto e frase','Una foto grande e una frase sotto'],
  ['scrap','Collage con sticker','Le foto come polaroid inclinate, con sticker del tema'],
  ['dedica','Dedica','Una dedica scritta a mano'],
  ['chapter','Titolo di capitolo','Pagina di apertura con titolo'],
];
function quoteTexts(sp,side,q,y,opts={}){
  const V=visBox(sp,side),W=spW(sp),H=pgH(sp),T=TH(),x=(V.x+V.w/2)/W,bg=opts.bg||bgOf(sp,side);
  const t=roleText(sp,'quote',q[0],x,(V.y+V.h*y)/H,clamp(Math.round(ptOf(Math.min(V.h,V.w)*(q[0].length>70?.04:.05))*fScale(T.fonts.title)),13,40),{...roleStyle('quote',T,bg),...(opts.style||{})});
  wrapText(t,V.w*(opts.wf||.72));fitText(t,V.w-2*BOOK.safe-12);const out=[t];
  if(q[1]){const b=textBox(sp,t);out.push(roleText(sp,'quote-author','— '+q[1],x,(b.y1+6)/H,9,{...roleStyle('quote-author',T,bg),...(opts.style2||{})}));}
  return out;}
/* va a capo per stare nella larghezza (mm) */
function wrapText(t,maxW){const words=String(t.text).replace(/\n/g,' ').split(/\s+/);if(words.length<4)return t;
  for(let n=1;n<=5;n++){const per=Math.ceil(words.length/n),lines=[];for(let i=0;i<words.length;i+=per)lines.push(words.slice(i,i+per).join(' '));
    const tt={...t,text:lines.join('\n')};if(measureText(mctx,tt,1).w<=maxW||n===5){t.text=tt.text;break;}}return t;}
function buildSpecial(sp,side,kind,o={}){
  const T=TH(),V=visBox(sp,side),W=spW(sp),H=pgH(sp),M=meta(sp,side),R=rng(hashStr(sp.id+side+kind)),q=o.quote||nextQuote();
  const phs=o.phs||[];let used=0;M.special=kind;
  const orn=(y,sz)=>{const m=T.ornament&&MOTIFS[T.ornament]?T.ornament:(T.motifs&&T.motifs[0])||'flourish';const s=sz||Math.min(V.w,V.h)*.07;
    sp.decos.push(mkDeco({m,x:(V.x+V.w/2)/W,y:(V.y+V.h*y)/H,s:['flourish','rule'].includes(m)?s*3:s,c:(T.motifColors&&T.motifColors[0])||T.colors.accent,c2:T.c2||T.colors.accent2,auto:false}));};
  if(kind==='quote'){sp.texts.push(...quoteTexts(sp,side,q,.47));orn(.3);}
  else if(kind==='quote-color'){M.bg=o.color||T.colors.cover;const ink=lum(M.bg)<150?'#ffffff':T.colors.title;
    sp.texts.push(...quoteTexts(sp,side,q,.48,{bg:M.bg,style:{color:ink},style2:{color:ink,op:85}}));orn(.3,Math.min(V.w,V.h)*.06);sp.decos[sp.decos.length-1].c=ink;}
  else if(kind==='quote-frame'){const mot=(T.motifs||[]).filter(m=>!['flourish','rule'].includes(m));
    if(mot.length)M.pat={type:'frame',motifs:mot,colors:T.motifColors||[T.colors.accent],size:Math.min(V.w,V.h)*.05,gap:Math.min(V.w,V.h)*.085,op:.9,rot:true,band:BOOK.safe+Math.min(V.w,V.h)*.06,c2:T.c2||null};
    else{sp.decos.push(mkDeco({m:'rule',x:(V.x+V.w/2)/W,y:(V.y+V.h*.2)/H,s:V.w*.4,c:T.colors.accent}),mkDeco({m:'rule',x:(V.x+V.w/2)/W,y:(V.y+V.h*.8)/H,s:V.w*.4,c:T.colors.accent}));}
    sp.texts.push(...quoteTexts(sp,side,q,.47,{wf:.6}));}
  else if(kind==='quote-photo'){M.full=true;if(phs[0]){const c=mkCell([0,0,1,1],side);c.ph={...phs[0],br:68,ox:0,oy:0,zoom:1};sp.cells.push(c);used=1;}
    sp.texts.push(...quoteTexts(sp,side,q,.5,{bg:'#333333',style:{color:'#ffffff',shadow:true},style2:{color:'#ffffff',shadow:true,op:90}}));}
  else if(kind==='photo-quote'){if(phs[0]){const c=mkCell([0,0,1,.66],side);c.ph={...phs[0],ox:0,oy:0,zoom:1};sp.cells.push(c);used=1;}
    sp.texts.push(...quoteTexts(sp,side,q,.84,{wf:.8}));}
  else if(kind==='scrap'){const n=Math.min(5,phs.length);used=n;M.full=true;
    const spots=[[[.2,.18,.6,.62]],[[.06,.12,.48,.5],[.46,.4,.48,.5]],[[.05,.08,.44,.42],[.52,.12,.42,.4],[.26,.52,.46,.42]],
      [[.05,.06,.42,.4],[.53,.08,.42,.4],[.07,.53,.42,.4],[.51,.52,.42,.4]],[[.04,.05,.38,.36],[.56,.05,.38,.36],[.3,.33,.4,.36],[.04,.6,.38,.36],[.58,.6,.37,.36]]][n-1]||[];
    spots.forEach((d,k)=>{const c=mkCell(d,side);c.ph={...phs[k],ox:0,oy:0,zoom:1};c.rot=Math.round((R()*14-7)*10)/10;c.bw=Math.max(2.5,Math.min(V.w,V.h)*.014);c.bc='#ffffff';c.sh=1.6;sp.cells.push(c);});
    for(let k=0;k<Math.max(2,n);k++){const d=spots[k%Math.max(1,spots.length)]||[.5,.5,.1,.1],A=areaOf(sp,side);
      const x=A.x+(d[0]+(k%2?d[2]:0))*A.w,y=A.y+(d[1]+(k%2?d[3]:0))*A.h;sp.decos.push(stickerDeco(sp,clamp(x,V.x+14,V.x+V.w-14),clamp(y,V.y+14,V.y+V.h-14),Math.min(V.w,V.h)*.15,R,k===0?'word':null));}
    sp.decos.forEach(d=>{if(d.sk)d.auto=false;});}
  else if(kind==='dedica'){sp.texts.push(...dedicaTexts(sp,side,o.text||'Con tutto il mio affetto'));}
  else if(kind==='chapter'){sp.texts.push(...titlePageTexts(sp,side,{title:o.text||'Titolo',sub:o.sub||null}));}
  themeDecos(sp);
  return phs.slice(used);
}
/* applica una pagina speciale: al posto della pagina attiva o in una nuova doppia pagina dopo */
function placeSpecial(kind,where,o={}){
  let sp=cur(),i=UI.cur,side=activeSide(sp);
  if(!isInner(sp)){toast('Le pagine speciali vanno nelle pagine interne');return;}
  if(sp.mode==='spread'){setSpreadMode(sp,'pages');side='L';}
  const pos=pageNum(i,side);let msg='';
  if(where==='replace'){
    const needPh=['quote-photo','photo-quote','scrap'].includes(kind),old=clearSide(sp,side);
    const left=buildSpecial(sp,side,kind,{...o,phs:needPh?old:[]}),back=(needPh?left:old).filter(ph=>!usedInInterior(ph.img,sp,side));
    const r=redistribute(back,pos,{afterIdx:i});msg=redistMsg(r);
  }else{/* nuova doppia pagina dopo: speciale a sinistra, a destra metà delle foto della pagina attiva */
    const ns=mkSpread('inner');BOOK.spreads.splice(i+1,0,ns);normalizeOrder();
    const phs=pagePhs(sp,side).filter(Boolean),take=Math.floor(phs.length/2);
    const needPh=['quote-photo','photo-quote','scrap'].includes(kind);
    let moved=[];if(phs.length&&(take>0||needPh)){moved=phs.slice(phs.length-Math.max(take,needPh?1:0));relayoutPage(sp,side,{phs:phs.slice(0,phs.length-moved.length)});}
    const left=buildSpecial(ns,'L',kind,{...o,phs:moved});
    if(left.length)relayoutPage(ns,'R',{phs:left});else balanceInto(ns,'R');
    themeDecos(sp);themeDecos(ns);UI.cur=BOOK.spreads.indexOf(ns);UI.side='L';
    msg=left.length?` · ${left.length} foto spostate accanto`:'';
  }
  sel=null;THUMBS.clear();commit();syncAll();toast(`Pagina speciale inserita${msg}. Ctrl+Z per annullare.`,4500);
}
/* riempie una pagina vuota prendendo qualche foto dalle pagine vicine più piene (senza svuotarle) */
function balanceInto(sp,side,want=3){
  const i=BOOK.spreads.indexOf(sp),pos=pageNum(i,side),got=[];
  const src=pageSlots().filter(sl=>canHost(sl)&&!(sl.sp===sp&&sl.side===side)).map(sl=>({sl,n:sl.sp.cells.filter(c=>c.side===sl.side&&c.ph).length}))
    .filter(x=>x.n>=4).sort((a,b)=>Math.abs(a.sl.pos-pos)-Math.abs(b.sl.pos-pos));
  for(const x of src){if(got.length>=want)break;const phs=pagePhs(x.sl.sp,x.sl.side).filter(Boolean),k=Math.min(want-got.length,phs.length-3);if(k<=0)continue;
    got.push(...phs.slice(phs.length-k));relayoutPage(x.sl.sp,x.sl.side,{phs:phs.slice(0,phs.length-k)});themeDecos(x.sl.sp);}
  if(got.length)relayoutPage(sp,side,{phs:got});return got.length;
}
/* rende di nuovo normale una pagina speciale tenendo le foto */
function unspecial(sp,side){const phs=sp.cells.filter(c=>c.side===side&&c.ph).map(c=>({...c.ph,br:100,ox:0,oy:0,zoom:1}));clearSide(sp,side);if(phs.length)relayoutPage(sp,side,{phs});themeDecos(sp);}

/* ---------- pagina effetto (al massimo una doppia pagina per libro) ---------- */
function effectIdx(){return BOOK.spreads.findIndex(sp=>isInner(sp)&&(meta(sp,'L').special==='effect'||meta(sp,'R').special==='effect'));}
function makeEffectSpread(p1,p2){
  const T=TH(),sp=mkSpread('inner'),C=T.colors;
  /* sinistra: foto "fuori cornice" su colore del tema */
  const ML=meta(sp,'L');ML.special='effect';ML.full=true;ML.bg=C.cover;ML.pat=T.coverPattern||T.endPattern||null;
  const a=mkCell([.13,.36,.74,.54],'L');a.ph=newPh(p1.id);a.fx='pop';a.bw=Math.max(3,BOOK.page.h*.016);a.bc='#ffffff';a.sh=2;sp.cells.push(a);
  fxPopFrame(sp,a);
  /* destra: secondo soggetto come sticker, oppure la stessa foto in bianco e nero con il soggetto a colori */
  const MR=meta(sp,'R');MR.special='effect';
  if(p2){MR.full=true;MR.pat=T.pagePattern||null;const b=mkCell([.1,.08,.8,.64],'R');b.ph=newPh(p2.id);b.fx='sticker';b.rot=-3;sp.cells.push(b);
    const q=nextQuote();sp.texts.push(...quoteTexts(sp,'R',q,.84,{wf:.78}));}
  else{MR.full=true;const b=mkCell([0,0,1,1],'R');b.ph=newPh(p1.id);b.fx='splash';sp.cells.push(b);}
  const R=rng(hashStr(sp.id));const V=visBox(sp,'L');
  sp.decos.push(stickerDeco(sp,V.x+V.w*.2,V.y+V.h*.88,Math.min(V.w,V.h)*.16,R,'word'));sp.decos[sp.decos.length-1].auto=false;
  return sp;
}
async function createEffectPage(ids,{at,silent,onProg}={}){
  const best=await fxFindBest(ids,onProg);
  if(!best.length){if(!silent)toast('Nessuna foto adatta alla pagina effetto: servono foto con una persona o un animale ben visibile.',5000);return false;}
  const old=effectIdx();if(old>=0)BOOK.spreads.splice(old,1);
  const sp=makeEffectSpread(best[0],best[1]||null);
  const pos=at!=null?at:(old>=0?old:Math.max(firstInnerIdx()+1,Math.round((firstInnerIdx()+lastInnerIdx())/2)));
  BOOK.spreads.splice(clamp(pos,firstInnerIdx()+1,Math.max(firstInnerIdx()+1,lastInnerIdx())),0,sp);normalizeOrder();
  for(const c of sp.cells)if(c.fx==='pop')fxPopFrame(sp,c);
  themeDecos(sp);return BOOK.spreads.indexOf(sp);
}
