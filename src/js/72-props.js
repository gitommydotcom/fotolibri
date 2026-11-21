/* ============ pannello proprietà ============ */
function dpiBadge(d){if(d==null)return null;const r=Math.round(d);
  return d>=250?el('span',{class:'badge ok',title:'Ottima per la stampa'},`${r} dpi · ottima`):d>=150?el('span',{class:'badge warn',title:'Accettabile; ingrandimenti maggiori perdono nitidezza'},`${r} dpi · discreta`):el('span',{class:'badge bad',title:'La foto è troppo piccola per questa dimensione di stampa'},`${r} dpi · bassa`);}
function renderProps(){
  const R=$('#props');const y=R.scrollTop;R.replaceChildren(...propsContent());R.scrollTop=y;
  $('#hint').textContent=UI.mode==='photo'?'Trascina una foto per inquadrarla, su un’altra per scambiarle · ? per tutte le scorciatoie':'Trascina un riquadro per spostarlo, bordi e angoli per ridimensionarlo · Fine (o M) per tornare alle foto';
}
function propsContent(){
  if(sel&&sel.type==='text'){const t=txtById(sel.id);if(t)return textProps(t);}
  if(sel&&sel.type==='cell'){const c=byId(sel.id);if(c)return cellProps(c);}
  if(sel&&sel.type==='deco'){const d=decoById(sel.id);if(d)return decoProps(d);}
  return emptyProps();
}
const QA_ICONS={
  photo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>',
  layout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M12 12h9"/></svg>',
  text:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 6V4h14v2M12 4v16M9 20h6"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 2.4 5.6 6 .5-4.6 4 1.4 5.9L12 16l-5.2 3 1.4-5.9-4.6-4 6-.5Z"/></svg>',
  cover:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19V5"/><circle cx="12.5" cy="10" r="3"/></svg>',
  bg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.6 0-1.3-1-1.6-1-2.7 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3Z"/></svg>'};
/* nessuna selezione: cosa si può fare su queste pagine, in un clic */
function emptyProps(){
  const sp=cur(),side=activeSide(sp),go=(tab,extra)=>()=>{UI.tab=tab;if(extra)extra();renderLeft();};
  const qa=(icon,t,d,on)=>el('button',{type:'button',onclick:on},el('i',{html:QA_ICONS[icon],style:'display:contents'}),el('span',{},el('b',{},t),el('small',{},d)));
  const ttl=isCover(sp)?'Copertina':isEnd(sp)?'Risguardo':`Pagine ${spreadLabel(UI.cur)}`;
  const acts=isCover(sp)?[
      qa('cover','Scegli la copertina','Proposte pronte per il tema',go('theme',()=>UI.openSec.add('Copertina'))),
      qa('text','Cambia il titolo','Clic sul titolo nel foglio, o aggiungi un testo',go('deco')),
      qa('photo','Cambia la foto','Trascina una foto dal pannello Foto sul riquadro',go('photos'))]
    :isEnd(sp)?[
      qa('bg','Scegli il risguardo','Motivi, tinte, foto',go('theme',()=>UI.openSec.add('Risguardi'))),
      qa('star','Aggiungi uno sticker','O un testo, una dedica',go('deco'))]
    :[qa('photo','Aggiungi foto','Trascinale dal pannello Foto',go('photos',()=>{UI.filter='unused';})),
      qa('layout','Cambia impaginazione','Altre disposizioni delle foto (tasto V)',go('pages')),
      qa('text','Aggiungi un testo','Titolo, didascalia, dedica',go('deco')),
      qa('star','Aggiungi uno sticker','Disegni e scritte del tema',go('deco'))];
  return[el('div',{class:'ctx'},el('h4',{},ttl),el('p',{},'Clic su una foto, un testo o uno sticker nel foglio per modificarlo.'),el('div',{class:'qa'},...acts)),
    el('div',{class:'tips'},el('b',{style:'color:var(--ink)'},'Gesti utili'),
      el('ul',{style:'margin:0;padding-left:16px;display:grid;gap:4px'},el('li',{},'Trascina una foto dentro il riquadro per inquadrarla, su un’altra per scambiarle.'),
        el('li',{},'Rotellina sulla foto selezionata: zoom.'),el('li',{},'PagSu / PagGiù per sfogliare, Ctrl+Z per annullare.')),
      el('button',{type:'button',class:'linkb',style:'justify-self:start',onclick:()=>showKeys()},'Tutte le scorciatoie'))];
}
function removeFromPage(c){const sp=cur(),side=c.side;const phs=pagePhs(sp,side);const i=sp.cells.filter(k=>k.side===side).indexOf(c);phs.splice(i,1);relayoutPage(sp,side,{phs});sel=null;}
function cellProps(c){
  const sp=cur(),idx=sp.cells.indexOf(c)+1,ph=c.ph&&LIB.has(c.ph.img)?c.ph:null,out=[];
  if(ph){const im=LIB.get(ph.img);
    out.push(sec(`Foto · ${pageLabel(UI.cur,c.side)}`,
      el('div',{class:'ph-head'},im.thumbURL?el('img',{src:im.thumbURL,alt:''}):null,el('div',{style:'display:grid;gap:4px;min-width:0'},el('div',{class:'nm',title:im.name},im.name),dpiBadge(effDpi(sp,c)))),
      seg([['cover','Riempi il riquadro'],['contain','Foto intera']],ph.fit,v=>{ph.fit=v;ph.ox=0;ph.oy=0;commit();renderProps();draw();},true),
      slider('Zoom',()=>Math.round(ph.zoom*100),v=>ph.zoom=v/100,100,800,1,'%'),
      el('p',{},'Trascina la foto nel foglio per scegliere l’inquadratura.'),
      el('div',{class:'row'},
        btn('↻ Ruota',()=>{ph.rot=(ph.rot+90)%360;ph.ox=ph.oy=0;commit();renderProps();draw();}),
        btn('⇋ Specchia',()=>{ph.flip=!ph.flip;commit();draw();}),
        btn('Centra',()=>{ph.ox=ph.oy=0;ph.zoom=1;commit();renderProps();draw();}))));
    out.push(sec(null,el('div',{class:'row'},
      btn(im.fav?'★ Preferita':'☆ Preferita: più grande',()=>{im.fav=!im.fav;if(im.fav)relayoutPage(sp,c.side);sel=null;commit();syncAll();},im.fav?'alt':null,'Le preferite vanno nel riquadro più grande'),
      btn('Cambia foto…',()=>{UI.tab='photos';if(UI.filter==='excl')UI.filter='all';renderLeft();toast('Clic su una foto nel pannello a sinistra per metterla in questo riquadro',4500);},null,'Scegli un’altra foto per questo riquadro'),
      btn('Togli',()=>{removeFromPage(c);commit();syncAll();toast('Foto tolta: la ritrovi tra le «Libere» nel pannello Foto',4500,'undo');},'danger','Toglie la foto e ridistribuisce le altre nella pagina')),
      btn(UI.mode==='layout'?'Fine: torna a inquadrare le foto':'Sposta o ridimensiona il riquadro',()=>setMode(UI.mode==='layout'?'photo':'layout'),UI.mode==='layout'?'pri':null,'Tasto M')));
    out.push(fold('Colore e tono',[
      el('div',{class:'row'},...[['Originale',{br:100,ct:100,sat:100,gray:0,sepia:0}],['Vivace',{br:104,ct:112,sat:130,gray:0,sepia:0}],['Bianco e nero',{br:100,ct:110,sat:100,gray:100,sepia:0}],['Vintage',{br:104,ct:92,sat:85,gray:0,sepia:45}]]
        .map(([l,v])=>btn(l,()=>{Object.assign(ph,v,{blur:0});commit();renderProps();draw();scheduleStrip();}))),
      slider('Luminosità',()=>ph.br,v=>ph.br=v,0,200,1,'%'),
      slider('Contrasto',()=>ph.ct,v=>ph.ct=v,0,200,1,'%'),
      slider('Saturazione',()=>ph.sat,v=>ph.sat=v,0,200,1,'%'),
      slider('Bianco e nero',()=>ph.gray,v=>ph.gray=v,0,100,1,'%'),
      slider('Seppia',()=>ph.sepia,v=>ph.sepia=v,0,100,1,'%'),
      el('div',{class:'row'},
        btn('Uguale su queste pagine',()=>{for(const k of sp.cells)if(k.ph&&k.ph!==ph)Object.assign(k.ph,{br:ph.br,ct:ph.ct,sat:ph.sat,gray:ph.gray,sepia:ph.sepia});commit();draw();scheduleStrip();toast('Regolazioni copiate sulle foto della doppia pagina',4000,'undo');}),
        btn('Su tutto il libro',()=>{for(const s of BOOK.spreads)for(const k of s.cells)if(k.ph&&k.ph!==ph)Object.assign(k.ph,{br:ph.br,ct:ph.ct,sat:ph.sat,gray:ph.gray,sepia:ph.sepia});commit();draw();toast('Regolazioni copiate su tutte le foto del libro',4500,'undo');}))],
      {hint:ph.gray>50?'bianco e nero':ph.br!==100||ph.ct!==100||ph.sat!==100||ph.sepia?'modificato':''}));
    out.push(fold('Inquadratura precisa',[
      slider('Posizione orizzontale',()=>Math.round(ph.ox*100),v=>ph.ox=v/100,-100,100,1,''),
      slider('Posizione verticale',()=>Math.round(ph.oy*100),v=>ph.oy=v/100,-100,100,1,''),
      el('div',{class:'row'},btn('↺ Ruota a sinistra',()=>{ph.rot=(ph.rot+270)%360;ph.ox=ph.oy=0;commit();renderProps();draw();}),
        btn('Svuota il riquadro',()=>{c.ph=null;commit();syncAll();},null,'Lascia il riquadro vuoto')),
      el('div',{class:'u'},`${im.name} · ${im.w} × ${im.h} px`)]));
  }else{
    out.push(sec(`Riquadro ${idx} · vuoto`,el('p',{},'Trascina una foto dal pannello Foto, oppure caricala direttamente qui.'),
      el('div',{class:'row'},btn('Carica foto qui…',()=>{pickFor=c.id;$('#fileIn').click();},'pri'),btn('Scegli tra le libere',()=>{UI.tab='photos';UI.filter='unused';renderLeft();}),
        btn('Togli riquadro',()=>{removeFromPage(c);commit();syncAll();},'danger'))));
  }
  const pct=(lab,key)=>{const i=el('input',{type:'number',class:'num',style:'width:100%',step:.5,min:0,max:100,value:+(c[key]*100).toFixed(1),'aria-label':lab});
    i.onchange=()=>{let v=clamp((parseFloat(i.value)||0)/100,0,1);if(key==='w'||key==='h')v=Math.max(.02,v);c[key]=v;
      if(c.x+c.w>1){if(key==='x')c.x=1-c.w;else c.w=1-c.x;}if(c.y+c.h>1){if(key==='y')c.y=1-c.h;else c.h=1-c.y;}commit();renderProps();draw();};
    return el('label',{class:'lbl'},el('span',{class:'u'},lab),i);};
  const r=cellRect(sp,c);
  const fillOn=el('input',{type:'checkbox',checked:!!c.fill,'aria-label':'Usa colore di riempimento',onchange:e=>{c.fill=e.target.checked?(c.fill||'#C2185B'):null;commit();renderProps();draw();}});
  out.push(fold('Forma e bordo',[
    seg(SHAPES.map(([v,l])=>[v||'rect',l]),c.shape||'rect',v=>{c.shape=v==='rect'?null:v;commit();renderProps();draw();scheduleStrip();},true),
    slider('Bordo di questa foto',()=>c.bw!=null?c.bw:BOOK.style.borderW,v=>c.bw=v,0,12,.25,'mm'),
    colorCtl('Colore bordo',()=>c.bc||BOOK.style.borderColor,v=>c.bc=v),
    c.bw!=null||c.bc?btn('Usa il bordo del libro',()=>{c.bw=null;c.bc=null;commit();renderProps();draw();}):null],{hint:(SHAPES.find(x=>(x[0]||'rect')===(c.shape||'rect'))||[0,''])[1]}));
  out.push(fold('Posizione e misura del riquadro',[
    el('div',{class:'row4'},pct('X %','x'),pct('Y %','y'),pct('Largh. %','w'),pct('Alt. %','h')),
    el('p',{},`Misura in stampa: ${nf(r.w)} × ${nf(r.h)} mm`),
    colorCtl('Riempimento a colore',()=>c.fill||'#C2185B',v=>{c.fill=v;fillOn.checked=true;},fillOn),
    el('div',{class:'row'},
      btn('Porta sopra',()=>{sp.cells=sp.cells.filter(k=>k!==c);sp.cells.push(c);commit();syncAll();}),
      btn('Porta sotto',()=>{sp.cells=sp.cells.filter(k=>k!==c);sp.cells.unshift(c);commit();syncAll();}))]));
  return out;
}
function addText(over={}){
  const sp=cur();const t=mkText({text:'Il tuo testo',...over});
  sp.texts.push(t);sel={type:'text',id:t.id};loadFont(t);commit();syncAll();
}
function loadFont(t){if(document.fonts&&document.fonts.load)document.fonts.load(textFont(t,30)).then(()=>{draw();THUMBS.clear();scheduleStrip();}).catch(()=>{});}
function textProps(t){
  const sp=cur();
  const ta=el('textarea',{'aria-label':'Testo',rows:3},t.text);ta.value=t.text;ta.oninput=()=>{t.text=ta.value;draw();};ta.onchange=()=>{commit();renderLeft();};
  const fs=el('select',{'aria-label':'Carattere'});
  const g1=el('optgroup',{label:'Installati sul computer'});FONTS_SYS.forEach(f=>g1.append(el('option',{value:f},f)));
  const g2=el('optgroup',{label:'Caratteri del programma'});FONTS_WEB.forEach(f=>g2.append(el('option',{value:f},f)));
  fs.append(g2,g1);fs.value=t.font;if(fs.value!==t.font)fs.append(el('option',{value:t.font},t.font));fs.value=t.font;fs.onchange=()=>{t.font=fs.value;t.custom=true;loadFont(t);commit();draw();};
  const tog=(lab,key,tip)=>el('button',{type:'button',class:t[key]?'on':'',title:tip,onclick:e=>{t[key]=!t[key];t.custom=true;e.currentTarget.classList.toggle('on',t[key]);loadFont(t);commit();draw();}},lab);
  return[
    sec('Testo',ta,fs,
      slider('Dimensione',()=>t.size,v=>t.size=v,4,200,.5,'pt'),
      el('div',{class:'row'},el('div',{class:'seg'},tog('G','bold','Grassetto'),tog('C','italic','Corsivo'),tog('AA','upper','Tutto maiuscolo')),
        seg([['left','Sx'],['center','Centro'],['right','Dx']],t.align,v=>{t.align=v;commit();renderProps();draw();})),
      colorCtl('Colore',()=>t.color,v=>{t.color=v;t.custom=true;}),
      el('div',{class:'row'},btn('Duplica',()=>{const d={...t,id:uid(),y:clamp(t.y+.06,0,1)};sp.texts.push(d);sel={type:'text',id:d.id};commit();syncAll();}),
        btn('Elimina',()=>{sp.texts=sp.texts.filter(k=>k!==t);sel=null;commit();syncAll();toast('Testo eliminato',4000,'undo');},'danger'))),
    fold('Stile per tutto il libro',[
      t.role?el('p',{},t.custom?'Stile personalizzato: non segue più il tema.':'Segue lo stile del tema: cambiando tema si aggiorna da solo.'):null,
      btn('Usa questo stile per tutti i testi simili del libro',()=>{let n=0;for(const s of BOOK.spreads)for(const k of s.texts)if(k!==t&&Math.abs(k.size-t.size)<=8&&k.rot===t.rot){Object.assign(k,{font:t.font,bold:t.bold,italic:t.italic,upper:t.upper,color:t.color,ls:t.ls,shadow:t.shadow,custom:true});n++;}commit();syncAll();toast(`${n} testi aggiornati`);},null,'Copia carattere e colore sui testi di dimensione simile (es. tutti i titoli)')]),
    fold('Spaziatura, rotazione, opacità',[
      slider('Spazio tra lettere',()=>t.ls,v=>t.ls=v,-10,60,1,''),
      slider('Interlinea',()=>t.lh,v=>t.lh=v,.7,2.5,.05,''),
      slider('Rotazione',()=>t.rot,v=>t.rot=v,-180,180,1,'°'),
      slider('Opacità',()=>t.op,v=>t.op=v,0,100,1,'%')]),
    fold('Fondo, contorno, ombra',[
      colorCtl('Fondo dietro al testo',()=>t.boxColor,v=>t.boxColor=v),
      slider('Opacità fondo',()=>t.boxOp,v=>t.boxOp=v,0,100,1,'%'),
      colorCtl('Contorno',()=>t.strokeColor,v=>t.strokeColor=v),
      slider('Spessore contorno',()=>t.strokeW,v=>t.strokeW=v,0,25,.5,''),
      chk('Ombra',()=>t.shadow,v=>t.shadow=v)]),
    fold('Posizione esatta',[
      slider('Orizzontale',()=>+(t.x*100).toFixed(1),v=>t.x=v/100,0,100,.5,'%'),
      slider('Verticale',()=>+(t.y*100).toFixed(1),v=>t.y=v/100,0,100,.5,'%'),
      el('div',{class:'row'},
        btn('Centra nella pagina',()=>{const side=t.x*spW(sp)<foldX(sp)?'L':'R';const pb=pageBox(sp,side);t.x=(pb.x+pb.w/2)/spW(sp);commit();renderProps();draw();}))])
  ];
}

function artProps(d){
  const sp=cur(),a=ART.get(d.art),chg=()=>{d.auto=false;},others=a?[...ART.values()].filter(x=>x.folder===a.folder):[];
  return[sec('Sticker',el('div',{class:'ph-head'},a?el('img',{src:a.url,alt:'',style:'object-fit:contain;background:transparent;border:0'}):null,
      el('div',{style:'display:grid;gap:4px'},el('b',{},a?a.name:'Sticker non disponibile'),el('span',{class:'u'},(a?a.sname+' · ':'')+(d.auto?'messo in automatico':'aggiunto da te')))),
    slider('Dimensione',()=>d.s,v=>{d.s=v;chg();},5,300,.5,'mm'),
    slider('Rotazione',()=>d.rot,v=>{d.rot=v;chg();},-180,180,1,'°'),
    slider('Opacità',()=>Math.round((d.op==null?1:d.op)*100),v=>{d.op=v/100;chg();},5,100,1,'%'),
    el('div',{class:'row'},btn('⇋ Specchia',()=>{d.flip=!d.flip;chg();commit();draw();scheduleStrip();}),
      btn(d.back?'Porta davanti alle foto':'Porta dietro le foto',()=>{d.back=!d.back;chg();commit();syncAll();}),
      btn('Duplica',()=>{const n={...d,id:uid(),x:d.x+.03,y:d.y+.03,auto:false};sp.decos.push(n);sel={type:'deco',id:n.id};commit();syncAll();}),
      btn('Elimina',()=>{sp.decos=sp.decos.filter(k=>k!==d);sel=null;commit();syncAll();},'danger')),
    el('p',{},'Trascina per spostare, il quadratino in basso a destra per ingrandire. Canc per eliminare.')),
    others.length?sec('Cambia con un altro sticker',artGrid(others,x=>{d.art=x.id;chg();commit();syncAll();},d.art)):null];
}
/* sticker con scritta: testo, forma, colori e carattere modificabili */
const BADGE_FONTS=['Fredoka','Pacifico','Caveat','Dancing Script','Great Vibes','Amatic SC','Bebas Neue','Oswald','Montserrat','Playfair Display','Mountains of Christmas'];
function badgePalette(){const T=TH();return[...(T.motifColors||[]),T.colors.accent,T.colors.title,'#E8344E','#F6B93B','#3FA7D6','#06D6A0','#9B72CF','#FF8FAB','#2D2333','#ffffff']
  .filter((c,i,a)=>c&&/^#[0-9a-f]{6}$/i.test(c)&&a.findIndex(x=>x.toLowerCase()===c.toLowerCase())===i).slice(0,14);}
function badgeProps(d){
  const sp=cur(),chg=()=>{d.auto=false;},m=badgeShape(d.m);
  const redraw=()=>{draw();scheduleStrip();};
  const ta=el('textarea',{'aria-label':'Testo dello sticker',rows:2,placeholder:'Scrivi qui…'});ta.value=d.txt;
  ta.oninput=()=>{d.txt=ta.value;chg();draw();thumb.replaceWith(thumb=badgeThumb(d,52));};ta.onchange=()=>{commit();scheduleStrip();renderLeft();};
  let thumb=badgeThumb(d,52);
  const words=[...new Set([...themeStickers().w,'Wow','Che bello!','Ricordi','Ti voglio bene'])].slice(0,10);
  const fsel=el('select',{'aria-label':'Carattere',onchange:e=>{d.f=e.target.value;chg();commit();if(document.fonts&&document.fonts.load)document.fonts.load(badgeFont(d,30)).then(()=>{syncAll();}).catch(()=>{});syncAll();}},
    ...[...new Set([d.f||'Fredoka',TH().fonts.title,TH().fonts.sub,...BADGE_FONTS])].filter(Boolean).map(f=>el('option',{value:f,selected:f===(d.f||'Fredoka'),style:`font-family:"${f}"`},f)));
  return[
    sec('Sticker con scritta',
      el('div',{class:'ph-head'},thumb,el('div',{style:'display:grid;gap:4px'},el('b',{},(BADGE_SHAPES.find(x=>x[0]===m)||[0,'Etichetta'])[1]),el('span',{class:'u'},d.auto?'messo in automatico':'aggiunto da te'))),
      el('label',{class:'lbl'},el('span',{},'Testo (Invio per andare a capo)'),ta),
      el('div',{class:'chips'},...words.map(w=>el('button',{type:'button',class:'chip'+(w===d.txt?' on':''),onclick:()=>{d.txt=w;chg();commit();syncAll();}},w)))),
    sec('Forma',el('div',{class:'bshapes'},...BADGE_SHAPES.map(([k,l])=>el('button',{type:'button',class:'bshape'+(k===m?' on':''),title:l,'aria-label':l,
      onclick:()=>{d.m=k;chg();commit();syncAll();}},badgeThumb({...d,m:k,txt:d.txt&&d.txt.length<=12?d.txt:'Ciao!'},40),el('span',{},l))))),
    sec('Colori',
      el('div',{class:'sw'},...badgePalette().map(c=>el('button',{type:'button',class:(d.c||'').toLowerCase()===c.toLowerCase()?'on':'',style:`background:${c}`,title:c,'aria-label':'Colore '+c,
        onclick:()=>{d.c=c;d.c2=contrastInk(c);chg();commit();syncAll();}}))),
      fold('Altri colori',[colorCtl('Colore dello sticker',()=>d.c||'#C2185B',v=>{d.c=v;chg();},null,()=>{commit();syncAll();}),
      colorCtl('Colore della scritta',()=>d.c2&&d.c2!==d.c?d.c2:contrastInk(d.c||'#C2185B'),v=>{d.c2=v;chg();},null,()=>{commit();syncAll();}),
      chk('Stile morbido (senza contorno scuro)',()=>!!d.flat,v=>{d.flat=v;chg();scheduleStrip();},'Solo bordo bianco e ombra sfumata, più delicato')])),
    fold('Carattere',[fsel,chk('Grassetto',()=>d.bold!==false,v=>{d.bold=v;chg();scheduleStrip();})],{hint:d.f||'Fredoka'}),
    sec('Misura',
      slider('Dimensione',()=>d.s,v=>{d.s=v;chg();},4,120,.5,'mm'),
      slider('Rotazione',()=>d.rot,v=>{d.rot=v;chg();},-180,180,1,'°'),
      slider('Opacità',()=>Math.round((d.op==null?1:d.op)*100),v=>{d.op=v/100;chg();},5,100,1,'%'),
      el('div',{class:'row'},
        btn(d.back?'Porta davanti alle foto':'Porta dietro le foto',()=>{d.back=!d.back;chg();commit();syncAll();}),
        btn('Duplica',()=>{const n={...d,id:uid(),x:d.x+.03,y:d.y+.03,auto:false};sp.decos.push(n);sel={type:'deco',id:n.id};commit();syncAll();}),
        btn('Elimina',()=>{sp.decos=sp.decos.filter(k=>k!==d);sel=null;commit();syncAll();},'danger')),
      el('p',{},'Doppio clic sullo sticker per scrivere. Trascina per spostare, il quadratino in basso a destra per ingrandire. Canc per eliminare.'))];
}
function decoProps(d){
  if(d.art)return artProps(d);
  if(d.txt!=null)return badgeProps(d);
  const sp=cur(),T=TH();
  const palette=[...(T.motifColors||[]),T.colors.accent,T.colors.title,T.colors.ink,'#ffffff','#C9A227','#000000'].filter((c,i,a)=>c&&a.indexOf(c)===i);
  const ms=el('select',{'aria-label':'Motivo',onchange:e=>{d.m=e.target.value;d.auto=false;commit();draw();scheduleStrip();}},...MOTIF_IDS.map(m=>el('option',{value:m,selected:m===d.m},MOTIFS[m].l)));
  const chg=()=>{d.auto=false;};
  return[
    sec('Decorazione',el('div',{class:'ph-head'},motifIcon(d.m,d.c,d.c2||d.c,48),el('div',{style:'display:grid;gap:4px'},el('b',{},MOTIFS[d.m]?MOTIFS[d.m].l:d.m),el('span',{class:'u'},d.auto?'aggiunta dal tema':'aggiunta da te'))),
      ms,
      el('div',{class:'sw'},...palette.map(c=>el('button',{type:'button',style:`background:${c}`,title:c,onclick:()=>{d.c=c;chg();commit();syncAll();}}))),
      colorCtl('Colore',()=>d.c,v=>{d.c=v;chg();}),
      colorCtl('Secondo colore',()=>d.c2||d.c,v=>{d.c2=v;chg();}),
      slider('Dimensione',()=>d.s,v=>{d.s=v;chg();},2,300,.5,'mm'),
      slider('Rotazione',()=>d.rot,v=>{d.rot=v;chg();},-180,180,1,'°'),
      slider('Opacità',()=>Math.round(d.op*100),v=>{d.op=v/100;chg();},5,100,1,'%'),
      el('div',{class:'row'},btn('⇋ Specchia',()=>{d.flip=!d.flip;chg();commit();draw();}),
        btn(d.back?'Porta davanti alle foto':'Porta dietro le foto',()=>{d.back=!d.back;chg();commit();syncAll();}),
        btn('Duplica',()=>{const n={...d,id:uid(),x:d.x+.03,y:d.y+.03,auto:false};sp.decos.push(n);sel={type:'deco',id:n.id};commit();syncAll();}),
        btn('Elimina',()=>{sp.decos=sp.decos.filter(k=>k!==d);sel=null;commit();syncAll();},'danger')),
      el('p',{},'Trascina per spostare, il quadratino in basso a destra per ingrandire. Canc per eliminare.'))];
}
