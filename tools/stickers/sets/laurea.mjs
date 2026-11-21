import { circle, ell, rect, path, poly, line, g, S, hi, hiE, shine, sh, shC, shE, heartD, starD, leafD, petals, bow, face, INK } from '../lib.mjs';
const CAP = '#2E3446', CAP2 = '#1C2030', GOLD = '#F4C542', GOLD2 = '#CF9822', RED = '#C8323F', RED2 = '#981F2B', PAPER = '#FFF6E1', PAPER2 = '#EAD8B0', LAUR = '#7BAA4E', LAUR2 = '#55803A',
  BLUE = '#4A86C8', BLUE2 = '#2F62A0', GRN = '#56B07A', GRN2 = '#368356', BRN = '#9A6A43', BRN2 = '#6E4528', WHITE = '#FFFFFF', SEA = '#58B6E0', SEA2 = '#3487B3', GREY = '#CDD5DE', GREY2 = '#97A3B2', ORA = '#FF8E3C';
const laurel = (flip) => {
  const P0 = [98, 178], P1 = [26, 164], P2 = [44, 46], B = t => [0, 1].map(k => (1 - t) ** 2 * P0[k] + 2 * (1 - t) * t * P1[k] + t * t * P2[k]),
    T = t => { const d = [0, 1].map(k => 2 * (1 - t) * (P1[k] - P0[k]) + 2 * t * (P2[k] - P1[k])), l = Math.hypot(...d); return d.map(v => v / l); };
  const leaves = [];
  for (let i = 0; i < 8; i++) {
    const t = .08 + i * .12, [x, y] = B(t), [tx, ty] = T(t);
    for (const side of [1, -1]) { const a = side * .62, cx = tx * Math.cos(a) - ty * Math.sin(a), cy = tx * Math.sin(a) + ty * Math.cos(a), L = 30 - i * 1.2;
      leaves.push(S(path(leafD(x, y, x + cx * L, y + cy * L, 8.5), side > 0 ? LAUR : '#8FC05E'), sh(`M${x},${y} L${x + cx * L},${y + cy * L} L${x + cx * L + 20},${y + cy * L + 20}Z`, LAUR2, .35))); }
  }
  const [ex, ey] = B(1), [tx, ty] = T(1);
  leaves.push(S(path(leafD(ex, ey, ex + tx * 26, ey + ty * 26, 8), LAUR)));
  return g(flip ? 'translate(200 0) scale(-1 1)' : '', line(`M${P0} Q${P1} ${P2}`, LAUR2, 5), ...leaves);
};
export default {
  folder: 'laurea', stickers: [
    { name: 'Tocco', draw: () => [
      S(path('M54,92 L146,92 L146,134 C146,148 124,156 100,156 C76,156 54,148 54,134 Z', CAP), sh('M120,88 H150 V160 H120Z', CAP2, .55)),
      S(path('M100,40 L184,76 L100,112 L16,76 Z', CAP), sh('M100,112 L184,76 L184,84 L100,120Z', CAP2, .6), sh('M100,40 L100,112 L16,76Z', '#3E4660', .5)),
      line('M100,76 C130,80 150,86 158,96 L158,136', GOLD, 4.5), S(circle(100, 76, 7, GOLD)),
      S(path('M150,134 L166,134 L170,166 L146,166 Z', GOLD), ...[150, 155, 160, 165].map(x => line(`M${x},140 L${x},166`, GOLD2, 2, { cut: false }))),
      hiE(70, 70, 16, 4, 22, .3)] },
    { name: 'Diploma', draw: () => [
      g('rotate(-20 100 100)',
        S(rect(30, 74, 140, 52, 6, PAPER), sh('M30,108 H170 V128 H30Z', PAPER2, .8), ...[0, 1, 2].map(i => sh(`M${50 + i * 4},${90 + i * 8} H${148 - i * 6} V${92 + i * 8} H${50 + i * 4}Z`, PAPER2))),
        S(ell(170, 100, 12, 26, PAPER2), shE(170, 100, 5, 12, '#D7BF8E')), S(ell(30, 100, 12, 26, PAPER)),
        S(rect(84, 72, 16, 56, 2, RED), sh('M92,70 H102 V130 H92Z', RED2, .5))),
      S(path('M80,128 L72,170 L86,160 L94,174 L102,132Z', RED), S(path('M110,130 L120,172 L106,162 L100,176 L94,134Z', RED2))),
      S(circle(96, 118, 20, GOLD), shC(102, 124, 16, GOLD2, .5)), path(starD(96, 118, 11, 5, 5, 1.6), WHITE, { ink: false, cut: false, op: .85 })] },
    { name: 'Corona d’alloro', draw: () => [laurel(false), laurel(true),
      S(path('M84,170 L116,170 L108,186 L100,180 L92,186 Z', RED)), S(circle(100, 172, 9, RED), shC(103, 175, 7, RED2, .5))] },
    { name: 'Libri', draw: () => [
      S(rect(26, 146, 148, 32, 5, RED), sh('M26,166 H174 V180 H26Z', RED2, .55)), S(rect(160, 150, 10, 24, 2, PAPER)), line('M40,154 H140 M40,170 H140', GOLD, 3, { cut: false }),
      S(rect(36, 116, 132, 30, 5, BLUE), sh('M36,134 H168 V148 H36Z', BLUE2, .55)), S(rect(40, 120, 8, 22, 2, PAPER)), line('M60,124 H156 M60,138 H156', WHITE, 2.6, { cut: false, op: .7 }),
      g('rotate(-6 100 100)', S(rect(30, 86, 140, 30, 5, GRN), sh('M30,104 H170 V118 H30Z', GRN2, .55)), S(rect(156, 90, 10, 22, 2, PAPER)), S(rect(70, 92, 40, 18, 3, GOLD))),
      g('rotate(-14 110 70)', S(path('M100,30 L170,52 L136,86 L66,64 Z', CAP), sh('M136,86 L170,52 L170,58 L136,92Z', CAP2, .6)), S(path('M80,62 L132,78 L132,94 C120,100 92,92 80,82 Z', CAP)), line('M118,58 C140,62 150,70 152,86', GOLD, 3.5), S(circle(118, 58, 5, GOLD)))] },
    { name: 'Gufo', draw: () => [
      S(path('M50,80 C46,50 70,34 100,34 C130,34 154,50 150,80 C160,110 156,170 100,182 C44,170 40,110 50,80Z', BRN), sh('M150,80 C160,110 156,170 100,182 C140,160 146,120 138,86Z', BRN2, .55)),
      S(path('M72,120 C72,100 128,100 128,120 C128,150 116,168 100,170 C84,168 72,150 72,120Z', '#E9C9A0'), ...[[86, 124], [100, 132], [114, 124], [92, 146], [108, 146]].map(([x, y]) => line(`M${x - 5},${y} Q${x},${y + 6} ${x + 5},${y}`, '#C49A6A', 2.4))),
      S(circle(78, 82, 22, WHITE)), S(circle(122, 82, 22, WHITE)), S(circle(80, 84, 11, CAP)), S(circle(120, 84, 11, CAP)), circle(84, 80, 4, WHITE, { ink: false, cut: false }), circle(124, 80, 4, WHITE, { ink: false, cut: false }),
      poly([[92, 100], [108, 100], [100, 114]], ORA, { sw: 2.8 }),
      S(path('M44,124 C30,140 34,166 54,172 C60,156 60,138 56,124Z', BRN2)), S(path('M156,124 C170,140 166,166 146,172 C140,156 140,138 144,124Z', BRN2)),
      poly([[80, 180], [88, 188], [96, 180]], ORA, { sw: 2.6 }), poly([[104, 180], [112, 188], [120, 180]], ORA, { sw: 2.6 }),
      S(path('M100,6 L160,30 L100,54 L40,30 Z', CAP), sh('M100,54 L160,30 L160,36 L100,60Z', CAP2, .6)), line('M100,30 C124,34 136,40 138,54 L138,70', GOLD, 3.5), S(circle(100, 30, 5, GOLD)), S(circle(138, 72, 5, GOLD))] },
    { name: 'Medaglia', draw: () => [
      S(path('M66,14 L94,14 L118,92 L90,92 Z', BLUE), sh('M80,14 H94 L118,92 L104,92Z', BLUE2, .5)),
      S(path('M134,14 L106,14 L82,92 L110,92 Z', RED), sh('M120,14 H134 L110,92 L96,92Z', RED2, .5)),
      S(circle(100, 130, 52, GOLD), shC(112, 142, 48, GOLD2, .5)), S(circle(100, 130, 38, '#FFD866'), shC(108, 138, 34, GOLD2, .35)),
      path(starD(100, 130, 24, 10, 5, 3), WHITE, { sw: 3 }), hiE(76, 104, 6, 14, -30, .55)] },
    { name: 'Mappamondo', draw: () => [
      S(path('M66,182 L134,182 L126,166 L74,166 Z', BRN), sh('M100,164 H140 V186 H100Z', BRN2, .5)),
      line('M100,166 L100,150', GREY2, 7), line('M40,46 C10,100 50,160 120,150', GOLD2, 7), line('M40,46 C10,100 50,160 120,150', GOLD, 3, { cut: false }),
      S(circle(100, 90, 58, SEA), shC(116, 104, 54, SEA2, .45),
        sh('M70,40 C84,36 96,44 92,58 C90,70 76,66 72,80 C70,92 58,96 52,86 C46,72 54,48 70,40Z', GRN), sh('M110,56 C128,50 150,62 148,80 C146,92 132,90 128,104 C124,120 140,128 132,140 C120,150 104,136 106,120 C108,104 96,96 100,80 C102,66 104,60 110,56Z', GRN),
        sh('M60,118 C70,114 80,124 76,134 C72,144 60,140 58,130Z', GRN)),
      hiE(70, 60, 7, 16, 35, .5)] },
    { name: 'Lampadina', draw: () => [
      ...[[-60, 30], [-30, 18], [0, 12], [30, 18], [60, 30]].map(([a]) => g(`rotate(${a} 100 86)`, line('M100,10 L100,24', GOLD2, 5))),
      S(rect(80, 140, 40, 30, 6, GREY), ...[148, 156, 164].map(y => sh(`M76,${y} H124 V${y + 3} H76Z`, GREY2)), sh('M104,138 H124 V172 H104Z', GREY2, .5)), S(path('M88,170 L112,170 L106,182 L94,182 Z', CAP)),
      S(path('M100,36 C132,36 154,60 154,88 C154,108 140,120 128,132 C122,138 120,142 120,142 L80,142 C80,142 78,138 72,132 C60,120 46,108 46,88 C46,60 68,36 100,36Z', GOLD), shC(118, 104, 50, GOLD2, .4)),
      line('M86,142 L86,112 C86,100 98,100 100,110 C102,100 114,100 114,112 L114,142', '#B07D10', 3, { cut: false }),
      hiE(74, 70, 8, 16, 30, .65)] },
    { name: 'Razzo', draw: () => [
      g('rotate(35 100 100)',
        S(path('M86,150 C90,170 100,190 100,196 C100,190 110,170 114,150Z', ORA), sh('M92,150 C96,166 100,180 100,184 C100,180 104,166 108,150Z', GOLD)),
        S(path('M76,112 L54,148 L80,140 Z', RED), sh('M54,148 L80,140 L78,130Z', RED2, .5)), S(path('M124,112 L146,148 L120,140 Z', RED), sh('M146,148 L120,140 L122,130Z', RED2, .5)),
        S(path('M100,10 C128,30 132,80 126,146 L74,146 C68,80 72,30 100,10Z', WHITE), sh('M108,10 C130,40 132,90 126,148 L108,148Z', GREY, .8)),
        S(path('M100,10 C112,18 120,30 124,44 L76,44 C80,30 88,18 100,10Z', RED), sh('M108,12 H130 V46 H108Z', RED2, .5)),
        S(circle(100, 82, 15, SEA), shC(104, 86, 12, SEA2, .5)), hiE(95, 77, 4, 6, 30, .7), S(rect(96, 128, 8, 26, 3, RED))),
      path(starD(40, 50, 12, 5, 4, 1.5), GOLD, { sw: 2.6 }), path(starD(166, 150, 9, 4, 4, 1.2), GOLD, { sw: 2.4 })] },
    { name: 'Stella', draw: () => [
      S(path('M78,150 L64,192 L82,182 L92,196 L102,156Z', RED)), S(path('M122,150 L136,192 L118,182 L108,196 L98,156Z', BLUE)),
      S(path(starD(100, 92, 80, 36, 5, 10), GOLD), shC(130, 124, 70, GOLD2, .4)),
      ...face(100, 98, 48, { cheek: ORA }), hiE(70, 70, 6, 14, -30, .55)] },
  ]
};
