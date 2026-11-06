/* ============ schermata iniziale: cartella → tema → formato → crea ============ */
/* titleSrc: da dove viene il titolo ('theme' | 'folder' | 'user'); userTheme: l'utente ha scelto un tema a mano */
const START={open:false,saved:null,sugg:null,userTheme:false,titleSrc:'theme',prog:null};
function openStart(){START.open=true;$('#start').hidden=false;renderStart();}
function closeStart(){START.open=false;$('#start').hidden=true;draw();}
const startBusy=()=>!!(START.prog&&START.prog.total);
function startCreate(){
  if(startBusy())return;
  if(!realCount()){$('#dirIn').click();return;}
  WZ.group=BOOK.chapters.filter(c=>c.on).length>1?'folder':'day';WZ.userGroup=false;
  const o={...WZ,sub:WZ.sub.trim()||autoSub()};
  if(buildBook(o)){closeStart();nextStepsBanner();}
}
/* colonna 1: foto (si aggiorna da sola durante l'importazione senza toccare il resto) */
function startCol1(){
  const n=realCount(),chs=BOOK.chapters.filter(c=>c.on),busy=startBusy();
  const reals=ORDER.map(id=>LIB.get(id)).filter(e=>e&&!e.sample);
  const dz=el('div',{class:'sdrop',tabindex:0,role:'button','aria-label':n?'Aggiungi un’altra cartella di foto':'Scegli la cartella delle foto',onclick:()=>$('#dirIn').click(),
    onkeydown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#dirIn').click();}},
    ondragover:e=>{e.preventDefault();e.currentTarget.classList.add('over');},ondragleave:e=>e.currentTarget.classList.remove('over'),ondrop:e=>e.currentTarget.classList.remove('over')},
    el('div',{class:'sdi',html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M12 10v6M9 13h6"/></svg>'}),
    el('b',{},n?'Aggiungi un’altra cartella':'Scegli la cartella delle foto'),
    el('span',{},'oppure trascinala qui. Le sottocartelle diventano capitoli.'));
  const P=START.prog;
  const prog=busy?el('div',{class:'sprog',id:'sprog',role:'status'},el('span',{},P.label),el('div',{class:'pb'},el('i',{style:`width:${100*P.done/P.total}%`})),
    el('small',{},'Leggo date e nitidezza e cerco gli scatti doppi. Intanto puoi scegliere tema e titolo.')):null;
  const mosaic=n?el('div',{class:'smos'},...reals.slice(0,15).map(e=>e.thumbURL?el('img',{src:e.thumbURL,alt:''}):el('i')),n>15?el('span',{},'+'+(n-15)):null):null;
  const info=n&&!busy?el('div',{class:'sinfo'},el('b',{},`${n} foto`),chs.length>1?` · ${chs.length} capitoli: ${chs.slice(0,4).map(c=>c.title).join(', ')}${chs.length>4?'…':''}`:'',
    SIMS.length?` · ${SIMS.length} gruppi di scatti simili: terrò il più nitido di ognuno`:''):null;
  return el('section',{class:'scol',id:'sc1'},el('h2',{},el('i',{},'1'),'Le foto'),dz,
    el('div',{class:'row'},btn('Scegli singole foto…',()=>{pickFor=null;$('#fileIn').click();})),prog,mosaic,info,
    !n?el('p',{class:'snote'},'Le foto restano sul tuo computer: niente viene caricato in rete.'):null);
}
/* barra in basso, sempre visibile: riepilogo + azione principale */
function startBar(){
  const n=realCount(),busy=startBusy(),T=TH();
  let sum,cta;
  if(busy){sum=el('span',{},el('b',{},START.prog.label),' · puoi intanto scegliere tema e titolo');
    cta=el('button',{type:'button',class:'btn pri big',disabled:true},'Attendi l’importazione…');}
  else if(!n){sum=el('span',{},el('b',{},'Inizia dalla cartella delle foto.'),' Il resto lo propongo io, e potrai cambiare tutto dopo.');
    cta=el('button',{type:'button',class:'btn pri big',onclick:()=>$('#dirIn').click()},'Scegli la cartella delle foto');}
  else{const est=estimatePages(),chs=BOOK.chapters.filter(c=>c.on).length,cm=matchProfile();
    sum=el('span',{},el('b',{},`${est?est.photos:n} foto`),chs>1?` · ${chs} capitoli`:'',` · tema ${T.name}`,
      est?el('span',{},' · ',el('b',{},`circa ${est.total} pagine`)):'',cm?` · ${cm.name.split('·')[0].trim()}`:'');
    cta=el('button',{type:'button',class:'btn pri big',title:'Crea il fotolibro (Ctrl+Invio)',onclick:startCreate},'Crea il fotolibro →');}
  return el('div',{class:'sbar',id:'sbar'},el('div',{class:'ssum'},sum),
    el('button',{type:'button',class:'linkb',onclick:()=>openWizard()},'Opzioni avanzate…'),cta);
}
function renderStartLive(){if(!START.open)return;const a=$('#sc1'),b=$('#sbar');if(!a||!b){renderStart();return;}a.replaceWith(startCol1());b.replaceWith(startBar());}
function renderStart(){
  if(!START.open)return;
  const T=TH(),S=START.sugg;
  /* 2. tema */
  const tg=el('div',{class:'sthemes',role:'group','aria-label':'Tema del fotolibro'},...THEMES.map(t=>el('button',{type:'button',class:'thc'+(t.id===BOOK.theme.id?' on':''),title:t.desc,'aria-pressed':String(t.id===BOOK.theme.id),
    onclick:()=>{START.userTheme=true;applyTheme(t.id);if(START.titleSrc==='theme')WZ.title=fillTpl(TH().texts.title);TPREV.clear();THUMBS.clear();commit();syncAll();renderStart();}},
    el('div',{class:'thp'},themePreview(t.id,104)),el('b',{},t.name),S&&S.id===t.id?el('em',{class:'stag'},'Consigliato'):null)));
  const hint=S?el('p',{class:'ssug'},el('b',{},'✦ Consigliato: '+(THEMES.find(t=>t.id===S.id)||{}).name),` — ${S.why}.`,S.id!==BOOK.theme.id?el('span',{},' ',el('button',{type:'button',class:'linkb',onclick:()=>{START.userTheme=false;applySuggestions();commit();syncAll();renderStart();}},'Usalo')):''):null;
  const c2=el('section',{class:'scol wide'},el('h2',{},el('i',{},'2'),'Il tema',el('small',{},T.name+' · '+T.desc)),hint,tg);
  /* 3. formato e testi */
  const profs=allProfiles(),cm=matchProfile();
  const ps=el('select',{id:'sProf',onchange:e=>{const p=profs[+e.target.value];if(p){applyProfile(p);renderStart();}}},
    cm?null:el('option',{value:'',selected:true},'Impostazioni personalizzate (pannello Libro)'),...profs.map((p,i)=>el('option',{value:String(i),selected:cm===p},p.name)));
  if(!WZ.title)WZ.title=fillTpl(T.texts.title);
  const seg=(label,key,opts)=>el('div',{class:'lbl'},el('span',{id:'lb-'+key},label),el('div',{class:'seg full',role:'group','aria-labelledby':'lb-'+key},
    ...opts.map(([v,l])=>el('button',{type:'button','aria-pressed':String(WZ[key]===v),class:WZ[key]===v?'on':'',onclick:()=>{WZ[key]=v;renderStart();}},l))));
  const fld=(id,label,input)=>el('div',{class:'lbl'},el('label',{for:id},label),input);
  const c3=el('section',{class:'scol'},el('h2',{},el('i',{},'3'),'Formato e testi'),
    fld('sProf','Formato e tipografia',ps),
    fld('sTitle','Titolo in copertina',el('input',{id:'sTitle',class:'inp',value:WZ.title,maxlength:80,oninput:e=>{WZ.title=e.target.value;START.titleSrc='user';},
      onkeydown:e=>{if(e.key==='Enter')startCreate();}})),
    fld('sSub','Sottotitolo',el('input',{id:'sSub',class:'inp',value:WZ.sub,placeholder:autoSub(T),maxlength:80,oninput:e=>WZ.sub=e.target.value})),
    fld('sDed','Dedica (facoltativa, sulla prima pagina)',el('input',{id:'sDed',class:'inp',value:WZ.dedica,placeholder:'Es. Per la nonna, con amore',maxlength:160,oninput:e=>WZ.dedica=e.target.value})),
    seg('Numero di pagine','pagesMode',[['auto','In base alle foto'],['fixed','Numero esatto']]),
    WZ.pagesMode==='fixed'?el('div',{class:'row'},el('input',{type:'number',class:'num','aria-label':'Numero di pagine interne',min:4,max:400,step:2,value:WZ.pages,onchange:e=>{WZ.pages=clamp(parseInt(e.target.value)||4,4,400);renderStartLive();}}),
        ...[20,24,30,40].map(v=>btn(String(v),()=>{WZ.pages=v;renderStart();},WZ.pages===v?'on':null))):el('p',{class:'u'},'Circa 4 foto per pagina, impaginazioni variate.'),
    chk('Risguardi stampati (pag. 2 e penultima)',()=>BOOK.endp.on,v=>{BOOK.endp.on=v;ensureStructure();syncAll();renderStartLive();}),
    seg('Pagine con frasi e citazioni','quotes',[[0,'Nessuna'],[1,'Qualcuna'],[2,'Di più']]),
    seg('Sticker a tema tra le foto','stickers',[[0,'Nessuno'],[1,'Pochi'],[2,'Tanti']]),
    chk('Pagina effetto con le foto migliori (soggetto scontornato, solo se ci sono foto adatte)',()=>WZ.effect,v=>{WZ.effect=v;}));
  const saved=START.saved?el('div',{class:'sres'},el('span',{},el('b',{},'Lavoro in corso: '),`${START.saved.photos.length} foto, salvato ${new Date(START.saved.saved).toLocaleString('it-IT',{dateStyle:'medium',timeStyle:'short'})}`),
      btn('Riprendi',async()=>{const s=START.saved;START.saved=null;closeStart();await loadProject(s);toast('Lavoro ripreso');},'pri')):null;
  const head=el('div',{class:'shead'},el('div',{class:'brand big',html:BRAND_SVG+'<span>Fotolibro Studio</span>'}),
    el('p',{},'Dalla cartella al fotolibro pronto per la stampa in tre passi. Tutto resta modificabile.'),
    el('div',{class:'sacts'},btn('Apri un progetto salvato…',()=>$('#projIn').click()),
      btn(realCount()?'Vai all’editor':'Guarda l’esempio nell’editor',()=>closeStart())));
  $('#startBody').replaceChildren(head,saved||'',el('div',{class:'sgrid'},startCol1(),c2,c3),startBar());
}
/* dopo la creazione: i prossimi passi in una riga, con i controlli che contano */
function nextStepsBanner(){
  let lowN=0,txt=0;try{const b=bookIssues();lowN=b.low.length;txt=b.txt.length;}catch(e){}
  showBanner(el('span',{},el('b',{},'Il libro è pronto. '),'Scorri le pagine con le frecce o la striscia in basso: clic su una foto per inquadrarla, trascinala per scambiarla.',
      lowN||txt?el('span',{class:'warn'},` Da controllare: ${[lowN?`${lowN} foto a bassa risoluzione`:'',txt?`${txt} testi vicini al taglio`:''].filter(Boolean).join(' e ')} (li trovi elencati nella finestra Stampa).`):''),
    btn('Scegli la copertina',()=>{goSpread(Math.max(0,BOOK.spreads.findIndex(isCover)));UI.tab='theme';renderLeft();}),btn('Sfoglia il libro',()=>previewFlipbook()),btn('Bozza per il cliente',()=>openExport('draft')),btn('File per la stampa',()=>openExport('print'),'pri'),
    el('button',{type:'button',class:'btn ib','aria-label':'Chiudi',title:'Chiudi',onclick:hideBanner},'×'));
}
/* Ctrl+Invio crea il libro dalla schermata iniziale */
document.addEventListener('keydown',e=>{if(START.open&&(e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();startCreate();}});
const BRAND_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5.5C9.5 4 6 3.6 2.5 4.2v14.6C6 18.2 9.5 18.6 12 20.1c2.5-1.5 6-1.9 9.5-1.3V4.2C18 3.6 14.5 4 12 5.5Z"/><path d="M12 5.5v14.6"/><rect x="4.6" y="7.2" width="5.2" height="4.4" rx=".4" fill="currentColor" stroke="none" opacity=".55"/><rect x="14.2" y="7.2" width="5.2" height="8.6" rx=".4" fill="currentColor" stroke="none"/></svg>';
