/* Shared helpers used by every interaction mode. */

export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const BASE = import.meta.env.BASE_URL;

export const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  json<T>(k: string, fallback: T): T { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } },
};

/* ── toast + clipboard ───────────────────────────────────── */
let toastTimer = 0;
export function toast(msg: string, ms = 1800) {
  const t = $('.toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (t.hidden = true), ms);
}
export async function copy(text: string, what = 'Copied') {
  try { await navigator.clipboard.writeText(text); toast(what); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(what); } catch { toast('Select the text to copy it'); }
    ta.remove();
  }
}

/* ── theme ───────────────────────────────────────────────── */
export function toggleTheme() {
  const root = document.documentElement;
  const cur = root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set('theme', next);
  toast(`Theme: ${next}`);
}

/* ── modals: focus trap, Esc, focus restore ──────────────── */
const openers = new Map<HTMLElement, HTMLElement | null>();
const focusables = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
export function openModal(m: HTMLElement, opener?: HTMLElement | null, focusSel?: string) {
  openers.set(m, opener ?? (document.activeElement as HTMLElement));
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  const f = focusSel ? $<HTMLElement>(focusSel, m) : ($<HTMLElement>('.modal-card', m) ?? m);
  f?.focus();
}
export function closeModal(m: HTMLElement) {
  if (m.hidden) return;
  m.hidden = true;
  if (!$$('.modal, .mode-overlay, .world-root').some(x => !x.hidden)) document.body.style.overflow = '';
  openers.get(m)?.focus();
}
export function trapFocus(m: HTMLElement, onEscape: () => void) {
  m.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); onEscape(); }
    if (e.key === 'Tab') {
      const f = $$<HTMLElement>(focusables, m).filter(x => !x.closest('[hidden]') && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
export function initModals() {
  $$('.modal').forEach(m => {
    $$('[data-close]', m).forEach(c => c.addEventListener('click', () => closeModal(m)));
    trapFocus(m, () => closeModal(m));
  });
}

/* ── navigation ──────────────────────────────────────────── */
export function go(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', '#' + id);
}

/* ── segmented radio groups ──────────────────────────────── */
export function radios(group: HTMLElement, onPick: (b: HTMLButtonElement) => void) {
  const bs = $$<HTMLButtonElement>('[role="radio"]', group);
  const pick = (b: HTMLButtonElement, focus = false) => {
    bs.forEach(x => { x.setAttribute('aria-checked', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
    if (focus) b.focus();
    onPick(b);
  };
  bs.forEach((b, i) => {
    b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    b.addEventListener('click', () => pick(b));
    b.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pick(bs[(i + 1) % bs.length], true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pick(bs[(i - 1 + bs.length) % bs.length], true); }
    });
  });
  return { pick: (i: number) => bs[i] && pick(bs[i]) };
}

/** Actions other modules can trigger (terminal, world, directory). Registered in main.ts. */
export const actions: Record<string, (arg?: string) => void> = {};
export const run = (name: string, arg?: string) => actions[name]?.(arg);
