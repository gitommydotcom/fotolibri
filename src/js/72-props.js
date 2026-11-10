/* ============ pannello proprietà ============ */
function dpiBadge(d){if(d==null)return null;const r=Math.round(d);
  return d>=250?el('span',{class:'badge ok',title:'Ottima per la stampa'},`${r} dpi · ottima`):d>=150?el('span',{class:'badge warn',title:'Accettabile; ingrandimenti maggiori perdono nitidezza'},`${r} dpi · discreta`):el('span',{class:'badge bad',title:'La foto è troppo piccola per questa dimensione di stampa'},`${r} dpi · bassa`);}
function renderProps(){
  const R=$('#props');const y=R.scrollTop;R.replaceChildren(...propsContent());R.scrollTop=y;
  $('#hint').textContent=UI.mode==='photo'?'Trascina una foto per inquadrarla · portala su un altro riquadro per scambiarle · rotellina per lo zoom · PagSu/PagGiù per sfogliare':'Trascina un riquadro per spostarlo · bordi e angoli per ridimensionare · i bordi condivisi si muovono insieme';
}
function propsContent(){
  if(sel&&sel.type==='text'){const t=txtById(sel.id);if(t)return textProps(t);}
  if(sel&&sel.type==='cell'){const c=byId(sel.id);if(c)return cellProps(c);}
  if(sel&&sel.type==='deco'){const d=decoById(sel.id);if(d)return decoProps(d);}
  return[el('div',{class:'empty'},el('h4',{},'Seleziona una foto, un testo o una decorazione'),
    el('p',{style:'margin:0'},'Clicca una foto sul foglio per inquadrarla, regolarne i colori o toglierla. Per cambiare l’impaginazione usa il pannello Layout, per copertina e colori il pannello Tema.'),
    el('div',{class:'keys'},el('kbd',{},'PagGiù'),'doppia pagina successiva',el('kbd',{},'PagSu'),'doppia pagina precedente',el('kbd',{},'V'),'altra variante di layout',
      el('kbd',{},'Ctrl+Z'),'annulla',el('kbd',{},'Ctrl+Y'),'ripeti',el('kbd',{},'M'),'modalità Foto / Riquadri',el('kbd',{},'Canc'),'togli la foto dalla pagina',
      el('kbd',{},'Frecce'),'sposta di poco',el('kbd',{},'Ctrl+rotellina'),'zoom della vista',el('kbd',{},'Ctrl+E'),'esporta',el('kbd',{},'F'),'vista libro (nasconde i pannelli)',el('kbd',{},'[  ]'),'pannello sinistro / destro',el('kbd',{},'← →'),'sfoglia (senza selezione)'))];
}
function removeFromPage(c){const sp=cur(),side=c.side;const phs=pagePhs(sp,side);const i=sp.cells.filter(k=>k.side===side).indexOf(c);phs.splice(i,1);relayoutPage(sp,side,{phs});sel=null;}
function cellProps(c){
  const sp=cur(),idx=sp.cells.indexOf(c)+1,ph=c.ph&&LIB.has(c.ph.img)?c.ph:null,out=[];
  if(ph){const im=LIB.get(ph.img);
    out.push(sec(`Foto · ${pageLabel(UI.cur,c.side)}`,
      el('div',{class:'ph-head'},im.thumbURL?el('img',{src:im.thumbURL,alt:''}):null,el('div',{style:'display:grid;gap:4px;min-width:0'},el('div',{class:'nm',title:im.name},im.name),el('div',{class:'u'},`${im.w} × ${im.h} px`),dpiBadge(effDpi(sp,c)))),
      seg([['cover','Riempi riquadro'],['contain','Foto intera']],ph.fit,v=>{ph.fit=v;ph.ox=0;ph.oy=0;commit();renderProps();draw();},true),
      slider('Zoom',()=>Math.round(ph.zoom*100),v=>ph.zoom=v/100,100,800,1,'%'),
      slider('Posizione orizzontale',()=>Math.round(ph.ox*100),v=>ph.ox=v/100,-100,100,1,''),
      slider('Posizione verticale',()=>Math.round(ph.oy*100),v=>ph.oy=v/100,-100,100,1,''),
      el('div',{class:'row'},
        btn('↺ Ruota',()=>{ph.rot=(ph.rot+270)%360;ph.ox=ph.oy=0;commit();renderProps();draw();}),
        btn('↻ Ruota',()=>{ph.rot=(ph.rot+90)%360;ph.ox=ph.oy=0;commit();renderProps();draw();}),
        btn('⇋ Specchia',()=>{ph.flip=!ph.flip;commit();draw();}),
        btn('Centra',()=>{ph.ox=ph.oy=0;ph.zoom=1;commit();renderProps();draw();}))));
    out.push(sec(null,el('div',{class:'row'},
      btn(im.fav?'★ Preferita':'☆ Rendi preferita e ingrandisci',()=>{im.fav=!im.fav;if(im.fav)relayoutPage(sp,c.side);sel=null;commit();syncAll();},im.fav?'alt':'pri','Le preferite vanno nel riquadro più grande'),
      btn('Togli dalla pagina',()=>{removeFromPage(c);commit();syncAll();toast('Foto tolta: la ritrovi tra le “Non usate”',4500,'undo');},'danger','Toglie il riquadro e ridistribuisce le altre foto'),
      btn('Svuota riquadro',()=>{c.ph=null;commit();syncAll();}))));
    out.push(sec('Colore e tono',
      slider('Luminosità',()=>ph.br,v=>ph.br=v,0,200,1,'%'),
      slider('Contrasto',()=>ph.ct,v=>ph.ct=v,0,200,1,'%'),
      slider('Saturazione',()=>ph.sat,v=>ph.sat=v,0,200,1,'%'),
      slider('Bianco e nero',()=>ph.gray,v=>ph.gray=v,0,100,1,'%'),
      slider('Seppia',()=>ph.sepia,v=>ph.sepia=v,0,100,1,'%'),
      el('div',{class:'row'},
        btn('Ripristina',()=>{Object.assign(ph,{br:100,ct:100,sat:100,gray:0,sepia:0,blur:0});commit();renderProps();draw();}),
        btn('Applica a questa doppia pagina',()=>{for(const k of sp.cells)if(k.ph&&k.ph!==ph)Object.assign(k.ph,{br:ph.br,ct:ph.ct,sat:ph.sat,gray:ph.gray,sepia:ph.sepia});commit();draw();scheduleStrip();}),
        btn('A tutto il libro',()=>{for(const s of BOOK.spreads)for(const k of s.cells)if(k.ph&&k.ph!==ph)Object.assign(k.ph,{br:ph.br,ct:ph.ct,sat:ph.sat,gray:ph.gray,sepia:ph.sepia});commit();draw();toast('Regolazioni copiate su tutte le foto del libro',4500,'undo');}))));
  }else{
    out.push(sec(`Riquadro ${idx} · vuoto`,el('p',{},'Trascina una foto dal pannello Foto, oppure caricala direttamente qui.'),
      el('div',{class:'row'},btn('Carica foto qui…',()=>{pickFor=c.id;$('#fileIn').click();},'pri'),btn('Vai alle foto non usate',()=>{UI.tab='photos';UI.filter='unused';renderLeft();}),
        btn('Togli riquadro',()=>{removeFromPage(c);commit();syncAll();},'danger'))));
  }
  const pct=(lab,key)=>{const i=el('input',{type:'number',class:'num',style:'width:100%',step:.5,min:0,max:100,value:+(c[key]*100).toFixed(1),'aria-label':lab});
    i.onchange=()=>{let v=clamp((parseFloat(i.value)||0)/100,0,1);if(key==='w'||key==='h')v=Math.max(.02,v);c[key]=v;
      if(c.x+c.w>1){if(key==='x')c.x=1-c.w;else c.w=1-c.x;}if(c.y+c.h>1){if(key==='y')c.y=1-c.h;else c.h=1-c.y;}commit();renderProps();draw();};
    return el('label',{class:'lbl'},el('span',{class:'u'},lab),i);};
  const r=cellRect(sp,c);
  const fillOn=el('input',{type:'checkbox',checked:!!c.fill,'aria-label':'Usa colore di riempimento',onchange:e=>{c.fill=e.target.checked?(c.fill||'#C2185B'):null;commit();renderProps();draw();}});
  out.push(sec('Forma e bordo',
    seg(SHAPES.map(([v,l])=>[v||'rect',l]),c.shape||'rect',v=>{c.shape=v==='rect'?null:v;commit();renderProps();draw();scheduleStrip();},true),
    slider('Bordo di questa foto',()=>c.bw!=null?c.bw:BOOK.style.borderW,v=>c.bw=v,0,12,.25,'mm'),
    colorCtl('Colore bordo',()=>c.bc||BOOK.style.borderColor,v=>c.bc=v),
    c.bw!=null||c.bc?btn('Usa il bordo del libro',()=>{c.bw=null;c.bc=null;commit();renderProps();draw();}):null));
  out.push(sec('Posizione e misura',
    el('div',{class:'row4'},pct('X %','x'),pct('Y %','y'),pct('Largh. %','w'),pct('Alt. %','h')),
    el('p',{},`Misura in stampa: ${nf(r.w)} × ${nf(r.h)} mm`),
    colorCtl('Riempimento a colore',()=>c.fill||'#C2185B',v=>{c.fill=v;fillOn.checked=true;},fillOn),
    el('div',{class:'row'},
      btn('Porta sopra',()=>{sp.cells=sp.cells.filter(k=>k!==c);sp.cells.push(c);commit();syncAll();}),
      btn('Porta sotto',()=>{sp.cells=sp.cells.filter(k=>k!==c);sp.cells.unshift(c);commit();syncAll();}))));
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
      t.role?el('p',{},t.custom?'Stile personalizzato: non segue più il tema.':'Segue lo stile del tema: cambiando tema si aggiorna da solo.'):null,
      btn('Usa questo stile per tutti i testi simili del libro',()=>{let n=0;for(const s of BOOK.spreads)for(const k of s.texts)if(k!==t&&Math.abs(k.size-t.size)<=8&&k.rot===t.rot){Object.assign(k,{font:t.font,bold:t.bold,italic:t.italic,upper:t.upper,color:t.color,ls:t.ls,shadow:t.shadow,custom:true});n++;}commit();syncAll();toast(`${n} testi aggiornati`);},null,'Copia carattere e colore sui testi di dimensione simile (es. tutti i titoli)')),
    sec('Spaziatura e forma',
      slider('Spazio tra lettere',()=>t.ls,v=>t.ls=v,-10,60,1,''),
      slider('Interlinea',()=>t.lh,v=>t.lh=v,.7,2.5,.05,''),
      slider('Rotazione',()=>t.rot,v=>t.rot=v,-180,180,1,'°'),
      slider('Opacità',()=>t.op,v=>t.op=v,0,100,1,'%')),
    sec('Effetti',
      colorCtl('Fondo dietro al testo',()=>t.boxColor,v=>t.boxColor=v),
      slider('Opacità fondo',()=>t.boxOp,v=>t.boxOp=v,0,100,1,'%'),
      colorCtl('Contorno',()=>t.strokeColor,v=>t.strokeColor=v),
      slider('Spessore contorno',()=>t.strokeW,v=>t.strokeW=v,0,25,.5,''),
      chk('Ombra',()=>t.shadow,v=>t.shadow=v)),
    sec('Posizione',
      slider('Orizzontale',()=>+(t.x*100).toFixed(1),v=>t.x=v/100,0,100,.5,'%'),
      slider('Verticale',()=>+(t.y*100).toFixed(1),v=>t.y=v/100,0,100,.5,'%'),
      el('div',{class:'row'},
        btn('Centra nella pagina',()=>{const side=t.x*spW(sp)<foldX(sp)?'L':'R';const pb=pageBox(sp,side);t.x=(pb.x+pb.w/2)/spW(sp);commit();renderProps();draw();}),
        btn('Duplica',()=>{const d={...t,id:uid(),y:clamp(t.y+.06,0,1)};sp.texts.push(d);sel={type:'text',id:d.id};commit();syncAll();}),
        btn('Elimina testo',()=>{sp.texts=sp.texts.filter(k=>k!==t);sel=null;commit();syncAll();},'danger')))
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
function decoProps(d){
  if(d.art)return artProps(d);
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
