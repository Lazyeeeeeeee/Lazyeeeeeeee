// 给贪吃蛇 SVG 铺上星空底：在 <svg> 开标签后插入背景与星场。
// 用法：node tools/space-bg.mjs dist/snake.svg [...]
import { readFileSync, writeFileSync } from 'node:fs';

let seed = 0x51ed270b;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const f = (n) => Number(n.toFixed(2));

function starField(count, x0, y0, w, h) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const r = f(0.3 + rand() * 1.1);
    out += `<circle cx="${f(x0 + rand() * w)}" cy="${f(y0 + rand() * h)}" r="${r}" fill="#FFFFFF" opacity="${f(
      0.15 + rand() * 0.6,
    )}"/>`;
  }
  return out;
}

for (const file of process.argv.slice(2)) {
  const svg = readFileSync(file, 'utf8');
  const open = svg.indexOf('<svg');
  if (open < 0) throw new Error(`no <svg> in ${file}`);
  const head = svg.slice(open, svg.indexOf('>', open) + 1);

  let x0 = 0;
  let y0 = 0;
  let w = 1000;
  let h = 220;
  const vb = /viewBox="([-\d.\s]+)"/.exec(head);
  if (vb) {
    const [a, b, c, d] = vb[1].trim().split(/\s+/).map(Number);
    [x0, y0, w, h] = [a, b, c, d];
  }

  const bg = [
    '<defs>',
    '<linearGradient id="spaceSky" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0" stop-color="#06050D"/>',
    '<stop offset="0.6" stop-color="#0E0A20"/>',
    '<stop offset="1" stop-color="#170C2E"/>',
    '</linearGradient>',
    '</defs>',
    `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="url(#spaceSky)"/>`,
    starField(Math.round((w * h) / 2200), x0, y0, w, h),
  ].join('');

  const end = svg.indexOf('>', open) + 1;
  writeFileSync(file, svg.slice(0, end) + bg + svg.slice(end));
  console.log(`space background applied: ${file}`);
}
