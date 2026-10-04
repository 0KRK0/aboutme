/* Mode router: Web · Terminal · Explorer · World. Hash-addressable (#terminal, #explorer, #world). */

import { $, $$, toast, reduced } from './core';
import { openTerminal, isTerminalOpen } from './terminal';
import { openExplorer, closeExplorer } from './explorer';
import { closeModal } from './core';

export type Mode = 'web' | 'terminal' | 'explorer' | 'world';
export type WorldView = 'iso' | '3p' | '1p';
const MODES: Mode[] = ['web', 'terminal', 'explorer', 'world'];
const VIEW_HASH: Record<WorldView, string> = { iso: 'world', '3p': 'world-3p', '1p': 'world-1p' };

let worldMod: Promise<typeof import('../world/world')> | null = null;
export const loadWorld = () => (worldMod ??= import('../world/world'));
let world3dMod: Promise<typeof import('../world3d/game')> | null = null;
export const loadWorld3d = () => (world3dMod ??= import('../world3d/game'));

function mark(mode: Mode) {
  $$('[data-mode-link]').forEach(a => { if (a.parentElement?.classList.contains('modes')) a.setAttribute('aria-current', String(a.dataset.modeLink === mode)); });
}

export async function openMode(mode: Mode) {
  mark(mode);
  // one mode at a time
  if (mode !== 'explorer' && !$('#explorer').hidden) closeExplorer();
  if (mode !== 'terminal' && isTerminalOpen()) closeModal($('#term'));
  if (mode === 'web') { return; }
  if (mode === 'terminal') { if (!isTerminalOpen()) openTerminal(); return; }
  if (mode === 'explorer') { openExplorer(); return; }
  if (mode === 'world') openWorld('iso');
}

const leaveWorld = () => { mark('web'); if (/^#world/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); };

export async function openWorld(view: WorldView) {
  mark('world');
  if (!$('#explorer').hidden) closeExplorer();
  if (isTerminalOpen()) closeModal($('#term'));
  const root = $('#world-root');
  if (!root.hidden) return;
  root.hidden = false;
  root.dataset.view = view;
  root.innerHTML = `<div class="w-loading"><p class="prompt"><span class="p-sign">$</span> loading ${view === 'iso' ? 'world' : '3D world'} …</p></div>`;
  if (location.hash.slice(1) !== VIEW_HASH[view]) history.replaceState(null, '', '#' + VIEW_HASH[view]);
  const switchTo = (v: WorldView) => { root.hidden = true; root.innerHTML = ''; setTimeout(() => openWorld(v), 30); };
  try {
    if (view === 'iso') {
      const m = await loadWorld();
      m.enterWorld(root, leaveWorld, v => switchTo(v));
    } else {
      const m = await loadWorld3d();
      if (!m.webglOk()) { root.hidden = true; toast('3D needs WebGL, which this browser has switched off. Opening the map view instead.', 3600); setTimeout(() => openWorld('iso'), 50); return; }
      m.enter3D(root, view, leaveWorld, v => switchTo(v));
    }
  } catch {
    root.hidden = true;
    toast('Rajesh World could not load. Check your connection and try again.', 3200);
    mark('web');
  }
}

export function initModes() {
  document.addEventListener('click', e => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('[data-mode-link]');
    if (!a) return;
    const m = a.dataset.modeLink as Mode;
    if (m === 'web') { mark('web'); return; } // let the #top link scroll
    e.preventDefault();
    const v = a.dataset.worldView as WorldView | undefined;
    if (m === 'world' && v) openWorld(v); else openMode(m);
  });
  const fromHash = () => {
    const h = location.hash.slice(1);
    if (h === 'world-3p' || h === 'world-1p') { openWorld(h === 'world-3p' ? '3p' : '1p'); return; }
    if (MODES.includes(h as Mode) && h !== 'web') openMode(h as Mode);
  };
  addEventListener('hashchange', fromHash);
  fromHash();
  // warm the world chunk when someone hovers its entry points
  $$('[data-mode-link="world"]').forEach(a => a.addEventListener('pointerenter', () => { if (a.dataset.worldView && a.dataset.worldView !== 'iso') loadWorld3d(); else loadWorld(); }, { once: true }));
}

/** On arrival, point at the three ways into Rajesh World for a few seconds. */
export function highlightWorld() {
  const pop = document.querySelector<HTMLElement>('[data-world-pop]');
  const views = document.querySelector<HTMLElement>('[data-world-views]');
  const tab = document.querySelector<HTMLElement>('.modes > [data-mode-link="world"]');
  if (!pop || !tab || /^#world/.test(location.hash)) return;
  let done = false;
  const end = () => {
    if (done) return; done = true;
    pop.classList.remove('is-on'); tab.classList.remove('is-hl'); views?.classList.remove('is-hl');
    setTimeout(() => { pop.hidden = true; }, 400);
    removeEventListener('scroll', onScroll); document.removeEventListener('pointerdown', onDown, true); removeEventListener('keydown', onKeyDown);
  };
  const onScroll = () => { if (scrollY > 200) end(); };
  const onDown = (e: Event) => { if (!pop.contains(e.target as Node)) end(); };
  const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') end(); };
  setTimeout(() => {
    if (done || !$('#world-root').hidden) return;
    pop.hidden = false;
    requestAnimationFrame(() => { pop.classList.add('is-on'); tab.classList.add('is-hl'); views?.classList.add('is-hl'); });
    addEventListener('scroll', onScroll, { passive: true }); document.addEventListener('pointerdown', onDown, true); addEventListener('keydown', onKeyDown);
    setTimeout(end, reduced ? 9000 : 7000);
  }, 1100);
  pop.addEventListener('click', () => end());
}
