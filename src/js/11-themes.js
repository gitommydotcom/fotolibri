/* ============ temi ============
   Un tema definisce colori, caratteri, stile di copertina, motivi di sfondo per copertina e risguardi
   e le decorazioni. Tutto quello che il tema produce resta modificabile nel libro. */
const FONTS_WEB=['Playfair Display','Cormorant Garamond','DM Serif Display','Lora','Montserrat','Josefin Sans','Oswald','Bebas Neue','Roboto Slab',
  'Great Vibes','Dancing Script','Caveat','Pacifico','Amatic SC','Fredoka','Mountains of Christmas'];
const FONTS_SYS=['Georgia','Times New Roman','Garamond','Arial','Segoe UI','Calibri','Verdana','Trebuchet MS','Courier New'];
const PAT=(type,motifs,colors,size,gap,op,extra)=>({type,motifs,colors,size,gap,op,...(extra||{})});
const COVER_LAYOUTS=[
  ['full','Foto a tutta pagina','La foto copre tutta la copertina, titolo sovrapposto'],
  ['framed','Foto incorniciata','Foto con margine sul colore del tema, titolo sotto'],
  ['arch','Finestra ad arco','Foto in un arco, elegante'],
  ['circle','Finestra rotonda','Foto in un cerchio'],
  ['heart','Finestra a cuore','Foto in un cuore'],
  ['collage','Collage di 3 foto','Tre foto in fila e titolo'],
  ['type','Solo titolo','Copertina tipografica senza foto'],
];
const THEMES=[
  {id:'neutro',name:'Neutro bianco',group:'Neutri',desc:'Pulito e senza decorazioni: va bene per tutto',
    colors:{paper:'#FFFFFF',ink:'#222222',title:'#222222',accent:'#222222',accent2:'#888888',cover:'#FFFFFF',coverInk:'#1D1D1D',endpaper:'#FFFFFF',endInk:'#222222'},
    fonts:{title:'Playfair Display',sub:'Montserrat'},titleItalic:true,coverLayout:'full',motifs:[],
    texts:{title:'I nostri ricordi',sub:'{anno}'}},
  {id:'avorio',name:'Avorio elegante',group:'Neutri',desc:'Carta avorio, serif raffinato, fregi sottili',
    colors:{paper:'#F8F4EC',ink:'#3A332B',title:'#3A332B',accent:'#A88B5A',accent2:'#CDBB98',cover:'#EFE7DA',coverInk:'#3A332B',endpaper:'#E9DFCC',endInk:'#3A332B'},
    fonts:{title:'Cormorant Garamond',sub:'Montserrat'},titleItalic:true,subUpper:true,coverLayout:'framed',ornament:'flourish',motifs:['flourish'],
    endPattern:PAT('grid',['diamond'],['#CDBB98'],2.2,12,.55),
    frame:{borderW:0,shadow:0,radius:0},texts:{title:'I nostri ricordi',sub:'{anno}'}},
  {id:'galleria',name:'Nero galleria',group:'Neutri',desc:'Fondo nero, le foto risaltano come in mostra',
    colors:{paper:'#151515',ink:'#E8E8E8',title:'#FFFFFF',accent:'#BDBDBD',accent2:'#777777',cover:'#111111',coverInk:'#FFFFFF',endpaper:'#111111',endInk:'#FFFFFF'},
    fonts:{title:'Josefin Sans',sub:'Josefin Sans'},titleUpper:true,titleLs:22,subUpper:true,coverLayout:'framed',ornament:'rule',motifs:['rule'],
    texts:{title:'Ricordi',sub:'{anno}'}},
  {id:'natale',name:'Natale',group:'Feste',desc:'Rosso e verde, agrifoglio, fiocchi e stelle dorate',
    colors:{paper:'#FBF6EE',ink:'#3B2A23',title:'#A4161A',accent:'#A4161A',accent2:'#C9A227',green:'#1E5631',cover:'#9E1B1F',coverInk:'#FFF4DE',endpaper:'#1E4D2B',endInk:'#FFF4DE'},
    fonts:{title:'Great Vibes',sub:'Cormorant Garamond'},subUpper:true,coverLayout:'framed',ornament:'holly',
    motifs:['holly','snowflake','star','bauble'],motifColors:['#1E5631','#A4161A','#C9A227'],c2:'#C62828',
    coverPattern:PAT('scatter',['snowflake','star','sparkle'],['#FFFFFF','#F2D27A'],7,24,.22),
    endPattern:PAT('scatter',['snowflake','star','holly','sparkle'],['#F2D27A','#FFFFFF','#9FC59A'],10,30,.5,{c2:'#E04545'}),
    pagePattern:PAT('scatter',['snowflake','sparkle'],['#A4161A','#1E5631'],5,34,.07),
    frame:{borderW:0,shadow:0,radius:0},texts:{title:'Buon Natale',sub:'Natale {anno}'}},
  {id:'nordico',name:'Natale nordico',group:'Feste',desc:'Azzurro e bianco, fiocchi di neve e abeti',
    colors:{paper:'#FFFFFF',ink:'#26374A',title:'#26374A',accent:'#4F7CAC',accent2:'#B9CFE3',cover:'#DCE7F0',coverInk:'#1F3346',endpaper:'#26374A',endInk:'#FFFFFF'},
    fonts:{title:'Amatic SC',sub:'Josefin Sans'},titleBold:true,titleLs:6,subUpper:true,coverLayout:'circle',ornament:'snowflake',
    motifs:['snowflake','tree','star'],motifColors:['#4F7CAC','#26374A','#9DB8D3'],
    coverPattern:PAT('scatter',['snowflake'],['#FFFFFF','#B9CFE3'],9,26,.8),
    endPattern:PAT('grid',['snowflake','tree','star'],['#FFFFFF','#9DB8D3'],9,24,.55,{c2:'#FFFFFF'}),
    pagePattern:PAT('scatter',['snowflake'],['#4F7CAC'],5,34,.07),
    texts:{title:'Inverno',sub:'Natale {anno}'}},
  {id:'valentino',name:'San Valentino',group:'Feste',desc:'Cuori rossi e rosa, foto a forma di cuore',
    colors:{paper:'#FFF6F6',ink:'#5A2230',title:'#C2185B',accent:'#E04366',accent2:'#F6A5B8',cover:'#B5152B',coverInk:'#FFF0F3',endpaper:'#F9D3DB',endInk:'#8E1430'},
    fonts:{title:'Great Vibes',sub:'Montserrat'},subUpper:true,coverLayout:'heart',ornament:'heart',
    motifs:['heart','heartLine','sparkle'],motifColors:['#E04366','#C2185B','#F6A5B8'],
    coverPattern:PAT('scatter',['heart','heartLine'],['#F06A86','#FFFFFF'],8,24,.28),
    endPattern:PAT('scatter',['heart','heartLine','sparkle'],['#E04366','#FFFFFF','#C2185B'],10,26,.6),
    pagePattern:PAT('scatter',['heart'],['#E04366'],4.5,32,.08),
    frame:{borderW:0,shadow:0,radius:2},texts:{title:'Noi due',sub:'San Valentino {anno}'}},
  {id:'papa',name:'Festa del papà',group:'Feste',desc:'Blu notte e ocra, cravatte, baffi e stelle',
    colors:{paper:'#F5F1EA',ink:'#1F2A3A',title:'#1F3A5F',accent:'#D08C2E',accent2:'#8FA9C4',cover:'#1F3A5F',coverInk:'#F7E7C9',endpaper:'#1F3A5F',endInk:'#F7E7C9'},
    fonts:{title:'Bebas Neue',sub:'Caveat'},titleLs:10,coverLayout:'framed',ornament:'star',
    motifs:['tie','mustache','star','bowtie'],motifColors:['#D08C2E','#1F3A5F','#8FA9C4'],
    coverPattern:PAT('grid',['star'],['#D08C2E'],4,22,.3),
    endPattern:PAT('grid',['tie','mustache','star','bowtie'],['#D08C2E','#8FA9C4','#F7E7C9'],11,26,.55,{rot:true,c2:'#1F3A5F'}),
    pagePattern:PAT('grid',['star'],['#1F3A5F'],3,30,.07),
    frame:{borderW:0,shadow:1.2,radius:0},texts:{title:'Super papà',sub:'Festa del papà {anno}'}},
  {id:'mamma',name:'Festa della mamma',group:'Feste',desc:'Rosa cipria e salvia, fiori e farfalle',
    colors:{paper:'#FFF9F5',ink:'#5B3B45',title:'#B5536B',accent:'#E6A4B4',accent2:'#8AA67E',cover:'#F3D6DC',coverInk:'#6B3A4A',endpaper:'#E7EEE1',endInk:'#5B3B45'},
    fonts:{title:'Dancing Script',sub:'Lora'},titleBold:true,coverLayout:'arch',ornament:'flower',
    motifs:['flower','tulip','butterfly','daisy'],motifColors:['#E6A4B4','#B5536B','#8AA67E'],c2:'#F2C14E',
    coverPattern:PAT('scatter',['flower','daisy','leaf'],['#FFFFFF','#E6A4B4','#B9CDB0'],8,26,.55),
    endPattern:PAT('scatter',['flower','tulip','butterfly','leaf'],['#E6A4B4','#B5536B','#8AA67E'],11,30,.55,{c2:'#F7D58B'}),
    pagePattern:PAT('scatter',['flower'],['#E6A4B4'],5,34,.1),
    frame:{borderW:0,shadow:0,radius:3},texts:{title:'Per te, mamma',sub:'Festa della mamma {anno}'}},
  {id:'compleanno',name:'Compleanno',group:'Feste',desc:'Coriandoli, palloncini, colori allegri',
    colors:{paper:'#FFFFFF',ink:'#2B2D42',title:'#EF476F',accent:'#FFD166',accent2:'#06D6A0',blue:'#118AB2',cover:'#2B2D42',coverInk:'#FFFFFF',endpaper:'#FFF3D6',endInk:'#2B2D42'},
    fonts:{title:'Fredoka',sub:'Fredoka'},titleBold:true,coverLayout:'collage',ornament:'balloon',
    motifs:['balloon','confetti','partyhat','star'],motifColors:['#EF476F','#FFD166','#06D6A0','#118AB2'],c2:'#FFD166',
    coverPattern:PAT('scatter',['confetti','star','dot'],['#EF476F','#FFD166','#06D6A0','#118AB2'],6,20,.9,{c2:'#FFD166'}),
    endPattern:PAT('scatter',['confetti','balloon','star','dot'],['#EF476F','#FFD166','#06D6A0','#118AB2'],9,24,.75,{c2:'#06D6A0'}),
    pagePattern:PAT('scatter',['dot','confetti'],['#EF476F','#FFD166','#06D6A0','#118AB2'],2.5,26,.25),
    frame:{borderW:0,shadow:0,radius:4},texts:{title:'Buon compleanno!',sub:'{anno}'}},
  {id:'matrimonio',name:'Matrimonio',group:'Eventi',desc:'Avorio e oro, rametti e fedi',
    colors:{paper:'#FFFDF8',ink:'#4A4038',title:'#8C7351',accent:'#C2A878',accent2:'#9CAF88',cover:'#F4EEE4',coverInk:'#5A4A3A',endpaper:'#EDE6D8',endInk:'#5A4A3A'},
    fonts:{title:'Great Vibes',sub:'Cormorant Garamond'},subUpper:true,coverLayout:'arch',ornament:'branch',
    motifs:['branch','rings','leaf','flourish'],motifColors:['#9CAF88','#C2A878','#8C7351'],
    coverPattern:null,
    endPattern:PAT('scatter',['branch','leaf'],['#9CAF88','#C2A878'],14,32,.4),
    pagePattern:null,
    frame:{borderW:0,shadow:0,radius:0},texts:{title:'Il nostro matrimonio',sub:'{anno}'}},
  {id:'bimbo',name:'Nascita · azzurro',group:'Eventi',desc:'Nuvole, lune e stelline azzurre',
    colors:{paper:'#F7FBFE',ink:'#34495E',title:'#4A7FB0',accent:'#A9CDEB',accent2:'#F6D58E',cover:'#CFE4F5',coverInk:'#2C4A66',endpaper:'#E3F0FA',endInk:'#2C4A66'},
    fonts:{title:'Pacifico',sub:'Fredoka'},coverLayout:'circle',ornament:'star',
    motifs:['cloud','moon','star'],motifColors:['#FFFFFF','#F6D58E','#A9CDEB'],
    coverPattern:PAT('scatter',['star','cloud','moon'],['#FFFFFF','#F6D58E'],7,24,.75),
    endPattern:PAT('scatter',['cloud','moon','star'],['#FFFFFF','#A9CDEB','#F6D58E'],11,28,.85),
    pagePattern:PAT('scatter',['star'],['#A9CDEB'],4,32,.25),
    frame:{borderW:0,shadow:0,radius:4},texts:{title:'Benvenuto!',sub:'Il mio primo anno'}},
  {id:'bimba',name:'Nascita · rosa',group:'Eventi',desc:'Nuvole, cuori e stelline rosa',
    colors:{paper:'#FFF8FA',ink:'#5A3D4B',title:'#C9668A',accent:'#F4C0D1',accent2:'#F6D58E',cover:'#F8D9E3',coverInk:'#6A3B50',endpaper:'#FCE8EF',endInk:'#6A3B50'},
    fonts:{title:'Pacifico',sub:'Fredoka'},coverLayout:'circle',ornament:'heart',
    motifs:['cloud','heart','star'],motifColors:['#FFFFFF','#F4C0D1','#F6D58E'],
    coverPattern:PAT('scatter',['star','cloud','heart'],['#FFFFFF','#F6D58E'],7,24,.75),
    endPattern:PAT('scatter',['cloud','heart','star'],['#FFFFFF','#F4C0D1','#F6D58E'],11,28,.85),
    pagePattern:PAT('scatter',['heart'],['#F4C0D1'],4,32,.3),
    frame:{borderW:0,shadow:0,radius:4},texts:{title:'Benvenuta!',sub:'Il mio primo anno'}},
  {id:'estate',name:'Estate e viaggi',group:'Eventi',desc:'Sole, onde e conchiglie, per vacanze e viaggi',
    colors:{paper:'#FFFDF7',ink:'#1E3D4C',title:'#E07A5F',accent:'#3D9DB3',accent2:'#F2CC8F',cover:'#3D9DB3',coverInk:'#FFFFFF',endpaper:'#3D9DB3',endInk:'#FFF8E7'},
    fonts:{title:'Bebas Neue',sub:'Caveat'},titleLs:14,coverLayout:'full',ornament:'sun',
    motifs:['sun','wave','shell','palm','plane'],motifColors:['#E07A5F','#3D9DB3','#F2CC8F'],
    coverPattern:null,
    endPattern:PAT('grid',['sun','wave','shell','palm','plane'],['#FFF8E7','#F2CC8F'],11,26,.5,{rot:true}),
    pagePattern:null,
    texts:{title:'Estate {anno}',sub:'I nostri viaggi'}},
  {id:'pasqua',name:'Pasqua',group:'Feste',desc:'Colori pastello, uova, tulipani e coniglietti',
    colors:{paper:'#FFFDF5',ink:'#4B5D3A',title:'#7A9A5B',accent:'#F4C2C2',accent2:'#FFE29A',cover:'#E8F1DD',coverInk:'#4B5D3A',endpaper:'#FFF4D6',endInk:'#4B5D3A'},
    fonts:{title:'Dancing Script',sub:'Montserrat'},titleBold:true,subUpper:true,coverLayout:'arch',ornament:'tulip',
    motifs:['egg','tulip','bunny','flower'],motifColors:['#F4C2C2','#BFD7EA','#FFE29A','#B8D4A8'],c2:'#FFFFFF',
    coverPattern:PAT('scatter',['egg','flower'],['#F4C2C2','#BFD7EA','#FFE29A'],8,26,.6),
    endPattern:PAT('scatter',['egg','tulip','bunny','flower'],['#F4C2C2','#BFD7EA','#B8D4A8','#F2B880'],11,28,.7),
    pagePattern:PAT('scatter',['egg'],['#BFD7EA','#F4C2C2'],4.5,34,.18),
    frame:{borderW:0,shadow:0,radius:3},texts:{title:'Buona Pasqua',sub:'Pasqua {anno}'}},
  {id:'laurea',name:'Laurea',group:'Eventi',desc:'Rosso laurea e oro, alloro e tocco',
    colors:{paper:'#FFFFFF',ink:'#2A2A2A',title:'#9B1B30',accent:'#C9A227',accent2:'#E7D7A0',cover:'#9B1B30',coverInk:'#FFF5E1',endpaper:'#9B1B30',endInk:'#FFF5E1'},
    fonts:{title:'Playfair Display',sub:'Montserrat'},titleBold:true,subUpper:true,coverLayout:'framed',ornament:'laurel',
    motifs:['laurel','cap','star'],motifColors:['#C9A227','#9B1B30'],
    coverPattern:null,
    endPattern:PAT('grid',['laurel','cap'],['#C9A227'],12,28,.35,{c2:'#E7D7A0'}),
    pagePattern:null,
    frame:{borderW:0,shadow:0,radius:0},texts:{title:'La mia laurea',sub:'{anno}'}},
  {id:'autunno',name:'Autunno',group:'Eventi',desc:'Foglie, zucche e colori caldi',
    colors:{paper:'#FFF9F0',ink:'#4A2E1F',title:'#C0561E',accent:'#D9822B',accent2:'#7A8B3A',cover:'#5A3A28',coverInk:'#FBE9D0',endpaper:'#F3E1C7',endInk:'#4A2E1F'},
    fonts:{title:'Lora',sub:'Montserrat'},titleItalic:true,subUpper:true,coverLayout:'framed',ornament:'leaf',
    motifs:['leaf','pumpkin','branch'],motifColors:['#C0561E','#D9822B','#7A8B3A'],
    coverPattern:PAT('scatter',['leaf'],['#D9822B','#C0561E','#A3A84E'],9,26,.4),
    endPattern:PAT('scatter',['leaf','pumpkin','branch'],['#C0561E','#D9822B','#7A8B3A'],12,30,.55),
    pagePattern:null,texts:{title:'Autunno',sub:'{anno}'}},
];
const COVER_BGS=[['motivo','Motivo del tema'],['tinta','Tinta unita'],['chiaro','Chiaro'],['fitto','Motivo fitto'],['sfocata','Foto sfocata']];
const THEME_GROUPS=['Neutri','Feste','Eventi'];
function baseTheme(id){return THEMES.find(t=>t.id===id)||THEMES[0];}
/* tema effettivo = tema base + personalizzazioni del libro */
function resolveTheme(bt){
  bt=bt||BOOK.theme;const b=baseTheme(bt.id);
  const T={...b,colors:{...b.colors,...(bt.colors||{})},fonts:{...b.fonts,...(bt.fonts||{})}};
  T.deco=bt.deco==null?1:bt.deco;T.coverLayout=bt.coverLayout||b.coverLayout;T.coverBg=bt.coverBg||b.coverBg||'motivo';
  T.endPatternOn=bt.endPattern!==false;T.coverPatternOn=bt.coverPattern!==false;
  return T;
}
function bookYear(){const c=new Map();for(const e of LIB.values()){if(e.sample||e.date==null)continue;const y=new Date(e.date).getFullYear();c.set(y,(c.get(y)||0)+1);}
  let b=null,n=0;for(const[y,k] of c)if(k>n){b=y;n=k;}if(b)return b;for(const e of LIB.values())if(e.date!=null)return new Date(e.date).getFullYear();return new Date().getFullYear();}
function fillTpl(s,ctx={}){const y=ctx.year||bookYear();return String(s||'').replace(/\{anno\}/g,y);}
/* stile testi per ruolo */
function roleStyle(role,T,bg){
  const C=T.colors,ink=bg?(Math.abs(lum(bg)-lum(C.ink))<90?contrastInk(bg):C.ink):C.ink;
  const ttl=bg&&Math.abs(lum(bg)-lum(C.title))<70?contrastInk(bg):C.title;
  const base={font:T.fonts.title,italic:!!T.titleItalic,bold:!!T.titleBold,upper:!!T.titleUpper,ls:T.titleLs||0,shadow:false,boxOp:0,strokeW:0,op:100,lh:1.1};
  switch(role){
    case'cover-title':return{...base,color:bg&&Math.abs(lum(bg)-lum(C.coverInk))<80?C.title:C.coverInk};
    case'cover-sub':return{font:T.fonts.sub,italic:false,bold:false,upper:!!T.subUpper,ls:T.subUpper?24:4,color:bg&&Math.abs(lum(bg)-lum(C.coverInk))<80?C.ink:C.coverInk,shadow:false,op:90,lh:1.1};
    case'spine':return{font:T.fonts.sub,italic:false,bold:true,upper:true,ls:12,color:C.coverInk,shadow:false,op:100,lh:1};
    case'back':return{font:T.fonts.sub,italic:false,bold:false,upper:!!T.subUpper,ls:T.subUpper?18:2,color:C.coverInk,shadow:false,op:80,lh:1.2};
    case'chapter':return{...base,color:ttl};
    case'chapter-sub':return{font:T.fonts.sub,italic:false,bold:false,upper:true,ls:18,color:ink,shadow:false,op:75,lh:1.1};
    case'band':return{...base,color:ttl};
    case'overlay':return{...base,color:'#ffffff',shadow:true};
    case'dedica':return{...base,color:ttl,lh:1.25};
    case'caption':return{font:T.fonts.sub,italic:false,bold:false,upper:false,ls:2,color:ink,shadow:false,op:90,lh:1.2};
    case'end':return{...base,color:C.endInk};
    case'quote':return{...base,color:ttl,lh:1.25,italic:base.italic||!/Vibes|Script|Pacifico|Caveat|Amatic|Bebas/.test(T.fonts.title)};
    case'quote-author':return{font:T.fonts.sub,italic:false,bold:false,upper:true,ls:16,color:ink,shadow:false,op:70,lh:1.1};
  }
  return{color:ink};
}
