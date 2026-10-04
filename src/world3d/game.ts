/* Rajesh World in 3D: walk the island in first or third person, go inside every
   district, ride the lifts and read the walls. Plain three.js, no server, and it
   loads only when someone chooses a 3D view. */

import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, CapsuleGeometry, SphereGeometry, BoxGeometry, MeshStandardMaterial,
  HemisphereLight, DirectionalLight, PointLight, FogExp2, Vector3, Raycaster, ACESFilmicToneMapping, SRGBColorSpace, PCFSoftShadowMap,
  BufferGeometry, Float32BufferAttribute, LineSegments, LineBasicMaterial, AdditiveBlending, Color, MeshBasicMaterial,
} from 'three';
import { buildWorld, toW, FH, S, type Spot, type Bld } from './build';
import { contentFor } from '../world/panels';
import { islandR } from '../world/layout';
import { quests, worldHub } from '../data';
import { esc } from '../render';
import { $, store, reduced, run as act, go, trapFocus } from '../ui/core';
import { LANE } from './tex';

export type View3D = '3p' | '1p';
interface Progress { found: string[]; zones: string[]; quests: string[]; intro?: boolean; controlsHidden?: boolean; controls3d?: boolean }
const loadProgress = (): Progress => ({ found: [], zones: [], quests: [], ...store.json<Partial<Progress>>('world-progress', {}) });
const saveProgress = (p: Progress) => store.set('world-progress', JSON.stringify(p));

export function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function enter3D(root: HTMLElement, startView: View3D, onExit: () => void, onSwitch: (v: 'iso' | View3D) => void) {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const low = coarse || (navigator.hardwareConcurrency ?? 8) <= 4;
  let view: View3D = startView;
  const prog = loadProgress();

  root.innerHTML = `
    <canvas class="g3-canvas" tabindex="0" aria-label="Rajesh World in 3D. Move with W A S D, look with the mouse, E to interact, V to switch view, M for the map, Escape for the menu."></canvas>
    <div class="w-hud g3-hud" data-g3-hud hidden>
      <div class="w-top-left">
        <p class="w-zone"><span class="dot" aria-hidden="true"></span><span data-w-zone>${worldHub.name}</span></p>
        <button type="button" class="w-quest" data-g3-open="map"><span class="w-q-k">quest <b data-w-qn></b>/6</span><span data-w-qt></span></button>
      </div>
      <div class="w-top-right">
        <div class="g3-views" role="group" aria-label="View">
          <button type="button" data-g3-view="iso">Isometric</button>
          <button type="button" data-g3-view="3p">3rd person</button>
          <button type="button" data-g3-view="1p">1st person</button>
        </div>
        <button type="button" class="w-btn" data-g3-open="map"><span>Map</span><kbd>M</kbd></button>
        <button type="button" class="w-btn w-exit" data-g3-open="menu"><span>Exit</span><kbd>Esc</kbd></button>
      </div>
      <canvas class="g3-mini" width="180" height="180" aria-hidden="true"></canvas>
      <div class="g3-cross" aria-hidden="true"></div>
      <div class="w-controls g3-controls"${prog.controls3d ? ' hidden' : ''}>
        <p class="w-c-h">Controls</p>
        <ul>${coarse
          ? '<li><span>Left stick</span>Move</li><li><span>Drag right</span>Look</li><li><span>Use</span>Read a wall or ride a lift</li>'
          : '<li><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>Move</li><li><span>Mouse</span>Look (click to capture)</li><li><span><kbd>E</kbd></span>Read a wall / ride a lift</li><li><span><kbd>Shift</kbd></span>Run</li><li><span><kbd>Space</kbd></span>Jump</li><li><span><kbd>V</kbd></span>1st / 3rd person</li><li><span><kbd>M</kbd></span>Map and travel</li>'}</ul>
        <button type="button" class="w-c-x" data-g3-hide-controls>Got it</button>
      </div>
      <p class="w-prompt" data-w-prompt hidden></p>
      <div class="w-toast" data-w-toast aria-live="polite"></div>
      ${coarse ? `<div class="w-joy" data-w-joy aria-hidden="true"><span></span></div>
        <div class="g3-touch"><button type="button" data-g3-use hidden>Use</button><button type="button" data-g3-jump>Jump</button></div>` : ''}
    </div>
    <div class="w-layer" data-w-layer hidden><div class="w-panel" role="dialog" aria-modal="true" tabindex="-1"></div></div>
    <div class="g3-intro" data-g3-intro>
      <div class="g3-intro-in"><p class="g3-k">rajesh world · ${view === '1p' ? 'first' : 'third'} person</p><p class="g3-t">Entering<br>the world</p><div class="g3-bar"><i></i></div><p class="g3-skip">${coarse ? 'Tap' : 'Press any key'} to skip</p></div>
    </div>
    <div class="g3-flash" data-g3-flash></div>`;

  const canvas = $<HTMLCanvasElement>('.g3-canvas', root);
  const hud = $('[data-g3-hud]', root), layer = $('[data-w-layer]', root), panel = $('.w-panel', root);
  const promptEl = $('[data-w-prompt]', root), toastEl = $('[data-w-toast]', root), zoneEl = $('[data-w-zone]', root);
  const intro = $('[data-g3-intro]', root), flash = $('[data-g3-flash]', root);
  const mini = $<HTMLCanvasElement>('.g3-mini', root), mg = mini.getContext('2d')!;
  const useBtn = root.querySelector<HTMLButtonElement>('[data-g3-use]');

  /* ── renderer ─────────────────────────────────────────── */
  const renderer = new WebGLRenderer({ canvas, antialias: !low, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1.25 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = !low; renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  scene.fog = new FogExp2('#8e7fa6', .0036);
  const camera = new PerspectiveCamera(70, 1, .1, 2000);
  const world = buildWorld(scene, { shadows: !low, low });

  const hemi = new HemisphereLight('#d2cdf0', '#5a4a5e', 1.35); scene.add(hemi);
  const sun = new DirectionalLight('#ffc89a', 2.1);
  sun.position.copy(world.sunDir).multiplyScalar(120);
  if (!low) {
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = -60; sc.right = 60; sc.top = 60; sc.bottom = -60; sc.near = 10; sc.far = 320;
    sun.shadow.bias = -.0005; sun.shadow.normalBias = .12;
  }
  scene.add(sun, sun.target);
  // one warm light that follows you indoors, so every hall is lit without a light per building
  const room = new PointLight('#ffe2c4', 0, 30, 1.6); scene.add(room);

  /* ── the avatar ───────────────────────────────────────── */
  const avatar = new Group();
  const suit = new MeshStandardMaterial({ color: '#3b5f9e', roughness: .5, metalness: .25 });
  const trim = new MeshStandardMaterial({ color: '#e9eef6', roughness: .4 });
  const accent = new MeshStandardMaterial({ color: '#0b0f1a', emissive: LANE.main, emissiveIntensity: 1.6 });
  const body = new Mesh(new CapsuleGeometry(.34, .7, 6, 14), suit); body.position.y = 1.05;
  const headM = new Mesh(new SphereGeometry(.26, 20, 14), new MeshStandardMaterial({ color: '#c99273', roughness: .7 })); headM.position.y = 1.72;
  const visor = new Mesh(new BoxGeometry(.38, .1, .2), accent); visor.position.set(0, 1.75, -.18);
  const pack = new Mesh(new BoxGeometry(.42, .5, .2), trim); pack.position.set(0, 1.15, .3);
  const packLight = new Mesh(new BoxGeometry(.3, .05, .02), accent); packLight.position.set(0, 1.2, .41);
  const limb = (x: number, y: number, len: number, r: number) => { const g = new Group(); const m = new Mesh(new CapsuleGeometry(r, len, 4, 8), suit); m.position.y = -len / 2 - r; g.add(m); g.position.set(x, y, 0); return g; };
  const armL = limb(-.46, 1.45, .45, .1), armR = limb(.46, 1.45, .45, .1), legL = limb(-.16, .72, .5, .12), legR = limb(.16, .72, .5, .12);
  avatar.add(body, headM, visor, pack, packLight, armL, armR, legL, legR);
  avatar.traverse(o => { const m = o as Mesh; if (m.isMesh && !low) m.castShadow = true; });
  scene.add(avatar);

  /* ── state ────────────────────────────────────────────── */
  const start = toW(28 + 2.2, 28 + 2.2);
  const P = { x: start.x, z: start.z, y: 0, vy: 0, level: 0, yaw: Math.atan2(start.x, start.z), pitch: -.12, heading: 0, walk: 0, onGround: true };
  P.heading = P.yaw + Math.PI;
  let inside: Bld | null = null;
  let near: Spot | null = null;
  let ride: { from: number; to: number; t: number; b: Bld } | null = null;
  let paused = true, running = true, phase: 'intro' | 'fly' | 'play' = 'intro';
  const keys = new Set<string>();
  const joy = { x: 0, y: 0 };
  let arm = 6.5;

  /* ── progress ─────────────────────────────────────────── */
  const qn = $('[data-w-qn]', root), qt = $('[data-w-qt]', root);
  const questDone = (q: typeof quests[number]) => q.needs.every(n => n.startsWith('zone:') ? prog.zones.includes(n.slice(5)) : n.split('|').some(x => prog.found.includes(x)));
  function refreshQuests(announce = true) {
    for (const q of quests) if (!prog.quests.includes(q.id) && questDone(q)) { prog.quests.push(q.id); if (announce) wToast(`+ EXPERIENCE DISCOVERED · ${q.title}`); }
    const next = quests.find(q => !prog.quests.includes(q.id));
    qn.textContent = String(prog.quests.length); qt.textContent = next ? next.title : 'All quests complete';
    saveProgress(prog);
  }
  const discover = (id: string) => { if (!prog.found.includes(id)) { prog.found.push(id); if (id === 'secret') store.set('world-secret', '1'); } refreshQuests(); };
  let toastT = 0;
  function wToast(s: string) { toastEl.textContent = s; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = window.setTimeout(() => toastEl.classList.remove('is-on'), 2800); }
  refreshQuests(false);

  /* ── views ────────────────────────────────────────────── */
  const markView = () => {
    root.querySelectorAll<HTMLButtonElement>('[data-g3-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.g3View === view)));
    root.classList.toggle('is-1p', view === '1p');
    avatar.visible = view === '3p';
  };
  function setView(v: 'iso' | View3D) {
    if (v === 'iso') { exit(() => onSwitch('iso')); return; }
    view = v; markView(); wToast(v === '1p' ? 'FIRST PERSON' : 'THIRD PERSON');
  }
  markView();

  /* ── layers ───────────────────────────────────────────── */
  let layerMode = '';
  let lastFocus: HTMLElement | null = null;
  function showLayer(mode: string, html: string) {
    layerMode = mode; paused = true; keys.clear(); joy.x = joy.y = 0;
    if (document.pointerLockElement) document.exitPointerLock();
    lastFocus = document.activeElement as HTMLElement;
    panel.className = `w-panel w-${mode}`; panel.setAttribute('aria-labelledby', 'w-p-title'); panel.innerHTML = html;
    layer.hidden = false; (panel.querySelector('button, a') as HTMLElement | null)?.focus();
  }
  function hideLayer() { layer.hidden = true; layerMode = ''; paused = phase !== 'play'; (lastFocus && root.contains(lastFocus) ? lastFocus : canvas).focus(); }

  const mapHtml = () => `<div class="w-p-head"><p class="eyebrow" data-lane="main"><span class="dot"></span>choose a place to travel · keys 1–9</p><h2 class="w-p-title" id="w-p-title">Rajesh World</h2></div>
    <div class="w-p-body"><ol class="wm-list g3-list">${world.blds.map(b => `<li><button type="button" data-g3-travel="${b.zone.id}" data-lane="${b.lane}"><span class="wm-k">${b.zone.key}</span><span><b>${esc(b.zone.name.toUpperCase())}</b><small>${esc(b.zone.tagline)} · ${b.floors} floor${b.floors > 1 ? 's' : ''}</small></span>${prog.zones.includes(b.zone.id) ? '<i aria-label="visited">✓</i>' : ''}</button></li>`).join('')}
      <li><button type="button" data-g3-travel="hub" data-lane="main"><span class="wm-k">0</span><span><b>CENTRAL HUB</b><small>${esc(worldHub.tagline)}</small></span></button></li></ol></div>
    <div class="w-p-actions"><button type="button" class="btn btn-ghost sm" data-w-close>Close map <kbd>M</kbd></button></div>`;
  const menuHtml = () => `<div class="w-p-head"><p class="eyebrow" data-lane="main"><span class="dot"></span>paused</p><h2 class="w-p-title" id="w-p-title">Rajesh World</h2></div>
    <div class="w-menu">
      <button type="button" class="btn btn-solid" data-w-close>Resume</button>
      <button type="button" class="btn btn-line" data-g3-view="${view === '1p' ? '3p' : '1p'}">Switch to ${view === '1p' ? 'third' : 'first'} person</button>
      <button type="button" class="btn btn-line" data-g3-view="iso">Isometric map view</button>
      <button type="button" class="btn btn-line" data-g3-open="map">Map and travel</button>
      <button type="button" class="btn btn-line" data-w-act="hire">Work with me</button>
      <button type="button" class="btn btn-line" data-w-exit>Exit to the web page</button>
    </div>`;

  function travel(id: string) {
    if (id === 'hub') { P.x = start.x; P.z = start.z; P.yaw = Math.atan2(start.x, start.z); }
    else {
      const b = world.blds.find(x => x.zone.id === id); if (!b) return;
      const p = b.door.clone().addScaledVector(b.f, 6); P.x = p.x; P.z = p.z;
      P.yaw = Math.atan2(b.f.x, b.f.z); // look back at the door
    }
    P.y = 0; P.level = 0; P.pitch = -.08; P.heading = P.yaw + Math.PI; hideLayer();
  }

  function use(s: Spot | null) {
    if (!s) return;
    if (s.kind === 'lift') {
      const b = s.bld!; const to = s.level < b.floors - 1 ? s.level + 1 : 0;
      ride = { from: s.level, to, t: 0, b }; return;
    }
    if (s.kind === 'panel') { discover(s.id); const t = s.target as { ref?: { type: string; id?: string } }; if (t.ref?.type === 'project' && t.ref.id) discover(t.ref.id); }
    if (s.kind === 'secret') discover('secret');
    showLayer('panel', contentFor(s.target!));
  }

  /* ── exit ─────────────────────────────────────────────── */
  function exit(then?: () => void) {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    removeEventListener('resize', resize);
    removeEventListener('keydown', onKey, true);
    removeEventListener('keyup', onKeyUp, true);
    document.removeEventListener('pointerlockchange', onLock);
    document.removeEventListener('mousemove', onMouse);
    document.removeEventListener('visibilitychange', onVis);
    if (document.pointerLockElement) document.exitPointerLock();
    world.dispose();
    scene.traverse(o => { const m = o as Mesh; if (m.isMesh) { m.geometry?.dispose(); const mm = m.material as MeshStandardMaterial | MeshStandardMaterial[]; (Array.isArray(mm) ? mm : [mm]).forEach(x => x?.dispose()); } });
    renderer.dispose(); renderer.forceContextLoss();
    root.hidden = true; root.innerHTML = ''; root.classList.remove('is-1p', 'is-3d');
    document.body.style.overflow = '';
    if (then) then(); else onExit();
  }

  /* ── input ────────────────────────────────────────────── */
  const isLocked = () => document.pointerLockElement === canvas;
  function onLock() {
    root.classList.toggle('is-locked', isLocked());
    if (!isLocked() && running && phase === 'play' && layer.hidden && !coarse && lockWanted) showLayer('menu', menuHtml());
    lockWanted = isLocked();
  }
  let lockWanted = false;
  function onMouse(e: MouseEvent) {
    if (!isLocked() || paused) return;
    P.yaw -= e.movementX * .0024; P.pitch = clampPitch(P.pitch - e.movementY * .0022);
  }
  const clampPitch = (p: number) => Math.max(view === '1p' ? -1.35 : -.95, Math.min(view === '1p' ? 1.3 : .55, p));
  document.addEventListener('pointerlockchange', onLock);
  document.addEventListener('mousemove', onMouse);

  // drag to look when the pointer is not captured (and on touch, on the right side)
  let drag: { id: number; x: number; y: number } | null = null;
  canvas.addEventListener('pointerdown', e => {
    if (phase !== 'play') return;
    if (!coarse && e.pointerType === 'mouse') {
      if (!isLocked()) { try { const r = canvas.requestPointerLock() as unknown as Promise<void> | undefined; r?.catch?.(() => {}); } catch { /* drag instead */ } }
    }
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId || isLocked() || paused) return;
    const k = e.pointerType === 'touch' ? .0055 : .004;
    P.yaw -= (e.clientX - drag.x) * k; P.pitch = clampPitch(P.pitch - (e.clientY - drag.y) * k * .8);
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = (e: PointerEvent) => { if (drag?.id === e.pointerId) drag = null; };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);

  const otherModalOpen = () => [...document.querySelectorAll<HTMLElement>('.modal')].some(m => !m.hidden);
  function onKey(e: KeyboardEvent) {
    if (root.hidden || otherModalOpen()) return;
    if (phase !== 'play') { if (phase === 'intro' || phase === 'fly') { e.preventDefault(); skipIntro(); } return; }
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (!layer.hidden) hideLayer(); else showLayer('menu', menuHtml()); return; }
    if (!layer.hidden) {
      if (k === 'm' && layerMode === 'map') { e.preventDefault(); hideLayer(); }
      if (layerMode === 'map' && /^[0-9]$/.test(k)) { e.preventDefault(); travel(k === '0' ? 'hub' : world.blds.find(b => b.zone.key === Number(k))?.zone.id ?? 'hub'); }
      return;
    }
    if ((e.target as HTMLElement).closest('input, textarea')) return;
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift', ' ', 'q'].includes(k)) { keys.add(k); e.preventDefault(); }
    if (k === ' ' && P.onGround && !ride) { P.vy = 5.6; P.onGround = false; }
    else if (k === 'e' || k === 'enter') { e.preventDefault(); use(near); }
    else if (k === 'v') { e.preventDefault(); setView(view === '1p' ? '3p' : '1p'); }
    else if (k === 'm') { e.preventDefault(); showLayer('map', mapHtml()); }
    else if (/^[1-9]$/.test(k)) { const b = world.blds.find(x => x.zone.key === Number(k)); if (b) { e.preventDefault(); travel(b.zone.id); } }
  }
  function onKeyUp(e: KeyboardEvent) { keys.delete(e.key.toLowerCase()); }
  addEventListener('keydown', onKey, true);
  addEventListener('keyup', onKeyUp, true);
  canvas.addEventListener('blur', () => keys.clear());

  root.addEventListener('click', e => {
    const t = e.target as Element;
    const q = <T extends HTMLElement>(s: string) => t.closest<T>(s);
    if (phase !== 'play' && q('[data-g3-intro]')) { skipIntro(); return; }
    if (q('[data-w-close]')) { hideLayer(); return; }
    if (q('[data-w-exit]')) { exit(); return; }
    const v = q('[data-g3-view]'); if (v) { const nv = v.dataset.g3View as 'iso' | View3D; if (!layer.hidden) hideLayer(); setView(nv); return; }
    const o = q('[data-g3-open]'); if (o) { o.dataset.g3Open === 'map' ? showLayer('map', mapHtml()) : showLayer('menu', menuHtml()); return; }
    const tr = q('[data-g3-travel]'); if (tr) { travel(tr.dataset.g3Travel!); return; }
    const g = q('[data-w-goto]'); if (g) { const id = g.dataset.wGoto!; exit(() => { onExit(); setTimeout(() => go(id), 60); }); return; }
    const r = q('[data-w-run]'); if (r) { const name = r.dataset.wRun!; if (name === 'map') { showLayer('map', mapHtml()); return; } if (name === 'terminal') { hideLayer(); act('terminal'); return; } exit(() => { onExit(); setTimeout(() => act(name, r.dataset.wArg), 60); }); return; }
    const a = q('[data-w-act]'); if (a) { const name = a.dataset.wAct!; if (!layer.hidden) hideLayer(); act(name); return; }
    if (q('[data-g3-hide-controls]')) { $('.g3-controls', root).hidden = true; prog.controls3d = true; saveProgress(prog); canvas.focus(); return; }
    if (q('[data-g3-use]')) { use(near); return; }
    if (q('[data-g3-jump]')) { if (P.onGround) { P.vy = 5.6; P.onGround = false; } return; }
    if (t === layer) hideLayer();
  });
  trapFocus(root, () => { /* Esc handled in onKey */ });

  const joyEl = root.querySelector<HTMLElement>('[data-w-joy]');
  if (joyEl) {
    const knob = $('span', joyEl); let id: number | null = null; let ox = 0, oy = 0;
    const set = (x: number, y: number) => { const r = 44, d = Math.hypot(x, y), k = d > r ? r / d : 1; joy.x = x * k / r; joy.y = y * k / r; knob.style.transform = `translate(${x * k}px, ${y * k}px)`; };
    joyEl.addEventListener('pointerdown', e => { id = e.pointerId; joyEl.setPointerCapture(id); const b = joyEl.getBoundingClientRect(); ox = b.left + b.width / 2; oy = b.top + b.height / 2; set(e.clientX - ox, e.clientY - oy); });
    joyEl.addEventListener('pointermove', e => { if (e.pointerId === id) set(e.clientX - ox, e.clientY - oy); });
    const end = () => { id = null; set(0, 0); };
    joyEl.addEventListener('pointerup', end); joyEl.addEventListener('pointercancel', end);
  }

  function onVis() { if (document.hidden) keys.clear(); }
  document.addEventListener('visibilitychange', onVis);

  /* ── physics ──────────────────────────────────────────── */
  const R = .42;
  function blocked(x: number, z: number) {
    const a = Math.atan2(z, x);
    if (Math.hypot(x, z) > (islandR(a) - .5) * S) return true;
    const lv = P.level;
    for (const b of world.colliders) {
      if (b.lv === -2 ? lv < 1 : b.lv >= 0 && b.lv !== lv) continue;
      if (x > b.x0 - R && x < b.x1 + R && z > b.z0 - R && z < b.z1 + R) return true;
    }
    if (lv === 0 && !inside) for (const c of world.circles) if (Math.abs(c.x - x) < c.r + R && Math.hypot(c.x - x, c.z - z) < c.r + R) return true;
    return false;
  }
  const inBld = (x: number, z: number) => world.blds.find(b => x > b.inner.x0 && x < b.inner.x1 && z > b.inner.z0 && z < b.inner.z1) ?? null;

  /* ── camera ───────────────────────────────────────────── */
  const ray = new Raycaster();
  const head = new Vector3(), dir = new Vector3(), want = new Vector3(), camPos = new Vector3();
  function placeCamera(dt: number, snap = false) {
    const eye = view === '1p' ? 1.66 : 1.75;
    head.set(P.x, P.y + eye, P.z);
    dir.set(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
    if (view === '1p') {
      camera.position.copy(head); camera.lookAt(head.clone().add(dir)); return;
    }
    const target = inside ? 3.4 : 6.5;
    arm += (target - arm) * Math.min(1, dt * 4);
    want.copy(head).addScaledVector(dir, -arm).add(new Vector3(0, .35, 0));
    // keep the camera out of walls
    const back = want.clone().sub(head); const len = back.length(); back.normalize();
    ray.set(head, back); ray.far = len;
    const hit = ray.intersectObjects(world.occluders, false)[0];
    if (hit) want.copy(head).addScaledVector(back, Math.max(.6, hit.distance - .35));
    if (inside) want.y = Math.min(want.y, P.level * FH + FH - .6);
    want.y = Math.max(want.y, P.y + .3);
    if (snap) camPos.copy(want); else camPos.lerp(want, Math.min(1, dt * 12));
    camera.position.copy(camPos);
    camera.lookAt(head.clone().addScaledVector(dir, 2));
  }

  /* ── update ───────────────────────────────────────────── */
  let lastZone = '';
  function update(dt: number, t: number) {
    // input → movement in the camera's frame
    let ix = joy.x, iz = joy.y;
    if (keys.has('w') || keys.has('arrowup')) iz -= 1;
    if (keys.has('s') || keys.has('arrowdown')) iz += 1;
    if (keys.has('a') || keys.has('arrowleft')) ix -= 1;
    if (keys.has('d') || keys.has('arrowright')) ix += 1;
    const m = Math.hypot(ix, iz);
    const moving = m > .08 && !paused && !ride;
    if (moving) {
      ix /= Math.max(1, m); iz /= Math.max(1, m);
      const sp = (keys.has('shift') ? 10.5 : 6.2) * dt;
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
      const dx = (fx * -iz + rx * ix) * sp, dz = (fz * -iz + rz * ix) * sp;
      if (!blocked(P.x + dx, P.z)) P.x += dx;
      if (!blocked(P.x, P.z + dz)) P.z += dz;
      const wantH = Math.atan2(dx, dz);
      let d = wantH - P.heading; d = Math.atan2(Math.sin(d), Math.cos(d)); P.heading += d * Math.min(1, dt * 12);
      P.walk += dt * (keys.has('shift') ? 13 : 9);
    } else P.walk *= .9;
    // lift ride
    if (ride) {
      ride.t += dt / 1.6;
      const k = Math.min(1, ride.t), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      P.y = (ride.from + (ride.to - ride.from) * e) * FH;
      const col = ride.b.liftCol; if (col) (col.material as MeshBasicMaterial).opacity = .35 * Math.sin(Math.PI * k);
      if (k >= 1) { P.level = ride.to; P.y = P.level * FH; ride = null; wToast(`FLOOR ${P.level + 1}`); }
    } else {
      // gravity
      const floor = P.level * FH;
      P.vy -= 16 * dt; P.y += P.vy * dt;
      if (P.y <= floor) { P.y = floor; P.vy = 0; P.onGround = true; }
    }
    inside = inBld(P.x, P.z);
    if (!inside && P.level !== 0 && !ride) { P.level = 0; P.y = 0; }
    // where am I
    let zoneName = worldHub.name, zid = '';
    if (inside) { zoneName = `${inside.zone.name}${inside.floors > 1 ? ` · floor ${P.level + 1}` : ''}`; zid = inside.zone.id; }
    else {
      let best = 1e9;
      for (const b of world.blds) { const c = toW(b.zone.cx, b.zone.cy); const d = Math.hypot(c.x - P.x, c.z - P.z); if (d < 26 && d < best) { best = d; zoneName = b.zone.name; zid = b.zone.id; } }
    }
    if (zoneEl.textContent !== zoneName) zoneEl.textContent = zoneName;
    if (zid && zid !== lastZone && !prog.zones.includes(zid)) { prog.zones.push(zid); refreshQuests(); wToast(`ENTERED ${zoneName.toUpperCase()}`); }
    lastZone = zid;
    // nearest thing you can use
    near = null; let nd = 1e9;
    dir.set(-Math.sin(P.yaw), 0, -Math.cos(P.yaw));
    for (const s of world.spots) {
      if (s.level !== P.level || (s.bld ? s.bld !== inside : !!inside)) continue;
      const dx = s.pos.x - P.x, dz = s.pos.z - P.z, d = Math.hypot(dx, dz);
      const reach = s.kind === 'lift' ? 1.6 : s.kind === 'panel' ? 4.6 : 3.6;
      if (d > reach) continue;
      if (s.kind === 'panel' && (dx * s.normal.x + dz * s.normal.z) > 0) continue; // behind the wall
      const facing = (dx * dir.x + dz * dir.z) / Math.max(d, .001);
      if (s.kind !== 'lift' && facing < (view === '1p' ? .35 : -.2)) continue;
      const score = d - facing * 1.5;
      if (score < nd) { nd = score; near = s; }
    }
    const label = near ? (near.kind === 'lift' ? near.label : `Read · ${near.label}`) : '';
    if (near && !ride && layer.hidden) { const html = `<kbd>${coarse ? 'Use' : 'E'}</kbd>${esc(label)}`; if (promptEl.innerHTML !== html) promptEl.innerHTML = html; promptEl.hidden = false; }
    else promptEl.hidden = true;
    if (useBtn) useBtn.hidden = !near;
    world.streamPanels(P.x, P.z);
    // avatar pose
    avatar.position.set(P.x, P.y, P.z); avatar.rotation.y = P.heading + Math.PI;
    const sw = moving ? Math.sin(P.walk) : 0;
    armL.rotation.x = sw * .7; armR.rotation.x = -sw * .7; legL.rotation.x = -sw * .8; legR.rotation.x = sw * .8;
    body.position.y = 1.05 + Math.abs(Math.sin(P.walk)) * (moving ? .05 : 0) + Math.sin(t * 2) * .01;
    if (inside) { room.position.set(inside.c.x, P.y + 3.9, inside.c.z); room.intensity += (90 - room.intensity) * Math.min(1, dt * 5 + (dt === 0 ? 1 : 0)); }
    else room.intensity += (0 - room.intensity) * Math.min(1, dt * 5);
    // sun follows the player so shadows stay sharp
    sun.position.set(P.x, 0, P.z).addScaledVector(world.sunDir, 120); sun.target.position.set(P.x, 0, P.z);
  }

  /* ── minimap ──────────────────────────────────────────── */
  function drawMini() {
    const w = 180, c = w / 2, sc = c / ((24.6) * S);
    mg.clearRect(0, 0, w, w);
    mg.save(); mg.translate(c, c);
    mg.beginPath(); mg.arc(0, 0, c - 1, 0, Math.PI * 2); mg.fillStyle = 'rgba(11,17,32,.72)'; mg.fill(); mg.clip();
    mg.rotate(P.yaw);
    mg.beginPath();
    for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, r = islandR(a) * S; const x = (Math.cos(a) * r - P.x) * sc * 1.6, z = (Math.sin(a) * r - P.z) * sc * 1.6; i ? mg.lineTo(x, z) : mg.moveTo(x, z); }
    mg.fillStyle = 'rgba(111,174,116,.55)'; mg.fill();
    for (const b of world.blds) {
      const x = (b.c.x - P.x) * sc * 1.6, z = (b.c.z - P.z) * sc * 1.6;
      mg.fillStyle = LANE[b.lane]; mg.fillRect(x - 5, z - 5, 10, 10);
      mg.save(); mg.translate(x, z); mg.rotate(-P.yaw); mg.fillStyle = '#fff'; mg.font = '700 10px ui-monospace, monospace'; mg.textAlign = 'center'; mg.fillText(String(b.zone.key), 0, -8); mg.restore();
    }
    mg.fillStyle = '#bfe3ff'; mg.beginPath(); mg.arc(-P.x * sc * 1.6, -P.z * sc * 1.6, 4, 0, Math.PI * 2); mg.fill();
    mg.restore();
    mg.fillStyle = '#fff'; mg.beginPath(); mg.moveTo(c, c - 9); mg.lineTo(c - 6, c + 6); mg.lineTo(c, c + 2); mg.lineTo(c + 6, c + 6); mg.closePath(); mg.fill();
    mg.strokeStyle = 'rgba(255,255,255,.35)'; mg.lineWidth = 2; mg.beginPath(); mg.arc(c, c, c - 1, 0, Math.PI * 2); mg.stroke();
  }

  /* ── the way in: a warp, a flash, then a flight down to the island ── */
  const warp = new Scene();
  const warpCam = new PerspectiveCamera(75, 1, .1, 1000);
  const NL = low ? 500 : 1100;
  const wpos = new Float32Array(NL * 6), wcol = new Float32Array(NL * 6), wspd = new Float32Array(NL);
  const palette = [new Color(LANE.main), new Color(LANE.research), new Color(LANE.enterprise), new Color('#ffffff')];
  const resetLine = (i: number, z = -600 * Math.random()) => {
    const a = Math.random() * Math.PI * 2, r = 4 + Math.random() * 60;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    wpos.set([x, y, z, x, y, z - 2], i * 6);
    const c = palette[i % palette.length]; wcol.set([c.r, c.g, c.b, c.r * .2, c.g * .2, c.b * .2], i * 6);
    wspd[i] = .6 + Math.random() * .8;
  };
  for (let i = 0; i < NL; i++) resetLine(i);
  const wg = new BufferGeometry(); wg.setAttribute('position', new Float32BufferAttribute(wpos, 3)); wg.setAttribute('color', new Float32BufferAttribute(wcol, 3));
  const lines = new LineSegments(wg, new LineBasicMaterial({ vertexColors: true, transparent: true, blending: AdditiveBlending, depthWrite: false }));
  warp.add(lines);
  let warpT = 0, flyT = 0;
  const INTRO = reduced ? 0 : 2.6, FLY = reduced ? 0 : 3.4;
  const flyFrom = new Vector3(), flyLook = new Vector3();
  function skipIntro() { warpT = INTRO; flyT = FLY; }
  function updateWarp(dt: number) {
    warpT += dt;
    const speed = 40 + Math.pow(Math.min(1, warpT / INTRO), 2) * 900;
    const p = wg.attributes.position as Float32BufferAttribute;
    for (let i = 0; i < NL; i++) {
      const o = i * 6; const v = speed * wspd[i] * dt;
      p.array[o + 2] += v; p.array[o + 5] = p.array[o + 2] - Math.min(80, speed * .06 * wspd[i] + 2);
      if (p.array[o + 5] > 2) resetLine(i, -600);
    }
    p.needsUpdate = true;
    warpCam.rotation.z += dt * (.2 + warpT * .3);
    ($('.g3-bar i', intro) as HTMLElement).style.width = `${Math.min(100, warpT / Math.max(INTRO, .01) * 100)}%`;
  }

  /* ── loop ─────────────────────────────────────────────── */
  let W = 0, H = 0;
  function resize() {
    W = root.clientWidth; H = root.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.fov = W < 700 ? 78 : 70; camera.updateProjectionMatrix();
    warpCam.aspect = W / H; warpCam.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);
  document.body.style.overflow = 'hidden';
  root.classList.add('is-3d');

  let last = performance.now(), raf = 0, t0 = last, miniT = 0;
  placeCamera(0, true);
  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    if (document.hidden) return;
    world.animate(t);
    if (phase === 'intro') {
      updateWarp(dt);
      renderer.render(warp, warpCam);
      if (warpT >= INTRO) {
        phase = 'fly'; intro.classList.add('is-out'); flash.classList.add('is-on'); setTimeout(() => flash.classList.remove('is-on'), 60);
        flyFrom.set(170, 140, 150); flyLook.set(0, 4, 0);
      }
      return;
    }
    if (phase === 'fly') {
      flyT += dt;
      const k = Math.min(1, flyT / Math.max(FLY, .001)), e = 1 - Math.pow(1 - k, 3);
      placeCamera(dt, true);
      const ang = Math.atan2(flyFrom.z, flyFrom.x) + (1 - e) * 1.6;
      const rad = flyFrom.length() * (1 - e) + 0;
      const from = new Vector3(Math.cos(ang) * rad * .85, flyFrom.y * (1 - e), Math.sin(ang) * rad * .85);
      const pos = from.lerp(camPos, e);
      camera.position.copy(pos);
      camera.lookAt(flyLook.clone().lerp(head.clone().addScaledVector(dir, 2), e));
      update(0, t);
      renderer.render(scene, camera);
      if (k >= 1) {
        phase = 'play'; paused = false; intro.remove(); hud.hidden = false; hud.classList.add('is-in');
        wToast(view === '1p' ? 'FIRST PERSON · WALK IN' : 'THIRD PERSON · WALK IN');
        canvas.focus();
      }
      return;
    }
    update(dt, t);
    placeCamera(dt);
    renderer.render(scene, camera);
    miniT += dt; if (miniT > .1) { miniT = 0; drawMini(); }
  }
  raf = requestAnimationFrame(frame);
  canvas.focus();
  if (/[?&]g3debug\b/.test(location.search)) (window as unknown as Record<string, unknown>).__g3 = { P, spots: world.spots, blds: world.blds, near: () => near, use: () => use(near), info: () => renderer.info.render };
  return { exit };
}
