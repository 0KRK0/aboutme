/* Explorer mode: browse the portfolio like a repository. */

import { commits } from '../data';
import { esc, hash } from '../render';
import { $, $$, trapFocus, closeModal, openModal, run as act, go } from './core';
import { buildTree, findNode, docToHtml, readmeOf, type TNode } from './tree';

let root: HTMLElement;
let tree: TNode;
let current = '';
const open = new Set<string>(['', 'projects']);

const icon = (n: TNode) => n.dir
  ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3.5h5l1.5 2h6.5v7.5h-13z"/></svg>'
  : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 1.5h6l3 3v10h-9z M9.5 1.5v3h3"/></svg>';

function treeHtml(n: TNode, depth = 0): string {
  return (n.children ?? []).map(c => {
    const isOpen = open.has(c.path);
    return `<li role="treeitem" aria-level="${depth + 1}"${c.dir ? ` aria-expanded="${isOpen}"` : ''} aria-selected="${c.path === current}">
      <button type="button" class="xp-node${c.path === current ? ' is-cur' : ''}" data-path="${esc(c.path)}" tabindex="${c.path === current ? 0 : -1}" style="--d:${depth}">
        ${c.dir ? `<span class="xp-caret" aria-hidden="true">${isOpen ? '▾' : '▸'}</span>` : '<span class="xp-caret" aria-hidden="true"></span>'}${icon(c)}<span>${esc(c.name)}</span>
      </button>
      ${c.dir && isOpen ? `<ul role="group">${treeHtml(c, depth + 1)}</ul>` : ''}
    </li>`;
  }).join('');
}

function view(n: TNode) {
  const crumbs = ['portfolio', ...n.path.split('/').filter(Boolean)];
  const crumbHtml = crumbs.map((c, i) => {
    const p = crumbs.slice(1, i + 1).join('/');
    return i === crumbs.length - 1 ? `<span aria-current="page">${esc(c)}</span>` : `<button type="button" data-path="${esc(p)}">${esc(c)}</button>`;
  }).join('<span aria-hidden="true">/</span>');
  let body = '';
  if (n.dir) {
    const last = [...commits].sort((a, b) => b.t - a.t).find(c => !c.future && !c.wip)!;
    body += `<div class="xp-list"><div class="xp-list-head"><span class="xp-av">rk</span><b>Rajesh Kumar Kona</b> <span>${esc(last.title)}</span><code>${hash(last.id + last.title)}</code></div>
      <ul>${n.path ? `<li><button type="button" data-path="${esc(n.path.split('/').slice(0, -1).join('/'))}">${icon({ dir: true } as TNode)}<span>..</span></button></li>` : ''}${(n.children ?? []).map(c => `<li><button type="button" data-path="${esc(c.path)}">${icon(c)}<span>${esc(c.name)}</span></button><span class="xp-desc">${esc(c.dir ? (readmeOf(c)?.doc?.title ?? `${c.children?.length ?? 0} items`) : c.doc?.title ?? '')}</span></li>`).join('')}</ul></div>`;
    const r = readmeOf(n);
    if (r?.doc) body += `<div class="xp-readme"><p class="xp-file-h">${icon(r)} README.md</p>${docToHtml(r.doc)}</div>`;
  } else if (n.doc) {
    body = `<div class="xp-readme"><p class="xp-file-h">${icon(n)} ${esc(n.name)}</p>${docToHtml(n.doc)}</div>`;
  }
  return `<nav class="xp-crumbs" aria-label="Path">${crumbHtml}</nav>${body}`;
}

function select(path: string, focusView = false) {
  const n = findNode(tree, path);
  if (!n) return;
  current = path;
  if (n.dir) open.add(path);
  // open every ancestor
  path.split('/').reduce((acc, part) => { const p = acc ? `${acc}/${part}` : part; open.add(p); return p; }, '');
  $('.xp-tree ul', root).innerHTML = treeHtml(tree);
  const v = $('.xp-view', root);
  v.innerHTML = view(n);
  v.scrollTop = 0;
  root.classList.remove('show-tree');
  if (focusView || !root.contains(document.activeElement)) v.focus({ preventScroll: true });
}

function build() {
  tree = buildTree();
  const last = [...commits].sort((a, b) => b.t - a.t).find(c => !c.future && !c.wip)!;
  root.innerHTML = `
    <header class="xp-top">
      <p class="xp-repo"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 2.5h9v11h-9zM4.5 2.5v11M13.5 4.5v9"/></svg><span>0krk0</span><span aria-hidden="true">/</span><b>portfolio</b></p>
      <span class="xp-branch" title="Current branch">⎇ main</span>
      <span class="xp-last">latest: ${esc(last.title)} <code>${hash(last.id + last.title)}</code></span>
      <button type="button" class="btn btn-line sm xp-files" data-xp-files aria-controls="xp-tree">Files</button>
      <button type="button" class="btn btn-solid sm" data-xp-close>Close explorer</button>
    </header>
    <div class="xp-body">
      <aside class="xp-tree" id="xp-tree" aria-label="Files"><p class="xp-tree-h">portfolio/</p><ul role="tree" aria-label="Portfolio files"></ul></aside>
      <main class="xp-view" tabindex="-1" aria-live="polite"></main>
    </div>`;
  root.addEventListener('click', e => {
    const t = e.target as Element;
    const pathBtn = t.closest<HTMLElement>('[data-path]');
    if (pathBtn) {
      const p = pathBtn.dataset.path!;
      const n = findNode(tree, p);
      if (n?.dir && pathBtn.classList.contains('xp-node') && open.has(p) && current === p) { open.delete(p); $('.xp-tree ul', root).innerHTML = treeHtml(tree); return; }
      select(p);
      return;
    }
    const g = t.closest<HTMLElement>('[data-goto]');
    if (g) { closeExplorer(); setTimeout(() => go(g.dataset.goto!), 60); return; }
    const r = t.closest<HTMLElement>('[data-run]');
    if (r) { const name = r.dataset.run!, arg = r.dataset.arg; if (name !== 'cred') closeExplorer(); act(name, arg); return; }
    if (t.closest('[data-xp-close]')) closeExplorer();
    if (t.closest('[data-xp-files]')) root.classList.toggle('show-tree');
  });
  // tree keyboard: roving focus
  root.addEventListener('keydown', e => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('.xp-node');
    if (!btn) return;
    const all = $$<HTMLButtonElement>('.xp-node', root);
    const i = all.indexOf(btn), p = btn.dataset.path!, n = findNode(tree, p)!;
    const focus = (k: number) => { const b = all[Math.max(0, Math.min(all.length - 1, k))]; all.forEach(x => (x.tabIndex = -1)); b.tabIndex = 0; b.focus(); };
    if (e.key === 'ArrowDown') { e.preventDefault(); focus(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focus(i - 1); }
    else if (e.key === 'ArrowRight' && n.dir) { e.preventDefault(); if (!open.has(p)) { open.add(p); $('.xp-tree ul', root).innerHTML = treeHtml(tree); $<HTMLButtonElement>(`.xp-node[data-path="${p}"]`, root).focus(); } else focus(i + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (n.dir && open.has(p)) { open.delete(p); $('.xp-tree ul', root).innerHTML = treeHtml(tree); $<HTMLButtonElement>(`.xp-node[data-path="${p}"]`, root).focus(); } else { const parent = p.split('/').slice(0, -1).join('/'); const b = parent && root.querySelector<HTMLButtonElement>(`.xp-node[data-path="${parent}"]`); if (b) b.focus(); } }
    else if (e.key === 'Home') { e.preventDefault(); focus(0); }
    else if (e.key === 'End') { e.preventDefault(); focus(all.length - 1); }
  });
  trapFocus(root, closeExplorer);
}

export function openExplorer(path = 'README.md') {
  root = $('#explorer');
  if (!root.firstElementChild) build();
  openModal(root, document.activeElement as HTMLElement, '.xp-top button');
  select(current || path);
  $<HTMLButtonElement>(`.xp-node[data-path="${current}"]`, root)?.focus();
}
export function closeExplorer() {
  closeModal($('#explorer'));
  if (location.hash === '#explorer') history.replaceState(null, '', location.pathname + location.search);
}
