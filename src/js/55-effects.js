/* ============ effetti speciali: scontorno del soggetto ============
   Il modello (DeepLab v3, MediaPipe, Apache 2.0) gira nel browser: le foto non escono dal computer.
   Si carica solo quando serve, dal file fotolibro-effetti.js accanto all'app. */
const FX={seg:null,loading:null,failed:'',cut:new Map()};
const FX_CLASSES=[15,8,12,13,3,10,17];/* persona, gatto, cane, cavallo, uccello, mucca, pecora */
const FX_NAMES={15:'persone',8:'gatto',12:'cane',13:'cavallo',3:'uccello',10:'mucca',17:'pecora'};
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('manca '+src));document.head.appendChild(s);});}
function b64ToBytes(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
async function fxInit(){
  if(FX.seg)return FX.seg;if(FX.loading)return FX.loading;
  FX.loading=(async()=>{
    if(!window.__FXLIB)await loadScript('fotolibro-effetti.js');
    const L=window.__FXLIB;if(!L)throw new Error('modulo effetti non valido');
    const fileset={wasmLoaderPath:URL.createObjectURL(new Blob([b64ToBytes(L.D.loader)],{type:'text/javascript'})),
      wasmBinaryPath:URL.createObjectURL(new Blob([b64ToBytes(L.D.wasm)],{type:'application/wasm'}))};
    const seg=await L.V.ImageSegmenter.createFromOptions(fileset,{baseOptions:{modelAssetBuffer:b64ToBytes(L.D.model),delegate:'CPU'},
      runningMode:'IMAGE',outputCategoryMask:false,outputConfidenceMasks:true});
    FX.seg=seg;return seg;})();
  try{return await FX.loading;}catch(e){FX.loading=null;FX.failed=e.message||String(e);throw e;}
}
/* box filter con immagine integrale */
function boxMean(src,w,h,r){const W=w+1,I=new Float64Array(W*(h+1));
  for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){row+=src[y*w+x];I[(y+1)*W+x+1]=I[y*W+x+1]+row;}}
  const out=new Float32Array(w*h);
  for(let y=0;y<h;y++){const y0=Math.max(0,y-r),y1=Math.min(h-1,y+r);for(let x=0;x<w;x++){const x0=Math.max(0,x-r),x1=Math.min(w-1,x+r);
    const s=I[(y1+1)*W+x1+1]-I[y0*W+x1+1]-I[(y1+1)*W+x0]+I[y0*W+x0];out[y*w+x]=s/((x1-x0+1)*(y1-y0+1));}}
  return out;}
/* filtro guidato (He et al.): bordi della maschera allineati ai bordi veri della foto */
function guidedFilter(I,p,w,h,r,eps){
  const mI=boxMean(I,w,h,r),mp=boxMean(p,w,h,r),II=new Float32Array(w*h),Ip=new Float32Array(w*h);
  for(let i=0;i<w*h;i++){II[i]=I[i]*I[i];Ip[i]=I[i]*p[i];}
  const mII=boxMean(II,w,h,r),mIp=boxMean(Ip,w,h,r),a=new Float32Array(w*h),b=new Float32Array(w*h);
  for(let i=0;i<w*h;i++){const v=mII[i]-mI[i]*mI[i],c=mIp[i]-mI[i]*mp[i];a[i]=c/(v+eps);b[i]=mp[i]-a[i]*mI[i];}
  const ma=boxMean(a,w,h,r),mb=boxMean(b,w,h,r),q=new Float32Array(w*h);for(let i=0;i<w*h;i++)q[i]=ma[i]*I[i]+mb[i];return q;}
function largestComponent(bin,w,h){
  const lab=new Int32Array(w*h),st=[];let best=0,bestN=0,id=0;
  for(let i=0;i<w*h;i++){if(!bin[i]||lab[i])continue;id++;let n=0;st.push(i);lab[i]=id;
    while(st.length){const k=st.pop();n++;const x=k%w,y=(k/w)|0;
      if(x>0&&bin[k-1]&&!lab[k-1]){lab[k-1]=id;st.push(k-1);}if(x<w-1&&bin[k+1]&&!lab[k+1]){lab[k+1]=id;st.push(k+1);}
      if(y>0&&bin[k-w]&&!lab[k-w]){lab[k-w]=id;st.push(k-w);}if(y<h-1&&bin[k+w]&&!lab[k+w]){lab[k+w]=id;st.push(k+w);}}
    if(n>bestN){bestN=n;best=id;}}
  return{lab,best,n:bestN};}
/* analizza una foto: trova il soggetto, valuta se è adatta, prepara la maschera ad alta qualità */
async function fxAnalyze(e){
  if(e.fx&&e.fx.v===2)return e.fx;
  if(!e.sample){const saved=await idbGet('prev',e.id+'#fx');if(saved&&saved.v===2){e.fx=saved;return saved;}}
  const seg=await fxInit();
  const src=e.prevBlob?await createImageBitmap(e.prevBlob):e.thumbBmp;if(!src)return null;
  const S=512,r0=S/Math.max(src.width,src.height),sw=Math.max(8,Math.round(src.width*r0)),sh=Math.max(8,Math.round(src.height*r0));
  const c=document.createElement('canvas');c.width=sw;c.height=sh;c.getContext('2d').drawImage(src,0,0,sw,sh);
  const res=seg.segment(c);const masks=res.confidenceMasks||[];
  const mw=masks[0].width,mh=masks[0].height,soft=new Float32Array(mw*mh),cls=new Int8Array(mw*mh).fill(-1);
  const per={};
  for(const k of FX_CLASSES){const m=masks[k];if(!m)continue;const a=m.getAsFloat32Array();let n=0;for(let i=0;i<a.length;i++){soft[i]+=a[i];if(a[i]>.5)n++;}per[k]=n;}
  masks.forEach(m=>m.close&&m.close());if(res.close)res.close();
  const bin=new Uint8Array(mw*mh);let fg=0;for(let i=0;i<bin.length;i++){if(soft[i]>.5){bin[i]=1;fg++;}}
  const cov=fg/(mw*mh);
  const out={v:2,ok:false,cov,score:0,why:''};
  const mainK=Object.entries(per).sort((a,b)=>b[1]-a[1])[0];out.kind=mainK&&mainK[1]?FX_NAMES[mainK[0]]:'';
  if(cov<.05){out.why='nessun soggetto riconosciuto';closeSrc(src);return e.fx=out;}
  const L=largestComponent(bin,mw,mh);
  let x0=mw,y0=mh,x1=0,y1=0;for(let i=0;i<bin.length;i++)if(L.lab[i]===L.best){const x=i%mw,y=(i/mw)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  out.bbox=[x0/mw,y0/mh,(x1+1)/mw,(y1+1)/mh];
  const bw=out.bbox[2]-out.bbox[0],bh=out.bbox[3]-out.bbox[1],touchL=x0<=1,touchR=x1>=mw-2,touchT=y0<=1;
  const frac=L.n/fg;
  if(cov>.62)out.why='soggetto troppo grande';
  else if(frac<.72)out.why='troppi soggetti separati';
  else if(bh<.38)out.why='soggetto troppo piccolo';
  else if(touchL&&touchR)out.why='soggetto tagliato ai lati';
  else if(touchT)out.why='soggetto tagliato in alto';
  else out.ok=true;
  out.score=(out.ok?1:0)+(e.fav?.6:0)-Math.abs(cov-.28)*1.5+Math.min(.5,Math.log10(1+(e.sharp||0))/8)+(per[15]?.15:0);
  if(out.ok){/* maschera rifinita a 1024 px */
    const R=1024/Math.max(src.width,src.height),W=Math.round(src.width*Math.min(1,R)),H=Math.round(src.height*Math.min(1,R));
    const g=document.createElement('canvas');g.width=W;g.height=H;const gx=g.getContext('2d',{willReadFrequently:true});gx.drawImage(src,0,0,W,H);
    const px=gx.getImageData(0,0,W,H).data,I=new Float32Array(W*H);for(let i=0;i<W*H;i++)I[i]=(.299*px[i*4]+.587*px[i*4+1]+.114*px[i*4+2])/255;
    /* maschera morbida della sola componente principale, ingrandita in modo bilineare */
    const keep=new Float32Array(mw*mh);for(let i=0;i<keep.length;i++)keep[i]=L.lab[i]===L.best?Math.min(1,soft[i]):Math.min(1,soft[i])*.0;
    const kc=document.createElement('canvas');kc.width=mw;kc.height=mh;const kx=kc.getContext('2d');const kd=kx.createImageData(mw,mh);
    for(let i=0;i<keep.length;i++){const v=Math.round(keep[i]*255);kd.data[i*4]=kd.data[i*4+1]=kd.data[i*4+2]=v;kd.data[i*4+3]=255;}kx.putImageData(kd,0,0);
    gx.imageSmoothingQuality='high';gx.drawImage(kc,0,0,W,H);const up=gx.getImageData(0,0,W,H).data,p=new Float32Array(W*H);for(let i=0;i<W*H;i++)p[i]=up[i*4]/255;
    const q=guidedFilter(I,p,W,H,Math.max(4,Math.round(W/110)),.0008);
    const md=gx.createImageData(W,H);for(let i=0;i<W*H;i++){let v=(q[i]-.5)*1.6+.5;v=v<.03?0:v>.97?1:v;md.data[i*4]=md.data[i*4+1]=md.data[i*4+2]=255;md.data[i*4+3]=Math.round(v*255);}
    gx.putImageData(md,0,0);out.mask=await toBlob(g,'image/png');out.mw=W;out.mh=H;
  }
  closeSrc(src);e.fx=out;if(!e.sample)idbPut('prev',e.id+'#fx',out);return out;
}
/* immagine ritagliata (RGBA con trasparenza) e silhouette bianca, per anteprima o stampa */
async function fxCutout(e,full){
  const key=e.id+(full?'#f':'#p');if(FX.cut.has(key))return FX.cut.get(key);
  if(!e.fx||!e.fx.mask)return null;
  let src;if(full&&e.file){const b=await decodeBlob(e.file);src=canvasOf(b,3200);closeSrc(b);}else src=e.prevBlob?await createImageBitmap(e.prevBlob):null;
  if(!src)return null;
  const W=src.width,H=src.height,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(src,0,0);
  const m=await createImageBitmap(e.fx.mask);x.globalCompositeOperation='destination-in';x.imageSmoothingQuality='high';x.drawImage(m,0,0,W,H);closeSrc(m);
  const s=document.createElement('canvas');s.width=W;s.height=H;const sx=s.getContext('2d');sx.drawImage(c,0,0);sx.globalCompositeOperation='source-in';sx.fillStyle='#ffffff';sx.fillRect(0,0,W,H);
  closeSrc(src);const out={img:c,sil:s,w:W,h:H};
  if(!full){FX.cut.set(key,out);if(FX.cut.size>12){const k=FX.cut.keys().next().value;FX.cut.delete(k);}}
  return out;
}
function fxCutoutSync(e){const k=e.id+'#p';if(FX.cut.has(k))return FX.cut.get(k);if(!e._cutTried&&!FX.failed){e._cutTried=true;(e.fx&&e.fx.mask?Promise.resolve():fxAnalyze(e)).then(()=>fxCutout(e,false)).then(k=>{if(k){THUMBS.clear();draw();scheduleStrip();}}).catch(()=>{});}return null;}
/* sceglie le foto migliori per la pagina effetto */
async function fxFindBest(ids,onProg,max=14){
  const cand=ids.map(id=>LIB.get(id)).filter(e=>e&&(e.prevBlob||e.thumbBmp))
    .sort((a,b)=>(b.fav-a.fav)||((b.sharp||0)-(a.sharp||0))).slice(0,max);
  const ok=[];
  for(let i=0;i<cand.length;i++){onProg&&onProg(i,cand.length);try{const r=await fxAnalyze(cand[i]);if(r&&r.ok)ok.push(cand[i]);}catch(err){if(FX.failed)throw err;}await sleep(0);}
  return ok.sort((a,b)=>b.fx.score-a.fx.score);
}
/* disegno degli effetti dentro renderSpread */
function fxSource(c,o){const e=LIB.get(c.ph&&c.ph.img);if(!e)return null;if(o.q==='full'){return(o.fxmap&&o.fxmap.get(e.id))||null;}return fxCutoutSync(e);}
function drawFxCell(ctx,sp,c,o,X,Y,Wc,Hc,s){
  const e=LIB.get(c.ph.img),cut=fxSource(c,o);if(!e||!cut||!e.fx||!e.fx.bbox)return false;
  if(c.fx==='sticker'){/* soggetto ritagliato con bordo bianco, centrato nel riquadro */
    const[b0,b1,b2,b3]=e.fx.bbox,bw=(b2-b0)*cut.w,bh=(b3-b1)*cut.h,k=Math.min(Wc/bw,Hc/bh);
    const dx=X+Wc/2-(b0*cut.w+bw/2)*k,dy=Y+Hc/2-(b1*cut.h+bh/2)*k,dw=cut.w*k,dh=cut.h*k,ring=Math.max(1.2,2.2*s);
    ctx.save();if(c.rot){ctx.translate(X+Wc/2,Y+Hc/2);ctx.rotate(c.rot*Math.PI/180);ctx.translate(-X-Wc/2,-Y-Hc/2);}
    ctx.save();ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=3*s;ctx.shadowOffsetY=1.2*s;ctx.drawImage(cut.sil,dx,dy,dw,dh);ctx.restore();
    for(let a=0;a<16;a++){const t=a/16*TAU;ctx.drawImage(cut.sil,dx+Math.cos(t)*ring,dy+Math.sin(t)*ring,dw,dh);}
    ctx.drawImage(cut.img,dx,dy,dw,dh);ctx.restore();return true;}
  const g=photoGeom(c.ph,{x:X,y:Y,w:Wc,h:Hc});if(!g)return false;
  const put=(img)=>{ctx.save();ctx.translate(g.cx,g.cy);ctx.rotate(g.rot*Math.PI/180);ctx.scale(c.ph.flip?-1:1,1);ctx.drawImage(img,-g.iw*g.k/2,-g.ih*g.k/2,g.iw*g.k,g.ih*g.k);ctx.restore();};
  if(c.fx==='pop'){ctx.save();ctx.beginPath();ctx.rect(X-Wc*.12,Y-Hc*.6,Wc*1.24,Hc*1.6);ctx.clip();put(cut.img);ctx.restore();return true;}
  if(c.fx==='splash'){ctx.save();shapePath(ctx,c.shape,X,Y,Wc,Hc,0);ctx.clip();put(cut.img);ctx.restore();return true;}
  return false;
}
/* inquadratura "fuori cornice": il bordo superiore taglia il soggetto, la testa esce dal riquadro */
function fxPopFrame(sp,c){
  const e=LIB.get(c.ph.img);if(!e||!e.fx||!e.fx.bbox)return;const r=cellRect(sp,c),ph=c.ph;ph.fit='cover';ph.rot=0;
  const[b0,b1,b2,b3]=e.fx.bbox,f=b1+(b3-b1)*.3,base=Math.max(r.w/e.w,r.h/e.h);
  let dh=Math.max(e.h*base,r.h/Math.max(.2,1-f)),z=dh/(e.h*base);z=clamp(z,1,4);dh=e.h*base*z;const dw=e.w*base*z;
  ph.zoom=z;const my=(dh-r.h)/2,mx=(dw-r.w)/2;
  const imgTop=r.y-f*dh;ph.oy=my>.01?clamp((imgTop+dh/2-r.y-r.h/2)/my,-1,1):0;
  const cxs=(b0+b2)/2,imgLeft=r.x+r.w/2-cxs*dw;ph.ox=mx>.01?clamp((imgLeft+dw/2-r.x-r.w/2)/mx,-1,1):0;
}
