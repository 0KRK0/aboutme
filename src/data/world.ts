/* Rajesh World: zones, exhibits and quests.
   Part of the portfolio's data layer. The world engine lays buildings and
   exhibits out automatically around each zone centre, so adding an exhibit
   here is enough for it to appear in the game. */

import type { Lane } from './timeline';

export type BuildingKind = 'hall' | 'pavilion' | 'towers' | 'vault' | 'library' | 'gothic' | 'lab' | 'dome' | 'studio';
export type PropKind = 'terminal' | 'plinth' | 'book' | 'pylon' | 'kiosk' | 'door' | 'banner';

/** What pressing E on an exhibit shows. `ref` points into the other data files. */
export type Ref =
  | { type: 'project'; id: string }
  | { type: 'paper'; id: string }
  | { type: 'award'; index: number }
  | { type: 'channel'; index: number }
  | { type: 'pillar'; id: string }
  | { type: 'custom'; id: string };

export interface Exhibit { id: string; label: string; kind: PropKind; ref: Ref }

export interface Zone {
  id: string;
  key: number;
  name: string;
  lane: Lane;
  /** Degrees clockwise from the top of the screen, around the central hub. */
  angle: number;
  tagline: string;
  building: { kind: BuildingKind; label: string; w: number; d: number; h: number };
  exhibits: Exhibit[];
}

export const worldHub = {
  name: 'RAJESH',
  tagline: 'Central hub. Every path starts here.',
};

export const zones: Zone[] = [
  {
    id: 'archive', key: 1, name: 'Project Archive', lane: 'systems', angle: -20, tagline: 'Where the BTech builds are kept.',
    building: { kind: 'hall', label: 'PROJECT ARCHIVE', w: 6, d: 3, h: 46 },
    exhibits: [
      { id: 'fund', label: 'Fund Management System', kind: 'plinth', ref: { type: 'project', id: 'fund' } },
      { id: 'web3', label: 'Web3 Bookstore', kind: 'plinth', ref: { type: 'project', id: 'web3' } },
      { id: 'iot', label: 'Smart Home Security', kind: 'plinth', ref: { type: 'project', id: 'iot' } },
      { id: 'aider', label: 'AIDER', kind: 'plinth', ref: { type: 'project', id: 'aider' } },
      { id: 'vp-archive', label: 'Voice Passport', kind: 'plinth', ref: { type: 'project', id: 'voicepassport' } },
    ],
  },
  {
    id: 'achievements', key: 2, name: 'Achievements Hall', lane: 'main', angle: 20, tagline: 'Recognition, each kind labelled for what it is.',
    building: { kind: 'pavilion', label: 'ACHIEVEMENTS', w: 4, d: 4, h: 58 },
    exhibits: [
      { id: 'aw-rank', label: 'Rank 2 / 66 · GPA 8.65', kind: 'plinth', ref: { type: 'award', index: 2 } },
      { id: 'aw-client', label: 'Client recognition', kind: 'plinth', ref: { type: 'award', index: 0 } },
      { id: 'aw-cheer', label: 'Cheer Award', kind: 'plinth', ref: { type: 'award', index: 1 } },
      { id: 'aw-entered', label: 'Competitions entered', kind: 'kiosk', ref: { type: 'custom', id: 'entered' } },
      { id: 'aw-olympiad', label: 'Mathematics Olympiad', kind: 'plinth', ref: { type: 'award', index: 4 } },
      { id: 'aw-design', label: 'Design Venture Challenge', kind: 'plinth', ref: { type: 'award', index: 3 } },
    ],
  },
  {
    id: 'enterprise', key: 3, name: 'Enterprise District', lane: 'enterprise', angle: 60, tagline: 'Accenture: production systems under SLA.',
    building: { kind: 'towers', label: 'ENTERPRISE', w: 5, d: 3, h: 110 },
    exhibits: [
      { id: 'enterprise-impact', label: 'Production terminal', kind: 'terminal', ref: { type: 'custom', id: 'impact' } },
      { id: 'crm', label: 'CRM Systems', kind: 'kiosk', ref: { type: 'custom', id: 'crm' } },
      { id: 'integrations', label: 'API Integrations', kind: 'kiosk', ref: { type: 'custom', id: 'integrations' } },
      { id: 'quality', label: 'Quality: the pre-release catch', kind: 'kiosk', ref: { type: 'custom', id: 'quality' } },
      { id: 'tss', label: 'Before Accenture', kind: 'kiosk', ref: { type: 'custom', id: 'tss' } },
    ],
  },
  {
    id: 'vault', key: 4, name: 'Certification Vault', lane: 'systems', angle: 100, tagline: 'Every credential, with its ID and verify link.',
    building: { kind: 'vault', label: 'VAULT', w: 4, d: 4, h: 54 },
    exhibits: [
      { id: 'vault-door', label: 'Open the vault', kind: 'door', ref: { type: 'custom', id: 'vault' } },
    ],
  },
  {
    id: 'library', key: 5, name: 'Research Library', lane: 'research', angle: 140, tagline: 'Three peer-reviewed papers and a preprint.',
    building: { kind: 'library', label: 'LIBRARY', w: 5, d: 3, h: 52 },
    exhibits: [
      { id: 'paper-fund', label: 'Fund Management (IJCRT 2024)', kind: 'book', ref: { type: 'paper', id: 'paper-fund' } },
      { id: 'paper-blockchain', label: 'Blockchain in the Real World (IRJET 2023)', kind: 'book', ref: { type: 'paper', id: 'paper-blockchain' } },
      { id: 'paper-style', label: 'Artistic Style Transfer (IRJET 2023)', kind: 'book', ref: { type: 'paper', id: 'paper-style' } },
      { id: 'paper-vtv', label: 'CPU and GPU Rendering (preprint)', kind: 'book', ref: { type: 'paper', id: 'paper-vtv' } },
    ],
  },
  {
    id: 'edinburgh', key: 6, name: 'Edinburgh', lane: 'main', angle: 180, tagline: 'HEAD. MSc Computer Science, 2026–2027.',
    building: { kind: 'gothic', label: 'EDINBURGH', w: 4, d: 4, h: 130 },
    exhibits: [
      { id: 'msc', label: 'MSc Computer Science', kind: 'banner', ref: { type: 'custom', id: 'msc' } },
      { id: 'modules', label: 'This year’s modules', kind: 'kiosk', ref: { type: 'custom', id: 'modules' } },
      { id: 'dissertation', label: 'Dissertation (2027)', kind: 'kiosk', ref: { type: 'custom', id: 'dissertation' } },
    ],
  },
  {
    id: 'voice', key: 7, name: 'Voice Lab', lane: 'ai', angle: 220, tagline: 'Two separate voice projects, asking related questions.',
    building: { kind: 'lab', label: 'VOICE LAB', w: 5, d: 3, h: 60 },
    exhibits: [
      { id: 'ownvoicz', label: 'ownVoicz', kind: 'terminal', ref: { type: 'project', id: 'ownvoicz' } },
      { id: 'voice-id', label: 'Voice ID', kind: 'pylon', ref: { type: 'custom', id: 'voiceid' } },
      { id: 'vp-lab', label: 'Voice Passport', kind: 'terminal', ref: { type: 'project', id: 'voicepassport' } },
      { id: 'pillar-studio', label: 'Voice Studio', kind: 'pylon', ref: { type: 'pillar', id: 'studio' } },
      { id: 'pillar-platform', label: 'Voice Platform', kind: 'pylon', ref: { type: 'pillar', id: 'platform' } },
      { id: 'pillar-sdk', label: 'Voice SDK', kind: 'pylon', ref: { type: 'pillar', id: 'sdk' } },
      { id: 'pillar-runtime', label: 'Offline Runtime', kind: 'pylon', ref: { type: 'pillar', id: 'runtime' } },
      { id: 'pillar-research', label: 'AI Research', kind: 'pylon', ref: { type: 'pillar', id: 'research' } },
    ],
  },
  {
    id: 'ailab', key: 8, name: 'AI Lab', lane: 'ai', angle: 260, tagline: 'LexoraAI, Atlas, Voice-to-Video and the ML work.',
    building: { kind: 'dome', label: 'AI LAB', w: 4, d: 4, h: 64 },
    exhibits: [
      { id: 'lexora', label: 'LexoraAI', kind: 'terminal', ref: { type: 'project', id: 'lexora' } },
      { id: 'atlas', label: 'Atlas', kind: 'terminal', ref: { type: 'project', id: 'atlas' } },
      { id: 'vtv', label: 'Voice-to-Video', kind: 'terminal', ref: { type: 'project', id: 'vtv' } },
      { id: 'render-bench', label: 'Render bench: CPU vs GPU', kind: 'kiosk', ref: { type: 'custom', id: 'renderbench' } },
      { id: 'agentic', label: 'Agentic AI', kind: 'kiosk', ref: { type: 'custom', id: 'agentic' } },
      { id: 'ml', label: 'Machine Learning', kind: 'kiosk', ref: { type: 'custom', id: 'ml' } },
      { id: 'llm', label: 'LLM Systems', kind: 'kiosk', ref: { type: 'custom', id: 'llm' } },
    ],
  },
  {
    id: 'studio', key: 9, name: 'YouTube Studio', lane: 'main', angle: 300, tagline: 'Build. Learn. Explain.',
    building: { kind: 'studio', label: 'STUDIO', w: 4, d: 3, h: 44 },
    exhibits: [
      { id: 'ch-dsa', label: 'DSA Daily', kind: 'kiosk', ref: { type: 'channel', index: 0 } },
      { id: 'ch-infinite', label: 'The Infinite Machine', kind: 'kiosk', ref: { type: 'channel', index: 1 } },
      { id: 'ch-uk', label: 'UK Diaries Telugu', kind: 'kiosk', ref: { type: 'channel', index: 2 } },
    ],
  },
];

/** Hidden on purpose: not on the map, not in the zone list. */
export const secretSpot = { id: 'secret', label: 'An old build server', x: 12.5, y: 12.5 };

export const quests = [
  { id: 'q1', title: 'Discover my career', hint: 'The Enterprise District has a production terminal.', needs: ['enterprise-impact'] },
  { id: 'q2', title: 'Find LexoraAI', hint: 'Somewhere in the AI Lab.', needs: ['lexora'] },
  { id: 'q3', title: 'Explore Voice Passport', hint: 'It appears in two places.', needs: ['vp-lab|vp-archive'] },
  { id: 'q4', title: 'Find all three research papers', hint: 'Libraries keep papers.', needs: ['paper-fund', 'paper-blockchain', 'paper-style'] },
  { id: 'q5', title: 'Discover the hidden terminal', hint: 'Not every machine is on the map.', needs: ['secret'] },
  { id: 'q6', title: 'Find the Edinburgh area', hint: 'Follow the path to HEAD.', needs: ['zone:edinburgh'] },
];

/** Things the progress panel counts. */
export const progressGoals = {
  projects: ['lexora', 'atlas', 'ownvoicz', 'voicepassport', 'fund', 'web3', 'iot', 'aider'],
  papers: ['paper-fund', 'paper-blockchain', 'paper-style'],
};

/** Optional art. Drop images in public/world/ and list them here; the engine uses them when present. */
export const worldAssets = {
  /** Shown behind the intro text, e.g. a Higgsfield render exported as .webp */
  introBackdrop: null as string | null,
};
