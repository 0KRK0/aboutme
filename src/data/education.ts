/* Education.
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

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


export const btech = {
  degree: 'BTech, Computer Science & Engineering', school: 'Vasireddy Venkatadri Institute of Technology', place: 'Guntur, India', period: 'Sep 2020 – Jul 2024',
  specialisation: 'IoT, cyber security including blockchain technology', gpa: '8.65/10', rank: '2 of 66 (top 1%)',
  coursework: ['Data structures', 'Design & analysis of algorithms', 'Operating systems', 'Computer networks', 'DBMS', 'Machine learning', 'Big data analytics', 'Cryptography & network security', 'Cloud computing', 'Blockchain technologies'],
};
