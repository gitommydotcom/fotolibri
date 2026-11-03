/* ============ suggerimenti automatici dalla cartella: tema, titolo, sottotitolo, stima pagine ============ */
const W_=s=>new RegExp('(?:^|[^\\p{L}\\p{N}])(?:'+s+')(?=$|[^\\p{L}\\p{N}])','iu');
/* l'ordine conta a parità di punteggio: dal più specifico al più generico */
const THEME_KEYS=[
  ['valentino',W_("san ?valentino|valentine'?s?|innamorati")],
  ['papa',W_("festa del pap[aà]|pap[aà]|father'?s ?day")],
  ['mamma',W_("festa della mamma|mamma|mother'?s ?day")],
  ['matrimonio',W_('matrimonio|nozze|sposi|sposa|wedding|anniversario di matrimonio')],
  ['laurea',W_('laurea|graduation|proclamazione|diploma')],
  ['bimba',W_('nata|benvenuta|bimba|neonata|battesimo di \\p{L}+a')],
  ['bimbo',W_('nascita|battesimo|neonato|nato|benvenuto|bimbo|baby|primo anno')],
  ['compleanno',W_('compleanno|birthday|\\d+ ?anni|\\d+°|festa di compleanno')],
  ['pasqua',W_('pasqua|pasquetta|easter')],
  ['natale',W_('natale|natalizi[oae]?|christmas|xmas|vigilia|presepe|capodanno|befana')],
  ['estate',W_('estate|mare|spiaggia|vacanz[ae]|viaggio|viaggi|summer|holiday|ferie|crociera')],
  ['autunno',W_('autunno|autumn|vendemmia|castagne|halloween|foliage')],
  ['nordico',W_('inverno|neve|sci|settimana bianca|winter|snow')]
];
const GENERIC_DIR=/^(dcim|foto|photo|photos|pictures?|immagini|camera|camera roll|rullino|download|downloads|desktop|scrivania|documenti|documents|nuova cartella|new folder|export|esportate?|img|images|selezione|selezionate|stampa|\d{3}[a-z_]*|[a-z]?\d+|\d{4}[-_. ]?\d{2}([-_. ]?\d{2})?)$/i;
const MESI=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
function realPhotos(){return[...LIB.values()].filter(e=>!e.sample&&!e.excl);}
function cleanDir(s){return String(s||'').replace(/^\s*\d{1,3}\s*[_\-.)\s]\s*/,'').replace(/[_]+/g,' ').replace(/\s+-\s+|\s*-\s*$/g,' ').replace(/\s+/g,' ').trim();}
/* cartella comune a tutte le foto (la più profonda) */
function rootDirs(ph){
  const segs=ph.map(e=>(e.folder||'').split('/').filter(Boolean));if(!segs.length||segs.some(s=>!s.length))return segs[0]||[];
  const out=[];for(let i=0;;i++){const v=segs[0][i];if(v==null||segs.some(s=>s[i]!==v))break;out.push(v);}return out;}
function suggestTitle(){
  const ph=realPhotos();if(!ph.length)return null;
  const r=rootDirs(ph);for(let i=r.length-1;i>=0;i--){const c=cleanDir(r[i]);if(c&&!GENERIC_DIR.test(c)&&!GENERIC_DIR.test(r[i])&&c.length<=42&&/\p{L}{2}/u.test(c))return c[0].toUpperCase()+c.slice(1);}
  return null;
}
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da);}
function suggestTheme(){
  const ph=realPhotos();if(!ph.length)return null;
  const sc=new Map(),why=new Map(),root=rootDirs(ph).join('/');
  for(const [id,re] of THEME_KEYS){let s=0;
    if(re.test(root)){s+=ph.length*1.5;why.set(id,'cartella «'+cleanDir(root.split('/').filter(x=>re.test(x)).pop()||root)+'»');}
    let n=0,f=null;for(const e of ph){const p=(e.folder||'')+'/'+e.name;if(re.test(p)){n++;if(!f)f=(e.folder||'').split('/').filter(x=>re.test(x)).pop();}}
    s+=n;if(n&&!why.has(id))why.set(id,'cartella «'+cleanDir(f||'')+'»');if(s)sc.set(id,s);}
  /* bastano poche foto in una sottocartella "Neve" per non cambiare tema a tutto il libro */
  const best=[...sc].sort((a,b)=>b[1]-a[1])[0];
  if(best&&best[1]>=ph.length*.3)return{id:best[0],why:why.get(best[0])};
  /* altrimenti le date degli scatti (solo EXIF) */
  const ds=ph.filter(e=>e.dateSrc==='exif'&&e.date).map(e=>new Date(e.date));if(ds.length<Math.max(4,ph.length*.5))return null;
  const share=f=>ds.filter(f).length/ds.length,md=d=>(d.getMonth()+1)*100+d.getDate();
  const near=(d,t,k)=>Math.abs(d-t)<=k*864e5;
  const rules=[
    ['natale',d=>md(d)>=1215||md(d)<=106,'foto scattate tra metà dicembre e l’Epifania'],
    ['valentino',d=>md(d)>=210&&md(d)<=216,'foto scattate intorno a San Valentino'],
    ['papa',d=>md(d)>=318&&md(d)<=320,'foto scattate il 19 marzo'],
    ['pasqua',d=>near(d,easter(d.getFullYear()),1),'foto scattate a Pasqua'],
    ['mamma',d=>{const f=new Date(d.getFullYear(),4,1);const s2=new Date(d.getFullYear(),4,1+((7-f.getDay())%7)+7);return near(d,s2,1);},'foto scattate alla festa della mamma'],
    ['estate',d=>md(d)>=620&&md(d)<=915,'foto scattate in estate'],
    ['autunno',d=>md(d)>=1001&&md(d)<=1120,'foto scattate in autunno']];
  for(const [id,f,w] of rules)if(share(f)>=.7)return{id,why:w};
  return null;
}
/* sottotitolo dalle date: "14 giugno 2025", "giugno 2025", "giugno – luglio 2025", "2025", "2024 – 2025" */
function suggestSub(){
  const ds=realPhotos().filter(e=>e.date).map(e=>e.date).sort((a,b)=>a-b);if(!ds.length)return null;
  const q=p=>new Date(ds[Math.min(ds.length-1,Math.max(0,Math.round(p*(ds.length-1))))]);const a=q(.03),b=q(.97);
  const Y=a.getFullYear(),Y2=b.getFullYear(),M=a.getMonth(),M2=b.getMonth();
  if(Y!==Y2)return Y2-Y>3?null:`${Y} – ${Y2}`;
  if(M===M2&&a.getDate()===b.getDate())return`${a.getDate()} ${MESI[M]} ${Y}`;
  if(M===M2)return b.getDate()-a.getDate()<=3?`${a.getDate()}–${b.getDate()} ${MESI[M]} ${Y}`:`${MESI[M][0].toUpperCase()+MESI[M].slice(1)} ${Y}`;
  if(M2-M===1)return`${MESI[M][0].toUpperCase()+MESI[M].slice(1)} – ${MESI[M2]} ${Y}`;
  return String(Y);
}
/* sottotitolo effettivo: la data precisa vale solo per i temi che di serie mettono l'anno */
function autoSub(T=TH()){const s=suggestSub();return T.texts.sub==='{anno}'&&s?s:fillTpl(T.texts.sub);}
/* stima veloce: stesso algoritmo della creazione, senza toccare il libro */
function estimatePages(o=WZ){
  try{const g=START.open?(BOOK.chapters.filter(c=>c.on).length>1?'folder':'day'):o.group;
    const pages=planBook({...o,group:g},o.similar?similarToExclude():null);if(!pages.some(p=>p.ids.length))return null;
    let n=pages.length+(versoOn()?2:(BOOK.firstRight?1:0));if(n%2)n++;
    const photos=pages.reduce((a,p)=>a+p.ids.length,0);
    return{inner:n,total:BOOK.endp.on?n+6:n+(BOOK.cover.on?2:0),photos};}catch(e){console.warn(e);return null;}
}
/* applica i suggerimenti senza mai sovrascrivere quello che l'utente ha scelto o scritto */
function applySuggestions(){
  if(!realCount())return;
  const s=suggestTheme();START.sugg=s;
  if(s&&!START.userTheme&&s.id!==BOOK.theme.id){applyTheme(s.id);TPREV.clear();THUMBS.clear();}
  if(START.titleSrc!=='user'){const t=suggestTitle();if(t){WZ.title=t;START.titleSrc='folder';}else{WZ.title=fillTpl(TH().texts.title);START.titleSrc='theme';}}
}
