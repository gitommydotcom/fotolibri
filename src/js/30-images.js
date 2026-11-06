/* ============ immagini ============ */
function canvasOf(src,max){
  const w=src.naturalWidth||src.width,h=src.naturalHeight||src.height,r=Math.min(1,max/Math.max(w,h));
  const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*r));c.height=Math.max(1,Math.round(h*r));
  const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(src,0,0,c.width,c.height);return c;
}
function loadImage(url){return new Promise((res,rej)=>{const i=new Image();i.decoding='async';i.onload=()=>res(i);i.onerror=rej;i.src=url;});}
async function decodeBlob(blob){
  try{return await createImageBitmap(blob,{imageOrientation:'from-image'});}catch(e){}
  try{return await createImageBitmap(blob);}catch(e){}
  const url=URL.createObjectURL(blob);try{return await loadImage(url);}finally{setTimeout(()=>URL.revokeObjectURL(url),2000);}
}
const closeSrc=s=>{try{if(s&&s.close)s.close();}catch(e){}};
function exifDate(buf){
  try{const v=new DataView(buf);if(v.byteLength<12||v.getUint16(0)!==0xFFD8)return null;let o=2;
    while(o+4<v.byteLength){const mk=v.getUint16(o);if((mk&0xFF00)!==0xFF00)break;const len=v.getUint16(o+2);
      if(mk===0xFFE1&&o+10<v.byteLength&&v.getUint32(o+4)===0x45786966)return tiffDate(v,o+10);
      if(mk===0xFFDA)break;o+=2+len;}
  }catch(e){}return null;
}
function tiffDate(v,t){
  const le=v.getUint16(t)===0x4949,u16=p=>v.getUint16(p,le),u32=p=>v.getUint32(p,le);
  const ifd=p=>{const tags={};if(p+2>v.byteLength)return tags;const n=u16(p);for(let i=0;i<n;i++){const e=p+2+i*12;if(e+12>v.byteLength)break;tags[u16(e)]={count:u32(e+4),vo:e+8};}return tags;};
  const str=tg=>{if(!tg)return null;const off=tg.count>4?t+u32(tg.vo):tg.vo;let s='';for(let i=0;i<tg.count-1&&off+i<v.byteLength;i++)s+=String.fromCharCode(v.getUint8(off+i));return s;};
  const t0=ifd(t+u32(t+4));let d=null;
  if(t0[0x8769]){const ex=ifd(t+u32(t0[0x8769].vo));d=str(ex[0x9003])||str(ex[0x9004]);}
  d=d||str(t0[0x0132]);
  const m=d&&d.match(/(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);if(!m||m[1]==='0000')return null;
  return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]).getTime();
}
function grayOf(src,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0,w,h);
  const d=x.getImageData(0,0,w,h).data,g=new Float32Array(w*h);for(let i=0;i<w*h;i++)g[i]=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];return g;}
function dhash(src){const g=grayOf(src,9,8);let s='';for(let y=0;y<8;y++){let nib=0;for(let x=0;x<8;x++){nib=(nib<<1)|(g[y*9+x]>g[y*9+x+1]?1:0);if(x===3){s+=nib.toString(16);nib=0;}}s+=nib.toString(16);}return s;}
const POP=[0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4];
function ham(a,b){if(!a||!b)return 99;let d=0;for(let i=0;i<16;i++)d+=POP[parseInt(a[i],16)^parseInt(b[i],16)];return d;}
function sharpness(src){const w0=src.width,h0=src.height,r=128/Math.max(w0,h0),w=Math.max(8,Math.round(w0*r)),h=Math.max(8,Math.round(h0*r));
  const g=grayOf(src,w,h);let s=0,s2=0,n=0;for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x,l=4*g[i]-g[i-1]-g[i+1]-g[i-w]-g[i+w];s+=l;s2+=l*l;n++;}
  return n?s2/n-(s/n)**2:0;}
async function setThumb(e,tc){
  closeSrc(e.thumbBmp);e.thumbBmp=await createImageBitmap(tc);
  const tb=await toBlob(tc,'image/jpeg',.8);if(e.thumbURL)URL.revokeObjectURL(e.thumbURL);e.thumbURL=URL.createObjectURL(tb);
  if(!e.hash){e.hash=dhash(tc);e.sharp=sharpness(tc);}thumbGen++;
}
async function ingest(blob,keep){
  let date=null,dateSrc=null;
  try{date=exifDate(await blob.slice(0,262144).arrayBuffer());if(date)dateSrc='exif';}catch(e){}
  if(!date&&blob.lastModified){date=blob.lastModified;dateSrc='file';}
  const src=await decodeBlob(blob);
  const w=src.naturalWidth||src.width,h=src.naturalHeight||src.height;
  const pc=canvasOf(src,1600);closeSrc(src);
  const prevBlob=await toBlob(pc,'image/jpeg',.86);
  const tc=canvasOf(pc,320);pc.width=pc.height=0;
  const e={id:uid(),name:blob.name||'foto.jpg',size:blob.size,lm:blob.lastModified||0,w,h,date,dateSrc,fav:false,excl:false,exclWhy:'',file:blob,prevBlob,sample:false,folder:folderOf(blob)};
  if(keep)Object.assign(e,{id:keep.id,fav:keep.fav,excl:keep.excl,exclWhy:keep.exclWhy,sample:!!keep.sample,folder:keep.folder!=null?keep.folder:e.folder});
  await setThumb(e,tc);
  if(PREV.has(e.id)){closeSrc(PREV.get(e.id));PREV.delete(e.id);}
  LIB.set(e.id,e);if(!e.sample)idbPut('prev',e.id,prevBlob);
  return e;
}
/* cache anteprime decodificate (poche alla volta, per reggere centinaia di foto) */
const PREV_MAX=28;
function getPrev(e){
  if(PREV.has(e.id)){const b=PREV.get(e.id);PREV.delete(e.id);PREV.set(e.id,b);return b;}
  if(e.prevBlob&&!e.loading){e.loading=true;createImageBitmap(e.prevBlob).then(b=>{PREV.set(e.id,b);
    while(PREV.size>PREV_MAX){const k=PREV.keys().next().value;closeSrc(PREV.get(k));PREV.delete(k);}draw();}).catch(()=>{}).finally(()=>e.loading=false);}
  return e.thumbBmp||null;
}
function srcFor(id,o){const e=LIB.get(id);if(!e)return null;if(o.q==='full')return o.map.get(id)||null;if(o.q==='thumb')return e.thumbBmp||null;return getPrev(e);}
const isImgFile=f=>!/^\./.test(f.name)&&(f.type.startsWith('image/')||/\.(jpe?g|png|webp|gif|bmp|avif|heic)$/i.test(f.name));
/* cartella di provenienza: dal selettore di cartelle (webkitRelativePath) o dal trascinamento (_path) */
function folderOf(f){const rp=f._path||f.webkitRelativePath||'';const i=rp.lastIndexOf('/');return i>0?rp.slice(0,i):'';}
/* trascinamento di cartelle intere, anche annidate */
function filesFromDT(dt){
  const items=[...(dt.items||[])].filter(i=>i.kind==='file');
  const entries=items.map(i=>i.webkitGetAsEntry?i.webkitGetAsEntry():null);
  if(!entries.some(e=>e&&e.isDirectory))return Promise.resolve([...dt.files]);
  const out=[];
  const walk=async(en,path)=>{
    if(en.isFile){try{const f=await new Promise((res,rej)=>en.file(res,rej));f._path=path+f.name;out.push(f);}catch(e){}}
    else if(en.isDirectory){const r=en.createReader();let batch;do{batch=await new Promise((res,rej)=>r.readEntries(res,rej));for(const c of batch)await walk(c,path+en.name+'/');}while(batch.length);}};
  return(async()=>{progress('Leggo le cartelle…',0,0);for(const en of entries)if(en)await walk(en,'');progress(null);return out;})();
}

/* ============ libreria ============ */
function sortOrder(){
  const a=[...LIB.values()];
  if(UI.sort==='name')a.sort((x,y)=>x.name.localeCompare(y.name,'it',{numeric:true}));
  else a.sort((x,y)=>((x.date??9e15)-(y.date??9e15))||x.name.localeCompare(y.name,'it',{numeric:true}));
  ORDER=a.map(e=>e.id);
}
function usage(){const m=new Map();BOOK.spreads.forEach((sp,i)=>sp.cells.forEach(c=>{if(c.ph){const u=m.get(c.ph.img);if(u)u.n++;else m.set(c.ph.img,{n:1,sp:i});}}));return m;}
function realCount(){let n=0;for(const e of LIB.values())if(!e.sample)n++;return n;}
function progress(label,done,total){const p=$('#prog');START.prog=total==null?null:{label,done,total};
  if(total!=null&&START.open&&!document.getElementById('sprog'))renderStartLive();
  const sp=document.getElementById('sprog');if(sp&&total!=null){sp.firstChild.textContent=label;sp.querySelector('.pb i').style.width=(total?100*done/total:0)+'%';const sb=document.querySelector('#sbar .ssum b');if(sb)sb.textContent=label;}
  if(total==null){p.hidden=true;return;}p.hidden=false;$('#progL').textContent=label;$('#progB').style.width=(total?100*done/total:0)+'%';}
async function importFiles(files){
  const arr=[...files].filter(isImgFile);const nonImg=files.length-arr.length;
  if(!arr.length){if(nonImg)toast('Nessuna immagine tra i file scelti.');return[];}
  const byKey=new Map(),byKey2=new Map(),byName=new Map();
  for(const e of LIB.values()){if(e.sample)continue;byKey.set(e.name+'|'+e.size+'|'+(e.folder||''),e);
    if(!e.file){byKey2.set(e.name+'|'+e.size,e);byName.set(e.name,byName.has(e.name)?null:e);}}
  const todo=[];let dup=0,relinked=0;
  for(const f of arr){let ex=byKey.get(f.name+'|'+f.size+'|'+folderOf(f));
    if(!ex){const c=byKey2.get(f.name+'|'+f.size)||byName.get(f.name);if(c&&!c.file)ex=c;}
    if(ex){if(ex.file){dup++;continue;}byKey2.delete(ex.name+'|'+ex.size);byName.delete(ex.name);
      if(ex.prevBlob){ex.file=f;ex.size=f.size;relinked++;continue;}todo.push([f,ex]);}
    else todo.push([f,null]);}
  const out=[];let bad=0,done=0,idx=0;
  if(todo.length){
    progress(`Importo 0 / ${todo.length}`,0,todo.length);
    const worker=async()=>{while(idx<todo.length){const[f,keep]=todo[idx++];
      try{out.push(await ingest(f,keep));}catch(err){bad++;}
      done++;progress(`Importo ${done} / ${todo.length}`,done,todo.length);
      if(done%12===0){sortOrder();if(START.open)renderStartLive();else renderLeft();}}};
    await Promise.all([worker(),worker(),worker()]);
    progress(null);
  }
  if(out.some(e=>!e.sample))removeSamples();
  sortOrder();SIMS=findSimilar();syncChapters();
  const nf0=new Set(out.map(e=>e.folder||'')),msg0=nf0.size>1?`${nf0.size} cartelle → ${nf0.size} capitoli`:'';
  const msg=[];if(out.length)msg.push(`${out.length} foto importate`);if(relinked)msg.push(`${relinked} ricollegate agli originali`);
  if(msg0)msg.push(msg0);if(dup)msg.push(`${dup} già presenti`);if(bad)msg.push(`${bad} non lette (usa JPG, PNG o WebP; le HEIC dell'iPhone vanno convertite)`);
  if(msg.length)toast(msg.join(' · '),4500);
  updateBanner();
  return out.map(e=>e.id);
}
function removeSamples(){
  const ids=[...LIB.values()].filter(e=>e.sample).map(e=>e.id);if(!ids.length)return;
  const set=new Set(ids);
  for(const id of ids){const e=LIB.get(id);closeSrc(e.thumbBmp);if(e.thumbURL)URL.revokeObjectURL(e.thumbURL);if(PREV.has(id)){closeSrc(PREV.get(id));PREV.delete(id);}LIB.delete(id);}
  const onlySamples=BOOK.spreads.every(sp=>sp.cells.every(c=>!c.ph||set.has(c.ph.img)));
  if(onlySamples){BOOK=freshBookKeepingSettings();UI.cur=0;}
  else BOOK.spreads.forEach(sp=>sp.cells.forEach(c=>{if(c.ph&&set.has(c.ph.img))c.ph=null;}));
  sel=null;sortOrder();
}
/* nuovo libro che conserva le impostazioni di stampa (formato, copertina, margini, stile) */
function freshBookKeepingSettings(newJob){const nb=newBook();for(const k of['page','cover','endp','style','safe','mult4','firstRight','theme'])nb[k]=clone(BOOK[k]);
  if(!newJob)nb.job=BOOK.job;const old=BOOK;BOOK=nb;ensureStructure();BOOK=old;return nb;}
function bookHasRealPhotos(){return BOOK.spreads.some(sp=>sp.cells.some(c=>c.ph&&LIB.has(c.ph.img)&&!LIB.get(c.ph.img).sample));}
async function afterImport(ids){
  if(!ids.length){syncAll();return;}
  if(!bookHasRealPhotos()){applySuggestions();commit();syncAll();if(START.open)renderStart();else openStart(2);return;}
  UI.filter='unused';UI.tab='photos';commit();syncAll();
  toast(`${ids.length} foto aggiunte: le trovi in “Non usate”. Trascinale sulle pagine o premi Crea libro automatico.`,5000);
}
/* doppioni e scatti simili */
function findSimilar(){
  const ids=[...LIB.values()].filter(e=>e.hash).sort((a,b)=>((a.date??0)-(b.date??0))||a.name.localeCompare(b.name)).map(e=>e.id);
  const par=new Map(ids.map(i=>[i,i]));const f=x=>{while(par.get(x)!==x){par.set(x,par.get(par.get(x)));x=par.get(x);}return x;};
  const uni=(a,b)=>{a=f(a);b=f(b);if(a!==b)par.set(b,a);};
  for(let i=0;i<ids.length;i++){const a=LIB.get(ids[i]);
    for(let j=i+1;j<Math.min(ids.length,i+14);j++){const b=LIB.get(ids[j]);
      const dt=(a.date!=null&&b.date!=null)?Math.abs(a.date-b.date):null;const ex=a.dateSrc==='exif'&&b.dateSrc==='exif';
      if(ex&&dt>120000)break;
      const hd=ham(a.hash,b.hash),arA=a.w/a.h,arB=b.w/b.h;if(Math.abs(Math.log(arA/arB))>.12)continue;
      if(hd<=3||(hd<=11&&ex&&dt<=120000)||(hd<=5&&!ex&&dt!=null&&dt<=600000))uni(a.id,b.id);}}
  const byHash=new Map();for(const id of ids){const h=LIB.get(id).hash;if(byHash.has(h))uni(byHash.get(h),id);else byHash.set(h,id);}
  const g=new Map();for(const id of ids){const r=f(id);if(!g.has(r))g.set(r,[]);g.get(r).push(id);}
  return[...g.values()].filter(x=>x.length>1);
}
function bestOf(group){return group.reduce((a,b)=>{const A=LIB.get(a),B=LIB.get(b);if(A.fav!==B.fav)return A.fav?a:b;return(B.sharp||0)>(A.sharp||0)?b:a;});}
function similarToExclude(){const s=new Set();for(const g of SIMS){const k=bestOf(g);for(const id of g){const e=LIB.get(id);if(id!==k&&!e.fav)s.add(id);}}return s;}
function applySimilar(){let n=0;for(const id of similarToExclude()){const e=LIB.get(id);if(!e.excl){e.excl=true;e.exclWhy='simile';n++;}}return n;}
