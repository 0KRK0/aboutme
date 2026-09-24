/* Stack trace: skills and the evidence behind each.
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

import type { Lane } from './timeline';

/* ── Stack trace: every skill → where it was used ──────────── */
export interface Evidence { id: string; label: string; kind: 'Work' | 'Product' | 'Research' | 'Project' | 'Credential' | 'MSc' | 'Teaching'; lane: Lane }
export const evidence: Evidence[] = [
  { id: 'accenture', label: 'Accenture', kind: 'Work', lane: 'enterprise' },
  { id: 'tss', label: 'Tech Stalwart internship', kind: 'Work', lane: 'enterprise' },
  { id: 'lexora', label: 'LexoraAI', kind: 'Product', lane: 'ai' },
  { id: 'atlas', label: 'Atlas (in progress)', kind: 'Product', lane: 'ai' },
  { id: 'ownvoicz', label: 'ownVoicz (in development)', kind: 'Product', lane: 'ai' },
  { id: 'voicepassport', label: 'Voice Passport (ideathon)', kind: 'Product', lane: 'ai' },
  { id: 'fund', label: 'Fund management system', kind: 'Project', lane: 'systems' },
  { id: 'web3', label: 'Web3 Bookstore', kind: 'Project', lane: 'systems' },
  { id: 'iot', label: 'IoT smart home security', kind: 'Project', lane: 'systems' },
  { id: 'aider', label: 'AIDER', kind: 'Project', lane: 'systems' },
  { id: 'p-fund', label: 'Paper · IJCRT 2024', kind: 'Research', lane: 'research' },
  { id: 'p-chain', label: 'Paper · IRJET 2023 (blockchain)', kind: 'Research', lane: 'research' },
  { id: 'p-style', label: 'Paper · IRJET 2023 (style transfer)', kind: 'Research', lane: 'research' },
  { id: 'c-salesforce', label: 'Salesforce certifications', kind: 'Credential', lane: 'enterprise' },
  { id: 'c-azure', label: 'Microsoft Azure certifications', kind: 'Credential', lane: 'systems' },
  { id: 'c-aws', label: 'AWS Academy + internship', kind: 'Credential', lane: 'systems' },
  { id: 'c-cyber', label: 'Cybersecurity internship', kind: 'Credential', lane: 'systems' },
  { id: 'c-ucsd', label: 'UC San Diego specialization', kind: 'Credential', lane: 'main' },
  { id: 'c-meta', label: 'Meta courses', kind: 'Credential', lane: 'main' },
  { id: 'c-ai', label: 'AI credentials', kind: 'Credential', lane: 'ai' },
  { id: 'm-ml', label: 'MLP + ML Systems', kind: 'MSc', lane: 'main' },
  { id: 'm-bdl', label: 'Blockchains & Distributed Ledgers', kind: 'MSc', lane: 'main' },
  { id: 'm-acp', label: 'Applied Cloud Programming', kind: 'MSc', lane: 'main' },
  { id: 'youtube', label: 'YouTube teaching', kind: 'Teaching', lane: 'main' },
];

export const skills: { group: string; items: { name: string; ev: string[] }[] }[] = [
  { group: 'Salesforce', items: [
    { name: 'Apex', ev: ['accenture', 'c-salesforce'] },
    { name: 'Lightning Web Components', ev: ['accenture', 'c-salesforce'] },
    { name: 'SOQL / SOSL', ev: ['accenture', 'c-salesforce'] },
    { name: 'Flows & triggers', ev: ['accenture', 'c-salesforce'] },
  ] },
  { group: 'Backend & web', items: [
    { name: 'REST / SOAP APIs', ev: ['accenture', 'web3', 'voicepassport'] },
    { name: 'JavaScript', ev: ['lexora', 'tss', 'c-meta'] },
    { name: 'React', ev: ['tss', 'c-meta'] },
    { name: 'Node.js', ev: ['voicepassport'] },
    { name: 'Express · Next.js', ev: [] },
  ] },
  { group: 'AI / ML', items: [
    { name: 'LLM product development', ev: ['lexora', 'atlas', 'ownvoicz'] },
    { name: 'Agentic AI', ev: ['atlas', 'c-ai'] },
    { name: 'Applied ML', ev: ['p-style', 'c-azure', 'm-ml'] },
    { name: 'Computer vision', ev: ['iot', 'p-style'] },
  ] },
  { group: 'Cloud & DevOps', items: [
    { name: 'AWS (EC2, S3)', ev: ['c-aws', 'tss', 'm-acp'] },
    { name: 'Azure & Azure DevOps', ev: ['c-azure'] },
    { name: 'Cloudflare', ev: ['lexora'] },
    { name: 'Git & CI/CD', ev: ['c-meta', 'c-azure'] },
  ] },
  { group: 'Security & blockchain', items: [
    { name: 'Solidity & smart contracts', ev: ['fund', 'p-fund', 'm-bdl'] },
    { name: 'Distributed ledgers', ev: ['p-chain', 'p-fund', 'web3', 'aider', 'm-bdl'] },
    { name: 'Network security & crypto', ev: ['c-cyber', 'aider'] },
    { name: 'Consent & authorization design', ev: ['voicepassport', 'atlas'] },
    { name: 'IoT', ev: ['iot'] },
  ] },
  { group: 'Foundations', items: [
    { name: 'Java', ev: ['c-ucsd'] },
    { name: 'Python', ev: ['m-ml'] },
    { name: 'Data structures & algorithms', ev: ['c-ucsd', 'youtube'] },
    { name: 'Databases (SQL, MongoDB, SQLite)', ev: ['web3', 'accenture'] },
  ] },
];

