/* Research: peer-reviewed publications, plus preprints (labelled as not peer-reviewed).
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

/* ── Research ──────────────────────────────────────────────── */
export const papers = [
  {
    id: 'paper-fund', title: 'Blockchain Based Fund Management System', venue: 'IJCRT', venueLong: 'International Journal of Creative Research Thoughts',
    year: 2024, authors: ['R. K. Kona'], domain: 'Blockchain · Smart contracts',
    summary: 'Secure, decentralised fund allocation using smart contracts, so that every allocation is transparent and verifiable on-chain.',
    ideas: ['Smart contracts as the allocation authority', 'Consensus validation before funds move', 'A transparency interface for monitoring transactions'],
    url: null as string | null, kind: 'Peer-reviewed', page: null as string | null,
  },
  {
    id: 'paper-blockchain', title: 'Blockchain and Its Applications in the Real World', venue: 'IRJET', venueLong: 'International Research Journal of Engineering and Technology',
    year: 2023, authors: ['R. K. Kona'], domain: 'Distributed systems',
    summary: 'An analysis of where decentralised systems hold up in practice, across finance, governance and digital trust.',
    ideas: ['Finance', 'Governance', 'Digital trust'],
    url: null as string | null, kind: 'Peer-reviewed', page: null as string | null,
  },
  {
    id: 'paper-style', title: 'Advancements in Artistic Style Transfer: From Neural Algorithms to Real-Time Adaptation', venue: 'IRJET', venueLong: 'International Research Journal of Engineering and Technology',
    year: 2023, authors: ['M. B. Kona', 'R. K. Kona'], domain: 'Machine learning · Computer vision',
    summary: 'A survey of neural style transfer, tracing the field from the original CNN-based optimisation methods to adaptive instance normalisation for real-time use.',
    ideas: ['CNN-based neural style transfer', 'Adaptive instance normalisation (AdaIN)', 'Real-time adaptation'],
    url: null as string | null, kind: 'Peer-reviewed', page: null as string | null,
  },
  {
    id: 'paper-vtv', title: 'Where the Time Goes: Profiling, Segmenting and Verifying CPU and GPU Rendering in a Narrated-Video Pipeline', venue: 'Preprint', venueLong: 'Preprint, not yet peer-reviewed',
    year: 2026, authors: ['R. K. Kona'], domain: 'Systems · GPU rendering',
    summary: 'Where render time goes in a Pillow and x264 pipeline, and how to split the work between CPU and GPU. Composition is 54–90% of CPU time depending on content, so hardware encoding is capped at 1.3×. The paper covers frame-exact segmented rendering and a GPU resampler that matches the CPU reference within two levels on two OpenGL implementations, with ablations showing which choices are necessary.',
    ideas: ['Per-content profile: composition 54% (typography) to 90% (transitions) of CPU time', 'Frame-exact segments give resumable, parallel renders', 'Zero-outlier equivalence: 23/23 scenes on a GTX 1650 and on Mesa llvmpipe', 'Ablations: no clamp 23, edge-clamped taps 57, bilinear 84 levels off', 'Two- and four-hour renders with flat memory and exact duration'],
    url: 'papers/voice-to-video-rendering.pdf' as string | null, kind: 'Preprint', page: 'papers/voice-to-video-rendering.html',
  },
];

