/* Experience: Accenture impact, the defect case study, internship.
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

export const numbers = [
  { value: 2, suffix: '+', label: 'years of enterprise engineering', note: 'Accenture, Aug 2024 – Sep 2026' },
  { value: 170, suffix: '+', label: 'production contributions', note: 'Accenture' },
  { value: 20, suffix: '+', label: 'critical defects resolved', note: 'within SLA' },
  { value: 100, suffix: 'K+', label: 'LexoraAI pageviews', note: 'Cloudflare analytics' },
  { value: 6.7, suffix: 'M+', label: 'requests served', note: 'LexoraAI, Cloudflare analytics', decimals: 1 },
  { value: 3, suffix: '', label: 'peer-reviewed publications', note: 'IJCRT, IRJET ×2' },
];

export const pipeline = [
  { stage: 'Development', text: 'A change is built for an upcoming client release.' },
  { stage: 'Testing', text: 'It moves through the pipeline towards release.' },
  { stage: 'Defect found', text: 'Before release, I identify a critical defect in it.', alert: true },
  { stage: 'Root cause', text: 'I find what is actually causing it.' },
  { stage: 'Fix', text: 'I resolve the defect.' },
  { stage: 'Validation', text: 'The fix is verified before anything ships.' },
  { stage: 'Protected', text: 'Release goes out clean. The client avoids a significant business loss, and the onshore team formally recognises the catch.', ok: true },
];

export const workBullets = [
  'Designed and built enterprise CRM solutions in Apex, Lightning Web Components, SOQL and Flow, cutting manual processing.',
  'Built secure REST API integrations for reliable two-way data exchange between core systems and third-party enterprise services.',
  'Engineered reusable components aligned to enterprise architecture standards.',
  'Promoted from Associate Software Engineer to Software Engineer in roughly 21 months, ahead of the standard cycle.',
];


export const roles = [
  {
    id: 'accenture', company: 'Accenture', title: 'Software Engineer (Salesforce Developer)', place: 'Bengaluru, India', period: 'Aug 2024 – Sep 2026',
    summary: 'Enterprise CRM systems and integrations under strict SLAs. Promoted from Associate Software Engineer in ~21 months.',
  },
  {
    id: 'tss', company: 'Tech Stalwart Solution', title: 'Full-Stack Engineer Intern', place: 'India', period: 'Jun – Jul 2023',
    summary: 'Improved page-load speed by roughly 15% with React.js and co-deployed the company website on AWS.',
  },
];
