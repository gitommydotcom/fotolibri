/* ============ layout ============ */
function gridDims(m,asp){let c=Math.max(1,Math.round(Math.sqrt(m*asp)));c=Math.min(c,m);let r=Math.ceil(m/c);while(r>1&&(r-1)*c>=m)r--;return[c,r];}
function subGrid(m,x,y,w,h,asp,centered){
  const[c,r]=gridDims(m,asp),a=[];
  for(let i=0;i<r;i++){const k=i<r-1?c:m-(r-1)*c;
    for(let j=0;j<k;j++){if(centered)a.push([x+(j+(c-k)/2)*w/c,y+i*h/r,w/c,h/r]);else a.push([x+j*w/k,y+i*h/r,w/k,h/r]);}}
  return a;
}
function genJustified(n,rs,A){
  const total=rs.reduce((a,b)=>a+b,0);let best=null;
  for(let k=1;k<=n;k++){
    const rows=[];let cur=[],cum=0;
    for(let i=0;i<n;i++){cur.push(i);cum+=rs[i];
      const left=k-rows.length-1;if(left<=0)continue;
      if(n-i-1===left||cum>=total*(rows.length+1)/k-rs[i]/2){rows.push(cur);cur=[];}}
    if(cur.length)rows.push(cur);if(rows.length!==k)continue;
    const Rs=rows.map(r=>r.reduce((a,i)=>a+rs[i],0)),E=Rs.reduce((a,R)=>a+A/R,0);
    const err=Math.abs(Math.log(E))+rows.reduce((a,r,j)=>a+Math.abs(Math.log(Rs[j]/(total/k)))*.15,0);
    if(!best||err<best.err)best={err,rows,Rs,E};
    if(E>3)break;
  }
  if(!best)return null;
  const out=[];let y=0;
  best.rows.forEach((r,j)=>{const h=(A/best.Rs[j])/best.E;let x=0;for(const i of r){const w=rs[i]/best.Rs[j];out[i]=[x,y,w,h];x+=w;}y+=h;});
  return out;
}
function genColumns(n,rs,A){
  let best=null;
  for(let c=1;c<=Math.min(n,8);c++){
    const cols=Array.from({length:c},()=>({items:[],H:0}));
    for(let i=0;i<n;i++){const col=cols.reduce((a,b)=>b.H<a.H?b:a);col.items.push(i);col.H+=1/rs[i];}
    const err=cols.reduce((a,col)=>a+Math.abs(Math.log(A/c*col.H)),0)/c;
    if(!best||err<best.err)best={err,cols,c};
  }
  const out=[];best.cols.forEach((col,j)=>{let y=0;for(const i of col.items){const h=(1/rs[i])/col.H;out[i]=[j/best.c,y,1/best.c,h];y+=h;}});
  return out;
}
function genCenter(n,A){
  if(n<3)return null;
  const m=n-1,land=A>=1,out=[];
  if(m<=8){const a=Math.ceil(m/2),b=m-a,s=m<=2?.27:.22;
    if(land){out.push(b?[s,0,1-2*s,1]:[s,0,1-s,1]);for(let i=0;i<a;i++)out.push([0,i/a,s,1/a]);for(let i=0;i<b;i++)out.push([1-s,i/b,s,1/b]);}
    else{out.push(b?[0,s,1,1-2*s]:[0,s,1,1-s]);for(let i=0;i<a;i++)out.push([i/a,0,1/a,s]);for(let i=0;i<b;i++)out.push([i/b,1-s,1/b,s]);}
    return out;}
  return null;
}
function genHero(n,A){
  if(n<3)return null;const f=clamp(1.5/Math.sqrt(n),.3,.72);
  if(A>=1)return[[0,0,f,1],...subGrid(n-1,f,0,1-f,1,(1-f)*A)];
  return[[0,0,1,f],...subGrid(n-1,0,f,1,1-f,A/(1-f))];
}
const GENS=[
  ['justified','Righe su misura',(n,rs,A)=>genJustified(n,rs,A),true],
  ['columns','Colonne',(n,rs,A)=>genColumns(n,rs,A),true],
  ['grid','Griglia',(n,rs,A)=>subGrid(n,0,0,1,1,A,false),false],
  ['centered','Griglia centrata',(n,rs,A)=>subGrid(n,0,0,1,1,A,true),false],
  ['hero','Una in evidenza',(n,rs,A)=>genHero(n,A),false],
  ['center','Una al centro',(n,rs,A)=>genCenter(n,A),false],
];
function candidates(n,rs,A){
  const out=[],seen=new Set();if(n<1)return out;
  const push=(key,name,defs,ordered)=>{if(!defs||defs.length!==n||defs.some(d=>!d))return;
    const sig=defs.map(d=>d.map(v=>v.toFixed(3)).join(',')).sort().join(';');if(seen.has(sig))return;seen.add(sig);out.push({key,name,defs,ordered});};
  for(const[name,defs] of TEMPLATES)if(defs.length===n)push('t:'+name,name,defs,false);
  for(const[k,name,f,ord] of GENS)push('g:'+k,name,f(n,rs,A),ord);
  return out;
}
function bestPerm(n,cost){
  if(n<=7){let best=null,bc=Infinity;const used=new Array(n).fill(false),perm=new Array(n);
    const rec=(ci,acc)=>{if(acc>=bc)return;if(ci===n){bc=acc;best=perm.slice();return;}
      for(let ii=0;ii<n;ii++){if(used[ii])continue;used[ii]=true;perm[ci]=ii;rec(ci+1,acc+cost(ci,ii));used[ii]=false;}};
    rec(0,0);return{perm:best,cost:bc};}
  const used=new Set(),perm=new Array(n);let tot=0;
  for(let ci=0;ci<n;ci++){let bi=-1,bv=Infinity;for(let ii=0;ii<n;ii++){if(used.has(ii))continue;const v=cost(ci,ii);if(v<bv){bv=v;bi=ii;}}used.add(bi);perm[ci]=bi;tot+=bv;}
  return{perm,cost:tot};
}
function scoreCand(cand,items,A){
  const n=items.length,cells=cand.defs.map(d=>({ar:(d[2]/d[3])*A,area:d[2]*d[3]}));
  const maxA=Math.max(...cells.map(c=>c.area)),minA=Math.min(...cells.map(c=>c.area));
  const cost=(ci,ii)=>{const it=items[ii];let v=it.ar?Math.abs(Math.log(cells[ci].ar/it.ar)):.25;if(it.fav)v+=1.5*(1-cells[ci].area/maxA);return v+.012*Math.abs(ci-ii);};
  let r;if(cand.ordered){let t=0;for(let i=0;i<n;i++)t+=cost(i,i);r={perm:[...Array(n).keys()],cost:t};}else r=bestPerm(n,cost);
  const pen=(minA<.035?.35:0)+(cand.key==='t:Passe-partout'?.18:0);
  return{perm:r.perm,score:r.cost/n+pen};
}
function pagePhs(sp,side){return sp.cells.filter(c=>c.side===side).map(c=>c.ph);}
function pageCands(sp,side,phs){
  phs=phs||pagePhs(sp,side);const I=areaOf(sp,side),A=I.w/I.h;
  const items=phs.map(ph=>ph&&LIB.has(ph.img)?{ar:phAR(ph),fav:LIB.get(ph.img).fav}:{ar:null,fav:false});
  return candidates(phs.length,items.map(i=>i.ar||1.4),A).map(c=>({...c,...scoreCand(c,items,A)})).sort((a,b)=>a.score-b.score);
}
const shapeSig=defs=>defs?defs.map(d=>d.map(v=>v.toFixed(1)).join(',')).sort().join(';'):'';
function relayoutPage(sp,side,o={}){
  const phs=o.phs||pagePhs(sp,side);
  sp.cells=sp.cells.filter(c=>c.side!==side);const M=meta(sp,side);
  if(!phs.length){M.lay=null;return null;}
  const cands=pageCands(sp,side,phs);if(!cands.length)return null;
  let ch=null;
  if(o.key)ch=cands.find(c=>c.key===o.key);
  if(!ch&&o.rng){const pool=cands.filter(c=>c.score<=cands[0].score+.14&&c.key!==o.avoid&&shapeSig(c.defs)!==o.avoidSig).slice(0,4);ch=pool.length?pool[Math.floor(o.rng()*pool.length)]:cands[0];}
  if(!ch)ch=cands[0];
  ch.defs.forEach((d,ci)=>{const c=mkCell(d,side);const ph=phs[ch.perm[ci]];if(ph){ph.ox=0;ph.oy=0;ph.zoom=1;}c.ph=ph||null;sp.cells.push(c);});
  M.lay=ch.key;return ch;
}
function addToPage(sp,side,ids){
  if(sp.mode==='spread')side='S';
  const phs=pagePhs(sp,side);const fresh=ids.map(newPh);let k=0;
  for(let i=0;i<phs.length&&k<fresh.length;i++)if(!phs[i])phs[i]=fresh[k++];
  relayoutPage(sp,side,{phs:phs.concat(fresh.slice(k))});
}
function setSpreadMode(sp,mode){
  if(sp.mode===mode)return;
  if(mode==='spread'){const phs=[...pagePhs(sp,'L'),...pagePhs(sp,'R')];sp.cells=[];sp.mode='spread';relayoutPage(sp,'S',{phs});}
  else{const phs=pagePhs(sp,'S'),h=Math.ceil(phs.length/2);sp.cells=[];sp.mode='pages';relayoutPage(sp,'L',{phs:phs.slice(0,h)});relayoutPage(sp,'R',{phs:phs.slice(h)});}
}
function activeSide(sp){sp=sp||cur();if(!sp)return'L';if(sp.mode==='spread')return'S';return UI.side==='S'?'R':UI.side;}
function relayoutAll(keepKeys){
  const R=rng(Date.now());let prev=null;
  for(const sp of BOOK.spreads){if(isCover(sp))continue;for(const side of(sp.mode==='spread'?['S']:['L','R'])){
    if(!sp.cells.some(c=>c.side===side))continue;const ch=relayoutPage(sp,side,keepKeys?{key:meta(sp,side).lay}:{rng:R,avoid:prev&&prev.key,avoidSig:prev&&shapeSig(prev.defs)});prev=ch;}}
}
