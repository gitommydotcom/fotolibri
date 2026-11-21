/* Mini-libreria per disegnare sticker illustrati in stile "Cartoon":
   forme piene con contorno scuro, ombre e lucidi ritagliati dentro la forma, bordo bianco fustellato e ombra piena sfalsata
   (come la serie Cartoon di Natale). Ogni sticker si disegna in uno spazio 200 × 200; il viewBox viene poi ritagliato.

   Elementi:   shape(tag, geom, fill, opt)   opt: {ink:false} senza contorno, {cut:false} fuori dal bordo bianco, sw: spessore contorno
               line(d, color, sw, opt)        tratto senza riempimento
               g(tr, ...kids)                 gruppo con transform
               S(shape, ...kids)              forma con ombre/lucidi ritagliati dentro, poi il contorno sopra
*/
export const INK = '#2D2333';
export const SW = 3.6;          // contorno
export const BORDER = 8.5;      // bordo bianco fustellato
export const SHADOW = { dx: -3.5, dy: 5.5, c: '#1E2B38' };

const n = v => Math.round(v * 100) / 100;
const geomStr = (geom) => Object.entries(geom).map(([k, v]) => `${k}="${typeof v === 'number' ? n(v) : v}"`).join(' ');

export const shape = (tag, geom, fill, opt = {}) => ({ k: 'shape', tag, geom, fill, ...opt });
export const circle = (cx, cy, r, fill, opt) => shape('circle', { cx, cy, r }, fill, opt);
export const ell = (cx, cy, rx, ry, fill, opt) => shape('ellipse', { cx, cy, rx, ry }, fill, opt);
export const rect = (x, y, w, h, rx, fill, opt) => shape('rect', { x, y, width: w, height: h, rx: rx || 0 }, fill, opt);
export const path = (d, fill, opt) => shape('path', { d }, fill, opt);
export const poly = (pts, fill, opt) => shape('polygon', { points: pts.map(p => p.map(n).join(',')).join(' ') }, fill, opt);
export const line = (d, color = INK, sw = SW, opt = {}) => ({ k: 'line', d, color, sw, ...opt });
export const g = (tr, ...kids) => ({ k: 'g', tr, kids: kids.flat().filter(Boolean) });
export const S = (base, ...kids) => ({ k: 'S', base, kids: kids.flat().filter(Boolean) });
/* lucido bianco (senza contorno, fuori dal bordo) */
export const hi = (d, op = .55) => path(d, '#fff', { ink: false, cut: false, op });
export const hiE = (cx, cy, rx, ry, rot = 0, op = .55) => g(`rotate(${rot} ${cx} ${cy})`, ell(cx, cy, rx, ry, '#fff', { ink: false, cut: false, op }));
export const shine = (d, sw = 4, op = .75) => line(d, '#fff', sw, { cut: false, op });
/* ombra piena dentro una forma (da usare in S) */
export const sh = (d, c, op = 1) => path(d, c, { ink: false, cut: false, op });
export const shC = (cx, cy, r, c, op = 1) => circle(cx, cy, r, c, { ink: false, cut: false, op });
export const shE = (cx, cy, rx, ry, c, op = 1, rot = 0) => g(rot ? `rotate(${rot} ${cx} ${cy})` : '', ell(cx, cy, rx, ry, c, { ink: false, cut: false, op }));

/* ---------- geometrie utili ---------- */
export function heartD(cx, cy, w, h = w) {
  const X = x => n(cx + x * w / 2), Y = y => n(cy + y * h / 2);
  return `M${X(0)},${Y(.92)} C${X(-.22)},${Y(.72)} ${X(-1)},${Y(.24)} ${X(-1)},${Y(-.3)} C${X(-1)},${Y(-.72)} ${X(-.66)},${Y(-.96)} ${X(-.34)},${Y(-.96)} C${X(-.13)},${Y(-.96)} ${X(0)},${Y(-.8)} ${X(0)},${Y(-.62)} C${X(0)},${Y(-.8)} ${X(.13)},${Y(-.96)} ${X(.34)},${Y(-.96)} C${X(.66)},${Y(-.96)} ${X(1)},${Y(-.72)} ${X(1)},${Y(-.3)} C${X(1)},${Y(.24)} ${X(.22)},${Y(.72)} ${X(0)},${Y(.92)} Z`;
}
export function starPts(cx, cy, R, r, k = 5, rot = -90) {
  const out = []; for (let i = 0; i < k * 2; i++) { const a = (rot + i * 180 / k) * Math.PI / 180, q = i % 2 ? r : R; out.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return out;
}
/* poligono con angoli arrotondati (raggio rr) */
export function roundPolyD(pts, rr) {
  const L = pts.length; let d = '';
  for (let i = 0; i < L; i++) {
    const p0 = pts[(i - 1 + L) % L], p1 = pts[i], p2 = pts[(i + 1) % L];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2), r = Math.min(rr, l1 / 2.2, l2 / 2.2);
    const a = [p1[0] + v1[0] / l1 * r, p1[1] + v1[1] / l1 * r], b = [p1[0] + v2[0] / l2 * r, p1[1] + v2[1] / l2 * r];
    d += (i ? 'L' : 'M') + n(a[0]) + ',' + n(a[1]) + 'Q' + n(p1[0]) + ',' + n(p1[1]) + ' ' + n(b[0]) + ',' + n(b[1]);
  }
  return d + 'Z';
}
export const starD = (cx, cy, R, r, k = 5, rr = 4, rot = -90) => roundPolyD(starPts(cx, cy, R, r, k, rot), rr);
/* foglia a mandorla da p1 a p2, larghezza w (bombatura asimmetrica con skew) */
export function leafD(x1, y1, x2, y2, w, skew = 0) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const a = [mx + nx * w + dx * skew, my + ny * w + dy * skew], b = [mx - nx * w + dx * skew, my - ny * w + dy * skew];
  return `M${n(x1)},${n(y1)} Q${n(a[0])},${n(a[1])} ${n(x2)},${n(y2)} Q${n(b[0])},${n(b[1])} ${n(x1)},${n(y1)} Z`;
}
/* fiore: petali ellittici intorno a un centro */
export function petals(cx, cy, k, dist, rx, ry, fill, rot0 = 0, opt = {}) {
  const out = []; for (let i = 0; i < k; i++) { const a = rot0 + i * 360 / k; out.push(g(`rotate(${n(a)} ${cx} ${cy})`, ell(cx, cy - dist, rx, ry, fill, opt))); } return out;
}
/* fiocco: due anse + nodo + code */
export function bow(cx, cy, s, fill, dark) {
  const P = (x, y) => `${n(cx + x * s)},${n(cy + y * s)}`;
  return [
    path(`M${P(-.08, .05)} L${P(-.42, .62)} L${P(-.2, .55)} L${P(-.12, .78)} L${P(.05, .1)} Z`, dark),
    path(`M${P(.08, .05)} L${P(.42, .62)} L${P(.2, .55)} L${P(.12, .78)} L${P(-.05, .1)} Z`, dark),
    S(path(`M${P(0, 0)} C${P(-.3, -.42)} ${P(-.78, -.38)} ${P(-.74, -.02)} C${P(-.7, .32)} ${P(-.28, .24)} ${P(0, 0)} Z`, fill),
      sh(`M${P(0, 0)} C${P(-.28, .24)} ${P(-.7, .32)} ${P(-.74, -.02)} C${P(-.5, .12)} ${P(-.25, .08)} ${P(0, 0)} Z`, dark, .55)),
    S(path(`M${P(0, 0)} C${P(.3, -.42)} ${P(.78, -.38)} ${P(.74, -.02)} C${P(.7, .32)} ${P(.28, .24)} ${P(0, 0)} Z`, fill),
      sh(`M${P(0, 0)} C${P(.28, .24)} ${P(.7, .32)} ${P(.74, -.02)} C${P(.5, .12)} ${P(.25, .08)} ${P(0, 0)} Z`, dark, .55)),
    ell(cx, cy, s * .16, s * .15, fill),
  ];
}
/* faccina kawaii: occhi, guance, sorriso */
export function face(cx, cy, s, o = {}) {
  const e = s * .34, out = [
    ell(cx - e, cy, s * .085, s * .11, INK, { ink: false, cut: false }), ell(cx + e, cy, s * .085, s * .11, INK, { ink: false, cut: false }),
    circle(cx - e + s * .03, cy - s * .04, s * .03, '#fff', { ink: false, cut: false }), circle(cx + e + s * .03, cy - s * .04, s * .03, '#fff', { ink: false, cut: false }),
    line(`M${n(cx - s * .13)},${n(cy + s * .14)} Q${n(cx)},${n(cy + s * .3)} ${n(cx + s * .13)},${n(cy + s * .14)}`, INK, Math.max(2.4, s * .055), { cut: false }),
  ];
  if (o.cheeks !== false) out.push(ell(cx - e - s * .1, cy + s * .2, s * .1, s * .06, o.cheek || '#FF8FA3', { ink: false, cut: false, op: .75 }), ell(cx + e + s * .1, cy + s * .2, s * .1, s * .06, o.cheek || '#FF8FA3', { ink: false, cut: false, op: .75 }));
  return out;
}

/* ---------- resa ----------
   Ogni geometria è scritta una volta sola in <defs> e richiamata con <use>: ombra, bordo bianco, colore e contorno la riusano. */
let CLIP = 0, DEFS = null;
function ref(tag, geom) {
  const key = `<${tag} ${geomStr(geom)}`;
  if (!DEFS.has(key)) DEFS.set(key, 'g' + DEFS.size.toString(36));
  return `<use href="#${DEFS.get(key)}"`;
}
const lref = d => ref('path', { d });
function art(it) {
  if (it.k === 'g') return `<g${it.tr ? ` transform="${it.tr}"` : ''}>${it.kids.map(art).join('')}</g>`;
  if (it.k === 'line') return `${lref(it.d)} fill="none" stroke="${it.color}" stroke-width="${n(it.sw)}" stroke-linecap="round" stroke-linejoin="round"${it.op != null ? ` opacity="${it.op}"` : ''}${it.dash ? ` stroke-dasharray="${it.dash}"` : ''}/>`;
  if (it.k === 'S') {
    const id = 'c' + (++CLIP), b = it.base, u = ref(b.tag, b.geom);
    return `<clipPath id="${id}">${u}/></clipPath>${u} fill="${b.fill}"/><g clip-path="url(#${id})">${it.kids.map(art).join('')}</g>`
      + (b.ink === false ? '' : `${u} fill="none" stroke="${INK}" stroke-width="${n(b.sw || SW)}" stroke-linejoin="round"/>`);
  }
  const st = it.ink === false ? '' : ` stroke="${INK}" stroke-width="${n(it.sw || SW)}" stroke-linejoin="round" stroke-linecap="round"`;
  return `${ref(it.tag, it.geom)} fill="${it.fill}"${st}${it.op != null ? ` opacity="${it.op}"` : ''}/>`;
}
/* sagoma per bordo e ombra: i colori stanno sul gruppo, qui solo lo spessore */
function cut(it, extra) {
  if (it.cut === false) return '';
  if (it.k === 'g') { const k = it.kids.map(x => cut(x, extra)).join(''); return k ? `<g${it.tr ? ` transform="${it.tr}"` : ''}>${k}</g>` : ''; }
  if (it.k === 'S') return cut(it.base, extra);
  if (it.k === 'line') return `${lref(it.d)} fill="none" stroke-width="${n(it.sw + extra)}"/>`;
  return `${ref(it.tag, it.geom)} stroke-width="${n((it.ink === false ? 0 : (it.sw || SW)) + extra)}"/>`;
}
export function render(name, items, o = {}) {
  CLIP = 0; DEFS = new Map(); items = items.flat().filter(Boolean);
  const B = o.border ?? BORDER, body = items.map(art).join(''), sil = items.map(i => cut(i, B * 2)).join('');
  const defs = [...DEFS].map(([k, id]) => `${k} id="${id}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><title>${name}</title><defs>${defs}<g id="s" stroke-linejoin="round" stroke-linecap="round">${sil}</g></defs>`
    + `<use href="#s" transform="translate(${SHADOW.dx} ${SHADOW.dy})" fill="${SHADOW.c}" stroke="${SHADOW.c}"/><use href="#s" fill="#fff" stroke="#fff"/>`
    + `<g>${body}</g></svg>`;
}
