/* ============ disegno ============ */
function rrect(ctx,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
/* percorso della forma di un riquadro (in px) */
function shapePath(ctx,shape,X,Y,W,H,rad){
  if(shape==='circle'){ctx.beginPath();ctx.ellipse(X+W/2,Y+H/2,W/2,H/2,0,0,TAU);return;}
  if(shape==='heart'){heartPath(ctx,X,Y,W,H);return;}
  if(shape==='arch'){archPath(ctx,X,Y,W,H);return;}
  if(shape==='round'){rrect(ctx,X,Y,W,H,Math.max(rad,Math.min(W,H)*.06));return;}
  rrect(ctx,X,Y,W,H,rad);
}
function filterStr(p){
  const f=[];if(p.br!==100)f.push(`brightness(${p.br}%)`);if(p.ct!==100)f.push(`contrast(${p.ct}%)`);if(p.sat!==100)f.push(`saturate(${p.sat}%)`);
  if(p.gray)f.push(`grayscale(${p.gray}%)`);if(p.sepia)f.push(`sepia(${p.sepia}%)`);return f.length?f.join(' '):'none';
}
function drawPhoto(ctx,ph,src,r,s){
  const g=photoGeom(ph,r);if(!g)return;
  ctx.save();ctx.translate(g.cx,g.cy);ctx.rotate(g.rot*Math.PI/180);ctx.scale(ph.flip?-1:1,ph.flipV?-1:1);
  let f=filterStr(ph);if(ph.blur)f=(f==='none'?'':f+' ')+`blur(${ph.blur*s/10}px)`;
  ctx.filter=f;ctx.imageSmoothingQuality='high';
  const w=g.iw*g.k,h=g.ih*g.k;ctx.drawImage(src,-w/2,-h/2,w,h);ctx.restore();
}
function drawPlaceholder(ctx,x,y,w,h,label){
  ctx.fillStyle='rgba(128,136,148,.2)';ctx.fillRect(x,y,w,h);
  ctx.save();ctx.strokeStyle='rgba(110,118,130,.25)';ctx.lineWidth=1;ctx.beginPath();
  for(let d=-h;d<w;d+=12){ctx.moveTo(x+d,y+h);ctx.lineTo(x+d+h,y);}ctx.stroke();ctx.restore();
  ctx.fillStyle='rgba(60,68,80,.85)';ctx.textAlign='center';ctx.textBaseline='middle';
  const fs=Math.max(9,Math.min(14,w/11));ctx.font=`500 ${fs}px "Inter","Segoe UI",sans-serif`;
  ctx.fillText(w>120&&h>40?label:'+',x+w/2,y+h/2);
}
function textFont(t,fs){return`${t.italic?'italic ':''}${t.bold?700:400} ${fs}px "${t.font}", "Segoe UI", Arial, sans-serif`;}
function measureText(ctx,t,s){
  const fs=t.size*25.4/72*s;ctx.save();ctx.font=textFont(t,fs);try{ctx.letterSpacing=(t.ls*fs/100)+'px';}catch(e){}
  const lines=textStr(t).split('\n');const ws=lines.map(l=>ctx.measureText(l).width);ctx.restore();
  const lh=fs*t.lh;return{fs,lines,lh,w:Math.max(fs*.3,...ws),h:lines.length*lh,pad:fs*.35};
}
function drawText(ctx,t,s,ox,oy,W,H){
  const m=measureText(ctx,t,s);
  ctx.save();ctx.translate(ox+t.x*W*s,oy+t.y*H*s);ctx.rotate(t.rot*Math.PI/180);
  const a=t.op/100;
  if(t.boxOp>0){ctx.globalAlpha=a*t.boxOp/100;ctx.fillStyle=t.boxColor;rrect(ctx,-m.w/2-m.pad,-m.h/2-m.pad*.6,m.w+2*m.pad,m.h+1.2*m.pad,m.fs*.18);ctx.fill();}
  ctx.globalAlpha=a;ctx.font=textFont(t,m.fs);try{ctx.letterSpacing=(t.ls*m.fs/100)+'px';}catch(e){}
  ctx.textBaseline='middle';ctx.textAlign=t.align;const tx=t.align==='left'?-m.w/2:t.align==='right'?m.w/2:0;
  if(t.shadow){ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=m.fs*.18;ctx.shadowOffsetY=m.fs*.05;}
  m.lines.forEach((l,i)=>{const y=-m.h/2+m.lh*(i+.5);
    if(t.strokeW>0){ctx.lineJoin='round';ctx.lineWidth=t.strokeW/100*m.fs;ctx.strokeStyle=t.strokeColor;ctx.strokeText(l,tx,y);}
    ctx.fillStyle=t.color;ctx.fillText(l,tx,y);});
  ctx.restore();
}
function drawDeco(ctx,d,s,ox,oy,W,H){drawMotif(ctx,d.m,ox+d.x*W*s,oy+d.y*H*s,d.s*s,d.rot,d.c,d.c2||d.c,d.op,d.flip);}
/* o: {s, ox, oy, bleed, q:'preview'|'thumb'|'full', map, sides, spineBleed, noBg} */
function renderSpread(ctx,sp,o){
  const st=BOOK.style,s=o.s,ox=o.ox,oy=o.oy,b=o.bleed||0,W=spW(sp),H=pgH(sp),bg=bgOf(sp);
  ctx.save();
  ctx.fillStyle=bg;ctx.fillRect(ox-b*s,oy-b*s,(W+2*b)*s,(H+2*b)*s);
  const P=patOf(sp);
  if(P){const seed=hashStr(sp.id);
    if(isCover(sp)&&sp.meta.R&&sp.meta.R.full&&sp.cells.some(c=>c.side==='R'&&c.w>.98&&c.h>.98)){
      const pb=pageBox(sp,'L');drawPattern(ctx,P,{x:ox/s-b,y:oy/s-b,w:pb.w+BOOK.cover.spine+b,h:H+2*b},s,seed);
    }else drawPattern(ctx,P,{x:ox/s-b,y:oy/s-b,w:W+2*b,h:H+2*b},s,seed);}
  const back=(sp.decos||[]).filter(d=>d.back),front=(sp.decos||[]).filter(d=>!d.back);
  for(const d of back)drawDeco(ctx,d,s,ox,oy,W,H);
  sp.cells.forEach(c=>{
    if(o.sides&&!o.sides.includes(c.side))return;
    const r=cellRect(sp,c,c.shape&&c.shape!=='round'?0:b,o.spineBleed),X=ox+r.x*s,Y=oy+r.y*s,Wc=r.w*s,Hc=r.h*s;if(Wc<=0||Hc<=0)return;
    const rad=(c.shape==='round'?Math.max(st.radius,3):st.radius)*s,shape=c.shape;
    const bw=(c.bw!=null?c.bw:st.borderW)*s,bc=c.bc||st.borderColor;
    if(st.shadow>0){ctx.save();ctx.shadowColor='rgba(0,0,0,.34)';ctx.shadowBlur=st.shadow*s*1.2;ctx.shadowOffsetY=st.shadow*s*.4;ctx.fillStyle=c.fill||bg;shapePath(ctx,shape,X,Y,Wc,Hc,rad);ctx.fill();ctx.restore();}
    ctx.save();shapePath(ctx,shape,X,Y,Wc,Hc,rad);ctx.clip();
    if(c.fill){ctx.fillStyle=c.fill;ctx.fillRect(X,Y,Wc,Hc);}
    const has=c.ph&&LIB.has(c.ph.img),src=has?srcFor(c.ph.img,o):null;
    if(src)drawPhoto(ctx,c.ph,src,{x:X,y:Y,w:Wc,h:Hc},s);
    else if(o.q==='preview'&&!c.fill)drawPlaceholder(ctx,X,Y,Wc,Hc,c.ph?'Foto da ricollegare':'Trascina qui una foto');
    else if(o.q==='thumb'&&!c.fill){ctx.fillStyle='rgba(128,136,148,.3)';ctx.fillRect(X,Y,Wc,Hc);}
    ctx.restore();
    if(bw>0){ctx.save();if(shape&&shape!=='round'){shapePath(ctx,shape,X,Y,Wc,Hc,rad);ctx.lineWidth=bw*2;ctx.strokeStyle=bc;ctx.save();ctx.clip();ctx.stroke();ctx.restore();}
      else{rrect(ctx,X+bw/2,Y+bw/2,Wc-bw,Hc-bw,Math.max(0,rad-bw/2));ctx.lineWidth=bw;ctx.strokeStyle=bc;ctx.stroke();}ctx.restore();}
  });
  for(const d of front)drawDeco(ctx,d,s,ox,oy,W,H);
  for(const t of sp.texts)drawText(ctx,t,s,ox,oy,W,H);
  ctx.restore();
}
/* disegna su una tela nuova una zona (mm) di una doppia pagina, per bozze, flipbook e miniature */
async function renderRegion(sp,x,y,w,h,pxPerMm,q,opts={}){
  const W=Math.max(1,Math.round(w*pxPerMm)),H=Math.max(1,Math.round(h*pxPerMm));
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.imageSmoothingQuality='high';
  const map=q==='full'?await loadOriginals(sp,opts.maxPx):await loadPreviews(sp);
  await loadSpreadFonts(sp);
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  renderSpread(ctx,sp,{s:pxPerMm,ox:-x*pxPerMm,oy:-y*pxPerMm,bleed:opts.bleed||0,q:'full',map,sides:opts.sides,spineBleed:opts.spineBleed});
  ctx.restore();
  for(const s of map.values())closeSrc(s);
  return c;
}
async function loadOriginals(sp,maxPx){
  const map=new Map();
  for(const c of sp.cells){if(!c.ph||map.has(c.ph.img))continue;const e=LIB.get(c.ph.img);if(!e)continue;
    try{if(e.file&&!maxPx)map.set(e.id,await decodeBlob(e.file));else if(e.file&&maxPx){const b=await decodeBlob(e.file);const cv=canvasOf(b,maxPx);closeSrc(b);map.set(e.id,cv);}
      else if(e.prevBlob)map.set(e.id,await createImageBitmap(e.prevBlob));}catch(err){}}
  return map;
}
async function loadPreviews(sp){const map=new Map();for(const c of sp.cells){if(!c.ph||map.has(c.ph.img))continue;const e=LIB.get(c.ph.img);if(!e)continue;
  try{if(e.prevBlob)map.set(e.id,await createImageBitmap(e.prevBlob));else if(e.file){const b=await decodeBlob(e.file);map.set(e.id,canvasOf(b,1600));closeSrc(b);}}catch(err){}}return map;}
async function loadSpreadFonts(sp){if(!document.fonts)return;await Promise.all(sp.texts.map(t=>document.fonts.load(textFont(t,40),textStr(t)).catch(()=>{})));}
