/* Projects: every build, one registry.
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. Leave a field null rather than
   guessing: the UI shows "not added yet" states. */

import type { Lane } from './timeline';

export type ProjectStatus = 'shipped' | 'in-progress' | 'in-development' | 'prototype' | 'archive';

export interface Project {
  id: string;
  /** Short command name used by the terminal: `open <cmd>` */
  cmd: string;
  name: string;
  lane: Lane;
  status: ProjectStatus;
  statusLabel: string;
  period: string;
  /** Section on the web page. */
  anchor: string;
  summary: string;
  facts: string[];
  /** Only technologies confirmed by source code or the CV. */
  tech: string[];
  links: { label: string; url: string; note?: string }[];
}

export const projects: Project[] = [
  {
    id: 'lexora', cmd: 'lexora', name: 'LexoraAI', lane: 'ai', status: 'shipped', statusLabel: 'Live · open-source release in preparation', period: '2025 – present', anchor: 'lexora',
    summary: 'A privacy-first AI document workspace: read-aloud with karaoke highlighting, voice commands, an AI companion that explains selected text, and 40+ document tools.',
    facts: ['100K+ pageviews', '6.7M+ requests served (Cloudflare analytics)', 'Built solo: front end, back end, LLM integration, hosting, analytics', 'Free tools run in the browser; server features ask first and delete afterwards'],
    tech: ['LLM integration', 'In-browser document processing', 'Cloudflare'],
    links: [{ label: 'lexoraai.online', url: 'https://lexoraai.online' }],
  },
  {
    id: 'atlas', cmd: 'atlas', name: 'Atlas', lane: 'ai', status: 'in-progress', statusLabel: 'Design and build in progress · not released', period: 'now', anchor: 'atlas',
    summary: 'An evolving enterprise AI automation architecture that grows out of the LexoraAI work: agents act through tools, every action is checked, risky ones wait for a person, and everything is audited.',
    facts: ['LLM gateway with bring-your-own enterprise credentials', 'Durable workflows on LangGraph', 'Agents act through MCP tools', 'Verification, risk scoring, human approval, audit log', 'Multi-tenancy, persistence, billing'],
    tech: ['LangGraph', 'MCP'],
    links: [],
  },
  {
    id: 'ownvoicz', cmd: 'ownvoicz', name: 'ownVoicz', lane: 'ai', status: 'in-development', statusLabel: 'In development · intended for open-source release', period: '2025 – present', anchor: 'ownvoicz',
    summary: 'Own your voice. Use it anywhere. Voice ID at the centre, with five planned pillars: Voice Studio, Voice Platform, Voice SDK, Offline Runtime and AI Research.',
    facts: ['Voice ID as the identity primitive', 'Pillars are roadmap, not released features'],
    tech: [],
    links: [{ label: 'ownvoicz.com', url: 'https://ownvoicz.com' }],
  },
  {
    id: 'voicepassport', cmd: 'voicepassport', name: 'Voice Passport', lane: 'ai', status: 'prototype', statusLabel: 'Ideathon prototype · Aug 2026', period: 'Aug 2026', anchor: 'voicepassport',
    summary: 'A portable consent layer for AI voices. Creators define exactly how their voice may be used; AI applications request, get checked against that policy, and receive scoped, time-limited permission. Every decision leaves a receipt.',
    facts: ['Submitted to the AI Passport Ideathon on Devpost', 'Participated · no award claimed', 'Working prototype with a REST API and creator dashboard'],
    tech: ['Node.js (http server)', 'REST API', 'JSON-file persistence', 'Vanilla JavaScript', 'HTML/CSS'],
    links: [
      { label: 'GitHub', url: 'https://github.com/0KRK0/Egoist-Ideathon-Submission' },
      { label: 'Devpost', url: 'https://devpost.com/software/voice-umlk3g' },
      { label: 'Live demo', url: 'https://voice-passport-egoist-ideathon.onrender.com', note: 'free hosting; the first load can take a minute or two' },
    ],
  },
  {
    id: 'vtv', cmd: 'vtv', name: 'Voice-to-Video', lane: 'ai', status: 'in-development', statusLabel: 'In development · source on GitHub · research preprint', period: '2026 – present', anchor: 'vtv',
    summary: 'Speak, paste a script or drop in a document, and get a narrated video back: scenes planned from meaning, visuals chosen with a written reason, captions and credits included. Most of the engineering went into rendering, which is the one cost that grows with the length of the video.',
    facts: ['Python: 173 source files, 63,528 lines, 1,708 test functions', 'Segmented, resumable, parallel rendering; two- and four-hour renders validated', 'OpenGL 3.3 GPU compositor within 2 levels of the CPU reference on 23 of 23 scenes', 'Renders on the user\'s own paired computer or in the cloud', 'Rendering research written up as a preprint (not yet peer-reviewed)'],
    tech: ['Python 3.11', 'Pydantic', 'Starlette', 'FFmpeg / x264', 'Pillow', 'NumPy', 'OpenGL 3.3 (moderngl)', 'SQLite (WAL)', 'TypeScript', 'Docker'],
    links: [
      { label: 'GitHub', url: 'https://github.com/0KRK0/Voice-to-Video' },
      { label: 'Read the paper (PDF)', url: 'papers/voice-to-video-rendering.pdf' },
    ],
  },
  {
    id: 'fund', cmd: 'fund', name: 'Blockchain-Based Fund Management System', lane: 'systems', status: 'archive', statusLabel: 'BTech · published 2024', period: 'BTech', anchor: 'archive',
    summary: 'Solidity smart contracts for decentralised fund allocation, with consensus-validation mechanisms and a transaction-transparency monitoring interface.',
    facts: ['Also published as a paper in IJCRT'], tech: ['Solidity', 'Smart contracts'], links: [],
  },
  {
    id: 'web3', cmd: 'web3', name: 'Web3 Bookstore', lane: 'systems', status: 'archive', statusLabel: 'BTech · IEEE Soft-con Expo', period: 'BTech', anchor: 'archive',
    summary: 'A decentralised bookstore with wallet-based authentication. I designed the backend APIs and database integration.',
    facts: ['Presented at IEEE Soft-con Expo'], tech: ['Wallet authentication', 'Backend APIs', 'Databases'], links: [],
  },
  {
    id: 'iot', cmd: 'smarthome', name: 'IoT Smart Home Security System', lane: 'systems', status: 'archive', statusLabel: 'BTech', period: 'BTech', anchor: 'archive',
    summary: 'Facial-recognition access control wired to IoT sensors, with a backend that sends alert notifications.',
    facts: [], tech: ['IoT sensors', 'Facial recognition'], links: [],
  },
  {
    id: 'aider', cmd: 'aider', name: 'AIDER', lane: 'systems', status: 'archive', statusLabel: 'BTech · Innovation Fair, JNTU Kakinada', period: 'BTech', anchor: 'archive',
    summary: 'A blockchain-integrated architecture for securing medical records, with a decentralised model for validating patient data.',
    facts: ['Prototype presented at the Innovation Fair, JNTU Kakinada'], tech: ['Blockchain'], links: [],
  },
];

export const projectById = (id: string) => projects.find(p => p.id === id || p.cmd === id);

/* ── Atlas: design stages (work in progress) ───────────────── */
export const atlasStages = [
  { id: 'request', name: 'Request', detail: 'A tenant submits a task in plain language.', group: 'edge' },
  { id: 'gateway', name: 'LLM gateway', detail: 'Routes model calls per tenant, with bring-your-own enterprise LLM and API credentials.', group: 'edge' },
  { id: 'orchestrator', name: 'Orchestrator', detail: 'Durable workflows built on LangGraph, so long-running tasks survive restarts and resume where they stopped.', group: 'core' },
  { id: 'agents', name: 'Agents + MCP tools', detail: 'Agents act through tools exposed over the Model Context Protocol instead of ad-hoc integrations.', group: 'core' },
  { id: 'verify', name: 'Verify & risk', detail: 'Each proposed action is checked and scored for risk before anything touches a real system.', group: 'control' },
  { id: 'approval', name: 'Human approval', detail: 'Risky actions pause for a person to approve or reject.', group: 'control' },
  { id: 'audit', name: 'Audit log', detail: 'Every decision, approval and action is recorded, so the system can be audited later.', group: 'control' },
];
export const atlasRails = ['multi-tenancy', 'persistence', 'billing'];

/* ── ownVoicz: planned pillars around the Voice ID primitive ── */
export const voicePillars = [
  { id: 'studio', name: 'Voice Studio', detail: 'Where a person creates and manages their own voice.' },
  { id: 'platform', name: 'Voice Platform', detail: 'Hosted infrastructure to use that voice across applications.' },
  { id: 'sdk', name: 'Voice SDK', detail: 'Developer access, so other apps can use a voice with its owner’s permission.' },
  { id: 'runtime', name: 'Offline Runtime', detail: 'Running voice models on-device, without a network connection.' },
  { id: 'research', name: 'AI Research', detail: 'The model work underneath: quality, efficiency and safety of voice generation.' },
];

/* ── Earlier builds (archive cards on the web page) ───────── */
export const archive = [
  { id: 'fund', lane: 'systems' as Lane, name: 'Blockchain-Based Fund Management System', era: 'BTech · published 2024',
    what: 'Solidity smart contracts for decentralised fund allocation, with consensus-validation mechanisms and a transaction-transparency monitoring interface.',
    tags: ['Solidity', 'smart contracts', 'consensus validation'], note: 'Also published as a paper in IJCRT.' },
  { id: 'web3', lane: 'systems' as Lane, name: 'Web3 Bookstore', era: 'BTech · IEEE Soft-con Expo',
    what: 'A decentralised bookstore with wallet-based authentication. I designed the backend APIs and database integration.',
    tags: ['wallet auth', 'backend APIs', 'databases'], note: 'Presented at IEEE Soft-con Expo.' },
  { id: 'iot', lane: 'systems' as Lane, name: 'IoT Smart Home Security System', era: 'BTech',
    what: 'Facial-recognition access control wired to IoT sensors, with a backend that sends alert notifications.',
    tags: ['IoT sensors', 'facial recognition', 'access control'], note: null },
  { id: 'aider', lane: 'systems' as Lane, name: 'AIDER', era: 'BTech · Innovation Fair, JNTU Kakinada',
    what: 'A blockchain-integrated architecture for securing medical records, with a decentralised model for validating patient data.',
    tags: ['blockchain', 'health data', 'validation'], note: 'Prototype presented at the Innovation Fair, JNTU Kakinada.' },
];

/* ── Voice Passport: from the Devpost write-up and the public repo ── */
export const voicePassport = {
  event: 'AI Passport Ideathon',
  eventUrl: 'https://ai-passport-ideathon.devpost.com/',
  when: 'August 2026 · one-week online ideathon',
  outcome: 'Participated in the AI Passport Ideathon. No award claimed.',
  problem: 'Synthetic voices are now fast and cheap to generate, but consent has not kept up. A creator may happily license their voice for a game character yet refuse model training, advertising or resale, and when a voice moves between platforms, those choices do not travel with it.',
  concept: 'A passport that carries the creator’s rules with the voice. AI applications never get blanket access: they ask for a specific purpose, the request is checked against the creator’s policy, and approval grants a scoped authorization that expires and can be revoked.',
  flow: [
    'Creator registers a voice and sets what it may be used for',
    'An AI application requests access for one specific purpose',
    'The request is checked against the creator’s policy',
    'The creator approves or denies',
    'Approval grants a scoped authorization with an expiry',
    'The authorization can be revoked at any time',
    'A receipt records every request and decision',
  ],
  architecture: [
    { name: 'Creator dashboard', detail: 'Vanilla JS single-page UI: dashboard, request inbox and permission policy.' },
    { name: 'REST API', detail: 'Plain Node.js http server: GET state, voices, permissions, requests, authorizations, receipts; POST approve, deny, revoke, reset.' },
    { name: 'Policy check', detail: 'Each request is shown against the voice’s policy: allowed, denied, or requires approval.' },
    { name: 'Authorizations', detail: 'Approval creates AUTH-… with an expiry date derived from the requested duration. Expired ones flip to EXPIRED automatically.' },
    { name: 'Receipts', detail: 'Every decision writes a VPR-YYYY-… receipt with the decision and reason.' },
    { name: 'Storage', detail: 'A JSON file on the server, seeded with a demo voice and two requests. Reset restores the seed.' },
  ],
  built: ['Creator dashboard with active authorizations, pending requests and receipts', 'Request inbox with approve / deny', 'Six-rule consent policy (allowed, denied, requires approval)', 'Time-limited authorizations that expire', 'Revocation', 'Audit receipts for every decision', 'One-click demo reset'],
  lessons: [
    'Portable trust is less about proving who owns a voice and more about proving that one application is allowed to do one thing with it.',
    'Allow / deny is not enough. Creators need purpose, scope, restrictions, expiry and revocation, and all of it still has to be easy to understand.',
  ],
  next: 'Connect to real AI voice providers, so an authorization is checked before any synthetic speech is generated.',
  policy: [
    { label: 'Game dialogue', status: 'ALLOWED' },
    { label: 'Personal projects', status: 'ALLOWED' },
    { label: 'AI model training', status: 'DENIED' },
    { label: 'Resale', status: 'DENIED' },
    { label: 'Political advertising', status: 'DENIED' },
    { label: 'Commercial advertising', status: 'REQUIRES APPROVAL' },
  ],
  requests: [
    { id: 'REQ-GAME-2048', requester: 'GameStudio AI', purpose: 'Game character dialogue', policy: 'Game dialogue', action: 'Synthetic voice generation', days: 90, training: false, resale: false,
      approveReason: 'Purpose is permitted under this Voice Passport.' },
    { id: 'REQ-AD-2051', requester: 'AdStudio AI', purpose: 'Commercial advertising', policy: 'Commercial advertising', action: 'Synthetic voice generation for advertisement', days: 30, training: false, resale: false,
      denyReason: 'Commercial advertising is not currently authorized.' },
  ],
};

/** Shared themes between Voice Passport and ownVoicz. They are separate projects. */
export const voiceThemes = [
  { id: 'identity', label: 'Voice identity', in: ['voicepassport', 'ownvoicz'] },
  { id: 'consent', label: 'Creator consent', in: ['voicepassport', 'ownvoicz'] },
  { id: 'scoped', label: 'Scoped, time-limited permission', in: ['voicepassport'] },
  { id: 'revoke', label: 'Revocation', in: ['voicepassport'] },
  { id: 'receipts', label: 'Audit receipts', in: ['voicepassport'] },
  { id: 'infra', label: 'Voice infrastructure', in: ['ownvoicz'] },
  { id: 'sdk', label: 'SDK + offline runtime', in: ['ownvoicz'] },
];


/* ── Voice-to-Video: details for its section. Every figure is from the public
   repository (code, docs, reports, the diagnosis run) and is traced to its
   source in the paper. ── */
export const vtv = {
  /** Flip `public` to true once the repository is public and licensed; the GitHub button appears then. */
  repo: { url: 'https://github.com/0KRK0/Voice-to-Video', public: true },
  pipeline: [
    { name: 'Capture', detail: 'A recording, a pasted script or a document (PDF, DOCX, PPTX, TXT).' },
    { name: 'Understand', detail: 'Transcript → units of meaning → scenes grouped by idea, not by sentence.' },
    { name: 'Direct', detail: 'For each scene the Visual Director picks drawn, licensed or generated visuals, and writes down why.' },
    { name: 'Ground', detail: 'Every number, date or place in a drawn visual must trace back to the source, or the scene degrades.' },
    { name: 'Compose', detail: 'A timeline timed to the narration. The voice is the only clock.' },
    { name: 'Render', detail: 'Frames drawn, encoded in 12-second segments, stitched with the narration into an MP4 plus captions.' },
  ],
  profile: { compose: 77, encode: 23, text: 0.7, fpsBefore: 12, fpsAfter: 26 },
  steps: [
    { title: 'Profile first', text: 'On a real 1080p timeline, composing frames took 77% of render time and x264 took 23%. Text was only 0.7% of composition. The cost was moving full-frame buffers around.' },
    { title: 'Remove wasted work', text: 'Most of that buffer work was redundant. Removing it took composition from 12 to 26 frames a second on the same hardware.' },
    { title: 'Segment the render', text: 'Twelve-second segments, cut on exact frame indices. A finished segment is a file whose name says so, so a crash loses at most one segment, and segments run in parallel across processes.' },
    { title: 'Skip hardware encoding', text: 'NVENC replaces only the 23%. Amdahl caps that at 1.3×, and consumer drivers limit concurrent encode sessions, which fights the process pool.' },
    { title: 'Move only resampling to the GPU', text: 'An OpenGL 3.3 painter does the expensive, parallel part: Lanczos-3 resampling of photographs. Text, overlays and transitions stay on the CPU reference so they match exactly.' },
    { title: 'Prove it matches', text: 'No channel may differ from the CPU by more than 2, and no pixel may exceed that. The first run on a GTX 1650 passed 15 of 23 scenes; after four fixes, 23 of 23.' },
  ],
  defects: [
    { n: 1, what: 'Framebuffer read bottom-up', evidence: 'A plate at rows 11–50 differed across rows 11–169: itself and its mirror.' },
    { n: 2, what: 'Cleared to black, not the theme background', evidence: '18,432 of the 20,736 differing pixels in one scene.' },
    { n: 3, what: 'Picture drawn at its box, not the clamped cover box', evidence: 'The other 2,304 pixels, a nine-row band.' },
    { n: 4, what: 'Overlays alpha-composited instead of replaced', evidence: 'Overlay scenes off by 193. Now drawn by the reference.' },
  ],
  /** Images exist only from an earlier FAILING run (the diagnosis script saves
      images only for failing scenes); "before" is recomputed from those PNGs,
      "after" is the final passing report.json. */
  frames: [
    { id: 'picture', label: 'Photograph', before: { worst: 19, over: 419 }, after: { worst: 2, mad: 0.07 } },
    { id: 'picture-zoomed', label: 'Zoom', before: { worst: 22, over: 277 }, after: { worst: 2, mad: 0.052 } },
    { id: 'overlay-over-picture', label: 'Overlay', before: { worst: 17, over: 379 }, after: { worst: 2, mad: 0.064 } },
    { id: 'wipe-50', label: 'Wipe 50%', before: { worst: 23, over: 339 }, after: { worst: 2, mad: 0.054 } },
    { id: 'push-50', label: 'Push 50%', before: { worst: 23, over: 329 }, after: { worst: 2, mad: 0.055 } },
  ],
  longRuns: [
    { video: '120 min', render: '142.0 min', segments: 600, gpu: 598, rss: '465 MB', slope: '−0.095 MB/segment', vram: '505 MB', error: '0.00 s' },
    { video: '240 min', render: '341.4 min', segments: 1200, gpu: 1198, rss: '471 MB', slope: '−0.113 MB/segment', vram: '916 MB', error: '0.00 s' },
  ],
  honest: [
    'GPU speed was only timed informally during development (photographs about 11.6× faster on the card, typography 2.2× slower). No controlled measurement yet, so no speed-up is claimed.',
    'All GPU evidence comes from one GeForce GTX 1650.',
    'The long renders used a synthetic fixture, not real footage.',
  ],
};
