import { circle, ell, rect, path, poly, line, g, S, hi, hiE, shine, sh, shC, shE, heartD, starD, leafD, petals, bow, face, INK } from '../lib.mjs';
const RED = '#E8344E', RED2 = '#B3203A', PINK = '#FF8FAB', PINK2 = '#E2617F', LPINK = '#FFC7D4', GOLD = '#F6B93B', GOLD2 = '#D18E1A',
  CHOC = '#7A3E26', CHOC2 = '#552616', GREEN = '#62B25F', GREEN2 = '#3F8A47', CREAM = '#FFF4E6', CREAM2 = '#F2D9BE';
/* cuore lucido con zona d'ombra in basso a destra */
const glossyHeart = (cx, cy, w, h, c, c2, rot = 0) => g(rot ? `rotate(${rot} ${cx} ${cy})` : '',
  S(path(heartD(cx, cy, w, h), c), sh(`M0,0H400V400H0Z`, c2), path(heartD(cx - w * .07, cy - h * .08, w, h), c, { ink: false, cut: false })),
  hiE(cx - w * .26, cy - h * .2, w * .1, h * .17, 35, .6), circle(cx - w * .12, cy - h * .38, w * .03, '#fff', { ink: false, cut: false, op: .8 }));
export default {
  folder: 'amore', stickers: [
    { name: 'Cuore', draw: () => [glossyHeart(100, 104, 160, 150, RED, RED2),
      g('', path(starD(160, 40, 15, 5, 4, 1.5), '#FFE08A', { sw: 2.6 })), g('', path(starD(38, 150, 10, 3.5, 4, 1.2), '#FFE08A', { sw: 2.4 }))] },
    { name: 'Due cuori', draw: () => [glossyHeart(80, 88, 112, 104, PINK, PINK2, -14), glossyHeart(122, 118, 118, 110, RED, RED2, 12)] },
    { name: 'Lettera d’amore', draw: () => [
      g('rotate(-8 100 105)',
        S(rect(30, 58, 140, 96, 10, CREAM), sh('M30,154 L100,108 L170,154Z', CREAM2)),
        line('M30,154 L88,112', INK, 3), line('M170,154 L112,112', INK, 3),
        S(path('M33,61 Q35,58 40,58 L160,58 Q165,58 167,61 L106,112 Q100,117 94,112 Z', '#FFE2C6'), sh('M30,58 L100,95 L170,58 L170,70 L100,116 L30,70Z', CREAM2, .6)),
        glossyHeart(100, 108, 46, 42, RED, RED2)),
      glossyHeart(156, 46, 30, 28, PINK, PINK2, 18)] },
    { name: 'Rosa', draw: () => [
      path('M100,96 C102,130 96,160 100,188', 'none', { cut: true }),
      line('M100,96 C103,130 96,160 101,188', GREEN2, 9), line('M100,96 C103,130 96,160 101,188', GREEN, 4.5, { cut: false }),
      S(path(leafD(99, 150, 52, 124, 18, .05), GREEN), sh(leafD(99, 150, 52, 124, 18, .05).replace(/Q[^Q]*Q/, 'Q75,122 52,124 Q'), GREEN2, .0)),
      line('M97,148 Q78,138 58,126', GREEN2, 2.6, { cut: false }),
      S(path(leafD(101, 166, 150, 146, 17, -.05), GREEN), shE(130, 162, 26, 9, GREEN2, .45, -20)),
      line('M103,164 Q124,158 144,148', GREEN2, 2.6, { cut: false }),
      S(path('M58,62 C50,90 70,116 100,118 C130,116 150,90 142,62 C132,74 120,72 112,66 C106,74 94,74 88,66 C80,72 68,74 58,62Z', RED),
        sh('M100,118 C130,116 150,90 142,62 C140,96 120,108 100,110 Z', RED2)),
      S(path('M66,52 C62,30 84,18 100,22 C118,18 140,30 134,52 C128,74 114,82 100,82 C86,82 70,74 66,52Z', '#F2506A'),
        sh('M134,52 C128,74 114,82 100,82 C112,74 124,64 126,46 Z', RED2, .7)),
      line('M100,34 C86,34 82,50 92,56 C104,62 114,50 106,44', INK, 3.2, { cut: false }),
      line('M78,46 C78,66 96,72 110,68', INK, 3, { cut: false }), line('M122,40 C128,54 122,64 114,70', INK, 3, { cut: false }),
      line('M60,72 C70,92 88,98 100,98 C116,98 132,90 140,72', RED2, 3, { cut: false }),
      hiE(80, 38, 6, 11, 30, .55)] },
    { name: 'Cuore con freccia', draw: () => [
      line('M32,168 L72,128', '#8A5A3C', 7), poly([[22, 160], [40, 178], [28, 186], [14, 186], [14, 172]], '#FFC7D4', { sw: 3 }),
      line('M24,176 L42,158', PINK2, 2.6, { cut: false }),
      glossyHeart(102, 98, 136, 126, RED, RED2, 8),
      line('M128,72 L170,30', '#8A5A3C', 7), poly([[164, 22], [186, 16], [180, 38]], GOLD, { sw: 3 })] },
    { name: 'Lucchetto', draw: () => [
      S(path('M66,90 L66,62 C66,30 134,30 134,62 L134,90 L118,90 L118,64 C118,46 82,46 82,64 L82,90Z', '#C9CFD8'), sh('M118,64 C118,46 82,46 82,64 L82,70 C84,54 116,54 118,70Z', '#9AA3B0'), sh('M128,50 C134,60 134,70 134,90 L126,90 L126,66Z', '#9AA3B0')),
      glossyHeart(100, 122, 132, 120, GOLD, GOLD2),
      path('M100,108 m-9,0 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0 M96,114 L92,138 L108,138 L104,114Z', '#6B4410', { ink: false, cut: false }),
      shine('M62,104 Q60,92 70,86', 4, .7)] },
    { name: 'Cioccolatini', draw: () => [
      g('rotate(-6 100 104)',
        S(path(heartD(100, 104, 176, 158), RED), sh('M0,0H400V400H0Z', RED2), path(heartD(96, 98, 176, 158), RED, { ink: false, cut: false })),
        S(path(heartD(100, 102, 144, 128), CREAM), sh(heartD(100, 112, 144, 128), CREAM2, .0), shE(130, 130, 50, 30, CREAM2, .6)),
        ...[[54, 74], [146, 74], [100, 98], [70, 124], [130, 124], [100, 148]].map(([x, y], i) => [
          S(circle(x, y, 14.5, i % 2 ? CHOC : '#9A5634'), shC(x + 5, y + 5, 13, CHOC2, .55)),
          line(`M${x - 9},${y - 2} q4,-5 9,0 t9,0`, i % 2 ? '#C98B5E' : '#F3D6B6', 2.6, { cut: false }),
          circle(x - 6, y - 8, 3, '#fff', { ink: false, cut: false, op: .55 })]))] },
    { name: 'Palloncino a cuore', draw: () => [
      line('M100,150 C88,166 116,174 98,196', INK, 2.6),
      poly([[93, 152], [107, 152], [100, 142]], RED2, { sw: 2.8 }),
      glossyHeart(100, 82, 140, 132, '#FF5C7A', '#D6395B', -6),
      shine('M60,62 Q66,46 82,42', 5, .8)] },
    { name: 'Bacio', draw: () => [
      g('rotate(-10 100 100)',
        S(path('M24,98 C40,68 60,52 80,56 C90,58 95,64 100,70 C105,64 110,58 120,56 C140,52 160,68 176,98 C150,96 126,100 100,100 C74,100 50,96 24,98Z', '#E2304F'), sh('M24,98 C50,96 74,100 100,100 C126,100 150,96 176,98 C160,94 130,90 100,92 C70,90 40,94 24,98Z', RED2, .6)),
        S(path('M24,100 C50,104 74,104 100,104 C126,104 150,104 176,100 C160,132 132,148 100,148 C68,148 40,132 24,100Z', '#F04462'), sh('M176,100 C160,132 132,148 100,148 C68,148 40,132 24,100 C48,126 74,136 100,136 C128,136 152,126 176,100Z', RED2, .55)),
        line('M28,100 C54,104 76,104 100,104 C124,104 146,104 172,100', INK, 3.2, { cut: false }),
        hiE(130, 120, 16, 6, -6, .55), hiE(70, 82, 10, 4, -14, .5)),
      glossyHeart(164, 48, 30, 28, PINK, PINK2, 16), glossyHeart(40, 46, 20, 18, PINK, PINK2, -16)] },
    { name: 'Orsetto innamorato', draw: () => {
      const B = '#C68B5B', B2 = '#9E6638', L = '#EBC9A2';
      return [
        S(circle(52, 48, 22, B), shC(56, 52, 11, L)), S(circle(148, 48, 22, B), shC(144, 52, 11, L)),
        S(ell(100, 96, 66, 60, B), sh('M0,0H400V400H0Z', B2), ell(94, 90, 66, 60, B, { ink: false, cut: false })),
        S(ell(100, 116, 26, 19, L)), ell(100, 106, 9, 6.5, INK, { ink: false, cut: false }),
        line('M100,112 L100,120 M92,124 Q100,130 108,124', INK, 3, { cut: false }),
        ell(74, 92, 6, 8, INK, { ink: false, cut: false }), ell(126, 92, 6, 8, INK, { ink: false, cut: false }),
        circle(76, 89, 2.2, '#fff', { ink: false, cut: false }), circle(128, 89, 2.2, '#fff', { ink: false, cut: false }),
        ell(62, 110, 9, 5.5, PINK, { ink: false, cut: false, op: .8 }), ell(138, 110, 9, 5.5, PINK, { ink: false, cut: false, op: .8 }),
        glossyHeart(100, 162, 92, 80, RED, RED2),
        S(ell(56, 158, 17, 14, B), shE(60, 162, 10, 8, B2, .4)), S(ell(144, 158, 17, 14, B), shE(140, 162, 10, 8, B2, .4))];
    } },
  ]
};
