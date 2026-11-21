// Genera le cartelle "stickers <tema>/" (SVG) dai disegni in tools/stickers/sets/*.mjs.
// Uso: node tools/stickers/make.mjs [nome-set ...]     (poi: node build.mjs)
// Il viewBox di ogni sticker viene ritagliato sul disegno reale (bordo bianco e ombra compresi) con Chromium.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { render } from './lib.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = new URL('../../', import.meta.url), setsDir = new URL('./sets/', import.meta.url);
const only = process.argv.slice(2);
const files = readdirSync(setsDir).filter(f => f.endsWith('.mjs')).sort().filter(f => !only.length || only.includes(f.replace(/\.mjs$/, '')));
const out = [];
for (const f of files) {
  const mod = await import(new URL(f, setsDir));
  for (const set of [].concat(mod.default)) {
    for (const st of set.stickers) out.push({ folder: set.folder, file: st.file || `Cartoon ${set.stickers.indexOf(st) + 1}`, svg: render(st.name, st.draw()) });
  }
}
/* ritaglio del viewBox sui pixel effettivamente disegnati */
const b = await chromium.launch(), p = await b.newPage();
await p.setContent('<canvas id="c" width="800" height="800"></canvas>');
for (const s of out) {
  const box = await p.evaluate(async svg => {
    const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('viewBox="0 0 200 200"', 'viewBox="-40 -40 280 280" width="800" height="800"'));
    await im.decode(); const c = document.getElementById('c'), x = c.getContext('2d'); x.clearRect(0, 0, 800, 800); x.drawImage(im, 0, 0, 800, 800);
    const d = x.getImageData(0, 0, 800, 800).data; let x0 = 800, y0 = 800, x1 = -1, y1 = -1;
    for (let y = 0; y < 800; y++)for (let i = 0; i < 800; i++)if (d[(y * 800 + i) * 4 + 3] > 8) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const k = 280 / 800; return [x0 * k - 40, y0 * k - 40, (x1 + 1) * k - 40, (y1 + 1) * k - 40];
  }, s.svg);
  const [x0, y0, x1, y1] = box.map(v => Math.round(v * 10) / 10), pad = 1;
  if (x0 < -39 || y0 < -39 || x1 > 239 || y1 > 239) console.warn('  ! disegno oltre i margini:', s.folder, s.file);
  s.svg = s.svg.replace('viewBox="0 0 200 200"', `viewBox="${(x0 - pad).toFixed(1)} ${(y0 - pad).toFixed(1)} ${(x1 - x0 + 2 * pad).toFixed(1)} ${(y1 - y0 + 2 * pad).toFixed(1)}"`);
}
await b.close();
const folders = [...new Set(out.map(s => s.folder))];
for (const fo of folders) {
  const dir = new URL(`stickers ${fo}/`, root);
  if (existsSync(dir)) for (const f of readdirSync(dir)) if (/^Cartoon \d+\.svg$/.test(f)) rmSync(new URL(f, dir));
  mkdirSync(dir, { recursive: true });
}
for (const s of out) writeFileSync(new URL(`stickers ${s.folder}/${s.file}.svg`, root), s.svg + '\n');
console.log(folders.map(fo => `stickers ${fo}: ${out.filter(s => s.folder === fo).length}`).join('\n'));
