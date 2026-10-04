/* Career OS and AuTrad: details for their sections.
   Every figure is from the public repositories (github.com/0KRK0/Career-OS and
   github.com/0KRK0/AuTrad), counted from the code or quoted from the README and
   research files. Nothing here is estimated. */

export const careerOs = {
  repo: 'https://github.com/0KRK0/Career-OS',
  numbers: [
    { v: '112', k: 'preset companies' },
    { v: '12', k: 'job systems and feeds' },
    { v: '16', k: 'learning tracks' },
    { v: '0', k: 'applications sent for you' },
  ],
  stages: [
    { id: 'find', name: 'Find', detail: 'Scouts read the public job APIs of Greenhouse, Lever, Ashby, SmartRecruiters, Workable and Workday, plus four open feeds, twice a day. Research agents look for fellowships, scholarships and firms with no public API.' },
    { id: 'score', name: 'Score', detail: 'Rule-based scoring from 0 to 100: target role, level, country, visa-sponsorship wording, skills and deadline.' },
    { id: 'prepare', name: 'Prepare', detail: 'The AI writes a fit note, the gaps, a cover letter and a “why this company” answer, from my own facts only.' },
    { id: 'fill', name: 'Fill', detail: 'A real browser window opens. Obvious fields are filled first, then the AI reads the whole page and drafts the rest.' },
    { id: 'submit', name: 'You submit', detail: 'Nothing is ever submitted for you. Consent boxes stay unticked until you press “Tick acknowledgements”.', you: true },
    { id: 'track', name: 'Track', detail: 'Gmail is read over IMAP, read-only, and replies move the pipeline. After 14 quiet days a follow-up is saved to Drafts. Nothing is sent.' },
    { id: 'learn', name: 'Learn', detail: 'Mandatory tracks plus one per role, an AI tutor, tests with Python problems run locally, and mock interviews.' },
  ],
  form: [
    { label: 'Full name', kind: 'you', value: 'Rajesh Kumar Kona' },
    { label: 'Email', kind: 'you', value: 'konarajeshkumar011@gmail.com' },
    { label: 'CV', kind: 'you', value: 'Rajesh_Kumar_Kona_CV.pdf' },
    { label: 'Why this team?', kind: 'draft', value: 'Drafted from my own facts. Read it before you send it.' },
    { label: 'Referee email', kind: 'need', value: 'Only you know this.' },
    { label: 'Expected salary', kind: 'need', value: 'Only you know this.' },
  ],
  learn: {
    core: ['Maths', 'Probability & Statistics', 'CS Foundations', 'DSA', 'Software & Systems', 'Interview Skills'],
    roles: ['Software Engineer', 'Quant Researcher', 'Quant Trader', 'Quant Developer', 'ML Engineer', 'Research Scientist', 'Data Scientist', 'Salesforce', 'Slack', 'Trading'],
    levels: ['Foundations', 'Core', 'Advanced', 'Expert', 'Frontier'],
  },
  built: [
    'About 6,800 lines of Python (FastAPI, SQLite in WAL mode, Playwright) and a plain-JavaScript app with no build step: 72 API routes and 16 tables, served only on 127.0.0.1.',
    'Thirteen agent types on a scheduler, with a cap on how many run at once and automatic recovery when the AI plan’s usage limit is hit.',
    'The agents run the official Claude Code, Codex or Gemini command-line apps signed in with the user’s own subscription. API-key variables are removed first, so it cannot run up API bills.',
    'Autofill injects a script into every frame of the page and talks back to Python. It colour-codes every field, learns from my edits, and opens a linked second form when a page says the real application is elsewhere.',
    'A 9-step setup wizard, so it works for anyone, not just me: it reads your career folder and writes what it understood into an about-me file you can edit.',
  ],
  honest: [
    'There are no automated tests yet.',
    'Set-up, sign-in and pop-ups are built for Windows first.',
    'Your CV and the form text are sent to the AI app you choose, so they are only as private as that service.',
    'Autofill is switched off on LinkedIn, Indeed, Naukri and Glassdoor. The optional Extra page can read your own job-site searches there, which those sites do not allow, so its defaults are slow and small.',
  ],
};

export const autrad = {
  repo: 'https://github.com/0KRK0/AuTrad',
  numbers: [
    { v: '11', k: 'pre-registered research versions' },
    { v: '114', k: 'experiment results logged' },
    { v: '222', k: 'automated tests' },
    { v: '0', k: 'proven alpha, so far' },
  ],
  rules: [
    { k: 'Write the test before the result', v: 'Each version’s plan is written and its SHA-256 hash logged before any result exists.' },
    { k: 'Log every trial', v: 'An append-only ledger keeps every configuration and every failure, not just the winners.' },
    { k: 'Charge for the searching', v: 'Holm correction, Newey–West t, a deflated Sharpe ratio that counts every trial, and the probability of backtest overfitting.' },
    { k: 'Only what was known then', v: 'A company filing counts only if it was public before 15:30 IST on the decision day. Index membership is point-in-time.' },
    { k: 'Price in India', v: 'STT, stamp duty, exchange and SEBI fees, GST and capital-gains tax are modelled, so an idea has to survive what a retail trader in India would actually pay.' },
  ],
  gate: [
    { step: 'Statistical', rule: 'significant after Holm, right sign' },
    { step: 'After costs', rule: '≥ +2% a year net' },
    { step: 'After tax', rule: 'beats the benchmark after tax' },
    { step: 'Double costs', rule: 'still positive' },
    { step: 'Capacity', rule: 'still positive at ₹1 crore' },
    { step: 'Stability', rule: '⅔ of subperiods positive' },
    { step: 'Forward test', rule: 'frozen, on paper' },
  ],
  versions: [
    { v: 'v0.3', q: '13 strategies, hourly to multi-year, on a sealed 2024–26 test', a: 'None qualified for paper trading.' },
    { v: 'v0.4', q: '17 pre-registered factors on Indian large caps', a: 'Only one-month reversal (REV1) passed. Its signal is robust, but the after-cost gain, +2.3% a year, is not significant (t 0.9).' },
    { v: 'v0.5', q: 'Take REV1, low volatility and earnings reactions apart', a: 'REV1 is cost-fragile: −0.5% a year at double costs. Low volatility is mostly market beta. Neither is a strategy.' },
    { v: 'v0.6', q: 'Exchange prices, Indian tax, an earnings veto', a: 'After Indian tax, REV1 trails the equal-weight NIFTY 50. The veto adds no measurable information.' },
    { v: 'v0.7', q: 'The capital-efficiency gate, cash-flow quality', a: 'No candidate passes the gate. REV1 clears the statistics and, barely, the after-tax estimate, then fails at double costs. Cash-flow quality is rejected at the statistical step.' },
    { v: 'v0.8.1', q: 'Promoter pledges across 500 stocks; crypto across 658 coins', a: 'Nothing passed. Weekly top-50 crypto momentum lost 48.9% a year.' },
    { v: 'v0.9', q: 'BTC order-flow microstructure', a: 'Order flow is predictable, but not profitably: the move is under 1 basis point, less than the cost of a trade.' },
    { v: 'v1.0', q: 'Market making and funding carry', a: 'All rejected. Carry is negative after Indian tax.' },
    { v: 'v1.1', q: 'The NSE cash–futures basis', a: 'Efficiently priced for retail. A look-ahead in my own signal was found, disclosed and removed.' },
    { v: 'v1.2', q: 'Dividends, index changes, F&O bans', a: 'Futures had priced 93% of a dividend by the first close. Nothing passed.' },
    { v: 'v1.3', q: 'Bad-results drift outside the NIFTY 50', a: 'Over 1,562 events it does not keep drifting. Rejected.' },
    { v: 'v1.4', q: 'Collect data for studies that need the future', a: 'No new backtest. Live trading stays off.' },
  ],
  forward: 'REV1, the one rule that came closest, runs as a frozen forward test on paper from 1 October 2026: ₹10 lakh notional, a hash-chained ledger, and any change to its code voids it. It will not prove anything quickly, and the repo says so: at its information ratio a forward test can catch it breaking, not prove it.',
  honest: [
    'Paper only. The broker adapter for live trading raises an error by design, and no real money is involved.',
    'The agents (company dossiers, an adversarial “10th Man” reviewer, a Main Head) are rule-based and statistical, not LLM-driven, and run in shadow.',
    'The whole programme so far was logged over a few days around the start of October 2026, and the forward test has barely started.',
  ],
};
