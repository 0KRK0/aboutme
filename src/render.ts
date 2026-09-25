import {
  site, lanes, commits, numbers, pipeline, workBullets, atlasStages, atlasRails, voicePillars,
  archive, papers, msc, credentials, evidence, skills, awards, community, channels,
  voicePassport, voiceThemes, projectById, vtv,
  type Commit, type Lane,
} from './data';

/* ── helpers ─────────────────────────────────────────────── */
export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Short, stable pseudo-hash so every milestone reads like a commit. */
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

const ext = (href: string, label: string, cls = 'link') =>
  `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${label}<span class="arrow" aria-hidden="true">↗</span></a>`;

const eyebrow = (lane: Lane, text: string) =>
  `<p class="eyebrow" data-lane="${lane}"><span class="dot" aria-hidden="true"></span>${esc(text)}</p>`;

const base = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/* ── graph geometry ──────────────────────────────────────── */
const G = { W: 1200, padL: 118, padR: 36, top: 40, gap: 56, t0: 2019, t1: 2027.7 };
const laneOrder: Lane[] = ['ai', 'research', 'main', 'systems', 'enterprise'];
const ly = (l: Lane) => G.top + laneOrder.indexOf(l) * G.gap;
const gx = (t: number) => G.padL + ((t - G.t0) / (G.t1 - G.t0)) * (G.W - G.padL - G.padR);
const H = G.top + (laneOrder.length - 1) * G.gap + 58;
const HEAD = commits.find(c => c.head)!;
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const m = (x1 + x2) / 2;
  return `M${x1.toFixed(1)} ${y1}C${m.toFixed(1)} ${y1} ${m.toFixed(1)} ${y2} ${x2.toFixed(1)} ${y2}`;
};

const labels: Record<string, string> = {
  btech: 'BTech, VVIT', graduate: 'Rank 2 / 66', accenture: 'Accenture', lexora: 'LexoraAI',
  edinburgh: 'HEAD → Edinburgh', atlas: 'Atlas', microsoft: '3 × Microsoft', 'paper-fund': 'IJCRT',
  'paper-blockchain': 'IRJET', promotion: 'Promoted', dissertation: 'Dissertation', 'ai-for-everyone': 'first AI course',
};

function laneSpan(l: Lane) {
  const cs = commits.filter(c => c.lane === l && !c.wip && !c.future);
  return { start: Math.min(...cs.map(c => c.t)), end: Math.max(...cs.map(c => c.t)) };
}

export function renderGraph() {
  const my = ly('main');
  const hx = gx(HEAD.t);
  const paths: string[] = [];
  // main trunk
  const mainStart = gx(Math.min(...commits.filter(c => c.lane === 'main').map(c => c.t)));
  paths.push(`<path class="edge" data-lane="main" d="M${mainStart} ${my}H${hx}"/>`);
  const diss = commits.find(c => c.future)!;
  paths.push(`<path class="edge future" data-lane="main" d="M${hx} ${my}H${gx(diss.t)}"/>`);
  for (const l of laneOrder) {
    if (l === 'main') continue;
    const { start } = laneSpan(l);
    const y = ly(l);
    const bx = gx(start - 0.36), sx = gx(start - 0.02);
    const mx = gx(HEAD.t - 0.2);
    paths.push(`<path class="edge" data-lane="${l}" d="${curve(bx, my, sx, y)}H${mx.toFixed(1)}${curve(mx, y, hx, my).replace(/^M[^C]+/, '')}"/>`);
  }
  // work after HEAD: Atlas
  const atlas = commits.find(c => c.wip);
  if (atlas) {
    const y = ly(atlas.lane);
    paths.push(`<path class="edge future" data-lane="${atlas.lane}" d="${curve(hx, my, gx(HEAD.t + 0.22), y)}H${gx(atlas.t)}"/>`);
  }

  const ticks: string[] = [];
  for (let yr = 2019; yr <= 2027; yr++) {
    const x = gx(yr);
    ticks.push(`<line class="grid" x1="${x}" x2="${x}" y1="${G.top - 22}" y2="${H - 30}"/><text class="tick" x="${x}" y="${H - 10}" text-anchor="middle">${yr}</text>`);
  }
  const laneLabels = laneOrder.map(l =>
    `<text class="lane-label" data-lane="${l}" x="12" y="${ly(l) + 4}">${l}</text>`).join('');

  const nodes = commits.map((c, i) => {
    const x = gx(c.t), y = ly(c.lane);
    const r = c.head ? 10 : 6.5;
    const lab = labels[c.id];
    const below = (laneOrder.indexOf(c.lane) > laneOrder.indexOf('main') || c.id === 'graduate' || c.head) && c.id !== 'dissertation';
    const cls = ['node', c.head ? 'head' : '', c.wip ? 'wip' : '', c.future ? 'future' : ''].join(' ').trim();
    return `<g class="${cls}" data-id="${c.id}" data-lane="${c.lane}" data-i="${i}" tabindex="-1" role="button" aria-label="${esc(c.when + ': ' + c.title)}" transform="translate(${x.toFixed(1)} ${y})">
      <circle class="hit" r="16"/>${c.head ? '<circle class="halo" r="17"/>' : ''}<circle class="dot" r="${r}"/>
      ${lab ? `<text class="node-label${c.head ? ' strong' : ''}" x="${c.head ? 12 : 0}" y="${c.head ? 30 : below ? 24 : -15}" text-anchor="${c.head ? 'start' : 'middle'}">${esc(lab)}</text>` : ''}
    </g>`;
  }).join('');

  return `<svg class="graph" viewBox="0 0 ${G.W} ${H}" role="group" aria-label="Career graph from 2019 to 2027. Use the arrow keys to move between milestones.">
    <g class="ticks" aria-hidden="true">${ticks.join('')}</g>
    <line class="cursor" x1="0" x2="0" y1="${G.top - 22}" y2="${H - 30}" aria-hidden="true"/>
    <text class="cursor-label" x="0" y="${G.top - 28}" text-anchor="middle" aria-hidden="true"></text>
    <g class="lanes" aria-hidden="true">${laneLabels}</g>
    <g class="edges" aria-hidden="true">${paths.join('')}</g>
    <g class="nodes">${nodes}</g>
  </svg>`;
}

export function renderCommitDetail(c: Commit) {
  const refs = c.head ? '<span class="ref ref-head">HEAD → main</span><span class="ref">origin/edinburgh</span>'
    : c.wip ? '<span class="ref ref-wip">working tree</span>' : c.future ? '<span class="ref ref-wip">planned</span>' : `<span class="ref" data-lane="${c.lane}">${c.lane}</span>`;
  return `<p class="c-meta"><span class="c-hash">commit ${hash(c.id + c.title)}</span>${refs}<span class="c-date">${esc(c.when)}</span></p>
    <h3 class="c-title">${esc(c.title)}</h3>
    <p class="c-body">${esc(c.body)}</p>
    ${c.diff.length ? `<ul class="c-diff" aria-label="What this added">${c.diff.map(d => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
    ${c.more ? `<a class="c-more" href="#${c.more}">Read more <span aria-hidden="true">↓</span></a>` : ''}`;
}

function renderLog() {
  const active = (l: Lane, t: number) => {
    if (l === 'main') return true;
    const s = laneSpan(l);
    return t >= s.start - 0.36 && t <= HEAD.t;
  };
  const sorted = [...commits].sort((a, b) => b.t - a.t);
  return `<ol class="log is-collapsed" aria-label="Career log, newest first">${sorted.map(c => `
    <li class="log-row${c.head ? ' is-head' : ''}${c.wip || c.future ? ' is-soft' : ''}" data-lane="${c.lane}">
      <span class="gutter" aria-hidden="true">${laneOrder.map(l => `<span class="g" data-lane="${l}"${active(l, c.t) || l === c.lane ? ' data-on' : ''}>${l === c.lane ? '<i></i>' : ''}</span>`).join('')}</span>
      <details>
        <summary><span class="log-hash">${hash(c.id + c.title)}</span><span class="log-when">${esc(c.when)}</span><span class="log-title">${esc(c.title)}</span></summary>
        <div class="log-body">${renderCommitDetail(c)}</div>
      </details>
    </li>`).join('')}</ol>
    <button type="button" class="btn btn-line log-more" data-log-more hidden>Show all ${sorted.length} commits</button>`;
}

/* ── sections ────────────────────────────────────────────── */
function nav() {
  const items = [['work', 'Work'], ['lexora', 'Products'], ['research', 'Research'], ['now', 'MSc'], ['credentials', 'Credentials']];
  return `<a class="skip" href="#main">Skip to content</a>
  <header class="topbar">
    <a class="mark" href="#top" aria-label="Rajesh Kumar Kona, home"><span class="mark-glyph" aria-hidden="true">rkk</span><span class="mark-path">~/rajesh</span></a>
    <nav aria-label="Sections"><ul class="nav-links">${items.map(([h, l]) => `<li><a href="#${h}">${l}</a></li>`).join('')}</ul></nav>
    <nav class="modes" aria-label="Ways to explore">
      <a href="#top" data-mode-link="web" aria-current="true">Web</a>
      <a href="#terminal" data-mode-link="terminal">Terminal</a>
      <a href="#explorer" data-mode-link="explorer">Explorer</a>
      <a href="#world" data-mode-link="world">World</a>
    </nav>
    <div class="top-actions">
      <button class="btn btn-solid sm hire-btn" type="button" data-hire>Work with me</button>
      <button class="btn-ghost kbd-btn" type="button" data-open-palette aria-label="Open command palette"><kbd>⌘</kbd><kbd>K</kbd></button>
      <button class="btn-ghost theme-btn" type="button" data-theme-toggle aria-label="Switch colour theme"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 3a7 7 0 0 1 0 14z"/></svg></button>
    </div>
  </header>
  <button class="jumpbar" type="button" data-open-palette><span>Jump to…</span></button>`;
}

function hero() {
  return `<section class="hero" id="top" aria-labelledby="hero-name">
    <div class="wrap hero-head">
      <p class="prompt hero-prompt"><span class="p-user">rajesh@edinburgh</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-sign">$</span> git log --graph --all</p>
      <h1 id="hero-name" class="hero-name">Rajesh Kumar Kona</h1>
      <p class="hero-lede">Software engineer. Two years building enterprise systems at Accenture, an AI product that has served 6.7 million requests, and three published papers. Now studying MSc Computer Science at the University of Edinburgh, and still building.</p>
      <div class="hero-cta">
        <a class="btn btn-solid" href="#work">Explore the work <span aria-hidden="true">↓</span></a>
        ${ext(site.links.github, 'GitHub', 'btn btn-line')}
      </div>
    </div>
    <div class="wrap graph-wrap">
      <div class="graph-bar">
        <div class="lane-filter" role="group" aria-label="Highlight a branch">
          <span class="lf-cmd" aria-hidden="true">git checkout</span>
          <button type="button" class="chip is-on" data-lane-filter="all" aria-pressed="true">--all</button>
          ${lanes.map(l => `<button type="button" class="chip" data-lane-filter="${l.id}" data-lane="${l.id}" aria-pressed="false" title="${esc(l.blurb)}"><span class="dot" aria-hidden="true"></span>${l.label}</button>`).join('')}
        </div>
        <p class="graph-hint">Select any commit. Arrow keys work too.</p>
      </div>
      <div class="graph-scroll">${renderGraph()}</div>
      <article class="commit-panel" aria-live="polite" id="commit-panel">${renderCommitDetail(HEAD)}</article>
      ${renderLog()}
    </div>
  </section>`;
}

function shortlog() {
  return `<section class="shortlog wrap" aria-label="By the numbers">
    <p class="prompt small"><span class="p-sign">$</span> git shortlog --summary --numbered</p>
    <dl class="sl-grid">${numbers.map(n => `
      <div class="sl-item"><dt class="sl-label">${esc(n.label)}<span class="sl-note">${esc(n.note)}</span></dt>
      <dd class="sl-value" data-count="${n.value}" data-decimals="${n.decimals ?? 0}" data-suffix="${esc(n.suffix)}">${n.value}${esc(n.suffix)}</dd></div>`).join('')}
      <div class="sl-item"><dt class="sl-label">undergraduate cohort rank<span class="sl-note">BTech CSE, VVIT · GPA 8.65/10</span></dt><dd class="sl-value">2<span class="sl-of">/66</span></dd></div>
    </dl>
  </section>`;
}

function work() {
  return `<section class="section" id="work" aria-labelledby="work-h">
    <div class="wrap">
      ${eyebrow('enterprise', 'enterprise · Aug 2024 – Sep 2026')}
      <div class="split">
        <div>
          <h2 id="work-h" class="h2">Production work, under SLA</h2>
          <p class="role"><strong>Software Engineer (Salesforce Developer)</strong><span>Accenture · Bengaluru, India</span></p>
          <ul class="bullets">${workBullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
        <dl class="impact">
          <div><dt>production contributions</dt><dd>170+</dd></div>
          <div><dt>critical defects resolved within SLA</dt><dd>20+</dd></div>
          <div><dt>months to promotion, ahead of cycle</dt><dd>~21</dd></div>
        </dl>
      </div>

      <div class="case" aria-labelledby="case-h">
        <div class="case-head">
          <h3 id="case-h" class="h3">The bug that never reached production</h3>
          <p class="case-note">Client and project details stay confidential. This shows the shape of what happened.</p>
        </div>
        <ol class="pipe" data-pipe>${pipeline.map((p, i) => `
          <li class="pipe-stage${p.alert ? ' is-alert' : ''}${p.ok ? ' is-ok' : ''}" data-step="${i}">
            <button type="button" class="pipe-btn" aria-label="Stage ${i + 1}: ${esc(p.stage)}"><span class="pipe-n">${String(i + 1).padStart(2, '0')}</span><span class="pipe-name">${esc(p.stage)}</span></button>
          </li>`).join('')}
        </ol>
        <div class="pipe-foot">
          <p class="pipe-text" aria-live="polite" data-pipe-text>${esc(pipeline[pipeline.length - 1].text)}</p>
          <div class="pipe-ctrl">
            <button type="button" class="btn btn-line sm" data-pipe-prev aria-label="Previous stage">←</button>
            <button type="button" class="btn btn-solid sm" data-pipe-play>Replay</button>
            <button type="button" class="btn btn-line sm" data-pipe-next aria-label="Next stage">→</button>
          </div>
        </div>
      </div>

      <p class="aside-row"><span class="aside-k">Before Accenture</span> Full-stack engineer intern at Tech Stalwart Solution (Jun–Jul 2023). Improved page-load speed by roughly 15% with React.js and co-deployed the company website on AWS.</p>
    </div>
  </section>`;
}

function lexora() {
  const W = 190, Hh = 52;
  const nodes = [
    { id: 'device', x: 105, y: 130, t: 'Your device', s: 'browser tab' },
    { id: 'llm', x: 345, y: 42, t: 'AI companion', s: 'explains selected text' },
    { id: 'local', x: 345, y: 130, t: 'In-browser tools', s: 'merge · split · OCR' },
    { id: 'consent', x: 345, y: 218, t: 'Asks first', s: 'explicit consent' },
    { id: 'server', x: 575, y: 218, t: 'Server feature', s: 'deleted afterwards' },
    { id: 'result', x: 800, y: 130, t: 'Result', s: 'back on your device' },
  ];
  const edges = [
    ['device', 'local', 'free'], ['local', 'result', 'free'],
    ['device', 'consent', 'server'], ['consent', 'server', 'server'], ['server', 'result', 'server'],
    ['device', 'llm', 'ai'], ['llm', 'result', 'ai'],
  ];
  const pos = Object.fromEntries(nodes.map(n => [n.id, n]));
  return `<section class="section product" id="lexora" aria-labelledby="lex-h">
    <div class="wrap">
      ${eyebrow('ai', 'ai · shipped · 2025 – present')}
      <div class="product-head">
        <div>
          <h2 id="lex-h" class="h2 product-name">LexoraAI</h2>
          <p class="tagline">“Your AI companion for every document.”</p>
        </div>
        <div class="product-links">${ext(site.links.lexora, 'lexoraai.online', 'btn btn-solid')}<span class="status status-soon">Open-source release in preparation</span></div>
      </div>
      <div class="split">
        <div class="prose">
          <p>A privacy-first document workspace. It reads PDFs aloud with karaoke-style highlighting and takes voice commands like “go to page three”. You can select text and ask the AI companion to explain it in plain language. There are 40+ tools, including merge, split, compress, convert, OCR, sign, redact and translate.</p>
          <p>I built all of it myself: front end, back end, LLM integration, hosting and analytics, with Cloudflare in front. Free tools never upload your files, and server features ask first and delete everything afterwards.</p>
        </div>
        <dl class="metrics">
          <div><dt>pageviews</dt><dd>100K+</dd></div>
          <div><dt>requests served</dt><dd>6.7M+</dd></div>
          <div><dt>document tools</dt><dd>40+</dd></div>
          <div><dt>engineer</dt><dd>1</dd></div>
        </dl>
      </div>
      <p class="fine">Traffic figures verified in Cloudflare analytics.</p>

      <div class="flow" data-flow>
        <div class="flow-head">
          <h3 class="h3">Where does your file go?</h3>
          <div class="seg" role="radiogroup" aria-label="Choose a feature">
            <button type="button" role="radio" aria-checked="true" data-mode="free">Free tool</button>
            <button type="button" role="radio" aria-checked="false" data-mode="server">Server feature</button>
            <button type="button" role="radio" aria-checked="false" data-mode="ai">AI companion</button>
          </div>
        </div>
        <div class="flow-scroll">
          <svg class="flow-svg" viewBox="0 0 900 262" role="img" aria-labelledby="flow-cap">
            <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="arr-head"/></marker></defs>
            ${edges.map(([a, b, m]) => {
              const A = pos[a], B = pos[b];
              const x1 = A.x + W / 2 + 4, y1 = A.y, x2 = B.x - W / 2 - 8, y2 = B.y;
              return `<path class="f-edge" data-m="${m}" d="${curve(x1, y1, x2, y2)}" marker-end="url(#arr)"/>`;
            }).join('')}
            ${nodes.map(n => `<g class="f-node" data-node="${n.id}" transform="translate(${n.x - W / 2} ${n.y - Hh / 2})"><rect width="${W}" height="${Hh}" rx="6"/><text x="14" y="22" class="f-t">${esc(n.t)}</text><text x="14" y="39" class="f-s">${esc(n.s)}</text></g>`).join('')}
          </svg>
        </div>
        <ol class="flow-steps" data-flow-steps aria-hidden="true"></ol>
        <p class="flow-cap" id="flow-cap" data-flow-cap aria-live="polite">Free tools run entirely in your browser. The file never leaves your device.</p>
      </div>
    </div>
  </section>`;
}

function atlas() {
  return `<section class="section product" id="atlas" aria-labelledby="atlas-h">
    <div class="wrap">
      ${eyebrow('ai', 'ai · working tree · uncommitted')}
      <div class="product-head">
        <div>
          <h2 id="atlas-h" class="h2 product-name">Atlas</h2>
          <p class="tagline">An evolving enterprise AI automation architecture.</p>
        </div>
        <div class="product-links"><span class="status status-wip">Design and build in progress · not released</span></div>
      </div>
      <p class="prose narrow">Atlas grows out of the LexoraAI work and aims at enterprise use. Agents do real work through tools, but every action is checked, risky ones wait for a person, and everything leaves an audit trail. Follow one task through the design.</p>
      <div class="atlas" data-atlas>
        <div class="atlas-ctrl">
          <div class="seg" role="radiogroup" aria-label="Choose a task">
            <button type="button" role="radio" aria-checked="true" data-risk="low">Low-risk task</button>
            <button type="button" role="radio" aria-checked="false" data-risk="high">High-risk task</button>
          </div>
          <button type="button" class="btn btn-solid sm" data-atlas-run>Run task</button>
          <button type="button" class="btn btn-line sm" data-atlas-approve hidden>Approve</button>
        </div>
        <ol class="atlas-track">${atlasStages.map((s, i) => `
          <li class="a-stage" data-stage="${s.id}" data-group="${s.group}">
            <span class="a-n">${String(i + 1).padStart(2, '0')}</span>
            <span class="a-name">${esc(s.name)}</span>
            <span class="a-detail">${esc(s.detail)}</span>
          </li>`).join('')}
        </ol>
        <div class="atlas-rails" aria-label="Cross-cutting concerns">${atlasRails.map(r => `<span>${esc(r)}</span>`).join('')}</div>
        <p class="atlas-log" data-atlas-log aria-live="polite"><span class="p-sign">$</span> Choose a task and press Run task.</p>
      </div>
    </div>
  </section>`;
}

function ownvoicz() {
  const n = voicePillars.length;
  const R = 150, cx = 200, cy = 200;
  const pts = voicePillars.map((p, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { ...p, x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });
  return `<section class="section product" id="ownvoicz" aria-labelledby="ov-h">
    <div class="wrap">
      ${eyebrow('ai', 'ai · in development · 2025 – present')}
      <div class="product-head">
        <div>
          <h2 id="ov-h" class="h2 product-name">ownVoicz</h2>
          <p class="tagline">Own your voice. Use it anywhere.</p>
        </div>
        <div class="product-links">${ext(site.links.ownvoicz, 'ownvoicz.com', 'btn btn-line')}<span class="status status-wip">In development · intended for open-source release</span></div>
      </div>
      <div class="voice" data-voice>
        <div class="voice-orbit">
          <svg viewBox="0 0 400 400" aria-hidden="true" class="orbit-svg">
            <circle cx="${cx}" cy="${cy}" r="${R}" class="orbit-ring"/>
            ${pts.map(p => `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" class="spoke" data-spoke="${p.id}"/>`).join('')}
            <circle cx="${cx}" cy="${cy}" r="58" class="core"/>
            <g class="wave">${Array.from({ length: 9 }, (_, i) => { const h = [10, 22, 34, 18, 40, 18, 34, 22, 10][i]; return `<rect x="${cx - 36 + i * 8}" y="${cy - h / 2}" width="4" height="${h}" rx="2"/>`; }).join('')}</g>
          </svg>
          <span class="core-label">Voice ID</span>
          ${pts.map(p => `<button type="button" class="pillar" data-pillar="${p.id}" style="left:${(p.x / 4).toFixed(2)}%;top:${(p.y / 4).toFixed(2)}%" aria-pressed="false">${esc(p.name)}</button>`).join('')}
        </div>
        <div class="voice-text">
          <p class="prose">Voice ID sits at the centre: a voice that belongs to its owner and can be used, with permission, anywhere. Five planned pillars build on it.</p>
          <div class="voice-detail" data-voice-detail aria-live="polite">
            <p class="vd-k">Voice ID <span class="status status-wip sm">core idea</span></p>
            <p class="vd-t">The identity primitive. Everything else asks it for permission.</p>
          </div>
          <p class="fine">Pillars are the roadmap. None is presented here as released.</p>
        </div>
      </div>
    </div>
  </section>`;
}

function archiveSection() {
  const path: [string, Lane][] = [['IoT', 'systems'], ['Security', 'systems'], ['Blockchain', 'research'], ['Enterprise', 'enterprise'], ['AI', 'ai'], ['Voice', 'ai'], ['AI systems', 'ai']];
  return `<section class="section" id="archive" aria-labelledby="arc-h">
    <div class="wrap">
      ${eyebrow('systems', 'systems · archive · BTech 2020 – 2024')}
      <h2 id="arc-h" class="h2">Before the AI work</h2>
      <p class="evo" aria-label="How my interests evolved">${path.map(([t, l], i) => `<span data-lane="${l}">${t}</span>${i < path.length - 1 ? '<i aria-hidden="true">→</i>' : ''}`).join('')}</p>
      <div class="arc-grid">${archive.map(a => `
        <article class="arc">
          <p class="arc-era">${esc(a.era)}</p>
          <h3 class="arc-name">${esc(a.name)}</h3>
          <p class="arc-what">${esc(a.what)}</p>
          <p class="tags">${a.tags.map(t => `<span>${esc(t)}</span>`).join('')}</p>
          ${a.note ? `<p class="arc-note">${esc(a.note)}</p>` : ''}
        </article>`).join('')}
      </div>
    </div>
  </section>`;
}

function research() {
  return `<section class="section" id="research" aria-labelledby="res-h">
    <div class="wrap">
      ${eyebrow('research', 'research · 3 peer-reviewed publications · 1 preprint')}
      <h2 id="res-h" class="h2">Published work</h2>
      <div class="filters paper-filters" role="group" aria-label="Filter papers by topic">${['All', 'Blockchain', 'Machine learning', 'Systems'].map((t, i) => `<button type="button" class="chip${i === 0 ? ' is-on' : ''}" data-topic-filter="${t}" aria-pressed="${i === 0}">${t}</button>`).join('')}</div>
      <div class="papers">${papers.map(p => {
        const cite = p.kind !== 'Peer-reviewed' ? `${p.authors.join(', ')} (${p.year}). ${p.title}. Preprint.` : `${p.authors.join(', ')} (${p.year}). ${p.title}. ${p.venueLong} (${p.venue}).`;
        const topic = /blockchain/i.test(p.domain + p.title) ? 'Blockchain' : /systems/i.test(p.domain) ? 'Systems' : 'Machine learning';
        return `<article class="paper${p.kind !== 'Peer-reviewed' ? ' paper-report' : ''}" data-topic="${topic}">
          <p class="paper-venue"><span>${esc(p.venue)}</span><span>${p.year}</span></p>
          <p class="paper-kind">${p.kind !== 'Peer-reviewed' ? `${p.kind} · not yet peer-reviewed` : 'Peer-reviewed'}</p>
          <h3 class="paper-title">${esc(p.title)}</h3>
          <p class="paper-authors">${p.authors.map(a => a === 'R. K. Kona' ? `<strong>${a}</strong>` : a).join(', ')}</p>
          <p class="paper-domain">${esc(p.domain)}</p>
          <details class="paper-more"><summary>Summary and key ideas</summary>
            <p>${esc(p.summary)}</p>
            <ul>${p.ideas.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          </details>
          <div class="paper-actions">
            <button type="button" class="btn btn-line sm" data-copy="${esc(cite)}">Copy citation</button>
            ${p.url ? `<a class="btn btn-line sm" href="${base(p.url)}" target="_blank" rel="noopener">Read paper (PDF)</a>` : '<span class="fine">PDF link not added yet</span>'}${p.page ? `<a class="btn btn-line sm" href="${base(p.page)}">Paper page</a>` : ''}
          </div>
        </article>`;
      }).join('')}
      </div>
    </div>
  </section>`;
}

function now() {
  const terms = ['Full year', 'Semester 1', 'Semester 2', 'Summer'];
  return `<section class="section" id="now" aria-labelledby="now-h">
    <div class="wrap">
      ${eyebrow('main', 'main · HEAD · ' + msc.years)}
      <h2 id="now-h" class="h2">Now: ${esc(msc.programme)}, ${esc(msc.university)}</h2>
      <p class="prose narrow">I came to Edinburgh with two years of production engineering behind me. These are the eight courses I'm taking this year: what each one teaches, what it expects me to be able to do at the end, and what I'm building in it. Course details come from the University's public course catalogue (<a href="${msc.source}" target="_blank" rel="noopener">DRPS</a>).</p>
      <div class="credits" data-credits>
        <p class="credits-scale"><span>0</span><span>${msc.totalCredits} credits · all SCQF level 11</span></p>
        <div class="credit-bar" role="list">${msc.modules.map(m => `
          <button type="button" role="listitem" class="credit" data-term="${esc(m.term)}" data-code="${m.code}" style="flex-grow:${m.credits}" aria-label="${esc(m.name)}, ${m.credits} credits, ${esc(m.term)}">
            <span class="cr-code">${m.code}</span><span class="cr-n">${m.credits}</span>
          </button>`).join('')}
        </div>
        <div class="credit-legend">${terms.map(t => `<span data-term="${t}"><i></i>${t}${t === 'Semester 1' ? ' · this term' : ''}</span>`).join('')}</div>
      </div>
      <ul class="modules">${msc.modules.map(m => `
        <li class="module" id="mod-${m.code.toLowerCase()}" data-code="${m.code}" data-term="${esc(m.term)}">
          <span class="mod-code">${m.code}</span>
          <span class="mod-name">${esc(m.name)}</span>
          <span class="mod-term">${m.drps} · ${esc(m.term)} · ${m.credits} credits · ${esc(m.assessment)}</span>
          <p class="mod-sum">${esc(m.summary)}</p>
          ${m.mine ? `<p class="mod-mine"><b>What I'm building</b> ${esc(m.mine)}</p>` : ''}
          <details class="mod-more">
            <summary>Learning outcomes</summary>
            <ul>${m.outcomes.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
            <p class="mod-links">${m.builds.length ? 'Builds on ' + m.builds.map(esc).join(', ') + ' · ' : ''}<a href="${m.url}" target="_blank" rel="noopener">Course page on DRPS ↗</a></p>
          </details>
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function stack() {
  const kinds = ['Work', 'Product', 'Project', 'Research', 'Credential', 'MSc', 'Teaching'] as const;
  return `<section class="section" id="stack" aria-labelledby="st-h">
    <div class="wrap">
      ${eyebrow('main', 'stack trace')}
      <h2 id="st-h" class="h2">Every skill, traced to where I used it</h2>
      <p class="prose narrow">Pick a skill to see the work, papers and credentials behind it.</p>
      <div class="trace" data-trace>
        <div class="trace-skills">${skills.map(g => `
          <div class="tg"><p class="tg-name">${esc(g.group)}</p>
          <div class="tg-items">${g.items.map(s => `<button type="button" class="skill" data-ev="${s.ev.join(' ')}" aria-pressed="false">${esc(s.name)}</button>`).join('')}</div></div>`).join('')}
        </div>
        <svg class="trace-wires" aria-hidden="true"></svg>
        <div class="trace-ev">
          <p class="trace-status" data-trace-status aria-live="polite">Select a skill.</p>
          ${kinds.map(k => {
            const list = evidence.filter(e => e.kind === k);
            return list.length ? `<div class="ev-group"><p class="tg-name">${k}</p>${list.map(e => `<span class="ev" data-ev-id="${e.id}" data-lane="${e.lane}"><i aria-hidden="true"></i>${esc(e.label)}</span>`).join('')}</div>` : '';
          }).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function vault() {
  const cats = ['All', 'AI', 'Cloud', 'Salesforce', 'Programming', 'Web', 'Other'];
  const sorted = [...credentials].sort((a, b) => Number(!!a.pending) - Number(!!b.pending) || b.sort - a.sort);
  return `<section class="section" id="credentials" aria-labelledby="cr-h">
    <div class="wrap">
      ${eyebrow('systems', 'credential vault · ' + credentials.length + ' entries')}
      <h2 id="cr-h" class="h2">Credential vault</h2>
      <div class="vault-bar">
        <label class="search"><span class="sr">Search credentials</span><span class="p-sign" aria-hidden="true">/</span><input id="vault-search" type="search" placeholder="Search by name, issuer or ID" autocomplete="off"></label>
        <div class="filters" role="group" aria-label="Filter by category">${cats.map(c => `<button type="button" class="chip${c === 'All' ? ' is-on' : ''}" data-cat="${c}" aria-pressed="${c === 'All'}">${c}</button>`).join('')}</div>
      </div>
      <p class="vault-count" data-vault-count aria-live="polite">${credentials.length} credentials</p>
      <ul class="vault">${sorted.map(c => `
        <li class="cred" data-cat="${c.cat}" data-search="${esc((c.title + ' ' + c.issuer + ' ' + (c.credentialId ?? '') + ' ' + (c.certNumber ?? '') + ' ' + c.kind + ' ' + c.cat + ' ' + (c.details ?? '')).toLowerCase())}">
          <button type="button" class="cred-btn" data-cred="${c.id}">
            <span class="cred-thumb${c.pending ? ' is-pending' : !c.image && c.verify ? ' is-profile' : ''}">${c.image ? `<img src="${base(`credentials/${c.image}.thumb.webp`)}" alt="" loading="lazy" decoding="async" width="520" height="400">` : c.verify ? `<span><b>${esc(c.kind === 'Badge' ? c.title.replace(/ \(\d+\)$/, '') : c.title.replace('Salesforce Certified ', ''))}</b><small>On my public Trailblazer profile</small></span>` : '<span>Proof not uploaded yet</span>'}</span>
            <span class="cred-kind">${c.kind} · ${c.cat}</span>
            <span class="cred-title">${esc(c.title)}</span>
            <span class="cred-meta">${esc(c.issuer)} · ${esc(c.date)}</span>
          </button>
        </li>`).join('')}
      </ul>
      <p class="fine">IDs and links come straight from the certificates. Salesforce certifications and superbadges link to my public Trailblazer profile, where Salesforce shows them. The Agentic AI badge is listed on my CV; its proof isn't uploaded yet.</p>
    </div>
  </section>`;
}

function recognition() {
  return `<section class="section" id="recognition" aria-labelledby="rec-h">
    <div class="wrap split">
      <div>
        ${eyebrow('main', 'recognition')}
        <h2 id="rec-h" class="h2">Awards</h2>
        <ol class="awards">${awards.map(a => `<li><span class="aw-year">${a.year}</span><div><p class="aw-title">${esc(a.title)}</p><p class="aw-org">${esc(a.org)}</p>${a.text ? `<p class="aw-text">${esc(a.text)}</p>` : ''}</div></li>`).join('')}</ol>
      </div>
      <div>
        ${eyebrow('research', 'community')}
        <h2 class="h2">On stage and in the room</h2>
        <ul class="community">${community.map(c => `<li><span class="cm-role">${esc(c.role)}</span><span class="cm-where">${esc(c.where)}</span>${c.what ? `<span class="cm-what">${esc(c.what)}</span>` : ''}</li>`).join('')}</ul>
      </div>
    </div>
  </section>`;
}

function explain() {
  return `<section class="section" id="explain" aria-labelledby="ex-h">
    <div class="wrap">
      ${eyebrow('main', 'teaching · produced in OBS Studio')}
      <h2 id="ex-h" class="h2">Build. Learn. Explain.</h2>
      <p class="prose narrow">If I can explain something from scratch, I understand it. I teach computer science on YouTube and document the Edinburgh MSc as it happens.</p>
      <div class="channels">${channels.map(c => `
        <a class="channel" href="${esc(c.url)}" target="_blank" rel="noopener">
          <span class="ch-mode">${esc(c.mode)}</span>
          <span class="ch-name">${esc(c.name)}</span>
          <span class="ch-topic">${esc(c.topic)}</span>
          <span class="ch-handle">${esc(c.handle)} <span aria-hidden="true">↗</span></span>
        </a>`).join('')}
      </div>
    </div>
  </section>`;
}

function contact() {
  const rows: [string, string, string][] = [
    ['GitHub', 'github.com/0krk0', site.links.github],
    ['LinkedIn', 'rajesh-kumar-kona', site.links.linkedin],
    ['Trailblazer', 'rajeshkumarkrk', site.links.trailblazer],
    ['LexoraAI', 'lexoraai.online', site.links.lexora],
    ['ownVoicz', 'ownvoicz.com', site.links.ownvoicz],
    ['YouTube', '@KRK0010 · @KRK017', channels[0].url],
  ];
  return `<section class="section contact" id="contact" aria-labelledby="ct-h">
    <div class="wrap">
      <p class="prompt small"><span class="p-sign">$</span> git remote add rajesh</p>
      <h2 id="ct-h" class="h2 contact-h">Let's build something.</h2>
      <p class="prose narrow">Open to software engineering, AI/ML and research conversations, in Edinburgh or remote.</p>
      <div class="mail">
        <a class="mail-addr" href="mailto:${site.email}">${site.email}</a>
        <button type="button" class="btn btn-solid sm" data-copy="${site.email}">Copy email</button>
        ${site.cvPath ? `<a class="btn btn-line sm" href="${base(site.cvPath)}">Download CV</a>` : ''}
      </div>
      <ul class="remotes">${rows.map(([k, v, h]) => `<li><span class="rm-k">${k}</span><a href="${esc(h)}" target="_blank" rel="noopener">${esc(v)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul>
    </div>
  </section>
  <footer class="foot wrap">
    <p>Built from scratch with TypeScript and Vite. No templates. Hosted on GitHub Pages.</p>
    <p class="foot-hint">Press <kbd>\`</kbd> for a shell · <kbd>⌘K</kbd> for everything.</p>
  </footer>`;
}

function ways() {
  const w: [string, string, string, string, string][] = [
    ['web', '#top', 'Web', 'The full story, top to bottom. You are here.', 'scroll'],
    ['terminal', '#terminal', 'Terminal', 'A working shell. Type <code>open lexora</code> or <code>neofetch</code>.', 'press `'],
    ['explorer', '#explorer', 'Explorer', 'Browse the portfolio as a repository, folder by folder.', 'file tree'],
    ['world', '#world', 'World', 'Walk around an island of my work. Find all six quests.', 'WASD · E'],
  ];
  const art: Record<string, string> = {
    web: '<rect x="8" y="10" width="64" height="44" rx="4"/><path d="M16 22h30M16 30h44M16 38h36M16 46h24"/>',
    terminal: '<rect x="8" y="10" width="64" height="44" rx="4"/><path d="M18 26l8 6-8 6M32 40h16"/>',
    explorer: '<path d="M12 14h18l4 5h34v31H12z"/><path d="M22 28h20M22 35h28M22 42h16"/>',
    world: '<path d="M40 12l26 14-26 14-26-14z"/><path d="M14 26v12l26 14 26-14V26"/><path d="M34 22l6-3 6 3v8l-6 3-6-3z"/>',
  };
  return `<section class="ways wrap" aria-labelledby="ways-h">
    <h2 id="ways-h" class="sr">Four ways to explore</h2>
    <p class="prompt small"><span class="p-sign">$</span> choose --interface</p>
    <div class="ways-grid">${w.map(([id, href, name, text, key]) => `
      <a class="way" href="${href}" data-mode-link="${id}">
        <svg viewBox="0 0 80 64" aria-hidden="true" class="way-art">${art[id]}</svg>
        <span class="way-name">${name}</span>
        <span class="way-text">${text}</span>
        <span class="way-key">${key}</span>
      </a>`).join('')}
    </div>
  </section>`;
}

function vtvSection() {
  const proj = projectById('vtv')!;
  const B = import.meta.env.BASE_URL;
  const f0 = vtv.frames[0];
  const segs = 40;
  return `<section class="section product" id="vtv" aria-labelledby="vtv-h">
    <div class="wrap">
      ${eyebrow('ai', 'ai · in development · 2026')}
      <div class="product-head">
        <div>
          <h2 id="vtv-h" class="h2 product-name">Voice-to-Video</h2>
          <p class="tagline">Say it, and see it. Then make it render fast, and prove it renders right.</p>
        </div>
        <div class="product-links">${vtv.repo.public ? ext(vtv.repo.url, 'GitHub', 'btn btn-line') : '<span class="status status-wip">Code private for now</span>'}<a class="btn btn-solid" href="${B}papers/voice-to-video-rendering.pdf" target="_blank" rel="noopener">Read the paper (PDF)</a></div>
      </div>
      <p class="prose narrow">${esc(proj.summary)}</p>
      <ol class="vtv-pipe" aria-label="Pipeline">${vtv.pipeline.map((p, i) => `<li><span class="vp-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(p.name)}</b><span>${esc(p.detail)}</span></li>`).join('')}</ol>

      <div class="vtv-block" data-amdahl>
        <div class="vtv-bhead"><h3 class="h3">Where the render time goes</h3><p class="fine">The measured profile of a 1080p render, run through Amdahl's law. Move the sliders, or try the presets. This is a model built on the measurement, not a benchmark.</p></div>
        <div class="am-bars">
          <div class="am-row"><span class="am-k">Measured</span><div class="am-bar"><i class="am-c" style="width:77%">compose 77%</i><i class="am-e" style="width:23%">encode 23%</i></div></div>
          <div class="am-row"><span class="am-k">Accelerated</span><div class="am-bar" data-am-bar><i class="am-c" data-am-c style="width:77%"></i><i class="am-e" data-am-e style="width:23%"></i></div></div>
        </div>
        <div class="am-ctl">
          <label>Speed up composition <output data-am-cv>1.0×</output><input type="range" min="1" max="10" step="0.1" value="1" data-am-cs></label>
          <label>Speed up encoding <output data-am-ev>1.0×</output><input type="range" min="1" max="50" step="0.5" value="1" data-am-es></label>
        </div>
        <div class="am-out"><span class="am-big" data-am-total>1.00×</span><span class="fine" data-am-note>faster overall</span></div>
        <div class="am-presets" role="group" aria-label="Presets">
          <button type="button" class="chip" data-am-preset="1,50">Hardware encoder (NVENC)</button>
          <button type="button" class="chip" data-am-preset="2.17,1">Remove redundant buffer work (12 → 26 fps)</button>
          <button type="button" class="chip" data-am-preset="1,1">Reset</button>
        </div>
      </div>

      <div class="vtv-block" data-plug>
        <div class="vtv-bhead"><h3 class="h3">Pull the plug</h3><p class="fine">The rule: a finished segment is a file whose name says so. Start a render, then cut the power. A simulation of the design, not a recording.</p></div>
        <div class="plug-rows">
          <div class="plug-row"><span class="am-k">One pass</span><div class="plug-one"><i data-plug-one></i></div><span class="plug-s" data-plug-one-s>0%</span></div>
          <div class="plug-row"><span class="am-k">12 s segments</span><div class="plug-segs" data-plug-segs>${Array.from({ length: segs }, () => '<i></i>').join('')}</div><span class="plug-s" data-plug-seg-s>0 / ${segs}</span></div>
        </div>
        <div class="plug-act">
          <button type="button" class="btn btn-solid sm" data-plug-go>Start render</button>
          <button type="button" class="btn btn-line sm" data-plug-cut disabled>Cut the power</button>
          <p class="fine" data-plug-msg aria-live="polite">Both renders are drawing the same video.</p>
        </div>
      </div>

      <div class="vtv-block" data-eq>
        <div class="vtv-bhead"><h3 class="h3">Does the GPU draw the same picture?</h3><p class="fine">The rule: no channel may differ from the CPU by more than 2, and no pixel may exceed that. These frames are from a run that failed it on a GeForce GTX 1650. The run after the fix passed every scene, so it saved no images.</p></div>
        <div class="eq-tabs" role="radiogroup" aria-label="Scene">${vtv.frames.map((f, i) => `<button type="button" role="radio" class="chip${i === 0 ? ' is-on' : ''}" aria-checked="${i === 0}" data-eq-scene="${f.id}">${esc(f.label)}</button>`).join('')}</div>
        <div class="eq-grid">
          ${(['cpu', 'gpu', 'diff'] as const).map(k => `<figure><img data-eq-img="${k}" src="${B}vtv/${f0.id}-${k}.webp" width="640" height="360" alt="" loading="lazy" decoding="async"><figcaption>${{ cpu: 'CPU reference (Pillow)', gpu: 'GPU, earlier shader', diff: 'Difference: amber ≤ 2, white > 2' }[k]}</figcaption></figure>`).join('')}
        </div>
        <div class="eq-verdicts" data-eq-v aria-live="polite"></div>
      </div>

      <div class="vtv-split">
        <div>
          <h3 class="h3">How the research went</h3>
          <ol class="vtv-steps">${vtv.steps.map(st => `<li><b>${esc(st.title)}</b><span>${esc(st.text)}</span></li>`).join('')}</ol>
        </div>
        <div>
          <h3 class="h3">Four bugs, found by counting pixels</h3>
          <p class="fine">First run on real hardware: 15 of 23 scenes. Every failing scene had something vertically asymmetric in it.</p>
          <ol class="vtv-defects">${vtv.defects.map(d => `<li><b>${esc(d.what)}</b><span>${esc(d.evidence)}</span></li>`).join('')}</ol>
          <p class="fine">18,432 + 2,304 = 20,736, exactly the reported count for that scene. That is why it was a measurement and not a guess.</p>
        </div>
      </div>

      <h3 class="h3">Long renders</h3>
      <div class="table-scroll"><table class="vtv-table">
        <thead><tr><th>Video</th><th>Render time</th><th>Segments</th><th>On GPU</th><th>Peak memory</th><th>Memory trend</th><th>Peak VRAM</th><th>Length error</th></tr></thead>
        <tbody>${vtv.longRuns.map(r => `<tr><td>${r.video}</td><td>${r.render}</td><td>${r.segments.toLocaleString('en-GB')}</td><td>${r.gpu.toLocaleString('en-GB')}</td><td>${r.rss}</td><td>${r.slope}</td><td>${r.vram}</td><td>${r.error}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="fine">GeForce GTX 1650, 1080p30. Before this, the longest video the project had rendered end to end was 150 seconds.</p>

      <div class="vtv-honest">
        <p class="vd-k">What is not claimed</p>
        <ul class="bullets">${vtv.honest.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
      </div>
      <p class="tags">${proj.tech.map(t => `<span>${esc(t)}</span>`).join('')}</p>
    </div>
  </section>`;
}

function voicePassportSection() {
  const vp = voicePassport;
  const proj = projectById('voicepassport')!;
  const tabs: [string, string, string][] = [
    ['problem', 'Problem', `<p>${esc(vp.problem)}</p>`],
    ['concept', 'Concept', `<p>${esc(vp.concept)}</p>`],
    ['flow', 'How it works', `<ol class="vp-flow">${vp.flow.map(f => `<li>${esc(f)}</li>`).join('')}</ol>`],
    ['arch', 'Architecture', `<dl class="vp-arch">${vp.architecture.map(a => `<div><dt>${esc(a.name)}</dt><dd>${esc(a.detail)}</dd></div>`).join('')}</dl>`],
    ['tech', 'Technology', `<p>What the repository actually runs on:</p><p class="tags">${proj.tech.map(t => `<span>${esc(t)}</span>`).join('')}</p><p class="fine">From the code in the public repo, not the Devpost form.</p>`],
    ['built', 'What I built', `<ul class="bullets">${vp.built.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`],
    ['context', 'Ideathon', `<p>Built for the ${ext(vp.eventUrl, esc(vp.event), 'link')}, a one-week online ideathon on Devpost in ${esc(vp.when.split(' · ')[0])}, about what a user-controlled “AI Passport” could carry: context, permission, proof or access.</p><p>${esc(vp.outcome)}</p>`],
    ['lessons', 'Lessons', `<ul class="bullets">${vp.lessons.map(b => `<li>${esc(b)}</li>`).join('')}</ul><p><strong>Next:</strong> ${esc(vp.next)}</p>`],
  ];
  const vpThemes = voiceThemes;
  return `<section class="section product" id="voicepassport" aria-labelledby="vp-h">
    <div class="wrap">
      ${eyebrow('ai', 'ai · ideathon prototype · Aug 2026')}
      <div class="product-head">
        <div>
          <h2 id="vp-h" class="h2 product-name">Voice Passport</h2>
          <p class="tagline">A portable consent layer for AI voices.</p>
        </div>
        <div class="product-links">${proj.links.map((l, i) => ext(l.url, esc(l.label), i === 0 ? 'btn btn-solid' : 'btn btn-line')).join('')}</div>
      </div>
      <p class="vp-context"><span class="status status-neutral">${esc(vp.event)}</span> Participated · no award claimed. <span class="fine-inline">The live demo runs on free hosting, so the first load can take a minute or two.</span></p>

      <div class="evolve" data-evolve>
        <div class="evolve-head">
          <h3 class="h3">Two voice projects, one question</h3>
          <p class="fine">Who decides how a voice gets used? Voice Passport and ownVoicz are separate projects that approach it from different sides. Pick a theme or a project.</p>
        </div>
        <div class="evolve-grid">
          <button type="button" class="ev-proj" data-proj="voicepassport"><span class="evp-k">Aug 2026 · ideathon prototype</span><span class="evp-n">Voice Passport</span><span class="evp-t">Consent and permissions that travel with a voice</span></button>
          <div class="evolve-mid">
            <svg class="evolve-wires" aria-hidden="true"></svg>
            <div class="themes" role="group" aria-label="Shared themes">${vpThemes.map(t => `<button type="button" class="theme" data-theme-id="${t.id}" data-in="${t.in.join(' ')}" aria-pressed="false">${esc(t.label)}</button>`).join('')}</div>
          </div>
          <button type="button" class="ev-proj" data-proj="ownvoicz"><span class="evp-k">2025 – present · in development</span><span class="evp-n">ownVoicz</span><span class="evp-t">Infrastructure to own and use your voice anywhere</span></button>
        </div>
        <div class="evolve-foot"><span class="evf-arrow" aria-hidden="true">↓</span><span class="evf-node">Voice ID</span><span class="fine">Both point at the same primitive: a voice identity whose owner decides what happens to it.</span></div>
      </div>

      <div class="vp-sim" data-vp aria-labelledby="vpsim-h">
        <div class="vp-sim-head">
          <div><h3 id="vpsim-h" class="h3">Try the passport</h3><p class="fine">A client-side replay of the prototype’s flow, using its seed data. The real one runs on a Node.js API.</p></div>
          <button type="button" class="btn btn-line sm" data-vp-reset>Reset demo</button>
        </div>
        <div class="vp-grid">
          <div class="vp-col">
            <p class="vp-k">Policy · VOICE-001 · Creator Voice #01</p>
            <ul class="vp-policy">${vp.policy.map(r => `<li data-rule="${esc(r.label)}"><span>${esc(r.label)}</span><b class="pill" data-s="${r.status}">${r.status.toLowerCase()}</b></li>`).join('')}</ul>
          </div>
          <div class="vp-col">
            <p class="vp-k">Incoming requests</p>
            <div class="vp-reqs" role="radiogroup" aria-label="Choose a request">${vp.requests.map((r, i) => `<button type="button" role="radio" aria-checked="${i === 0}" class="vp-req" data-req="${r.id}"><span class="vp-av">${r.requester.slice(0, 2).toUpperCase()}</span><span><b>${esc(r.requester)}</b><small>${esc(r.purpose)} · ${r.days} days</small></span><i class="pill" data-s="PENDING">pending</i></button>`).join('')}</div>
            <div class="vp-detail" data-vp-detail aria-live="polite"></div>
          </div>
          <div class="vp-col">
            <p class="vp-k">Authorizations</p>
            <ul class="vp-auths" data-vp-auths><li class="vp-empty">None yet.</li></ul>
            <p class="vp-k">Receipts</p>
            <ul class="vp-receipts" data-vp-receipts><li class="vp-empty">Every decision will leave one here.</li></ul>
          </div>
        </div>
      </div>

      <div class="vp-tabs" data-tabs>
        <div class="tablist" role="tablist" aria-label="Voice Passport project details">${tabs.map(([id, label], i) => `<button type="button" role="tab" id="vpt-${id}" aria-controls="vpp-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${label}</button>`).join('')}</div>
        ${tabs.map(([id, , body], i) => `<div class="tabpanel prose" role="tabpanel" id="vpp-${id}" aria-labelledby="vpt-${id}"${i === 0 ? '' : ' hidden'}>${body}</div>`).join('')}
      </div>
    </div>
  </section>`;
}

function interactions() {
  const groups: [string, [string, string][]][] = [
    ['Ways in', [['world', 'Enter Rajesh World'], ['terminal', 'Open the terminal'], ['explorer', 'Browse as a repository'], ['palette', 'Command palette (⌘K)']]],
    ['Career graph', [['checkout-ai', 'git checkout ai'], ['checkout-enterprise', 'git checkout enterprise'], ['head', 'Jump to HEAD']]],
    ['Case studies', [['pipe', 'Replay the pre-release catch'], ['atlas-high', 'Run a high-risk Atlas task'], ['flow-server', 'Send a file to a server feature'], ['vp-approve', 'Approve a Voice Passport request'], ['vtv-plug', 'Pull the plug on a render'], ['vtv-nvenc', 'See why NVENC caps at 1.3×']]],
    ['Evidence', [['trace', 'Trace “Solidity” to its evidence'], ['vault-azure', 'Search the vault for Azure'], ['paper', 'Open a paper summary'], ['vtv-paper', 'Read the rendering paper (PDF)'], ['sem1', 'Highlight this term’s modules']]],
    ['Small things', [['theme', 'Toggle light / dark'], ['copy-email', 'Copy my email'], ['secret', 'Look for the secret']]],
  ];
  return `<section class="section" id="interactions" aria-labelledby="int-h">
    <div class="wrap">
      ${eyebrow('main', 'interaction directory')}
      <h2 id="int-h" class="h2">Everything you can do here</h2>
      <p class="prose narrow">Every interactive piece of the site, one button each. Press one and it takes you there and runs it.</p>
      <div class="int-grid">${groups.map(([g, items]) => `
        <div class="int-group"><p class="tg-name">${g}</p><div class="int-items">${items.map(([id, label]) => `<button type="button" class="int-btn" data-action="${id}">${esc(label)}<span aria-hidden="true">→</span></button>`).join('')}</div></div>`).join('')}
      </div>
    </div>
  </section>`;
}

function overlays() {
  return `<div class="modal" id="cred-modal" hidden>
    <div class="modal-back" data-close></div>
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="cm-title" tabindex="-1">
      <button type="button" class="modal-x" data-close aria-label="Close">×</button>
      <div class="cm-body"></div>
    </div>
  </div>
  <div class="modal palette" id="palette" hidden>
    <div class="modal-back" data-close></div>
    <div class="modal-card pal-card" role="dialog" aria-modal="true" aria-label="Command palette">
      <label class="pal-input"><span class="p-sign" aria-hidden="true">›</span><span class="sr">Type a command</span>
        <input id="pal-q" type="text" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" placeholder="Jump to a section, open a link…" autocomplete="off"></label>
      <ul id="pal-list" role="listbox" class="pal-list"></ul>
      <p class="pal-foot"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> open <kbd>esc</kbd> close</p>
    </div>
  </div>
  <div class="modal term" id="term" hidden>
    <div class="modal-back" data-close></div>
    <div class="modal-card term-card" role="dialog" aria-modal="true" aria-label="Terminal">
      <div class="term-top"><span></span><span></span><span></span><p>rajesh@portfolio: ~</p><button type="button" class="modal-x" data-close aria-label="Close terminal">×</button></div>
      <div class="term-out" id="term-out" aria-live="polite"></div>
      <label class="term-line"><span class="p-user">rajesh@portfolio</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-sign">$</span><span class="sr">Command</span><input id="term-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send"></label>
      <div class="term-chips" aria-label="Suggested commands">${['help', 'whoami', 'projects', 'open lexora', 'open voicepassport', 'neofetch', 'git log', 'world'].map(c => `<button type="button" data-term-cmd="${c}">${c}</button>`).join('')}</div>
    </div>
  </div>
  <div class="modal hire" id="hire" hidden>
    <div class="modal-back" data-close></div>
    <div class="modal-card hire-card" role="dialog" aria-modal="true" aria-labelledby="hire-h" tabindex="-1">
      <button type="button" class="modal-x" data-close aria-label="Close">×</button>
      <p class="prompt small"><span class="p-sign">$</span> git remote add rajesh</p>
      <h2 id="hire-h" class="h3">Work with me</h2>
      <p class="prose">Software engineering, AI/ML and research roles or collaborations. Based in Edinburgh; open to remote.</p>
      <div class="hire-mail"><span class="mono">${site.email}</span><button type="button" class="btn btn-solid sm" data-copy="${site.email}">Copy email</button></div>
      <div class="hire-links">
        <a class="btn btn-line sm" href="mailto:${site.email}">Email</a>
        ${ext(site.links.linkedin, 'LinkedIn', 'btn btn-line sm')}
        ${ext(site.links.github, 'GitHub', 'btn btn-line sm')}
        ${site.cvPath ? `<a class="btn btn-line sm" href="${base(site.cvPath)}">Download CV</a>` : ''}
      </div>
    </div>
  </div>
  <div class="mode-overlay" id="explorer" hidden role="dialog" aria-modal="true" aria-label="Repository explorer"></div>
  <div class="world-root" id="world-root" hidden role="dialog" aria-modal="true" aria-label="Rajesh World"></div>
  <div class="toast" role="status" aria-live="polite" hidden></div>`;
}

export function renderApp() {
  return `${nav()}<main id="main">${hero()}${shortlog()}${ways()}${work()}${lexora()}${atlas()}${ownvoicz()}${vtvSection()}${voicePassportSection()}${archiveSection()}${research()}${now()}${stack()}${vault()}${recognition()}${explain()}${interactions()}${contact()}</main>${overlays()}`;
}
