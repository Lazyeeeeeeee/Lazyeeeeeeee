// 生成个人主页的星空素材：确定性随机，重复构建结果一致。
// 用法：node tools/gen-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '..', 'assets');
mkdirSync(OUT, { recursive: true });

let seed = 0x9e3779b9;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (a) => a[Math.floor(rand() * a.length)];
const f = (n) => Number(n.toFixed(2));

const MOTION = `
.t1{animation:tw1 4s ease-in-out infinite}
.t2{animation:tw2 5.6s ease-in-out infinite}
.t3{animation:tw3 7.4s ease-in-out infinite}
@keyframes tw1{0%,100%{opacity:.10}50%{opacity:.46}}
@keyframes tw2{0%,100%{opacity:.28}50%{opacity:.85}}
@keyframes tw3{0%,100%{opacity:.42}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

function starField(count, w, h) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const r = f(0.35 + rand() * 1.2);
    const cls = r < 0.7 ? 't1' : r < 1.15 ? 't2' : 't3';
    out.push(
      `<circle class="${cls}" style="animation-delay:${f(-rand() * 9)}s" cx="${f(rand() * w)}" cy="${f(rand() * h)}" r="${r}" fill="${pick(['#FFFFFF', '#FFFFFF', '#E9E1FF', '#CFE0FF', '#FFD9EC'])}"/>`,
    );
  }
  return out.join('');
}

function sparkle(x, y, s) {
  const k = f(s * 0.2);
  return `<path class="t3" style="animation-delay:${f(-rand() * 7)}s" d="M${x} ${y - s} L${x + k} ${y - k} L${x + s} ${y} L${x + k} ${y + k} L${x} ${y + s} L${x - k} ${y + k} L${x - s} ${y} L${x - k} ${y - k}Z" fill="#EDE7FF"/>`;
}

const COMMON_DEFS = `
  <radialGradient id="nebA" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#6C3BFF" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#6C3BFF" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="nebB" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#FF5FA2" stop-opacity="0.40"/>
    <stop offset="1" stop-color="#FF5FA2" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="nebC" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#2FD2FF" stop-opacity="0.26"/>
    <stop offset="1" stop-color="#2FD2FF" stop-opacity="0"/>
  </radialGradient>
  <filter id="haze" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="55"/></filter>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>`;

/* ------------------------------- hero ------------------------------- */
const HW = 1200;
const HH = 520;

const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HW} ${HH}" width="${HW}" height="${HH}" role="img" aria-label="Lazyeeeeeeee">
  <title>Lazyeeeeeeee — build lazier, learn faster</title>
  <defs>${COMMON_DEFS}
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#06050D"/>
      <stop offset="0.42" stop-color="#0C0919"/>
      <stop offset="0.74" stop-color="#150B2A"/>
      <stop offset="1" stop-color="#08060F"/>
    </linearGradient>
    <linearGradient id="nameGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FF9CC6"/>
      <stop offset="0.5" stop-color="#C7B2FF"/>
      <stop offset="1" stop-color="#8FB8FF"/>
    </linearGradient>
    <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="0.78" stop-color="#D9E6FF" stop-opacity="0.65"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C7B2FF" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#C7B2FF" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#C7B2FF" stop-opacity="0"/>
    </linearGradient>
    <style>${MOTION}
      .shoot{animation:shoot 13s linear infinite}
      .shoot2{animation:shoot2 19s linear infinite;animation-delay:6s}
      @keyframes shoot{0%{transform:translate(0,0);opacity:0}2%{opacity:1}8%{opacity:.85}13%{transform:translate(430px,190px);opacity:0}100%{transform:translate(430px,190px);opacity:0}}
      @keyframes shoot2{0%{transform:translate(0,0);opacity:0}2%{opacity:.9}7%{opacity:.7}11%{transform:translate(-380px,150px);opacity:0}100%{transform:translate(-380px,150px);opacity:0}}
    </style>
  </defs>
  <rect width="${HW}" height="${HH}" fill="url(#sky)"/>
  <g filter="url(#haze)" opacity="0.95">
    <ellipse cx="250" cy="140" rx="340" ry="230" fill="url(#nebA)"/>
    <ellipse cx="990" cy="340" rx="370" ry="210" fill="url(#nebB)"/>
    <ellipse cx="770" cy="40" rx="270" ry="150" fill="url(#nebC)"/>
  </g>
  ${starField(170, HW, HH)}
  ${sparkle(196, 118, 8)}${sparkle(1018, 84, 6)}${sparkle(892, 372, 5)}${sparkle(128, 348, 4)}
  <g class="shoot"><rect x="120" y="60" width="130" height="2" rx="1" fill="url(#trail)"/></g>
  <g class="shoot2"><rect x="1080" y="96" width="110" height="1.6" rx="1" fill="url(#trail)"/></g>
  <text x="600" y="248" text-anchor="middle" font-family="'SF Mono',Menlo,Consolas,monospace" font-size="70" font-weight="700" letter-spacing="3" fill="url(#nameGrad)" opacity="0.5" filter="url(#soft)">Lazyeeeeeeee</text>
  <text x="600" y="248" text-anchor="middle" font-family="'SF Mono',Menlo,Consolas,monospace" font-size="70" font-weight="700" letter-spacing="3" fill="url(#nameGrad)">Lazyeeeeeeee</text>
  <text x="600" y="294" text-anchor="middle" font-family="'SF Mono',Menlo,Consolas,monospace" font-size="13" letter-spacing="7" fill="#A79DC4">BUILD LAZIER · LEARN FASTER</text>
  <rect x="0" y="${HH - 1}" width="${HW}" height="1" fill="url(#hair)"/>
</svg>
`;

/* ------------------------------ divider ----------------------------- */
const DW = 1200;
const DH = 96;

const divider = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${DW} ${DH}" width="${DW}" height="${DH}" role="img" aria-label="">
  <title>divider</title>
  <defs>${COMMON_DEFS}
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#06050D"/>
      <stop offset="0.5" stop-color="#0E0A20"/>
      <stop offset="1" stop-color="#06050D"/>
    </linearGradient>
    <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="0.8" stop-color="#D9E6FF" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="1"/>
    </linearGradient>
    <style>${MOTION}
      .beam{animation:beam 11s ease-in-out infinite}
      @keyframes beam{0%,100%{transform:translateX(-140px);opacity:0}12%{opacity:1}55%{opacity:.85}68%{transform:translateX(1080px);opacity:0}100%{transform:translateX(1080px);opacity:0}}
    </style>
  </defs>
  <rect width="${DW}" height="${DH}" fill="url(#band)"/>
  <g filter="url(#haze)" opacity="0.6">
    <ellipse cx="280" cy="48" rx="270" ry="95" fill="url(#nebA)"/>
    <ellipse cx="920" cy="62" rx="250" ry="85" fill="url(#nebB)"/>
  </g>
  ${starField(64, DW, DH)}
  <g class="beam"><rect x="80" y="34" width="96" height="1.6" rx="1" fill="url(#trail)"/></g>
  <rect x="0" y="0" width="${DW}" height="1" fill="#C7B2FF" opacity="0.14"/>
  <rect x="0" y="${DH - 1}" width="${DW}" height="1" fill="#C7B2FF" opacity="0.14"/>
</svg>
`;

/* ------------------------------- footer ----------------------------- */
const FW = 1200;
const FH = 240;

const footer = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${FH}" width="${FW}" height="${FH}" role="img" aria-label="let the machine do the remembering">
  <title>let the machine do the remembering</title>
  <defs>${COMMON_DEFS}
    <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#08060F"/>
      <stop offset="1" stop-color="#150B2A"/>
    </linearGradient>
    <radialGradient id="planet" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#3A2470"/>
      <stop offset="0.6" stop-color="#1A1033"/>
      <stop offset="1" stop-color="#0B0718"/>
    </radialGradient>
    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#C7B2FF" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#C7B2FF" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#C7B2FF" stop-opacity="0"/>
    </linearGradient>
    <style>${MOTION}
      .orbit{animation:orbit 26s linear infinite;transform-origin:600px 300px}
      @keyframes orbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    </style>
  </defs>
  <rect width="${FW}" height="${FH}" fill="url(#sky2)"/>
  <g filter="url(#haze)" opacity="0.85">
    <ellipse cx="600" cy="240" rx="400" ry="150" fill="url(#nebA)"/>
    <ellipse cx="240" cy="180" rx="220" ry="90" fill="url(#nebB)"/>
  </g>
  ${starField(110, FW, FH)}
  <circle cx="600" cy="300" r="170" fill="url(#planet)"/>
  <g class="orbit"><ellipse cx="600" cy="300" rx="215" ry="34" fill="none" stroke="url(#ringGrad)" stroke-width="1.6" transform="rotate(-14 600 300)"/></g>
  <circle cx="809" cy="248" r="4.5" fill="#FFD9EC"/>
  <text x="600" y="52" text-anchor="middle" font-family="'SF Mono',Menlo,Consolas,monospace" font-size="12" letter-spacing="6" fill="#8D82B5">LET THE MACHINE DO THE REMEMBERING</text>
</svg>
`;

writeFileSync(resolve(OUT, 'hero.svg'), hero);
writeFileSync(resolve(OUT, 'divider.svg'), divider);
writeFileSync(resolve(OUT, 'footer.svg'), footer);
console.log('assets written:', ['hero.svg', 'divider.svg', 'footer.svg'].join(', '));
