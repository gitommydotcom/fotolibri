/* ============ motivi decorativi (vettoriali, disegnati in un quadrato unitario centrato) ============
   Ogni motivo disegna tra -0.5 e 0.5. c = colore principale, c2 = colore secondario.
   Essendo vettoriali vengono renderizzati nitidi a qualsiasi risoluzione di stampa. */
const TAU=Math.PI*2;
function _poly(ctx,pts){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function _star(ctx,n,ro,ri,cx=0,cy=0,rot=-Math.PI/2){ctx.beginPath();for(let i=0;i<2*n;i++){const r=i%2?ri:ro,a=rot+i*Math.PI/n;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();}
function heartPath(ctx,x,y,w,h){
  const P=(px,py)=>[x+(px+.5)*w,y+(py+.5)*h];
  ctx.beginPath();ctx.moveTo(...P(0,.44));
  ctx.bezierCurveTo(...P(-.16,.3),...P(-.5,.08),...P(-.5,-.16));
  ctx.bezierCurveTo(...P(-.5,-.36),...P(-.36,-.47),...P(-.24,-.47));
  ctx.bezierCurveTo(...P(-.12,-.47),...P(-.03,-.4),...P(0,-.29));
  ctx.bezierCurveTo(...P(.03,-.4),...P(.12,-.47),...P(.24,-.47));
  ctx.bezierCurveTo(...P(.36,-.47),...P(.5,-.36),...P(.5,-.16));
  ctx.bezierCurveTo(...P(.5,.08),...P(.16,.3),...P(0,.44));ctx.closePath();
}
function archPath(ctx,x,y,w,h){const r=w/2;ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+Math.min(r,h));ctx.arc(x+r,y+Math.min(r,h),r,Math.PI,0);ctx.lineTo(x+w,y+h);ctx.closePath();}
function _leaf(ctx,len,w){ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(len*.5,-w,len,0);ctx.quadraticCurveTo(len*.5,w,0,0);ctx.closePath();}
function _hollyLeaf(ctx,len,w){const n=3;ctx.beginPath();ctx.moveTo(0,0);
  for(let i=1;i<=n;i++){const t=i/n,x0=len*(t-.5/n),x1=len*t;ctx.quadraticCurveTo(x0,-w*1.25*Math.sin(Math.PI*(t-.5/n))-w*.15,x1,-w*Math.sin(Math.PI*t)*.55);}
  for(let i=n-1;i>=0;i--){const t=i/n,x0=len*(t+.5/n),x1=len*t;ctx.quadraticCurveTo(x0,w*1.25*Math.sin(Math.PI*(t+.5/n))+w*.15,x1,w*Math.sin(Math.PI*t)*.55);}
  ctx.closePath();}
const MOTIFS={
  snowflake:{l:'Fiocco di neve',g:'inverno',d(ctx,c){ctx.strokeStyle=c;ctx.lineCap='round';ctx.lineWidth=.055;ctx.beginPath();
    for(let i=0;i<6;i++){const a=i*TAU/6,ca=Math.cos(a),sa=Math.sin(a);const P=(r,o)=>[ca*r-sa*o,sa*r+ca*o];
      ctx.moveTo(0,0);ctx.lineTo(...P(.46,0));
      for(const[r,l] of[[.2,.1],[.32,.08]]){ctx.moveTo(...P(r,0));ctx.lineTo(...P(r+l,l));ctx.moveTo(...P(r,0));ctx.lineTo(...P(r+l,-l));}}
    ctx.stroke();ctx.beginPath();ctx.arc(0,0,.05,0,TAU);ctx.fillStyle=c;ctx.fill();}},
  star:{l:'Stella',g:'base',d(ctx,c){_star(ctx,5,.5,.21,0,.04);ctx.fillStyle=c;ctx.fill();}},
  sparkle:{l:'Scintilla',g:'base',d(ctx,c){ctx.beginPath();ctx.moveTo(0,-.5);ctx.quadraticCurveTo(.06,-.06,.5,0);ctx.quadraticCurveTo(.06,.06,0,.5);ctx.quadraticCurveTo(-.06,.06,-.5,0);ctx.quadraticCurveTo(-.06,-.06,0,-.5);ctx.fillStyle=c;ctx.fill();}},
  heart:{l:'Cuore',g:'amore',d(ctx,c){heartPath(ctx,-.5,-.5,1,1);ctx.fillStyle=c;ctx.fill();}},
  heartLine:{l:'Cuore (contorno)',g:'amore',d(ctx,c){heartPath(ctx,-.44,-.44,.88,.88);ctx.strokeStyle=c;ctx.lineWidth=.06;ctx.lineJoin='round';ctx.stroke();}},
  holly:{l:'Agrifoglio',g:'natale',d(ctx,c,c2){ctx.fillStyle=c;
    ctx.save();ctx.translate(-.02,.02);ctx.rotate(-2.75);_hollyLeaf(ctx,.5,.2);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(.02,.02);ctx.rotate(-.39);_hollyLeaf(ctx,.5,.2);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(0,.02);ctx.rotate(1.57);_hollyLeaf(ctx,.4,.16);ctx.fill();ctx.restore();
    ctx.fillStyle=c2||'#C62828';for(const[x,y] of[[-.08,-.03],[.08,-.04],[0,-.14]]){ctx.beginPath();ctx.arc(x,y,.09,0,TAU);ctx.fill();}
    ctx.fillStyle='rgba(255,255,255,.45)';for(const[x,y] of[[-.09,-.05],[.05,-.06],[-.02,-.16]]){ctx.beginPath();ctx.arc(x,y,.02,0,TAU);ctx.fill();}}},
  bauble:{l:'Pallina',g:'natale',d(ctx,c,c2){ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,.1,.36,0,TAU);ctx.fill();
    ctx.fillStyle=c2||'#E0B54A';ctx.fillRect(-.1,-.34,.2,.1);ctx.strokeStyle=c2||'#E0B54A';ctx.lineWidth=.035;ctx.beginPath();ctx.arc(0,-.4,.06,0,TAU);ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(0,.1,.36,0,TAU);ctx.clip();ctx.fillStyle=c2||'#E0B54A';ctx.globalAlpha*=.9;
    ctx.beginPath();ctx.moveTo(-.4,.04);for(let i=0;i<=8;i++)ctx.lineTo(-.4+i*.1,i%2?.0:.08);ctx.lineTo(.4,.14);for(let i=8;i>=0;i--)ctx.lineTo(-.4+i*.1,i%2?.1:.18);ctx.closePath();ctx.fill();ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-.13,-.04,.06,.1,-.6,0,TAU);ctx.fill();}},
  tree:{l:'Albero',g:'natale',d(ctx,c,c2){ctx.fillStyle=c;
    _poly(ctx,[[0,-.36],[.2,-.08],[.1,-.08],[.28,.16],[.14,.16],[.36,.38],[-.36,.38],[-.14,.16],[-.28,.16],[-.1,-.08],[-.2,-.08]]);ctx.fill();
    ctx.fillRect(-.05,.38,.1,.1);ctx.fillStyle=c2||'#E0B54A';_star(ctx,5,.11,.045,0,-.38);ctx.fill();}},
  gift:{l:'Regalo',g:'natale',d(ctx,c,c2){const k=c2||'#E0B54A';ctx.fillStyle=c;ctx.fillRect(-.36,-.12,.72,.5);ctx.fillRect(-.4,-.24,.8,.14);
    ctx.fillStyle=k;ctx.fillRect(-.06,-.24,.12,.62);
    ctx.beginPath();ctx.ellipse(-.13,-.31,.14,.08,.5,0,TAU);ctx.ellipse(.13,-.31,.14,.08,-.5,0,TAU);ctx.fill();}},
  bell:{l:'Campanella',g:'natale',d(ctx,c,c2){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-.34,.24);ctx.quadraticCurveTo(-.24,.16,-.24,-.04);ctx.quadraticCurveTo(-.22,-.34,0,-.36);ctx.quadraticCurveTo(.22,-.34,.24,-.04);ctx.quadraticCurveTo(.24,.16,.34,.24);ctx.closePath();ctx.fill();
    ctx.fillStyle=c2||c;ctx.beginPath();ctx.arc(0,.31,.07,0,TAU);ctx.fill();ctx.fillRect(-.03,-.45,.06,.1);}},
  candy:{l:'Bastoncino',g:'natale',d(ctx,c,c2){ctx.lineCap='round';ctx.lineWidth=.13;ctx.strokeStyle=c2||'#ffffff';ctx.beginPath();ctx.moveTo(.06,.46);ctx.lineTo(.06,-.2);ctx.arc(-.08,-.2,.14,0,Math.PI,true);ctx.stroke();
    ctx.save();ctx.setLineDash([.07,.07]);ctx.strokeStyle=c;ctx.stroke();ctx.restore();}},
  balloon:{l:'Palloncino',g:'festa',d(ctx,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(0,-.12,.27,.33,0,0,TAU);ctx.fill();_poly(ctx,[[0,.19],[-.05,.26],[.05,.26]]);ctx.fill();
    ctx.strokeStyle=c;ctx.lineWidth=.02;ctx.beginPath();ctx.moveTo(0,.26);ctx.bezierCurveTo(-.08,.33,.08,.4,0,.5);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(-.1,-.24,.05,.09,-.4,0,TAU);ctx.fill();}},
  confetti:{l:'Coriandoli',g:'festa',d(ctx,c,c2){const P=[[-.3,-.3,.1,0],[.2,-.35,.08,1],[.35,.05,.09,0],[-.05,.0,.07,1],[-.35,.25,.08,1],[.1,.32,.1,0],[-.12,-.12,.06,0],[.28,-.12,.05,1]];
    P.forEach(([x,y,s,k],i)=>{ctx.fillStyle=i%2?(c2||c):c;ctx.save();ctx.translate(x,y);ctx.rotate(i*1.3);if(k)ctx.fillRect(-s/2,-s/4,s,s/2);else{ctx.beginPath();ctx.arc(0,0,s/2,0,TAU);ctx.fill();}ctx.restore();});}},
  partyhat:{l:'Cappellino',g:'festa',d(ctx,c,c2){ctx.fillStyle=c;_poly(ctx,[[0,-.38],[.26,.36],[-.26,.36]]);ctx.fill();
    ctx.save();_poly(ctx,[[0,-.38],[.26,.36],[-.26,.36]]);ctx.clip();ctx.fillStyle=c2||'#fff';for(let i=0;i<4;i++){ctx.save();ctx.translate(0,-.2+i*.17);ctx.rotate(-.25);ctx.fillRect(-.4,-.025,.8,.05);ctx.restore();}ctx.restore();
    ctx.fillStyle=c2||'#fff';ctx.beginPath();ctx.arc(0,-.4,.07,0,TAU);ctx.fill();}},
  rings:{l:'Fedi',g:'nozze',d(ctx,c,c2){ctx.strokeStyle=c;ctx.lineWidth=.06;ctx.beginPath();ctx.arc(-.12,.08,.24,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(.14,.08,.24,0,TAU);ctx.stroke();
    ctx.fillStyle=c2||c;_poly(ctx,[[-.12,-.3],[-.04,-.22],[-.12,-.12],[-.2,-.22]]);ctx.fill();}},
  leaf:{l:'Foglia',g:'natura',d(ctx,c){ctx.save();ctx.rotate(-Math.PI/4);ctx.translate(-.45,0);_leaf(ctx,.9,.3);ctx.fillStyle=c;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.02;ctx.beginPath();ctx.moveTo(.05,0);ctx.lineTo(.8,0);ctx.stroke();ctx.restore();}},
  branch:{l:'Rametto',g:'natura',d(ctx,c){ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=.025;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-.48,.12);ctx.quadraticCurveTo(0,-.08,.48,-.02);ctx.stroke();
    for(let i=0;i<7;i++){const t=.12+i*.13,u=1-t,x=-.48+t*.96,y=u*u*.12+2*u*t*-.08+t*t*-.02;ctx.save();ctx.translate(x,y);ctx.rotate(-.2+(i%2?-.95:.95));_leaf(ctx,.2,.07);ctx.fill();ctx.restore();}
    ctx.save();ctx.translate(.46,-.02);ctx.rotate(-.2);_leaf(ctx,.14,.05);ctx.fill();ctx.restore();}},
  laurel:{l:'Alloro',g:'natura',d(ctx,c){ctx.fillStyle=c;ctx.strokeStyle=c;ctx.lineWidth=.022;
    for(const sg of[-1,1]){ctx.save();ctx.scale(sg,1);ctx.beginPath();ctx.arc(0,0,.36,Math.PI*.55,Math.PI*1.38);ctx.stroke();
      for(let i=0;i<7;i++){const a=Math.PI*.6+i*Math.PI*.11,x=Math.cos(a)*.36,y=Math.sin(a)*.36;ctx.save();ctx.translate(x,y);ctx.rotate(a+Math.PI*.5+.5);_leaf(ctx,.16,.06);ctx.fill();ctx.restore();
        ctx.save();ctx.translate(x,y);ctx.rotate(a-Math.PI*.5+2.4);_leaf(ctx,.13,.05);ctx.fill();ctx.restore();}ctx.restore();}}},
  flower:{l:'Fiore',g:'natura',d(ctx,c,c2){ctx.fillStyle=c;for(let i=0;i<5;i++){ctx.save();ctx.rotate(i*TAU/5);ctx.beginPath();ctx.ellipse(0,-.24,.15,.24,0,0,TAU);ctx.fill();ctx.restore();}
    ctx.fillStyle=c2||'#F2C14E';ctx.beginPath();ctx.arc(0,0,.12,0,TAU);ctx.fill();}},
  daisy:{l:'Margherita',g:'natura',d(ctx,c,c2){ctx.fillStyle=c;for(let i=0;i<12;i++){ctx.save();ctx.rotate(i*TAU/12);ctx.beginPath();ctx.ellipse(0,-.27,.06,.2,0,0,TAU);ctx.fill();ctx.restore();}
    ctx.fillStyle=c2||'#F2C14E';ctx.beginPath();ctx.arc(0,0,.11,0,TAU);ctx.fill();}},
  tulip:{l:'Tulipano',g:'natura',d(ctx,c,c2){const g=c2||'#5E8C61';ctx.strokeStyle=g;ctx.lineWidth=.04;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-.05);ctx.lineTo(0,.48);ctx.stroke();
    ctx.fillStyle=g;ctx.save();ctx.translate(0,.4);ctx.rotate(-2.2);_leaf(ctx,.32,.1);ctx.fill();ctx.restore();
    ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-.2,-.32);ctx.lineTo(-.1,-.2);ctx.lineTo(0,-.36);ctx.lineTo(.1,-.2);ctx.lineTo(.2,-.32);ctx.quadraticCurveTo(.24,.0,0,.02);ctx.quadraticCurveTo(-.24,0,-.2,-.32);ctx.closePath();ctx.fill();}},
  butterfly:{l:'Farfalla',g:'natura',d(ctx,c,c2){ctx.fillStyle=c;for(const s of[-1,1]){ctx.beginPath();ctx.ellipse(s*.2,-.12,.2,.25,s*.5,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(s*.15,.18,.13,.17,-s*.4,0,TAU);ctx.fill();}
    ctx.fillStyle=c2||'#333';ctx.beginPath();ctx.ellipse(0,0,.035,.25,0,0,TAU);ctx.fill();ctx.strokeStyle=c2||'#333';ctx.lineWidth=.018;ctx.beginPath();ctx.moveTo(0,-.24);ctx.quadraticCurveTo(-.05,-.36,-.12,-.4);ctx.moveTo(0,-.24);ctx.quadraticCurveTo(.05,-.36,.12,-.4);ctx.stroke();}},
  tie:{l:'Cravatta',g:'papa',d(ctx,c,c2){ctx.fillStyle=c;_poly(ctx,[[-.1,-.46],[.1,-.46],[.13,-.36],[0,-.27],[-.13,-.36]]);ctx.fill();
    _poly(ctx,[[-.07,-.27],[.07,-.27],[.18,.3],[0,.48],[-.18,.3]]);ctx.fill();
    ctx.save();_poly(ctx,[[-.07,-.27],[.07,-.27],[.18,.3],[0,.48],[-.18,.3]]);ctx.clip();ctx.fillStyle=c2||'rgba(255,255,255,.35)';
    for(let i=0;i<6;i++){ctx.save();ctx.translate(0,-.2+i*.13);ctx.rotate(-.6);ctx.fillRect(-.3,-.02,.6,.04);ctx.restore();}ctx.restore();}},
  mustache:{l:'Baffi',g:'papa',d(ctx,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,-.06);
    ctx.bezierCurveTo(.08,-.16,.22,-.14,.3,-.04);ctx.bezierCurveTo(.36,.04,.44,.04,.48,-.06);ctx.bezierCurveTo(.48,.08,.38,.16,.26,.12);ctx.bezierCurveTo(.14,.1,.06,.04,0,.02);
    ctx.bezierCurveTo(-.06,.04,-.14,.1,-.26,.12);ctx.bezierCurveTo(-.38,.16,-.48,.08,-.48,-.06);ctx.bezierCurveTo(-.44,.04,-.36,.04,-.3,-.04);ctx.bezierCurveTo(-.22,-.14,-.08,-.16,0,-.06);ctx.closePath();ctx.fill();}},
  bowtie:{l:'Papillon',g:'papa',d(ctx,c,c2){ctx.fillStyle=c;_poly(ctx,[[-.45,-.22],[-.06,-.06],[-.06,.06],[-.45,.22]]);ctx.fill();_poly(ctx,[[.45,-.22],[.06,-.06],[.06,.06],[.45,.22]]);ctx.fill();
    ctx.fillStyle=c2||c;ctx.fillRect(-.08,-.1,.16,.2);}},
  anchor:{l:'Ancora',g:'mare',d(ctx,c){ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=.06;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-.38,.07,0,TAU);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-.31);ctx.lineTo(0,.42);ctx.moveTo(-.18,-.16);ctx.lineTo(.18,-.16);ctx.stroke();
    ctx.beginPath();ctx.arc(0,.08,.34,Math.PI*.15,Math.PI*.85);ctx.stroke();
    _poly(ctx,[[.36,.08],[.24,.2],[.4,.26]]);ctx.fill();_poly(ctx,[[-.36,.08],[-.24,.2],[-.4,.26]]);ctx.fill();}},
  sun:{l:'Sole',g:'estate',d(ctx,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,.22,0,TAU);ctx.fill();for(let i=0;i<12;i++){ctx.save();ctx.rotate(i*TAU/12);_poly(ctx,[[-.04,-.3],[.04,-.3],[0,-.48]]);ctx.fill();ctx.restore();}}},
  wave:{l:'Onde',g:'estate',d(ctx,c){ctx.strokeStyle=c;ctx.lineWidth=.06;ctx.lineCap='round';for(let k=0;k<3;k++){ctx.beginPath();const y=-.22+k*.22;ctx.moveTo(-.46,y);
    for(let i=0;i<4;i++){const x=-.46+i*.23;ctx.quadraticCurveTo(x+.06,y-.09,x+.115,y);ctx.quadraticCurveTo(x+.17,y+.09,x+.23,y);}ctx.stroke();}}},
  palm:{l:'Palma',g:'estate',d(ctx,c){ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=.05;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(.06,.48);ctx.quadraticCurveTo(.1,.1,-.02,-.18);ctx.stroke();
    for(const a of[-2.7,-2.1,-1.5,-.9,-.35]){ctx.save();ctx.translate(-.02,-.2);ctx.rotate(a);_leaf(ctx,.36,.09);ctx.fill();ctx.restore();}}},
  shell:{l:'Conchiglia',g:'estate',d(ctx,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,.36);ctx.lineTo(-.38,-.02);ctx.quadraticCurveTo(-.3,-.38,0,-.4);ctx.quadraticCurveTo(.3,-.38,.38,-.02);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=.025;ctx.beginPath();for(let i=-3;i<=3;i++){ctx.moveTo(0,.34);ctx.lineTo(i*.11,-.34+Math.abs(i)*.06);}ctx.stroke();}},
  plane:{l:'Aereo di carta',g:'viaggio',d(ctx,c,c2){ctx.fillStyle=c;_poly(ctx,[[-.46,-.02],[.46,-.3],[-.1,.12]]);ctx.fill();ctx.fillStyle=c2||rgba(c,.6);_poly(ctx,[[-.1,.12],[.46,-.3],[.0,.3]]);ctx.fill();}},
  egg:{l:'Uovo',g:'pasqua',d(ctx,c,c2){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,-.44);ctx.bezierCurveTo(.26,-.44,.34,.04,.32,.14);ctx.bezierCurveTo(.3,.36,.16,.44,0,.44);ctx.bezierCurveTo(-.16,.44,-.3,.36,-.32,.14);ctx.bezierCurveTo(-.34,.04,-.26,-.44,0,-.44);ctx.closePath();ctx.fill();
    ctx.save();ctx.clip();ctx.strokeStyle=c2||'#fff';ctx.lineWidth=.05;ctx.beginPath();ctx.moveTo(-.4,.02);for(let i=0;i<=8;i++)ctx.lineTo(-.4+i*.1,i%2?-.06:.04);ctx.stroke();
    ctx.fillStyle=c2||'#fff';for(const[x,y] of[[-.12,.2],[.1,.24],[0,-.2]]){ctx.beginPath();ctx.arc(x,y,.04,0,TAU);ctx.fill();}ctx.restore();}},
  bunny:{l:'Coniglietto',g:'pasqua',d(ctx,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(-.1,-.24,.07,.22,-.15,0,TAU);ctx.fill();ctx.beginPath();ctx.ellipse(.1,-.24,.07,.22,.15,0,TAU);ctx.fill();
    ctx.beginPath();ctx.arc(0,.12,.2,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(0,.38,.07,0,TAU);ctx.fill();}},
  cap:{l:'Tocco',g:'laurea',d(ctx,c,c2){ctx.fillStyle=c;_poly(ctx,[[0,-.32],[.48,-.12],[0,.08],[-.48,-.12]]);ctx.fill();
    ctx.beginPath();ctx.moveTo(-.26,-.02);ctx.lineTo(-.26,.18);ctx.quadraticCurveTo(0,.3,.26,.18);ctx.lineTo(.26,-.02);ctx.lineTo(0,.08);ctx.closePath();ctx.fill();
    ctx.strokeStyle=c2||'#E0B54A';ctx.lineWidth=.025;ctx.beginPath();ctx.moveTo(0,-.12);ctx.lineTo(.36,-.04);ctx.lineTo(.36,.22);ctx.stroke();ctx.fillStyle=c2||'#E0B54A';ctx.fillRect(.33,.2,.06,.12);}},
  moon:{l:'Luna',g:'notte',d(ctx,c){ctx.save();ctx.beginPath();ctx.arc(0,0,.4,0,TAU);ctx.clip();ctx.beginPath();ctx.rect(-.5,-.5,1,1);ctx.arc(.17,-.1,.33,0,TAU);ctx.fillStyle=c;ctx.fill('evenodd');ctx.restore();}},
  cloud:{l:'Nuvola',g:'notte',d(ctx,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(-.2,.06,.17,0,TAU);ctx.arc(.02,-.06,.24,0,TAU);ctx.arc(.24,.06,.17,0,TAU);ctx.fill();ctx.fillRect(-.2,.06,.44,.17);}},
  dot:{l:'Pallino',g:'base',d(ctx,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,.5,0,TAU);ctx.fill();}},
  circle:{l:'Cerchio',g:'base',d(ctx,c){ctx.strokeStyle=c;ctx.lineWidth=.08;ctx.beginPath();ctx.arc(0,0,.44,0,TAU);ctx.stroke();}},
  diamond:{l:'Rombo',g:'base',d(ctx,c){ctx.fillStyle=c;_poly(ctx,[[0,-.5],[.32,0],[0,.5],[-.32,0]]);ctx.fill();}},
  flourish:{l:'Fregio',g:'elegante',d(ctx,c){ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=.022;ctx.lineCap='round';ctx.beginPath();
    ctx.moveTo(-.5,0);ctx.bezierCurveTo(-.35,0,-.3,-.12,-.18,-.1);ctx.bezierCurveTo(-.08,-.08,-.1,.06,-.18,.04);ctx.bezierCurveTo(-.24,.02,-.2,-.04,-.15,-.03);
    ctx.moveTo(.5,0);ctx.bezierCurveTo(.35,0,.3,-.12,.18,-.1);ctx.bezierCurveTo(.08,-.08,.1,.06,.18,.04);ctx.bezierCurveTo(.24,.02,.2,-.04,.15,-.03);
    ctx.moveTo(-.5,0);ctx.lineTo(-.06,0);ctx.moveTo(.06,0);ctx.lineTo(.5,0);ctx.stroke();_poly(ctx,[[0,-.06],[.05,0],[0,.06],[-.05,0]]);ctx.fill();}},
  rule:{l:'Filetto',g:'elegante',d(ctx,c){ctx.fillStyle=c;ctx.fillRect(-.5,-.012,1,.024);}},
  paw:{l:'Zampa',g:'base',d(ctx,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(0,.14,.2,.17,0,0,TAU);ctx.fill();for(const[x,y,r] of[[-.26,-.08,.08],[-.1,-.26,.085],[.1,-.26,.085],[.26,-.08,.08]]){ctx.beginPath();ctx.ellipse(x,y,r,r*1.25,x*.8,0,TAU);ctx.fill();}}},
  pumpkin:{l:'Zucca',g:'autunno',d(ctx,c,c2){ctx.fillStyle=c;for(const[x,rx] of[[-.18,.18],[.18,.18],[0,.2]]){ctx.beginPath();ctx.ellipse(x,.08,rx,.3,0,0,TAU);ctx.fill();}
    ctx.fillStyle=c2||'#4E6B3A';ctx.fillRect(-.03,-.32,.06,.12);}},
};
const MOTIF_IDS=Object.keys(MOTIFS);
function drawMotif(ctx,id,x,y,size,rot,c,c2,op=1,flip=false){
  const m=MOTIFS[id];if(!m)return;
  ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot*Math.PI/180);ctx.scale(flip?-size:size,size);ctx.globalAlpha*=op;
  try{m.d(ctx,c,c2);}catch(e){}
  ctx.restore();
}

/* ============ motivi di sfondo (pattern) ============ */
const PATTERNS={
  none:{l:'Nessuno'},
  scatter:{l:'Sparsi'},
  grid:{l:'A griglia'},
  dots:{l:'Pois'},
  stripes:{l:'Righe'},
  diag:{l:'Righe diagonali'},
  plaid:{l:'Scozzese'},
  frame:{l:'Cornice di motivi'},
};
/* disegna un pattern sul rettangolo (mm) già scalato: s = px per mm */
function drawPattern(ctx,P,box,s,seed){
  if(!P||P.type==='none')return;
  const R=rng(seed||1),cols=P.colors&&P.colors.length?P.colors:['#000'],mot=P.motifs&&P.motifs.length?P.motifs:['dot'];
  const size=(P.size||10)*s,gap=(P.gap||(P.size||10)*2.2)*s,op=P.op==null?1:P.op;
  const X=box.x*s,Y=box.y*s,W=box.w*s,H=box.h*s;
  ctx.save();ctx.beginPath();ctx.rect(X,Y,W,H);ctx.clip();
  const c2=P.c2||null;
  if(P.type==='stripes'||P.type==='diag'){
    ctx.globalAlpha*=op;ctx.fillStyle=cols[0];const w=size*.5;
    ctx.translate(X+W/2,Y+H/2);if(P.type==='diag')ctx.rotate(-Math.PI/4);const L=Math.hypot(W,H);
    let i=0;for(let x=-L/2;x<L/2;x+=gap){ctx.fillStyle=cols[i++%cols.length];ctx.fillRect(x,-L/2,w,L);}
  }else if(P.type==='plaid'){
    ctx.globalAlpha*=op;const g=gap,c=cols;
    for(let k=0;k<2;k++){ctx.save();if(k){ctx.translate(X,Y);ctx.rotate(Math.PI/2);ctx.translate(-X,-Y-W);}
      const L=k?W:H,Wd=k?H:W;
      for(let x=0;x<Wd+g;x+=g){ctx.globalAlpha=op*.55;ctx.fillStyle=c[0];ctx.fillRect((k?X:X)+x,(k?Y:Y),g*.34,L*2+g);
        ctx.globalAlpha=op*.5;ctx.fillStyle=c[1%c.length];ctx.fillRect(X+x+g*.5,Y,g*.06,L*2+g);ctx.fillRect(X+x+g*.62,Y,g*.06,L*2+g);}
      ctx.restore();}
  }else if(P.type==='dots'){
    let row=0;for(let y=Y-gap;y<Y+H+gap;y+=gap*.866){const off=(row++%2)*gap/2;for(let x=X-gap+off;x<X+W+gap;x+=gap){
      drawMotif(ctx,mot[0]==='dot'?'dot':mot[0],x,y,size,0,cols[0],c2,op);}}
  }else if(P.type==='grid'){
    let row=0;for(let y=Y-gap/2;y<Y+H+gap;y+=gap){const off=(row%2)*gap/2;let k=row;for(let x=X-gap+off;x<X+W+gap;x+=gap){
      const m=mot[(k++)%mot.length];drawMotif(ctx,m,x,y,size,P.rot?((k*37)%60-30):0,cols[k%cols.length],c2,op);}row++;}
  }else if(P.type==='frame'){
    const step=gap,band=P.band||size*1.2;let k=0;
    const put=(x,y)=>{const m=mot[k%mot.length];drawMotif(ctx,m,x,y,size*(.8+R()*.4),P.rot?(R()*60-30):0,cols[k%cols.length],c2,op);k++;};
    for(let x=X+band;x<X+W-band/2;x+=step){put(x,Y+band);put(x,Y+H-band);}
    for(let y=Y+band+step;y<Y+H-band-step/2;y+=step){put(X+band,y);put(X+W-band,y);}
  }else{/* scatter: griglia con jitter */
    let k=0;for(let y=Y-gap;y<Y+H+gap;y+=gap*.9){for(let x=X-gap;x<X+W+gap;x+=gap){
      const jx=(R()-.5)*gap*.8,jy=(R()-.5)*gap*.8,sc=.6+R()*.7,m=mot[Math.floor(R()*mot.length)],c=cols[Math.floor(R()*cols.length)];
      drawMotif(ctx,m,x+jx,y+jy,size*sc,P.rot===false?0:(R()*80-40),c,c2,op);k++;}}
  }
  ctx.restore();
}
