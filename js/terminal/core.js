// Terminal command logic. Pure: no DOM, no browser globals, so it runs under `node --test`.

export const COMMANDS = ['about', 'projects', 'education', 'socials', 'email', 'gui', 'echo', 'pwd', 'whoami', 'themes', 'history', 'welcome', 'help', 'clear'];
export const ALIASES = { resume: 'gui' };
export const THEMES = ['dark', 'light', 'dracula', 'nord', 'ubuntu', 'matrix'];
export const THEME_KEY = 'terminal-theme';

export function parse(input) {
    const tokens = String(input).trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) return { name: '', args: [] };
    const [first, ...args] = tokens;
    return { name: ALIASES[first] || first, args };
}

export function initialState(theme) {
    return { history: [], cursor: null, theme };
}

export function loadTheme(storage, prefersLight) {
    let saved = null;
    try { saved = storage ? storage.getItem(THEME_KEY) : null; } catch { saved = null; }
    if (THEMES.includes(saved)) return saved;
    return prefersLight ? 'light' : 'dark';
}

export function saveTheme(storage, theme) {
    try {
        if (!storage) return false;
        storage.setItem(THEME_KEY, theme);
        return true;
    } catch {
        return false;
    }
}

// ---- Output blocks ----
const text = (t) => ({ type: 'text', text: t });
const heading = (t) => ({ type: 'heading', text: t });
const link = (t, href) => ({ type: 'link', text: t, href });
const list = (items) => ({ type: 'list', items });

const HELP = {
    about: 'about Reksy',
    clear: 'clear the terminal',
    echo: 'print out anything',
    education: 'my education background',
    email: 'send an email to me',
    gui: 'go to my CV in GUI (alias: resume)',
    help: 'check available commands',
    history: 'view command history',
    projects: 'list my projects',
    pwd: 'print current working directory',
    socials: 'check out my social accounts',
    themes: "check available themes; 'themes set <name>' to switch",
    welcome: 'display hero section',
    whoami: 'about current user'
};

const SHORTCUTS = [
    'Tab or Ctrl + i  => autocompletes the command',
    'Up Arrow         => go back to previous command',
    'Ctrl + l         => clear the terminal'
].join('\n');

const emailOf = (data) => data.socials.find((s) => s.href.startsWith('mailto:')).href;

const handlers = {
    about: (state, data) => [
        heading(`${data.profile.name}, ${data.profile.title} at ${data.profile.employer}`),
        ...data.profile.summary.map(text),
        text(`Base: ${data.profile.location} · Stack: ${data.profile.stack}`)
    ],
    gui: (state, data, env) => [
        heading('Experience'),
        list(data.roles.map((r) => text(`${r.title} · ${r.company} · ${r.years}`))),
        link('Full CV: cv.html', data.profile.cvUrl),
        link('Résumé (PDF)' + (env.online ? '' : ' (needs a connection)'), data.profile.resumeUrl)
    ],
    projects: (state, data) => [
        heading('Repositories'),
        list(data.repos.map((r) => (r.url
            ? link(`${r.name} (${r.visibility}): ${r.line}`, r.url)
            : text(`${r.name} (${r.visibility}): ${r.line}`)))),
        link('Case studies and details: portfolio.html', data.profile.portfolioUrl)
    ],
    education: (state, data) => [
        heading('Education'),
        list(data.education.map((e) => text(`${e.school} · ${e.course} · ${e.years}`)))
    ],
    socials: (state, data) => [list(data.socials.map((s) => link(`${s.label}: ${s.href.replace(/^mailto:/, '')}`, s.href)))],
    email: (state, data) => [text(`Opening a new email to ${emailOf(data).replace(/^mailto:/, '')}…`)],
    echo: (state, data, env, args, rest) => {
        const said = rest.replace(/^(["'])(.*)\1$/, '$2'); // strip one pair of wrapping quotes
        return said ? [text(said)] : [];
    },
    pwd: () => [text('/home/visitor')],
    whoami: () => [text('visitor')],
    themes: (state, data, env, args) => {
        if (args[0] === 'set') {
            const name = args[1];
            if (THEMES.includes(name)) return { blocks: [text(`Theme set to ${name}.`)], theme: name };
            return [text(`Unknown theme: ${name || '(none)'}. Available: ${THEMES.join(', ')}.`)];
        }
        return [
            list(THEMES.map((t) => text(t === state.theme ? `${t} (current)` : t))),
            text("Switch with: themes set <name>")
        ];
    },
    history: (state) => [text(state.history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join('\n'))],
    help: () => [
        { type: 'list', plain: true, items: [...COMMANDS].sort().map((c) => ({ type: 'cmd', text: c, command: c, note: HELP[c] })) },
        text(SHORTCUTS)
    ]
};

export function run(input, state, data, env = { online: true }) {
    const { name, args } = parse(input);
    if (!name) return { output: [], state, clear: false, navigate: null, welcome: false };
    let next = { ...state, history: [...state.history, String(input).trim()], cursor: null };
    if (name === 'welcome') return { output: [], state: next, clear: false, navigate: null, welcome: true };
    if (name === 'clear') return { output: [], state: next, clear: true, navigate: null, welcome: false };
    const handler = handlers[name];
    if (!handler) {
        return { output: [text(`command not found: ${name}. Type 'help' to see available commands.`)], state: next, clear: false, navigate: null, welcome: false };
    }
    const rest = String(input).trim().replace(/^\S+\s*/, ''); // original case and spacing, for echo
    let output = handler(next, data, env, args, rest);
    if (!Array.isArray(output)) {
        next = { ...next, theme: output.theme };
        output = output.blocks;
    }
    // gui opens the CV page; email opens a mail draft; everything else stays in the terminal
    const navigate = { gui: data.profile.cvUrl, email: emailOf(data) }[name] || null;
    return { output, state: next, clear: false, navigate, welcome: false };
}

const commonPrefix = (words) => words.reduce((p, w) => {
    while (!w.startsWith(p)) p = p.slice(0, -1);
    return p;
});

export function complete(input) {
    const raw = String(input);
    const themeMatch = raw.toLowerCase().match(/^\s*themes\s+set\s+(\S*)$/);
    if (themeMatch) {
        const matches = THEMES.filter((t) => t.startsWith(themeMatch[1]));
        if (!matches.length) return { value: raw, matches };
        const head = raw.slice(0, raw.length - themeMatch[1].length);
        return { value: head + (matches.length === 1 ? matches[0] : commonPrefix(matches)), matches };
    }
    const prefix = raw.trim().toLowerCase();
    if (/\s/.test(prefix)) return { value: raw, matches: [] };
    const matches = [...COMMANDS, ...Object.keys(ALIASES)].filter((c) => c.startsWith(prefix));
    if (!matches.length) return { value: raw, matches };
    if (matches.length === 1) return { value: matches[0] + ' ', matches };
    return { value: commonPrefix(matches), matches };
}

export function stepHistory(state, direction) {
    const { history, cursor } = state;
    if (!history.length) return { state, value: '' };
    let next;
    if (direction < 0) next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
    else next = cursor === null || cursor + 1 >= history.length ? null : cursor + 1;
    return { state: { ...state, cursor: next }, value: next === null ? '' : history[next] };
}
