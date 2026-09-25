/* Research: peer-reviewed publications, plus technical reports (labelled as such).
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

/* ── Research ──────────────────────────────────────────────── */
export const papers = [
  {
    id: 'paper-fund', title: 'Blockchain Based Fund Management System', venue: 'IJCRT', venueLong: 'International Journal of Creative Research Thoughts',
    year: 2024, authors: ['R. K. Kona'], domain: 'Blockchain · Smart contracts',
    summary: 'Secure, decentralised fund allocation using smart contracts, so that every allocation is transparent and verifiable on-chain.',
    ideas: ['Smart contracts as the allocation authority', 'Consensus validation before funds move', 'A transparency interface for monitoring transactions'],
    url: null as string | null, kind: 'Peer-reviewed',
  },
  {
    id: 'paper-blockchain', title: 'Blockchain and Its Applications in the Real World', venue: 'IRJET', venueLong: 'International Research Journal of Engineering and Technology',
    year: 2023, authors: ['R. K. Kona'], domain: 'Distributed systems',
    summary: 'An analysis of where decentralised systems hold up in practice, across finance, governance and digital trust.',
    ideas: ['Finance', 'Governance', 'Digital trust'],
    url: null as string | null, kind: 'Peer-reviewed',
  },
  {
    id: 'paper-style', title: 'Advancements in Artistic Style Transfer: From Neural Algorithms to Real-Time Adaptation', venue: 'IRJET', venueLong: 'International Research Journal of Engineering and Technology',
    year: 2023, authors: ['M. B. Kona', 'R. K. Kona'], domain: 'Machine learning · Computer vision',
    summary: 'A survey of neural style transfer, tracing the field from the original CNN-based optimisation methods to adaptive instance normalisation for real-time use.',
    ideas: ['CNN-based neural style transfer', 'Adaptive instance normalisation (AdaIN)', 'Real-time adaptation'],
    url: null as string | null, kind: 'Peer-reviewed',
  },
  {
    id: 'paper-vtv', title: 'Where the Time Goes: CPU and GPU Rendering in a Narrated-Video Pipeline', venue: 'Voice-to-Video', venueLong: 'Technical report, not peer-reviewed',
    year: 2026, authors: ['R. K. Kona'], domain: 'Systems · GPU rendering',
    summary: 'How Voice-to-Video renders: profiling a Pillow and x264 pipeline, why hardware encoding was capped at 1.3×, segmented and resumable rendering, and an OpenGL compositor that matches the CPU reference within two levels per channel. Every number is traced to a file in the repository.',
    ideas: ['77% composition / 23% encoding, so Amdahl caps NVENC at 1.3×', 'Two-pass Lanczos-3 shader with an 8-bit intermediate to match Pillow', 'Zero-outlier equivalence rule: 15/23 scenes on first contact, 23/23 after four fixes', 'Two- and four-hour renders with flat memory and exact duration'],
    url: 'papers/voice-to-video-rendering.pdf' as string | null, kind: 'Technical report',
  },
];

