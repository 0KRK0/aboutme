/* Voice-to-Video: Amdahl lab, the "pull the plug" segment simulation, and the
   CPU/GPU frame comparison. All three explain measurements from the repo;
   none of them pretends to be a benchmark. */

import { vtv } from '../data';
import { $, $$, BASE } from './core';

const COMPOSE = vtv.profile.compose / 100;
const ENCODE = vtv.profile.encode / 100;

export function initVtv() {
  const root = $('#vtv');
  if (!root) return { preset: (_c: number, _e: number) => {}, plug: () => {} };

  /* ── Amdahl lab ─────────────────────────────────────────── */
  const am = $('[data-amdahl]', root);
  const cs = $<HTMLInputElement>('[data-am-cs]', am);
  const es = $<HTMLInputElement>('[data-am-es]', am);
  const cBar = $('[data-am-c]', am), eBar = $('[data-am-e]', am);
  const cv = $('[data-am-cv]', am), ev = $('[data-am-ev]', am);
  const total = $('[data-am-total]', am), note = $('[data-am-note]', am);
  const draw = () => {
    const c = +cs.value, e = +es.value;
    const tc = COMPOSE / c, te = ENCODE / e, t = tc + te;
    cBar.style.width = `${(tc * 100).toFixed(2)}%`;
    eBar.style.width = `${(te * 100).toFixed(2)}%`;
    cBar.textContent = tc > 0.14 ? `compose ${(tc * 100).toFixed(0)}%` : '';
    eBar.textContent = te > 0.14 ? `encode ${(te * 100).toFixed(0)}%` : '';
    cv.textContent = `${c.toFixed(1)}×`;
    ev.textContent = `${e.toFixed(1)}×`;
    total.textContent = `${(1 / t).toFixed(2)}×`;
    note.textContent = c === 1 && e > 1
      ? `faster overall. However fast the encoder gets, the ceiling is ${(1 / COMPOSE).toFixed(2)}×.`
      : c > 1 && e === 1 ? `faster overall. Composition is where the time is.` : 'faster overall';
  };
  const preset = (c: number, e: number) => { cs.value = String(c); es.value = String(e); draw(); };
  cs.addEventListener('input', draw);
  es.addEventListener('input', draw);
  $$<HTMLButtonElement>('[data-am-preset]', am).forEach(b => b.addEventListener('click', () => {
    const [c, e] = b.dataset.amPreset!.split(',').map(Number);
    preset(c, e);
  }));
  draw();

  /* ── pull the plug ──────────────────────────────────────── */
  const pl = $('[data-plug]', root);
  const cells = $$('[data-plug-segs] i', pl);
  const one = $('[data-plug-one]', pl);
  const oneS = $('[data-plug-one-s]', pl), segS = $('[data-plug-seg-s]', pl);
  const goBtn = $<HTMLButtonElement>('[data-plug-go]', pl), cutBtn = $<HTMLButtonElement>('[data-plug-cut]', pl);
  const msg = $('[data-plug-msg]', pl);
  const N = cells.length, WORKERS = 4, SEG_MS = 600;
  let done = new Set<number>(), running = new Map<number, number>(), onePct = 0;
  let timer = 0, last = 0, lastCut = { one: 0, segs: 0 };
  const paint = () => {
    one.style.width = `${onePct.toFixed(1)}%`;
    oneS.textContent = `${Math.floor(onePct)}%`;
    cells.forEach((c, i) => { c.className = done.has(i) ? 'is-done' : running.has(i) ? 'is-part' : c.classList.contains('is-lost') ? 'is-lost' : ''; });
    segS.textContent = `${done.size} / ${N}`;
  };
  const tick = (now: number) => {
    const dt = Math.min(100, now - (last || now)); last = now;
    onePct = Math.min(100, onePct + (dt / (SEG_MS * N)) * 100);
    running.forEach((t, i) => { const nt = t + dt; if (nt >= SEG_MS) { running.delete(i); done.add(i); } else running.set(i, nt); });
    for (let i = 0; i < N && running.size < WORKERS; i++) if (!done.has(i) && !running.has(i)) running.set(i, 0);
    paint();
    if (done.size === N && onePct >= 100) { stop(); msg.textContent = 'Both finished. Run it again and cut the power halfway.'; goBtn.textContent = 'Start again'; return; }
    if (done.size === N) msg.textContent = `Segmented render finished: ${WORKERS} worker processes here, up to eight in the real renderer. The single pass is still going.`;
    timer = requestAnimationFrame(tick);
  };
  const stop = () => { cancelAnimationFrame(timer); timer = 0; last = 0; cutBtn.disabled = true; };
  goBtn.addEventListener('click', () => {
    if (timer) return;
    if (done.size === N && onePct >= 100) { done = new Set(); onePct = 0; cells.forEach(c => c.classList.remove('is-lost')); }
    cells.forEach(c => c.classList.remove('is-lost'));
    const resuming = lastCut.one > 0 || lastCut.segs > 0;
    msg.textContent = resuming
      ? `Resumed. The single pass starts from frame zero; the segmented render keeps its ${done.size} finished files and redraws only what was in progress.`
      : 'Rendering. Cut the power whenever you like.';
    lastCut = { one: 0, segs: 0 };
    goBtn.textContent = 'Resume';
    cutBtn.disabled = false;
    timer = requestAnimationFrame(tick);
  });
  cutBtn.addEventListener('click', () => {
    if (!timer) return;
    stop();
    lastCut = { one: onePct, segs: running.size };
    running.forEach((_, i) => cells[i].classList.add('is-lost'));
    const lostPart = running.size;
    running = new Map();
    const lostOne = Math.floor(onePct);
    onePct = 0;
    paint();
    msg.textContent = `Power cut. The single pass lost ${lostOne}% of its work: one file that either exists or doesn't. The segmented render lost ${lostPart} half-written .part file${lostPart === 1 ? '' : 's'} and kept ${done.size} finished segment${done.size === 1 ? '' : 's'}.`;
  });
  paint();

  /* ── CPU vs GPU frames ──────────────────────────────────── */
  const eq = $('[data-eq]', root);
  const imgs = $$<HTMLImageElement>('[data-eq-img]', eq);
  const verdicts = $('[data-eq-v]', eq);
  const tabs = $$<HTMLButtonElement>('[data-eq-scene]', eq);
  const show = (id: string) => {
    const f = vtv.frames.find(x => x.id === id)!;
    imgs.forEach(img => { img.src = `${BASE}vtv/${f.id}-${img.dataset.eqImg}.webp`; img.alt = `${f.label}: ${img.dataset.eqImg === 'diff' ? 'difference map' : img.dataset.eqImg === 'cpu' ? 'CPU reference frame' : 'GPU frame from the earlier shader'}`; });
    tabs.forEach(t => { const on = t.dataset.eqScene === id; t.classList.toggle('is-on', on); t.setAttribute('aria-checked', String(on)); });
    verdicts.innerHTML = `<div class="eq-v is-fail"><b>Earlier shader · fail</b>Worst difference ${f.before.worst} levels, ${f.before.over.toLocaleString('en-GB')} pixels over 2. A single floating-point pass kept Lanczos overshoot that Pillow clips between its two passes.</div>
      <div class="eq-v is-pass"><b>After the fix · pass</b>Two passes through an 8-bit buffer: worst difference ${f.after.worst}, 0 pixels over 2, mean difference ${f.after.mad}. All 23 scenes passed.</div>`;
  };
  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.eqScene!)));
  show(vtv.frames[0].id);

  return { preset, plug: () => goBtn.click() };
}
