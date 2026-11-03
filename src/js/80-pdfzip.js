/* ============ scrittura PDF e ZIP (senza librerie esterne) ============ */
function setJfifDpi(u,d){if(u[2]===0xFF&&u[3]===0xE0&&u[6]===0x4A&&u[7]===0x46&&u[8]===0x49&&u[9]===0x46){u[13]=1;u[14]=d>>8;u[15]=d&255;u[16]=d>>8;u[17]=d&255;}return u;}
function drawMarks(ctx,g,w,h){
  const k=g.k,L=g.ext*k,T=g.ext*k,R=(g.ext+w)*k,B=(g.ext+h)*k,o=g.off*k,l=g.mlen*k;
  ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,.1*k);ctx.beginPath();
  for(const x of[L,R])for(const[y,d] of[[T,-1],[B,1]]){ctx.moveTo(x,y+d*o);ctx.lineTo(x,y+d*(o+l));}
  for(const y of[T,B])for(const[x,d] of[[L,-1],[R,1]]){ctx.moveTo(x+d*o,y);ctx.lineTo(x+d*(o+l),y);}
  ctx.stroke();ctx.restore();
}
function buildPDF(pages){
  const pt=72/25.4,enc=new TextEncoder(),parts=[],offs=[];let len=0;const f=n=>(+n.toFixed(3)).toString();
  const add=x=>{if(typeof x==='string'){const u=enc.encode(x);parts.push(u);len+=u.length;}else{parts.push(x);len+=x.size;}};
  const obj=(n,body)=>{offs[n]=len;add(`${n} 0 obj\n${body}\nendobj\n`);};
  const N=pages.length,info=3+3*N,d=new Date(),p2=n=>String(n).padStart(2,'0');
  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,`<< /Type /Pages /Kids [${pages.map((_,i)=>`${3+3*i} 0 R`).join(' ')}] /Count ${N} >>`);
  pages.forEach((p,i)=>{const n=3+3*i,W=p.Wmm*pt,H=p.Hmm*pt,box=m=>`[${f(m*pt)} ${f(m*pt)} ${f(W-m*pt)} ${f(H-m*pt)}]`;
    obj(n,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(W)} ${f(H)}] /BleedBox ${box(p.ext-p.b)} /TrimBox ${box(p.ext)} /Resources << /XObject << /Im0 ${n+2} 0 R >> >> /Contents ${n+1} 0 R >>`);
    const cs=`q ${f(W)} 0 0 ${f(H)} 0 0 cm /Im0 Do Q`;obj(n+1,`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    offs[n+2]=len;add(`${n+2} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.pw} /Height ${p.ph} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.blob.size} >>\nstream\n`);add(p.blob);add('\nendstream\nendobj\n');});
  obj(info,`<< /Producer (Fotolibro Studio) /CreationDate (D:${d.getFullYear()}${p2(d.getMonth()+1)}${p2(d.getDate())}${p2(d.getHours())}${p2(d.getMinutes())}${p2(d.getSeconds())}) >>`);
  const xr=len;let x=`xref\n0 ${info+1}\n0000000000 65535 f \n`;for(let i=1;i<=info;i++)x+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
  add(x+`trailer\n<< /Size ${info+1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xr}\n%%EOF\n`);
  return new Blob(parts,{type:'application/pdf'});
}
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC_T[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
async function buildZip(files){
  const parts=[],central=[],enc=new TextEncoder();let off=0;
  for(const f of files){const data=new Uint8Array(await f.blob.arrayBuffer()),crc=crc32(data),nm=enc.encode(f.name),L=data.length;
    const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,L,true);h.setUint32(22,L,true);h.setUint16(26,nm.length,true);
    parts.push(h.buffer,nm,f.blob);
    const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(14,0x21,true);c.setUint32(16,crc,true);c.setUint32(20,L,true);c.setUint32(24,L,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
    central.push(c.buffer,nm);off+=30+nm.length+L;}
  const cd=central.reduce((a,b)=>a+b.byteLength,0);
  const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cd,true);e.setUint32(16,off,true);
  return new Blob([...parts,...central,e.buffer],{type:'application/zip'});
}
