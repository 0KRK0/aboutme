/* Education.
   Part of the portfolio's data layer. Edit here; every view (web, terminal,
   explorer, world) reads from these files. */

/* ── MSc: course details from the University of Edinburgh's public Degree
   Regulations & Programmes of Study (DRPS), 2026/27 archive. Only what DRPS
   publishes is shown: code, credits, period, assessment split, summary and
   learning outcomes (paraphrased). "mine" is what I'm doing in the course. ── */
const DRPS = 'https://www.drps.ed.ac.uk/26_27_Archive_at_01-09-2026/dpt/';

export interface Module {
  code: string; name: string; credits: number; term: string;
  drps: string; url: string; assessment: string;
  summary: string; outcomes: string[]; mine?: string; builds: string[];
}

export const msc: { programme: string; university: string; years: string; totalCredits: number; source: string; modules: Module[] } = {
  programme: 'MSc Computer Science',
  university: 'University of Edinburgh',
  years: '2026–2027',
  totalCredits: 180,
  source: DRPS + 'cx_sb_infr.htm',
  modules: [
    { code: 'MLP', name: 'Machine Learning Practical', credits: 20, term: 'Full year', drps: 'INFR11132', url: DRPS + 'cxinfr11132.htm', assessment: 'Coursework 100%',
      summary: 'Lab-based deep learning: designing, implementing, training and evaluating neural networks. Semester 1 is individual coursework in Python; semester 2 is a group project in PyTorch or TensorFlow.',
      outcomes: ['Design and implement machine learning systems', 'Read and explain technical papers', 'Design experiments with a clear methodology and evaluate the results', 'Write well-structured scholarly reports'],
      mine: 'Group project: designing and training our own model.',
      builds: ['style transfer paper', 'Azure AI Engineer'] },
    { code: 'TTDS', name: 'Text Technologies for Data Science', credits: 20, term: 'Full year', drps: 'INFR11145', url: DRPS + 'cxinfr11145.htm', assessment: 'Exam 30% · coursework 70%',
      summary: 'Information retrieval from the ground up: preprocessing, indexing, ranked retrieval, evaluation, web search, text classification, topic modelling and retrieval-augmented generation (RAG) with LLMs.',
      outcomes: ['Build a search engine from scratch', 'Build feature-extraction modules for text', 'Implement retrieval evaluation scripts', 'Explain how web search engines work', 'Deliver a team project'],
      mine: 'Group project: building a full search engine with a RAG layer on top.',
      builds: ['LexoraAI document tools'] },
    { code: 'MLS', name: 'Machine Learning Systems', credits: 20, term: 'Semester 1', drps: 'INFR11269', url: DRPS + 'cxinfr11269.htm', assessment: 'Coursework 100%',
      summary: 'The systems side of ML: data management and queries, PyTorch and GPU architecture, profiling, distributed training, deployment, inference acceleration, and safety and privacy in deployment.',
      outcomes: ['Explain data types and ML system architectures', 'Build and profile ML system implementations', 'Compare and evaluate systems', 'Reflect on quality and security of data and models'],
      builds: ['LexoraAI at 6.7M+ requests', 'Voice-to-Video GPU rendering'] },
    { code: 'HCI', name: 'Human-Computer Interaction', credits: 20, term: 'Semester 1', drps: 'INFR11299', url: DRPS + 'cxinfr11299.htm', assessment: 'Coursework 100%',
      summary: 'Methods for understanding people, generating design ideas and assessing user experience, applied through the full HCI design cycle in a group project.',
      outcomes: ['Describe HCI theories and why they matter for design', 'Apply research and design methods in real settings', 'Combine insights across disciplines on complex design problems', 'Communicate research and design processes'],
      builds: ['LexoraAI read-aloud and voice commands'] },
    { code: 'BDL', name: 'Blockchains and Distributed Ledgers', credits: 10, term: 'Semester 1', drps: 'INFR11144', url: DRPS + 'cxinfr11144.htm', assessment: 'Exam 70% · coursework 30%',
      summary: 'Distributed ledgers and the cryptography behind them: consensus, privacy, scalability, smart contracts, multiparty computation, proof of stake and space, and game-theoretic analysis.',
      outcomes: ['Analyse multi-party protocols and their security properties', 'Think critically about cybersecurity', 'Program smart contracts', 'Evaluate smart contract code using cryptographic primitives'],
      builds: ['two blockchain papers', 'fund management system'] },
    { code: 'IPP', name: 'Informatics Project Proposal 20', credits: 20, term: 'Semester 2', drps: 'INFR11291', url: DRPS + 'cxinfr11291.htm', assessment: 'Coursework 100%',
      summary: 'Turning a dissertation idea into a structured proposal: literature review, goals, milestones, risk and resource planning, and the legal, ethical and professional issues.',
      outcomes: ['Select and critically evaluate literature to justify decisions', 'Write a structured dissertation proposal', 'Plan time, resources and risk', 'Handle ethics and data-management issues'],
      builds: [] },
    { code: 'ACP', name: 'Applied Cloud Programming', credits: 10, term: 'Semester 2', drps: 'INFR11245', url: DRPS + 'cxinfr11245.htm', assessment: 'Coursework 100%',
      summary: 'Hands-on cloud programming, mainly in Java with some Go and Rust: containers, microservices, event processing, Kubernetes and CI/CD.',
      outcomes: ['Implement containerised microservices and event processing', 'Compare cloud architecture styles', 'Evaluate the major providers\' offerings', 'Explain CI/CD structures'],
      builds: ['AWS and Azure certifications', 'enterprise integrations'] },
    { code: 'DISS', name: 'MSc Dissertation (Informatics)', credits: 60, term: 'Summer', drps: 'INFR11077', url: DRPS + 'cxinfr11077.htm', assessment: 'Coursework 100%',
      summary: 'A major piece of independent, supervised work in the final months: literature, requirements, design, implementation, experiments, evaluation and presentation.',
      outcomes: ['Structure and critically evaluate the knowledge around a substantial topic', 'Investigate and solve the problems that come up', 'Critically evaluate the design choices made', 'Present the work with a working demonstration'],
      builds: [] },
  ],
};


export const btech = {
  degree: 'BTech, Computer Science & Engineering', school: 'Vasireddy Venkatadri Institute of Technology', place: 'Guntur, India', period: 'Sep 2020 – Jul 2024',
  specialisation: 'IoT, cyber security including blockchain technology', gpa: '8.65/10', rank: '2 of 66 (top 1%)',
  coursework: ['Data structures', 'Design & analysis of algorithms', 'Operating systems', 'Computer networks', 'DBMS', 'Machine learning', 'Big data analytics', 'Cryptography & network security', 'Cloud computing', 'Blockchain technologies'],
};
