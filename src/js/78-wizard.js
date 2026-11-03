/* ============ creazione automatica (dialogo) ============ */
function openWizard(){
  const d=$('#wiz'),F=$('#wizForm');
  const nCh=BOOK.chapters.filter(c=>c.on).length,hasFolders=BOOK.chapters.length>1;
  if(!WZ.userGroup)WZ.group=hasFolders?'folder':(WZ.group==='folder'?'day':WZ.group);
  if(WZ.group==='folder'&&!hasFolders)WZ.group='day';
  
  const est=el('div',{class:'est'});
  const upd=()=>{const ex=WZ.similar?similarToExclude():null;const pages=planBook(WZ,ex);const nP=pages.reduce((a,p)=>a+p.ids.length,0);
    const tot=pages.length+(BOOK.firstRight?1:0);const ip=tot+(tot%2);
    const nT=pages.filter(p=>p.title).length,blank=pages.filter(p=>p.blank).length;const endp=BOOK.endp.on?' + risguardi':'';
    const per=nP?nf(nP/Math.max(1,pages.filter(p=>p.ids.length).length)):0;
    const lab=WZ.group==='folder'?'capitoli':WZ.group==='day'?'giorni':'eventi';
    let t=nP?`${nP} foto → ${ip} pagine interne (${ip/2} doppie pagine)${WZ.cover?' + copertina':''}${endp} · in media ${per} foto per pagina${nT?` · ${nT} ${lab} con titolo`:''}${ex&&ex.size?` · ${ex.size} scatti simili lasciati fuori`:''}`:'Nessuna foto da impaginare: aggiungi le foto dal pannello Foto.';
    if(nP&&WZ.pagesMode==='fixed'&&ip>WZ.pages)t+=` · ATTENZIONE: con questi gruppi servono almeno ${ip} pagine`;
    if(nP&&blank)t+=` · ${blank} ${blank>1?'pagine bianche':'pagina bianca'}`;
    if(nP&&ip%4)t+=' · non è un multiplo di 4';
    est.textContent=t;};
  const n=(lab,key,min,max)=>{const i=el('input',{type:'number',class:'num',min,max,value:WZ[key],style:'width:100%','aria-label':lab,oninput:e=>{WZ[key]=clamp(parseInt(e.target.value)||min,min,max);upd();}});return el('label',{class:'lbl'},el('span',{class:'u'},lab),i);};
  const ck=(lab,key,tip)=>el('label',{class:'chk',title:tip||null},el('input',{type:'checkbox',checked:WZ[key],onchange:e=>{WZ[key]=e.target.checked;upd();}}),lab);
  const vis=()=>{gapRow.hidden=WZ.group!=='event';subRow.hidden=WZ.group!=='folder';perRow.hidden=WZ.pagesMode==='fixed';fixRow.hidden=WZ.pagesMode!=='fixed';
    ttlLab.lastChild.textContent=WZ.group==='folder'?'Titolo del capitolo all’inizio di ogni cartella':'Titolo con la data all’inizio di ogni gruppo';};
  const segW=(key,opts,extra)=>{const s=el('div',{class:'seg full'});const paint=()=>s.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===WZ[key]));
    for(const[v,l] of opts)s.append(el('button',{type:'button','data-v':v,onclick:()=>{WZ[key]=v;if(extra)extra(v);paint();vis();upd();}},l));setTimeout(paint);return s;};
  const gapRow=el('label',{class:'row'},'Nuovo evento dopo una pausa di',el('input',{type:'number',class:'num',min:1,max:72,value:WZ.gapH,oninput:e=>{WZ.gapH=clamp(+e.target.value||3,1,72);upd();}}),'ore');
  const subRow=ck('Dentro ogni capitolo, separa anche i giorni','subDay');
  const perRow=el('div',{class:'lbl'},el('span',{},'Foto per pagina'),el('div',{class:'row3'},n('almeno','min',1,9),n('di solito','target',1,9),n('al massimo','max',1,12)));
  const fixRow=el('div',{class:'lbl'},el('span',{},'Pagine interne esatte (le foto si distribuiscono di conseguenza)'),
    el('div',{class:'row'},el('input',{type:'number',class:'num',min:4,max:400,step:2,value:WZ.pages,'aria-label':'Numero di pagine',oninput:e=>{WZ.pages=clamp(parseInt(e.target.value)||4,4,400);upd();}}),
      ...[20,24,30,40,60].map(v=>btn(String(v),e=>{WZ.pages=v;e.currentTarget.parentNode.firstChild.value=v;upd();}))));
  const ttlLab=ck('Titolo','titles');
  const groupOpts=[...(hasFolders?[['folder',`Per cartella (${nCh})`]]:[]),['day','Per giorno'],['event','Per evento'],['none','Nessuno']];
  const has=bookHasRealPhotos();
  F.replaceChildren(
    el('div',{class:'dlg-h'},'Crea il fotolibro automaticamente'),
    el('div',{class:'dlg-s'},`${BOOK.page.preset==='custom'?`${nf(BOOK.page.w)}×${nf(BOOK.page.h)} mm`:BOOK.page.preset} · margini ${nf(BOOK.style.margin)} mm, piega ${nf(BOOK.style.bind)} mm. Le foto si ordinano per data, si raggruppano e si distribuiscono con layout variati. Dopo puoi cambiare tutto.`),
    el('div',{class:'dlg-b'},
      el('label',{class:'lbl'},el('span',{},'Tema'),el('select',{onchange:e=>{const T0=TH();if(WZ.title===fillTpl(T0.texts.title))WZ.title='';applyTheme(e.target.value);if(!WZ.title)WZ.title=fillTpl(TH().texts.title);openWizard();}},
        ...THEME_GROUPS.map(g=>el('optgroup',{label:g},...THEMES.filter(t=>t.group===g).map(t=>el('option',{value:t.id,selected:t.id===BOOK.theme.id},t.name)))))),
      el('div',{class:'row2'},
        el('label',{class:'lbl'},el('span',{},'Titolo in copertina e sul dorso'),el('input',{class:'inp',type:'text',value:WZ.title,oninput:e=>WZ.title=e.target.value})),
        el('label',{class:'lbl'},el('span',{},'Sottotitolo'),el('input',{class:'inp',type:'text',value:WZ.sub,placeholder:fillTpl(TH().texts.sub),oninput:e=>WZ.sub=e.target.value}))),
      el('label',{class:'lbl'},el('span',{},'Dedica sulla prima pagina (facoltativa)'),el('input',{class:'inp',type:'text',value:WZ.dedica,placeholder:'Es. Al papà migliore del mondo',oninput:e=>{WZ.dedica=e.target.value;upd();}})),
      el('div',{class:'lbl'},el('span',{},'Raggruppa le foto'),segW('group',groupOpts,()=>{WZ.userGroup=true;})),gapRow,subRow,
      el('div',{class:'lbl'},el('span',{},'Numero di pagine'),segW('pagesMode',[['auto','In base alle foto per pagina'],['fixed','Numero esatto di pagine']])),
      perRow,fixRow,
      ck('Ogni gruppo inizia su una nuova doppia pagina','newSpread'),
      ttlLab,
      el('label',{class:'lbl'},el('span',{},'Apertura di ogni gruppo'),el('select',{onchange:e=>{WZ.opener=e.target.value;upd();}},
        el('option',{value:'band',selected:WZ.opener==='band'},'Titolo sopra le prime foto'),
        el('option',{value:'page',selected:WZ.opener==='page'},'Pagina dedicata al titolo'),
        el('option',{value:'photo',selected:WZ.opener==='photo'},'Prima foto a pagina intera con il titolo sopra'))),
      ck('Preferite ★ a pagina intera','favFull','Le foto segnate con la stella occupano una pagina da sole'),
      ck(`Lascia fuori gli scatti simili (${SIMS.length} gruppi trovati)`,'similar','Di ogni raffica tiene la foto più nitida; le altre finiscono tra le scartate'),
      ck('Copertina a tema con la prima preferita','cover'),
      el('div',{class:'row2'},el('label',{class:'lbl'},el('span',{},'Frasi e citazioni'),el('select',{onchange:e=>{WZ.quotes=+e.target.value;upd();}},...[[0,'Nessuna'],[1,'Qualcuna'],[2,'Di più']].map(([v,l])=>el('option',{value:v,selected:WZ.quotes===v},l)))),
        el('label',{class:'lbl'},el('span',{},'Sticker tra le foto'),el('select',{onchange:e=>{WZ.stickers=+e.target.value;}},...[[0,'Nessuno'],[1,'Pochi'],[2,'Tanti']].map(([v,l])=>el('option',{value:v,selected:WZ.stickers===v},l))))),
      ck('Pagina effetto con le foto migliori (se ce ne sono di adatte)','effect'),
      el('label',{class:'chk'},el('input',{type:'checkbox',checked:BOOK.mult4,onchange:e=>{BOOK.mult4=e.target.checked;upd();}}),'Arriva sempre a un multiplo di 4 pagine'),
      est),
    el('div',{class:'dlg-f'},el('span',{class:'grow'},has?'Sostituisce le pagine attuali. Ctrl+Z per tornare indietro.':''),
      el('button',{type:'button',class:'btn',onclick:()=>d.close()},'Annulla'),
      el('button',{type:'button',class:'btn pri',onclick:()=>{if(buildBook(WZ))d.close();}},'Crea il libro')));
  vis();upd();if(!d.open)d.showModal();
}
$('#bWizard').onclick=openWizard;
