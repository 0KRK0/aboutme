# Rajesh Kumar Kona · Portfolio

My personal site at **https://0krk0.github.io/aboutme/**. It's built around one idea: my career shown as `git log --graph`. Five branches (`main`, `systems`, `enterprise`, `ai`, `research`) all merge into **HEAD → MSc Edinburgh**.

It's a static site built with TypeScript and Vite, with no framework. The HTML is prerendered at build time, so the page is complete before any JavaScript runs.

There are four ways to explore it. They all read from the same data layer:

| Mode | Address | For |
|---|---|---|
| **Web** | `/` | Recruiters. The full story, top to bottom. |
| **Terminal** | `/#terminal` or press `` ` `` | Developers. A working shell: `help`, `whoami`, `neofetch`, `projects`, `open lexora`, `ls`, `cd`, `cat`, `git log`… |
| **Explorer** | `/#explorer` | Browsing the portfolio as a repository tree. |
| **World** | `/#world` | An isometric island of the work. WASD / arrows / touch pad, `E` explore, `M` map, `I` progress, `T` terminal, `1–9` travel, `Esc` menu. Six quests and one hidden terminal. |

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs to dist/
npm run preview    # serves dist/ at http://localhost:4173
```

You need Node 20 or newer.

## Deploy to GitHub Pages

The build works out where it is hosted by itself, so either repository name is fine:

- A repo named **`0krk0.github.io`** serves the site at `https://0krk0.github.io/`.
- Any other name, such as **`aboutme`**, serves it at `https://0krk0.github.io/aboutme/`.

Canonical, Open Graph and sitemap URLs follow automatically.

One-time setup:
1. Push this folder so that `package.json` is at the root of the repository.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
   (If you push before doing this, the first build fails at "configure-pages". Choose GitHub Actions, then re-run the workflow.)
3. Wait for the "Deploy to GitHub Pages" run in the **Actions** tab to go green.

After that, every push to `main` redeploys. To build locally for a project path, run `BASE=/aboutme/ npm run build`.

## Where things live

```
index.html                 SEO, Open Graph, JSON-LD (Person schema)
src/data/                  ← ALL content. Every mode reads from here.
  profile.ts               identity, links, YouTube channels
  timeline.ts              the career graph: lanes and milestones
  experience.ts            Accenture impact, the defect case study, internship
  projects.ts              every project (incl. Voice Passport, Voice-to-Video), Atlas stages, ownVoicz pillars
  research.ts · education.ts · certifications.ts · awards.ts · skills.ts
  world.ts                 world zones, exhibits, quests, optional art
  commands.ts              terminal help text and `open` targets
src/render.ts              HTML for every web section (runs at build time and in dev)
src/main.ts                Web interactions, ⌘K palette, action registry, interaction directory
src/ui/                    core helpers · terminal · explorer (+ tree.ts) · mode router · Voice Passport · Voice-to-Video
src/world/world.ts         Rajesh World (Canvas 2D, lazy-loaded only when opened)
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
- **Paper PDF:** put the PDF in `public/papers/` and set `url: 'papers/<file>.pdf'` (no leading slash, so it works under the repo base path) on that paper. Set `kind` to `'Peer-reviewed'` or `'Preprint'`, and `page` to a landing page if it has one.
- **Salesforce and Agentic AI proof:** save the certificate as `public/credentials/<id>.webp` plus `<id>.thumb.webp`. Then set `image: '<id>'` on the credential, add its credential ID or verify URL, and remove `pending: true`.
- **CV download:** add `public/Rajesh_Kumar_Kona_CV.pdf` and set `site.cvPath = 'Rajesh_Kumar_Kona_CV.pdf'`. A "Download CV" button then appears in Contact.
- **Project source links:** when LexoraAI or ownVoicz go open source, add the repo link beside the product in `src/render.ts`, which has the matching `product-links` block.

## Adding things

- **New project:** add it to `projects` in `src/data/projects.ts`. It appears in the terminal (`projects`, `open <cmd>`), the explorer and the palette. To put it in the world, add an exhibit to a zone in `src/data/world.ts` with `ref: { type: 'project', id: '<id>' }`.
- **New paper / award / certificate:** add it to the matching data file. The world's library and achievements hall read from the same arrays.
- **Generated art (e.g. Higgsfield):** export a still or render as `.webp`, put it in `public/world/`, and set `worldAssets.introBackdrop = '/world/<file>.webp'` in `src/data/world.ts`. It shows behind the world's intro. The site never calls a generation API at runtime.

## Built in

- An evolution graph you can select with the mouse or the arrow keys (← → Home End), plus a lane filter (`git checkout <lane>`). Below 820px wide it becomes a vertical `git log`.
- "The bug that never reached production": a stepper you can play or walk through one stage at a time.
- LexoraAI "Where does your file go?": a privacy flow for free tools, server features and the AI companion.
- Atlas: follow a low-risk or high-risk task. High-risk tasks pause for human approval.
- ownVoicz: Voice ID with five planned pillars. Every pillar is clearly marked as planned.
- Voice-to-Video: an Amdahl lab built on the measured 77/23 render profile, a "pull the plug" simulation of segmented rendering, and CPU-vs-GPU frames from the diagnosis run. Rendering research is in `public/papers/voice-to-video-rendering.pdf` (preprint, not yet peer-reviewed; landing page with Google Scholar meta tags at `public/papers/voice-to-video-rendering.html`).
- MSc: each course's public DRPS summary, learning outcomes and assessment split, with links to the course pages.
- Stack trace: every skill wired to the work, papers, credentials or modules that back it up.
- Credential vault: search, filters, a preview modal, IDs and verify links.
- ⌘K / Ctrl+K (or `/`) opens a command palette. On phones, the "Jump to…" button opens it.
- Press `` ` `` for a terminal. Try `help`, `git log`, `git status`, `sudo hire rajesh`.
- Light and dark themes (follow the system setting, with a manual toggle), reduced-motion support, focus-trapped modals and visible focus states.
