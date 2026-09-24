/* Terminal commands: names, arguments and help text.
   The handlers live in src/ui/terminal.ts; this file is what `help` prints
   and what tab-completion knows about. */

export interface CommandInfo { name: string; args?: string; about: string; group: 'Navigate' | 'Read' | 'Modes' | 'Shell' }

export const commandList: CommandInfo[] = [
  { name: 'about', about: 'Who I am, in four lines', group: 'Read' },
  { name: 'whoami', about: 'Profile card', group: 'Read' },
  { name: 'neofetch', about: 'System information, Rajesh edition', group: 'Read' },
  { name: 'projects', about: 'List every project', group: 'Read' },
  { name: 'timeline', about: 'The career log, newest first', group: 'Read' },
  { name: 'skills', about: 'Skills and where they were used', group: 'Read' },
  { name: 'awards', about: 'Awards and recognition', group: 'Read' },
  { name: 'education', about: 'MSc Edinburgh and BTech', group: 'Read' },
  { name: 'open', args: '<name>', about: 'Open a project or section (try: open lexora)', group: 'Navigate' },
  { name: 'experience', about: 'Go to production work at Accenture', group: 'Navigate' },
  { name: 'research', about: 'Go to the publications', group: 'Navigate' },
  { name: 'certifications', about: 'Go to the credential vault', group: 'Navigate' },
  { name: 'youtube', about: 'Go to the teaching channels', group: 'Navigate' },
  { name: 'contact', about: 'How to reach me', group: 'Navigate' },
  { name: 'github', about: 'Open github.com/0krk0', group: 'Navigate' },
  { name: 'world', about: 'Enter Rajesh World', group: 'Modes' },
  { name: 'explorer', about: 'Browse the portfolio as a repository', group: 'Modes' },
  { name: 'web', about: 'Back to the web page', group: 'Modes' },
  { name: 'ls', args: '[dir]', about: 'List the portfolio tree', group: 'Shell' },
  { name: 'cat', args: '<file>', about: 'Print a file (about.txt, stack.txt, contact.txt)', group: 'Shell' },
  { name: 'git', args: 'log|status', about: 'The career, as git sees it', group: 'Shell' },
  { name: 'history', about: 'Commands you have run', group: 'Shell' },
  { name: 'theme', about: 'Toggle light and dark', group: 'Shell' },
  { name: 'clear', about: 'Clear the screen', group: 'Shell' },
  { name: 'exit', about: 'Close the terminal', group: 'Shell' },
];

/** Targets `open <name>` understands, beyond project names. */
export const openTargets: Record<string, string> = {
  experience: 'work', work: 'work', accenture: 'work', research: 'research', papers: 'research',
  education: 'now', msc: 'now', edinburgh: 'now', skills: 'stack', certifications: 'credentials', certificates: 'credentials',
  vault: 'credentials', awards: 'recognition', youtube: 'explain', contact: 'contact', archive: 'archive', timeline: 'top', graph: 'top',
};
