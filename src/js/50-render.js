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
function drawDeco(ctx,d,s,ox,oy,W,H){
  const x=ox+d.x*W*s,y=oy+d.y*H*s;
  if(d.art){drawArt(ctx,d,x,y,s);return;}
  if(d.txt!=null){drawBadge(ctx,d,x,y,s);return;}
  if(d.st){/* stile sticker: contorno bianco fustellato e ombra */
    const r=Math.max(.8,d.s*s*.045);ctx.save();ctx.shadowColor='rgba(0,0,0,.3)';ctx.shadowBlur=r*1.6;ctx.shadowOffsetY=r*.5;
    drawMotif(ctx,d.m,x,y,d.s*s,d.rot,'#ffffff','#ffffff',d.op,d.flip);ctx.restore();
    for(let a=0;a<12;a++){const t=a/12*TAU;drawMotif(ctx,d.m,x+Math.cos(t)*r,y+Math.sin(t)*r,d.s*s,d.rot,'#ffffff','#ffffff',d.op,d.flip);}}
  drawMotif(ctx,d.m,x,y,d.s*s,d.rot,d.c,d.c2||d.c,d.op,d.flip);}
/* sticker con scritta: stesso stile degli sticker illustrati (contorno scuro, bordo bianco fustellato, ombra piena sfalsata) */
const BADGE_SHAPES=[['badge','Etichetta'],['ribbon','Nastro'],['stamp','Timbro'],['bubble','Fumetto'],['tag','Cartellino'],['burst','Esplosione'],['heart','Cuore'],['cloud','Nuvola']];
const BADGE_ROUND=new Set(['stamp','burst','heart']);
const BADGE_INK='#2D2333';
function badgeShape(m){return BADGE_SHAPES.some(x=>x[0]===m)?m:'badge';}
function badgeFont(d,fs){return `${d.bold===false?400:700} ${fs}px "${d.f||'Fredoka'}", "Segoe UI", sans-serif`;}
function badgeLines(d){const t=String(d.txt==null?'':d.txt).trim()||' ',m=badgeShape(d.m);
  if(t.includes('\n'))return t.split('\n').map(l=>l.trim()).filter(Boolean).slice(0,3);
  if(!BADGE_ROUND.has(m))return[t];const w=t.split(/\s+/);if(w.length<2)return[t];const k=Math.ceil(w.length/2);return[w.slice(0,k).join(' '),w.slice(k).join(' ')];}
/* misure in px (s = px per mm): bw/bh corpo, w/h ingombro totale col bordo */
function badgeBox(d,s){const m=badgeShape(d.m),h0=d.s*s,lines=badgeLines(d),fs=h0*(BADGE_ROUND.has(m)?(lines.length>1?.46:.6):.44),f=badgeFont(d,fs);
  mctx.save();mctx.font=f;const tw=Math.max(...lines.map(l=>mctx.measureText(l).width));mctx.restore();
  const nl=lines.length,round=BADGE_ROUND.has(m);
  let bw,bh;if(round){bw=bh=h0*1.9;}else{bh=h0*(nl>1?.62+.5*nl:1);bw=Math.max(bh*1.5,tw+h0*.95);if(m==='cloud'){bw+=h0*.5;bh+=h0*.35;}}
  const bd=h0*.13+h0*.045,extraW=m==='ribbon'?h0*1.1:m==='tag'?h0*.5:0,extraH=m==='bubble'?h0*.5:0;
  return{m,fs,f,tw,lines,bw,bh,round,h0,w:bw+extraW+2*bd,h:bh+extraH+2*bd};}
function _scallop(ctx,r,k,a){ctx.beginPath();for(let i=0;i<=k*8;i++){const t=i/(k*8)*TAU,q=r-a+a*Math.cos(t*k);i?ctx.lineTo(Math.cos(t)*q,Math.sin(t)*q):ctx.moveTo(Math.cos(t)*q,Math.sin(t)*q);}ctx.closePath();}
function _heart(ctx,w,h){const X=x=>x*w/2,Y=y=>y*h/2;ctx.beginPath();ctx.moveTo(X(0),Y(.92));ctx.bezierCurveTo(X(-.22),Y(.72),X(-1),Y(.24),X(-1),Y(-.3));ctx.bezierCurveTo(X(-1),Y(-.72),X(-.66),Y(-.96),X(-.34),Y(-.96));
  ctx.bezierCurveTo(X(-.13),Y(-.96),X(0),Y(-.8),X(0),Y(-.62));ctx.bezierCurveTo(X(0),Y(-.8),X(.13),Y(-.96),X(.34),Y(-.96));ctx.bezierCurveTo(X(.66),Y(-.96),X(1),Y(-.72),X(1),Y(-.3));ctx.bezierCurveTo(X(1),Y(.24),X(.22),Y(.72),X(0),Y(.92));ctx.closePath();}
/* parti della sagoma: [funzione che traccia il percorso, colore di riempimento] */
function badgeParts(B,c){const{m,bw,bh,h0}=B,w=bw,h=bh,dark=mix(c,'#000000',.22),P=[];
  if(m==='ribbon'){const e=h0*.55,dy=h0*.18;
    P.push([ctx=>_poly(ctx,[[-w/2-e,-h/2+dy],[-w/2+h0*.2,-h/2+dy],[-w/2+h0*.2,h/2+dy],[-w/2-e,h/2+dy],[-w/2-e*.55,dy]]),dark]);
    P.push([ctx=>_poly(ctx,[[w/2+e,-h/2+dy],[w/2-h0*.2,-h/2+dy],[w/2-h0*.2,h/2+dy],[w/2+e,h/2+dy],[w/2+e*.55,dy]]),dark]);
    P.push([ctx=>{ctx.beginPath();ctx.rect(-w/2,-h/2,w,h);},c]);}
  else if(m==='stamp')P.push([ctx=>_scallop(ctx,w/2,18,h0*.07),c]);
  else if(m==='burst')P.push([ctx=>{const k=14,pts=[];for(let i=0;i<k*2;i++){const a=-Math.PI/2+i*Math.PI/k,r=i%2?w*.39:w*.5;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}_poly(ctx,pts);},c]);
  else if(m==='heart')P.push([ctx=>{ctx.save();ctx.translate(0,h0*.06);_heart(ctx,w*1.08,h*1.02);ctx.restore();},c]);
  else if(m==='bubble'){P.push([ctx=>_poly(ctx,[[-w*.22,h/2-2],[-w*.34,h/2+h0*.5],[-w*.02,h/2-2]]),c]);P.push([ctx=>rrect(ctx,-w/2,-h/2,w,h,Math.min(h*.5,h0*.5)),c]);}
  else if(m==='tag'){const n=h0*.45;P.push([ctx=>_poly(ctx,[[-w/2-n,0],[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]),c]);}
  else if(m==='cloud')P.push([ctx=>{const r=h*.36;ctx.beginPath();const bumps=Math.max(3,Math.round(w/(r*1.3)));
    for(let i=0;i<bumps;i++){const x=-w/2+r+(w-2*r)*i/(bumps-1);ctx.moveTo(x+r,-h*.12);ctx.arc(x,-h*.12,r*(i%2?1.05:.9),0,TAU);ctx.moveTo(x+r,h*.16);ctx.arc(x,h*.16,r*.92,0,TAU);}
    ctx.moveTo(-w/2+r,0);ctx.rect(-w/2+r*.6,-h*.15,w-r*1.2,h*.42);},c]);
  else P.push([ctx=>rrect(ctx,-w/2,-h/2,w,h,h*.5),c]);
  return P;}
function drawBadge(ctx,d,x,y,s){
  const B=badgeBox(d,s),c=d.c||'#C2185B',ink=d.c2&&d.c2!==c?d.c2:contrastInk(c),h0=B.h0,bd=h0*.13,ol=Math.max(.6,h0*.045),parts=badgeParts(B,c);
  ctx.save();ctx.translate(x,y);if(d.rot)ctx.rotate(d.rot*Math.PI/180);ctx.globalAlpha*=d.op==null?1:d.op;ctx.lineJoin='round';
  const layer=(col,lw,dx,dy)=>{ctx.save();ctx.translate(dx,dy);ctx.fillStyle=ctx.strokeStyle=col;ctx.lineWidth=lw;for(const[p] of parts){p(ctx);if(lw)ctx.stroke();ctx.fill();}ctx.restore();};
  if(d.flat){ctx.shadowColor='rgba(0,0,0,.22)';ctx.shadowBlur=h0*.14;ctx.shadowOffsetY=h0*.05;layer('#ffffff',2*bd,0,0);ctx.shadowColor='transparent';}
  else{layer('#1E2B38',2*(bd+ol),-h0*.06,h0*.09);layer('#ffffff',2*(bd+ol),0,0);layer(BADGE_INK,2*ol,0,0);}
  for(const[p,col] of parts){ctx.fillStyle=col;p(ctx);ctx.fill();}
  /* dettagli */
  const{m,bw:w,bh:h}=B;
  ctx.save();parts[parts.length-1][0](ctx);ctx.clip();
  ctx.fillStyle='rgba(0,0,0,.13)';ctx.beginPath();if(B.round)ctx.arc(w*.12,h*.12,w*.5,0,TAU);else ctx.rect(-w,h*.18,w*2,h);ctx.fill();
  if(!B.round&&m!=='cloud'){ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=h0*.06;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-w/2+h0*.35,-h/2+h0*.16);ctx.lineTo(-w/2+Math.min(w*.4,h0*1.6),-h/2+h0*.16);ctx.stroke();}
  ctx.restore();
  if(m==='stamp'){ctx.strokeStyle=ink;ctx.globalAlpha*=.75;ctx.setLineDash([h0*.09,h0*.07]);ctx.lineWidth=h0*.04;ctx.beginPath();ctx.arc(0,0,w/2-h0*.2,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha/=.75;}
  if(m==='tag'){const n=h0*.45;ctx.fillStyle='#ffffff';ctx.strokeStyle=BADGE_INK;ctx.lineWidth=ol;ctx.beginPath();ctx.arc(-w/2-n*.1,0,h0*.09,0,TAU);ctx.fill();ctx.stroke();}
  if(m==='ribbon'){ctx.fillStyle=mix(c,'#000000',.45);const e=h0*.55,dy=h0*.18;_poly(ctx,[[-w/2,h/2],[-w/2+h0*.2,h/2],[-w/2+h0*.2,h/2+dy]]);ctx.fill();_poly(ctx,[[w/2,h/2],[w/2-h0*.2,h/2],[w/2-h0*.2,h/2+dy]]);ctx.fill();}
  /* scritta: un'ombra più scura sotto, poi il colore */
  const lines=B.lines,lh=B.fs*1.08;let fs=B.fs;const maxW=B.round?w*(m==='heart'?.62:.7):w-h0*.6;
  if(B.tw>maxW)fs*=maxW/B.tw;const yOff=m==='heart'?-h0*.08:m==='cloud'?h0*.04:0;
  ctx.font=badgeFont(d,fs);ctx.textAlign='center';ctx.textBaseline='middle';try{ctx.letterSpacing=(fs*.01)+'px';}catch(e){}
  lines.forEach((l,i)=>{const ty=(i-(lines.length-1)/2)*lh*(fs/B.fs)+fs*.06+yOff;
    ctx.fillStyle=ink===contrastInk(c)&&ink==='#ffffff'?mix(c,'#000000',.35):'rgba(0,0,0,.18)';ctx.fillText(l,0,ty+fs*.07);
    ctx.fillStyle=ink;ctx.fillText(l,0,ty);});
  ctx.restore();
}
/* miniatura di uno sticker con scritta (pannelli) */
function badgeThumb(d,size=56){const c=el('canvas',{width:size*2,height:size*2,style:`width:${size}px;height:${size}px`,class:'bth'}),x=c.getContext('2d');
  const s=1,B=badgeBox({...d,s:10},1),k=Math.min(size*2*.92/B.w,size*2*.92/B.h);x.translate(size,size);x.scale(k,k);drawBadge(x,{...d,s:10,rot:0},0,0,1);return c;}
/* o: {s, ox, oy, bleed, q:'preview'|'thumb'|'full', map, sides, spineBleed, noBg} */
function renderSpread(ctx,sp,o){
  const st=BOOK.style,s=o.s,ox=o.ox,oy=o.oy,b=o.bleed||0,W=spW(sp),H=pgH(sp),bg=bgOf(sp);
  ctx.save();
  /* risguardi: si stampa solo la zona visibile (pagina + abbondanza per lato), il resto del foglio resta carta bianca */
  if(isEnd(sp)&&!o.fullSheet){ctx.fillStyle='#ffffff';ctx.fillRect(ox-b*s,oy-b*s,(W+2*b)*s,(H+2*b)*s);ctx.beginPath();
    for(const V of endPrintArea(sp))ctx.rect(ox+V.x*s,oy+V.y*s,V.w*s,V.h*s);ctx.clip();}
  ctx.fillStyle=bg;ctx.fillRect(ox-b*s,oy-b*s,(W+2*b)*s,(H+2*b)*s);
  /* sfondo proprio di una singola pagina (pagine speciali) */
  for(const side of['L','R','S']){const sb=sideBg(sp,side);if(!sb||(side==='S'&&sp.mode!=='spread')||(side!=='S'&&sp.mode==='spread'))continue;
    const pb=pageBox(sp,side),x0=pb.x<=.01?-b:pb.x,x1=pb.x+pb.w>=W-.01?W+b:pb.x+pb.w;ctx.fillStyle=sb;ctx.fillRect(ox+x0*s,oy-b*s,(x1-x0)*s,(H+2*b)*s);}
  const P=patOf(sp);
  if(P){const seed=hashStr(sp.id);
    if(isCover(sp)&&sp.meta.R&&sp.meta.R.full&&sp.cells.some(c=>c.side==='R'&&c.w>.98&&c.h>.98&&!c.bgPh)){
      const pb=pageBox(sp,'L');drawPattern(ctx,P,{x:ox/s-b,y:oy/s-b,w:pb.w+BOOK.cover.spine+b,h:H+2*b},s,seed);
    }else drawPattern(ctx,P,{x:ox/s-b,y:oy/s-b,w:W+2*b,h:H+2*b},s,seed);}
  for(const side of['L','R']){const M=sp.meta&&sp.meta[side];if(!M||!M.pat||sp.mode==='spread')continue;const pb=pageBox(sp,side);
    drawPattern(ctx,M.pat,{x:(pb.x<=.01?-b:pb.x)+ox/s,y:oy/s-b,w:pb.w+b,h:H+2*b},s,hashStr(sp.id+side));}
  const back=(sp.decos||[]).filter(d=>d.back),front=(sp.decos||[]).filter(d=>!d.back);
  for(const d of back)drawDeco(ctx,d,s,ox,oy,W,H);
  sp.cells.forEach(c=>{
    if(o.sides&&!o.sides.includes(c.side))return;
    const r=cellRect(sp,c,(c.shape&&c.shape!=='round')||c.rot||c.fx==='sticker'?0:b,o.spineBleed),X=ox+r.x*s,Y=oy+r.y*s,Wc=r.w*s,Hc=r.h*s;if(Wc<=0||Hc<=0)return;
    const has=c.ph&&LIB.has(c.ph.img);
    if(c.fx==='sticker'){if(has&&drawFxCell(ctx,sp,c,o,X,Y,Wc,Hc,s))return;}
    const rad=(c.shape==='round'?Math.max(st.radius,3):st.radius)*s,shape=c.shape;
    const bw=(c.bw!=null?c.bw:st.borderW)*s,bc=c.bc||st.borderColor,shd=c.sh!=null?c.sh:st.shadow;
    ctx.save();
    if(c.rot){ctx.translate(X+Wc/2,Y+Hc/2);ctx.rotate(c.rot*Math.PI/180);ctx.translate(-X-Wc/2,-Y-Hc/2);}
    if(shd>0){ctx.save();ctx.shadowColor='rgba(0,0,0,.34)';ctx.shadowBlur=shd*s*1.2;ctx.shadowOffsetY=shd*s*.4;ctx.fillStyle=bw>0?bc:(c.fill||bg);shapePath(ctx,shape,X,Y,Wc,Hc,rad);ctx.fill();ctx.restore();}
    ctx.save();shapePath(ctx,shape,X,Y,Wc,Hc,rad);ctx.clip();
    if(c.fill){ctx.fillStyle=c.fill;ctx.fillRect(X,Y,Wc,Hc);}
    const src=has?srcFor(c.ph.img,o):null;
    if(src){if(c.fx==='splash'){const g=c.ph.gray;c.ph.gray=100;drawPhoto(ctx,c.ph,src,{x:X,y:Y,w:Wc,h:Hc},s);c.ph.gray=g;}else drawPhoto(ctx,c.ph,src,{x:X,y:Y,w:Wc,h:Hc},s);}
    else if(o.q==='preview'&&!c.fill)drawPlaceholder(ctx,X,Y,Wc,Hc,c.ph?'Foto da ricollegare':'Trascina qui una foto');
    else if(o.q==='thumb'&&!c.fill){ctx.fillStyle='rgba(128,136,148,.3)';ctx.fillRect(X,Y,Wc,Hc);}
    ctx.restore();
    if(bw>0){ctx.save();if(shape&&shape!=='round'){shapePath(ctx,shape,X,Y,Wc,Hc,rad);ctx.lineWidth=bw*2;ctx.strokeStyle=bc;ctx.save();ctx.clip();ctx.stroke();ctx.restore();}
      else{rrect(ctx,X+bw/2,Y+bw/2,Wc-bw,Hc-bw,Math.max(0,rad-bw/2));ctx.lineWidth=bw;ctx.strokeStyle=bc;ctx.stroke();}ctx.restore();}
    if(c.fx&&has&&src)drawFxCell(ctx,sp,c,o,X,Y,Wc,Hc,s);
    ctx.restore();
  });
  for(const d of front)drawDeco(ctx,d,s,ox,oy,W,H);
  for(const t of sp.texts)drawText(ctx,t,s,ox,oy,W,H);
  ctx.restore();
}
/* disegna su una tela nuova una zona (mm) di una doppia pagina, per bozze, flipbook e miniature */
async function renderRegion(sp,x,y,w,h,pxPerMm,q,opts={}){
  await ART_READY;
  const W=Math.max(1,Math.round(w*pxPerMm)),H=Math.max(1,Math.round(h*pxPerMm));
  const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.imageSmoothingQuality='high';
  const map=q==='full'?await loadOriginals(sp,opts.maxPx):await loadPreviews(sp),fxmap=await loadCutouts(sp,q==='full');
  await loadSpreadFonts(sp);
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  renderSpread(ctx,sp,{s:pxPerMm,ox:-x*pxPerMm,oy:-y*pxPerMm,bleed:opts.bleed||0,q:'full',map,fxmap,sides:opts.sides,spineBleed:opts.spineBleed});
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
async function loadCutouts(sp,full){const m=new Map();for(const c of sp.cells){if(!c.fx||!c.ph||m.has(c.ph.img))continue;const e=LIB.get(c.ph.img);if(!e)continue;
  try{if(!e.fx||!e.fx.mask)await fxAnalyze(e);const k=await fxCutout(e,full);if(k)m.set(e.id,k);}catch(err){}}return m;}
async function loadSpreadFonts(sp){if(!document.fonts)return;await Promise.all(sp.texts.map(t=>document.fonts.load(textFont(t,40),textStr(t)).catch(()=>{})));}
