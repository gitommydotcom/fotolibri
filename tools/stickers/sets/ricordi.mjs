import { circle, ell, rect, path, poly, line, g, S, hi, hiE, shine, sh, shC, shE, heartD, starD, leafD, petals, bow, face, INK } from '../lib.mjs';
const CORAL = '#F2766B', CORAL2 = '#C9524A', MUST = '#F2C14E', MUST2 = '#CF9A2A', TEAL = '#4FA3A5', TEAL2 = '#33797B', NAVY = '#36475E', NAVY2 = '#243246', CREAM = '#FFF6E6', CREAM2 = '#EAD9BC',
  BLUSH = '#F6B8B0', SAGE = '#9BBF8E', SAGE2 = '#6E9662', SKY = '#9ED2EA', SKY2 = '#6BAACB', WHITE = '#FFFFFF', GREY = '#D6DBE2', GREY2 = '#A7B0BC', BRN = '#9C6B44', BRN2 = '#714828', LIL = '#B9A2DB', RED = '#E2524A';
export default {
  folder: 'ricordi', stickers: [
    { name: 'Macchina fotografica', draw: () => [
      S(rect(54, 40, 40, 20, 5, NAVY)), S(rect(130, 44, 22, 14, 4, CORAL)),
      S(rect(22, 54, 156, 110, 18, CREAM), sh('M140,50 H182 V168 H140Z', CREAM2, .8)),
      S(path('M22,80 H178 V138 H22Z'.replace(/.*/, 'M22,84 L178,84 L178,134 L22,134Z'), BRN), ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => sh(`M${30 + i * 20},84 l4,0 l0,50 l-4,0Z`, BRN2, .5))),
      S(circle(100, 108, 44, NAVY), shC(108, 116, 40, NAVY2, .6)), S(circle(100, 108, 30, '#5D7A9A'), shC(106, 114, 26, '#3F5A78', .7)), S(circle(100, 108, 16, '#22303F')),
      hiE(88, 96, 6, 9, 40, .7), circle(110, 118, 3, WHITE, { ink: false, cut: false, op: .6 }),
      S(rect(140, 64, 24, 14, 4, SKY), sh('M140,64 L164,64 L140,78Z', WHITE, .5)), S(circle(40, 70, 6, CORAL))] },
    { name: 'Polaroid', draw: () => [
      g('rotate(-8 100 100)',
        S(rect(34, 22, 132, 156, 6, WHITE), sh('M34,150 H166 V178 H34Z', '#F1EEE8')),
        S(rect(46, 34, 108, 104, 2, SKY), sh('M46,108 C70,96 90,110 110,100 C130,90 144,98 154,104 L154,138 L46,138Z', SAGE), sh('M46,120 C70,112 100,124 154,116 L154,138 L46,138Z', SAGE2), shC(126, 64, 13, MUST)),
        line('M62,160 C76,154 90,166 104,158 C116,152 126,162 138,156', GREY2, 2.6, { cut: false })),
      g('rotate(-30 70 26)', S(rect(44, 16, 52, 20, 2, '#F7D2C8', { op: .95 }), sh('M44,16 h52 v4 h-52Z', WHITE, .4)))] },
    { name: 'Cuore', draw: () => [g('rotate(-8 100 100)',
      S(path(heartD(100, 104, 160, 150), CORAL), sh('M0,0H400V400H0Z', CORAL2), path(heartD(93, 96, 160, 150), CORAL, { ink: false, cut: false })),
      line(heartD(100, 104, 128, 118), WHITE, 3, { cut: false, dash: '7 7', op: .85 }),
      hiE(62, 66, 10, 16, 35, .55))] },
    { name: 'Stella', draw: () => [
      S(path(starD(100, 104, 86, 40, 5, 12), MUST), shC(134, 140, 76, MUST2, .45)),
      path(starD(100, 104, 50, 23, 5, 6), 'none', { ink: false, cut: false }), line(starD(100, 104, 62, 29, 5, 8), WHITE, 3, { cut: false, dash: '6 6', op: .8 }),
      hiE(72, 74, 6, 14, -30, .55)] },
    { name: 'Aeroplanino di carta', draw: () => [
      line('M16,170 C40,150 30,130 60,124', GREY2, 3.4, { dash: '7 8' }),
      S(path('M18,98 L186,30 L110,176 L86,124 Z', WHITE), sh('M86,124 L186,30 L110,176Z', GREY, .9)),
      S(path('M86,124 L186,30 L96,150 Z', '#E7EBF0'), sh('M86,124 L186,30 L90,136Z', GREY2, .5)),
      line('M86,124 L186,30', INK, 3, { cut: false })] },
    { name: 'Mongolfiera', draw: () => [
      line('M68,124 L82,160 M132,124 L118,160', BRN2, 3),
      S(path('M80,156 L120,156 L116,186 L84,186 Z', BRN), ...[164, 172, 180].map(y => sh(`M76,${y} H124 V${y + 2} H76Z`, BRN2)), sh('M104,154 H124 V188 H104Z', BRN2, .4)),
      S(path('M100,14 C144,14 170,46 170,80 C170,104 150,118 134,128 L66,128 C50,118 30,104 30,80 C30,46 56,14 100,14Z', CORAL),
        sh('M100,14 C80,14 66,46 66,80 C66,104 72,118 78,128 L122,128 C128,118 134,104 134,80 C134,46 120,14 100,14Z', MUST), sh('M100,14 C92,14 88,46 88,80 C88,104 92,118 94,128 L106,128 C108,118 112,104 112,80 C112,46 108,14 100,14Z', CORAL), sh('M130,10 H180 V132 H130Z', CORAL2, .4)),
      line('M100,14 C80,14 66,46 66,80 C66,104 72,118 78,128 M100,14 C120,14 134,46 134,80 C134,104 128,118 122,128 M100,14 L100,128', INK, 2.6, { cut: false }),
      S(rect(64, 122, 72, 10, 4, TEAL)), hiE(54, 56, 6, 16, 20, .5)] },
    { name: 'Tazza di caffè', draw: () => [
      line('M84,40 C76,30 92,22 84,10 M110,40 C102,28 118,20 110,6', GREY2, 4.5, { cut: false }),
      S(ell(100, 168, 76, 16, CREAM), shE(106, 174, 66, 10, CREAM2, .8)),
      S(path('M140,82 C174,78 178,128 136,132 L138,118 C158,116 160,94 140,96Z', TEAL), sh('M140,116 C154,116 162,106 160,96 C166,120 154,130 136,132Z', TEAL2, .5)),
      S(path('M40,62 L156,62 C156,120 134,162 98,162 C62,162 40,120 40,62Z', TEAL), sh('M120,60 L160,60 C160,124 138,166 98,166 C124,150 134,108 120,60Z', TEAL2, .45)),
      S(ell(98, 62, 58, 11, '#8B5A3C'), shE(98, 65, 54, 8, '#5E3820', .6)), g('', path(heartD(98, 62, 22, 9), CREAM, { ink: false, cut: false })),
      shine('M56,80 C58,110 66,134 80,148', 5, .5)] },
    { name: 'Arcobaleno', draw: () => [
      S(path('M20,140 A80,80 0 0,1 180,140 L154,140 A54,54 0 0,0 46,140 Z', CORAL), sh('M33,140 A67,67 0 0,1 167,140 L154,140 A54,54 0 0,0 46,140Z', MUST), sh('M40,140 A60,60 0 0,1 160,140 L154,140 A54,54 0 0,0 46,140Z', '#000', 0),
        sh('M100,40 m0,0', '#000', 0)),
      line('M33,140 A67,67 0 0,1 167,140', INK, 0.1, { cut: false }),
      S(path('M46,140 A54,54 0 0,1 154,140 L140,140 A40,40 0 0,0 60,140 Z', TEAL)),
      S(path('M14,150 C4,150 2,134 14,130 C12,116 30,110 40,118 C46,106 66,110 66,124 C78,124 82,140 72,148 Z', WHITE), shE(44, 150, 30, 8, GREY, .8)),
      S(path('M186,150 C196,150 198,134 186,130 C188,116 170,110 160,118 C154,106 134,110 134,124 C122,124 118,140 128,148 Z', WHITE), shE(156, 150, 30, 8, GREY, .8))] },
    { name: 'Fiori', draw: () => [
      line('M70,190 C72,160 64,134 58,112 M128,190 C126,164 134,140 142,118 M100,190 L100,96', SAGE2, 5),
      S(path(leafD(100, 170, 64, 146, 10), SAGE)), S(path(leafD(100, 160, 138, 140, 10), SAGE)),
      g('', ...petals(58, 98, 6, 15, 11, 15, BLUSH, 0, { sw: 2.8 }), S(circle(58, 98, 9, MUST))),
      g('', ...petals(142, 104, 5, 15, 12, 16, LIL, 36, { sw: 2.8 }), S(circle(142, 104, 9, MUST))),
      g('', ...petals(100, 70, 8, 22, 11, 20, CORAL, 0, { sw: 2.8 }), S(circle(100, 70, 13, MUST), shC(104, 74, 10, MUST2, .5)))] },
    { name: 'Segnaposto', draw: () => [
      S(ell(100, 182, 34, 8, GREY), shE(104, 184, 28, 5, GREY2, .6)),
      S(path('M100,184 C88,160 50,124 50,82 C50,52 72,30 100,30 C128,30 150,52 150,82 C150,124 112,160 100,184Z', RED), sh('M100,184 C112,160 150,124 150,82 C150,60 140,44 126,36 C138,56 140,96 100,184Z', '#B2332C', .6)),
      S(circle(100, 80, 22, WHITE)), g('', path(heartD(100, 82, 22, 20), CORAL, { ink: false, cut: false })),
      hiE(70, 66, 5, 12, 20, .5)] },
  ]
};
