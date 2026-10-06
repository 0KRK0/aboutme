import { defineConfig, type Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

/* Works on any GitHub Pages address without editing:
   - user site   (0krk0.github.io)          → base '/'
   - project site (github.com/0krk0/aboutme) → base '/aboutme/'
   GitHub Actions sets GITHUB_REPOSITORY; you can also force it with BASE=/something/. */
const repo = process.env.GITHUB_REPOSITORY ?? '';            // e.g. "0KRK0/aboutme"
const [owner = '0krk0', name = ''] = repo ? repo.split('/') : [];
const isUserSite = !name || name.toLowerCase().endsWith('.github.io');
/* A custom domain (public/CNAME, e.g. 0krk0.dev) is served from the root, so it wins. */
const domain = existsSync('public/CNAME') ? readFileSync('public/CNAME', 'utf8').trim() : '';
const base = process.env.BASE ?? (domain || isUserSite ? '/' : `/${name}/`);
const siteUrl = domain ? `https://${domain}/` : `https://${owner.toLowerCase()}.github.io${base}`;
const HOME = 'https://0krk0.github.io/';

/** Rewrites the canonical / Open Graph / sitemap URLs to wherever the site is actually served. */
const siteUrlPlugin = (): Plugin => {
  let ssr = false;
  return {
  name: 'site-url',
  configResolved(c) { ssr = !!c.build.ssr; },
  transformIndexHtml: html => html.split(HOME).join(siteUrl),
  closeBundle() {
    if (ssr) return;
    for (const f of ['dist/robots.txt', 'dist/sitemap.xml', 'dist/papers/voice-to-video-rendering.html']) {
      if (existsSync(f)) writeFileSync(f, readFileSync(f, 'utf8').split(HOME).join(siteUrl));
    }
  },
  };
};

export default defineConfig({
  base,
  plugins: [siteUrlPlugin()],
  build: { target: 'es2020', cssMinify: true, assetsInlineLimit: 0 },
});
