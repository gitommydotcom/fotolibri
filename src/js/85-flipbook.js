/* ============ flipbook: un file .html autonomo con le pagine che si girano ============ */
function flipbookHTML(o){
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const hasCover=BOOK.cover.on&&BOOK.spreads.some(isCover);
  const data=JSON.stringify({pages:o.pages.map(p=>({s:p.src,l:p.label})),aspect:o.aspect,cover:hasCover});
  return`<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)} · bozza sfogliabile</title>
<style>
:root{--bg:#2a2d33;--ink:#f3f1ec;--mut:#a8adb6;--acc:#f0b35a}
*{box-sizing:border-box}html,body{height:100%;margin:0}
body{background:radial-gradient(ellipse at 50% 40%,#3a3e46 0%,var(--bg) 70%);color:var(--ink);font:14px/1.4 system-ui,"Segoe UI",Arial,sans-serif;display:flex;flex-direction:column;overflow:hidden;user-select:none}
header{display:flex;align-items:center;gap:14px;padding:12px 18px}
header h1{font:600 17px/1.2 Georgia,serif;margin:0;letter-spacing:.01em}
header .tag{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);border:1px solid currentColor;border-radius:20px;padding:2px 9px}
header .sp{flex:1}
button{font:inherit;color:inherit;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:7px 12px;cursor:pointer}
button:hover{background:rgba(255,255,255,.16)}button:disabled{opacity:.3;cursor:default}
main{flex:1;position:relative;display:grid;place-items:center;min-height:0}
.book{position:relative;transition:transform .7s cubic-bezier(.3,.1,.2,1);perspective:3200px}
.leaf{position:absolute;top:0;left:50%;width:50%;height:100%;transform-origin:left center;transform-style:preserve-3d;transition:transform .85s cubic-bezier(.35,.08,.2,1)}
.leaf.f{transform:rotateY(-180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;background:#fff}
.face.e{background:transparent}
.face img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.face.b{transform:rotateY(180deg)}
.face:not(.e)::after{content:"";position:absolute;inset:0;pointer-events:none}
.face.a:not(.e)::after{background:linear-gradient(90deg,rgba(0,0,0,.22),rgba(0,0,0,0) 7%,rgba(0,0,0,0) 94%,rgba(255,255,255,.08))}
.face.b:not(.e)::after{background:linear-gradient(270deg,rgba(0,0,0,.22),rgba(0,0,0,0) 7%)}
.shadow{position:absolute;inset:0;box-shadow:0 30px 60px rgba(0,0,0,.45);pointer-events:none;transition:left .7s,right .7s}
.nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;font-size:20px;padding:0;display:grid;place-items:center;z-index:999}
.nav.p{left:18px}.nav.n{right:18px}
footer{display:flex;align-items:center;gap:14px;padding:10px 18px 14px;justify-content:center;flex-wrap:wrap}
footer input{width:min(420px,50vw);accent-color:var(--acc)}
#lbl{min-width:200px;text-align:center;color:var(--mut);font-size:13px}
#idx{position:fixed;inset:0;background:rgba(20,22,26,.96);z-index:2000;overflow:auto;padding:24px;display:none}
#idx.on{display:block}
#idx .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;max-width:1300px;margin:0 auto}
#idx .it{cursor:pointer;display:grid;gap:6px;justify-items:center;color:var(--mut);font-size:12px;background:none;border:0}
#idx .pr{display:flex;box-shadow:0 6px 18px rgba(0,0,0,.4)}
#idx .pr img{display:block;object-fit:cover;background:#fff}
#idx .x{position:sticky;top:0;float:right}
.hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);color:var(--mut);font-size:12px;opacity:.8;pointer-events:none}
.rot{display:none;text-align:center;color:var(--mut);font-size:12.5px;padding:0 16px 6px}
button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
@media (max-width:700px){header{flex-wrap:wrap;gap:8px 10px;padding:10px 12px}header h1{font-size:15px;flex-basis:100%}header .sp{display:none}
  header button{padding:6px 10px;font-size:13px}#bf{display:none}.nav{top:auto;bottom:6px;transform:none;width:44px;height:44px}.nav.p{left:10px}.nav.n{right:10px}
  .hint{display:none}footer{padding:8px 64px 12px}footer input{width:100%}#lbl{min-width:0}#idx .g{grid-template-columns:1fr}}
@media (max-width:700px) and (orientation:portrait){.rot{display:block}}
@media (prefers-reduced-motion:reduce){.leaf,.book,.shadow{transition:none!important}}
</style></head><body>
<header><h1>${esc(o.title)}</h1><span class="tag">Bozza da approvare</span><span class="sp"></span>
<button id="bi" title="Vedi tutte le pagine">Tutte le pagine</button><button id="bf" title="Schermo intero">Schermo intero</button></header>
<main id="m"><div class="book" id="book"><div class="shadow" id="sh"></div></div>
<button class="nav p" id="bp" aria-label="Pagina precedente">‹</button><button class="nav n" id="bn" aria-label="Pagina successiva">›</button>
<div class="hint" id="hint">Clicca sulle pagine, scorri col dito o usa le frecce ← → per sfogliare</div></main>
<div class="rot">Ruota il telefono in orizzontale per vedere le pagine più grandi.</div>
<footer><input type="range" id="rg" min="0" value="0" aria-label="Vai alla pagina"><span id="lbl"></span></footer>
<div id="idx"><button class="x" id="bx">Chiudi</button><div class="g" id="ig"></div></div>
<script>
(function(){
var D=${data};
var P=D.pages.slice();if(!D.cover){P.unshift(null);P.push(null);}if(P.length%2)P.push(null);
var L=P.length/2,cur=0,book=document.getElementById('book'),sh=document.getElementById('sh'),leaves=[];
function face(p,cls){var f=document.createElement('div');f.className='face '+cls+(p?'':' e');if(p){var i=new Image();i.src=p.s;i.alt=p.l;i.decoding='async';f.appendChild(i);}return f;}
for(var k=0;k<L;k++){var lf=document.createElement('div');lf.className='leaf';lf.appendChild(face(P[2*k],'a'));lf.appendChild(face(P[2*k+1],'b'));book.appendChild(lf);leaves.push(lf);}
var MIN=D.cover?0:1,MAX=D.cover?L:L-1;if(!D.cover){leaves[0].classList.add('f');cur=1;}
function z(){for(var k=0;k<L;k++)leaves[k].style.zIndex=k<cur?(k+1):(2*L-k);}
var pw=0,ph=0;
function fit(){var m=document.getElementById('m'),nw=m.clientWidth<700,W=m.clientWidth-(nw?16:130),H=m.clientHeight-(nw?64:40);pw=Math.min(W/2,H*D.aspect);ph=pw/D.aspect;book.style.width=2*pw+'px';book.style.height=ph+'px';pos();}
function pos(){var x=0;if(cur===0)x=-pw/2;if(cur===L)x=pw/2;book.style.transform='translateX('+x+'px)';
  sh.style.left=(cur===0?pw:0)+'px';sh.style.right=(cur===L?pw:0)+'px';}
function lab(){var s;if(cur===0)s=P[0]?P[0].l:'';else if(cur===L)s=P[2*L-1]?P[2*L-1].l:'';else{var a=P[2*cur-1],b=P[2*cur];s=[a&&a.l,b&&b.l].filter(function(x,i,arr){return x&&arr.indexOf(x)===i;}).join('  ·  ');}
  document.getElementById('lbl').textContent=s;document.getElementById('rg').value=cur;document.getElementById('bp').disabled=cur===MIN;document.getElementById('bn').disabled=cur===MAX;}
function go(n){n=Math.max(MIN,Math.min(MAX,n));if(n===cur)return;var dir=n>cur?1:-1,a=cur,steps=Math.abs(n-cur);
  for(var i=0;i<steps;i++)(function(i){var k=dir>0?a+i:a-1-i;setTimeout(function(){leaves[k].style.zIndex=3*L+i;leaves[k].classList.toggle('f',dir>0);},i*(steps>3?60:140));})(i);
  cur=n;pos();lab();setTimeout(z,900+steps*140);document.getElementById('hint').style.display='none';}
book.addEventListener('click',function(e){var r=book.getBoundingClientRect(),mid=r.left+r.width/2;go(cur+(e.clientX>mid?1:-1));});
document.getElementById('bp').onclick=function(){go(cur-1);};document.getElementById('bn').onclick=function(){go(cur+1);};
var rg=document.getElementById('rg');rg.min=MIN;rg.max=MAX;rg.oninput=function(){go(+rg.value);};
addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();go(cur+1);}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(cur-1);}if(e.key==='Home')go(MIN);if(e.key==='End')go(MAX);if(e.key==='Escape')ix.classList.remove('on');});
var tx=null;book.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;},{passive:true});
book.addEventListener('touchend',function(e){if(tx==null)return;var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40){e.preventDefault();go(cur+(d<0?1:-1));}tx=null;});
document.getElementById('bf').onclick=function(){if(document.fullscreenElement)document.exitFullscreen();else if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen();};
var ix=document.getElementById('idx'),ig=document.getElementById('ig');
function idx(){ig.innerHTML='';for(var s=MIN;s<=MAX;s++)(function(s){var b=document.createElement('button');b.className='it';var pr=document.createElement('div');pr.className='pr';
  var ps=s===0?[P[0]]:s===L?[P[2*L-1]]:[P[2*s-1],P[2*s]],h=Math.round(135/Math.max(1,D.aspect));ps.forEach(function(p){var im=document.createElement('img');im.style.height=h+'px';im.style.width=(h*D.aspect)+'px';if(p)im.src=p.s;else im.style.background='transparent';pr.appendChild(im);});
  b.appendChild(pr);var t=document.createElement('span');t.textContent=ps.filter(Boolean).map(function(p){return p.l;}).filter(function(x,i,arr){return arr.indexOf(x)===i;}).join(' · ');b.appendChild(t);b.onclick=function(){ix.classList.remove('on');go(s);};ig.appendChild(b);})(s);}
document.getElementById('bi').onclick=function(){idx();ix.classList.add('on');};document.getElementById('bx').onclick=function(){ix.classList.remove('on');};
addEventListener('resize',fit);z();fit();lab();
})();
</script></body></html>`;
}
