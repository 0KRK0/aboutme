// Injects the fully rendered page into dist/index.html so the HTML is complete
// before any JavaScript runs (fast first paint, indexable by search engines).
import { readFileSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
const { renderApp } = await import('../.ssr/entry-server.js');
const file = 'dist/index.html';
const html = readFileSync(file, 'utf8');
if (!html.includes('<!--app-->')) throw new Error('placeholder <!--app--> missing');
writeFileSync(file, html.replace('<!--app-->', renderApp()));
copyFileSync(file, 'dist/404.html');
rmSync('.ssr', { recursive: true, force: true });
console.log('prerendered dist/index.html');
