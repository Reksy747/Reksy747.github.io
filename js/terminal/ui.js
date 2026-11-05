// Terminal page: DOM, keyboard and focus only. All command logic lives in core.js.
import { run, complete, stepHistory, initialState, loadTheme, saveTheme } from './core.js';
import data from './data.js';

const term = document.querySelector('.term');
const out = term.querySelector('.term__out');
const form = term.querySelector('.term__form');
const input = term.querySelector('#cmd');
const promptNode = term.querySelector('.term__form .term__prompt'); // coloured visitor@host prompt, already aria-hidden
const intro = term.querySelector('.term__intro');

let storage = null;
try { storage = window.localStorage; } catch { storage = null; }

let state = initialState(loadTheme(storage, window.matchMedia('(prefers-color-scheme: light)').matches));
document.documentElement.dataset.theme = state.theme;

const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
};

function renderBlock(block) {
    switch (block.type) {
        case 'heading': return el('p', 'term__heading', block.text);
        case 'link': {
            const a = el('a', null, block.text);
            a.href = block.href;
            if (/^https?:/.test(block.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
            return a;
        }
        case 'cmd': {
            const wrap = document.createDocumentFragment();
            const button = el('button', 'term__cmd', block.text);
            button.type = 'button';
            button.dataset.command = block.command;
            wrap.append(button);
            if (block.note) wrap.append(el('span', 'term__note', '- ' + block.note));
            return wrap;
        }
        case 'list': {
            const ul = el('ul', block.plain ? 'term__list term__list--plain' : 'term__list');
            for (const item of block.items) {
                const li = el('li');
                li.append(renderBlock(item));
                ul.append(li);
            }
            return ul;
        }
        default: return el('p', 'term__line', block.text);
    }
}

function print(nodes) {
    out.append(...nodes);
    const last = out.lastElementChild;
    if (last) last.scrollIntoView({ block: 'nearest' });
}

function echo(value) {
    const line = el('p', 'term__line term__echo');
    line.append(promptNode.cloneNode(true), document.createTextNode(' ' + value)); // the prompt clone is aria-hidden
    return line;
}

function execute(value) {
    const result = run(value, state, data, { online: navigator.onLine });
    const themeBefore = state.theme;
    state = result.state;
    if (result.welcome) {
        print([intro.cloneNode(true)]);
    } else if (result.clear) {
        out.replaceChildren();
    } else {
        print([echo(value), ...result.output.map(renderBlock)]);
    }
    if (state.theme !== themeBefore) {
        document.documentElement.dataset.theme = state.theme;
        saveTheme(storage, state.theme);
    }
    input.value = '';
    if (result.navigate) window.location.assign(result.navigate);
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    execute(input.value);
});

input.addEventListener('keydown', (event) => {
    if (event.isComposing || event.keyCode === 229) { // mobile/IME keyboards: Enter confirms the word, not the command
        if (event.key === 'Enter') event.preventDefault();
        return;
    }
    const ctrlI = event.ctrlKey && event.key.toLowerCase() === 'i';
    if (event.key === 'Tab' || ctrlI) {
        const { value, matches } = complete(input.value);
        // Keyboard users must be able to Tab out to the page links: only Ctrl+I, or a Tab that completes something, is kept
        if (!ctrlI && (event.shiftKey || !input.value.trim() || !matches.length)) return;
        event.preventDefault();
        input.value = value;
        if (matches.length > 1) print([echo(input.value), el('p', 'term__line term__muted', matches.join('  '))]);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        // Nothing to step through, or ArrowDown while not browsing: keep what the visitor typed
        if (!state.history.length || (event.key === 'ArrowDown' && state.cursor === null)) return;
        event.preventDefault();
        const step = stepHistory(state, event.key === 'ArrowUp' ? -1 : 1);
        state = step.state;
        input.value = step.value;
        input.setSelectionRange(step.value.length, step.value.length);
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
        // Only inside the terminal input, so the browser's own Ctrl+L works everywhere else
        event.preventDefault();
        out.replaceChildren();
    }
});

term.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-command]');
    if (button) {
        execute(button.dataset.command);
        // On touch screens focusing would pop the keyboard over the output just requested
        if (!window.matchMedia('(pointer: coarse)').matches) input.focus();
        return;
    }
    if (event.target.closest('a, button')) return;
    if (window.getSelection().toString() !== '') return; // keep the reader's text selection
    input.focus();
});

input.focus({ preventScroll: true });

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('Service worker not registered:', err));
    });
}
