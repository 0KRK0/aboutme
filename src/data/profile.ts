/* Profile: identity, links, channels.
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

export const site = {
  url: 'https://0krk0.github.io/',
  name: 'Rajesh Kumar Kona',
  shortName: 'Rajesh',
  role: 'Software Engineer',
  focus: 'Enterprise Systems · Applied AI · Distributed Systems',
  location: 'Edinburgh, United Kingdom',
  title: 'Rajesh Kumar Kona · Software Engineer · AI · Systems',
  description:
    'Software engineer with two years of enterprise engineering at Accenture, builder of LexoraAI (6.7M+ requests served), three peer-reviewed publications, now studying MSc Computer Science at the University of Edinburgh.',
  email: 'konarajeshkumar011@gmail.com',
  links: {
    github: 'https://github.com/0krk0',
    linkedin: 'https://www.linkedin.com/in/rajesh-kumar-kona-649702240',
    trailblazer: 'https://www.salesforce.com/trailblazer/rajeshkumarkrk',
    lexora: 'https://lexoraai.online',
    ownvoicz: 'https://ownvoicz.com',
  },
  /** Put a PDF of your CV at public/Rajesh_Kumar_Kona_CV.pdf and set this to its path. */
  cvPath: null as string | null,
};

/** What `whoami` prints and the world's info panel shows. Only stated facts. */
export const identity = {
  name: 'Rajesh Kumar Kona',
  role: 'Software Engineer',
  focusLine: 'Enterprise Systems / Applied AI',
  location: 'Edinburgh, UK',
  currently: ['MSc Computer Science', 'University of Edinburgh, 2026–2027'],
  background: '2+ years of enterprise software engineering at Accenture',
  focus: ['AI', 'Systems', 'Distributed computing', 'Security', 'Product engineering'],
};

/* ── Teaching ──────────────────────────────────────────────── */
export const channels = [
  { handle: '@KRK0010', name: 'DSA Daily', topic: 'Data structures and algorithms, from scratch.', url: 'https://www.youtube.com/@KRK0010', mode: 'Learn' },
  { handle: '@KRK017', name: 'The Infinite Machine', topic: 'Computer science and technical explanations.', url: 'https://www.youtube.com/@KRK017', mode: 'Explain' },
  { handle: '@EdinburghDiariesTelugu', name: 'UK Diaries Telugu', topic: 'The Edinburgh MSc journey, documented in Telugu.', url: 'https://www.youtube.com/@EdinburghDiariesTelugu', mode: 'Build' },
];

