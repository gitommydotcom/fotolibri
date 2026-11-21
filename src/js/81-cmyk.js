/* ============ JPEG CMYK (FOGRA39) ============
   Conversione sRGB → CMYK con la tabella calcolata da littleCMS sul profilo ISO Coated v2 (ECI) — FOGRA39,
   intento colorimetrico relativo con compensazione del punto nero (come Photoshop), interpolazione tetraedrica.
   Encoder JPEG baseline a 4 canali derivato da jpeg-js / Adobe as3corelib (licenza BSD, © 2008 Adobe Systems Incorporated):
   profilo ICC incorporato, marcatore Adobe (CMYK invertito come Photoshop), risoluzione in EXIF e nel blocco Photoshop. */
let CMYK=null;
async function cmykInit(){
  if(CMYK)return CMYK;if(!window.__CMYK)await loadScript('fotolibro-cmyk.js');
  const D=window.__CMYK;if(!D)throw new Error('modulo CMYK non trovato');
  CMYK={grid:D.grid,lut:b64ToBytes(D.lut),icc:b64ToBytes(D.icc),name:D.name};return CMYK;
}
const JZZ=[0,1,5,6,14,15,27,28,2,4,7,13,16,26,29,42,3,8,12,17,25,30,41,43,9,11,18,24,31,40,44,53,10,19,23,32,39,45,52,54,20,22,33,38,46,51,55,60,21,34,37,47,50,56,59,61,35,36,48,49,57,58,62,63];
const JQT=[16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99];
const J_DC_NR=[0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0],J_DC_V=[0,1,2,3,4,5,6,7,8,9,10,11];
const J_AC_NR=[0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,0x7d];
const J_AC_V=[0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,0x13,0x51,0x61,0x07,0x22,0x71,0x14,0x32,0x81,0x91,0xa1,0x08,0x23,0x42,0xb1,0xc1,0x15,0x52,0xd1,0xf0,
  0x24,0x33,0x62,0x72,0x82,0x09,0x0a,0x16,0x17,0x18,0x19,0x1a,0x25,0x26,0x27,0x28,0x29,0x2a,0x34,0x35,0x36,0x37,0x38,0x39,0x3a,0x43,0x44,0x45,0x46,0x47,0x48,0x49,
  0x4a,0x53,0x54,0x55,0x56,0x57,0x58,0x59,0x5a,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a,0x83,0x84,0x85,0x86,0x87,0x88,0x89,
  0x8a,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9a,0xa2,0xa3,0xa4,0xa5,0xa6,0xa7,0xa8,0xa9,0xaa,0xb2,0xb3,0xb4,0xb5,0xb6,0xb7,0xb8,0xb9,0xba,0xc2,0xc3,0xc4,0xc5,
  0xc6,0xc7,0xc8,0xc9,0xca,0xd2,0xd3,0xd4,0xd5,0xd6,0xd7,0xd8,0xd9,0xda,0xe1,0xe2,0xe3,0xe4,0xe5,0xe6,0xe7,0xe8,0xe9,0xea,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa];
function jHuff(nr,vals){const code=new Int32Array(256),len=new Uint8Array(256);let c=0,p=0;for(let k=1;k<=16;k++){for(let j=0;j<nr[k];j++){code[vals[p]]=c;len[vals[p]]=k;p++;c++;}c<<=1;}return{code,len};}
const JCAT=new Uint8Array(65535),JBIT=new Int32Array(65535);
(()=>{let lo=1,hi=2;for(let cat=1;cat<=15;cat++){for(let n=lo;n<hi;n++){JCAT[32767+n]=cat;JBIT[32767+n]=n;}for(let n=-(hi-1);n<=-lo;n++){JCAT[32767+n]=cat;JBIT[32767+n]=hi-1+n;}lo<<=1;hi<<=1;}})();
/* sRGB (Uint8 RGBA) → CMYK (Uint8, quantità di inchiostro 0-255) con interpolazione tetraedrica */
function rgbToCmykRow(src,so,n,dst,lut,G){
  const g1=G-1,s=g1/255,G2=G*G;
  for(let p=0;p<n;p++){const r=src[so+p*4],g=src[so+p*4+1],b=src[so+p*4+2];
    let tr=r*s,tg=g*s,tb=b*s,ir=tr|0,ig=tg|0,ib=tb|0;if(ir>=g1)ir=g1-1;if(ig>=g1)ig=g1-1;if(ib>=g1)ib=g1-1;
    const fr=tr-ir,fg=tg-ig,fb=tb-ib,c0=((ir*G+ig)*G+ib)*4,dR=G2*4,dG=G*4,dB=4;
    let c1,c2,c3,w1,w2,w3;
    if(fr>=fg){if(fg>=fb){c1=c0+dR;c2=c1+dG;c3=c2+dB;w1=fr;w2=fg;w3=fb;}else if(fr>=fb){c1=c0+dR;c2=c1+dB;c3=c2+dG;w1=fr;w2=fb;w3=fg;}else{c1=c0+dB;c2=c1+dR;c3=c2+dG;w1=fb;w2=fr;w3=fg;}}
    else{if(fb>fg){c1=c0+dB;c2=c1+dG;c3=c2+dR;w1=fb;w2=fg;w3=fr;}else if(fb>fr){c1=c0+dG;c2=c1+dB;c3=c2+dR;w1=fg;w2=fb;w3=fr;}else{c1=c0+dG;c2=c1+dR;c3=c2+dB;w1=fg;w2=fr;w3=fb;}}
    const o=p*4;for(let k=0;k<4;k++){const v=lut[c0+k]+w1*(lut[c1+k]-lut[c0+k])+w2*(lut[c2+k]-lut[c1+k])+w3*(lut[c3+k]-lut[c2+k]);dst[o+k]=v<0?0:v>255?255:v+.5;}}
}
async function encodeCmykJpeg(canvas,quality,dpi,onProg){
  const C=await cmykInit(),W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d',{willReadFrequently:true});
  const sf=quality<50?Math.floor(5000/quality):Math.floor(200-quality*2),QT=new Uint8Array(64),fd=new Float64Array(64),aasf=[1,1.387039845,1.306562965,1.175875602,1,.785694958,.5411961,.275899379];
  for(let i=0;i<64;i++){QT[JZZ[i]]=clamp(Math.floor((JQT[i]*sf+50)/100),1,255);}
  for(let r=0,k=0;r<8;r++)for(let c=0;c<8;c++,k++)fd[k]=1/(QT[JZZ[k]]*aasf[r]*aasf[c]*8);
  const DC=jHuff(J_DC_NR,J_DC_V),AC=jHuff(J_AC_NR,J_AC_V);
  /* buffer di uscita */
  let buf=new Uint8Array(Math.max(1<<20,W*H*1.2|0)),bl=0;
  const ensure=n=>{if(bl+n>buf.length){const nb=new Uint8Array(Math.max(buf.length*2,bl+n+(1<<20)));nb.set(buf.subarray(0,bl));buf=nb;}};
  const B=v=>{ensure(1);buf[bl++]=v;},Wd=v=>{B((v>>8)&255);B(v&255);},bytes=a=>{ensure(a.length);buf.set(a,bl);bl+=a.length;},str=s=>{for(let i=0;i<s.length;i++)B(s.charCodeAt(i));};
  let bnew=0,bpos=7;
  const bits=(val,len)=>{let p=len-1;while(p>=0){if(val&(1<<p))bnew|=(1<<bpos);p--;bpos--;if(bpos<0){if(bnew===0xFF){B(0xFF);B(0);}else B(bnew);bpos=7;bnew=0;}}};
  /* intestazioni */
  Wd(0xFFD8);
  { /* EXIF: risoluzione */ const t=[];const u16=v=>t.push((v>>8)&255,v&255),u32=v=>t.push((v>>>24)&255,(v>>16)&255,(v>>8)&255,v&255);
    t.push(0x4D,0x4D);u16(42);u32(8);u16(3);u16(0x011A);u16(5);u32(1);u32(50);u16(0x011B);u16(5);u32(1);u32(58);u16(0x0128);u16(3);u32(1);u16(2);u16(0);u32(0);u32(dpi);u32(1);u32(dpi);u32(1);
    Wd(0xFFE1);Wd(2+6+t.length);str('Exif');B(0);B(0);bytes(t);}
  { /* profilo ICC FOGRA39 */ const icc=C.icc,CH=65519,n=Math.ceil(icc.length/CH);
    for(let i=0;i<n;i++){const part=icc.subarray(i*CH,Math.min(icc.length,(i+1)*CH));Wd(0xFFE2);Wd(2+14+part.length);str('ICC_PROFILE');B(0);B(i+1);B(n);bytes(part);}}
  { /* Photoshop: risoluzione */ const fx=dpi*65536;const d=[(fx>>>24)&255,(fx>>16)&255,(fx>>8)&255,fx&255,0,1,0,1,(fx>>>24)&255,(fx>>16)&255,(fx>>8)&255,fx&255,0,1,0,1];
    Wd(0xFFED);Wd(2+14+4+2+2+4+16);str('Photoshop 3.0');B(0);str('8BIM');Wd(0x03ED);B(0);B(0);B(0);B(0);B(0);B(16);bytes(d);}
  Wd(0xFFEE);Wd(14);str('Adobe');Wd(100);Wd(0);Wd(0);B(0);/* transform 0 = CMYK senza conversione colore */
  Wd(0xFFDB);Wd(67);B(0);for(let i=0;i<64;i++)B(QT[i]);
  Wd(0xFFC0);Wd(8+3*4);B(8);Wd(H);Wd(W);B(4);for(let k=1;k<=4;k++){B(k);B(0x11);B(0);}
  Wd(0xFFC4);Wd(2+1+16+12+1+16+162);B(0x00);for(let k=1;k<=16;k++)B(J_DC_NR[k]);for(const v of J_DC_V)B(v);B(0x10);for(let k=1;k<=16;k++)B(J_AC_NR[k]);for(const v of J_AC_V)B(v);
  Wd(0xFFDA);Wd(6+2*4);B(4);for(let k=1;k<=4;k++){B(k);B(0x00);}B(0);B(63);B(0);
  /* dati */
  const strip=new Uint8Array(W*8*4),blk=new Float64Array(64),DU=new Int32Array(64),pred=[0,0,0,0];
  const lut=C.lut,G=C.grid,EOBc=AC.code[0],EOBl=AC.len[0],ZRc=AC.code[0xF0],ZRl=AC.len[0xF0];
  for(let y0=0;y0<H;y0+=8){
    const rows=Math.min(8,H-y0),img=ctx.getImageData(0,y0,W,rows).data;
    for(let r=0;r<8;r++){const sr=Math.min(r,rows-1);rgbToCmykRow(img,sr*W*4,W,strip.subarray(r*W*4,(r+1)*W*4),lut,G);}
    for(let x0=0;x0<W;x0+=8){
      for(let comp=0;comp<4;comp++){
        for(let yy=0,k=0;yy<8;yy++){const ro=yy*W*4;for(let xx=0;xx<8;xx++,k++){const x=Math.min(W-1,x0+xx);blk[k]=127-strip[ro+x*4+comp];}}
        /* DCT (AAN) + quantizzazione */
        for(let o=0;o<64;o+=8){const d0=blk[o],d1=blk[o+1],d2=blk[o+2],d3=blk[o+3],d4=blk[o+4],d5=blk[o+5],d6=blk[o+6],d7=blk[o+7];
          const t0=d0+d7,t7=d0-d7,t1=d1+d6,t6=d1-d6,t2=d2+d5,t5=d2-d5,t3=d3+d4,t4=d3-d4;let t10=t0+t3,t13=t0-t3,t11=t1+t2,t12=t1-t2;
          blk[o]=t10+t11;blk[o+4]=t10-t11;const z1=(t12+t13)*.707106781;blk[o+2]=t13+z1;blk[o+6]=t13-z1;
          t10=t4+t5;t11=t5+t6;t12=t6+t7;const z5=(t10-t12)*.382683433,z2=.5411961*t10+z5,z4=1.306562965*t12+z5,z3=t11*.707106781,z11=t7+z3,z13=t7-z3;
          blk[o+5]=z13+z2;blk[o+3]=z13-z2;blk[o+1]=z11+z4;blk[o+7]=z11-z4;}
        for(let o=0;o<8;o++){const d0=blk[o],d1=blk[o+8],d2=blk[o+16],d3=blk[o+24],d4=blk[o+32],d5=blk[o+40],d6=blk[o+48],d7=blk[o+56];
          const t0=d0+d7,t7=d0-d7,t1=d1+d6,t6=d1-d6,t2=d2+d5,t5=d2-d5,t3=d3+d4,t4=d3-d4;let t10=t0+t3,t13=t0-t3,t11=t1+t2,t12=t1-t2;
          blk[o]=t10+t11;blk[o+32]=t10-t11;const z1=(t12+t13)*.707106781;blk[o+16]=t13+z1;blk[o+48]=t13-z1;
          t10=t4+t5;t11=t5+t6;t12=t6+t7;const z5=(t10-t12)*.382683433,z2=.5411961*t10+z5,z4=1.306562965*t12+z5,z3=t11*.707106781,z11=t7+z3,z13=t7-z3;
          blk[o+40]=z13+z2;blk[o+24]=z13-z2;blk[o+8]=z11+z4;blk[o+56]=z11-z4;}
        for(let i=0;i<64;i++){let v=blk[i]*fd[i];v=v>0?(v+.5)|0:(v-.5)|0;if(v>32767)v=32767;else if(v<-32767)v=-32767;DU[JZZ[i]]=v;}
        /* codifica di Huffman */
        const diff=DU[0]-pred[comp];pred[comp]=DU[0];
        if(diff===0)bits(DC.code[0],DC.len[0]);else{const p=32767+diff,c=JCAT[p];bits(DC.code[c],DC.len[c]);bits(JBIT[p],c);}
        let end=63;while(end>0&&DU[end]===0)end--;
        if(end===0){bits(EOBc,EOBl);continue;}
        let i=1;while(i<=end){const st=i;while(DU[i]===0&&i<=end)i++;let nz=i-st;if(nz>=16){for(let q=0;q<(nz>>4);q++)bits(ZRc,ZRl);nz&=15;}
          const p=32767+DU[i],c=JCAT[p],sym=(nz<<4)+c;bits(AC.code[sym],AC.len[sym]);bits(JBIT[p],c);i++;}
        if(end!==63)bits(EOBc,EOBl);
      }
    }
    if(onProg&&(y0/8)%24===0){onProg(y0/H);await sleep(0);}
  }
  if(bpos>=0)bits((1<<(bpos+1))-1,bpos+1);
  Wd(0xFFD9);
  return new Blob([buf.subarray(0,bl)],{type:'image/jpeg'});
}
