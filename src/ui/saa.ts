/* Salesforce AI Agent: the risk-engine explorer. It only looks up decisions
   that the repository's own engine produced (see src/data/saa.ts); it does not
   re-implement the engine or call Salesforce. */

import { saa, type SaaEnv } from '../data';
import { esc } from '../render';
import { $, $$ } from './core';

const role = (r: string) => r.toLowerCase().split('_').map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
const roles = (rs: string[]) => rs.length < 2 ? rs.map(role).join('') : `${rs.slice(0, -1).map(role).join(', ')} or ${role(rs[rs.length - 1])}`;

export function initSaa() {
  const root = $('[data-saa]');
  if (!root) return { show: (_r: string, _e: SaaEnv) => {} };
  const out = $('[data-saa-out]', root);
  const envBtns = $$<HTMLButtonElement>('[data-saa-env]', root);
  const reqBtns = $$<HTMLButtonElement>('[data-saa-req]', root);
  let env: SaaEnv = 'sandbox';
  let req = saa.scenarios[0].id;

  const draw = () => {
    const s = saa.scenarios.find(x => x.id === req)!;
    const d = s.d[env];
    const verdict = d.blocked
      ? `<p class="saa-verdict" data-v="blocked">Refused before it reaches Salesforce</p><p>${esc(d.why ?? '')}</p>${d.alternatives?.length ? `<p class="saa-k">What the agent offers instead</p><ul class="bullets">${d.alternatives.map(a => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}`
      : d.approval
        ? `<p class="saa-verdict" data-v="wait">Waits for ${d.count === 1 ? 'one approval' : `${d.count} approvals from different people`}</p><p>From: ${esc(roles(d.roles ?? []))}. The approval expires after ${Math.round((d.ttl ?? 0) / 60)} minutes${d.separate ? ', and the person who asked cannot approve it' : ''}.</p>`
        : `<p class="saa-verdict" data-v="run">Runs now</p><p>${s.writes ? '' : 'A read is never gated by environment, so a production org you may not change can still be inspected. Salesforce’s own field-level security applies, and the read is audited.'}</p>`;
    out.innerHTML = `
      <div class="saa-head"><code>${esc(s.tool)}</code><span class="fine">declared ${esc(s.declared)}${s.writes ? ' · writes' : ' · read-only'}</span><span class="saa-risk" data-r="${d.risk}">${d.risk}</span><span class="fine">category: ${esc(d.category)}</span></div>
      ${verdict}
      <p class="saa-k">The engine’s reasons</p>
      <ul class="saa-reasons">${d.reasons.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`;
  };

  const pick = (btns: HTMLButtonElement[], el: HTMLButtonElement) => btns.forEach(b => {
    const on = b === el;
    b.setAttribute('aria-checked', String(on));
    b.classList.toggle('is-on', on && b.classList.contains('chip'));
  });
  envBtns.forEach(b => b.addEventListener('click', () => { env = b.dataset.saaEnv as SaaEnv; pick(envBtns, b); draw(); }));
  reqBtns.forEach(b => b.addEventListener('click', () => { req = b.dataset.saaReq!; pick(reqBtns, b); draw(); }));
  draw();

  return {
    show: (r: string, e: SaaEnv) => {
      const rb = reqBtns.find(b => b.dataset.saaReq === r), eb = envBtns.find(b => b.dataset.saaEnv === e);
      if (rb) { req = r; pick(reqBtns, rb); }
      if (eb) { env = e; pick(envBtns, eb); }
      draw();
    },
  };
}
