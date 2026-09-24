import '@fontsource-variable/schibsted-grotesk/wght.css';
import '@fontsource/martian-mono/latin-400.css';
import '@fontsource/martian-mono/latin-500.css';
import '@fontsource/martian-mono/latin-700.css';
import './styles.css';
import { renderApp, renderCommitDetail, esc } from './render';
import { commits, pipeline, credentials, voicePillars, site, channels, lanes, type Lane } from './data';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};
const BASE = import.meta.env.BASE_URL;

const app = document.getElementById('app')!;
if (!app.firstElementChild) app.innerHTML = renderApp(); // dev mode; production HTML is prerendered
document.documentElement.classList.add('js');

/* ── theme ───────────────────────────────────────────────── */
const savedTheme = store.get('theme');
if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;
function toggleTheme() {
  const root = document.documentElement;
  const cur = root.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set('theme', next);
  toast(`Theme: ${next}`);
}
$$('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));

/* ── toast + copy ────────────────────────────────────────── */
let toastTimer = 0;
function toast(msg: string) {
  const t = $('.toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (t.hidden = true), 1800);
}
async function copy(text: string, what = 'Copied') {
  try { await navigator.clipboard.writeText(text); toast(what); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(what); } catch { toast('Select the text to copy it'); }
    ta.remove();
  }
}
document.addEventListener('click', e => {
  const b = (e.target as Element).closest<HTMLElement>('[data-copy]');
  if (b) copy(b.dataset.copy!, b.dataset.copy!.includes('@') ? 'Email copied' : 'Citation copied');
});

/* ── top bar state + active section ──────────────────────── */
const topbar = $('.topbar');
const onScroll = () => topbar.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const navLinks = $$<HTMLAnchorElement>('.nav-links a');
const spy = new IntersectionObserver(entries => {
  for (const en of entries) if (en.isIntersecting) {
    const id = en.target.id;
    navLinks.forEach(a => a.setAttribute('aria-current', String(a.hash === '#' + id || (id === 'atlas' || id === 'ownvoicz') && a.hash === '#lexora')));
  }
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => spy.observe(s));

/* ── evolution graph ─────────────────────────────────────── */
const graph = $<SVGSVGElement>('.graph');
const panel = $('#commit-panel');
const nodes = $$<SVGGElement>('.graph .node');
const order = [...commits].map((c, i) => ({ c, i })).sort((a, b) => a.c.t - b.c.t).map(o => o.i);
let sel = commits.findIndex(c => c.head);

function select(i: number, focus = false) {
  sel = i;
  nodes.forEach(n => {
    const on = Number(n.dataset.i) === i;
    n.classList.toggle('is-sel', on);
    n.setAttribute('tabindex', on ? '0' : '-1');
    n.setAttribute('aria-pressed', String(on));
  });
  panel.innerHTML = renderCommitDetail(commits[i]);
  if (focus) (nodes[i] as unknown as HTMLElement).focus();
}
nodes.forEach(n => {
  n.addEventListener('click', () => select(Number(n.dataset.i)));
  n.addEventListener('keydown', e => {
    const pos = order.indexOf(Number(n.dataset.i));
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(order[Math.min(order.length - 1, pos + 1)], true); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(order[Math.max(0, pos - 1)], true); }
    else if (e.key === 'Home') { e.preventDefault(); select(order[0], true); }
    else if (e.key === 'End') { e.preventDefault(); select(order[order.length - 1], true); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(Number(n.dataset.i)); }
  });
});
select(sel);

// draw-in: measure each edge once
$$<SVGPathElement>('.graph .edge').forEach((p, i) => {
  p.style.setProperty('--len', String(Math.ceil(p.getTotalLength())));
  p.style.setProperty('--d', String(i));
});
nodes.forEach((n, i) => (n as unknown as HTMLElement).style.setProperty('--i', String(i)));
if (!reduced) {
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { graph.classList.add('draw'); io.disconnect(); } });
  io.observe(graph);
}

// time cursor
const cursor = $<SVGLineElement>('.graph .cursor');
const cursorLabel = $<SVGTextElement>('.graph .cursor-label');
const vb = graph.viewBox.baseVal;
const t0 = 2019, t1 = 2027.7, padL = 118, padR = 36;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
graph.addEventListener('pointermove', e => {
  const r = graph.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * vb.width;
  if (x < padL || x > vb.width - padR) { graph.classList.remove('is-hover'); return; }
  const t = t0 + ((x - padL) / (vb.width - padL - padR)) * (t1 - t0);
  graph.classList.add('is-hover');
  cursor.setAttribute('x1', String(x)); cursor.setAttribute('x2', String(x));
  cursorLabel.setAttribute('x', String(x));
  cursorLabel.textContent = `${months[Math.min(11, Math.floor((t % 1) * 12))]} ${Math.floor(t)}`;
});
graph.addEventListener('pointerleave', () => graph.classList.remove('is-hover'));

// lane filter: git checkout <lane>
const chips = $$<HTMLButtonElement>('[data-lane-filter]');
const logRows = $$('.log-row');
function checkout(lane: string) {
  chips.forEach(c => { const on = c.dataset.laneFilter === lane; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
  if (lane === 'all') {
    delete graph.dataset.focus;
    $$('[data-lane-hit]', graph).forEach(el => el.removeAttribute('data-lane-hit'));
    logRows.forEach(r => (r.hidden = false));
    return;
  }
  graph.dataset.focus = lane;
  $$('.edge, .node', graph).forEach(el => el.toggleAttribute('data-lane-hit', (el as HTMLElement).dataset.lane === lane || (el.classList.contains('head'))));
  logRows.forEach(r => (r.hidden = r.dataset.lane !== lane && !r.classList.contains('is-head')));
  $('.log').classList.remove('is-collapsed'); $('[data-log-more]').hidden = true;
  const first = commits.map((c, i) => ({ c, i })).filter(o => o.c.lane === lane).sort((a, b) => b.c.t - a.c.t)[0];
  if (first) select(first.i);
}
chips.forEach(c => c.addEventListener('click', () => checkout(c.dataset.laneFilter!)));

// narrow screens: show the newest commits first, the rest on request
{
  const log = $('.log'), more = $<HTMLButtonElement>('[data-log-more]');
  more.hidden = false;
  more.addEventListener('click', () => { log.classList.remove('is-collapsed'); more.hidden = true; });
}

/* ── counters ────────────────────────────────────────────── */
if (!reduced) {
  const co = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    co.unobserve(en.target);
    const el = en.target as HTMLElement;
    const to = Number(el.dataset.count), dec = Number(el.dataset.decimals), suf = el.dataset.suffix ?? '';
    const start = performance.now(), dur = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => co.observe(el));
}

/* ── pipeline case study ─────────────────────────────────── */
{
  const pipe = $('[data-pipe]');
  const stages = $$('.pipe-stage', pipe);
  const text = $('[data-pipe-text]');
  const play = $<HTMLButtonElement>('[data-pipe-play]');
  let step = stages.length - 1, timer = 0;
  const show = (i: number) => {
    step = Math.max(0, Math.min(stages.length - 1, i));
    stages.forEach((s, k) => { s.classList.toggle('is-past', k <= step); s.classList.toggle('is-cur', k === step); });
    pipe.style.setProperty('--p', String(step / (stages.length - 1)));
    pipe.dataset.state = pipeline[step].ok ? 'ok' : step >= 2 ? 'alert' : '';
    text.textContent = pipeline[step].text;
  };
  const stop = () => { clearInterval(timer); timer = 0; play.textContent = 'Replay'; };
  const run = () => {
    if (timer) return stop();
    show(0); play.textContent = 'Pause';
    timer = window.setInterval(() => { if (step >= stages.length - 1) return stop(); show(step + 1); }, reduced ? 1600 : 1300);
  };
  play.addEventListener('click', run);
  $('[data-pipe-prev]').addEventListener('click', () => { stop(); show(step - 1); });
  $('[data-pipe-next]').addEventListener('click', () => { stop(); show(step + 1); });
  stages.forEach((s, k) => $('button', s).addEventListener('click', () => { stop(); show(k); }));
  show(step);
  if (!reduced) {
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); run(); } }, { threshold: .5 });
    io.observe(pipe);
  }
}

/* ── radio-group helper (segmented controls) ─────────────── */
function radios(group: HTMLElement, onPick: (b: HTMLButtonElement) => void) {
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
}

/* ── LexoraAI: where does your file go? ──────────────────── */
{
  const flow = $('[data-flow]');
  const cap = $('[data-flow-cap]');
  const steps = $('[data-flow-steps]');
  const paths: Record<string, { nodes: string[]; cap: string }> = {
    free: { nodes: ['device', 'local', 'result'], cap: 'Free tools run entirely in your browser. The file never leaves your device.' },
    server: { nodes: ['device', 'consent', 'server', 'result'], cap: 'Server features ask first. The file is processed, returned, then deleted.' },
    ai: { nodes: ['device', 'llm', 'result'], cap: 'Select text and ask. The AI companion explains it in plain language.' },
  };
  const set = (mode: string) => {
    const p = paths[mode];
    $$('.f-node', flow).forEach(n => { const on = p.nodes.includes(n.dataset.node!); n.classList.toggle('is-on', on); n.classList.toggle('is-off', !on); });
    $$('.f-edge', flow).forEach(e => e.classList.toggle('is-on', e.dataset.m === mode));
    cap.textContent = p.cap;
    steps.innerHTML = p.nodes.map(id => { const n = $(`.f-node[data-node="${id}"]`, flow); return `<li><b>${esc($('.f-t', n).textContent!)}</b><span>${esc($('.f-s', n).textContent!)}</span></li>`; }).join('');
  };
  radios($('.seg', flow), b => set(b.dataset.mode!));
  set('free');
}

/* ── Atlas: follow one task ──────────────────────────────── */
{
  const root = $('[data-atlas]');
  const stages = $$('.a-stage', root);
  const log = $('[data-atlas-log]');
  const runBtn = $<HTMLButtonElement>('[data-atlas-run]');
  const approve = $<HTMLButtonElement>('[data-atlas-approve]');
  let risk = 'low', timer = 0, i = -1;
  const say = (s: string) => (log.innerHTML = `<span class="p-sign">$</span> ${esc(s)}`);
  const reset = () => { clearInterval(timer); timer = 0; i = -1; stages.forEach(s => s.classList.remove('is-active', 'is-done', 'is-wait')); approve.hidden = true; runBtn.disabled = false; };
  const advance = () => {
    if (i >= 0) { stages[i].classList.remove('is-active'); stages[i].classList.add('is-done'); }
    i++;
    const s = stages[i];
    if (!s) { clearInterval(timer); timer = 0; runBtn.disabled = false; runBtn.textContent = 'Run again'; say(`task complete · every step written to the audit log`); return; }
    const id = s.dataset.stage;
    if (id === 'approval' && risk === 'low') { s.classList.add('is-done'); say('approval skipped · low risk'); return; }
    s.classList.add('is-active');
    if (id === 'approval') {
      clearInterval(timer); timer = 0; s.classList.remove('is-active'); s.classList.add('is-wait');
      approve.hidden = false; approve.focus(); say('paused · high-risk action needs a human to approve');
      return;
    }
    say(`${$('.a-name', s).textContent!.toLowerCase()} …`);
  };
  radios($('.seg', root), b => { risk = b.dataset.risk!; reset(); runBtn.textContent = 'Run task'; say(risk === 'high' ? 'High-risk task selected. It will stop for approval.' : 'Low-risk task selected.'); });
  runBtn.addEventListener('click', () => { reset(); runBtn.disabled = true; advance(); timer = window.setInterval(advance, reduced ? 1400 : 950); });
  approve.addEventListener('click', () => {
    approve.hidden = true; stages[i].classList.remove('is-wait'); stages[i].classList.add('is-done');
    say('approved by a human · resuming'); runBtn.focus(); timer = window.setInterval(advance, reduced ? 1400 : 950);
  });
}

/* ── ownVoicz orbit ──────────────────────────────────────── */
{
  const root = $('[data-voice]');
  const detail = $('[data-voice-detail]');
  const bs = $$<HTMLButtonElement>('.pillar', root);
  bs.forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    bs.forEach(x => x.setAttribute('aria-pressed', String(x === b && on)));
    $$('.spoke', root).forEach(s => s.classList.toggle('is-on', on && s.getAttribute('data-spoke') === b.dataset.pillar));
    const p = voicePillars.find(v => v.id === b.dataset.pillar)!;
    detail.innerHTML = on
      ? `<p class="vd-k">${esc(p.name)} <span class="status status-wip sm">planned</span></p><p class="vd-t">${esc(p.detail)}</p>`
      : `<p class="vd-k">Voice ID <span class="status status-wip sm">core idea</span></p><p class="vd-t">The identity primitive. Everything else asks it for permission.</p>`;
  }));
}

/* ── MSc credit map ──────────────────────────────────────── */
{
  const credits = $$<HTMLButtonElement>('.credit');
  const mods = $$('.module');
  credits.forEach(c => c.addEventListener('click', () => {
    const on = !c.classList.contains('is-on');
    credits.forEach(x => x.classList.toggle('is-on', x === c && on));
    mods.forEach(m => m.classList.toggle('is-on', on && m.dataset.code === c.dataset.code));
    const m = mods.find(x => x.dataset.code === c.dataset.code);
    if (on && m && matchMedia('(max-width: 820px)').matches) m.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  }));
}

/* ── stack trace ─────────────────────────────────────────── */
{
  const root = $('[data-trace]');
  const wires = $<SVGSVGElement>('.trace-wires', root);
  const status = $('[data-trace-status]', root);
  const skillsEls = $$<HTMLButtonElement>('.skill', root);
  const ev = $$('.ev', root);
  let cur: HTMLButtonElement | null = null;
  const draw = () => {
    wires.innerHTML = '';
    if (!cur || getComputedStyle(wires).display === 'none') return;
    const R = root.getBoundingClientRect(), a = cur.getBoundingClientRect(), col = $('.trace-skills', root).getBoundingClientRect();
    const x1 = col.right - R.left + 12, y1 = a.top + a.height / 2 - R.top;
    wires.innerHTML = ev.filter(e => e.classList.contains('is-hit')).map(e => {
      const b = e.getBoundingClientRect(), x2 = b.left - R.left, y2 = b.top + b.height / 2 - R.top, m = (x1 + x2) / 2;
      return `<path data-lane="${e.dataset.lane}" d="M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2} ${y2}"/>`;
    }).join('');
  };
  skillsEls.forEach(s => s.addEventListener('click', () => {
    const on = s !== cur;
    cur = on ? s : null;
    skillsEls.forEach(x => x.setAttribute('aria-pressed', String(x === cur)));
    const ids = on ? s.dataset.ev!.split(' ') : [];
    ev.forEach(e => e.classList.toggle('is-hit', ids.includes(e.dataset.evId!)));
    root.classList.toggle('has-sel', on);
    status.textContent = on ? `${s.textContent} · used in ${ids.length} place${ids.length > 1 ? 's' : ''}` : 'Select a skill.';
    draw();
  }));
  addEventListener('resize', draw);
  skillsEls[0]?.click();
}

/* ── credential vault ────────────────────────────────────── */
{
  const search = $<HTMLInputElement>('#vault-search');
  const cats = $$<HTMLButtonElement>('[data-cat]').filter(b => b.tagName === 'BUTTON');
  const items = $$('.cred');
  const count = $('[data-vault-count]');
  let cat = 'All';
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let n = 0;
    items.forEach(it => { const ok = (cat === 'All' || it.dataset.cat === cat) && (!q || it.dataset.search!.includes(q)); it.hidden = !ok; if (ok) n++; });
    count.textContent = n ? `${n} credential${n > 1 ? 's' : ''}` : 'No credentials match. Try another word or filter.';
  };
  cats.forEach(b => b.addEventListener('click', () => { cat = b.dataset.cat!; cats.forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); }); apply(); }));
  search.addEventListener('input', apply);

  const modal = $('#cred-modal');
  const body = $('.cm-body', modal);
  const img = (name: string) => `${BASE}credentials/${name}.webp`;
  $$<HTMLButtonElement>('[data-cred]').forEach(b => b.addEventListener('click', () => {
    const c = credentials.find(x => x.id === b.dataset.cred)!;
    const row = (k: string, v?: string, mono = false) => v ? `<div><dt>${k}</dt><dd${mono ? ' class="mono"' : ''}>${esc(v)}</dd></div>` : '';
    body.innerHTML = `
      <div class="cm-img${c.image ? '' : ' is-pending'}">${c.image ? `<img src="${img(c.image)}" alt="Certificate: ${esc(c.title)}" width="1320" height="1020">` : 'Proof for this credential has not been uploaded yet.'}</div>
      <div class="cm-info">
        <p class="cred-kind">${c.kind} · ${c.cat}</p>
        <h3 id="cm-title">${esc(c.title)}</h3>
        <dl>${row('Issuer', c.issuer)}${row(c.kind === 'Internship' ? 'Period' : 'Earned', c.date)}${row('Valid until', c.validUntil)}${row('Credential ID', c.credentialId, true)}${row('Certification number', c.certNumber, true)}${row('Details', c.details)}</dl>
        ${c.includes ? `<div><p class="cred-kind">Includes</p><ul class="cm-includes">${c.includes.map(i => `<li><a href="${esc(i.verify)}" target="_blank" rel="noopener">${esc(i.title)} ↗</a></li>`).join('')}</ul></div>` : ''}
        ${c.verify ? `<a class="btn btn-solid sm" href="${esc(c.verify)}" target="_blank" rel="noopener">Verify credential ↗</a>` : ''}
        ${c.credentialId || c.certNumber ? `<button type="button" class="btn btn-line sm" data-copy="${esc(c.credentialId ?? c.certNumber!)}">Copy ID</button>` : ''}
      </div>`;
    openModal(modal, b);
  }));
}

/* ── modal plumbing (focus trap, esc, restore focus) ─────── */
let lastFocus: HTMLElement | null = null;
function openModal(m: HTMLElement, opener?: HTMLElement | null, focusSel?: string) {
  lastFocus = opener ?? (document.activeElement as HTMLElement);
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  const f = focusSel ? $<HTMLElement>(focusSel, m) : $<HTMLElement>('.modal-card', m);
  f.focus();
}
function closeModal(m: HTMLElement) {
  m.hidden = true;
  if (!$$('.modal').some(x => !x.hidden)) document.body.style.overflow = '';
  lastFocus?.focus();
}
$$('.modal').forEach(m => {
  $$('[data-close]', m).forEach(c => c.addEventListener('click', () => closeModal(m)));
  m.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); closeModal(m); }
    if (e.key === 'Tab') {
      const f = $$<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', m).filter(x => !x.closest('[hidden]') && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
});

/* ── command palette ─────────────────────────────────────── */
type Cmd = { label: string; kind: string; run: () => void; keys?: string };
const go = (id: string) => () => { document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); history.replaceState(null, '', '#' + id); };
const open = (url: string) => () => { window.open(url, '_blank', 'noopener'); };
const cmds: Cmd[] = [
  { label: 'Career graph', kind: 'Section', run: go('top'), keys: 'home evolution log timeline git' },
  { label: 'Production work at Accenture', kind: 'Section', run: go('work'), keys: 'experience salesforce enterprise bug' },
  { label: 'LexoraAI', kind: 'Product', run: go('lexora'), keys: 'projects shipped document' },
  { label: 'Atlas', kind: 'Product', run: go('atlas'), keys: 'agents gateway enterprise' },
  { label: 'ownVoicz', kind: 'Product', run: go('ownvoicz'), keys: 'voice id' },
  { label: 'Earlier projects', kind: 'Section', run: go('archive'), keys: 'blockchain iot web3 aider archive' },
  { label: 'Research papers', kind: 'Section', run: go('research'), keys: 'publications ijcrt irjet' },
  { label: 'MSc modules at Edinburgh', kind: 'Section', run: go('now'), keys: 'education university courses' },
  { label: 'Skills (stack trace)', kind: 'Section', run: go('stack'), keys: 'tech stack' },
  { label: 'Credential vault', kind: 'Section', run: go('credentials'), keys: 'certificates certifications azure aws' },
  { label: 'Awards and community', kind: 'Section', run: go('recognition'), keys: 'recognition leadership' },
  { label: 'YouTube channels', kind: 'Section', run: go('explain'), keys: 'teaching videos' },
  { label: 'Contact', kind: 'Section', run: go('contact'), keys: 'email hire' },
  { label: 'Open GitHub', kind: 'Link', run: open(site.links.github) },
  { label: 'Open LinkedIn', kind: 'Link', run: open(site.links.linkedin) },
  { label: 'Open LexoraAI', kind: 'Link', run: open(site.links.lexora) },
  { label: 'Open YouTube: DSA Daily', kind: 'Link', run: open(channels[0].url) },
  { label: 'Copy email address', kind: 'Action', run: () => copy(site.email, 'Email copied') },
  { label: 'Toggle light / dark theme', kind: 'Action', run: toggleTheme },
  { label: 'Open terminal', kind: 'Action', run: () => setTimeout(openTerm, 0), keys: 'shell console easter' },
  ...lanes.map(l => ({ label: `git checkout ${l.id}`, kind: 'Graph', run: () => { go('top')(); checkout(l.id); }, keys: l.blurb.toLowerCase() })),
];
const pal = $('#palette');
const palQ = $<HTMLInputElement>('#pal-q');
const palList = $('#pal-list');
let palItems: Cmd[] = [], palSel = 0;
function renderPal() {
  const q = palQ.value.trim().toLowerCase();
  palItems = cmds.filter(c => !q || q.split(/\s+/).every(w => (c.label + ' ' + c.kind + ' ' + (c.keys ?? '')).toLowerCase().includes(w)));
  palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
  palList.innerHTML = palItems.length
    ? palItems.map((c, i) => `<li role="option" id="pal-${i}" aria-selected="${i === palSel}" data-i="${i}"><span>${esc(c.label)}</span><span class="pk">${c.kind}</span></li>`).join('')
    : '<li class="empty" role="option" aria-disabled="true">Nothing matches. Try “projects” or “email”.</li>';
  palQ.setAttribute('aria-activedescendant', palItems.length ? `pal-${palSel}` : '');
  document.getElementById(`pal-${palSel}`)?.scrollIntoView({ block: 'nearest' });
}
function openPal() { palQ.value = ''; palSel = 0; renderPal(); openModal(pal, document.activeElement as HTMLElement, '#pal-q'); }
function runPal(i: number) { const c = palItems[i]; if (!c) return; closeModal(pal); c.run(); }
palQ.addEventListener('input', () => { palSel = 0; renderPal(); });
palQ.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); palSel = (palSel + 1) % Math.max(1, palItems.length); renderPal(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); palSel = (palSel - 1 + palItems.length) % Math.max(1, palItems.length); renderPal(); }
  if (e.key === 'Enter') { e.preventDefault(); runPal(palSel); }
});
palList.addEventListener('click', e => { const li = (e.target as Element).closest<HTMLElement>('[data-i]'); if (li) runPal(Number(li.dataset.i)); });
$$('[data-open-palette]').forEach(b => b.addEventListener('click', openPal));

/* ── terminal easter egg ─────────────────────────────────── */
const term = $('#term');
const tOut = $('#term-out');
const tIn = $<HTMLInputElement>('#term-in');
const hist: string[] = []; let hi = 0;
const line = (html: string) => { tOut.insertAdjacentHTML('beforeend', html + '\n'); tOut.scrollTop = tOut.scrollHeight; };
const a = (href: string, t: string) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(t)}</a>`;
const files: Record<string, string> = {
  'about.txt': 'Software engineer. Two years of enterprise engineering at Accenture.\nBuilt LexoraAI solo. Three papers. MSc CS at Edinburgh, 2026–27.',
  'stack.txt': 'Apex · LWC · SOQL · Java · Python · JavaScript · React · Node\nAWS · Azure · Azure DevOps · Cloudflare · Solidity · LLMs · agents',
  'contact.txt': site.email,
};
function run(cmdline: string) {
  const [cmd, ...args] = cmdline.trim().split(/\s+/);
  line(`<span class="t-cmd">$ ${esc(cmdline)}</span>`);
  switch (cmd) {
    case '': break;
    case 'help': line('commands: whoami  ls  cat &lt;file&gt;  git log  open &lt;github|linkedin|lexora|youtube&gt;  contact  theme  clear  exit'); break;
    case 'whoami': line('rajesh · software engineer · edinburgh'); break;
    case 'ls': line(Object.keys(files).join('  ') + '  <span class="t-hi">projects/</span>'); if (args[0]?.startsWith('proj')) line('lexora/  atlas/  ownvoicz/  archive/'); break;
    case 'cat': line(files[args[0]] ? esc(files[args[0]]) : `cat: ${esc(args[0] ?? '')}: no such file. Try <span class="t-hi">ls</span>.`); break;
    case 'git':
      if (args[0] === 'log') [...commits].sort((x, y) => y.t - x.t).slice(0, 12).forEach(c => line(`<span class="t-hi">${esc(c.when.padEnd(18))}</span>${esc(c.title)}`));
      else if (args[0] === 'status') line('On branch main\nYour branch is ahead of \'origin/btech\' by 2 years of production.\n\nChanges not staged for commit:\n\t<span class="t-hi">modified:   atlas/</span>');
      else if (args[0] === 'blame') line('Every line: Rajesh Kumar Kona.');
      else line('try: git log · git status · git blame');
      break;
    case 'open': {
      const m: Record<string, string> = { github: site.links.github, linkedin: site.links.linkedin, lexora: site.links.lexora, youtube: channels[0].url, ownvoicz: site.links.ownvoicz };
      const u = m[args[0]]; line(u ? `opening ${a(u, u)}` : 'open: try github, linkedin, lexora, ownvoicz or youtube'); if (u) window.open(u, '_blank', 'noopener');
      break;
    }
    case 'contact': line(`email: ${a('mailto:' + site.email, site.email)}\nlinkedin: ${a(site.links.linkedin, 'rajesh-kumar-kona')}`); break;
    case 'sudo':
      if (args.join(' ') === 'hire rajesh') line(`<span class="t-ok">[sudo] permission granted.</span>\nNext step: ${a('mailto:' + site.email, site.email)}`);
      else line('rajesh is not in the sudoers file. This incident will be reported.');
      break;
    case 'theme': toggleTheme(); line('theme toggled'); break;
    case 'clear': tOut.innerHTML = ''; break;
    case 'exit': closeModal(term); break;
    case 'rm': line('Nice try. Production data stays.'); break;
    default: line(`${esc(cmd)}: command not found. Type <span class="t-hi">help</span>.`);
  }
}
function openTerm() {
  if (!tOut.innerHTML) line('Welcome. Type <span class="t-hi">help</span> to see what you can do.');
  openModal(term, document.activeElement as HTMLElement, '#term-in');
}
tIn.addEventListener('keydown', e => {
  if (e.key === 'Enter') { const v = tIn.value; hist.push(v); hi = hist.length; tIn.value = ''; run(v); }
  if (e.key === 'ArrowUp') { e.preventDefault(); hi = Math.max(0, hi - 1); tIn.value = hist[hi] ?? ''; }
  if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); tIn.value = hist[hi] ?? ''; }
});

/* ── global keys ─────────────────────────────────────────── */
addEventListener('keydown', e => {
  const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable]');
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closeModal(pal); return; }
  if (typing) return;
  if (e.key === '`' || e.key === '~') { e.preventDefault(); openTerm(); }
  if (e.key === '/' && !e.metaKey) { e.preventDefault(); openPal(); }
});

console.log('%cHello, fellow engineer.', 'font: 700 14px monospace; color: #d9501c', `\nThis site is hand-built with TypeScript and Vite. Press \` for a shell.\n${site.email}`);
export type { Lane };
