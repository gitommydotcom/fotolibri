'use strict';
/* ============ utilità ============ */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,10);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const nf=(n,d=1)=>Number(n).toLocaleString('it-IT',{maximumFractionDigits:d});
const pad3=n=>String(n).padStart(3,'0');
const clone=o=>JSON.parse(JSON.stringify(o));
function el(tag,attrs={},...kids){
  const e=document.createElement(tag);
  for(const k in attrs){const v=attrs[k];
    if(v==null||v===false)continue;
    if(k==='class')e.className=v;
    else if(k==='style')e.style.cssText=v;
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);
    else if(k==='value')e.value=v;
    else if(k==='checked')e.checked=!!v;
    else if(k==='html')e.innerHTML=v;
    else if(v===true)e.setAttribute(k,'');
    else e.setAttribute(k,v);}
  for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c));}
  return e;
}
let toastT=0;
function toast(msg,ms=2800){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,ms);}
function cssVar(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim();}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},60000);}
const toBlob=(c,t,q)=>new Promise(r=>c.toBlob(r,t,q));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function rng(seed){seed=(seed>>>0)%2147483647||1;return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function hexRgb(hex){const h=String(hex||'#fff').replace('#','');const v=h.length===3?h.split('').map(x=>x+x).join(''):h.padEnd(6,'0');
  return[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)];}
function lum(hex){const[r,g,b]=hexRgb(hex);return(.299*r+.587*g+.114*b);}
function contrastInk(hex){return lum(hex)>150?'#1a1a1a':'#ffffff';}
function mix(a,b,t){const A=hexRgb(a),B=hexRgb(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function rgba(hex,a){const[r,g,b]=hexRgb(hex);return`rgba(${r},${g},${b},${a})`;}
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const dayKey=ms=>{const d=new Date(ms);return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
function fmtDay(ms,long=true){return cap(new Date(ms).toLocaleDateString('it-IT',long?{weekday:'long',day:'numeric',month:'long',year:'numeric'}:{day:'numeric',month:'long',year:'numeric'}));}
const safeName=n=>String(n||'').trim().replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,'_').slice(0,80);
function b64(u8){let s='';const CH=0x8000;for(let i=0;i<u8.length;i+=CH)s+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));return btoa(s);}
