/* What each exhibit says when you open it. Shared by every view of Rajesh World. */

import {
  projects, papers, awards, channels, voicePillars, credentials, msc, identity, community, type Lane,
} from '../data';
import { esc } from '../render';
import type { Placed } from './layout';

export const awardKind = ['Client recognition', 'Workplace award', 'Academic standing', 'Competition prize', 'Competition medal'];

/* ── panels ─────────────────────────────────────────────── */
export type Btn = { label: string; goto?: string; url?: string; run?: string; arg?: string; solid?: boolean };
export function panelHtml(kicker: string, title: string, body: string, btns: Btn[], lane: Lane = 'main') {
  return `<div class="w-p-head" data-lane="${lane}"><p class="eyebrow"><span class="dot" aria-hidden="true"></span>${esc(kicker)}</p><h2 class="w-p-title" id="w-p-title">${esc(title)}</h2></div>
    <div class="w-p-body">${body}</div>
    <div class="w-p-actions">${btns.map(b => b.url
      ? `<a class="btn ${b.solid ? 'btn-solid' : 'btn-line'} sm" href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.label)} ↗</a>`
      : `<button type="button" class="btn ${b.solid ? 'btn-solid' : 'btn-line'} sm" ${b.goto ? `data-w-goto="${b.goto}"` : ''}${b.run ? ` data-w-run="${b.run}"` : ''}${b.arg ? ` data-w-arg="${b.arg}"` : ''}>${esc(b.label)}</button>`).join('')}
      <button type="button" class="btn btn-ghost sm" data-w-close>Back to the world <kbd>Esc</kbd></button></div>`;
}
const metric = (v: string, k: string) => `<div class="w-m"><b>${esc(v)}</b><span>${esc(k)}</span></div>`;
const list = (xs: string[]) => `<ul class="w-list">${xs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;

export function contentFor(target: Placed | { id: 'hub' } | { id: 'secret' }): string {
  if (target.id === 'hub') return panelHtml('central hub', identity.name, `<p>${esc(identity.role)} · ${esc(identity.focusLine)}</p><div class="w-metrics">${metric(identity.location, 'location')}${metric('MSc CS', 'University of Edinburgh')}${metric('2+ yrs', 'enterprise engineering')}</div><p class="w-note">Every path from here leads to a part of my work. Press <kbd>M</kbd> for the map.</p>`, [{ label: 'Open the map', run: 'map', solid: true }]);
  if (target.id === 'secret') return panelHtml('hidden', 'An old build server', `<p>Still humming. A sticky note on the rack reads:</p><pre class="w-pre">$ sudo unlock</pre><p class="w-note">Try it in the terminal.</p>`, [{ label: 'Open the terminal', run: 'terminal', solid: true }]);
  const e = target as Placed, ref = e.ref;
  if (ref.type === 'project') {
    const p = projects.find(x => x.id === ref.id)!;
    const metrics = p.id === 'lexora' ? `<div class="w-metrics">${metric('100K+', 'pageviews')}${metric('6.7M+', 'requests')}${metric('Full stack', 'built solo')}${metric('LLM', 'integration')}</div>` : '';
    const extra = p.id === 'voicepassport' ? '<p class="w-note">AI Passport Ideathon · participated, no award claimed. A separate project from ownVoicz; both explore who controls a voice.</p>'
      : p.id === 'ownvoicz' ? '<p class="w-note">Separate from Voice Passport. The pillars around this lab are ownVoicz’s roadmap.</p>'
      : p.id === 'careeros' ? '<p class="w-note">Open source under MIT. It fills the form and stops: every Submit is mine.</p>'
      : p.id === 'autrad' ? '<p class="w-note">Paper trading only. Proven alpha so far: 0, and the repo says so.</p>'
      : p.id === 'saa' ? '<p class="w-note">Open source under MIT. Every risky change waits for the right people; nothing is claimed about production use.</p>'
      : p.id === 'vtv' ? '<p class="w-note">The rendering research is written up as a preprint (not yet peer-reviewed). The GPU speed-up was measured on one GTX 1650 laptop.</p>' : '';
    return panelHtml(`${p.lane} · ${p.statusLabel}`, p.name, `<p>${esc(p.summary)}</p>${metrics}${p.facts.length && p.id !== 'lexora' ? list(p.facts) : ''}${p.tech.length ? `<p class="tags">${p.tech.map(t => `<span>${esc(t)}</span>`).join('')}</p>` : ''}${extra}`,
      [{ label: 'Open case study', goto: p.anchor, solid: true }, ...p.links.map(l => ({ label: l.label, url: l.url }))], p.lane);
  }
  if (ref.type === 'paper') {
    const p = papers.find(x => x.id === ref.id)!;
    return panelHtml(`research · ${p.venue} ${p.year}`, p.title, `<p class="w-note">${esc(p.authors.join(', '))} · ${esc(p.domain)}</p><p>${esc(p.summary)}</p>${list(p.ideas)}`, [{ label: 'Read paper on the web page', goto: 'research', solid: true }], 'research');
  }
  if (ref.type === 'award') {
    const a = awards[ref.index];
    return panelHtml(`${awardKind[ref.index]} · ${a.year}`, a.title, `<p>${esc(a.org)}</p>${a.text ? `<p>${esc(a.text)}</p>` : ''}${ref.index === 2 ? `<div class="w-metrics">${metric('2 / 66', 'BTech cohort rank')}${metric('8.65 / 10', 'GPA')}</div>` : ''}`, [{ label: 'See all awards', goto: 'recognition' }]);
  }
  if (ref.type === 'channel') {
    const c = channels[ref.index];
    return panelHtml(`studio · ${c.mode}`, c.name, `<p>${esc(c.topic)}</p><p class="w-note">${esc(c.handle)} · produced in OBS Studio</p>`, [{ label: 'Watch channel', url: c.url, solid: true }, { label: 'All channels', goto: 'explain' }]);
  }
  if (ref.type === 'pillar') {
    const p = voicePillars.find(x => x.id === ref.id)!;
    return panelHtml('ownVoicz · planned pillar', p.name, `<p>${esc(p.detail)}</p><p class="w-note">Roadmap. Not presented as released.</p>`, [{ label: 'Open ownVoicz', goto: 'ownvoicz', solid: true }], 'ai');
  }
  const id = ref.id;
  const cats = ['AI', 'Cloud', 'Salesforce', 'Programming', 'Web', 'Other'].map(c => `${c}: ${credentials.filter(x => x.cat === c).length}`);
  const byId: Record<string, [string, string, string, Btn[], Lane?]> = {
    impact: ['enterprise · Accenture', 'Production terminal', `<div class="w-metrics">${metric('170+', 'production contributions')}${metric('20+', 'critical defects resolved')}${metric('~21 mo', 'to promotion')}</div><p>Software Engineer (Salesforce Developer), Aug 2024 – Sep 2026. Enterprise CRM systems and integrations under strict SLAs.</p>`, [{ label: 'View experience', goto: 'work', solid: true }], 'enterprise'],
    crm: ['enterprise · building', 'CRM Systems', '<p>Enterprise CRM solutions in Apex, Lightning Web Components, SOQL and Flow, cutting manual processing.</p>', [{ label: 'View experience', goto: 'work', solid: true }], 'enterprise'],
    integrations: ['enterprise · building', 'API Integrations', '<p>Secure REST API integrations for reliable two-way data exchange between core systems and third-party enterprise services.</p>', [{ label: 'View experience', goto: 'work', solid: true }], 'enterprise'],
    quality: ['enterprise · case study', 'The bug that never reached production', '<p>Before a release, I identified a critical defect, found its cause and resolved it. The client avoided a significant business loss and the onshore team formally recognised the catch.</p><p class="w-note">Client details stay confidential.</p>', [{ label: 'Replay the case study', run: 'pipe-go', solid: true }], 'enterprise'],
    tss: ['enterprise · Jun–Jul 2023', 'Before Accenture', '<p>Full-stack engineer intern at Tech Stalwart Solution. Improved page-load speed by roughly 15% with React.js and co-deployed the company website on AWS.</p>', [{ label: 'View experience', goto: 'work' }], 'enterprise'],
    vault: ['systems · vault', 'Certification Vault', `<p>${credentials.length} credentials with IDs and verify links.</p>${list(cats)}`, [{ label: 'Open the credential vault', goto: 'credentials', solid: true }], 'systems'],
    msc: ['main · HEAD', `${msc.programme}`, `<p>${esc(msc.university)}, ${esc(msc.years)}.</p><div class="w-metrics">${metric('AI', 'area')}${metric('ML', 'area')}${metric('Systems', 'area')}${metric('Research', 'area')}</div>`, [{ label: 'Open MSc section', goto: 'now', solid: true }]],
    modules: ['main · this year', 'Modules', list(msc.modules.map(m => `${m.code} · ${m.name} (${m.term})`)), [{ label: 'Open MSc section', goto: 'now', solid: true }]],
    dissertation: ['main · planned', 'MSc Dissertation', '<p>60 credits, summer 2027. Topic not chosen yet.</p>', [{ label: 'Open MSc section', goto: 'now' }]],
    voiceid: ['ai · shared idea', 'Voice ID', '<p>The question both voice projects ask: who decides how a voice gets used?</p><p><b>Voice Passport</b> (ideathon prototype, Aug 2026) answers it with portable consent: scoped, time-limited permissions and receipts.</p><p><b>ownVoicz</b> (in development) plans a voice identity its owner can use anywhere.</p><p class="w-note">Separate projects. Related themes.</p>', [{ label: 'See how they connect', goto: 'voicepassport', solid: true }], 'ai'],
    agentic: ['ai · lab', 'Agentic AI', '<p>Accenture Agentic AI badge (2025). Atlas is where it gets applied: agents acting through MCP tools, with verification and human approval.</p>', [{ label: 'Open Atlas', goto: 'atlas', solid: true }], 'ai'],
    ml: ['ai · lab', 'Machine Learning', list(['Paper: Advancements in Artistic Style Transfer (IRJET 2023)', 'Microsoft Certified: Azure AI Engineer Associate (2023)', 'This year: Machine Learning Practical and Machine Learning Systems']), [{ label: 'Open research', goto: 'research', solid: true }], 'ai'],
    entered: ['main · competitions', 'Competitions entered', `<p>Taking part, labelled for exactly what it was. None of these is an award.</p>${list(community.filter(c => /Appathon|Ideathon|Hackathon/.test(c.where)).map(c => `${c.where}: ${c.what}`))}`, [{ label: 'See recognition', goto: 'recognition', solid: true }]],
    renderbench: ['ai · Voice-to-Video', 'Where render time goes', `<div class="w-metrics">${metric('77%', 'composing frames')}${metric('23%', 'x264 encoding')}${metric('11.7×', 'photos on GPU')}${metric('12→26', 'fps after cleanup')}</div><p>So the GPU work went into composition, not encoding: an OpenGL painter that resamples photographs, checked against the CPU within 2 levels per channel. 23 of 23 scenes pass on a GTX 1650, and photographs compose 11.7× faster there at 1080p.</p>`, [{ label: 'Try the Amdahl lab', goto: 'vtv', solid: true }, { label: 'Read the paper', url: 'papers/voice-to-video-rendering.pdf' }], 'ai'],
    llm: ['ai · lab', 'LLM Systems', list(['LexoraAI: LLM integration in a live product (6.7M+ requests)', 'Atlas: an LLM gateway with bring-your-own enterprise credentials']), [{ label: 'Open LexoraAI', goto: 'lexora', solid: true }], 'ai'],
  };
  const c = byId[id];
  return panelHtml(c[0], c[1], c[2], c[3], c[4] ?? 'main');
}

