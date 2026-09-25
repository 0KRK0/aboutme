/* Timeline: the career graph (lanes and milestones).
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

export type Lane = 'main' | 'systems' | 'enterprise' | 'ai' | 'research';

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
    id: 'appathon', lane: 'main', t: 2026.3, when: 'May 2026',
    title: 'Global Appathon 2026: took part',
    body: 'Built and submitted an app to MIT App Inventor\'s Global Appathon. Not among the winners. Received a certificate of contribution for taking part and completing the participant survey.',
    diff: ['participated'], more: 'recognition',
  },
  {
    id: 'promotion', lane: 'enterprise', t: 2026.38, when: '2026',
    title: 'Promoted to Software Engineer in ~21 months',
    body: 'Ahead of the standard cycle, for sustained delivery, ownership and client trust. 170+ production contributions and 20+ critical defects resolved by the time I left.',
    diff: ['Software Engineer', '170+ production contributions', '20+ critical defects resolved'], more: 'work',
  },
  {
    id: 'voicepassport', lane: 'ai', t: 2026.4, when: 'Aug 2026',
    title: 'Voice Passport, AI Passport Ideathon submission',
    body: 'A portable consent layer for AI voices: creators set scoped, time-limited permissions and every decision leaves a receipt. Built as a working prototype for the ideathon. No award claimed.',
    diff: ['consent & permissions', 'REST API', 'audit receipts'], more: 'voicepassport',
  },
  {
    id: 'vtv', lane: 'ai', t: 2026.53, when: 'Aug–Sep 2026',
    title: 'Voice-to-Video, and a research report on rendering it',
    body: 'Voice, script or document in; narrated video out. Profiled the renderer, made it segmented and resumable, and built an OpenGL compositor that matches the CPU reference within two levels per channel. Written up as a technical report.',
    diff: ['segmented rendering', 'GPU compositing', 'equivalence harness', 'technical report'], more: 'vtv',
  },
  {
    id: 'iqoo', lane: 'main', t: 2026.58, when: 'Aug 2026',
    title: 'iQOO Hackathon 2026: applied, not selected',
    body: 'Applied to the Bengaluru City Battle. Not selected past Phase 1.',
    diff: ['applied'], more: 'recognition',
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
