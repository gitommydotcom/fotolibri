/* ============ controlli UI ============ */
function slider(label,get,set,min,max,step,unit,after){
  const num=el('input',{type:'number',class:'num',min,max,step,value:+(+get()).toFixed(2),'aria-label':label});
  const rg=el('input',{type:'range',min,max,step,value:get(),'aria-label':label});
  const upd=(v,src)=>{v=parseFloat(v);if(isNaN(v))return;set(v);if(src!==rg)rg.value=v;if(src!==num)num.value=+v.toFixed(2);draw();after&&after();};
  rg.oninput=()=>upd(rg.value,rg);num.oninput=()=>upd(num.value,num);
  rg.onchange=num.onchange=()=>{commit();};
  return el('div',{class:'ctl'},el('div',{class:'ctl-h'},el('span',{},label),el('span',{class:'u'},num,unit?el('i',{},unit):null)),rg);
}
function colorCtl(label,get,set,extra,onCh){
  const i=el('input',{type:'color',value:get(),'aria-label':label});i.oninput=()=>{set(i.value);draw();};i.onchange=()=>{if(onCh)onCh();else commit();};
  return el('div',{class:'clr'},el('span',{},label),el('div',{class:'row'},extra||null,i));
}
function seg(opts,cur,on,full){const b=el('div',{class:'seg'+(full?' full':'')});
  for(const[v,l,tip] of opts)b.append(el('button',{type:'button',class:v===cur?'on':'',title:tip||null,onclick:()=>on(v)},l));return b;}
function chk(label,get,set,tip){const i=el('input',{type:'checkbox',checked:get()});i.onchange=()=>{set(i.checked);draw();commit();};return el('label',{class:'chk',title:tip||null},i,label);}
function sec(title,...kids){return el('div',{class:'sec'},title?el('h3',{},title):null,...kids);}
function btn(label,on,cls,tip){return el('button',{type:'button',class:'btn sm'+(cls?' '+cls:''),onclick:on,title:tip||null},label);}
function numIn(label,get,set,min,max,step=1){const i=el('input',{type:'number',class:'num',min,max,step,value:get(),'aria-label':label,style:'width:100%'});
  i.onchange=()=>{const v=clamp(parseFloat(i.value)||0,min,max);i.value=v;set(v);};return el('label',{class:'lbl'},el('span',{class:'u'},label),i);}

/* ============ pannello sinistro ============ */
function renderLeft(){
  document.querySelectorAll('#tabs button').forEach(b=>{const on=b.dataset.t===UI.tab;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});
  const L=$('#leftBody'),y=L.scrollTop;L.replaceChildren(...({photos:tabPhotos,theme:tabTheme,pages:tabPages,layout:tabLayout,text:tabText,deco:tabDeco,book:tabBook}[UI.tab])().filter(Boolean));L.scrollTop=y;
}
function tabPhotos(){
  const U=usage(),all=ORDER.map(id=>LIB.get(id)).filter(Boolean);
  const nUsed=all.filter(e=>U.has(e.id)).length,nEx=all.filter(e=>e.excl).length,nFav=all.filter(e=>e.fav).length;
  const drop=el('div',{class:'drop',tabindex:0,role:'button',onclick:()=>{pickFor=null;$('#fileIn').click();},
    onkeydown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pickFor=null;$('#fileIn').click();}},
    ondragover:e=>{e.preventDefault();e.currentTarget.classList.add('over');},ondragleave:e=>e.currentTarget.classList.remove('over'),
    ondrop:e=>e.currentTarget.classList.remove('over')},
    el('b',{},'Aggiungi foto'),el('br'),'clicca o trascina qui anche centinaia di file');
  const chs=BOOK.chapters,cnt=new Map();for(const e of all)cnt.set(e.folder||'',(cnt.get(e.folder||'')||0)+1);
  if(UI.folder!=='*'&&!cnt.has(UI.folder))UI.folder='*';
  const list=all.filter(e=>(UI.folder==='*'||(e.folder||'')===UI.folder)&&(UI.filter==='all'?true:UI.filter==='unused'?!U.has(e.id)&&!e.excl:UI.filter==='excl'?e.excl:e.fav));
  const tray=el('div',{class:'tray',id:'tray'});
  const visible=list.map(e=>e.id);
  for(const e of list){const u=U.get(e.id);
    const it=el('div',{class:'ti'+(TSEL.has(e.id)?' sel':'')+(e.excl?' ex':''),draggable:'true',tabindex:0,
      title:`${e.name} · ${e.w}×${e.h} px${e.date?` · ${new Date(e.date).toLocaleString('it-IT',{dateStyle:'medium',timeStyle:'short'})}${e.dateSrc==='file'?' (data del file)':''}`:''}\nClic: seleziona · Doppio clic: aggiungi alla pagina attiva · Trascina sul foglio`,
      ondragstart:ev=>{const ids=TSEL.has(e.id)?[...TSEL]:[e.id];dragKind=ids.length>1?'multi':'one';ev.dataTransfer.setData('text/x-imgs',JSON.stringify(ids));ev.dataTransfer.effectAllowed='copy';
        $('#hint').textContent=ids.length>1?`Rilascia ${ids.length} foto su una pagina per aggiungerle`:'Rilascia su un riquadro per sostituire la foto · sugli spazi bianchi (o con Alt) per aggiungerla alla pagina';},
      onclick:ev=>trayClick(e.id,ev,visible),
      ondblclick:()=>{const sp=cur();TSEL.clear();addToPage(sp,activeSide(sp),[e.id]);sel=null;commit();syncAll();toast(`Aggiunta a ${pageLabel(UI.cur,activeSide(sp))}`);},
      onkeydown:ev=>{if(ev.key==='Enter')ev.currentTarget.dispatchEvent(new MouseEvent('dblclick'));}},
      e.thumbURL?el('img',{src:e.thumbURL,alt:e.name,loading:'lazy'}):el('span',{class:'nm'},e.name),
      e.sample?el('span',{class:'tag'},'ESEMPIO'):e.excl?el('span',{class:'tag'},e.exclWhy==='simile'?'SIMILE':'SCARTATA'):(!e.file&&!e.sample?el('span',{class:'tag',title:'Manca l’originale: ricollega la foto per stampare in alta qualità'},'ANTEPRIMA'):null),
      u?el('button',{type:'button',class:'cnt',title:`Usata ${u.n} ${u.n>1?'volte':'volta'}: vai alla pagina`,onclick:ev=>{ev.stopPropagation();goSpread(u.sp);}},u.n>1?'×'+u.n:'✓'):null,
      el('button',{type:'button',class:'hb xb',title:e.excl?'Ripristina':'Scarta (non verrà usata nel libro automatico)','aria-label':e.excl?'Ripristina':'Scarta',onclick:ev=>{ev.stopPropagation();e.excl=!e.excl;e.exclWhy=e.excl?'manuale':'';scheduleSave();renderLeft();}},e.excl?'↺':'⊘'),
      el('button',{type:'button',class:'hb fv'+(e.fav?' on':''),title:e.fav?'Togli dalle preferite':'Preferita: più grande nel libro','aria-label':'Preferita',onclick:ev=>{ev.stopPropagation();e.fav=!e.fav;scheduleSave();renderLeft();}},'★'));
    tray.append(it);}
  const act=TSEL.size?el('div',{class:'trayact'},el('div',{class:'row'},el('b',{},`${TSEL.size} selezionate`),el('span',{class:'spacer'}),btn('Deseleziona',()=>{TSEL.clear();renderLeft();})),
    el('div',{class:'row'},
      btn('Aggiungi alla pagina',()=>{const sp=cur(),side=activeSide(sp);addToPage(sp,side,[...TSEL]);TSEL.clear();sel=null;commit();syncAll();toast(`Aggiunte a ${pageLabel(UI.cur,side)}`);},'pri'),
      btn('In una nuova doppia pagina',()=>{const ids=[...TSEL];const sp=mkSpread('inner');BOOK.spreads.splice(UI.cur+1,0,sp);const h=Math.ceil(ids.length/2);
        if(ids.length===1)relayoutPage(sp,'L',{phs:[newPh(ids[0])]});else{relayoutPage(sp,'L',{phs:ids.slice(0,h).map(newPh)});relayoutPage(sp,'R',{phs:ids.slice(h).map(newPh)});}
        UI.cur++;TSEL.clear();sel=null;commit();syncAll();}),
      btn('★',()=>{const on=![...TSEL].every(id=>LIB.get(id).fav);TSEL.forEach(id=>LIB.get(id).fav=on);scheduleSave();renderLeft();},null,'Preferite sì/no'),
      btn('Scarta',()=>{TSEL.forEach(id=>{const e=LIB.get(id);e.excl=true;e.exclWhy='manuale';});TSEL.clear();scheduleSave();renderLeft();}))):null;
  const simSec=SIMS.length?sec(`Scatti simili e doppioni · ${SIMS.length} gruppi`,
    el('p',{},'Bordo verde = tenuta. Clicca una foto per tenerla o scartarla. Di solito basta tenere la più nitida.'),
    el('div',{class:'row'},btn('Tieni la più nitida di ogni gruppo',()=>{const n=applySimilar();scheduleSave();renderLeft();toast(n?`${n} scatti simili scartati`:'Già fatto');},'pri'),
      btn('Tieni tutte',()=>{SIMS.flat().forEach(id=>{const e=LIB.get(id);if(e.exclWhy==='simile'){e.excl=false;e.exclWhy='';}});scheduleSave();renderLeft();})),
    ...SIMS.slice(0,40).map(g=>el('div',{class:'simg'},...g.map(id=>{const e=LIB.get(id);return el('button',{type:'button',class:e.excl?'out':'',title:`${e.name}${e.excl?' · scartata':' · tenuta'}`,
      onclick:()=>{e.excl=!e.excl;e.exclWhy=e.excl?'simile':'';scheduleSave();renderLeft();}},e.thumbURL?el('img',{src:e.thumbURL,alt:''}):null,id===bestOf(g)?el('span',{},'nitida'):null);}))),
    SIMS.length>40?el('p',{},`…e altri ${SIMS.length-40} gruppi.`):null):null;
  const mv=(i,d)=>{const j=i+d;if(j<0||j>=chs.length)return;[chs[i],chs[j]]=[chs[j],chs[i]];commit();renderLeft();};
  const chapSec=chs.length>1?sec(`Capitoli · ${chs.length} cartelle`,
    el('p',{},'Ogni cartella diventa un capitolo, in quest’ordine. Rinomina i titoli, riordina o escludi una cartella, poi crea il libro.'),
    el('div',{class:'chl'},...chs.map((ch,i)=>el('div',{class:'chr'+(ch.on?'':' off')},
      el('div',{class:'mv'},el('button',{type:'button',title:'Sposta su','aria-label':'Sposta su',disabled:i===0,onclick:()=>mv(i,-1)},'▲'),el('button',{type:'button',title:'Sposta giù','aria-label':'Sposta giù',disabled:i===chs.length-1,onclick:()=>mv(i,1)},'▼')),
      el('input',{type:'checkbox',checked:ch.on,title:'Includi nel libro','aria-label':'Includi '+ch.title,onchange:e=>{ch.on=e.target.checked;commit();renderLeft();}}),
      el('input',{class:'inp',value:ch.title,title:'Cartella: '+(ch.folder||'(file senza cartella)'),'aria-label':'Titolo del capitolo',onchange:e=>{ch.title=e.target.value;commit();}}),
      el('button',{type:'button',class:'n'+(UI.folder===ch.folder?' on':''),title:'Mostra solo le foto di questa cartella',onclick:()=>{UI.folder=UI.folder===ch.folder?'*':ch.folder;renderLeft();}},String(cnt.get(ch.folder)||0))))),
    el('div',{class:'row'},btn('Crea libro dai capitoli…',()=>{WZ.group='folder';WZ.userGroup=true;openWizard();},'alt'),
      btn('Ordina per nome cartella',()=>{chs.sort((a,b)=>a.folder.localeCompare(b.folder,'it',{numeric:true}));commit();renderLeft();}))):null;
  const folderSel=chs.length>1?el('select',{'aria-label':'Cartella',onchange:e=>{UI.folder=e.target.value;renderLeft();}},
    el('option',{value:'*',selected:UI.folder==='*'},`Tutte (${all.length})`),...chs.map(ch=>el('option',{value:ch.folder,selected:UI.folder===ch.folder},`${ch.title} (${cnt.get(ch.folder)||0})`))):null;
  return[
    sec(`Foto · ${all.length}`,drop,
      el('div',{class:'row'},btn('Scegli cartella (anche con sottocartelle)…',()=>$('#dirIn').click(),'pri','Ogni sottocartella diventa un capitolo. Puoi anche caricare una cartella alla volta.')),
      el('p',{},'Trascina qui anche una o più cartelle. Le sottocartelle diventano capitoli; puoi aggiungere altre cartelle in qualsiasi momento.')),
    chapSec,
    sec(null,
      el('div',{class:'row2'},folderSel||el('span',{}),
        el('select',{'aria-label':'Ordina',onchange:e=>{UI.sort=e.target.value;sortOrder();renderLeft();}},
          el('option',{value:'date',selected:UI.sort==='date'},'Per data di scatto'),el('option',{value:'name',selected:UI.sort==='name'},'Per nome file'))),
      el('div',{class:'stats'},el('span',{},el('b',{},String(nUsed)),' nel libro'),el('span',{},el('b',{},String(all.length-nUsed-nEx)),' libere'),el('span',{},el('b',{},String(nEx)),' scartate'),el('span',{},el('b',{},String(nFav)),' ★')),
      seg([['all','Tutte'],['unused','Non usate'],['fav','★ Preferite'],['excl','Scartate']],UI.filter,v=>{UI.filter=v;renderLeft();},true),
      act,list.length?tray:el('p',{},UI.filter==='unused'?'Tutte le foto sono già nel libro.':'Nessuna foto qui.'),
      el('p',{},'Clic = seleziona (Ctrl/Maiusc per più foto) · doppio clic = aggiungi alla pagina attiva · ★ preferita = più grande nel libro.')),
    simSec
  ];
}
function trayClick(id,ev,visible){
  if(ev.shiftKey&&lastTSel&&visible.includes(lastTSel)){const a=visible.indexOf(lastTSel),b=visible.indexOf(id);for(let i=Math.min(a,b);i<=Math.max(a,b);i++)TSEL.add(visible[i]);}
  else if(ev.ctrlKey||ev.metaKey){if(TSEL.has(id))TSEL.delete(id);else TSEL.add(id);}
  else{const c=UI.mode==='photo'&&sel&&sel.type==='cell'&&byId(sel.id);
    if(c){c.ph=newPh(id);commit();syncAll();toast('Foto messa nel riquadro selezionato');return;}
    if(TSEL.size===1&&TSEL.has(id))TSEL.clear();else{TSEL.clear();TSEL.add(id);}}
  lastTSel=id;renderLeft();
}
function layThumb(defs,A,phs,perm,box=66){
  const w=A>=1?box:box*A,h=A>=1?box/A:box,dpr=window.devicePixelRatio||1;
  const c=el('canvas',{width:Math.round(w*dpr),height:Math.round(h*dpr),style:`width:${w}px;height:${h}px`});const x=c.getContext('2d');x.scale(dpr,dpr);
  x.fillStyle=cssVar('--line');x.fillRect(0,0,w,h);const mu=cssVar('--muted');
  defs.forEach((d,ci)=>{const X=d[0]*w+1,Y=d[1]*h+1,W=Math.max(.5,d[2]*w-2),H=Math.max(.5,d[3]*h-2);
    const ph=phs&&perm?phs[perm[ci]]:null,e=ph&&LIB.get(ph.img);
    if(e&&e.thumbBmp){x.save();x.beginPath();x.rect(X,Y,W,H);x.clip();const iw=e.thumbBmp.width,ih=e.thumbBmp.height,k=Math.max(W/iw,H/ih);x.drawImage(e.thumbBmp,X+W/2-iw*k/2,Y+H/2-ih*k/2,iw*k,ih*k);x.restore();}
    else{x.fillStyle=mu;x.fillRect(X,Y,W,H);}});
  return c;
}
function tabLayout(){
  const sp=cur(),side=activeSide(sp),M=meta(sp,side),phs=pagePhs(sp,side),n=phs.length,I=areaOf(sp,side),A=I.w/I.h;
  if(isInner(sp)&&isSpecial(sp,side)){const K=SPECIALS.find(k=>k[0]===M.special);return[sec(pageLabel(UI.cur,side),el('p',{},`Pagina speciale${K?': '+K[1].toLowerCase():M.special==='effect'?': effetto':''}. Si modifica dal pannello Pagine o direttamente sul foglio.`),
    el('div',{class:'row'},btn('Apri il pannello Pagine',()=>{UI.tab='pages';renderLeft();},'pri'),btn('Rendi pagina normale',()=>{unspecial(sp,side);sel=null;commit();syncAll();},null,'Tiene le foto e le impagina normalmente')))];}
  const cands=pageCands(sp,side);
  const g=el('div',{class:'lgrid'});
  for(const c of cands)g.append(el('button',{type:'button',class:'lth'+(c.key===M.lay?' on':''),title:c.name,onclick:()=>{relayoutPage(sp,side,{key:c.key});sel=null;commit();syncAll();}},layThumb(c.defs,A,phs,c.perm),c.name));
  const sideSeg=sp.mode==='spread'?el('p',{},'Le due pagine sono unite: una sola impaginazione attraverso la piega.'):
    seg([['L',isCover(sp)?'Retro':isEnd(sp)?'Metà sinistra':'Pagina sinistra'],['R',isCover(sp)?'Fronte':isEnd(sp)?'Metà destra':'Pagina destra']],side,v=>{UI.side=v;sel=null;renderLeft();draw();},true);
  const nextVar=()=>{if(!cands.length)return;const i=cands.findIndex(c=>c.key===M.lay);relayoutPage(sp,side,{key:cands[(i+1)%cands.length].key});sel=null;commit();syncAll();};
  return[
    sec(`${pageLabel(UI.cur,side)} · ${n} ${n===1?'riquadro':'riquadri'}`,sideSeg,
      el('div',{class:'row'},
        btn('− riquadro',()=>{if(!n)return;const i=phs.lastIndexOf(null);if(i>=0)phs.splice(i,1);else phs.pop();relayoutPage(sp,side,{phs});sel=null;commit();syncAll();},null,'Un riquadro in meno (la foto torna tra le libere)'),
        btn('+ riquadro',()=>{phs.push(null);relayoutPage(sp,side,{phs});sel=null;commit();syncAll();},null,'Un riquadro vuoto in più'),
        btn('↻ Altra variante',nextVar,'pri','Prova il prossimo layout (tasto V)')),
      chk('Al vivo: niente margini su questa pagina',()=>M.full,v=>{M.full=v;relayoutPage(sp,side,{key:M.lay});syncAll();}),
      chk('Spazio per un titolo in alto',()=>!!M.band,v=>{M.band=v?.13:0;relayoutPage(sp,side,{key:M.lay});syncAll();}),
      n?el('p',{},'Layout ordinati dal più adatto alle tue foto (meno ritaglio). Le preferite ★ vanno nel riquadro più grande.'):el('p',{},'Pagina vuota: trascina qui le foto, oppure fai doppio clic su una miniatura nel pannello Foto.'),
      n?g:null),
    sec('Tutto il libro',
      el('div',{class:'row'},btn('Nuove varianti per tutte le pagine',()=>{relayoutAll(false);sel=null;commit();syncAll();toast('Layout rimescolati: Ctrl+Z per tornare indietro');}),
        btn('Crea libro automatico…',openWizard,'alt'))),
    sec('Riquadri liberi',
      el('div',{class:'row'},btn('Aggiungi riquadro libero',()=>{const c=mkCell([.3,.3,.4,.4],side);sp.cells.push(c);sel={type:'cell',id:c.id};setMode('layout');commit();syncAll();}),
        btn('Svuota questa pagina',()=>{const ph=clearSide(sp,side).filter(p=>!usedInInterior(p.img,sp,side));const r=redistribute(ph,pageNum(UI.cur,side==='S'?'L':side),{afterIdx:UI.cur,exclude:x=>x.sp===sp&&x.side===side});sel=null;commit();syncAll();toast('Pagina svuotata'+redistMsg(r),4500,'undo');},'danger','Le foto vengono spostate nelle pagine vicine')),
      chk('Bordi in comune si muovono insieme',()=>UI.link,v=>UI.link=v),
      chk('Aggancio a griglia e bordi',()=>UI.snap,v=>UI.snap=v),
      el('p',{},'In modalità Riquadri (tasto M) trascina un riquadro per spostarlo e i bordi o gli angoli per ridimensionarlo.'))
  ];
}

/* ============ tema ============ */
const TPREV=new Map();
function themePreview(id,w=118,ov){
  const ph=ORDER.find(i=>LIB.get(i)&&LIB.get(i).fav)||ORDER.find(i=>{const e=LIB.get(i);return e&&e.w>=e.h;})||ORDER[0]||null;
  const pk=id+(ov?JSON.stringify(ov):''),key=pk+'|'+ph+'|'+BOOK.page.w+'x'+BOOK.page.h+'|'+thumbGen+'|'+(id===BOOK.theme.id?JSON.stringify(BOOK.theme):'');
  const c0=TPREV.get(pk);if(c0&&c0.key===key)return c0.cv;
  const save=BOOK.theme;BOOK.theme={...(id===save.id?save:{id,colors:{},fonts:{},deco:save.deco==null?1:save.deco,coverLayout:null}),...(ov||{})};
  const c=c0?c0.cv:document.createElement('canvas');
  try{const sp=makeCover({},ph?[ph]:[]);
    const P=pageBox(sp,'R'),H=pgH(sp),s=w/P.w,h=Math.round(H*s),dpr=window.devicePixelRatio||1;
    c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.width=w+'px';c.style.height=h+'px';
    const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
    renderSpread(x,sp,{s,ox:-P.x*s,oy:0,q:'thumb'});
  }finally{BOOK.theme=save;}
  TPREV.set(pk,{key,cv:c});return c;
}
function restyleTexts(){const T=TH();for(const sp of BOOK.spreads)for(const t of sp.texts){if(!t.role||t.custom)continue;const st=roleStyle(t.role,T,bgOf(sp));
  if(isCover(sp)&&T.coverLayout==='full'&&(t.role==='cover-title'||t.role==='cover-sub')){st.color='#ffffff';st.shadow=true;}const of=t.font;Object.assign(t,st);if(of!==t.font)t.size=+(t.size/fScale(of)*fScale(t.font)).toFixed(1);}}
function regenDecos(){for(const sp of BOOK.spreads)themeDecos(sp);}
function themeChanged(o={}){if(o.texts!==false)restyleTexts();if(o.decos)regenDecos();if(o.cover)rebuildCover();THUMBS.clear();commit();syncAll();}
function fontSel(label,get,set){const s=el('select',{'aria-label':label});
  const g2=el('optgroup',{label:'Caratteri del programma'});FONTS_WEB.forEach(f=>g2.append(el('option',{value:f,style:`font-family:'${f}'`},f)));
  const g1=el('optgroup',{label:'Installati sul computer'});FONTS_SYS.forEach(f=>g1.append(el('option',{value:f},f)));
  s.append(g2,g1);s.value=get();s.onchange=()=>{set(s.value);if(document.fonts)document.fonts.load(`40px "${s.value}"`).then(()=>{draw();THUMBS.clear();scheduleStrip();}).catch(()=>{});};
  return el('label',{class:'lbl'},el('span',{},label),s);}
const LOOKS=[
  ['Classico',{margin:10,bind:15,gutter:4,radius:0,borderW:0,shadow:0},'Margini regolari'],
  ['Arioso',{margin:18,bind:20,gutter:8,radius:0,borderW:0,shadow:0},'Molto spazio intorno alle foto'],
  ['Compatto',{margin:6,bind:12,gutter:2,radius:0,borderW:0,shadow:0},'Foto più grandi'],
  ['Al vivo',{margin:0,bind:0,gutter:1.5,radius:0,borderW:0,shadow:0},'Fino al bordo: per libri ad apertura piatta'],
  ['Album',{margin:14,bind:18,gutter:7,radius:0,borderW:1.5,borderColor:'#ffffff',shadow:1.5},'Foto con bordo bianco e ombra'],
  ['Morbido',{margin:12,bind:16,gutter:5,radius:3,borderW:0,shadow:0},'Angoli arrotondati'],
];
function tabTheme(){
  const T=TH(),bt=BOOK.theme,sp=cur();
  const groups=THEME_GROUPS.map(g=>sec(g==='Neutri'?'Neutri':g==='Feste'?'Feste e ricorrenze':'Eventi e momenti',
    el('div',{class:'themes'},...THEMES.filter(t=>t.group===g).map(t=>el('button',{type:'button',class:'thc'+(t.id===bt.id?' on':''),title:t.desc,
      onclick:()=>{if(t.id===bt.id)return;applyTheme(t.id);THUMBS.clear();TPREV.clear();commit();syncAll();toast(`Tema “${t.name}”: copertina, risguardi, titoli e decorazioni aggiornati. Ctrl+Z per tornare indietro.`,4000);}},
      el('div',{class:'thp'},themePreview(t.id)),el('b',{},t.name))))));
  const C=T.colors,colorRow=(lab,k)=>colorCtl(lab,()=>C[k],v=>{bt.colors[k]=v;},null,()=>themeChanged());
  return[
    sec(`Tema del libro · ${T.name}`,el('p',{},T.desc+'. Il tema imposta copertina, retro, dorso, risguardi, titoli e decorazioni. Le tue foto e l’impaginazione restano.')),
    ...groups,
    sec('Copertina · proposte per questo tema',
      el('div',{class:'themes'},...coverProposals(T).map(v=>el('button',{type:'button',class:'thc'+(T.coverLayout===v.coverLayout&&T.coverBg===v.coverBg?' on':''),title:v.name,
        onclick:()=>{bt.coverLayout=v.coverLayout;bt.coverBg=v.coverBg;themeChanged({cover:true});goSpread(BOOK.spreads.findIndex(isCover));}},el('div',{class:'thp'},themePreview(T.id,118,v)),el('b',{},v.name)))),
      el('div',{class:'lbl'},el('span',{},'Impaginazione'),el('div',{class:'covl'},...COVER_LAYOUTS.map(([v,l,tip])=>el('button',{type:'button',class:'cl'+(T.coverLayout===v?' on':''),title:tip,onclick:()=>{bt.coverLayout=v;themeChanged({cover:true});goSpread(BOOK.spreads.findIndex(isCover));}},covIcon(v),l)))),
      el('label',{class:'lbl'},el('span',{},'Sfondo'),el('select',{onchange:e=>{bt.coverBg=e.target.value;themeChanged({cover:true});goSpread(BOOK.spreads.findIndex(isCover));}},...COVER_BGS.map(([v,l])=>el('option',{value:v,selected:T.coverBg===v},l)))),
      el('p',{},'La copertina viene ricreata con le stesse foto e lo stesso titolo. Poi puoi spostare e cambiare tutto.')),
    BOOK.endp.on?tabEndpapers(T):null,
    sec('Decorazioni del tema',
      seg([['0','Nessuna'],['1','Leggere'],['2','Ricche']],String(T.deco),v=>{bt.deco=+v;themeChanged({decos:true});},true),
      chk('Motivo sullo sfondo della copertina',()=>bt.coverPattern!==false,v=>{bt.coverPattern=v;THUMBS.clear();syncAll();}),
      chk('Motivo sui risguardi',()=>bt.endPattern!==false,v=>{bt.endPattern=v;THUMBS.clear();syncAll();}),
      el('p',{},'“Ricche” aggiunge anche un motivo leggero sulle pagine interne. Ogni decorazione si può spostare, cambiare o togliere.')),
    sec('Colori',colorRow('Pagine interne','paper'),colorRow('Titoli','title'),colorRow('Testi','ink'),colorRow('Accento e ornamenti','accent'),
      colorRow('Copertina','cover'),colorRow('Scritte in copertina','coverInk'),colorRow('Risguardi','endpaper'),
      Object.keys(bt.colors).length?btn('Ripristina i colori del tema',()=>{bt.colors={};themeChanged();}):null),
    sec('Caratteri',fontSel('Titoli',()=>T.fonts.title,v=>{bt.fonts.title=v;themeChanged();}),fontSel('Sottotitoli e didascalie',()=>T.fonts.sub,v=>{bt.fonts.sub=v;themeChanged();}),
      Object.keys(bt.fonts).length?btn('Ripristina i caratteri del tema',()=>{bt.fonts={};themeChanged();}):null),
    sec('Spaziature e cornici (tutto il libro)',
      el('div',{class:'looks'},...LOOKS.map(([name,v,tip])=>el('button',{type:'button',class:'look',title:tip,onclick:()=>{Object.assign(BOOK.style,v);relayoutAll(true);THUMBS.clear();commit();syncAll();toast('Spaziature: '+name);}},
        el('i',{style:`--m:${Math.max(2,v.margin/2.5)}px;--g:${Math.max(1,v.gutter/2)}px;--r:${v.radius}px`},el('u'),el('u')),name))),
      slider('Margine esterno',()=>BOOK.style.margin,v=>BOOK.style.margin=v,0,40,.5,'mm',()=>THUMBS.clear()),
      slider('Margine verso la piega',()=>BOOK.style.bind,v=>BOOK.style.bind=v,0,40,.5,'mm'),
      slider('Spazio tra le foto',()=>BOOK.style.gutter,v=>BOOK.style.gutter=v,0,30,.5,'mm'),
      slider('Angoli arrotondati',()=>BOOK.style.radius,v=>BOOK.style.radius=v,0,30,.5,'mm'),
      slider('Bordo delle foto',()=>BOOK.style.borderW,v=>BOOK.style.borderW=v,0,10,.25,'mm'),
      colorCtl('Colore del bordo',()=>BOOK.style.borderColor,v=>BOOK.style.borderColor=v),
      slider('Ombra',()=>BOOK.style.shadow,v=>BOOK.style.shadow=v,0,10,.5,'mm')),
    sec(`Sfondo di questa doppia pagina · ${spreadLabel(UI.cur)}`,
      colorCtl('Colore',()=>bgOf(sp),v=>sp.bg=v,null,()=>{commit();syncAll();}),
      el('div',{class:'sw'},...[C.paper,C.cover,C.endpaper,C.accent,C.title,'#ffffff','#F4EFE6','#1C1C1C'].filter((c,i,a)=>a.indexOf(c)===i).map(c=>el('button',{type:'button',style:`background:${c}`,title:c,'aria-label':'Sfondo '+c,onclick:()=>{sp.bg=c;restyleTexts();commit();syncAll();}}))),
      el('label',{class:'lbl'},el('span',{},'Motivo di sfondo'),el('select',{onchange:e=>{const v=e.target.value;sp.pat=v==='theme'?null:v==='none'?'none':customPattern(v);commit();syncAll();}},
        el('option',{value:'theme',selected:sp.pat==null},'Come il tema'),el('option',{value:'none',selected:sp.pat==='none'},'Nessuno'),
        ...Object.entries(PATTERNS).filter(([k])=>k!=='none').map(([k,v])=>el('option',{value:k,selected:sp.pat&&sp.pat.type===k},v.l+' (motivi del tema)')))),
      sp.bg||sp.pat!=null?btn('Torna allo sfondo del tema',()=>{sp.bg=null;sp.pat=null;restyleTexts();commit();syncAll();}):null),
    sec('Guide',chk('Mostra margini, taglio e zone di sicurezza',()=>UI.guides,v=>UI.guides=v))
  ];
}
function customPattern(type){const T=TH(),cols=T.motifColors&&T.motifColors.length?T.motifColors:[T.colors.accent];
  const mot=(T.motifs||[]).filter(m=>!['flourish','rule'].includes(m));
  return{type,motifs:mot.length?mot:['dot'],colors:cols,size:type==='dots'?3:8,gap:type==='dots'?12:24,op:type==='stripes'||type==='diag'||type==='plaid'?.25:.45,c2:T.c2||null};}
function covIcon(v){const c=el('canvas',{width:44,height:44,style:'width:22px;height:22px'}),x=c.getContext('2d');x.scale(2,2);x.fillStyle=cssVar('--muted')||'#888';x.globalAlpha=.85;
  const R=(a,b,w,h)=>x.fillRect(a,b,w,h);
  if(v==='full')R(0,0,22,22);else if(v==='framed'){R(3,2,16,12);R(6,16,10,2);}else if(v==='arch'){archPath(x,5,2,12,13);x.fill();R(6,17,10,2);}
  else if(v==='circle'){x.beginPath();x.arc(11,8,6.5,0,TAU);x.fill();R(6,17,10,2);}else if(v==='heart'){heartPath(x,4,1,14,14);x.fill();R(6,17,10,2);}
  else if(v==='collage'){R(2,4,5,9);R(8.5,4,5,9);R(15,4,5,9);R(6,16,10,2);}else{R(4,9,14,3);R(7,14,8,1.5);}
  x.globalAlpha=.25;x.strokeStyle=x.fillStyle;x.strokeRect(.5,.5,21,21);return c;}

/* ============ decorazioni ============ */
UI.decoColor=null;UI.decoGroup='theme';
function motifIcon(m,c,c2,sz=34){const dpr=window.devicePixelRatio||1,cv2=el('canvas',{width:sz*dpr,height:sz*dpr,style:`width:${sz}px;height:${sz}px`}),x=cv2.getContext('2d');x.scale(dpr,dpr);drawMotif(x,m,sz/2,sz/2,sz*.82,0,c,c2);return cv2;}
function addDeco(m,x,y,o={}){const sp=cur(),T=TH();if(x==null){const pb=visBox(sp,activeSide(sp));x=(pb.x+pb.w/2)/spW(sp);y=.5;}
  const d=mkDeco({m,x,y,s:o.s||Math.round(Math.min(BOOK.page.w,BOOK.page.h)*.09),c:UI.decoColor||(T.motifColors&&T.motifColors[0])||T.colors.accent,c2:T.c2||T.colors.accent2,...o});
  sp.decos.push(d);sel={type:'deco',id:d.id};commit();syncAll();return d;}
function tabDeco(){
  const T=TH(),sp=cur(),side=activeSide(sp),mine=(T.motifs||[]).filter(m=>MOTIFS[m]);
  const palette=[...(T.motifColors||[]),T.colors.accent,T.colors.title,T.colors.ink,'#ffffff','#C9A227'].filter((c,i,a)=>c&&a.indexOf(c)===i);
  const col=UI.decoColor||palette[0];
  const groups={theme:'Del tema',all:'Tutti'};
  const list=UI.decoGroup==='theme'&&mine.length?mine:MOTIF_IDS;
  const lib=el('div',{class:'motifs'},...list.map(m=>el('button',{type:'button',class:'mt',title:MOTIFS[m].l+' · clic per aggiungere, oppure trascina sul foglio',draggable:'true',
    ondragstart:e=>{e.dataTransfer.setData('text/x-motif',m);e.dataTransfer.effectAllowed='copy';dragKind='motif';},
    onclick:()=>addDeco(m)},motifIcon(m,col,T.c2||T.colors.accent2),el('span',{},MOTIFS[m].l))));
  const autoN=BOOK.spreads.reduce((a,s)=>a+(s.decos||[]).filter(d=>d.auto).length,0);
  const corners=()=>{const V=visBox(sp,side),W=spW(sp),H=pgH(sp),m=list[0],s=Math.min(V.w,V.h)*.1,o=BOOK.safe+s*.6;
    [[V.x+o,V.y+o,-15],[V.x+V.w-o,V.y+o,15],[V.x+o,V.y+V.h-o,15],[V.x+V.w-o,V.y+V.h-o,-15]].forEach(([x,y,r],k)=>sp.decos.push(mkDeco({m:list[k%list.length]||m,x:x/W,y:y/H,s,rot:r,c:palette[k%palette.length],c2:T.c2||T.colors.accent2})));commit();syncAll();};
  return[
    sec('Aggiungi una decorazione',
      mine.length?seg(Object.entries(groups),UI.decoGroup,v=>{UI.decoGroup=v;renderLeft();},true):null,
      el('div',{class:'row'},el('span',{class:'u'},'Colore'),el('div',{class:'sw'},...palette.map(c=>el('button',{type:'button',class:col===c?'on':'',style:`background:${c}`,title:c,onclick:()=>{UI.decoColor=c;renderLeft();}}))),
        el('input',{type:'color',value:col,'aria-label':'Altro colore',oninput:e=>{UI.decoColor=e.target.value;},onchange:()=>renderLeft()})),
      lib,el('p',{},'Clic per aggiungere al centro della pagina attiva, o trascina il motivo dove vuoi. Le decorazioni sono vettoriali: in stampa restano nitide.')),
    sec(`Su ${pageLabel(UI.cur,side)}`,
      el('div',{class:'row'},btn('Angoli decorati',corners,null,'Quattro motivi agli angoli della pagina'),
        btn('Togli le decorazioni da questa doppia pagina',()=>{sp.decos=[];sel=null;commit();syncAll();},'danger'))),
    sec('Decorazioni automatiche del tema',el('p',{},`${autoN} nel libro, vicino a titoli e in copertina.`),
      el('div',{class:'row'},btn('Rigenera',()=>{regenDecos();commit();syncAll();toast('Decorazioni del tema rigenerate');}),
        btn('Togli tutte',()=>{for(const s of BOOK.spreads)s.decos=(s.decos||[]).filter(d=>!d.auto);commit();syncAll();},'danger')))
  ];
}

/* ============ testi ============ */
function tabText(){
  const sp=cur(),side=activeSide(sp),V=visBox(sp,side),W=spW(sp),H=pgH(sp),cx=(V.x+V.w/2)/W,T=TH();
  const today=new Date().toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'});
  const R=(role,text,y,size,extra)=>()=>addText({...roleStyle(role,T,bgOf(sp)),role,text,x:cx,y:(V.y+V.h*y)/H,size,...(extra||{})});
  const list=el('div',{class:'tlist'});
  sp.texts.forEach(t=>list.append(el('button',{type:'button',class:sel&&sel.id===t.id?'on':'',onclick:()=>{sel={type:'text',id:t.id};syncAll();}},(t.text||'(vuoto)').split('\n')[0])));
  return[
    sec(`Aggiungi su ${pageLabel(UI.cur,side)}`,el('div',{class:'tadd'},
      btn('Titolo',R('chapter','Titolo',.12,Math.round(30*fScale(T.fonts.title)))),
      btn('Sottotitolo',R('chapter-sub','SOTTOTITOLO',.2,11)),
      btn('Didascalia',R('caption','Una didascalia breve',.94,10)),
      btn('Dedica',R('dedica','Con tutto il mio affetto',.5,Math.round(22*fScale(T.fonts.title)))),
      btn('Scritta a mano',R('caption','che bei ricordi',.5,28,{font:'Caveat'})),
      btn('Data',R('caption',today,.94,12,{upper:true,ls:14})),
      btn('Etichetta',R('caption','ESTATE',.5,26,{font:'Bebas Neue',ls:20,boxOp:88,boxColor:T.colors.accent,color:contrastInk(T.colors.accent)}))),
      el('p',{},'I testi prendono caratteri e colori del tema. Trascinali sul foglio, doppio clic per scrivere. Si agganciano al centro della pagina.')),
    sp.texts.length?sec(`Testi su queste pagine · ${sp.texts.length}`,list):null
  ];
}

/* ============ libro e stampa ============ */
const A4L={w:297,h:210,preset:'Orizzontale 29,7×21 cm (A4)'};
const EP={on:true,w:650,h:330,fold:325,bleed:0,visW:0,visH:0,verso:true,sideF:'L',sideB:'R'};
const EP_GEOM=['on','w','h','fold','bleed','visW','visH'];
const BUILTIN_PROFILES=[
  {name:'A4 orizzontale 29,7×21 · copertina rigida',page:A4L,bleed:3,safe:5,margin:10,bind:15,spine:8,wrap:15,over:3,dpi:300,firstRight:false,mult4:true,endp:EP},
  {name:'A4 orizzontale 29,7×21 · copertina morbida',page:A4L,bleed:3,safe:5,margin:10,bind:14,spine:5,wrap:0,over:0,dpi:300,firstRight:false,mult4:true,endp:{...EP,on:false}},
  {name:'A4 orizzontale · apertura piatta (lay-flat)',page:A4L,bleed:3,safe:5,margin:10,bind:5,spine:8,wrap:15,over:3,dpi:300,firstRight:false,mult4:false,endp:EP},
  {name:'Orizzontale 30×20 · copertina rigida',page:{w:300,h:200,preset:'Orizzontale 30×20 cm'},bleed:2,safe:5,margin:10,bind:15,spine:8,wrap:15,over:3,dpi:300,firstRight:false,mult4:true,endp:EP},
  {name:'A4 verticale 21×29,7 · copertina rigida',page:{w:210,h:297,preset:'Verticale 21×29,7 cm (A4)'},bleed:3,safe:5,margin:10,bind:15,spine:8,wrap:15,over:3,dpi:300,firstRight:false,mult4:true,endp:EP},
  {name:'Quadrato 30×30 · copertina rigida',page:{w:300,h:300,preset:'Quadrato 30×30 cm'},bleed:3,safe:6,margin:12,bind:18,spine:10,wrap:15,over:3,dpi:300,firstRight:false,mult4:true,endp:EP},
  {name:'Quadrato 20×20 · copertina morbida',page:{w:200,h:200,preset:'Quadrato 20×20 cm'},bleed:3,safe:5,margin:8,bind:12,spine:5,wrap:0,over:0,dpi:300,firstRight:false,mult4:true,endp:{...EP,on:false}},
];
const PROF_KEY='fotolibro-studio-profili';
function customProfiles(){try{return JSON.parse(localStorage.getItem(PROF_KEY)||'[]');}catch(e){return[];}}
function saveCustomProfiles(a){try{localStorage.setItem(PROF_KEY,JSON.stringify(a));return true;}catch(e){return false;}}
function allProfiles(){return[...BUILTIN_PROFILES,...customProfiles()];}
const PROF_KEYS=['bleed','safe','margin','bind','spine','wrap','over','firstRight','mult4'];
function currentProfile(name){return{name,page:{...BOOK.page},bleed:EXP.bleed,safe:BOOK.safe,margin:BOOK.style.margin,bind:BOOK.style.bind,spine:BOOK.cover.spine,wrap:BOOK.cover.wrap,over:BOOK.cover.over,dpi:EXP.dpi,firstRight:BOOK.firstRight,mult4:BOOK.mult4,endp:{...BOOK.endp}};}
function matchProfile(){const c=currentProfile('');return allProfiles().find(p=>PROF_KEYS.every(k=>p[k]===c[k])&&Math.abs(p.page.w-c.page.w)<.05&&Math.abs(p.page.h-c.page.h)<.05&&EP_GEOM.every(k=>({...EP,...(p.endp||{})})[k]===({...EP,...c.endp})[k]));}
function setProfileFields(p){BOOK.page={...p.page};BOOK.style.margin=p.margin;BOOK.style.bind=p.bind;BOOK.safe=p.safe;BOOK.cover={...BOOK.cover,spine:p.spine,wrap:p.wrap,over:p.over};
  BOOK.firstRight=!!p.firstRight;BOOK.mult4=!!p.mult4;EXP.bleed=p.bleed;EXP.dpi=p.dpi||300;const keep={verso:BOOK.endp.verso,sideF:BOOK.endp.sideF,sideB:BOOK.endp.sideB};BOOK.endp={...EP,...(p.endp||{})};for(const k in keep)if(keep[k]!=null&&!(p.endp&&k in p.endp))BOOK.endp[k]=keep[k];}
function applyProfile(p){
  const sizeChanged=Math.abs(BOOK.page.w-p.page.w)>.05||Math.abs(BOOK.page.h-p.page.h)>.05||BOOK.style.margin!==p.margin||BOOK.style.bind!==p.bind;
  setProfileFields(p);ensureStructure();
  if(sizeChanged){relayoutAll(true);rebuildCover();}
  try{localStorage.setItem(PROF_KEY+'-ultimo',p.name);}catch(e){}
  THUMBS.clear();TPREV.clear();commit();syncAll();toast(`Profilo applicato: ${p.name}`);
}
let profNaming=false;
function mmField(lab,get,set,min,max,step=.5,after){const i=el('input',{type:'number',class:'inp',min,max,step,value:+(+get()).toFixed(2),'aria-label':lab});
  i.onchange=()=>{const v=clamp(parseFloat(i.value),min,max);if(isNaN(v)){i.value=get();return;}i.value=v;set(v);if(after)after();THUMBS.clear();commit();syncAll();};
  return el('label',{class:'lbl'},el('span',{class:'u'},lab),i);}
function tabBook(){
  const P=BOOK.page,isLand=P.w>P.h,E=BOOK.endp;
  const s=el('select',{'aria-label':'Formato pagina'});
  for(const[n] of PAGE_PRESETS)s.append(el('option',{value:n},n));
  s.append(el('option',{value:'custom'},'Personalizzato'));s.value=P.preset;
  const reflow=()=>{relayoutAll(true);rebuildCover();for(const x of BOOK.spreads)for(const c of x.cells)if(c.fx==='pop')fxPopFrame(x,c);TPREV.clear();};
  s.onchange=()=>{const pr=PAGE_PRESETS.find(p=>p[0]===s.value);if(!pr){P.preset='custom';syncAll();return;}P.preset=pr[0];P.w=pr[1];P.h=pr[2];reflow();THUMBS.clear();commit();syncAll();};
  const pageMM=(lab,key)=>mmField(lab+' (mm)',()=>P[key],v=>{P[key]=v;const m=PAGE_PRESETS.find(p=>Math.abs(p[1]-P.w)<.05&&Math.abs(p[2]-P.h)<.05);P.preset=m?m[0]:'custom';},50,1000,.1,reflow);
  const pxAt=d=>`${Math.round(P.w/25.4*d)} × ${Math.round(P.h/25.4*d)} px`;
  const ip=innerPages(),U=usage();
  const profs=allProfiles(),cm=matchProfile(),nB=BUILTIN_PROFILES.length;
  const ps=el('select',{'aria-label':'Profilo di stampa'},el('option',{value:'',selected:!cm},cm?'—':'Impostazioni personalizzate'),
    ...profs.map((p,i)=>el('option',{value:String(i),selected:cm===p},(i>=nB?'★ ':'')+p.name)));
  ps.onchange=()=>{const p=profs[+ps.value];if(p)applyProfile(p);};
  const nameIn=el('input',{class:'inp',type:'text',placeholder:'Es. Tipografia Rossi · 30×30 rigida','aria-label':'Nome del profilo'});
  const saveRow=profNaming?el('div',{class:'row2'},nameIn,el('div',{class:'row'},
      btn('Salva',()=>{const n=nameIn.value.trim();if(!n){nameIn.focus();return;}const a=customProfiles().filter(p=>p.name!==n);a.push(currentProfile(n));
        if(!saveCustomProfiles(a))toast('Questo browser non permette di salvare i profili.');else toast('Profilo salvato');profNaming=false;renderLeft();},'pri'),
      btn('Annulla',()=>{profNaming=false;renderLeft();}))):
    el('div',{class:'row'},btn('Salva come nuovo profilo…',()=>{profNaming=true;renderLeft();setTimeout(()=>{const i=$('#leftBody input[placeholder]');if(i)i.focus();});}),
      cm&&profs.indexOf(cm)>=nB?btn('Elimina profilo',()=>{saveCustomProfiles(customProfiles().filter(p=>p.name!==cm.name));renderLeft();toast('Profilo eliminato');},'danger'):null);
  const endF=BOOK.spreads.findIndex(s=>s.kind==='endF');
  return[
    sec('Profilo di stampa',ps,
      el('p',{},'Un profilo imposta in un colpo formato, abbondanza, margini, copertina e risguardi. Salva le specifiche di ogni tipografia con cui lavori.'),saveRow),
    sec('Il libro',el('div',{class:'summary'},
      el('div',{class:'srow'},el('span',{class:'k'},'Pagine interne'),el('span',{class:'v'},`${ip} (${ip/2} doppie pagine)`)),
      el('div',{class:'srow'},el('span',{class:'k'},'Foto nel libro'),el('span',{class:'v'},`${U.size} di ${realCount()||LIB.size}`)),
      el('div',{class:'srow'},el('span',{class:'k'},'Copertina'),el('span',{class:'v'},BOOK.cover.on?'sì':'no')),
      el('div',{class:'srow'},el('span',{class:'k'},'Risguardi stampati'),el('span',{class:'v'},E.on?`sì · ${nf(E.w)}×${nf(E.h)} mm`:'no'))),
      ip%4?el('div',{class:'row'},el('span',{style:'color:var(--warn);font-size:12px'},`${ip} pagine: non è un multiplo di 4.`),
        btn('Aggiungi 2 pagine in fondo',()=>{UI.cur=lastInnerIdx();addSpread();})):null,
      chk('Il libro automatico arriva sempre a un multiplo di 4',()=>BOOK.mult4,v=>BOOK.mult4=v),
      el('div',{class:'row'},btn('Crea libro automatico…',openWizard,'alt'))),
    sec('Formato pagina (una facciata rifilata)',s,el('div',{class:'row2'},pageMM('Larghezza','w'),pageMM('Altezza','h')),
      seg([['p','Verticale'],['l','Orizzontale']],isLand?'l':'p',v=>{if((v==='l')!==(P.w>P.h)){[P.w,P.h]=[P.h,P.w];reflow();THUMBS.clear();commit();syncAll();}},true),
      el('p',{},`Doppia pagina aperta: ${nf(2*P.w)} × ${nf(P.h)} mm. Cambiando formato i layout si ricalcolano con le stesse foto.`)),
    sec('Copertina',
      chk('Il libro ha la copertina',()=>BOOK.cover.on,v=>{BOOK.cover.on=v;ensureStructure();if(v)rebuildCover();THUMBS.clear();syncAll();}),
      BOOK.cover.on?el('div',{class:'row3'},
        mmField('Dorso (mm)',()=>BOOK.cover.spine,v=>BOOK.cover.spine=v,0,80,.5,rebuildCover),
        mmField('Cartone +mm/lato',()=>BOOK.cover.over,v=>BOOK.cover.over=v,0,15,.5),
        mmField('Risvolto (mm)',()=>BOOK.cover.wrap,v=>BOOK.cover.wrap=v,0,30,.5)):null,
      BOOK.cover.on?el('p',{},`File copertina: ${nf(2*(P.w+BOOK.cover.over)+BOOK.cover.spine+2*(BOOK.cover.wrap+EXP.bleed))} × ${nf(P.h+2*BOOK.cover.over+2*(BOOK.cover.wrap+EXP.bleed))} mm (retro + dorso + fronte, con risvolto e abbondanza). Il dorso dipende da pagine e carta: chiedilo alla tipografia.`):null),
    sec('Risguardi (pag. 2 e penultima)',
      chk('Risguardi stampati, impaginati su foglio a parte',()=>E.on,v=>{E.on=v;ensureStructure();THUMBS.clear();syncAll();}),
      E.on?el('div',{class:'row2'},
        mmField('Larghezza foglio (mm)',()=>E.w,v=>{const r=E.fold/E.w;E.w=v;E.fold=+(v*r).toFixed(1);},50,2000,.5),
        mmField('Altezza foglio (mm)',()=>E.h,v=>E.h=v,50,1000,.5),
        mmField('Piega a (mm da sinistra)',()=>foldX(BOOK.spreads[endF]||{kind:'endF'}),v=>E.fold=v,10,1990,.5),
        mmField('Abbondanza (mm)',()=>E.bleed,v=>E.bleed=v,0,20,.5),
        mmField('Zona stampata per lato, largh. (0 = pagina + abbondanza)',()=>E.visW,v=>E.visW=v,0,1000,.5),
        mmField('Zona stampata per lato, alt. (0 = pagina + abbondanza)',()=>E.visH,v=>E.visH=v,0,1000,.5)):null,
      E.on?chk(`Stampa sul foglio dei risguardi anche pag. 4 e pag. ${bookPages()-3} (retro dei fogli)`,()=>E.verso!==false,v=>{E.verso=v;THUMBS.clear();syncAll();},'Pag. 4 e la terzultima finiscono nel PDF dei risguardi invece che nell’interno'):null,
      E.on?el('p',{},'Ogni lato del foglio stampa solo la pagina con la sua abbondanza, appoggiata alla piega e centrata in altezza (riquadro verde): il resto del foglio resta bianco, anche con un motivo. Il tratteggio interno è la pagina rifilata.'):null,
      E.on&&endF>=0?btn('Vai al risguardo anteriore',()=>goSpread(endF)):null),
    sec('Sicurezza di stampa',
      slider('Abbondanza (bleed)',()=>EXP.bleed,v=>EXP.bleed=v,0,10,.5,'mm'),
      slider('Zona di sicurezza per i testi',()=>BOOK.safe,v=>BOOK.safe=v,0,20,.5,'mm'),
      slider('Margine verso la piega',()=>BOOK.style.bind,v=>BOOK.style.bind=v,0,40,.5,'mm'),
      el('p',{},'Linea azzurra = taglio, rossa = zona di sicurezza. I testi fuori zona o nella piega vengono segnati in rosso e segnalati prima dell’export.')),
    sec('Rilegatura',chk('La prima pagina interna è a destra',()=>BOOK.firstRight,v=>BOOK.firstRight=v,'Vale per la prossima impaginazione automatica')),
    sec('Pixel necessari per una pagina',el('div',{class:'summary'},
      el('div',{class:'srow'},el('span',{class:'k'},'a 200 dpi'),el('span',{class:'v'},pxAt(200))),
      el('div',{class:'srow'},el('span',{class:'k'},'a 300 dpi'),el('span',{class:'v'},pxAt(300)))))
  ];
}

/* proposte di copertina: combinazioni di impaginazione e sfondo adatte al tema */
function coverProposals(T){const b=baseTheme(T.id),base=b.coverLayout,alt=base==='arch'?'circle':base==='circle'?'heart':base==='heart'?'arch':'arch';
  const L=[[base,b.coverBg||'motivo'],['full','motivo'],['framed','chiaro'],[base,'tinta'],['framed','sfocata'],['collage',b.coverPattern?'motivo':'fitto'],['type','fitto'],[alt,'chiaro']];
  const nm={full:'Foto piena',framed:'Incorniciata',arch:'Arco',circle:'Tonda',heart:'Cuore',collage:'Collage',type:'Solo titolo'},bn=Object.fromEntries(COVER_BGS);
  const seen=new Set();return L.filter(([l,g])=>{const k=l+g;if(seen.has(k))return false;seen.add(k);return true;}).map(([l,g])=>({coverLayout:l,coverBg:g,name:l==='full'?nm[l]:`${nm[l]} · ${bn[g].toLowerCase()}`}));}
/* varianti dei risguardi: del tema, a tinta, motivi semplici, foto, e i risguardi degli altri temi */
function endpVariants(T){const C=T.colors,mc=T.motifColors&&T.motifColors.length?T.motifColors:[C.accent],dk=lum(C.endpaper)<140,ac=dk?mix(mc[0],'#ffffff',.25):mc[0];
  const v=[{id:'tema',name:'Del tema',bg:null,pat:null},
    {id:'chiaro',name:'Chiaro con motivi',bg:C.paper,pat:T.endPattern?{...clone(T.endPattern),colors:mc,op:.45}:'none'},
    {id:'cop',name:'Come la copertina',bg:C.cover,pat:T.coverPattern?clone(T.coverPattern):'none'},
    {id:'pois',name:'Pois',bg:C.endpaper,pat:{type:'dots',motifs:['dot'],colors:[ac],size:3.2,gap:13,op:.55}},
    {id:'righe',name:'Righe',bg:C.endpaper,pat:{type:'stripes',colors:[ac],size:7,gap:16,op:.35}},
    {id:'scozzese',name:'Scozzese',bg:C.endpaper,pat:{type:'plaid',colors:[mc[0],mc[1%mc.length]],size:8,gap:40,op:.5}},
    {id:'tinta',name:'Tinta unita',bg:C.endpaper,pat:'none'},
    {id:'tinta2',name:'Tinta copertina',bg:C.cover,pat:'none'},
    {id:'bianco',name:'Bianco',bg:'#ffffff',pat:'none'},
    {id:'foto',name:'Foto in bianco e nero',bg:'#222222',pat:'none',photo:true}];
  for(const o of THEMES)if(o.id!==T.id&&o.endPattern)v.push({id:'t:'+o.id,name:o.name,bg:o.colors.endpaper,pat:clone(o.endPattern),other:true});
  return v;}
function applyEndpVariant(sp,v){
  sp.cells=sp.cells.filter(c=>!c.epPh);sp.bg=v.bg;sp.pat=v.pat;sp.endv=v.id;
  if(v.photo){const ids=[...usage().keys()],e=ids.map(id=>LIB.get(id)).filter(Boolean).sort((a,b)=>(b.fav-a.fav)||((b.w/b.h)-(a.w/a.h)))[0];
    if(e){sp.mode='spread';const M=meta(sp,'S');M.full=true;const c=mkCell([0,0,1,1],'S');c.epPh=true;c.ph={...newPh(e.id),gray:100,br:105,ct:95};sp.cells.unshift(c);}}
  else if(sp.mode==='spread'&&!sp.cells.length)sp.mode='pages';
}
UI.endpTarget='both';
function endpPreview(v,w=132){const tpl=BOOK.spreads.find(s=>s.kind==='endF')||mkSpread('endF');const sp={...clone(tpl),cells:[],texts:[],decos:[],id:tpl.id};applyEndpVariant(sp,v);
  const H=pgH(sp),s=w/spW(sp),h=Math.round(H*s),dpr=window.devicePixelRatio||1,c=el('canvas',{width:Math.round(w*dpr),height:Math.round(h*dpr),style:`width:${w}px;height:${h}px`}),x=c.getContext('2d');x.scale(dpr,dpr);
  renderSpread(x,sp,{s,ox:0,oy:0,q:'thumb'});x.fillStyle='rgba(0,0,0,.18)';x.fillRect(foldX(sp)*s-.5,0,1,h);return c;}
function tabEndpapers(T){
  const vs=endpVariants(T),F=BOOK.spreads.find(s=>s.kind==='endF'),B=BOOK.spreads.find(s=>s.kind==='endB');
  const curId=sp=>sp?(sp.endv||(sp.bg==null&&sp.pat==null?'tema':'')):'';
  const apply=v=>{const tg=UI.endpTarget;for(const sp of[F,B]){if(!sp)continue;if(tg==='both'||(tg==='F'&&sp===F)||(tg==='B'&&sp===B))applyEndpVariant(sp,v);}
    THUMBS.clear();commit();syncAll();goSpread(BOOK.spreads.indexOf(UI.endpTarget==='B'?B:F));};
  const grid=list=>el('div',{class:'themes'},...list.map(v=>el('button',{type:'button',class:'thc'+((curId(F)===v.id&&UI.endpTarget!=='B')||(curId(B)===v.id&&UI.endpTarget==='B')?' on':''),title:v.name,onclick:()=>apply(v)},
    el('div',{class:'thp'},endpPreview(v)),el('b',{},v.name))));
  return sec('Risguardi',
    seg([['both','Entrambi'],['F','Solo anteriore'],['B','Solo posteriore']],UI.endpTarget,v=>{UI.endpTarget=v;renderLeft();},true),
    grid(vs.filter(v=>!v.other)),
    el('details',{class:'more'},el('summary',{},'Risguardi degli altri temi'),grid(vs.filter(v=>v.other))),
    el('p',{},'Il risguardo resta modificabile: puoi aggiungere foto, testi e decorazioni dal foglio.'));
}

/* ============ pagine speciali ============ */
UI.spWhere='replace';UI.quoteIdx=0;UI.quoteCustom='';let fxBusy=false;
function tabPages(){
  const sp=cur(),side=activeSide(sp),inner=isInner(sp),T=TH(),M=inner?meta(sp,side):null,qs=themeQuotes();
  const q=()=>UI.quoteCustom.trim()?[UI.quoteCustom.trim(),'']:qs[UI.quoteIdx%qs.length];
  const out=[];
  if(!inner)out.push(sec('Pagine speciali',el('p',{},'Vai su una pagina interna per inserire frasi, collage o la pagina effetto.'),btn('Vai alla prima pagina interna',()=>goSpread(firstInnerIdx()),'pri')));
  else{
    if(M.special&&M.special!=='effect'){const K=SPECIALS.find(k=>k[0]===M.special);
      out.push(sec(`${pageLabel(UI.cur,side)} · ${K?K[1]:'pagina speciale'}`,
        M.special.startsWith('quote')||M.special==='photo-quote'?el('div',{class:'row'},btn('Un’altra frase',()=>{const t=sp.texts.find(t=>t.role==='quote'&&(side==='S'||(t.x*spW(sp)<foldX(sp))===(side==='L')));
          if(t){UI.quoteIdx++;const nq=qs[UI.quoteIdx%qs.length];t.text=nq[0];wrapText(t,visBox(sp,side).w*.72);const a=sp.texts.find(x=>x.role==='quote-author'&&Math.abs(x.x-t.x)<.05);if(a)a.text=nq[1]?'— '+nq[1]:'';commit();syncAll();}},'pri')):null,
        btn('Rendi pagina normale (tiene le foto)',()=>{unspecial(sp,side);commit();syncAll();})));}
    const quoteSel=el('select',{'aria-label':'Frase',onchange:e=>{UI.quoteIdx=+e.target.value;UI.quoteCustom='';renderLeft();}},...qs.map((x,k)=>el('option',{value:k,selected:k===UI.quoteIdx%qs.length},(x[0].length>60?x[0].slice(0,58)+'…':x[0])+(x[1]?' — '+x[1]:''))));
    out.push(sec('Inserisci una pagina speciale',
      seg([['replace','Al posto di questa pagina'],['after','In una nuova doppia pagina']],UI.spWhere,v=>{UI.spWhere=v;renderLeft();},true),
      el('p',{},UI.spWhere==='replace'?`Va su ${pageLabel(UI.cur,side)}: le sue foto vengono spostate nelle pagine vicine, nessuna si perde.`:'Si aggiunge una doppia pagina dopo questa: metà delle foto della pagina attuale va accanto alla pagina speciale.'),
      el('label',{class:'lbl'},el('span',{},'Frase (per le pagine con frase)'),quoteSel),
      el('textarea',{rows:2,placeholder:'…oppure scrivi la tua frase',oninput:e=>{UI.quoteCustom=e.target.value;}},UI.quoteCustom),
      el('div',{class:'specials'},...SPECIALS.map(([k,l,d])=>el('button',{type:'button',class:'spc',title:d,onclick:()=>{
        const o={quote:q()};if(k==='dedica'){o.text=UI.quoteCustom.trim()||(WZ.dedica||'Con tutto il mio affetto');}if(k==='chapter'){o.text=UI.quoteCustom.trim()||'Nuovo capitolo';}
        if(isVerso(UI.cur,side)&&UI.spWhere==='replace'&&k==='scrap'){toast('Questa pagina è il retro del risguardo: scegli un’altra pagina per il collage');return;}
        placeSpecial(k,UI.spWhere,o);}},specIcon(k),el('b',{},l),el('small',{},d))))));
  }
  const ei=effectIdx();
  out.push(sec('Pagina effetto · le foto migliori',
    el('p',{},'Il programma sceglie le foto migliori con una persona o un animale ben visibile, scontorna il soggetto e crea una doppia pagina con effetto “fuori cornice” e sticker. Al massimo una per libro: se non ci sono foto adatte non viene creata.'),
    ei>=0?el('div',{class:'row'},btn('Vai alla pagina effetto',()=>goSpread(ei),'pri'),btn('Rifai con le foto migliori',()=>runEffect('same')),
      btn('Elimina',()=>{const s2=BOOK.spreads[ei];const ph=s2.cells.filter(c=>c.ph&&!c.fx).map(c=>c.ph);BOOK.spreads.splice(ei,1);normalizeOrder();redistribute(ph,pageNum(Math.max(firstInnerIdx(),ei-1),'R'));UI.cur=clamp(UI.cur,0,BOOK.spreads.length-1);commit();syncAll();},'danger'))
    :el('div',{class:'row'},btn(fxBusy?'Analisi in corso…':'Crea la pagina effetto',()=>runEffect('replace'),'pri','Sostituisce una doppia pagina centrale; le sue foto vanno nelle pagine vicine'),
      btn('Come doppia pagina in più',()=>runEffect('add'))),
    FX.failed?el('p',{class:'warn'},'Modulo effetti non disponibile: '+FX.failed+'. Il file fotolibro-effetti.js deve stare accanto all’app.'):null));
  out.push(sec('Sticker tra le foto',
    seg([['0','Nessuno'],['1','Pochi'],['2','Tanti']],String(BOOK.theme.stickers||0),v=>{BOOK.theme.stickers=+v;regenDecos();THUMBS.clear();commit();syncAll();},true),
    el('p',{},`Sticker del tema “${T.name}” (${themeStickers().w.slice(0,3).join(', ')}…) sugli angoli delle foto. Per aggiungerne uno a mano usa il pannello Decori.`)));
  return out;
}
async function runEffect(mode){
  if(fxBusy)return;fxBusy=true;renderLeft();
  try{const ids=[...usage().keys()].filter(id=>LIB.get(id));
    if(mode==='add'){const i=await createEffectPage(ids,{at:UI.cur+1,onProg:(a,b)=>progress('Analizzo le foto…',a,b)});if(i!==false){UI.cur=i;}}
    else if(mode==='same'){const old=effectIdx();const i=await createEffectPage(ids,{at:old,onProg:(a,b)=>progress('Analizzo le foto…',a,b)});if(i!==false)UI.cur=i;}
    else{await addEffectAfterBuild(ids);const i=effectIdx();if(i>=0)UI.cur=i;}
    progress(null);THUMBS.clear();commit();syncAll();
  }catch(e){progress(null);console.warn(e);toast('Pagina effetto non disponibile: '+(FX.failed||e.message),5000);}
  finally{fxBusy=false;renderLeft();}
}
function specIcon(k){const c=el('canvas',{width:68,height:48,style:'width:34px;height:24px'}),x=c.getContext('2d');x.scale(2,2);const mu=cssVar('--muted')||'#888',ac=cssVar('--accent')||'#c2185b';
  x.fillStyle=cssVar('--raise')||'#fff';x.fillRect(0,0,34,24);x.strokeStyle=mu;x.globalAlpha=.6;x.strokeRect(.5,.5,33,23);x.globalAlpha=1;
  const L=(y,w)=>{x.fillStyle=mu;x.fillRect(17-w/2,y,w,1.6);};
  if(k==='quote'){L(9,18);L(12.5,14);x.fillStyle=ac;x.fillRect(14,5,6,1.2);}
  else if(k==='quote-color'){x.fillStyle=ac;x.fillRect(1,1,32,22);x.fillStyle='#fff';x.fillRect(8,9,18,1.6);x.fillRect(10,12.5,14,1.6);}
  else if(k==='quote-frame'){x.fillStyle=ac;for(let i=0;i<6;i++){x.fillRect(3+i*5.4,2.5,2,2);x.fillRect(3+i*5.4,19.5,2,2);}L(10,16);L(13.5,12);}
  else if(k==='quote-photo'){x.fillStyle=mu;x.globalAlpha=.55;x.fillRect(1,1,32,22);x.globalAlpha=1;x.fillStyle='#fff';x.fillRect(8,10,18,1.6);x.fillRect(10,13.5,14,1.6);}
  else if(k==='photo-quote'){x.fillStyle=mu;x.globalAlpha=.55;x.fillRect(4,3,26,12);x.globalAlpha=1;L(18,16);}
  else if(k==='scrap'){x.fillStyle=mu;for(const[a,b,r] of[[5,4,-.15],[18,6,.12],[11,12,-.05]]){x.save();x.translate(a+6,b+4.5);x.rotate(r);x.fillStyle='#fff';x.fillRect(-6.5,-5,13,10);x.strokeStyle=mu;x.strokeRect(-6.5,-5,13,10);x.globalAlpha=.5;x.fillStyle=mu;x.fillRect(-5.5,-4,11,7.5);x.restore();}
    drawMotif(x,'star',29,19,6,0,ac);}
  else if(k==='dedica'){x.strokeStyle=ac;x.lineWidth=1.3;x.beginPath();x.moveTo(7,13);x.bezierCurveTo(10,7,13,17,17,11);x.bezierCurveTo(20,7,23,16,27,11);x.stroke();}
  else{x.fillStyle=mu;x.fillRect(9,10,16,3);x.fillRect(12,15,10,1.2);}
  return c;}
