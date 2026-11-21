import { circle, ell, rect, path, poly, line, g, S, hi, hiE, shine, sh, shC, shE, heartD, starD, leafD, petals, bow, face, INK } from '../lib.mjs';
const GOLD = '#F2C14E', GOLD2 = '#C9922A', BLUSH = '#F6C1C7', BLUSH2 = '#E0909B', ROSE = '#E8899A', SAGE = '#9DB89A', SAGE2 = '#6E9070', IVORY = '#FFFBF3', IVORY2 = '#EADFCB',
  WHITE = '#FFFFFF', DIA = '#BDE6F5', DIA2 = '#7FC3DE', GLASS = '#E8F4F8', CHAMP = '#F7DE8D', BOT = '#3E6B4F', BOT2 = '#284A35', RED = '#D94A5C', RED2 = '#AA2E40', GREY2 = '#C9C3D3';
const rose = (cx, cy, r, c, c2) => [S(circle(cx, cy, r, c), shC(cx + r * .3, cy + r * .3, r * .9, c2, .5)),
  line(`M${cx},${cy - r * .35} C${cx - r * .5},${cy - r * .35} ${cx - r * .55},${cy + r * .25} ${cx - r * .05},${cy + r * .3} C${cx + r * .4},${cy + r * .32} ${cx + r * .45},${cy - r * .1} ${cx + r * .1},${cy - r * .12}`, c2, 2.6, { cut: false }),
  line(`M${cx - r * .75},${cy - r * .1} C${cx - r * .7},${cy + r * .55} ${cx + r * .1},${cy + r * .8} ${cx + r * .7},${cy + r * .35}`, c2, 2.4, { cut: false })];
const ring = (cx, cy, R, rot) => g(`rotate(${rot} ${cx} ${cy})`,
  S(path(`M${cx},${cy - R} A${R},${R} 0 1,1 ${cx - .1},${cy - R} Z M${cx},${cy - R + 13} A${R - 13},${R - 13} 0 1,0 ${cx + .1},${cy - R + 13} Z`, GOLD), sh(`M${cx},${cy - R + 6} A${R},${R} 0 1,1 ${cx - .1},${cy - R + 6} Z M${cx},${cy - R + 13} A${R - 13},${R - 13} 0 1,0 ${cx + .1},${cy - R + 13} Z`, GOLD2, .55)),
  shine(`M${cx - R * .72},${cy - R * .3} A${R - 6},${R - 6} 0 0,1 ${cx - R * .2},${cy - R * .86}`, 3.5, .8));
export default {
  folder: 'matrimonio', stickers: [
    { name: 'Fedi', draw: () => [ring(80, 116, 50, -14), ring(124, 104, 50, 14),
      S(path('M108,48 L120,34 L140,34 L152,48 L130,72 Z', DIA), sh('M130,34 L152,48 L130,72Z', DIA2, .6), sh('M108,48 L152,48 L130,72Z', WHITE, .35)),
      line('M108,48 L152,48 M120,34 L126,48 L130,72 L134,48 L140,34', DIA2, 2, { cut: false }),
      path(starD(160, 28, 10, 4, 4, 1.2), WHITE, { sw: 2.4 })] },
    { name: 'Torta nuziale', draw: () => [
      g('', path(heartD(100, 24, 26, 24), RED, { sw: 2.8 })), line('M100,36 L100,48', INK, 3),
      S(ell(100, 186, 80, 8, IVORY2)),
      S(rect(30, 136, 140, 48, 8, IVORY), sh('M140,132 H174 V188 H140Z', IVORY2, .8)), S(rect(46, 96, 108, 44, 8, IVORY), sh('M128,92 H158 V144 H128Z', IVORY2, .8)), S(rect(64, 56, 72, 44, 8, IVORY), sh('M116,52 H140 V104 H116Z', IVORY2, .8)),
      ...[[30, 136, 140], [46, 96, 108], [64, 56, 72]].map(([x, y, w]) => line(`M${x + 6},${y + 10} ${[...Array(Math.round(w / 12))].map((_, i) => `Q${x + 6 + i * 12 + 6},${y + 18} ${x + 6 + (i + 1) * 12},${y + 10}`).join(' ')}`, BLUSH2, 2.6, { cut: false })),
      ...[[42, 132], [158, 132], [58, 92], [142, 92]].map(([x, y]) => [...rose(x, y, 9, BLUSH, BLUSH2)]),
      ...[[70, 168], [100, 170], [130, 168], [84, 126], [116, 126], [100, 86]].map(([x, y]) => circle(x, y, 3.2, GOLD, { ink: false, cut: false }))] },
    { name: 'Colomba', draw: () => [
      line('M150,72 C160,90 170,100 186,104', SAGE2, 3.4),
      ...[[160, 84, 172, 72], [170, 96, 186, 88], [176, 102, 180, 118], [158, 92, 160, 106]].map(([a, b, c, d]) => S(path(leafD(a, b, c, d, 5), SAGE))),
      S(path('M110,86 C100,60 92,36 70,20 C68,38 64,48 56,56 C62,62 72,68 78,76 C68,78 60,82 54,88 C70,96 92,96 110,86Z', WHITE), sh('M54,88 C70,96 92,96 110,86 C106,76 100,70 94,66 C84,80 70,86 54,88Z', GREY2, .7)),
      line('M68,40 C78,52 88,64 98,80 M64,58 C76,66 86,72 100,84', GREY2, 2.2, { cut: false }),
      S(path('M150,64 C150,52 138,46 128,50 C118,54 114,66 112,76 C96,82 70,96 50,104 L22,98 C26,110 34,118 44,120 L30,134 C46,136 62,132 76,126 C106,128 134,112 142,88 C146,80 150,74 150,64Z', WHITE),
        sh('M30,134 C46,136 62,132 76,126 C106,128 134,112 142,88 C126,110 96,118 60,118 Z', GREY2, .7)),
      line('M44,120 C58,116 70,112 84,108', GREY2, 2.2, { cut: false }),
      poly([[149, 60], [164, 66], [148, 71]], GOLD, { sw: 2.6 }), circle(136, 60, 3.6, INK, { ink: false, cut: false }), circle(137, 59, 1.2, WHITE, { ink: false, cut: false }),
      ell(128, 72, 6, 3.5, BLUSH, { ink: false, cut: false, op: .9 }),
      g('', path(heartD(44, 48, 34, 32), RED, { sw: 3 })), hiE(37, 42, 2.5, 5, 30, .7)] },
    { name: 'Bouquet', draw: () => [
      ...[[40, 70, 20, 30], [160, 70, 180, 30], [70, 40, 64, 6], [130, 40, 138, 6], [100, 56, 100, 18]].map(([a, b, c, d]) => S(path(leafD(a + (100 - a) * .3, b + 30, c, d, 9), SAGE), sh(`M${c},${d} L${c + 30},${d} L${a + 40},${b + 60}Z`, SAGE2, .5))),
      ...rose(64, 74, 22, BLUSH, BLUSH2), ...rose(136, 74, 22, BLUSH, BLUSH2), ...rose(100, 54, 22, IVORY, IVORY2), ...rose(100, 94, 24, ROSE, '#C76476'),
      ...[[50, 100], [150, 100], [80, 36], [122, 34]].map(([x, y]) => [circle(x, y, 5, WHITE, { sw: 2.2 }), circle(x + 7, y - 5, 4, WHITE, { sw: 2.2 })]),
      S(path('M84,118 L116,118 L108,190 L92,190 Z', SAGE), sh('M100,118 L118,118 L108,192 L100,192Z', SAGE2, .5)),
      ...bow(100, 132, 42, IVORY, IVORY2)] },
    { name: 'Brindisi', draw: () => {
      const flute = (rot, cx) => g(`rotate(${rot} ${cx} 180)`,
        S(path(`M${cx - 20},36 L${cx + 20},36 C${cx + 22},80 ${cx + 14},110 ${cx},112 C${cx - 14},110 ${cx - 22},80 ${cx - 20},36Z`, GLASS), sh(`M${cx - 21},64 L${cx + 21},64 L${cx + 21},120 L${cx - 21},120Z`, CHAMP), sh(`M${cx + 6},30 L${cx + 26},30 L${cx + 26},120 L${cx + 6},120Z`, GOLD, .25),
          shC(cx - 6, 92, 2.6, WHITE), shC(cx + 4, 80, 2, WHITE), shC(cx - 2, 72, 1.8, WHITE)),
        line(`M${cx},112 L${cx},170`, INK, 8), line(`M${cx},112 L${cx},170`, GLASS, 3.5, { cut: false }),
        S(ell(cx, 172, 20, 6, GLASS)), shine(`M${cx - 13},44 L${cx - 11},80`, 3.5, .9));
      return [flute(-16, 78), flute(16, 122), ...[[100, 22, 6], [86, 10, 4], [118, 8, 3.5]].map(([x, y, r]) => circle(x, y, r, CHAMP, { sw: 2.2 })),
        path(starD(100, 50, 9, 3.5, 4, 1), WHITE, { sw: 2.2 })];
    } },
    { name: 'Campane', draw: () => {
      const bell = (cx, rot) => g(`rotate(${rot} ${cx} 50)`,
        S(path(`M${cx},48 C${cx + 22},48 ${cx + 26},70 ${cx + 28},100 C${cx + 30},120 ${cx + 40},130 ${cx + 42},138 L${cx - 42},138 C${cx - 40},130 ${cx - 30},120 ${cx - 28},100 C${cx - 26},70 ${cx - 22},48 ${cx},48Z`, GOLD), sh(`M${cx + 6},40 L${cx + 50},40 L${cx + 50},140 L${cx + 10},140Z`, GOLD2, .45)),
        S(rect(cx - 44, 132, 88, 12, 6, GOLD), sh(`M${cx - 44},140 H${cx + 44} V146 H${cx - 44}Z`, GOLD2, .6)), S(circle(cx, 150, 9, GOLD2)), shine(`M${cx - 16},70 C${cx - 18},90 ${cx - 22},110 ${cx - 28},124`, 4, .7));
      return [bell(54, -18), bell(146, 18), ...bow(100, 44, 52, BLUSH, BLUSH2)];
    } },
    { name: 'Partecipazione', draw: () => [
      g('rotate(-6 100 104)',
        S(rect(26, 56, 148, 100, 8, IVORY), sh('M26,156 L100,104 L174,156Z', IVORY2)),
        line('M26,156 L86,110', IVORY2, 2.6, { cut: false }), line('M174,156 L114,110', IVORY2, 2.6, { cut: false }),
        S(path('M30,58 L170,58 L106,110 Q100,114 94,110 Z', '#F6EEDD'), sh('M26,58 L100,98 L174,58 L174,66 L100,114 L26,66Z', IVORY2, .6)),
        line('M30,58 L94,110 Q100,114 106,110 L170,58', INK, 3, { cut: false }),
        S(path('M100,90 C114,88 124,96 124,108 C126,124 112,132 100,130 C86,132 74,122 76,108 C76,96 86,88 100,90Z', RED), sh('M124,108 C126,124 112,132 100,130 C110,124 118,116 118,104Z', RED2, .7)),
        g('', path(heartD(100, 110, 22, 20), RED2, { ink: false, cut: false })), hiE(88, 100, 3, 5, 30, .6),
        ...[[150, 90], [50, 92]].map(([x, y]) => S(path(leafD(x - 10, y + 8, x + 8, y - 10, 6), SAGE)))),
      ] },
    { name: 'Champagne', draw: () => [
      g('rotate(24 100 110)',
        S(path('M84,190 L84,104 C84,86 92,80 92,62 L92,44 L108,44 L108,62 C108,80 116,86 116,104 L116,190 C116,194 112,196 108,196 L92,196 C88,196 84,194 84,190Z', BOT), sh('M104,40 H124 V198 H104Z', BOT2, .55)),
        S(path('M90,40 L110,40 L110,72 C110,80 116,84 116,96 L84,96 C84,84 90,80 90,72Z', GOLD), sh('M102,36 H120 V100 H102Z', GOLD2, .5)),
        S(rect(84, 120, 32, 44, 4, IVORY)), g('', path(heartD(100, 142, 16, 15), RED, { sw: 2.2 })),
        shine('M90,110 L90,184', 4, .45)),
      S(path('M134,46 C124,30 132,16 146,20 C150,6 170,8 170,24 C184,24 188,42 176,48 C170,58 152,58 146,52 C140,56 132,54 134,46Z', IVORY), sh('M134,46 C140,56 152,58 160,52 C170,58 184,50 178,44 C170,52 150,50 140,44Z', IVORY2, .8)),
      S(rect(156, 0, 16, 18, 5, '#D9A86C'), sh('M164,0 H174 V20 H164Z', '#B07D45', .6)),
      ...[[126, 18, 4], [186, 60, 4.5], [118, 34, 3]].map(([x, y, r]) => circle(x, y, r, CHAMP, { sw: 2 }))] },
    { name: 'Cuore con ali', draw: () => {
      const wing = (f) => g(f ? 'translate(200 0) scale(-1 1)' : '',
        S(path('M74,92 C60,70 36,56 12,58 C14,70 22,78 30,82 C18,84 12,92 12,100 C22,104 32,102 38,100 C30,108 30,118 34,124 C48,124 60,116 70,108Z', WHITE), sh('M70,108 C60,116 48,124 34,124 C30,118 30,108 38,100 C50,104 62,100 72,96Z', GREY2, .55)),
        line('M30,82 C44,84 58,88 70,96 M38,100 C50,100 62,100 72,100', GREY2, 2.4, { cut: false }));
      return [wing(false), wing(true),
        S(path(heartD(100, 104, 92, 86), RED), sh('M0,0 H200 V200 H0Z', RED2), path(heartD(95, 98, 92, 86), RED, { ink: false, cut: false })),
        hiE(84, 88, 7, 12, 35, .6), circle(92, 74, 2.6, WHITE, { ink: false, cut: false, op: .8 })];
    } },
    { name: 'Diamante', draw: () => [
      S(path('M50,70 L74,40 L126,40 L150,70 L100,164 Z', DIA), sh('M100,70 L150,70 L100,164Z', DIA2, .7), sh('M50,70 L100,70 L100,164Z', WHITE, .35), sh('M74,40 L100,70 L126,40Z', WHITE, .55)),
      line('M50,70 L150,70 M74,40 L86,70 L100,164 L114,70 L126,40 M86,70 L100,40 L114,70', DIA2, 2.4, { cut: false }),
      path(starD(150, 34, 14, 5, 4, 1.6), WHITE, { sw: 2.6 }), path(starD(46, 124, 9, 3.5, 4, 1.2), WHITE, { sw: 2.4 }), path(starD(160, 118, 7, 3, 4, 1), WHITE, { sw: 2.2 })] },
  ]
};
