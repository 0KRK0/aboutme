/* A virtual file tree of the portfolio, built from the data layer.
   The repository explorer renders it; the terminal's ls / cd / cat walk it. */

import {
  site, identity, projects, papers, credentials, awards, community, channels, msc, btech, roles, numbers,
  commits, voicePassport, pipeline,
} from '../data';
import { esc } from '../render';
import { BASE } from './core';

export interface Doc {
  title: string;
  lead?: string;
  meta?: [string, string][];
  sections?: { h: string; list?: string[]; p?: string }[];
  links?: { label: string; url: string }[];
  image?: string;
  /** Section on the web page this file corresponds to. */
  anchor?: string;
  /** Extra action button, e.g. open the vault modal for a credential. */
  action?: { label: string; name: string; arg?: string };
}

export interface TNode { name: string; path: string; dir: boolean; children?: TNode[]; doc?: Doc }

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const file = (name: string, doc: Doc): TNode => ({ name, path: '', dir: false, doc });
const dir = (name: string, children: TNode[], doc?: Doc): TNode => ({ name, path: '', dir: true, children, doc });

function projectDoc(id: string): Doc {
  const p = projects.find(x => x.id === id)!;
  return {
    title: p.name, lead: p.summary,
    meta: [['Status', p.statusLabel], ['Period', p.period], ['Branch', p.lane]],
    sections: [
      ...(p.facts.length ? [{ h: 'Facts', list: p.facts }] : []),
      ...(p.tech.length ? [{ h: 'Technology', list: p.tech }] : [{ h: 'Technology', p: 'Not listed yet. It will be filled in from the source code when it is published.' }]),
    ],
    links: p.links.map(l => ({ label: l.label, url: l.url })),
    anchor: p.anchor,
  };
}

export function buildTree(): TNode {
  const vp = voicePassport;
  const root = dir('portfolio', [
    file('README.md', {
      title: identity.name, lead: `${identity.role} · ${identity.focusLine}. ${identity.background}. Now ${identity.currently.join(', ')}.`,
      meta: [['Location', identity.location], ['Focus', identity.focus.join(', ')]],
      sections: [
        { h: 'By the numbers', list: numbers.map(n => `${n.value}${n.suffix} ${n.label}`).concat('Rank 2 of 66 in the BTech cohort') },
        { h: 'How to read this repository', p: 'Every folder is a part of my work. Open a file to read it; the button at the bottom jumps to the same thing on the web page.' },
      ],
      links: [{ label: 'GitHub', url: site.links.github }, { label: 'LinkedIn', url: site.links.linkedin }],
      anchor: 'top',
    }),
    dir('experience', [
      ...roles.map(r => file(`${r.id === 'accenture' ? 'accenture' : 'tech-stalwart-internship'}.md`, {
        title: `${r.title}, ${r.company}`, lead: r.summary, meta: [['Period', r.period], ['Location', r.place]],
        sections: r.id === 'accenture' ? [{ h: 'Impact', list: ['170+ production contributions', '20+ critical defects resolved within SLA', 'Promoted in ~21 months, ahead of cycle', 'Cheer Award (2025) · Client recognition (2026)'] }] : [],
        anchor: 'work',
      })),
      file('the-pre-release-catch.md', {
        title: 'The bug that never reached production', lead: 'Client and project details stay confidential. This is the shape of what happened.',
        sections: [{ h: 'Stages', list: pipeline.map(p => `${p.stage}: ${p.text}`) }], anchor: 'work',
      }),
    ]),
    dir('projects', [
      dir('lexora', [file('README.md', projectDoc('lexora'))]),
      dir('atlas', [file('README.md', projectDoc('atlas'))]),
      dir('ownvoicz', [file('README.md', projectDoc('ownvoicz'))]),
      dir('voice-passport', [
        file('README.md', { ...projectDoc('voicepassport'), sections: [
          { h: 'Problem', p: vp.problem }, { h: 'Concept', p: vp.concept }, { h: 'What I built', list: vp.built },
          { h: 'Technology (from the repo)', list: projects.find(p => p.id === 'voicepassport')!.tech },
          { h: 'Ideathon', p: `${vp.event}, ${vp.when}. ${vp.outcome}` },
          { h: 'Lessons', list: vp.lessons },
        ] }),
        file('ARCHITECTURE.md', { title: 'Voice Passport architecture', lead: 'How the prototype in the public repository is put together.', sections: [{ h: 'Components', list: vp.architecture.map(a => `${a.name}: ${a.detail}`) }, { h: 'Request flow', list: vp.flow }], anchor: 'voicepassport' }),
      ]),
      dir('blockchain-fund', [file('README.md', projectDoc('fund'))]),
      dir('web3-bookstore', [file('README.md', projectDoc('web3'))]),
      dir('smart-home', [file('README.md', projectDoc('iot'))]),
      dir('aider', [file('README.md', projectDoc('aider'))]),
    ]),
    dir('research', papers.map(p => file(`${slug(p.venue + '-' + p.year + '-' + p.title).slice(0, 48)}.md`, {
      title: p.title, lead: p.summary,
      meta: [['Venue', `${p.venueLong} (${p.venue})`], ['Year', String(p.year)], ['Authors', p.authors.join(', ')], ['Domain', p.domain]],
      sections: [{ h: 'Key ideas', list: p.ideas }, ...(p.url ? [] : [{ h: 'Paper', p: 'PDF link not added yet.' }])],
      links: p.url ? [{ label: 'Read paper', url: p.url }] : [], anchor: 'research',
    }))),
    dir('certificates', [...credentials].sort((a, b) => Number(!!a.pending) - Number(!!b.pending) || b.sort - a.sort).map(c => file(`${slug(c.title).slice(0, 44)}.md`, {
      title: c.title,
      meta: ([['Issuer', c.issuer], ['Date', c.date], ['Kind', `${c.kind} · ${c.cat}`], ['Credential ID', c.credentialId ?? ''], ['Certification number', c.certNumber ?? ''], ['Valid until', c.validUntil ?? '']] as [string, string][]).filter(x => x[1]),
      sections: c.pending ? [{ h: 'Proof', p: 'Listed on my CV. The certificate file has not been uploaded yet.' }] : c.details ? [{ h: 'Details', p: c.details }] : [],
      links: c.verify ? [{ label: 'Verify credential', url: c.verify }] : [],
      image: c.image ? `${BASE}credentials/${c.image}.webp` : undefined,
      action: { label: 'Open in the vault', name: 'cred', arg: c.id },
    }))),
    dir('education', [
      file('msc-edinburgh.md', { title: `${msc.programme}, ${msc.university}`, lead: `${msc.years}. ${msc.totalCredits} credits, all SCQF level 11.`, sections: [{ h: 'Modules', list: msc.modules.map(m => `${m.code} · ${m.name} (${m.term}, ${m.credits} credits)`) }], anchor: 'now' }),
      file('btech-vvit.md', { title: `${btech.degree}, ${btech.school}`, lead: `${btech.period} · ${btech.place}`, meta: [['GPA', btech.gpa], ['Rank', btech.rank], ['Specialisation', btech.specialisation]], sections: [{ h: 'Coursework', list: btech.coursework }] }),
    ]),
    dir('awards', [file('awards.md', { title: 'Awards', sections: [{ h: 'Recognition', list: awards.map(a => `${a.year} · ${a.title}, ${a.org}${a.text ? '. ' + a.text : ''}`) }], anchor: 'recognition' }),
      file('community.md', { title: 'Community', sections: [{ h: 'On stage and in the room', list: community.map(c => `${c.role} · ${c.where}${c.what ? ' (' + c.what + ')' : ''}`) }], anchor: 'recognition' })]),
    file('youtube.md', { title: 'Build. Learn. Explain.', lead: 'Teaching computer science and documenting the Edinburgh MSc. Produced in OBS Studio.', sections: [{ h: 'Channels', list: channels.map(c => `${c.name} (${c.handle}): ${c.topic}`) }], links: channels.map(c => ({ label: c.name, url: c.url })), anchor: 'explain' }),
    file('timeline.log', { title: 'git log --oneline', sections: [{ h: 'Newest first', list: [...commits].sort((a, b) => b.t - a.t).map(c => `${c.when} · ${c.title}`) }], anchor: 'top' }),
    file('contact.md', { title: 'Contact', lead: 'Open to software engineering, AI/ML and research conversations, in Edinburgh or remote.', meta: [['Email', site.email]], links: [{ label: 'LinkedIn', url: site.links.linkedin }, { label: 'GitHub', url: site.links.github }], action: { label: 'Work with me', name: 'hire' } }),
  ]);
  const setPaths = (n: TNode, p: string) => { n.path = p; n.children?.forEach(c => setPaths(c, p ? `${p}/${c.name}` : c.name)); };
  setPaths(root, '');
  return root;
}

export function findNode(root: TNode, path: string): TNode | null {
  if (!path || path === '/' || path === '~') return root;
  const parts = path.replace(/^~\/?|^\//, '').split('/').filter(Boolean);
  let n: TNode | undefined = root;
  for (const part of parts) {
    if (part === '..') return null;
    n = n?.children?.find(c => c.name === part || c.name === part + '/');
    if (!n) return null;
  }
  return n;
}

/** Folder with a README shows that README. */
export const readmeOf = (n: TNode) => n.dir ? n.children?.find(c => c.name === 'README.md') ?? null : n;

export function docToHtml(d: Doc) {
  const ext = (u: string, l: string) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)} ↗</a>`;
  return `<article class="md">
    <h1>${esc(d.title)}</h1>
    ${d.lead ? `<p class="md-lead">${esc(d.lead)}</p>` : ''}
    ${d.image ? `<img src="${d.image}" alt="Certificate: ${esc(d.title)}" loading="lazy" width="1320" height="1020">` : ''}
    ${d.meta?.length ? `<table><tbody>${d.meta.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>` : ''}
    ${(d.sections ?? []).map(s => `<h2>${esc(s.h)}</h2>${s.p ? `<p>${esc(s.p)}</p>` : ''}${s.list ? `<ul>${s.list.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}`).join('')}
    ${d.links?.length ? `<h2>Links</h2><ul class="md-links">${d.links.map(l => `<li>${ext(l.url, l.label)}</li>`).join('')}</ul>` : ''}
    <div class="md-actions">
      ${d.anchor ? `<button type="button" class="btn btn-solid sm" data-goto="${d.anchor}">Open on the web page</button>` : ''}
      ${d.action ? `<button type="button" class="btn btn-line sm" data-run="${d.action.name}"${d.action.arg ? ` data-arg="${d.action.arg}"` : ''}>${esc(d.action.label)}</button>` : ''}
    </div>
  </article>`;
}

export function docToText(d: Doc) {
  const out: string[] = [`# ${d.title}`];
  if (d.lead) out.push('', d.lead);
  if (d.meta?.length) out.push('', ...d.meta.map(([k, v]) => `${k.padEnd(20)} ${v}`));
  for (const s of d.sections ?? []) { out.push('', `## ${s.h}`); if (s.p) out.push(s.p); if (s.list) out.push(...s.list.map(i => `- ${i}`)); }
  if (d.links?.length) out.push('', ...d.links.map(l => `${l.label}: ${l.url}`));
  return out.join('\n');
}
