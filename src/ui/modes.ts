/* Mode router: Web · Terminal · Explorer · World. Hash-addressable (#terminal, #explorer, #world). */

import { $, $$, toast } from './core';
import { openTerminal, isTerminalOpen } from './terminal';
import { openExplorer, closeExplorer } from './explorer';
import { closeModal } from './core';

export type Mode = 'web' | 'terminal' | 'explorer' | 'world';
const MODES: Mode[] = ['web', 'terminal', 'explorer', 'world'];

let worldMod: Promise<typeof import('../world/world')> | null = null;
export const loadWorld = () => (worldMod ??= import('../world/world'));

function mark(mode: Mode) {
  $$('[data-mode-link]').forEach(a => { if (a.closest('.modes')) a.setAttribute('aria-current', String(a.dataset.modeLink === mode)); });
}

export async function openMode(mode: Mode) {
  mark(mode);
  // one mode at a time
  if (mode !== 'explorer' && !$('#explorer').hidden) closeExplorer();
  if (mode !== 'terminal' && isTerminalOpen()) closeModal($('#term'));
  if (mode === 'web') { return; }
  if (mode === 'terminal') { if (!isTerminalOpen()) openTerminal(); return; }
  if (mode === 'explorer') { openExplorer(); return; }
  if (mode === 'world') {
    const root = $('#world-root');
    if (!root.hidden) return;
    root.hidden = false;
    root.innerHTML = '<div class="w-loading"><p class="prompt"><span class="p-sign">$</span> loading world …</p></div>';
    try {
      const m = await loadWorld();
      m.enterWorld(root, () => { mark('web'); if (location.hash === '#world') history.replaceState(null, '', location.pathname + location.search); });
    } catch {
      root.hidden = true;
      toast('Rajesh World could not load. Check your connection and try again.', 3200);
      mark('web');
    }
  }
}

export function initModes() {
  document.addEventListener('click', e => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('[data-mode-link]');
    if (!a) return;
    const m = a.dataset.modeLink as Mode;
    if (m === 'web') { mark('web'); return; } // let the #top link scroll
    e.preventDefault();
    openMode(m);
  });
  const fromHash = () => {
    const h = location.hash.slice(1) as Mode;
    if (MODES.includes(h) && h !== 'web') openMode(h);
  };
  addEventListener('hashchange', fromHash);
  fromHash();
  // warm the world chunk when someone hovers its entry points
  $$('[data-mode-link="world"]').forEach(a => a.addEventListener('pointerenter', () => { loadWorld(); }, { once: true }));
}
