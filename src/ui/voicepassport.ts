/* Voice Passport: idea-evolution view, consent simulator, detail tabs. */

import { voicePassport as vp } from '../data';
import { esc } from '../render';
import { $, $$, radios } from './core';

type Req = typeof vp.requests[number] & { status: 'PENDING' | 'APPROVED' | 'DENIED' };
interface Auth { id: string; req: string; requester: string; purpose: string; expires: Date; status: 'ACTIVE' | 'REVOKED' }
interface Receipt { id: string; req: string; decision: string; reason: string; at: Date }

const rid = () => Math.random().toString(16).slice(2, 10).toUpperCase();
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function initVoicePassport() {
  /* ── idea evolution: themes ↔ projects ─────────────────── */
  const evo = $('[data-evolve]');
  const projBtns = $$<HTMLButtonElement>('.ev-proj', evo);
  const themeBtns = $$<HTMLButtonElement>('.theme', evo);
  const wires = $<SVGSVGElement>('.evolve-wires', evo);
  let focus: { kind: 'proj' | 'theme'; id: string } | null = null;
  const drawWires = () => {
    wires.innerHTML = '';
    if (!focus || matchMedia('(max-width: 820px)').matches) return;
    const R = $('.evolve-mid', evo).getBoundingClientRect();
    const lit = themeBtns.filter(t => t.classList.contains('is-lit'));
    const paths: string[] = [];
    for (const p of projBtns.filter(b => b.classList.contains('is-lit'))) {
      const pr = p.getBoundingClientRect(), left = pr.right < R.left + 10;
      for (const t of lit) {
        if (!t.dataset.in!.split(' ').includes(p.dataset.proj!)) continue;
        const tr = t.getBoundingClientRect();
        const x1 = left ? 0 : R.width, y1 = pr.top + pr.height / 2 - R.top;
        const x2 = left ? tr.left - R.left : tr.right - R.left, y2 = tr.top + tr.height / 2 - R.top, m = (x1 + x2) / 2;
        paths.push(`<path d="M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2} ${y2}"/>`);
      }
    }
    wires.innerHTML = paths.join('');
  };
  const apply = () => {
    evo.classList.toggle('has-focus', !!focus);
    projBtns.forEach(b => {
      const on = !!focus && (focus.kind === 'proj' ? focus.id === b.dataset.proj : themeBtns.find(t => t.dataset.themeId === focus!.id)!.dataset.in!.split(' ').includes(b.dataset.proj!));
      b.classList.toggle('is-lit', on); b.setAttribute('aria-pressed', String(focus?.kind === 'proj' && focus.id === b.dataset.proj));
    });
    themeBtns.forEach(t => {
      const on = !!focus && (focus.kind === 'theme' ? focus.id === t.dataset.themeId : t.dataset.in!.split(' ').includes(focus.id));
      t.classList.toggle('is-lit', on); t.setAttribute('aria-pressed', String(focus?.kind === 'theme' && focus.id === t.dataset.themeId));
    });
    drawWires();
  };
  projBtns.forEach(b => b.addEventListener('click', () => { focus = focus?.id === b.dataset.proj ? null : { kind: 'proj', id: b.dataset.proj! }; apply(); }));
  themeBtns.forEach(t => t.addEventListener('click', () => { focus = focus?.id === t.dataset.themeId ? null : { kind: 'theme', id: t.dataset.themeId! }; apply(); }));
  addEventListener('resize', drawWires);
  focus = { kind: 'theme', id: 'identity' }; apply();

  /* ── consent simulator ─────────────────────────────────── */
  const sim = $('[data-vp]');
  const detail = $('[data-vp-detail]', sim);
  const authsEl = $('[data-vp-auths]', sim);
  const recEl = $('[data-vp-receipts]', sim);
  let reqs: Req[] = [], auths: Auth[] = [], receipts: Receipt[] = [], sel = vp.requests[0].id;
  const reset = () => { reqs = vp.requests.map(r => ({ ...r, status: 'PENDING' as const })); auths = []; receipts = []; sel = vp.requests[0].id; render(); };
  const policyStatus = (label: string) => vp.policy.find(p => p.label === label)?.status ?? 'NOT IN POLICY';
  function decide(approve: boolean) {
    const r = reqs.find(x => x.id === sel)!;
    if (r.status !== 'PENDING') return;
    r.status = approve ? 'APPROVED' : 'DENIED';
    let authId: string | null = null;
    if (approve) {
      const a: Auth = { id: `AUTH-${rid()}`, req: r.id, requester: r.requester, purpose: r.purpose, expires: new Date(Date.now() + r.days * 864e5), status: 'ACTIVE' };
      auths.unshift(a); authId = a.id;
    }
    receipts.unshift({ id: `VPR-${new Date().getFullYear()}-${rid()}`, req: r.id, decision: r.status, at: new Date(),
      reason: approve ? ('approveReason' in r && r.approveReason ? r.approveReason : 'Purpose is permitted under this Voice Passport.') : ('denyReason' in r && r.denyReason ? r.denyReason : 'Commercial advertising is not currently authorized.') });
    void authId;
    render(true);
  }
  function render(announce = false) {
    $$<HTMLButtonElement>('.vp-req', sim).forEach(b => {
      const r = reqs.find(x => x.id === b.dataset.req)!;
      const pill = $('.pill', b); pill.dataset.s = r.status; pill.textContent = r.status.toLowerCase();
    });
    const r = reqs.find(x => x.id === sel)!;
    const ps = policyStatus(r.policy);
    $$('.vp-policy li', sim).forEach(li => li.classList.toggle('is-match', li.dataset.rule === r.policy));
    detail.innerHTML = `
      <dl class="vp-dl">
        <div><dt>Request</dt><dd class="mono">${r.id}</dd></div>
        <div><dt>Requester</dt><dd>${esc(r.requester)}</dd></div>
        <div><dt>Purpose</dt><dd>${esc(r.purpose)}</dd></div>
        <div><dt>Action</dt><dd>${esc(r.action)}</dd></div>
        <div><dt>Duration</dt><dd>${r.days} days</dd></div>
        <div><dt>Model training · resale</dt><dd>${r.training ? 'yes' : 'no'} · ${r.resale ? 'yes' : 'no'}</dd></div>
      </dl>
      <p class="vp-check">Policy check: <b>${esc(r.policy)}</b> → <b class="pill" data-s="${ps}">${ps.toLowerCase()}</b></p>
      ${r.status === 'PENDING'
        ? `<div class="vp-actions"><button type="button" class="btn btn-solid sm" data-vp-approve>Approve</button><button type="button" class="btn btn-line sm" data-vp-deny>Deny</button></div>`
        : `<p class="vp-done">Decided: <b class="pill" data-s="${r.status}">${r.status.toLowerCase()}</b></p>`}`;
    authsEl.innerHTML = auths.length ? auths.map(a => `<li><span class="mono">${a.id}</span><span>${esc(a.requester)} · ${esc(a.purpose)}</span><span class="vp-exp">${a.status === 'ACTIVE' ? `expires ${fmt(a.expires)}` : 'revoked'}</span>${a.status === 'ACTIVE' ? `<button type="button" class="btn btn-line xs" data-vp-revoke="${a.id}">Revoke</button>` : '<b class="pill" data-s="REVOKED">revoked</b>'}</li>`).join('') : '<li class="vp-empty">None yet.</li>';
    recEl.innerHTML = receipts.length ? receipts.map(x => `<li><span class="mono">${x.id}</span><span><b class="pill" data-s="${x.decision}">${x.decision.toLowerCase()}</b> ${esc(x.req)}</span><span class="vp-reason">${esc(x.reason)}</span></li>`).join('') : '<li class="vp-empty">Every decision will leave one here.</li>';
    if (announce) detail.setAttribute('aria-live', 'polite');
  }
  const group = radios($('.vp-reqs', sim), b => { sel = b.dataset.req!; render(); });
  sim.addEventListener('click', e => {
    const t = e.target as Element;
    if (t.closest('[data-vp-approve]')) decide(true);
    else if (t.closest('[data-vp-deny]')) decide(false);
    else if (t.closest('[data-vp-reset]')) { reset(); group.pick(0); }
    const rv = t.closest<HTMLElement>('[data-vp-revoke]');
    if (rv) { const a = auths.find(x => x.id === rv.dataset.vpRevoke); if (a) { a.status = 'REVOKED'; receipts.unshift({ id: `VPR-${new Date().getFullYear()}-${rid()}`, req: a.req, decision: 'REVOKED', reason: 'Creator withdrew this authorization.', at: new Date() }); render(); } }
  });
  reset();

  /* ── tabs ──────────────────────────────────────────────── */
  $$('[data-tabs]').forEach(box => {
    const tabs = $$<HTMLButtonElement>('[role="tab"]', box);
    const show = (t: HTMLButtonElement, f = false) => {
      tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $(`#${x.getAttribute('aria-controls')}`).hidden = !on; });
      if (f) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { e.preventDefault(); show(tabs[(i + 1) % tabs.length], true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(tabs[(i - 1 + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); show(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); show(tabs[tabs.length - 1], true); }
      });
    });
  });

  return {
    approveFirst() { sel = vp.requests[0].id; group.pick(0); if (reqs[0].status !== 'PENDING') reset(); decide(true); },
  };
}
