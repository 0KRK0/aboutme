/* Rajesh World: a small isometric island of the portfolio.
   Plain Canvas 2D, no engine and no 3D library. It loads only when someone
   opens it (#world), so the main site stays fast. */

import {
  zones, worldHub, secretSpot, quests, progressGoals, worldAssets, projects, papers, awards, channels, voicePillars,
  credentials, msc, identity, type Zone, type Exhibit, type Lane,
} from '../data';
import { esc } from '../render';
import { $, $$, store, reduced, run as act, go, toast, trapFocus } from '../ui/core';

/* ── geometry ─────────────────────────────────────────────── */
const N = 56, C = 28, TW = 64, TH = 32;
type V = { x: number; y: number };
const iso = (x: number, y: number, z = 0) => ({ sx: (x - y) * TW / 2, sy: (x + y) * TH / 2 - z });
const dist = (a: V, b: V) => Math.hypot(a.x - b.x, a.y - b.y);

function rng(seed: number) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const islandR = (a: number) => 23.6 + 1.5 * Math.sin(3 * a) + 1.1 * Math.cos(5 * a + 1);
const isLand = (x: number, y: number) => { const dx = x - C, dy = y - C; return Math.hypot(dx, dy) < islandR(Math.atan2(dy, dx)); };

interface Placed extends Exhibit { x: number; y: number; zone: string; lane: Lane }
interface ZoneL extends Zone { cx: number; cy: number; v: V; road: V[]; b: { x0: number; y0: number; x1: number; y1: number; h: number } }

function layout() {
  const zs: ZoneL[] = zones.map(z => {
    const th = z.angle * Math.PI / 180, Rs = 22;
    const sx = Rs * Math.sin(th), sy = -Rs * Math.cos(th);
    const cx = C + (sx + sy) / 2, cy = C + (sy - sx) / 2;
    // buildings sit on the far side of their plaza as seen on screen, so they never hide the exhibits
    const up = { x: -Math.SQRT1_2, y: -Math.SQRT1_2 };
    const len = Math.hypot(cx - C, cy - C); const away = { x: (cx - C) / len, y: (cy - C) / len };
    const u = Math.cos(th) < -.2 ? up : away;
    const v = { x: -u.x, y: -u.y };
    const bx = cx + u.x * 2.6, by = cy + u.y * 2.6;
    const { w, d, h } = z.building;
    // road from the hub; if the building stands between hub and plaza, the road bends around it
    const perp = { x: -u.y, y: u.x };
    const road: V[] = u === up
      ? [{ x: C, y: C }, { x: cx + u.x * 1.2 + perp.x * 4.4, y: cy + u.y * 1.2 + perp.y * 4.4 }, { x: cx, y: cy }]
      : [{ x: C, y: C }, { x: cx, y: cy }];
    return { ...z, cx, cy, v, road, b: { x0: bx - w / 2, y0: by - d / 2, x1: bx + w / 2, y1: by + d / 2, h } };
  });
  const props: Placed[] = [];
  for (const z of zs) {
    const perp = { x: -z.v.y, y: z.v.x };
    const n = z.exhibits.length, perRow = n > 5 ? Math.ceil(n / 2) : n;
    z.exhibits.forEach((e, i) => {
      const row = Math.floor(i / perRow), col = i % perRow, cols = Math.min(perRow, n - row * perRow);
      const off = (col - (cols - 1) / 2) * 1.55;
      props.push({ ...e, zone: z.id, lane: z.lane, x: z.cx + z.v.x * (0.6 + row * 1.7) + perp.x * off, y: z.cy + z.v.y * (0.6 + row * 1.7) + perp.y * off });
    });
  }
  // tiles: 0 water, 1 land, 2 path, 3 plaza, 4 zone floor
  const tiles = new Uint8Array(N * N);
  const zoneTint = new Int8Array(N * N).fill(-1);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = x + .5, py = y + .5;
    if (!isLand(px, py)) continue;
    let t = 1;
    if (dist({ x: px, y: py }, { x: C, y: C }) < 3.6) t = 3;
    zs.forEach((z, zi) => { if (dist({ x: px, y: py }, { x: z.cx, y: z.cy }) < 3.4) { t = 4; zoneTint[y * N + x] = zi; } });
    if (t === 1) outer: for (const z of zs) for (let i = 0; i < z.road.length - 1; i++) {
      const ax = z.road[i].x, ay = z.road[i].y, bx = z.road[i + 1].x, by = z.road[i + 1].y;
      const l2 = (bx - ax) ** 2 + (by - ay) ** 2; let k = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2; k = Math.max(0, Math.min(1, k));
      if (Math.hypot(px - (ax + k * (bx - ax)), py - (ay + k * (by - ay))) < .95) { t = 2; break outer; }
    }
    tiles[y * N + x] = t;
  }
  // trees: deterministic scatter, kept clear of paths, plazas and buildings
  const r = rng(7), trees: V[] = [];
  const clearOf = (x: number, y: number) => zs.every(z => x < z.b.x0 - 1.4 || x > z.b.x1 + 1.4 || y < z.b.y0 - 1.4 || y > z.b.y1 + 1.4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const px = x + .2 + r() * .6, py = y + .2 + r() * .6;
    if (tiles[y * N + x] !== 1 || !isLand(px + .8, py + .8) || !isLand(px - .8, py - .8)) continue;
    if (dist({ x: px, y: py }, secretSpot) < 3.3) continue;
    const edge = Math.hypot(px - C, py - C) > islandR(Math.atan2(py - C, px - C)) - 4.5;
    if (r() < (edge ? .2 : .06) && clearOf(px, py) && zs.every(z => dist({ x: px, y: py }, { x: z.cx, y: z.cy }) > 4.2)) trees.push({ x: px, y: py });
  }
  // the hedge around the old server: a ring of trees with one gap facing away from the hub
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    const gap = Math.atan2(secretSpot.y - C, secretSpot.x - C); // gap points outward
    if (Math.abs(Math.atan2(Math.sin(a - gap), Math.cos(a - gap))) < .42) continue;
    trees.push({ x: secretSpot.x + Math.cos(a) * 2.2, y: secretSpot.y + Math.sin(a) * 2.2 });
  }
  return { zs, props, tiles, zoneTint, trees };
}

/* ── colours come from the site's CSS tokens ─────────────── */
type Pal = Record<string, string>;
function readPalette(): Pal {
  const cs = getComputedStyle(document.documentElement);
  const g = (k: string) => cs.getPropertyValue(k).trim();
  const dark = (document.documentElement.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
  return {
    dark: dark ? '1' : '', bg: g('--bg'), surface: g('--surface'), ink: g('--ink'), ink2: g('--ink-2'), muted: g('--muted'), rule: g('--rule'), rule2: g('--rule-2'),
    main: g('--l-main'), systems: g('--l-systems'), enterprise: g('--l-enterprise'), ai: g('--l-ai'), research: g('--l-research'),
    water: dark ? '#0b1522' : '#c9d5e3', water2: dark ? '#10202f' : '#dbe4ee', sand: dark ? '#1c2430' : '#e7e2d6',
    land: dark ? '#121a24' : '#f3f5f8', land2: dark ? '#0f1620' : '#eceff4', path: dark ? '#1b2533' : '#dde3ea', plaza: dark ? '#18212d' : '#e4e9ef',
    tree1: dark ? '#2f6a55' : '#5d937b', tree2: dark ? '#214b3c' : '#467a63', trunk: dark ? '#3a2f25' : '#8a6c52', shadow: dark ? 'rgba(0,0,0,.45)' : 'rgba(12,20,32,.14)',
  };
}
const parse = (c: string): number[] => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) return m[1].split(',').slice(0, 3).map(v => parseFloat(v));
  const h = c.replace('#', '').trim(); const f = h.length === 3 ? h.split('').map(x => x + x).join('') : h.slice(0, 6);
  const n = parseInt(f, 16); return Number.isNaN(n) ? [128, 128, 128] : [n >> 16 & 255, n >> 8 & 255, n & 255];
};
const shade = (c: string, amt: number) => `rgb(${parse(c).map(v => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)))).join(',')})`;
const mix = (a: string, b: string, t: number) => { const A = parse(a), B = parse(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };

/* ── progress (local only) ───────────────────────────────── */
interface Progress { found: string[]; zones: string[]; quests: string[]; intro?: boolean; controlsHidden?: boolean }
const loadProgress = (): Progress => ({ found: [], zones: [], quests: [], ...store.json<Partial<Progress>>('world-progress', {}) });
const saveProgress = (p: Progress) => store.set('world-progress', JSON.stringify(p));

const awardKind = ['Client recognition', 'Certificate of contribution', 'Workplace award', 'Academic standing', 'Competition prize', 'Competition medal'];

/* ── the world ───────────────────────────────────────────── */
export function enterWorld(root: HTMLElement, onExit: () => void) {
  const test = document.createElement('canvas');
  if (!test.getContext || !test.getContext('2d')) {
    root.innerHTML = `<div class="w-fallback"><p class="h3">Rajesh World is unavailable on this device.</p><button type="button" class="btn btn-solid" data-w-exit>Explore the portfolio</button></div>`;
    $('[data-w-exit]', root).addEventListener('click', () => { root.hidden = true; onExit(); });
    return;
  }

  const L = layout();
  const prog = loadProgress();
  const coarse = matchMedia('(pointer: coarse)').matches;
  let P = readPalette();

  root.innerHTML = `
    <canvas class="w-canvas" tabindex="0" aria-label="Rajesh World. Move with W A S D or the arrow keys, press E to explore, M for the map, Escape for the menu."></canvas>
    <div class="w-hud">
      <div class="w-top-left">
        <p class="w-zone"><span class="dot" aria-hidden="true"></span><span data-w-zone>${worldHub.name}</span></p>
        <button type="button" class="w-quest" data-w-open="progress"><span class="w-q-k">quest <b data-w-qn></b>/6</span><span data-w-qt></span></button>
      </div>
      <div class="w-top-right">
        <button type="button" class="w-btn" data-w-open="map" aria-label="Map (M)"><span>Map</span><kbd>M</kbd></button>
        <button type="button" class="w-btn" data-w-open="progress" aria-label="Progress (I)"><span>Progress</span><kbd>I</kbd></button>
        <button type="button" class="w-btn" data-w-act="terminal" aria-label="Terminal (T)"><span>Terminal</span><kbd>T</kbd></button>
        <button type="button" class="w-btn" data-w-act="hire"><span>Work with me</span></button>
        <button type="button" class="w-btn w-exit" data-w-open="menu" aria-label="Menu (Escape)"><span>Exit</span><kbd>Esc</kbd></button>
      </div>
      <div class="w-controls"${prog.controlsHidden ? ' hidden' : ''}>
        <p class="w-c-h">Controls</p>
        <ul>
          <li><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>Move</li>
          <li><span><kbd>E</kbd></span>Explore</li>
          <li><span><kbd>M</kbd></span>Map</li>
          <li><span><kbd>T</kbd></span>Terminal</li>
          <li><span><kbd>1</kbd>–<kbd>9</kbd></span>Travel</li>
          <li><span><kbd>Esc</kbd></span>Menu / exit</li>
        </ul>
        <button type="button" class="w-c-x" data-w-hide-controls>Got it</button>
      </div>
      <p class="w-prompt" data-w-prompt hidden></p>
      <div class="w-toast" data-w-toast aria-live="polite"></div>
      ${coarse ? `<div class="w-joy" data-w-joy aria-hidden="true"><span></span></div><button type="button" class="w-e" data-w-e hidden>Explore</button>` : ''}
    </div>
    <div class="w-layer" data-w-layer hidden><div class="w-panel" role="dialog" aria-modal="true" tabindex="-1"></div></div>
    <div class="w-intro" data-w-intro hidden></div>`;

  const canvas = $<HTMLCanvasElement>('.w-canvas', root);
  const ctx = canvas.getContext('2d')!;
  const layer = $('[data-w-layer]', root), panel = $('.w-panel', root);
  const promptEl = $('[data-w-prompt]', root), toastEl = $('[data-w-toast]', root);
  let W = 0, H = 0, dpr = 1, zoom = 1;
  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = root.clientWidth; H = root.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    zoom = Math.max(.62, Math.min(1.15, Math.min(W, H * 1.4) / 1000));
  };
  resize();
  addEventListener('resize', resize);

  /* player */
  const start = { x: C + 2.2, y: C + 2.2 };
  const player = { x: start.x, y: start.y, dir: { x: 1, y: 1 }, moving: false, t: 0 };
  const cam = { x: 0, y: 0 };
  { const s = iso(player.x, player.y); cam.x = s.sx; cam.y = s.sy; }
  const keys = new Set<string>();
  const joy = { x: 0, y: 0 };
  let near: Placed | { id: 'hub' } | { id: 'secret' } | null = null;
  let currentZone = '';
  let paused = false;

  /* collision */
  const blocked = (x: number, y: number) => {
    if (!isLand(x, y)) return true;
    for (const z of L.zs) if (x > z.b.x0 - .25 && x < z.b.x1 + .25 && y > z.b.y0 - .25 && y < z.b.y1 + .25) return true;
    if (Math.hypot(x - C, y - C) < .95) return true;
    for (const t of L.trees) if (Math.abs(t.x - x) < .5 && Math.abs(t.y - y) < .5 && Math.hypot(t.x - x, t.y - y) < .42) return true;
    if (Math.hypot(x - secretSpot.x, y - secretSpot.y) < .5) return true;
    return false;
  };

  /* discovery */
  const qEls = { n: $('[data-w-qn]', root), t: $('[data-w-qt]', root) };
  const questDone = (q: typeof quests[number]) => q.needs.every(n => n.startsWith('zone:') ? prog.zones.includes(n.slice(5)) : n.split('|').some(x => prog.found.includes(x)));
  function refreshQuests(announce = true) {
    for (const q of quests) if (!prog.quests.includes(q.id) && questDone(q)) {
      prog.quests.push(q.id);
      if (announce) wToast(`+ EXPERIENCE DISCOVERED · ${q.title}`);
    }
    const next = quests.find(q => !prog.quests.includes(q.id));
    qEls.n.textContent = String(prog.quests.length);
    qEls.t.textContent = next ? next.title : 'All quests complete';
    saveProgress(prog);
  }
  function discover(id: string) {
    if (!prog.found.includes(id)) { prog.found.push(id); if (id === 'secret') store.set('world-secret', '1'); }
    refreshQuests();
  }
  let toastT = 0;
  function wToast(s: string) { toastEl.textContent = s; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = window.setTimeout(() => toastEl.classList.remove('is-on'), 2600); }
  refreshQuests(false);

  /* ── panels ─────────────────────────────────────────────── */
  type Btn = { label: string; goto?: string; url?: string; run?: string; arg?: string; solid?: boolean };
  function panelHtml(kicker: string, title: string, body: string, btns: Btn[], lane: Lane = 'main') {
    return `<div class="w-p-head" data-lane="${lane}"><p class="eyebrow"><span class="dot" aria-hidden="true"></span>${esc(kicker)}</p><h2 class="w-p-title" id="w-p-title">${esc(title)}</h2></div>
      <div class="w-p-body">${body}</div>
      <div class="w-p-actions">${btns.map(b => b.url
        ? `<a class="btn ${b.solid ? 'btn-solid' : 'btn-line'} sm" href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.label)} ↗</a>`
        : `<button type="button" class="btn ${b.solid ? 'btn-solid' : 'btn-line'} sm" ${b.goto ? `data-w-goto="${b.goto}"` : ''}${b.run ? ` data-w-run="${b.run}"` : ''}${b.arg ? ` data-w-arg="${b.arg}"` : ''}>${esc(b.label)}</button>`).join('')}
        <button type="button" class="btn btn-ghost sm" data-w-close>Back to the world <kbd>Esc</kbd></button></div>`;
  }
  const metric = (v: string, k: string) => `<div class="w-m"><b>${esc(v)}</b><span>${esc(k)}</span></div>`;
  const list = (xs: string[]) => `<ul class="w-list">${xs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;

  function contentFor(target: Placed | { id: 'hub' } | { id: 'secret' }): string {
    if (target.id === 'hub') return panelHtml('central hub', identity.name, `<p>${esc(identity.role)} · ${esc(identity.focusLine)}</p><div class="w-metrics">${metric(identity.location, 'location')}${metric('MSc CS', 'University of Edinburgh')}${metric('2+ yrs', 'enterprise engineering')}</div><p class="w-note">Every path from here leads to a part of my work. Press <kbd>M</kbd> for the map.</p>`, [{ label: 'Open the map', run: 'map', solid: true }]);
    if (target.id === 'secret') return panelHtml('hidden', 'An old build server', `<p>Still humming. A sticky note on the rack reads:</p><pre class="w-pre">$ sudo unlock</pre><p class="w-note">Try it in the terminal.</p>`, [{ label: 'Open the terminal', run: 'terminal', solid: true }]);
    const e = target as Placed, ref = e.ref;
    if (ref.type === 'project') {
      const p = projects.find(x => x.id === ref.id)!;
      const metrics = p.id === 'lexora' ? `<div class="w-metrics">${metric('100K+', 'pageviews')}${metric('6.7M+', 'requests')}${metric('Full stack', 'built solo')}${metric('LLM', 'integration')}</div>` : '';
      const extra = p.id === 'voicepassport' ? '<p class="w-note">AI Passport Ideathon · participated, no award claimed. A separate project from ownVoicz; both explore who controls a voice.</p>'
        : p.id === 'ownvoicz' ? '<p class="w-note">Separate from Voice Passport. The pillars around this lab are ownVoicz’s roadmap.</p>' : '';
      return panelHtml(`${p.lane} · ${p.statusLabel}`, p.name, `<p>${esc(p.summary)}</p>${metrics}${p.facts.length && p.id !== 'lexora' ? list(p.facts) : ''}${p.tech.length ? `<p class="tags">${p.tech.map(t => `<span>${esc(t)}</span>`).join('')}</p>` : ''}${extra}`,
        [{ label: 'Open case study', goto: p.anchor, solid: true }, ...p.links.map(l => ({ label: l.label, url: l.url }))], p.lane);
    }
    if (ref.type === 'paper') {
      const p = papers.find(x => x.id === ref.id)!;
      return panelHtml(`research · ${p.venue} ${p.year}`, p.title, `<p class="w-note">${esc(p.authors.join(', '))} · ${esc(p.domain)}</p><p>${esc(p.summary)}</p>${list(p.ideas)}`, [{ label: 'Read paper on the web page', goto: 'research', solid: true }], 'research');
    }
    if (ref.type === 'award') {
      const a = awards[ref.index];
      return panelHtml(`${awardKind[ref.index]} · ${a.year}`, a.title, `<p>${esc(a.org)}</p>${a.text ? `<p>${esc(a.text)}</p>` : ''}${ref.index === 3 ? `<div class="w-metrics">${metric('2 / 66', 'BTech cohort rank')}${metric('8.65 / 10', 'GPA')}</div>` : ''}`, [{ label: 'See all awards', goto: 'recognition' }]);
    }
    if (ref.type === 'channel') {
      const c = channels[ref.index];
      return panelHtml(`studio · ${c.mode}`, c.name, `<p>${esc(c.topic)}</p><p class="w-note">${esc(c.handle)} · produced in OBS Studio</p>`, [{ label: 'Watch channel', url: c.url, solid: true }, { label: 'All channels', goto: 'explain' }]);
    }
    if (ref.type === 'pillar') {
      const p = voicePillars.find(x => x.id === ref.id)!;
      return panelHtml('ownVoicz · planned pillar', p.name, `<p>${esc(p.detail)}</p><p class="w-note">Roadmap. Not presented as released.</p>`, [{ label: 'Open ownVoicz', goto: 'ownvoicz', solid: true }], 'ai');
    }
    const id = ref.id;
    const cats = ['AI', 'Cloud', 'Salesforce', 'Programming', 'Web', 'Other'].map(c => `${c}: ${credentials.filter(x => x.cat === c).length}`);
    const byId: Record<string, [string, string, string, Btn[], Lane?]> = {
      impact: ['enterprise · Accenture', 'Production terminal', `<div class="w-metrics">${metric('170+', 'production contributions')}${metric('20+', 'critical defects resolved')}${metric('~21 mo', 'to promotion')}</div><p>Software Engineer (Salesforce Developer), Aug 2024 – Sep 2026. Enterprise CRM systems and integrations under strict SLAs.</p>`, [{ label: 'View experience', goto: 'work', solid: true }], 'enterprise'],
      crm: ['enterprise · building', 'CRM Systems', '<p>Enterprise CRM solutions in Apex, Lightning Web Components, SOQL and Flow, cutting manual processing.</p>', [{ label: 'View experience', goto: 'work', solid: true }], 'enterprise'],
      integrations: ['enterprise · building', 'API Integrations', '<p>Secure REST API integrations for reliable two-way data exchange between core systems and third-party enterprise services.</p>', [{ label: 'View experience', goto: 'work', solid: true }], 'enterprise'],
      quality: ['enterprise · case study', 'The bug that never reached production', '<p>Before a release, I identified a critical defect, found its cause and resolved it. The client avoided a significant business loss and the onshore team formally recognised the catch.</p><p class="w-note">Client details stay confidential.</p>', [{ label: 'Replay the case study', run: 'pipe-go', solid: true }], 'enterprise'],
      tss: ['enterprise · Jun–Jul 2023', 'Before Accenture', '<p>Full-stack engineer intern at Tech Stalwart Solution. Improved page-load speed by roughly 15% with React.js and co-deployed the company website on AWS.</p>', [{ label: 'View experience', goto: 'work' }], 'enterprise'],
      vault: ['systems · vault', 'Certification Vault', `<p>${credentials.length} credentials with IDs and verify links.</p>${list(cats)}`, [{ label: 'Open the credential vault', goto: 'credentials', solid: true }], 'systems'],
      msc: ['main · HEAD', `${msc.programme}`, `<p>${esc(msc.university)}, ${esc(msc.years)}.</p><div class="w-metrics">${metric('AI', 'area')}${metric('ML', 'area')}${metric('Systems', 'area')}${metric('Research', 'area')}</div>`, [{ label: 'Open MSc section', goto: 'now', solid: true }]],
      modules: ['main · this year', 'Modules', list(msc.modules.map(m => `${m.code} · ${m.name} (${m.term})`)), [{ label: 'Open MSc section', goto: 'now', solid: true }]],
      dissertation: ['main · planned', 'MSc Dissertation', '<p>60 credits, summer 2027. Topic not chosen yet.</p>', [{ label: 'Open MSc section', goto: 'now' }]],
      voiceid: ['ai · shared idea', 'Voice ID', '<p>The question both voice projects ask: who decides how a voice gets used?</p><p><b>Voice Passport</b> (ideathon prototype, Aug 2026) answers it with portable consent: scoped, time-limited permissions and receipts.</p><p><b>ownVoicz</b> (in development) plans a voice identity its owner can use anywhere.</p><p class="w-note">Separate projects. Related themes.</p>', [{ label: 'See how they connect', goto: 'voicepassport', solid: true }], 'ai'],
      agentic: ['ai · lab', 'Agentic AI', '<p>Accenture Agentic AI badge (2025). Atlas is where it gets applied: agents acting through MCP tools, with verification and human approval.</p>', [{ label: 'Open Atlas', goto: 'atlas', solid: true }], 'ai'],
      ml: ['ai · lab', 'Machine Learning', list(['Paper: Advancements in Artistic Style Transfer (IRJET 2023)', 'Microsoft Certified: Azure AI Engineer Associate (2023)', 'This year: Machine Learning Practical and Machine Learning Systems']), [{ label: 'Open research', goto: 'research', solid: true }], 'ai'],
      llm: ['ai · lab', 'LLM Systems', list(['LexoraAI: LLM integration in a live product (6.7M+ requests)', 'Atlas: an LLM gateway with bring-your-own enterprise credentials']), [{ label: 'Open LexoraAI', goto: 'lexora', solid: true }], 'ai'],
    };
    const c = byId[id];
    return panelHtml(c[0], c[1], c[2], c[3], c[4] ?? 'main');
  }

  let layerMode: '' | 'panel' | 'map' | 'progress' | 'menu' = '';
  let lastFocus: HTMLElement | null = null;
  function showLayer(mode: typeof layerMode, html: string) {
    layerMode = mode; paused = true; keys.clear(); joy.x = joy.y = 0;
    lastFocus = document.activeElement as HTMLElement;
    panel.className = `w-panel w-${mode}`;
    panel.setAttribute('aria-labelledby', 'w-p-title');
    panel.innerHTML = html;
    layer.hidden = false;
    ($('button, a', panel) as HTMLElement | null)?.focus();
  }
  function hideLayer() { layer.hidden = true; layerMode = ''; paused = false; (lastFocus && root.contains(lastFocus) ? lastFocus : canvas).focus(); }

  function explore(target: typeof near) {
    if (!target) return;
    if (target.id !== 'hub') discover(target.id === 'secret' ? 'secret' : (target as Placed).id);
    if ('ref' in target && target.ref.type === 'project') discover(target.ref.id);
    showLayer('panel', contentFor(target));
  }

  function mapHtml() {
    const pts = L.zs.map(z => ({ z, p: iso(z.cx, z.cy) }));
    const outline: string[] = [];
    for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2, r = islandR(a); const s = iso(C + Math.cos(a) * r, C + Math.sin(a) * r); outline.push(`${s.sx.toFixed(0)},${s.sy.toFixed(0)}`); }
    const me = iso(player.x, player.y), hub = iso(C, C);
    const vb = `${-26 * TW / 2} ${iso(C, C).sy - 30 * TH / 2 - 60} ${52 * TW / 2} ${60 * TH / 2 + 80}`;
    return `<div class="w-p-head"><p class="eyebrow" data-lane="main"><span class="dot"></span>press a location to travel · keys 1–9</p><h2 class="w-p-title" id="w-p-title">Rajesh World</h2></div>
      <div class="w-map">
        <svg viewBox="${vb}" aria-hidden="true"><polygon points="${outline.join(' ')}" class="wm-land"/>
          ${pts.map(({ z }) => `<polyline points="${z.road.map(r => { const q = iso(r.x, r.y); return `${q.sx.toFixed(0)},${q.sy.toFixed(0)}`; }).join(' ')}" class="wm-path"/>`).join('')}
          <circle cx="${hub.sx}" cy="${hub.sy}" r="22" class="wm-hub"/>
          ${pts.map(({ z, p }) => `<g data-lane="${z.lane}"><circle cx="${p.sx}" cy="${p.sy}" r="26" class="wm-zone${prog.zones.includes(z.id) ? ' is-seen' : ''}"/><text x="${p.sx}" y="${p.sy + 7}" text-anchor="middle" class="wm-n">${z.key}</text></g>`).join('')}
          <circle cx="${me.sx}" cy="${me.sy}" r="12" class="wm-me"/>
        </svg>
        <ol class="wm-list">${L.zs.map(z => `<li><button type="button" data-w-travel="${z.id}" data-lane="${z.lane}"><span class="wm-k">${z.key}</span><span><b>${esc(z.name.toUpperCase())}</b><small>${esc(z.tagline)}</small></span>${prog.zones.includes(z.id) ? '<i aria-label="visited">✓</i>' : ''}</button></li>`).join('')}
          <li><button type="button" data-w-travel="hub" data-lane="main"><span class="wm-k">0</span><span><b>CENTRAL HUB</b><small>${esc(worldHub.tagline)}</small></span></button></li></ol>
      </div>
      <div class="w-p-actions"><button type="button" class="btn btn-ghost sm" data-w-close>Close map <kbd>M</kbd></button></div>`;
  }

  function progressHtml() {
    const pf = progressGoals.projects.filter(p => prog.found.includes(p)).length;
    const pp = progressGoals.papers.filter(p => prog.found.includes(p)).length;
    const pl = L.zs.filter(z => prog.zones.includes(z.id)).length;
    const total = progressGoals.projects.length + progressGoals.papers.length + L.zs.length;
    const pct = Math.round((pf + pp + pl) / total * 100);
    const bar = (a: number, b: number) => `<span class="w-bar"><i style="width:${a / b * 100}%"></i></span>`;
    return `<div class="w-p-head"><p class="eyebrow" data-lane="main"><span class="dot"></span>saved in this browser only</p><h2 class="w-p-title" id="w-p-title">Portfolio explored: ${pct}%</h2></div>
      <div class="w-p-body">
        <dl class="w-prog"><div><dt>Projects</dt><dd>${pf} / ${progressGoals.projects.length}${bar(pf, progressGoals.projects.length)}</dd></div>
        <div><dt>Papers</dt><dd>${pp} / ${progressGoals.papers.length}${bar(pp, progressGoals.papers.length)}</dd></div>
        <div><dt>Locations</dt><dd>${pl} / ${L.zs.length}${bar(pl, L.zs.length)}</dd></div></dl>
        <ol class="w-quests">${quests.map((q, i) => { const d = prog.quests.includes(q.id); return `<li class="${d ? 'is-done' : ''}"><span class="wq-n">${String(i + 1).padStart(2, '0')}</span><span><b>${esc(q.title)}</b><small>${d ? 'Discovered' : esc(q.hint)}</small></span><i aria-label="${d ? 'done' : 'open'}">${d ? '✓' : ''}</i></li>`; }).join('')}</ol>
      </div>
      <div class="w-p-actions"><button type="button" class="btn btn-line sm" data-w-reset>Reset progress</button><button type="button" class="btn btn-ghost sm" data-w-close>Close <kbd>I</kbd></button></div>`;
  }

  function menuHtml() {
    return `<div class="w-p-head"><p class="eyebrow" data-lane="main"><span class="dot"></span>paused</p><h2 class="w-p-title" id="w-p-title">Rajesh World</h2></div>
      <div class="w-menu">
        <button type="button" class="btn btn-solid" data-w-close>Resume</button>
        <button type="button" class="btn btn-line" data-w-open="map">Map</button>
        <button type="button" class="btn btn-line" data-w-open="progress">Progress and quests</button>
        <button type="button" class="btn btn-line" data-w-act="hire">Work with me</button>
        <button type="button" class="btn btn-line" data-w-exit>Exit to the web page</button>
      </div>`;
  }

  function travel(id: string) {
    if (id === 'hub') { player.x = start.x; player.y = start.y; }
    else { const z = L.zs.find(x => x.id === id); if (!z) return; player.x = z.cx + z.v.x * 3.6; player.y = z.cy + z.v.y * 3.6; if (blocked(player.x, player.y)) { player.x = z.cx + z.v.x * 2.4; player.y = z.cy + z.v.y * 2.4; } }
    hideLayer();
  }

  function exit(then?: () => void) {
    running = false;
    removeEventListener('resize', resize);
    removeEventListener('keydown', onKey, true);
    removeEventListener('keyup', onKeyUp, true);
    obs.disconnect();
    root.hidden = true; root.innerHTML = '';
    document.body.style.overflow = '';
    onExit();
    then?.();
  }

  /* ── input ─────────────────────────────────────────────── */
  const otherModalOpen = () => $$('.modal').some(m => !m.hidden);
  function onKey(e: KeyboardEvent) {
    if (root.hidden || otherModalOpen()) return;
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') return; // let the palette through
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (!layer.hidden) hideLayer(); else showLayer('menu', menuHtml()); return; }
    if (!layer.hidden) {
      if ((k === 'm' && layerMode === 'map') || (k === 'i' && layerMode === 'progress')) { e.preventDefault(); hideLayer(); }
      if (layerMode === 'map' && /^[0-9]$/.test(k)) { e.preventDefault(); travel(k === '0' ? 'hub' : L.zs.find(z => z.key === Number(k))?.id ?? 'hub'); }
      return;
    }
    if ((e.target as HTMLElement).closest('input, textarea')) return;
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) { keys.add(k); e.preventDefault(); }
    else if (k === 'e' || k === 'enter' || k === ' ') { if (near) { e.preventDefault(); explore(near); } }
    else if (k === 'm') { e.preventDefault(); showLayer('map', mapHtml()); }
    else if (k === 'i') { e.preventDefault(); showLayer('progress', progressHtml()); }
    else if (k === 't') { e.preventDefault(); keys.clear(); act('terminal'); }
    else if (/^[1-9]$/.test(k)) { const z = L.zs.find(x => x.key === Number(k)); if (z) { e.preventDefault(); travel(z.id); } }
  }
  function onKeyUp(e: KeyboardEvent) { keys.delete(e.key.toLowerCase()); }
  addEventListener('keydown', onKey, true);
  addEventListener('keyup', onKeyUp, true);
  canvas.addEventListener('blur', () => keys.clear());

  root.addEventListener('click', e => {
    const t = e.target as Element;
    const q = <T extends HTMLElement>(s: string) => t.closest<T>(s);
    if (q('[data-w-close]')) { hideLayer(); return; }
    if (q('[data-w-exit]')) { exit(); return; }
    const o = q('[data-w-open]'); if (o) { const m = o.dataset.wOpen!; if (m === 'map') showLayer('map', mapHtml()); else if (m === 'progress') showLayer('progress', progressHtml()); else showLayer('menu', menuHtml()); return; }
    const tr = q('[data-w-travel]'); if (tr) { travel(tr.dataset.wTravel!); return; }
    const g = q('[data-w-goto]'); if (g) { const id = g.dataset.wGoto!; exit(() => setTimeout(() => go(id), 60)); return; }
    const r = q('[data-w-run]'); if (r) { const name = r.dataset.wRun!; if (name === 'map') { showLayer('map', mapHtml()); return; } if (name === 'terminal') { hideLayer(); act('terminal'); return; } exit(() => setTimeout(() => act(name, r.dataset.wArg), 60)); return; }
    const a = q('[data-w-act]'); if (a) { const name = a.dataset.wAct!; if (!layer.hidden) hideLayer(); act(name); return; }
    if (q('[data-w-reset]')) { prog.found = []; prog.zones = []; prog.quests = []; saveProgress(prog); refreshQuests(false); showLayer('progress', progressHtml()); return; }
    if (q('[data-w-hide-controls]')) { $('.w-controls', root).hidden = true; prog.controlsHidden = true; saveProgress(prog); canvas.focus(); return; }
    if (q('[data-w-e]')) explore(near);
    if (t === layer) hideLayer();
  });
  trapFocus(root, () => { /* Esc handled in onKey */ });

  // touch joystick
  const joyEl = root.querySelector<HTMLElement>('[data-w-joy]');
  if (joyEl) {
    const knob = $('span', joyEl); let id: number | null = null; let ox = 0, oy = 0;
    const set = (x: number, y: number) => { const r = 44, d = Math.hypot(x, y), k = d > r ? r / d : 1; joy.x = x * k / r; joy.y = y * k / r; knob.style.transform = `translate(${x * k}px, ${y * k}px)`; };
    joyEl.addEventListener('pointerdown', e => { id = e.pointerId; joyEl.setPointerCapture(id); const b = joyEl.getBoundingClientRect(); ox = b.left + b.width / 2; oy = b.top + b.height / 2; set(e.clientX - ox, e.clientY - oy); });
    joyEl.addEventListener('pointermove', e => { if (e.pointerId === id) set(e.clientX - ox, e.clientY - oy); });
    const end = () => { id = null; set(0, 0); };
    joyEl.addEventListener('pointerup', end); joyEl.addEventListener('pointercancel', end);
  }

  // theme changes repaint the world in the new palette
  const obs = new MutationObserver(() => { P = readPalette(); });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ── update ─────────────────────────────────────────────── */
  function update(dt: number) {
    let ix = 0, iy = 0;
    if (keys.has('w') || keys.has('arrowup')) iy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) iy += 1;
    if (keys.has('a') || keys.has('arrowleft')) ix -= 1;
    if (keys.has('d') || keys.has('arrowright')) ix += 1;
    ix += joy.x; iy += joy.y;
    const len = Math.hypot(ix, iy);
    player.moving = len > .08 && !paused;
    if (player.moving) {
      // screen-space input → tile space (iso)
      const sx = ix / Math.max(1, len), sy = iy / Math.max(1, len);
      const tx = (sx + sy) / Math.SQRT2, ty = (sy - sx) / Math.SQRT2;
      const speed = (keys.has('shift') ? 7.2 : 4.4) * dt;
      const nx = player.x + tx * speed, ny = player.y + ty * speed;
      if (!blocked(nx, player.y)) player.x = nx;
      if (!blocked(player.x, ny)) player.y = ny;
      player.dir = { x: tx, y: ty };
      player.t += dt;
    }
    // zone detection
    let zName = worldHub.name, zId = '', zLane: Lane = 'main';
    for (const z of L.zs) if (dist(player, { x: z.cx, y: z.cy }) < 5.2) { zName = z.name.toUpperCase(); zId = z.id; zLane = z.lane; }
    if (zId !== currentZone) {
      currentZone = zId;
      const zEl = $('.w-zone', root); zEl.dataset.lane = zLane; $('[data-w-zone]', root).textContent = zName;
      if (zId && !prog.zones.includes(zId)) { prog.zones.push(zId); wToast(`Location found · ${zName}`); refreshQuests(); }
    }
    // nearest interactable
    let best: typeof near = null, bd = 1.55;
    for (const p of L.props) { const d = dist(player, p); if (d < bd) { bd = d; best = p; } }
    if (dist(player, { x: C, y: C }) < 2.1 && bd >= 1.2) best = { id: 'hub' };
    if (dist(player, secretSpot) < 1.5) best = { id: 'secret' };
    if (best !== near) {
      near = best;
      const label = !near ? '' : near.id === 'hub' ? `${worldHub.name} · who is Rajesh?` : near.id === 'secret' ? secretSpot.label : (near as Placed).label;
      promptEl.hidden = !near;
      if (near) promptEl.innerHTML = `<kbd>${coarse ? 'Tap' : 'E'}</kbd> ${esc(coarse ? 'Explore' : 'Explore')} · ${esc(label)}`;
      const eb = root.querySelector<HTMLElement>('[data-w-e]'); if (eb) eb.hidden = !near;
    }
    // camera
    const s = iso(player.x, player.y);
    const k = reduced ? 1 : Math.min(1, dt * 6);
    cam.x += (s.sx - cam.x) * k; cam.y += (s.sy - cam.y) * k;
  }

  /* ── draw ───────────────────────────────────────────────── */
  const laneC = (l: Lane) => P[l] || P.ink;
  function poly(pts: { sx: number; sy: number }[], fill: string, stroke?: string) {
    ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.sx, p.sy) : ctx.moveTo(p.sx, p.sy)); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }
  function box(x0: number, y0: number, x1: number, y1: number, z0: number, h: number, base: string, edge?: string) {
    const top = [iso(x0, y0, z0 + h), iso(x1, y0, z0 + h), iso(x1, y1, z0 + h), iso(x0, y1, z0 + h)];
    poly([iso(x0, y1, z0), iso(x1, y1, z0), iso(x1, y1, z0 + h), iso(x0, y1, z0 + h)], shade(base, -.12), edge);
    poly([iso(x1, y0, z0), iso(x1, y1, z0), iso(x1, y1, z0 + h), iso(x1, y0, z0 + h)], shade(base, -.26), edge);
    poly(top, shade(base, .1), edge);
  }
  const hexOf = (c: string) => c;
  function windows(x0: number, y0: number, x1: number, y1: number, h: number, color: string, rows: number) {
    ctx.fillStyle = color;
    for (let r = 0; r < rows; r++) {
      const z = 10 + r * ((h - 16) / Math.max(1, rows));
      for (let x = x0 + .35; x < x1 - .2; x += .55) { const a = iso(x, y1, z), b = iso(x + .28, y1, z + 6); ctx.fillRect(a.sx, b.sy, (b.sx - a.sx), a.sy - b.sy + 2); }
      for (let y = y0 + .35; y < y1 - .2; y += .55) { const a = iso(x1, y, z), b = iso(x1, y + .28, z + 6); ctx.globalAlpha = .7; ctx.fillRect(a.sx, a.sy - 6, b.sx - a.sx, 6); ctx.globalAlpha = 1; }
    }
  }
  function label(x: number, y: number, z: number, text: string, lane: Lane, strong = false) {
    const p = iso(x, y, z);
    ctx.font = `${strong ? 700 : 500} ${strong ? 12 : 10.5}px "Martian Mono", ui-monospace, monospace`;
    const w = ctx.measureText(text).width + 22;
    ctx.fillStyle = P.dark ? 'rgba(10,14,20,.86)' : 'rgba(248,249,251,.94)';
    ctx.strokeStyle = laneC(lane); ctx.lineWidth = 1.2;
    const bx = p.sx - w / 2, by = p.sy - 22;
    ctx.beginPath(); ctx.roundRect(bx, by, w, 20, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = laneC(lane); ctx.beginPath(); ctx.arc(bx + 10, by + 10, 3.2, 0, 7); ctx.fill();
    ctx.fillStyle = P.ink; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + 17, by + 10.5);
  }

  function drawBuilding(z: ZoneL, now: number) {
    const { x0, y0, x1, y1, h } = z.b, c = hexOf(laneC(z.lane)), wall = P.dark ? '#1a2331' : '#f6f7f9';
    const body = mix(hexOf(wall), c, .12);
    const edge = P.dark ? 'rgba(255,255,255,.05)' : 'rgba(12,20,32,.08)';
    // footprint shadow
    ctx.fillStyle = P.shadow;
    poly([iso(x0 + .3, y0 + .5), iso(x1 + .7, y0 + .5), iso(x1 + .7, y1 + .9), iso(x0 + .3, y1 + .9)], P.shadow);
    const kind = z.building.kind;
    if (kind === 'towers') {
      const w = (x1 - x0) / 3;
      [[0, h], [1, h * .72], [2, h * .5]].forEach(([i, hh]) => {
        const a = x0 + i * w + .08, b = a + w - .16;
        box(a, y0 + (i === 1 ? .3 : 0), b, y1 - (i === 1 ? .3 : 0), 0, hh, body, edge);
        windows(a, y0, b, y1 - (i === 1 ? .3 : 0), hh, mix(hexOf(wall), c, .55), Math.floor(hh / 18));
        box(a, y0, b, y0 + .12, hh, 4, c);
      });
      const ant = iso(x0 + w * .5, y0 + (y1 - y0) / 2, h); ctx.strokeStyle = P.ink2; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ant.sx, ant.sy); ctx.lineTo(ant.sx, ant.sy - 22); ctx.stroke();
      ctx.fillStyle = (Math.floor(now / 600) % 2) ? c : P.rule2; ctx.beginPath(); ctx.arc(ant.sx, ant.sy - 23, 2.6, 0, 7); ctx.fill();
    } else if (kind === 'pavilion') {
      box(x0, y0, x1, y1, 0, 8, body, edge);
      for (const [cx, cy] of [[x0 + .35, y0 + .35], [x1 - .35, y0 + .35], [x0 + .35, y1 - .35], [x1 - .35, y1 - .35], [x0 + (x1 - x0) / 2, y1 - .35], [x1 - .35, y0 + (y1 - y0) / 2]]) box(cx - .16, cy - .16, cx + .16, cy + .16, 8, h - 18, mix(hexOf(wall), c, .05), edge);
      box(x0 - .15, y0 - .15, x1 + .15, y1 + .15, h - 10, 10, mix(hexOf(wall), c, .25), edge);
      const tp = iso((x0 + x1) / 2, (y0 + y1) / 2, h); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(tp.sx, tp.sy - 24); ctx.lineTo(tp.sx + 9, tp.sy - 8); ctx.lineTo(tp.sx - 9, tp.sy - 8); ctx.closePath(); ctx.fill();
    } else if (kind === 'vault') {
      box(x0, y0, x1, y1, 0, h, mix(hexOf(wall), c, .2), edge);
      box(x0 - .1, y0 - .1, x1 + .1, y1 + .1, h, 6, c);
      // round door on the front-left face
      const dc = iso((x0 + x1) / 2, y1, h * .42);
      ctx.save(); ctx.translate(dc.sx, dc.sy); ctx.transform(1, .5, 0, 1, 0, 0);
      ctx.fillStyle = shade(hexOf(c), -.1); ctx.beginPath(); ctx.arc(0, 0, 17, 0, 7); ctx.fill();
      ctx.strokeStyle = P.dark ? '#0a0e14' : '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.stroke();
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + now / 2000; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11); ctx.stroke(); }
      ctx.restore();
    } else if (kind === 'library') {
      box(x0, y0, x1, y1, 0, 6, body, edge);
      box(x0 + .2, y0 + .2, x1 - .2, y1 - .7, 6, h - 16, mix(hexOf(wall), c, .06), edge);
      for (let x = x0 + .35; x <= x1 - .3; x += .7) box(x - .12, y1 - .6, x + .12, y1 - .36, 6, h - 16, P.dark ? '#2a3445' : '#ffffff', edge);
      box(x0, y0, x1, y1, h - 10, 8, mix(hexOf(wall), c, .3), edge);
      const a = iso(x0, y1, h - 2), b = iso(x1, y1, h - 2), m = iso((x0 + x1) / 2, y1, h + 18);
      poly([a, b, m], mix(hexOf(wall), c, .45), edge);
    } else if (kind === 'gothic') {
      box(x0, y0, x1, y1, 0, h * .38, mix(hexOf(wall), '#8a93a3', .25), edge);
      windows(x0, y0, x1, y1, h * .38, mix(hexOf(wall), '#8a93a3', .6), 2);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, t = .7;
      box(cx - t, cy - t, cx + t, cy + t, h * .38, h * .42, mix(hexOf(wall), '#8a93a3', .32), edge);
      const tb = [iso(cx - t, cy - t, h * .8), iso(cx + t, cy - t, h * .8), iso(cx + t, cy + t, h * .8), iso(cx - t, cy + t, h * .8)], apex = iso(cx, cy, h * 1.18);
      poly([tb[3], tb[2], apex], shade(hexOf(P.ink2), P.dark ? .1 : .25)); poly([tb[1], tb[2], apex], shade(hexOf(P.ink2), P.dark ? -.1 : .05));
      for (const [px, py] of [[x0 + .2, y0 + .2], [x1 - .2, y0 + .2], [x0 + .2, y1 - .2], [x1 - .2, y1 - .2]]) { const b0 = iso(px, py, h * .38), ap = iso(px, py, h * .38 + 26); ctx.strokeStyle = P.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b0.sx, b0.sy); ctx.lineTo(ap.sx, ap.sy); ctx.stroke(); }
      // HEAD ring at the top
      const top = iso(cx, cy, h * 1.18); ctx.strokeStyle = P.ai; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(top.sx, top.sy - 6, 5 + (reduced ? 0 : Math.sin(now / 400) * 1.2), 0, 7); ctx.stroke();
    } else if (kind === 'lab') {
      box(x0, y0, x1, y1, 0, h, body, edge);
      windows(x0, y0, x1, y1, h, mix(hexOf(wall), c, .5), 2);
      const n = 11; for (let i = 0; i < n; i++) { const x = x0 + .4 + i * (x1 - x0 - .8) / (n - 1); const hh = 6 + 18 * Math.abs(Math.sin(i * 1.3 + (reduced ? 0 : now / 380))); box(x - .09, (y0 + y1) / 2 - .09, x + .09, (y0 + y1) / 2 + .09, h, hh, c); }
    } else if (kind === 'dome') {
      box(x0, y0, x1, y1, 0, h * .55, body, edge);
      windows(x0, y0, x1, y1, h * .55, mix(hexOf(wall), c, .5), 2);
      const ctr = iso((x0 + x1) / 2, (y0 + y1) / 2, h * .55), r = (x1 - x0) * TW / 2 * .62;
      ctx.fillStyle = mix(hexOf(wall), c, .28); ctx.beginPath(); ctx.ellipse(ctr.sx, ctr.sy, r, r / 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(ctr.sx, ctr.sy, r, r * .95, 0, Math.PI, 0); ctx.fillStyle = mix(hexOf(wall), c, .18); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 1.5; for (const k of [.35, .7]) { ctx.beginPath(); ctx.ellipse(ctr.sx, ctr.sy, r * k, r * .95, 0, Math.PI, 0); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(ctr.sx, ctr.sy - r * .95, 4, 2, 0, 0, 7); ctx.fillStyle = c; ctx.fill();
    } else if (kind === 'studio') {
      box(x0, y0, x1, y1, 0, h, body, edge);
      windows(x0, y0, x1, y1, h, mix(hexOf(wall), c, .45), 1);
      const s = iso(x0 + .8, y1, h - 12); ctx.fillStyle = (reduced || Math.floor(now / 900) % 2) ? '#e0412b' : shade('#e0412b', -.4);
      ctx.beginPath(); ctx.roundRect(s.sx - 2, s.sy - 8, 34, 12, 3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 8px "Martian Mono", monospace'; ctx.textBaseline = 'middle'; ctx.fillText('ON AIR', s.sx + 2, s.sy - 1.5);
    } else { // hall
      box(x0, y0, x1, y1, 0, h, body, edge);
      windows(x0, y0, x1, y1, h, mix(hexOf(wall), c, .5), 2);
      box(x0, y0, x1, y1, h, 5, c);
    }
    label((x0 + x1) / 2, (y0 + y1) / 2, (kind === 'gothic' ? h * 1.18 : h) + 30, z.building.label, z.lane, true);
  }

  function drawProp(p: Placed, now: number) {
    const c = hexOf(laneC(p.lane)), found = prog.found.includes(p.id);
    const bob = reduced ? 0 : Math.sin(now / 500 + p.x) * 2;
    const base = P.dark ? '#243042' : '#ffffff';
    ctx.fillStyle = P.shadow; const sh = iso(p.x, p.y); ctx.beginPath(); ctx.ellipse(sh.sx, sh.sy, 16, 7, 0, 0, 7); ctx.fill();
    const s = .24;
    if (p.kind === 'terminal') { box(p.x - s, p.y - s, p.x + s, p.y + s, 0, 20, base); const a = iso(p.x - s, p.y + s, 22), b = iso(p.x + s, p.y + s, 36); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy - 14); ctx.lineTo(b.sx, b.sy); ctx.lineTo(a.sx, a.sy + 14); ctx.closePath(); ctx.fill(); }
    else if (p.kind === 'kiosk') { box(p.x - .12, p.y - .12, p.x + .12, p.y + .12, 0, 18, base); box(p.x - s, p.y - s, p.x + s, p.y + s, 18, 12, mix(hexOf(base), c, .35)); }
    else if (p.kind === 'plinth') { box(p.x - s, p.y - s, p.x + s, p.y + s, 0, 14, base); const g = iso(p.x, p.y, 34 + bob); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(g.sx, g.sy - 9); ctx.lineTo(g.sx + 7, g.sy); ctx.lineTo(g.sx, g.sy + 9); ctx.lineTo(g.sx - 7, g.sy); ctx.closePath(); ctx.fill(); }
    else if (p.kind === 'book') { box(p.x - .1, p.y - .1, p.x + .1, p.y + .1, 0, 16, base); box(p.x - s, p.y - .2, p.x + s, p.y + .2, 16, 6, c); const g = iso(p.x, p.y, 24); ctx.fillStyle = P.dark ? '#fff' : '#fff'; ctx.fillRect(g.sx - 7, g.sy - 3, 14, 2); }
    else if (p.kind === 'pylon') { box(p.x - .12, p.y - .12, p.x + .12, p.y + .12, 0, 34, mix(hexOf(base), c, .2)); const g = iso(p.x, p.y, 40 + bob); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(g.sx, g.sy, 10, 5, 0, 0, 7); ctx.stroke(); }
    else if (p.kind === 'banner') { const b0 = iso(p.x, p.y, 0), t = iso(p.x, p.y, 58); ctx.strokeStyle = P.ink2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b0.sx, b0.sy); ctx.lineTo(t.sx, t.sy); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(t.sx, t.sy); ctx.lineTo(t.sx + 26, t.sy + 6 + bob); ctx.lineTo(t.sx + 26, t.sy + 26 + bob); ctx.lineTo(t.sx, t.sy + 20); ctx.closePath(); ctx.fill(); }
    else if (p.kind === 'door') { const g = iso(p.x, p.y); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.ellipse(g.sx, g.sy, 22, 11, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    // status marker
    const m = iso(p.x, p.y, p.kind === 'banner' ? 70 : 54 + bob);
    if (found) { ctx.fillStyle = P.systems; ctx.font = '700 11px "Martian Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('✓', m.sx, m.sy); ctx.textAlign = 'start'; }
    else { ctx.fillStyle = c; ctx.globalAlpha = .5 + .5 * (reduced ? 1 : Math.abs(Math.sin(now / 600 + p.y))); ctx.beginPath(); ctx.arc(m.sx, m.sy, 3, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    if (near === p) label(p.x, p.y, 78, p.label, p.lane);
  }

  function drawTree(t: V) {
    const g = iso(t.x, t.y);
    ctx.fillStyle = P.shadow; ctx.beginPath(); ctx.ellipse(g.sx, g.sy, 14, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = P.trunk; ctx.fillRect(g.sx - 2, g.sy - 12, 4, 12);
    const top = g.sy - 50, mid = g.sy - 12;
    ctx.fillStyle = P.tree1; ctx.beginPath(); ctx.moveTo(g.sx, top); ctx.lineTo(g.sx - 13, mid); ctx.lineTo(g.sx, mid + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.tree2; ctx.beginPath(); ctx.moveTo(g.sx, top); ctx.lineTo(g.sx + 13, mid); ctx.lineTo(g.sx, mid + 4); ctx.closePath(); ctx.fill();
  }

  function drawMonolith(now: number) {
    const s = .55, h = 104;
    ctx.fillStyle = P.shadow; poly([iso(C - s + .4, C - s + .5), iso(C + s + .9, C - s + .5), iso(C + s + .9, C + s + .9), iso(C - s + .4, C + s + .9)], P.shadow);
    box(C - s, C - s, C + s, C + s, 0, h, hexOf(P.dark ? '#1c2533' : '#0c1420'));
    // five lanes converging on the front face, like the career graph
    const lanesL: Lane[] = ['ai', 'research', 'main', 'systems', 'enterprise'];
    lanesL.forEach((l, i) => {
      const a = iso(C - s + .12 + i * .2, C + s, 12), b = iso(C, C + s, h - 16);
      ctx.strokeStyle = l === 'main' ? '#e8edf4' : laneC(l); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.bezierCurveTo(a.sx, a.sy - 40, b.sx, b.sy + 30, b.sx, b.sy); ctx.stroke();
    });
    const hd = iso(C, C + s, h - 16); ctx.fillStyle = '#0c1420'; ctx.strokeStyle = P.ai; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hd.sx, hd.sy, 4.5 + (reduced ? 0 : Math.sin(now / 420)), 0, 7); ctx.fill(); ctx.stroke();
    label(C, C, h + 30, worldHub.name, 'main', true);
  }

  function drawSecret(now: number) {
    const x = secretSpot.x, y = secretSpot.y;
    box(x - .22, y - .22, x + .22, y + .22, 0, 34, '#2a3240');
    for (let i = 0; i < 4; i++) { const p = iso(x - .22, y + .22 - .05, 8 + i * 6); ctx.fillStyle = (reduced || (Math.floor(now / (300 + i * 170)) % 2)) ? '#33c9a0' : '#1b3b33'; ctx.fillRect(p.sx + 4, p.sy - 2, 3, 2); }
    if (near && near.id === 'secret') label(x, y, 58, secretSpot.label, 'systems');
  }

  function drawPlayer(now: number) {
    const g = iso(player.x, player.y);
    const bob = player.moving && !reduced ? Math.abs(Math.sin(player.t * 11)) * 3 : 0;
    ctx.fillStyle = P.shadow; ctx.beginPath(); ctx.ellipse(g.sx, g.sy, 11, 5, 0, 0, 7); ctx.fill();
    const legs = player.moving && !reduced ? Math.sin(player.t * 11) * 3 : 0;
    ctx.fillStyle = P.dark ? '#cfd6e0' : '#0c1420';
    ctx.fillRect(g.sx - 5, g.sy - 12 + legs, 3.5, 11 - legs); ctx.fillRect(g.sx + 1.5, g.sy - 12 - legs, 3.5, 11 + legs);
    ctx.beginPath(); ctx.roundRect(g.sx - 7, g.sy - 30 - bob, 14, 20, 6); ctx.fill();
    ctx.fillStyle = P.ai; ctx.fillRect(g.sx - 7, g.sy - 24 - bob, 14, 3); // scarf in the HEAD colour
    ctx.fillStyle = P.dark ? '#e8edf4' : '#1c2533'; ctx.beginPath(); ctx.arc(g.sx, g.sy - 37 - bob, 7, 0, 7); ctx.fill();
    // visor shows facing
    const d = iso(player.dir.x, player.dir.y); const dl = Math.hypot(d.sx, d.sy) || 1;
    ctx.fillStyle = P.ai; ctx.beginPath(); ctx.arc(g.sx + d.sx / dl * 3.5, g.sy - 37 - bob + d.sy / dl * 2, 2.4, 0, 7); ctx.fill();
    void now;
  }

  function draw(now: number) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // sea
    ctx.fillStyle = P.water; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2 + 40 * zoom); ctx.scale(zoom, zoom); ctx.translate(-cam.x, -cam.y);
    const vx0 = cam.x - W / 2 / zoom - TW, vx1 = cam.x + W / 2 / zoom + TW, vy0 = cam.y - H / 2 / zoom - 80, vy1 = cam.y + H / 2 / zoom + TH;
    // waves
    ctx.strokeStyle = P.water2; ctx.lineWidth = 1.5;
    const off = reduced ? 0 : (now / 90) % 48;
    for (let y = Math.floor(vy0 / 48) * 48; y < vy1; y += 48) { ctx.beginPath(); for (let x = Math.floor(vx0 / 96) * 96; x < vx1; x += 96) { ctx.moveTo(x + off, y); ctx.quadraticCurveTo(x + 24 + off, y - 6, x + 48 + off, y); } ctx.stroke(); }
    // ground
    const zsL = L.zs;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const t = L.tiles[y * N + x]; if (!t) continue;
      const c = iso(x, y); if (c.sx < vx0 || c.sx > vx1 || c.sy < vy0 || c.sy > vy1) continue;
      let fill = (x + y) % 2 ? P.land : P.land2;
      if (t === 2) fill = P.path; else if (t === 3) fill = P.plaza;
      else if (t === 4) { const z = zsL[L.zoneTint[y * N + x]]; fill = mix(hexOf(P.plaza.startsWith('#') ? P.plaza : '#e4e9ef'), hexOf(laneC(z.lane)), P.dark ? .14 : .1); }
      poly([iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1)], fill, P.dark ? 'rgba(255,255,255,.035)' : 'rgba(12,20,32,.05)');
      // shoreline edge
      if (!isLand(x + 1.5, y + .5) || !isLand(x + .5, y + 1.5)) {
        if (!isLand(x + .5, y + 1.5)) poly([iso(x, y + 1), iso(x + 1, y + 1), iso(x + 1, y + 1, -10), iso(x, y + 1, -10)], P.sand);
        if (!isLand(x + 1.5, y + .5)) poly([iso(x + 1, y), iso(x + 1, y + 1), iso(x + 1, y + 1, -10), iso(x + 1, y, -10)], shade(hexOf(P.sand.startsWith('#') ? P.sand : '#e7e2d6'), -.12));
      }
    }
    // drawables, sorted by depth
    const items: { d: number; f: () => void }[] = [];
    for (const z of zsL) items.push({ d: (z.b.x0 + z.b.x1) / 2 + (z.b.y0 + z.b.y1) / 2 + .8, f: () => drawBuilding(z, now) });
    for (const p of L.props) items.push({ d: p.x + p.y, f: () => drawProp(p, now) });
    for (const t of L.trees) { const c = iso(t.x, t.y); if (c.sx < vx0 || c.sx > vx1 || c.sy < vy0 - 60 || c.sy > vy1 + 60) continue; items.push({ d: t.x + t.y, f: () => drawTree(t) }); }
    items.push({ d: C * 2 + .6, f: () => drawMonolith(now) });
    items.push({ d: secretSpot.x + secretSpot.y, f: () => drawSecret(now) });
    items.push({ d: player.x + player.y, f: () => drawPlayer(now) });
    items.sort((a, b) => a.d - b.d).forEach(i => i.f());
    ctx.restore();
  }

  /* ── loop ──────────────────────────────────────────────── */
  let running = true, last = performance.now();
  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!document.hidden) { update(dt); draw(now); }
    requestAnimationFrame(frame);
  };
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(frame);
  canvas.focus();

  /* ── intro (first visit only, skipped for reduced motion) ── */
  if (!prog.intro && !reduced) {
    const intro = $('[data-w-intro]', root);
    intro.hidden = false; paused = true;
    const lines = ['ENTERPRISE SYSTEMS', 'AI', 'RESEARCH', 'PRODUCTS', 'OPEN SOURCE'];
    intro.innerHTML = `${worldAssets.introBackdrop ? `<img class="w-intro-bg" src="${worldAssets.introBackdrop}" alt="">` : ''}<div class="w-intro-in"><p class="w-i-name">RAJESH KUMAR KONA</p><p class="w-i-sys">SYSTEM INITIALIZING<span class="w-i-dots"></span></p><ul>${lines.map((l, i) => `<li style="--i:${i}"><span>${l}</span><b>ok</b></li>`).join('')}</ul><p class="w-i-welcome">WELCOME TO MY WORLD.</p></div><button type="button" class="btn btn-line sm w-skip">Skip</button>`;
    const done = () => { if (intro.hidden) return; intro.hidden = true; paused = false; prog.intro = true; saveProgress(prog); canvas.focus(); };
    $('.w-skip', intro).addEventListener('click', done);
    $<HTMLButtonElement>('.w-skip', intro).focus();
    setTimeout(done, 4600);
  }
  toast(coarse ? 'Rajesh World · drag the pad to move, tap Explore near anything' : 'Rajesh World · WASD to move, E to explore, M for the map', 2600);
}
