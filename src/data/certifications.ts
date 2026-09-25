/* Credential vault entries. IDs and links copied from the certificate files.
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

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
  { id: 'sf-pd1', title: 'Salesforce Certified Platform Developer', issuer: 'Salesforce', date: 'Jul 2024', sort: 2024.5, cat: 'Salesforce', kind: 'Certification',
    verify: 'https://www.salesforce.com/trailblazer/rajeshkumarkrk', details: 'Custom business logic and interfaces with Apex, Visualforce and Lightning. Listed as Platform Developer I on the CV. Maintenance: Winter ’25 module completed.' },
  { id: 'sf-admin', title: 'Salesforce Certified Platform Administrator', issuer: 'Salesforce', date: 'Mar 2025', sort: 2025.2, cat: 'Salesforce', kind: 'Certification',
    verify: 'https://www.salesforce.com/trailblazer/rajeshkumarkrk', details: 'Building and securing solutions on the Salesforce Platform: users, data, apps and org health. Listed as Administrator on the CV. Maintenance: Spring ’25 module completed.' },
  { id: 'sf-app-builder', title: 'Salesforce Certified Platform App Builder', issuer: 'Salesforce', date: 'Jun 2025', sort: 2025.45, cat: 'Salesforce', kind: 'Certification',
    verify: 'https://www.salesforce.com/trailblazer/rajeshkumarkrk', details: 'Designing, building and deploying custom apps with the declarative tools of the Salesforce Platform.' },
  { id: 'sf-superbadges', title: 'Trailhead Superbadges (13)', issuer: 'Salesforce Trailhead', date: 'Profile as of Sep 2026', sort: 2026.7, cat: 'Salesforce', kind: 'Badge',
    verify: 'https://www.salesforce.com/trailblazer/rajeshkumarkrk',
    details: 'Apex Specialist · Developer Super Set · Process Automation Specialist · Flow Fundamentals · Flow Administration · Flow Optimization · Flow Elements and Resources Specialist · Screen Flow Fundamentals · Screen Flow Distribution · Screen Flow Specialist · Approval Process Management · Approval Process Troubleshooting · Approval Process Specialist. Trailhead profile: 65 badges, 79,750 points, 4 trails.' },
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

