import { circle, ell, rect, path, poly, line, g, S, hi, hiE, shine, sh, shC, shE, heartD, starD, leafD, petals, bow, face, INK } from '../lib.mjs';
const PINK = '#F7A8C4', PINK2 = '#DE7AA0', LIL = '#C3A6E8', LIL2 = '#9478C7', MINT = '#9EDFC4', MINT2 = '#63B898', YEL = '#FFE07A', YEL2 = '#F0B83A', SKY = '#9FD3F2', SKY2 = '#62A8D6',
  ORA = '#FF9A3C', ORA2 = '#E0761C', GRN = '#78C25A', GRN2 = '#4C9638', WHITE = '#FFFFFF', GREY2 = '#D7D0E0', CHOC = '#8A4B2C', CHOC2 = '#5F2D16', WICK = '#D9A15E', WICK2 = '#B07836';
const EGG = (cx, cy, w, h) => `M${cx},${cy - h} C${cx + w * .8},${cy - h} ${cx + w},${cy + h * .2} ${cx + w},${cy + h * .4} C${cx + w},${cy + h * .85} ${cx + w * .55},${cy + h} ${cx},${cy + h} C${cx - w * .55},${cy + h} ${cx - w},${cy + h * .85} ${cx - w},${cy + h * .4} C${cx - w},${cy + h * .2} ${cx - w * .8},${cy - h} ${cx},${cy - h}Z`;
const egg = (cx, cy, w, h, c, c2, deco = [], rot = 0) => g(rot ? `rotate(${rot} ${cx} ${cy})` : '', S(path(EGG(cx, cy, w, h), c), ...deco, sh(EGG(cx - w * .14, cy - h * .1, w, h).replace(/^/, 'M-200,-200 H400 V400 H-200Z '), c2, .0), shE(cx + w * .55, cy + h * .4, w * .7, h * .8, c2, .35)), hiE(cx - w * .42, cy - h * .3, w * .12, h * .24, 25, .65));
const zig = (cx, y, w, a, c, sw = 6) => line(`M${cx - w},${y} ${[...Array(10)].map((_, i) => `L${cx - w + (i + 1) * w / 5},${y + (i % 2 ? -a : a)}`).join(' ')}`, c, sw, { cut: false });
export default {
  folder: 'pasqua', stickers: [
    { name: 'Uovo decorato', draw: () => [egg(100, 102, 62, 82, LIL, LIL2, [zig(100, 74, 70, 7, YEL, 7), zig(100, 120, 70, 7, MINT, 7), sh('M0,92 H200 V102 H0Z', PINK), ...[60, 84, 108, 132].map(x => shC(x + 4, 150, 5, WHITE)), ...[72, 100, 128].map(x => shC(x, 44, 4.5, WHITE))], -8)] },
    { name: 'Uovo a fiori', draw: () => [egg(100, 102, 62, 82, MINT, MINT2, [
      ...[[78, 70], [122, 92], [86, 130], [130, 140], [104, 44]].flatMap(([x, y]) => [...petals(x, y, 5, 8, 6, 8, [PINK, YEL, WHITE, LIL, PINK][Math.round(x) % 5], 0, { ink: false, cut: false }), shC(x, y, 4, ORA)]),
      ...[[62, 106], [110, 70], [146, 116]].map(([x, y]) => shC(x, y, 4, WHITE))], 8)] },
    { name: 'Coniglietto', draw: () => [
      S(path('M62,96 C48,64 46,24 62,14 C78,6 88,40 90,86Z', WHITE), sh('M62,86 C54,62 54,34 62,26 C72,22 78,50 80,84Z', PINK)),
      S(path('M138,96 C152,64 154,24 138,14 C122,6 112,40 110,86Z', WHITE), sh('M138,86 C146,62 146,34 138,26 C128,22 122,50 120,84Z', PINK)),
      S(ell(100, 128, 68, 58, WHITE), shE(114, 142, 60, 50, GREY2, .55)),
      ...face(100, 124, 46, { cheek: PINK }), g('', path(heartD(100, 136, 12, 10), PINK2, { ink: false, cut: false })),
      line('M66,140 L44,136 M66,148 L46,152 M134,140 L156,136 M134,148 L154,152', '#A99BB8', 2.4, { cut: false }),
      ...bow(100, 184, 30, SKY, SKY2)] },
    { name: 'Pulcino', draw: () => [
      S(circle(100, 84, 50, YEL), shC(112, 96, 46, YEL2, .45)), line('M92,34 C88,24 96,18 100,26 C104,16 114,22 108,34', YEL2, 3.4),
      ...face(100, 82, 36, { cheek: ORA }), poly([[92, 96], [108, 96], [100, 108]], ORA, { sw: 2.6 }),
      S(path('M36,110 L50,126 L64,108 L80,126 L100,106 L120,126 L136,108 L150,126 L164,110 C168,160 140,186 100,186 C60,186 32,160 36,110Z', WHITE), shE(126, 170, 50, 30, GREY2, .6),
        ...[[70, 150], [124, 156], [96, 170]].map(([x, y]) => shC(x, y, 6, PINK, .7))),
      S(path('M58,10 L94,16 L92,30 L60,26Z'.replace(/.*/, 'M66,30 C70,16 84,8 100,8 C116,8 130,16 134,30 L120,24 L108,34 L100,24 L92,34 L80,24 Z'), WHITE), shE(116, 26, 20, 8, GREY2, .6))] },
    { name: 'Cestino', draw: () => [
      line('M40,110 C40,30 160,30 160,110', WICK2, 12), line('M40,110 C40,30 160,30 160,110', WICK, 5, { cut: false }),
      egg(70, 88, 22, 28, PINK, PINK2, [zig(70, 88, 26, 4, WHITE, 4)], -16), egg(130, 88, 22, 28, SKY, SKY2, [shC(122, 80, 4, WHITE), shC(136, 94, 4, WHITE), shC(124, 102, 3, WHITE)], 16), egg(100, 80, 24, 30, YEL, YEL2, [zig(100, 80, 28, 4, ORA, 4)]),
      ...[46, 62, 80, 98, 116, 134, 152].map((x, i) => S(path(leafD(x, 112, x + (i % 2 ? 6 : -6), 94, 4), GRN))),
      S(path('M26,108 L174,108 L160,182 C159,188 154,190 148,190 L52,190 C46,190 41,188 40,182 Z', WICK), ...[124, 142, 160, 178].map(y => sh(`M0,${y} H200 V${y + 3} H0Z`, WICK2)), ...[...Array(10)].map((_, i) => line(`M${36 + i * 14},110 L${44 + i * 12},190`, WICK2, 2.4, { cut: false })), sh('M140,104 H180 V194 H140Z', WICK2, .35)),
      S(rect(20, 100, 160, 16, 8, WICK), sh('M20,110 H180 V118 H20Z', WICK2, .6)),
      ...bow(100, 136, 30, PINK, PINK2)] },
    { name: 'Carota', draw: () => [
      ...[[-22, 0], [0, -6], [22, 0]].map(([dx, dy], i) => S(path(leafD(100, 58, 100 + dx * 1.6, 12 + dy, 9), GRN), sh(`M100,58 L${140 + dx},${20 + dy} L${160 + dx},40Z`, GRN2, .4))),
      g('rotate(14 100 120)', S(path('M70,62 C70,54 130,54 130,62 C130,110 110,170 102,190 C100,194 98,194 96,190 C90,170 70,110 70,62Z', ORA), sh('M104,50 L140,50 L104,196Z', ORA2, .45)),
        line('M74,86 L88,86 M80,110 L94,110 M112,96 L124,96 M86,138 L98,138 M104,124 L116,124 M96,160 L104,160', ORA2, 3, { cut: false }), hiE(82, 74, 4, 10, 0, .55))] },
    { name: 'Uovo di cioccolato', draw: () => [
      S(path(EGG(100, 108, 64, 80), CHOC), shE(130, 150, 50, 50, CHOC2, .5), sh('M30,110 L170,110 L170,124 L30,124Z', '#000', .0)),
      S(path('M36,118 C50,110 60,124 74,116 C88,108 96,124 110,116 C124,108 134,124 148,116 C156,112 162,114 164,118 C164,158 136,188 100,188 C64,188 36,158 36,118Z', LIL), sh('M36,118 C36,158 64,188 100,188 C136,188 164,158 164,118 C150,170 60,176 36,118Z', LIL2, .5),
        ...[[60, 146], [92, 160], [126, 146], [110, 132], [76, 128], [146, 132]].map(([x, y]) => shC(x, y, 5, YEL))),
      hiE(70, 70, 8, 14, 25, .35),
      ...bow(100, 114, 44, PINK, PINK2)] },
    { name: 'Narcisi', draw: () => {
      const nar = (cx, cy) => [...petals(cx, cy, 6, 18, 11, 18, '#FFF3B0', 0, { sw: 2.8 }), S(circle(cx, cy, 13, ORA), shC(cx + 4, cy + 4, 10, ORA2, .5)), circle(cx, cy, 6, YEL2, { ink: false, cut: false })];
      return [line('M100,190 C96,150 70,120 62,96 M100,190 C104,150 130,120 138,90 M100,190 L100,70', GRN2, 6), line('M100,190 C96,150 70,120 62,96 M100,190 C104,150 130,120 138,90 M100,190 L100,70', GRN, 2.4, { cut: false }),
        S(path(leafD(100, 190, 52, 140, 10), GRN)), S(path(leafD(100, 190, 150, 136, 10), GRN)),
        ...nar(62, 90), ...nar(138, 84), ...nar(100, 52)];
    } },
    { name: 'Nido', draw: () => [
      egg(76, 92, 22, 28, SKY, SKY2, [shC(70, 84, 3.5, WHITE), shC(84, 98, 3.5, WHITE)], -12), egg(124, 92, 22, 28, PINK, PINK2, [zig(124, 92, 26, 4, WHITE, 4)], 12), egg(100, 84, 24, 30, YEL, YEL2, [shC(94, 76, 4, WHITE), shC(108, 90, 4, WHITE)]),
      S(path('M22,104 C30,98 60,104 100,104 C140,104 170,98 178,104 C182,140 150,166 100,166 C50,166 18,140 22,104Z', WICK), sh('M18,104 C22,150 60,170 100,170 C150,170 180,150 182,104 C170,150 120,160 100,158 C60,158 30,146 18,104Z', WICK2, .55),
        ...[...Array(9)].map((_, i) => line(`M${24 + i * 6},${108 + i * 7} C${60 + i * 4},${120 + i * 4} ${140 - i * 4},${120 + i * 4} ${176 - i * 6},${108 + i * 7}`, WICK2, 2.4, { cut: false }))),
      line('M30,102 C20,90 26,86 34,92 M170,102 C182,92 176,86 166,92 M60,166 C56,178 64,180 70,170 M140,166 C146,178 138,180 132,170', WICK2, 3)] },
    { name: 'Agnellino', draw: () => {
      const wool = 'M40,104 C26,98 26,76 42,72 C40,54 60,46 72,54 C78,38 102,36 110,50 C122,40 144,46 144,62 C160,62 168,82 158,94 C170,104 166,126 150,128 C150,146 130,154 118,146 C110,158 86,158 78,146 C64,154 44,146 46,130 C30,128 26,110 40,104Z';
      return [line('M70,150 L70,184 M92,154 L92,186 M116,154 L116,186 M136,150 L136,182', '#5A4A5E', 9),
        S(path(wool, WHITE), shE(120, 120, 50, 36, GREY2, .55)),
        S(ell(150, 96, 30, 34, '#5A4A5E'), shE(160, 104, 24, 28, '#3E3142', .5)),
        S(ell(124, 80, 16, 9, '#5A4A5E')), S(ell(176, 80, 14, 8, '#5A4A5E')),
        S(path('M128,70 C130,56 146,52 152,60 C160,52 174,58 172,72 C164,66 150,68 150,68 C150,68 136,66 128,70Z', WHITE)),
        circle(140, 96, 4, WHITE, { ink: false, cut: false }), circle(160, 96, 4, WHITE, { ink: false, cut: false }), circle(141, 97, 2, INK, { ink: false, cut: false }), circle(161, 97, 2, INK, { ink: false, cut: false }),
        ell(150, 116, 6, 3.5, PINK, { ink: false, cut: false }), ...bow(146, 136, 18, PINK, PINK2)];
    } },
  ]
};
