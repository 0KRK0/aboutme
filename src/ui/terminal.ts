/* Terminal mode: a small shell that navigates the portfolio for real. */

import { commandList, openTargets, commits, projects, identity, site, channels, awards, msc, btech, skills, credentials, projectById, papers } from '../data';
import { esc } from '../render';
import { $, $$, openModal, closeModal, store, run as act, toggleTheme } from './core';
import { buildTree, findNode, docToText, readmeOf, type TNode } from './tree';

const term = () => $('#term');
let out: HTMLElement, input: HTMLInputElement;
const hist: string[] = [];
let hi = 0;
let cwd = '';
let tree: TNode;

const line = (html = '') => { out.insertAdjacentHTML('beforeend', html + '\n'); out.scrollTop = out.scrollHeight; };
const hi_ = (s: string) => `<span class="t-hi">${s}</span>`;
const ok = (s: string) => `<span class="t-ok">${s}</span>`;
const dim = (s: string) => `<span class="t-dim">${s}</span>`;
const cmdBtn = (c: string, label = c) => `<button type="button" class="t-run" data-term-cmd="${esc(c)}">${esc(label)}</button>`;
const link = (href: string, t: string) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(t)}</a>`;
const prompt = () => `rajesh@portfolio:${cwd ? '~/' + cwd : '~'}$`;

/** Close the terminal, then do something on the page. */
function leave(fn: () => void, msg: string) {
  line(dim(msg));
  setTimeout(() => { closeModal(term()); fn(); }, 380);
}

function openThing(name: string) {
  const key = (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!key) { line(`usage: open ${hi_('&lt;name&gt;')}. Try ${cmdBtn('projects')} to see names.`); return; }
  const p = projectById(key) ?? projects.find(x => x.name.toLowerCase().replace(/[^a-z0-9]/g, '') === key);
  if (p) return leave(() => act('goto', p.anchor), `opening ${p.name} …`);
  if (openTargets[key]) return leave(() => act('goto', openTargets[key]), `opening ${key} …`);
  const ext: Record<string, string> = { github: site.links.github, linkedin: site.links.linkedin, youtube: channels[0].url, devpost: 'https://devpost.com/software/voice-umlk3g' };
  if (ext[key]) { line(`opening ${link(ext[key], ext[key])}`); window.open(ext[key], '_blank', 'noopener'); return; }
  if (key === 'world' || key === 'explorer') return leave(() => act('mode', key), `entering ${key} …`);
  line(`open: nothing called “${esc(name)}”. Try ${cmdBtn('projects')} or ${cmdBtn('ls')}.`);
}

function neofetch() {
  const art = [
    '  <b class="c-ai">*</b>         ',
    '  <b class="c-ai">|</b><b class="c-re">\\</b>        ',
    '  <b class="c-ai">|</b> <b class="c-re">*</b>       ',
    '  <b class="c-ma">*</b> <b class="c-re">|</b> <b class="c-sy">*</b>     ',
    '  <b class="c-ma">|</b><b class="c-re">/</b> <b class="c-sy">/</b>      ',
    '  <b class="c-ma">*</b><b class="c-sy">-</b><b class="c-sy">\'</b> <b class="c-en">*</b>    ',
    '  <b class="c-ma">|</b>  <b class="c-en">/</b>     ',
    '  <b class="c-ma">*</b><b class="c-en">--\'</b>      ',
    '  <b class="c-ma">|</b>         ',
    '  <b class="c-hd">@</b> HEAD     ',
  ];
  const info = [
    `${ok('rajesh')}@${ok('portfolio')}`,
    '----------------',
    `${hi_('OS')}        MSc Computer Science 2026–27`,
    `${hi_('Host')}      University of Edinburgh`,
    `${hi_('Kernel')}    2 years enterprise engineering (Accenture)`,
    `${hi_('Uptime')}    since 2020 · BTech CSE, rank 2/66`,
    `${hi_('Shell')}     Apex · Java · Python · JavaScript · SQL`,
    `${hi_('Products')}  LexoraAI (6.7M+ requests) · Atlas · ownVoicz`,
    `${hi_('Research')}  3 peer-reviewed papers`,
    `${hi_('Vault')}     ${credentials.length} credentials`,
  ];
  art.forEach((a, i) => line(`<span class="nf">${a}</span>${info[i] ?? ''}`));
}

function whoami() {
  line(`<b class="t-big">${esc(identity.name.toUpperCase())}</b>`);
  line(`${esc(identity.role)}\n${esc(identity.focusLine)}\n`);
  line(`${hi_('LOCATION')}\n${esc(identity.location)}\n`);
  line(`${hi_('CURRENTLY')}\n${identity.currently.map(esc).join('\n')}\n`);
  line(`${hi_('BACKGROUND')}\n${esc(identity.background)}\n`);
  line(`${hi_('FOCUS')}\n${identity.focus.map(esc).join('\n')}`);
}

function ls(arg?: string) {
  const target = arg ? resolve(arg) : resolve('');
  const n = findNode(tree, target);
  if (!n) { line(`ls: ${esc(arg ?? '')}: no such directory`); return; }
  if (!n.dir) { line(esc(n.name)); return; }
  line(n.children!.map(c => c.dir ? cmdBtn(`cd ${c.path}`, c.name + '/') : cmdBtn(`cat ${c.path}`, c.name)).join('  '));
}
function resolve(p: string) {
  if (!p || p === '.') return cwd;
  if (p === '~' || p === '/') return '';
  if (p.startsWith('~/')) return p.slice(2).replace(/\/$/, '');
  if (p === '..') return cwd.split('/').slice(0, -1).join('/');
  return (cwd ? `${cwd}/${p}` : p).replace(/\/$/, '');
}

const files: Record<string, string> = {
  'about.txt': `${identity.name}. ${identity.role}.\n${identity.background}.\nBuilt LexoraAI solo (6.7M+ requests). Three papers.\nNow: ${identity.currently.join(', ')}.`,
  'stack.txt': skills.map(g => `${g.group.padEnd(22)} ${g.items.map(i => i.name).join(' · ')}`).join('\n'),
  'contact.txt': `${site.email}\n${site.links.linkedin}\n${site.links.github}`,
};

export function runCommand(cmdline: string) {
  const raw = cmdline.trim();
  line(`<span class="t-cmd">${esc(prompt())} ${esc(raw)}</span>`);
  if (!raw) return;
  hist.push(raw); hi = hist.length;
  const [cmdRaw, ...args] = raw.split(/\s+/);
  const cmd = cmdRaw.toLowerCase();
  switch (cmd) {
    case 'help': {
      const groups = ['Read', 'Navigate', 'Modes', 'Shell'] as const;
      for (const g of groups) {
        line(hi_(g.toUpperCase()));
        commandList.filter(c => c.group === g).forEach(c => line(`  ${cmdBtn(c.name + (c.args ? ' ' : ''), c.name)}${c.args ? ' ' + dim(esc(c.args)) : ''}${' '.repeat(Math.max(1, 18 - c.name.length - (c.args ? c.args.length + 1 : 0)))}${esc(c.about)}`));
      }
      line(dim('Click any command to run it. Tab completes. ↑ ↓ walk your history.'));
      break;
    }
    case 'about': line(esc(files['about.txt'])); break;
    case 'whoami': whoami(); break;
    case 'neofetch': neofetch(); break;
    case 'projects':
      line(hi_('> PROJECTS'));
      projects.forEach((p, i) => line(`[${String(i + 1).padStart(2, '0')}] ${cmdBtn('open ' + p.cmd, p.name)} ${dim(esc(p.statusLabel))}`));
      line(dim('\nType open <name>, e.g. open voicepassport'));
      break;
    case 'lexora': case 'atlas': case 'ownvoicz': case 'voicepassport': openThing(cmd); break;
    case 'open': openThing(args.join(' ')); break;
    case 'experience': leave(() => act('goto', 'work'), 'opening experience …'); break;
    case 'research': leave(() => act('goto', 'research'), 'opening research …'); break;
    case 'certifications': case 'certificates': case 'certs': leave(() => act('goto', 'credentials'), 'opening the credential vault …'); break;
    case 'youtube': leave(() => act('goto', 'explain'), 'opening the channels …'); break;
    case 'contact': leave(() => act('hire'), 'opening contact …'); break;
    case 'github': openThing('github'); break;
    case 'education':
      line(`${hi_(msc.programme)}, ${esc(msc.university)} · ${msc.years}`);
      msc.modules.forEach(m => line(`  ${m.code.padEnd(5)} ${esc(m.name)} ${dim(`${m.term} · ${m.credits} cr`)}`));
      line(`\n${hi_(esc(btech.degree))}, ${esc(btech.school)} · ${esc(btech.period)}\n  GPA ${btech.gpa} · rank ${esc(btech.rank)}`);
      line(dim('\n') + cmdBtn('open education'));
      break;
    case 'skills': skills.forEach(g => line(`${hi_(esc(g.group.padEnd(22)))} ${g.items.map(i => esc(i.name)).join(' · ')}`)); line(dim('\n') + cmdBtn('open skills')); break;
    case 'awards': awards.forEach(a => line(`${hi_(a.year)}  ${esc(a.title)} ${dim('· ' + esc(a.org))}`)); break;
    case 'timeline': case 'log':
      [...commits].sort((x, y) => y.t - x.t).forEach(c => line(`${hi_(esc(c.when.padEnd(18)))}${esc(c.title)}`));
      break;
    case 'git':
      if (args[0] === 'log') [...commits].sort((x, y) => y.t - x.t).slice(0, 14).forEach(c => line(`${hi_(esc(c.when.padEnd(18)))}${esc(c.title)}`));
      else if (args[0] === 'status') line(`On branch main\nYour branch is ahead of 'origin/btech' by 2 years of production.\n\nChanges not staged for commit:\n\t${hi_('modified:   projects/atlas/')}\n\t${hi_('modified:   projects/ownvoicz/')}`);
      else if (args[0] === 'blame') line('Every line: Rajesh Kumar Kona.');
      else if (args[0] === 'branch') line(['main', 'systems', 'enterprise', 'ai', 'research'].map(b => (b === 'main' ? '* ' : '  ') + b).join('\n'));
      else line(`try: ${cmdBtn('git log')} ${cmdBtn('git status')} ${cmdBtn('git branch')}`);
      break;
    case 'ls': ls(args[0]); break;
    case 'pwd': line('~/' + cwd); break;
    case 'cat': {
      const a = args.join(' ');
      if (files[a]) { line(esc(files[a])); break; }
      const n = findNode(tree, resolve(a));
      const f = n ? readmeOf(n) : null;
      if (f?.doc) line(esc(docToText(f.doc)));
      else line(`cat: ${esc(a)}: no such file. Try ${cmdBtn('ls')}.`);
      break;
    }
    case 'history': hist.slice(0, -1).forEach((h, i) => line(`${String(i + 1).padStart(4)}  ${cmdBtn(h)}`)); break;
    case 'theme': toggleTheme(); line('theme toggled'); break;
    case 'clear': out.innerHTML = ''; break;
    case 'exit': case 'web': closeModal(term()); break;
    case 'world': case 'explorer': leave(() => act('mode', cmd), `entering ${cmd} …`); break;
    case 'sudo': {
      const rest = args.join(' ').toLowerCase();
      if (rest === 'hire rajesh') { line(`${ok('[sudo] permission granted.')}\nNext step: ${link('mailto:' + site.email, site.email)}`); setTimeout(() => act('hire'), 700); }
      else if (rest === 'unlock') {
        if (store.get('world-secret') === '1') line(`${ok('[sudo] unlocked.')}\nYou found the old build server, so here is the note it was keeping:\n\n“Ship small, measure honestly, and write down what you learned.”\n\nThanks for exploring this far. ${link('mailto:' + site.email, 'Say hello')}.`);
        else line('sudo: unlock needs a key. An old machine somewhere in the world still has one.');
      }
      else line('rajesh is not in the sudoers file. This incident will be reported.');
      break;
    }
    case 'rm': line('Nice try. Production data stays.'); break;
    case 'vim': case 'nano': case 'emacs': line('Opening an editor here would be a trap. Try cat instead.'); break;
    case 'papers': papers.forEach(p => line(`${hi_(String(p.year))} ${esc(p.title)} ${dim(p.venue)}`)); break;
    default:
      if (cmd === 'cd') {
        const target = resolve(args[0] ?? '');
        const n = findNode(tree, target);
        if (n?.dir) { cwd = target; $('#term .p-path').textContent = cwd ? '~/' + cwd : '~'; }
        else line(`cd: ${esc(args[0] ?? '')}: not a directory`);
        break;
      }
      line(`${esc(cmd)}: command not found. Type ${cmdBtn('help')}.`);
  }
}

function complete() {
  const v = input.value;
  const parts = v.split(/\s+/);
  let pool: string[];
  if (parts.length <= 1) pool = [...commandList.map(c => c.name), 'lexora', 'atlas', 'ownvoicz', 'voicepassport', 'sudo', 'cd', 'pwd'];
  else if (parts[0] === 'open') pool = [...projects.map(p => p.cmd), ...Object.keys(openTargets), 'github', 'linkedin', 'youtube', 'devpost', 'world', 'explorer'];
  else if (parts[0] === 'cd' || parts[0] === 'ls' || parts[0] === 'cat') {
    const n = findNode(tree, cwd);
    pool = (n?.children ?? []).map(c => c.name + (c.dir ? '/' : '')).concat(parts[0] === 'cat' ? Object.keys(files) : []);
  } else return;
  const last = parts[parts.length - 1];
  const hits = [...new Set(pool)].filter(x => x.startsWith(last));
  if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(' ') + (hits[0].endsWith('/') ? '' : ' '); }
  else if (hits.length > 1) line(dim(hits.join('  ')));
}

export function initTerminal() {
  out = $('#term-out'); input = $<HTMLInputElement>('#term-in');
  tree = buildTree();
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = input.value; input.value = ''; runCommand(v); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = hist[hi] ?? ''; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] ?? ''; }
    else if (e.key === 'Tab') { e.preventDefault(); complete(); }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  term().addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLElement>('[data-term-cmd]');
    if (b) { const c = b.dataset.termCmd!; if (c.endsWith(' ')) { input.value = c; input.focus(); } else { runCommand(c); input.focus(); } return; }
    if (!(e.target as Element).closest('a, button, input')) input.focus();
  });
}

export function openTerminal(cmd?: string) {
  if (!out.innerHTML) { line(`${ok('Welcome to rajesh@portfolio.')} This shell really navigates the site.`); line(`Start with ${cmdBtn('help')}, ${cmdBtn('whoami')} or ${cmdBtn('projects')}.\n`); }
  openModal(term(), document.activeElement as HTMLElement, '#term-in');
  if (cmd) runCommand(cmd);
}
export const isTerminalOpen = () => !term().hidden;
export { $$ };
