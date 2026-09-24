# Rajesh Kumar Kona · Portfolio

My personal site at **https://0krk0.github.io**. It's built around one idea: my career shown as `git log --graph`. Five branches (`main`, `systems`, `enterprise`, `ai`, `research`) all merge into **HEAD → MSc Edinburgh**.

It's a static site built with TypeScript and Vite, with no framework. The HTML is prerendered at build time, so the page is complete before any JavaScript runs.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

You need Node 20 or newer.

## Deploy to GitHub Pages (one-time setup)

1. On GitHub, create a **public** repository named exactly **`0krk0.github.io`**.
2. Push this folder to it:
   ```bash
   git remote add origin https://github.com/0krk0/0krk0.github.io.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` builds the site and publishes it. After about a minute the site is live at https://0krk0.github.io.

From then on, every push to `main` redeploys the site.

> If you'd rather use a project repo (for example `github.com/0krk0/portfolio`), change the build step in the workflow to `BASE=/portfolio/ npm run build`. Then replace `https://0krk0.github.io/` with `https://0krk0.github.io/portfolio/` in `index.html`, `public/robots.txt`, `public/sitemap.xml` and `src/data.ts`.

## Where things live

```
index.html                 SEO, Open Graph, JSON-LD (Person schema)
src/data.ts                ← ALL content: milestones, projects, papers, modules, credentials, skills
src/render.ts              HTML for every section (runs at build time and in dev)
src/main.ts                Interactions: graph, pipeline, file-flow, Atlas, orbit, stack trace,
                           vault, ⌘K palette, terminal, theme
src/styles.css             Design tokens (light + dark) and all styles
scripts/prerender.mjs      Injects rendered HTML into dist/index.html (and 404.html)
public/credentials/        Certificate images (full size + thumbnails, WebP)
public/og.png              Social share image (1200×630)
public/favicon.svg, apple-touch-icon.png, robots.txt, sitemap.xml
.github/workflows/deploy.yml
```

## Editing content

Almost everything is in `src/data.ts`:

- **New milestone:** add an entry to `commits` with a `lane`, a decimal year `t` (for example `2027.3`) and a `diff`. It appears on the graph and in the mobile log automatically.
- **Paper PDF:** put the PDF in `public/papers/` and set `url: '/papers/<file>.pdf'` on that paper.
- **Salesforce and Agentic AI proof:** save the certificate as `public/credentials/<id>.webp` plus `<id>.thumb.webp`. Then set `image: '<id>'` on the credential, add its credential ID or verify URL, and remove `pending: true`.
- **CV download:** add `public/Rajesh_Kumar_Kona_CV.pdf` and set `site.cvPath = 'Rajesh_Kumar_Kona_CV.pdf'`. A "Download CV" button then appears in Contact.
- **Project source links:** when LexoraAI or ownVoicz go open source, add the repo link beside the product in `src/render.ts`, which has the matching `product-links` block.

## Built in

- An evolution graph you can select with the mouse or the arrow keys (← → Home End), plus a lane filter (`git checkout <lane>`). Below 820px wide it becomes a vertical `git log`.
- "The bug that never reached production": a stepper you can play or walk through one stage at a time.
- LexoraAI "Where does your file go?": a privacy flow for free tools, server features and the AI companion.
- Atlas: follow a low-risk or high-risk task. High-risk tasks pause for human approval.
- ownVoicz: Voice ID with five planned pillars. Every pillar is clearly marked as planned.
- Stack trace: every skill wired to the work, papers, credentials or modules that back it up.
- Credential vault: search, filters, a preview modal, IDs and verify links.
- ⌘K / Ctrl+K (or `/`) opens a command palette. On phones, the "Jump to…" button opens it.
- Press `` ` `` for a terminal. Try `help`, `git log`, `git status`, `sudo hire rajesh`.
- Light and dark themes (follow the system setting, with a manual toggle), reduced-motion support, focus-trapped modals and visible focus states.
