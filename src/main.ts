import '@fontsource-variable/schibsted-grotesk/wght.css';
import '@fontsource/martian-mono/latin-400.css';
import '@fontsource/martian-mono/latin-500.css';
import '@fontsource/martian-mono/latin-700.css';
import './styles.css';
import { renderApp, renderCommitDetail, esc } from './render';
import { commits, pipeline, credentials, voicePillars, site, channels, lanes, projects } from './data';
import { $, $$, reduced, store, BASE, toast, copy, toggleTheme, openModal, closeModal, initModals, go, radios, actions } from './ui/core';
import { initTerminal, openTerminal } from './ui/terminal';
import { openExplorer, closeExplorer } from './ui/explorer';
import { initModes, openMode } from './ui/modes';
import { initVoicePassport } from './ui/voicepassport';

const app = document.getElementById('app')!;
if (!app.firstElementChild) app.innerHTML = renderApp(); // dev mode; production HTML is prerendered
document.documentElement.classList.add('js');

/* ── theme ───────────────────────────────────────────────── */
const savedTheme = store.get('theme');
if (savedTheme === 'light' || savedTheme === 'dark') document.documentElement.dataset.theme = savedTheme;
$$('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));

document.addEventListener('click', e => {
  const b = (e.target as Element).closest<HTMLElement>('[data-copy]');
  if (b) copy(b.dataset.copy!, b.dataset.copy!.includes('@') ? 'Email copied' : /^[A-Z0-9-]{6,}$/i.test(b.dataset.copy!) ? 'ID copied' : 'Citation copied');
});
initModals();

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
  actions['pipe'] = () => { if (timer) stop(); run(); };
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
  const flowGroup = radios($('.seg', flow), b => set(b.dataset.mode!));
  set('free');
  actions['flow-server'] = () => flowGroup.pick(1);
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
  const riskGroup = radios($('.seg', root), b => { risk = b.dataset.risk!; reset(); runBtn.textContent = 'Run task'; say(risk === 'high' ? 'High-risk task selected. It will stop for approval.' : 'Low-risk task selected.'); });
  actions['atlas-high'] = () => { riskGroup.pick(1); runBtn.click(); };
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
    const ids = on ? s.dataset.ev!.split(' ').filter(Boolean) : [];
    ev.forEach(e => e.classList.toggle('is-hit', ids.includes(e.dataset.evId!)));
    root.classList.toggle('has-sel', on);
    status.textContent = !on ? 'Select a skill.' : ids.length ? `${s.textContent} · used in ${ids.length} place${ids.length > 1 ? 's' : ''}` : `${s.textContent} · listed on my CV; project evidence not published yet`;
    draw();
  }));
  addEventListener('resize', draw);
  skillsEls[0]?.click();
  actions['trace'] = (name = 'Solidity') => { const b = skillsEls.find(x => x.textContent!.toLowerCase().includes(name.toLowerCase())); if (b && b !== cur) b.click(); setTimeout(draw, 500); };
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
  actions['vault-search'] = (q = '') => { search.value = q; apply(); };

  const modal = $('#cred-modal');
  const body = $('.cm-body', modal);
  const img = (name: string) => `${BASE}credentials/${name}.webp`;
  const showCred = (id: string, opener: HTMLElement | null) => {
    const c = credentials.find(x => x.id === id)!;
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
    openModal(modal, opener);
  };
  $$<HTMLButtonElement>('[data-cred]').forEach(b => b.addEventListener('click', () => showCred(b.dataset.cred!, b)));
  actions['cred'] = id => id && showCred(id, document.activeElement as HTMLElement);
}


/* ── research filter ─────────────────────────────────────── */
{
  const chipsT = $$<HTMLButtonElement>('[data-topic-filter]');
  chipsT.forEach(b => b.addEventListener('click', () => {
    chipsT.forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    $$('.paper').forEach(p => (p.hidden = b.dataset.topicFilter !== 'All' && p.dataset.topic !== b.dataset.topicFilter));
  }));
}

/* ── Voice Passport ──────────────────────────────────────── */
const vpApi = initVoicePassport();

/* ── Work with me ────────────────────────────────────────── */
const hire = $('#hire');
const openHire = (opener?: HTMLElement | null) => openModal(hire, opener ?? (document.activeElement as HTMLElement));
$$('[data-hire]').forEach(b => b.addEventListener('click', () => openHire(b)));

/* ── actions: one registry for terminal, explorer, world and the directory ── */
const after = (ms: number, fn: () => void) => setTimeout(fn, reduced ? 0 : ms);
Object.assign(actions, {
  goto: (id?: string) => id && go(id),
  mode: (m?: string) => openMode((m as 'web' | 'terminal' | 'explorer' | 'world') ?? 'web'),
  hire: () => openHire(),
  world: () => openMode('world'),
  terminal: () => openMode('terminal'),
  explorer: () => openMode('explorer'),
  palette: () => openPal(),
  'checkout-ai': () => { go('top'); checkout('ai'); },
  'checkout-enterprise': () => { go('top'); checkout('enterprise'); },
  head: () => { go('top'); checkout('all'); select(commits.findIndex(c => c.head)); },
  'vp-approve': () => { go('voicepassport'); after(500, () => vpApi.approveFirst()); },
  'vault-azure': () => { go('credentials'); actions['vault-search']('azure'); },
  paper: () => { go('research'); after(500, () => { const d = $<HTMLDetailsElement>('.paper-more'); d.open = true; }); },
  sem1: () => { go('now'); after(500, () => $$<HTMLButtonElement>('.credit[data-term="Semester 1"]')[0]?.click()); },
  theme: () => toggleTheme(),
  'copy-email': () => copy(site.email, 'Email copied'),
  secret: () => toast('It is somewhere in Rajesh World, off the map. The terminal knows a sudo command for it too.', 4200),
});
const wrapGo = (id: string, fn: () => void) => () => { go(id); after(450, fn); };
actions['pipe-go'] = wrapGo('work', () => actions['pipe']());
actions['atlas-go'] = wrapGo('atlas', () => actions['atlas-high']());
actions['flow-go'] = wrapGo('lexora', () => actions['flow-server']());
actions['trace-go'] = wrapGo('stack', () => actions['trace']('Solidity'));

$$<HTMLButtonElement>('[data-action]').forEach(b => b.addEventListener('click', () => {
  const map: Record<string, string> = { pipe: 'pipe-go', 'atlas-high': 'atlas-go', 'flow-server': 'flow-go', trace: 'trace-go' };
  const name = map[b.dataset.action!] ?? b.dataset.action!;
  actions[name]?.();
}));

/* ── command palette ─────────────────────────────────────── */
type Cmd = { label: string; kind: string; run: () => void; keys?: string };
const goCmd = (id: string) => () => go(id);
const ext = (url: string) => () => { window.open(url, '_blank', 'noopener'); };
const cmds: Cmd[] = [
  { label: 'Go home', kind: 'Section', run: goCmd('top'), keys: 'career graph evolution log timeline git' },
  { label: 'Experience at Accenture', kind: 'Section', run: goCmd('work'), keys: 'work salesforce enterprise bug production' },
  ...projects.slice(0, 4).map(p => ({ label: p.name, kind: 'Project', run: goCmd(p.anchor), keys: p.summary.toLowerCase() })),
  { label: 'Earlier projects', kind: 'Section', run: goCmd('archive'), keys: 'blockchain iot web3 aider archive smart home' },
  { label: 'Research papers', kind: 'Section', run: goCmd('research'), keys: 'publications ijcrt irjet' },
  { label: 'Education: MSc Edinburgh', kind: 'Section', run: goCmd('now'), keys: 'university modules courses btech' },
  { label: 'Skills (stack trace)', kind: 'Section', run: goCmd('stack'), keys: 'tech stack' },
  { label: 'Certificates', kind: 'Section', run: goCmd('credentials'), keys: 'credential vault certifications azure aws salesforce' },
  { label: 'Awards and community', kind: 'Section', run: goCmd('recognition'), keys: 'recognition leadership ideathon' },
  { label: 'YouTube', kind: 'Section', run: goCmd('explain'), keys: 'teaching videos channel' },
  { label: 'Everything you can do here', kind: 'Section', run: goCmd('interactions'), keys: 'interaction directory buttons' },
  { label: 'Contact', kind: 'Section', run: goCmd('contact'), keys: 'email' },
  { label: 'Enter Rajesh World', kind: 'Mode', run: () => openMode('world'), keys: 'game explore island play' },
  { label: 'Open terminal', kind: 'Mode', run: () => openMode('terminal'), keys: 'shell console command line' },
  { label: 'Open repository explorer', kind: 'Mode', run: () => openMode('explorer'), keys: 'github files tree repo' },
  { label: 'Work with me', kind: 'Action', run: () => openHire(), keys: 'hire contact cv' },
  { label: 'Open GitHub', kind: 'Link', run: ext(site.links.github) },
  { label: 'Open LinkedIn', kind: 'Link', run: ext(site.links.linkedin) },
  { label: 'Open LexoraAI', kind: 'Link', run: ext(site.links.lexora) },
  { label: 'Open YouTube: DSA Daily', kind: 'Link', run: ext(channels[0].url) },
  { label: 'Copy email address', kind: 'Action', run: () => copy(site.email, 'Email copied') },
  { label: 'Toggle light / dark theme', kind: 'Action', run: toggleTheme },
  ...lanes.map(l => ({ label: `git checkout ${l.id}`, kind: 'Graph', run: () => { go('top'); checkout(l.id); }, keys: l.blurb.toLowerCase() })),
];
const pal = $('#palette');
const palQ = $<HTMLInputElement>('#pal-q');
const palList = $('#pal-list');
let palItems: Cmd[] = [], palSel = 0;
function renderPal() {
  const q = palQ.value.trim().toLowerCase();
  const score = (c: Cmd) => { const l = c.label.toLowerCase(); return l.startsWith(q) ? 0 : l.includes(q) ? 1 : 2; };
  palItems = cmds.filter(c => !q || q.split(/\s+/).every(w => (c.label + ' ' + c.kind + ' ' + (c.keys ?? '')).toLowerCase().includes(w)))
    .map((c, i) => ({ c, i })).sort((a, b) => (q ? score(a.c) - score(b.c) : 0) || a.i - b.i).map(x => x.c);
  palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
  palList.innerHTML = palItems.length
    ? palItems.map((c, i) => `<li role="option" id="pal-${i}" aria-selected="${i === palSel}" data-i="${i}"><span>${esc(c.label)}</span><span class="pk">${c.kind}</span></li>`).join('')
    : '<li class="empty" role="option" aria-disabled="true">Nothing matches. Try “projects” or “world”.</li>';
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

/* ── modes ───────────────────────────────────────────────── */
initTerminal();
initModes();
void openTerminal; void openExplorer;

/* ── global keys ─────────────────────────────────────────── */
addEventListener('keydown', e => {
  const typing = (e.target as HTMLElement).closest('input, textarea, [contenteditable]');
  const worldOpen = !$('#world-root').hidden;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closeModal(pal); return; }
  if (e.key === 'Escape' && !$('#explorer').hidden && $$('.modal').every(m => m.hidden)) { closeExplorer(); return; }
  if (typing || worldOpen) return;
  if (e.key === '`' || e.key === '~') { e.preventDefault(); openMode('terminal'); }
  if (e.key === '/' && !e.metaKey) { e.preventDefault(); openPal(); }
});

console.log('%cHello, fellow engineer.', 'font: 700 14px monospace; color: #c2410c', `\nThis site is hand-built with TypeScript and Vite.\nPress \` for a shell, or visit #world.\n${site.email}`);
