// 把整页主页合成成一张连续的星空长图。
// 用法：node tools/build-page.mjs [snake.svg] [out.svg]
// 传了 snake.svg 就把贪吃蛇内联进来（CI 里每天重绘）。
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [, , snakePath, outArg] = process.argv;

const W = 1200;
const H = 1800;

const MONO = "'SF Mono',Menlo,Consolas,'DejaVu Sans Mono',monospace";
const CJK =
  "-apple-system,'PingFang SC','Microsoft YaHei','Noto Sans SC','Hiragino Sans GB',sans-serif";

const C = {
  text: '#EDE9FA',
  dim: '#B4AAD2',
  muted: '#7E7499',
  pink: '#FFB3D1',
  violet: '#C7B2FF',
  blue: '#8FB8FF',
};

let seed = 0x6d2b79f5;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const f = (n) => Number(n.toFixed(2));

/* ------------------------------ 星场 ------------------------------ */
function starField(count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const r = f(0.35 + rand() * 1.25);
    const cls = r < 0.7 ? 'p-t1' : r < 1.2 ? 'p-t2' : 'p-t3';
    const fill = ['#FFFFFF', '#FFFFFF', '#E9E1FF', '#CFE0FF', '#FFD9EC'][Math.floor(rand() * 5)];
    out += `<circle class="${cls}" style="animation-delay:${f(-rand() * 9)}s" cx="${f(
      rand() * W,
    )}" cy="${f(rand() * H)}" r="${r}" fill="${fill}"/>`;
  }
  return out;
}

function sparkle(x, y, s) {
  const k = f(s * 0.2);
  return `<path class="p-t3" style="animation-delay:${f(-rand() * 7)}s" d="M${x} ${y - s}L${x + k} ${
    y - k
  }L${x + s} ${y}L${x + k} ${y + k}L${x} ${y + s}L${x - k} ${y + k}L${x - s} ${y}L${x - k} ${
    y - k
  }Z" fill="#EDE7FF"/>`;
}

/* ----------------------------- 小工具 ----------------------------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function text(x, y, str, o = {}) {
  const {
    size = 22,
    fill = C.dim,
    ls = 0,
    weight = 400,
    anchor = 'middle',
    family = CJK,
    opacity = 1,
  } = o;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" letter-spacing="${ls}" fill="${fill}"${
    opacity === 1 ? '' : ` opacity="${opacity}"`
  }>${esc(str)}</text>`;
}

function rule(y, opts = {}) {
  const { inset = 80, dot = true } = opts;
  return `<g>
    <line x1="${inset}" y1="${y}" x2="${W - inset}" y2="${y}" stroke="url(#p-rule)" stroke-width="1"/>
    ${dot ? `<circle cx="600" cy="${y}" r="11" fill="url(#p-dot)"/><circle cx="600" cy="${y}" r="2" fill="#FFE3F0"/>` : ''}
  </g>`;
}

function sectionTitle(y, str) {
  return `<g>
    ${sparkle(600 - (str.length * 17) / 2 - 26, y - 10, 5)}
    ${text(600, y, str, { size: 33, fill: C.text, weight: 600, ls: 2 })}
    ${sparkle(600 + (str.length * 17) / 2 + 26, y - 10, 5)}
  </g>`;
}

/* ----------------------------- 项目卡 ----------------------------- */
function card(x, y, w, h, name, lang, langColor, desc) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#FFFFFF" fill-opacity="0.035"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="none" stroke="#C7B2FF" stroke-opacity="0.16"/>
    <line x1="${x + 24}" y1="${y + 1}" x2="${x + w - 24}" y2="${y + 1}" stroke="url(#p-top)" stroke-width="1"/>
    ${text(x + 28, y + 56, name, { size: 22, fill: C.text, weight: 600, family: MONO, anchor: 'start' })}
    <circle cx="${x + 31}" cy="${y + 86}" r="3.5" fill="${langColor}"/>
    ${text(x + 44, y + 91, lang, {
      size: 13,
      fill: C.muted,
      family: MONO,
      anchor: 'start',
      ls: 1,
    })}
    ${text(x + w - 32, y + 54, '↗', { size: 18, fill: C.violet, anchor: 'end', opacity: 0.55 })}
    ${text(x + 28, y + 124, desc[0], { size: 17, fill: C.dim, anchor: 'start' })}
    ${desc[1] ? text(x + 28, y + 154, desc[1], { size: 17, fill: C.dim, anchor: 'start' }) : ''}
  </g>`;
}

/* ----------------------------- 贪吃蛇 ----------------------------- */
function inlineSnake(file, x, y, width) {
  const raw = readFileSync(file, 'utf8');
  const open = raw.indexOf('<svg');
  const vbMatch = /viewBox="([-\d.\s]+)"/.exec(raw.slice(open, raw.indexOf('>', open) + 1));
  const vb = vbMatch ? vbMatch[1].trim().split(/\s+/).map(Number) : [0, 0, 880, 192];
  const inner = raw.slice(raw.indexOf('>', open) + 1, raw.lastIndexOf('</svg>'));
  const height = (width * vb[3]) / vb[2];
  return { height, svg: `<svg x="${x}" y="${y}" width="${width}" height="${f(
    height,
  )}" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid meet">${inner}</svg>` };
}

/* ------------------------------ 组装 ------------------------------ */
const snake = snakePath ? inlineSnake(snakePath, 80, 1360, 1040) : null;

const page = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Lazyeeeeeeee — build lazier, learn faster">
<title>Lazyeeeeeeee — build lazier, learn faster</title>
<defs>
  <linearGradient id="p-sky" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="#05040B"/>
    <stop offset="0.32" stop-color="#0A0716"/>
    <stop offset="0.62" stop-color="#120927"/>
    <stop offset="0.85" stop-color="#0C0719"/>
    <stop offset="1" stop-color="#06050E"/>
  </linearGradient>
  <radialGradient id="p-nebA" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#6C3BFF" stop-opacity="0.5"/>
    <stop offset="1" stop-color="#6C3BFF" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="p-nebB" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#FF5FA2" stop-opacity="0.38"/>
    <stop offset="1" stop-color="#FF5FA2" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="p-nebC" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#2FD2FF" stop-opacity="0.22"/>
    <stop offset="1" stop-color="#2FD2FF" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="p-planet" cx="0.36" cy="0.24" r="0.85">
    <stop offset="0" stop-color="#6B45C8"/>
    <stop offset="0.36" stop-color="#33205E"/>
    <stop offset="0.74" stop-color="#170E2E"/>
    <stop offset="1" stop-color="#0A0716"/>
  </radialGradient>
  <radialGradient id="p-dot" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#FFB3D1" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#FFB3D1" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="p-name" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#FF9CC6"/>
    <stop offset="0.5" stop-color="#C7B2FF"/>
    <stop offset="1" stop-color="#8FB8FF"/>
  </linearGradient>
  <linearGradient id="p-rule" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#C7B2FF" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#C7B2FF" stop-opacity="0.45"/>
    <stop offset="1" stop-color="#C7B2FF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="p-top" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#C7B2FF" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#C7B2FF" stop-opacity="0.45"/>
    <stop offset="1" stop-color="#C7B2FF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="p-trail" gradientUnits="userSpaceOnUse" x1="-200" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
    <stop offset="0.55" stop-color="#CFE0FF" stop-opacity="0.3"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.95"/>
  </linearGradient>
  <linearGradient id="p-trail2" gradientUnits="userSpaceOnUse" x1="-120" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
    <stop offset="0.6" stop-color="#FFD9EC" stop-opacity="0.3"/>
    <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.9"/>
  </linearGradient>
  <filter id="p-haze" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="60"/></filter>
  <filter id="p-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
  <style>
    .p-t1{animation:p-tw1 4s ease-in-out infinite}
    .p-t2{animation:p-tw2 5.6s ease-in-out infinite}
    .p-t3{animation:p-tw3 7.4s ease-in-out infinite}
    @keyframes p-tw1{0%,100%{opacity:.10}50%{opacity:.46}}
    @keyframes p-tw2{0%,100%{opacity:.26}50%{opacity:.82}}
    @keyframes p-tw3{0%,100%{opacity:.40}50%{opacity:1}}
    .p-shot{animation:p-shot 12s linear infinite}
    .p-shot2{animation:p-shot2 17s linear infinite;animation-delay:7s}
    @keyframes p-shot{0%{transform:translate(0,0);opacity:0}2%{opacity:0}5%{opacity:1}17%{opacity:.95}23%{transform:translate(420px,252px);opacity:0}100%{transform:translate(420px,252px);opacity:0}}
    @keyframes p-shot2{0%{transform:translate(0,0);opacity:0}3%{opacity:0}6%{opacity:.85}15%{transform:translate(330px,258px);opacity:0}100%{transform:translate(330px,258px);opacity:0}}
    @media (prefers-reduced-motion:reduce){*{animation:none!important}}
  </style>
</defs>

<rect width="${W}" height="${H}" fill="url(#p-sky)"/>
<g filter="url(#p-haze)" opacity="0.95">
  <ellipse cx="230" cy="210" rx="400" ry="280" fill="url(#p-nebA)"/>
  <ellipse cx="1010" cy="470" rx="360" ry="250" fill="url(#p-nebB)"/>
  <ellipse cx="330" cy="880" rx="420" ry="260" fill="url(#p-nebC)"/>
  <ellipse cx="980" cy="1330" rx="400" ry="270" fill="url(#p-nebA)"/>
  <ellipse cx="420" cy="1700" rx="420" ry="220" fill="url(#p-nebB)"/>
</g>
${starField(560)}
${sparkle(196, 150, 8)}${sparkle(1016, 118, 6)}${sparkle(880, 700, 5)}${sparkle(240, 1240, 5)}${sparkle(1040, 1560, 6)}
<g class="p-shot"><g transform="translate(160,150) rotate(31)">

  <path d="M0 -5.2L-210 0L0 5.2Z" fill="url(#p-trail)" filter="url(#p-soft)" opacity="0.55"/>
  <path d="M0 -2.8L-200 0L0 2.8Z" fill="url(#p-trail)"/>
  <path d="M0 -1.3L-96 0L0 1.3Z" fill="url(#p-trail2)"/>
  <circle cx="0" cy="0" r="2.6" fill="#FFFFFF"/>
  <circle cx="0" cy="0" r="12" fill="#CFE0FF" opacity="0.22" filter="url(#p-soft)"/>
</g></g>
<g class="p-shot2"><g transform="translate(1010,420) rotate(38)">

  <path d="M0 -4L-128 0L0 4Z" fill="url(#p-trail2)" filter="url(#p-soft)" opacity="0.5"/>
  <path d="M0 -1.9L-120 0L0 1.9Z" fill="url(#p-trail2)"/>
  <circle cx="0" cy="0" r="1.7" fill="#FFFFFF"/>
  <circle cx="0" cy="0" r="8" fill="#CFE0FF" opacity="0.18" filter="url(#p-soft)"/>
</g></g>

<!-- Hero -->
${text(600, 300, 'Lazyeeeeeeee', { size: 76, fill: 'url(#p-name)', weight: 700, ls: 3, family: MONO, opacity: 0.45 })}
${text(600, 300, 'Lazyeeeeeeee', { size: 76, fill: 'url(#p-name)', weight: 700, ls: 3, family: MONO })}
${text(600, 352, 'BUILD LAZIER · LEARN FASTER', { size: 14, fill: C.muted, ls: 7, family: MONO })}

${rule(610)}

<!-- 我在做什么 -->
${sectionTitle(670, '我在做什么')}
${text(600, 736, 'LazyLearn —— 把「刷题 → 模考 → AI 讲解 → 错题记忆」串成闭环的学习系统', {
  size: 24,
  fill: C.text,
})}
${text(600, 780, '学习者不缺题，缺的是反馈密度。', { size: 21, fill: C.dim })}
${text(600, 818, '所以整套设计都把 agent 放在「出反馈」的位置上，人只负责最后一步判断。', {
  size: 20,
  fill: C.muted,
})}

${rule(880)}

<!-- 两个客户端 -->
${sectionTitle(940, '两个客户端')}
${card(120, 990, 460, 190, 'lazylearn-obsidian', 'TypeScript', C.violet, [
  '在 Obsidian 里直接练题、归档错题，',
  '笔记双向同步。',
])}
${card(620, 990, 460, 190, 'lazylearn-marginnote-plugin', 'JavaScript', C.pink, [
  'MarginNote 4 摘录一键成闪卡，',
  '带 AI 辅导与题库检索。',
])}

${rule(1220)}

<!-- 贡献 -->
${sectionTitle(1280, '贡献')}
${text(600, 1322, '公开 + 私有提交，每天自动重绘', { size: 17, fill: C.muted, ls: 1 })}
${snake ? snake.svg : `<rect x="80" y="1360" width="1040" height="227" rx="14" fill="#FFFFFF" fill-opacity="0.02"/>`}

<!-- Footer -->
${rule(1620, { dot: false })}
${text(600, 1658, 'LET THE MACHINE DO THE REMEMBERING', { size: 13, fill: C.muted, ls: 6, family: MONO })}
<circle cx="600" cy="1880" r="200" fill="url(#p-planet)"/>
<circle cx="600" cy="1880" r="200" fill="none" stroke="#C7B2FF" stroke-opacity="0.45" stroke-width="1.2"/>
<path d="M442 1757A200 200 0 0 1 758 1757" fill="none" stroke="#FFB3D1" stroke-opacity="0.5" stroke-width="2" stroke-linecap="round" filter="url(#p-soft)"/>
<circle cx="838" cy="1712" r="5" fill="#FFD9EC"/>
<circle cx="838" cy="1712" r="13" fill="#FFB3D1" opacity="0.16" filter="url(#p-soft)"/>
</svg>
`;

const out = outArg ? resolve(outArg) : resolve('dist/page.svg');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`page written: ${out} (${(page.length / 1024).toFixed(1)} KB)`);
