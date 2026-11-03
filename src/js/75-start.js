/* ============ schermata iniziale: cartella → tema → formato → crea ============ */
const START={open:false,saved:null};
function openStart(){START.open=true;$('#start').hidden=false;renderStart();}
function closeStart(){START.open=false;$('#start').hidden=true;draw();}
function renderStart(){
  if(!START.open)return;
  const n=realCount(),T=TH(),chs=BOOK.chapters.filter(c=>c.on);
  const reals=ORDER.map(id=>LIB.get(id)).filter(e=>e&&!e.sample);
  /* 1. foto */
  const dz=el('div',{class:'sdrop',tabindex:0,role:'button',onclick:()=>$('#dirIn').click(),
    onkeydown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#dirIn').click();}},
    ondragover:e=>{e.preventDefault();e.currentTarget.classList.add('over');},ondragleave:e=>e.currentTarget.classList.remove('over'),ondrop:e=>e.currentTarget.classList.remove('over')},
    el('div',{class:'sdi',html:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M12 10v6M9 13h6"/></svg>'}),
    el('b',{},n?'Aggiungi un’altra cartella':'Scegli la cartella delle foto'),
    el('span',{},'oppure trascinala qui. Le sottocartelle diventano capitoli.'));
  const mosaic=n?el('div',{class:'smos'},...reals.slice(0,15).map(e=>e.thumbURL?el('img',{src:e.thumbURL,alt:''}):el('i')),n>15?el('span',{},'+'+(n-15)):null):null;
  const info=n?el('div',{class:'sinfo'},el('b',{},`${n} foto`),chs.length>1?` · ${chs.length} capitoli: ${chs.slice(0,4).map(c=>c.title).join(', ')}${chs.length>4?'…':''}`:'',
    SIMS.length?` · ${SIMS.length} gruppi di scatti simili (verrà tenuta la più nitida)`:''):null;
  const c1=el('section',{class:'scol'},el('h2',{},el('i',{},'1'),'Le foto'),dz,
    el('div',{class:'row'},btn('Scegli singole foto…',()=>{pickFor=null;$('#fileIn').click();})),mosaic,info);
  /* 2. tema */
  const tg=el('div',{class:'sthemes'},...THEMES.map(t=>el('button',{type:'button',class:'thc'+(t.id===BOOK.theme.id?' on':''),title:t.desc,
    onclick:()=>{const old=TH();if(!WZ.title||WZ.title===fillTpl(old.texts.title))WZ.title='';applyTheme(t.id);if(!WZ.title)WZ.title=fillTpl(TH().texts.title);TPREV.clear();THUMBS.clear();commit();syncAll();renderStart();}},
    el('div',{class:'thp'},themePreview(t.id,104)),el('b',{},t.name))));
  const c2=el('section',{class:'scol wide'},el('h2',{},el('i',{},'2'),'Il tema',el('small',{},T.name+' · '+T.desc)),tg);
  /* 3. formato e testi */
  const profs=allProfiles(),cm=matchProfile();
  const ps=el('select',{'aria-label':'Formato e profilo di stampa',onchange:e=>{const p=profs[+e.target.value];if(p){applyProfile(p);renderStart();}}},
    el('option',{value:'',selected:!cm},cm?'—':'Impostazioni personalizzate (pannello Libro)'),...profs.map((p,i)=>el('option',{value:String(i),selected:cm===p},p.name)));
  if(!WZ.title)WZ.title=fillTpl(T.texts.title);
  const pm=el('div',{class:'seg full'},...[['auto','In base alle foto'],['fixed','Numero esatto']].map(([v,l])=>el('button',{type:'button',class:WZ.pagesMode===v?'on':'',onclick:()=>{WZ.pagesMode=v;renderStart();}},l)));
  const c3=el('section',{class:'scol'},el('h2',{},el('i',{},'3'),'Formato e testi'),
    el('label',{class:'lbl'},el('span',{},'Formato e tipografia'),ps),
    el('label',{class:'lbl'},el('span',{},'Titolo in copertina'),el('input',{class:'inp',value:WZ.title,oninput:e=>WZ.title=e.target.value})),
    el('label',{class:'lbl'},el('span',{},'Sottotitolo'),el('input',{class:'inp',value:WZ.sub,placeholder:fillTpl(T.texts.sub),oninput:e=>WZ.sub=e.target.value})),
    el('label',{class:'lbl'},el('span',{},'Dedica (facoltativa, sulla prima pagina)'),el('input',{class:'inp',value:WZ.dedica,placeholder:'Es. Per la nonna, con amore',oninput:e=>WZ.dedica=e.target.value})),
    el('div',{class:'lbl'},el('span',{},'Numero di pagine'),pm,
      WZ.pagesMode==='fixed'?el('div',{class:'row'},el('input',{type:'number',class:'num',min:4,max:400,step:2,value:WZ.pages,oninput:e=>WZ.pages=clamp(parseInt(e.target.value)||4,4,400)}),
        ...[20,24,30,40].map(v=>btn(String(v),()=>{WZ.pages=v;renderStart();},WZ.pages===v?'on':null))):el('p',{class:'u'},'Circa 4 foto per pagina, layout variati.')),
    chk('Risguardi stampati (pag. 2 e penultima)',()=>BOOK.endp.on,v=>{BOOK.endp.on=v;ensureStructure();syncAll();}),
    el('div',{class:'sgo'},
      el('button',{type:'button',class:'btn pri big',disabled:!n,onclick:()=>{
        WZ.group=BOOK.chapters.filter(c=>c.on).length>1?'folder':'day';WZ.userGroup=false;
        if(buildBook(WZ)){closeStart();}}},n?'Crea il fotolibro':'Prima scegli le foto'),
      el('button',{type:'button',class:'linkb',onclick:()=>{openWizard();}},'Opzioni avanzate…')));
  const foot=el('div',{class:'sfoot'},
    START.saved?el('span',{},el('b',{},'Lavoro in corso: '),`${START.saved.photos.length} foto, salvato ${new Date(START.saved.saved).toLocaleString('it-IT',{dateStyle:'medium',timeStyle:'short'})} `,
      btn('Riprendi',async()=>{const s=START.saved;START.saved=null;closeStart();await loadProject(s);toast('Lavoro ripreso');},'pri')):null,
    btn('Apri un progetto salvato…',()=>$('#projIn').click()),
    btn(n?'Vai all’editor':'Guarda l’esempio nell’editor',()=>closeStart()));
  $('#startBody').replaceChildren(el('div',{class:'shead'},el('div',{class:'brand big',html:BRAND_SVG+'<span>Fotolibro Studio</span>'}),
    el('p',{},'Dalla cartella al fotolibro pronto per la stampa in tre passi. Tutto resta modificabile.')),
    el('div',{class:'sgrid'},c1,c2,c3),foot);
}
const BRAND_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5.5C9.5 4 6 3.6 2.5 4.2v14.6C6 18.2 9.5 18.6 12 20.1c2.5-1.5 6-1.9 9.5-1.3V4.2C18 3.6 14.5 4 12 5.5Z"/><path d="M12 5.5v14.6"/><rect x="4.6" y="7.2" width="5.2" height="4.4" rx=".4" fill="currentColor" stroke="none" opacity=".55"/><rect x="14.2" y="7.2" width="5.2" height="8.6" rx=".4" fill="currentColor" stroke="none"/></svg>';
