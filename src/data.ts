/* ─────────────────────────────────────────────────────────────
   SINGLE SOURCE OF TRUTH
   Every fact on the site comes from this file. Edit here, rebuild,
   and the page updates. Fields set to null are rendered as
   "not added yet" states instead of invented content.
   ───────────────────────────────────────────────────────────── */

export type Lane = 'main' | 'systems' | 'enterprise' | 'ai' | 'research';

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
    lexora: 'https://lexoraai.online',
    ownvoicz: 'https://ownvoicz.com',
  },
  /** Put a PDF of your CV at public/Rajesh_Kumar_Kona_CV.pdf and set this to its path. */
  cvPath: null as string | null,
};

export const lanes: { id: Lane; label: string; blurb: string }[] = [
  { id: 'main', label: 'main', blurb: 'Education and turning points' },
  { id: 'systems', label: 'systems', blurb: 'Security, cloud and blockchain' },
  { id: 'enterprise', label: 'enterprise', blurb: 'Industry and production work' },
  { id: 'ai', label: 'ai', blurb: 'AI products and agents' },
  { id: 'research', label: 'research', blurb: 'Papers and ideas' },
];

export interface Commit {
  id: string;
  lane: Lane;
  /** Position on the time axis as a decimal year. */
  t: number;
  /** What the visitor sees as the date. */
  when: string;
  title: string;
  body: string;
  /** Things this milestone added, shown as a diff. */
  diff: string[];
  /** Section to jump to for more. */
  more?: string;
  head?: boolean;
  future?: boolean;
  wip?: boolean;
}

export const commits: Commit[] = [
  {
    id: 'olympiad', lane: 'main', t: 2019.4, when: '2019',
    title: 'Gold medal, SOF Mathematics Olympiad',
    body: 'Where the habit of working through hard problems started.',
    diff: ['gold medal · SOF Mathematics Olympiad'], more: 'recognition',
  },
  {
    id: 'btech', lane: 'main', t: 2020.7, when: 'Sep 2020',
    title: 'init: BTech Computer Science & Engineering, VVIT',
    body: 'Four years at Vasireddy Venkatadri Institute of Technology, specialising in IoT, cyber security and blockchain technology.',
    diff: ['data structures & algorithms', 'operating systems', 'computer networks', 'DBMS', 'cryptography & network security'],
  },
  {
    id: 'ai-for-everyone', lane: 'ai', t: 2021.4, when: 'May 2021',
    title: 'branch ai: AI For Everyone, DeepLearning.AI',
    body: 'First structured course in AI. The ai branch starts here.',
    diff: ['AI fundamentals'], more: 'credentials',
  },
  {
    id: 'cyber-internship', lane: 'systems', t: 2022.25, when: 'Mar–May 2022',
    title: 'branch systems: Cybersecurity virtual internship',
    body: 'Ten-week virtual internship supported by the Palo Alto Networks Cybersecurity Academy, through EduSkills and AICTE.',
    diff: ['network security', 'security fundamentals'], more: 'credentials',
  },
  {
    id: 'design-venture', lane: 'main', t: 2022.45, when: '2022',
    title: 'Third prize, 24-Hour Design Venture Challenge',
    body: 'A day-long build-and-pitch challenge.',
    diff: ['third prize'], more: 'recognition',
  },
  {
    id: 'ucsd', lane: 'main', t: 2022.87, when: 'Nov 2022',
    title: 'UC San Diego specialization: Object Oriented Java, Data Structures & Beyond',
    body: 'Five courses, ending in a capstone analysing social network data.',
    diff: ['Java', 'object-oriented design', 'advanced data structures', 'graph algorithms'], more: 'credentials',
  },
  {
    id: 'aws', lane: 'systems', t: 2023.12, when: 'Dec 2022–Feb 2023',
    title: 'AWS cloud virtual internship and two AWS Academy badges',
    body: 'Ten-week AWS cloud internship (EduSkills, supported by AWS Academy), then AWS Academy Graduate badges in Cloud Foundations and Cloud Architecting.',
    diff: ['AWS', 'cloud architecture', 'EC2 · S3'], more: 'credentials',
  },
  {
    id: 'microsoft', lane: 'systems', t: 2023.24, when: '27–31 Mar 2023',
    title: 'Three Microsoft certifications in five days',
    body: 'Azure AI Engineer Associate on 27 March, Azure Developer Associate on 30 March, DevOps Engineer Expert on 31 March.',
    diff: ['Azure', 'Azure DevOps', 'CI/CD', 'Azure AI services'], more: 'credentials',
  },
  {
    id: 'paper-blockchain', lane: 'research', t: 2023.34, when: '2023',
    title: 'branch research: Blockchain and Its Applications in the Real World',
    body: 'Published in IRJET. An analysis of decentralised systems across finance, governance and digital trust.',
    diff: ['publication · IRJET'], more: 'research',
  },
  {
    id: 'sf-internship', lane: 'enterprise', t: 2023.4, when: 'Apr–May 2023',
    title: 'branch enterprise: Salesforce developer virtual internship',
    body: 'Eight weeks covering the platform end to end, from org setup and flows to Apex, testing and Lightning Web Components.',
    diff: ['Apex', 'Lightning Web Components', 'Flows', 'Salesforce security model'], more: 'credentials',
  },
  {
    id: 'tss', lane: 'enterprise', t: 2023.53, when: 'Jun–Jul 2023',
    title: 'Full-stack engineer intern, Tech Stalwart Solution',
    body: 'Improved page-load speed by roughly 15% with React.js and co-deployed the company website on AWS.',
    diff: ['React.js', 'AWS deployment', '~15% faster page loads'], more: 'work',
  },
  {
    id: 'paper-style', lane: 'research', t: 2023.7, when: '2023',
    title: 'Advancements in Artistic Style Transfer',
    body: 'Published in IRJET with M. B. Kona. A survey of neural style transfer, from CNN-based methods to adaptive instance normalisation.',
    diff: ['publication · IRJET', 'neural style transfer'], more: 'research',
  },
  {
    id: 'paper-fund', lane: 'research', t: 2024.2, when: '2024',
    title: 'Blockchain Based Fund Management System',
    body: 'Published in IJCRT. Secure, decentralised fund allocation through smart contracts, alongside a working Solidity implementation.',
    diff: ['publication · IJCRT', 'Solidity', 'smart contracts'], more: 'research',
  },
  {
    id: 'graduate', lane: 'main', t: 2024.5, when: 'Jul 2024',
    title: 'Graduated BTech: 8.65/10, ranked 2 of 66',
    body: 'Second in the cohort, which is the top 1%.',
    diff: ['BTech CSE', 'rank 2 / 66'],
  },
  {
    id: 'accenture', lane: 'enterprise', t: 2024.62, when: 'Aug 2024',
    title: 'Joined Accenture as Associate Software Engineer',
    body: 'Salesforce developer in Bengaluru, building enterprise CRM systems and integrations under strict SLAs.',
    diff: ['enterprise CRM', 'REST integrations', 'production on-call discipline'], more: 'work',
  },
  {
    id: 'pd1', lane: 'enterprise', t: 2024.9, when: '2024',
    title: 'Salesforce Certified Platform Developer I',
    body: 'First Salesforce certification, earned in the first months on the job.',
    diff: ['Platform Developer I'], more: 'credentials',
  },
  {
    id: 'sf-admin', lane: 'enterprise', t: 2025.25, when: '2025',
    title: 'Salesforce Administrator and Platform App Builder',
    body: 'Two more Salesforce certifications, covering administration and declarative app design.',
    diff: ['Administrator', 'Platform App Builder'], more: 'credentials',
  },
  {
    id: 'lexora', lane: 'ai', t: 2025.3, when: '2025',
    title: 'Shipped LexoraAI',
    body: 'A privacy-first AI document workspace, built and deployed single-handedly, from front end and back end to LLM integration, hosting and analytics.',
    diff: ['LLM integration', 'in-browser document processing', 'Cloudflare', '100K+ pageviews · 6.7M+ requests'], more: 'lexora',
  },
  {
    id: 'youtube', lane: 'main', t: 2025.45, when: '2025',
    title: 'Started teaching CS and DSA on YouTube',
    body: 'Computer science and data structures from scratch, produced end to end in OBS Studio.',
    diff: ['teaching', 'OBS Studio'], more: 'explain',
  },
  {
    id: 'ownvoicz', lane: 'ai', t: 2025.55, when: '2025',
    title: 'Started ownVoicz',
    body: 'A second self-built application, focused on AI voice. In active development and intended for open-source release.',
    diff: ['voice AI'], more: 'ownvoicz',
  },
  {
    id: 'cheer', lane: 'enterprise', t: 2025.6, when: '2025',
    title: 'Accenture Cheer Award',
    body: 'Recognised for performance and cross-team collaboration.',
    diff: ['Cheer Award'], more: 'recognition',
  },
  {
    id: 'agentic', lane: 'ai', t: 2025.8, when: '2025',
    title: 'Accenture Agentic AI badge',
    body: 'Formal training in agent-based AI systems.',
    diff: ['agentic AI'], more: 'credentials',
  },
  {
    id: 'client', lane: 'enterprise', t: 2026.12, when: '2026',
    title: 'Client recognition: a critical defect caught before release',
    body: 'Found and fixed a pre-release defect that would have caused significant business loss. The onshore team recognised it formally.',
    diff: ['client recognition'], more: 'work',
  },
  {
    id: 'appathon', lane: 'main', t: 2026.25, when: '2026',
    title: 'Certificate of Contribution, 2026 Global Appathon',
    body: 'MIT App Inventor and the App Inventor Foundation.',
    diff: ['certificate of contribution'], more: 'recognition',
  },
  {
    id: 'promotion', lane: 'enterprise', t: 2026.38, when: '2026',
    title: 'Promoted to Software Engineer in ~21 months',
    body: 'Ahead of the standard cycle, for sustained delivery, ownership and client trust. 170+ production contributions and 20+ critical defects resolved by the time I left.',
    diff: ['Software Engineer', '170+ production contributions', '20+ critical defects resolved'], more: 'work',
  },
  {
    id: 'edinburgh', lane: 'main', t: 2026.7, when: 'Sep 2026', head: true,
    title: 'merge: MSc Computer Science, University of Edinburgh',
    body: 'Every branch merges here. Studying machine learning, ML systems, text technologies, HCI and blockchains, while continuing to build.',
    diff: ['Machine Learning Systems', 'Machine Learning Practical', 'Blockchains & Distributed Ledgers', 'Text Technologies for Data Science', 'Human-Computer Interaction'],
    more: 'now',
  },
  {
    id: 'atlas', lane: 'ai', t: 2026.95, when: 'now', wip: true,
    title: 'Atlas: uncommitted changes',
    body: 'The next evolution of the LexoraAI work: an enterprise AI automation architecture. Being designed and built now.',
    diff: ['agent orchestration', 'LLM gateway', 'approvals & audit'], more: 'atlas',
  },
  {
    id: 'dissertation', lane: 'main', t: 2027.45, when: '2027', future: true,
    title: 'MSc dissertation (60 credits)',
    body: 'Not written yet. Topic to be decided.',
    diff: [],
    more: 'now',
  },
];

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

/* ── Earlier builds ────────────────────────────────────────── */
export const archive = [
  {
    id: 'fund', lane: 'systems' as Lane, name: 'Blockchain-Based Fund Management System', era: 'BTech · published 2024',
    what: 'Solidity smart contracts for decentralised fund allocation, with consensus-validation mechanisms and a transaction-transparency monitoring interface.',
    tags: ['Solidity', 'smart contracts', 'consensus validation'],
    note: 'Also published as a paper in IJCRT.',
  },
  {
    id: 'web3', lane: 'systems' as Lane, name: 'Web3 Bookstore', era: 'BTech · IEEE Soft-con Expo',
    what: 'A decentralised bookstore with wallet-based authentication. I designed the backend APIs and database integration.',
    tags: ['wallet auth', 'backend APIs', 'databases'],
    note: 'Presented at IEEE Soft-con Expo.',
  },
  {
    id: 'iot', lane: 'systems' as Lane, name: 'IoT Smart Home Security System', era: 'BTech',
    what: 'Facial-recognition access control wired to IoT sensors, with a backend that sends alert notifications.',
    tags: ['IoT sensors', 'facial recognition', 'access control'],
    note: null,
  },
  {
    id: 'aider', lane: 'systems' as Lane, name: 'AIDER', era: 'BTech · Innovation Fair, JNTU Kakinada',
    what: 'A blockchain-integrated architecture for securing medical records, with a decentralised model for validating patient data.',
    tags: ['blockchain', 'health data', 'validation'],
    note: 'Prototype presented at the Innovation Fair, JNTU Kakinada.',
  },
];

/* ── Research ──────────────────────────────────────────────── */
export const papers = [
  {
    id: 'paper-fund', title: 'Blockchain Based Fund Management System', venue: 'IJCRT', venueLong: 'International Journal of Creative Research Thoughts',
    year: 2024, authors: ['R. K. Kona'], domain: 'Blockchain · Smart contracts',
    summary: 'Secure, decentralised fund allocation using smart contracts, so that every allocation is transparent and verifiable on-chain.',
    ideas: ['Smart contracts as the allocation authority', 'Consensus validation before funds move', 'A transparency interface for monitoring transactions'],
    url: null as string | null,
  },
  {
    id: 'paper-blockchain', title: 'Blockchain and Its Applications in the Real World', venue: 'IRJET', venueLong: 'International Research Journal of Engineering and Technology',
    year: 2023, authors: ['R. K. Kona'], domain: 'Distributed systems',
    summary: 'An analysis of where decentralised systems hold up in practice, across finance, governance and digital trust.',
    ideas: ['Finance', 'Governance', 'Digital trust'],
    url: null as string | null,
  },
  {
    id: 'paper-style', title: 'Advancements in Artistic Style Transfer: From Neural Algorithms to Real-Time Adaptation', venue: 'IRJET', venueLong: 'International Research Journal of Engineering and Technology',
    year: 2023, authors: ['M. B. Kona', 'R. K. Kona'], domain: 'Machine learning · Computer vision',
    summary: 'A survey of neural style transfer, tracing the field from the original CNN-based optimisation methods to adaptive instance normalisation for real-time use.',
    ideas: ['CNN-based neural style transfer', 'Adaptive instance normalisation (AdaIN)', 'Real-time adaptation'],
    url: null as string | null,
  },
];

/* ── MSc: from the University of Edinburgh degree planner ─── */
export const msc = {
  programme: 'MSc Computer Science',
  university: 'University of Edinburgh',
  years: '2026–2027',
  totalCredits: 180,
  modules: [
    { code: 'MLP', name: 'Machine Learning Practical', credits: 20, term: 'Full year', builds: ['style transfer paper', 'Azure AI Engineer'] },
    { code: 'TTDS', name: 'Text Technologies for Data Science', credits: 20, term: 'Full year', builds: ['LexoraAI document tools'] },
    { code: 'MLS', name: 'Machine Learning Systems', credits: 20, term: 'Semester 1', builds: ['LexoraAI at 6.7M+ requests'] },
    { code: 'HCI', name: 'Human-Computer Interaction', credits: 20, term: 'Semester 1', builds: ['LexoraAI read-aloud and voice commands'] },
    { code: 'BDL', name: 'Blockchains and Distributed Ledgers', credits: 10, term: 'Semester 1', builds: ['two blockchain papers', 'fund management system'] },
    { code: 'IPP', name: 'Informatics Project Proposal', credits: 20, term: 'Semester 2', builds: [] },
    { code: 'ACP', name: 'Applied Cloud Programming', credits: 10, term: 'Semester 2', builds: ['AWS and Azure certifications', 'enterprise integrations'] },
    { code: 'DISS', name: 'MSc Dissertation (Informatics)', credits: 60, term: 'Summer', builds: [] },
  ],
};

/* ── Credential vault ──────────────────────────────────────── */
export type CredCat = 'AI' | 'Cloud' | 'Salesforce' | 'Programming' | 'Web' | 'Other';
export interface Credential {
  id: string;
  title: string;
  issuer: string;
  date: string;
  sort: number;
  cat: CredCat;
  kind: 'Certification' | 'Course' | 'Specialization' | 'Internship' | 'Badge';
  credentialId?: string;
  certNumber?: string;
  verify?: string;
  validUntil?: string;
  image?: string;
  details?: string;
  includes?: { title: string; verify: string; image?: string }[];
  /** true when no file was supplied yet. The vault shows this honestly. */
  pending?: boolean;
}

const cv = (code: string) => `https://coursera.org/verify/${code}`;

export const credentials: Credential[] = [
  { id: 'ms-devops', title: 'Microsoft Certified: DevOps Engineer Expert', issuer: 'Microsoft', date: '31 Mar 2023', sort: 2023.249, cat: 'Cloud', kind: 'Certification',
    credentialId: '2DC01E2137AD8D25', certNumber: 'D27844-L3A1C8', validUntil: '1 Apr 2024', details: 'Azure DevOps.', image: 'ms-devops' },
  { id: 'ms-azure-dev', title: 'Microsoft Certified: Azure Developer Associate', issuer: 'Microsoft', date: '30 Mar 2023', sort: 2023.246, cat: 'Cloud', kind: 'Certification',
    credentialId: '7D5FF6F821A29AFA', certNumber: 'AD3C46-5B5T4C', validUntil: '31 Mar 2024', image: 'ms-azure-dev' },
  { id: 'ms-azure-ai', title: 'Microsoft Certified: Azure AI Engineer Associate', issuer: 'Microsoft', date: '27 Mar 2023', sort: 2023.238, cat: 'AI', kind: 'Certification',
    certNumber: 'I674-3933', validUntil: '28 Mar 2024', image: 'ms-azure-ai' },
  { id: 'sf-pd1', title: 'Salesforce Certified Platform Developer I', issuer: 'Salesforce', date: '2024', sort: 2024.9, cat: 'Salesforce', kind: 'Certification', pending: true },
  { id: 'sf-admin', title: 'Salesforce Certified Administrator', issuer: 'Salesforce', date: '2025', sort: 2025.3, cat: 'Salesforce', kind: 'Certification', pending: true },
  { id: 'sf-app-builder', title: 'Salesforce Certified Platform App Builder', issuer: 'Salesforce', date: '2025', sort: 2025.31, cat: 'Salesforce', kind: 'Certification', pending: true },
  { id: 'agentic', title: 'Agentic AI', issuer: 'Accenture', date: '2025', sort: 2025.8, cat: 'AI', kind: 'Badge', pending: true },
  { id: 'aws-architecting', title: 'AWS Academy Graduate: Cloud Architecting', issuer: 'AWS Academy', date: '15 Feb 2023', sort: 2023.12, cat: 'Cloud', kind: 'Badge',
    verify: 'https://www.credly.com/go/rSx5zi6H', details: '40 course hours', image: 'aws-architecting' },
  { id: 'aws-foundations', title: 'AWS Academy Graduate: Cloud Foundations', issuer: 'AWS Academy', date: '15 Feb 2023', sort: 2023.119, cat: 'Cloud', kind: 'Badge',
    verify: 'https://www.credly.com/go/MMnl9YVs', details: '20 course hours', image: 'aws-foundations' },
  { id: 'aws-internship', title: 'AWS Cloud Virtual Internship', issuer: 'EduSkills · AICTE · AWS Academy', date: 'Dec 2022 – Feb 2023', sort: 2023.1, cat: 'Cloud', kind: 'Internship',
    credentialId: '5f620aad001c519e86f7db27600a7c62', details: '10 weeks', image: 'aws-internship' },
  { id: 'sf-internship', title: 'Salesforce Developer Virtual Internship', issuer: 'SmartInternz · SmartBridge · AICTE', date: '23 May 2023', sort: 2023.39, cat: 'Salesforce', kind: 'Internship',
    credentialId: 'SISFVIPAD2022-53960', verify: 'https://smartinternz.com/internships/salesforce_certificates/b6d7a316bed7a493b2c28d37192c372a',
    details: '8 weeks, Apr–May 2023. Salesforce fundamentals, org setup, relationships and process automation, flows and security, Apex testing and debugging, VS Code and CLI setup, Lightning Web Components and APIs.',
    image: 'salesforce-internship' },
  { id: 'cyber-internship', title: 'Cybersecurity Virtual Internship', issuer: 'EduSkills · AICTE · Palo Alto Networks Cybersecurity Academy', date: 'Mar – May 2022', sort: 2022.3, cat: 'Other', kind: 'Internship',
    credentialId: '30c007a6e4a8f0bddf309b60745e1617', details: '10 weeks', image: 'cybersecurity-internship' },
  { id: 'tss-internship', title: 'Web Development Internship', issuer: 'Tech Stalwart Solution', date: 'Jul 2023', sort: 2023.55, cat: 'Web', kind: 'Internship',
    details: 'Certificate of appreciation, Hyderabad, 8 August 2023.', image: 'tss-internship' },
  { id: 'ai-for-everyone', title: 'AI For Everyone', issuer: 'DeepLearning.AI · Coursera', date: '27 May 2021', sort: 2021.4, cat: 'AI', kind: 'Course',
    verify: cv('JVJ3AVS9U26V'), details: 'Taught by Andrew Ng.', image: 'ai-for-everyone' },
  { id: 'ucsd-specialization', title: 'Object Oriented Java Programming: Data Structures and Beyond', issuer: 'UC San Diego · Coursera', date: '12 Nov 2022', sort: 2022.87, cat: 'Programming', kind: 'Specialization',
    verify: 'https://coursera.org/verify/specialization/QCRHRVWMRDZ9', details: 'Five-course specialization.', image: 'ucsd-specialization',
    includes: [
      { title: 'Object Oriented Programming in Java', verify: cv('CUE8BAAEG252'), image: 'ucsd-oop-java' },
      { title: 'Data Structures and Performance', verify: cv('5BKP9299VYQM'), image: 'ucsd-ds-performance' },
      { title: 'Advanced Data Structures in Java', verify: cv('LKB5QVGKL2GU'), image: 'ucsd-advanced-ds' },
      { title: 'Mastering the Software Engineering Interview', verify: cv('6RFMQSZC2AGC'), image: 'ucsd-se-interview' },
      { title: 'Capstone: Analyzing (Social) Network Data', verify: cv('C2Z45GQU7ZZ6'), image: 'ucsd-capstone' },
    ] },
  { id: 'meta-backend', title: 'Introduction to Back-End Development', issuer: 'Meta · Coursera', date: '5 May 2023', sort: 2023.34, cat: 'Web', kind: 'Course',
    verify: cv('3JJ23FTKYR8E'), image: 'meta-backend' },
  { id: 'meta-version-control', title: 'Version Control', issuer: 'Meta · Coursera', date: '9 Apr 2023', sort: 2023.27, cat: 'Programming', kind: 'Course',
    verify: cv('YTCRZCDLMJK3'), image: 'meta-version-control' },
  { id: 'meta-javascript', title: 'Programming with JavaScript', issuer: 'Meta · Coursera', date: '15 Nov 2022', sort: 2022.88, cat: 'Programming', kind: 'Course',
    verify: cv('H8YLHC29QD32'), image: 'meta-javascript' },
  { id: 'meta-frontend', title: 'Introduction to Front-End Development', issuer: 'Meta · Coursera', date: '12 Nov 2022', sort: 2022.869, cat: 'Web', kind: 'Course',
    verify: cv('BAEE4R3FJD54'), image: 'meta-frontend' },
];

/* ── Stack trace: every skill → where it was used ──────────── */
export interface Evidence { id: string; label: string; kind: 'Work' | 'Product' | 'Research' | 'Project' | 'Credential' | 'MSc' | 'Teaching'; lane: Lane }
export const evidence: Evidence[] = [
  { id: 'accenture', label: 'Accenture', kind: 'Work', lane: 'enterprise' },
  { id: 'tss', label: 'Tech Stalwart internship', kind: 'Work', lane: 'enterprise' },
  { id: 'lexora', label: 'LexoraAI', kind: 'Product', lane: 'ai' },
  { id: 'atlas', label: 'Atlas (in progress)', kind: 'Product', lane: 'ai' },
  { id: 'ownvoicz', label: 'ownVoicz (in development)', kind: 'Product', lane: 'ai' },
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
    { name: 'REST / SOAP APIs', ev: ['accenture', 'web3'] },
    { name: 'JavaScript', ev: ['lexora', 'tss', 'c-meta'] },
    { name: 'React', ev: ['tss', 'c-meta'] },
    { name: 'Node.js · Express · Next.js', ev: ['c-meta'] },
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
    { name: 'IoT', ev: ['iot'] },
  ] },
  { group: 'Foundations', items: [
    { name: 'Java', ev: ['c-ucsd'] },
    { name: 'Python', ev: ['m-ml'] },
    { name: 'Data structures & algorithms', ev: ['c-ucsd', 'youtube'] },
    { name: 'Databases (SQL, MongoDB, SQLite)', ev: ['web3', 'accenture'] },
  ] },
];

/* ── Recognition & community ───────────────────────────────── */
export const awards = [
  { year: '2026', title: 'Client recognition', org: 'Accenture', text: 'For catching a critical defect before it reached production.' },
  { year: '2026', title: 'Certificate of Contribution', org: 'Global Appathon · MIT App Inventor & App Inventor Foundation', text: '' },
  { year: '2025', title: 'Cheer Award', org: 'Accenture', text: 'Performance and cross-team collaboration.' },
  { year: '2024', title: 'Ranked 2 of 66', org: 'BTech CSE cohort, VVIT', text: 'GPA 8.65/10, the top 1% of the cohort.' },
  { year: '2022', title: 'Third Prize', org: '24-Hour Design Venture Challenge', text: '' },
  { year: '2019', title: 'Gold Medal', org: 'SOF Mathematics Olympiad', text: '' },
];

export const community = [
  { role: 'Presenter', where: 'IEEE Soft-con Expo', what: 'Web3 Bookstore' },
  { role: 'Presenter', where: 'IEEE IoT Expo', what: '' },
  { role: 'Presenter', where: 'Innovation Fair, JNTU Kakinada', what: 'AIDER' },
  { role: 'Organiser (volunteer)', where: 'ACM events', what: '' },
  { role: 'Participant', where: 'Bharat Blockchain Yatra', what: '' },
  { role: 'Participant', where: 'Data Science Workshop, IIT Hyderabad', what: '' },
];

/* ── Teaching ──────────────────────────────────────────────── */
export const channels = [
  { handle: '@KRK0010', name: 'DSA Daily', topic: 'Data structures and algorithms, from scratch.', url: 'https://www.youtube.com/@KRK0010', mode: 'Learn' },
  { handle: '@KRK017', name: 'The Infinite Machine', topic: 'Computer science and technical explanations.', url: 'https://www.youtube.com/@KRK017', mode: 'Explain' },
  { handle: '@EdinburghDiariesTelugu', name: 'UK Diaries Telugu', topic: 'The Edinburgh MSc journey, documented in Telugu.', url: 'https://www.youtube.com/@EdinburghDiariesTelugu', mode: 'Build' },
];
