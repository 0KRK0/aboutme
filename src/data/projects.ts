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
