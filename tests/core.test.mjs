import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, initialState, loadTheme, saveTheme, THEME_KEY, THEMES } from '../js/terminal/core.js';

test('parse trims, lowercases and resolves aliases', () => {
    assert.deepEqual(parse('  RESUME  '), { name: 'gui', args: [] });
    assert.deepEqual(parse('Themes   SET  Nord'), { name: 'themes', args: ['set', 'nord'] });
    assert.deepEqual(parse(''), { name: '', args: [] });
    assert.equal(parse('portfolio').name, 'portfolio');
    assert.equal(parse('cv').name, 'cv');
});

test('loadTheme reads a valid saved theme', () => {
    assert.equal(loadTheme({ getItem: () => 'nord' }, false), 'nord');
});

test('loadTheme falls back on an invalid saved value', () => {
    assert.equal(loadTheme({ getItem: () => 'neon' }, true), 'light');
});

test('loadTheme survives storage that throws or is missing', () => {
    assert.equal(loadTheme({ getItem: () => { throw new Error('blocked'); } }, false), 'dark');
    assert.equal(loadTheme(null, false), 'dark');
});

test('saveTheme reports failure when storage throws', () => {
    assert.equal(saveTheme({ setItem: () => { throw new Error('blocked'); } }, 'nord'), false);
});

test('saveTheme writes under the theme key', () => {
    const calls = [];
    assert.equal(saveTheme({ setItem: (...a) => calls.push(a) }, 'nord'), true);
    assert.deepEqual(calls, [[THEME_KEY, 'nord']]);
    assert.equal(THEME_KEY, 'terminal-theme');
});

test('initialState starts empty', () => {
    assert.deepEqual(initialState('nord'), { history: [], cursor: null, theme: 'nord' });
});

// ---- Task 4: commands, autocomplete, history ----
import { run, complete, stepHistory, COMMANDS } from '../js/terminal/core.js';
import data from '../js/terminal/data.js';

const fresh = () => initialState('dracula');
const flat = (blocks) => blocks.flatMap((b) => (b.type === 'list' ? flat(b.items) : [b]));
const texts = (out) => flat(out).map((b) => b.text).join('\n');
const links = (out) => flat(out).filter((b) => b.type === 'link');

test('run: empty input prints nothing and records nothing', () => {
    const r = run('', fresh(), data);
    assert.equal(r.output.length, 0);
    assert.deepEqual(r.state.history, []);
});

test('run: unknown command', () => {
    const r = run('nope', fresh(), data);
    assert.equal(r.output[0].type, 'text');
    assert.equal(r.output[0].text, "command not found: nope. Type 'help' to see available commands.");
    assert.deepEqual(r.state.history, ['nope']);
});

test('run does not mutate the state it is given', () => {
    const s = fresh();
    run('about', s, data);
    assert.equal(s.history.length, 0);
});

test('run: about prints the summary', () => {
    assert.ok(texts(run('about', fresh(), data).output).includes(data.profile.summary[0]));
});

test('run: gui (and resume) link the CV page and the PDF, flagged offline', () => {
    const on = links(run('gui', fresh(), data).output);
    assert.ok(on.some((l) => l.href === 'cv.html'));
    assert.ok(on.some((l) => l.href === data.profile.resumeUrl));
    const off = links(run('gui', fresh(), data, { online: false }).output);
    assert.ok(off.find((l) => l.href === data.profile.resumeUrl).text.endsWith('(needs a connection)'));
});

test('run: projects lists every repo and links the portfolio', () => {
    const out = run('projects', fresh(), data).output;
    for (const repo of data.repos) assert.ok(texts(out).includes(repo.name), repo.name);
    assert.ok(links(out).some((l) => l.href === 'portfolio.html'));
});

test('run: socials includes the email link', () => {
    assert.ok(links(run('socials', fresh(), data).output).some((l) => l.href === 'mailto:reksy737@gmail.com'));
});

test('run: help has one cmd block per command', () => {
    const cmds = flat(run('help', fresh(), data).output).filter((b) => b.type === 'cmd');
    assert.deepEqual(cmds.map((b) => b.command), [...COMMANDS].sort());
});

test('run: themes set changes theme, case-insensitive', () => {
    assert.equal(run('themes set NORD', fresh(), data).state.theme, 'nord');
});

test('run: themes set with an unknown name keeps the theme and lists valid ones', () => {
    const r = run('themes set neon', fresh(), data);
    assert.equal(r.state.theme, 'dracula');
    assert.ok(texts(r.output).includes('dracula'));
});

test('run: themes marks the current theme', () => {
    assert.match(texts(run('themes', initialState('nord'), data).output), /nord.*current/);
});

test('run: clear sets the clear flag with no output', () => {
    const r = run('clear', fresh(), data);
    assert.equal(r.clear, true);
    assert.equal(r.output.length, 0);
});

test('run: history lists earlier commands, numbered', () => {
    let s = fresh();
    s = run('about', s, data).state;
    s = run('gui', s, data).state;
    const t = texts(run('history', s, data).output);
    assert.match(t, /1\s+about/);
    assert.match(t, /2\s+gui/);
});

test('complete: single, several, none, empty, themes, alias', () => {
    assert.deepEqual(complete('ab'), { value: 'about ', matches: ['about'] });
    const c = complete('e');
    assert.equal(c.value, 'e');
    assert.ok(c.matches.includes('echo') && c.matches.includes('email'));
    assert.deepEqual(complete('c').matches, ['clear']);
    assert.deepEqual(complete('xyz'), { value: 'xyz', matches: [] });
    const e = complete('');
    assert.equal(e.value, '');
    assert.equal(e.matches.length, 15);
    assert.equal(complete('themes set dr').value, 'themes set dracula');
    assert.equal(complete('themes set da').value, 'themes set dark');
    assert.equal(complete('res').value, 'resume ');
});

test('stepHistory: empty history does nothing', () => {
    const r = stepHistory(initialState('nord'), -1);
    assert.equal(r.value, '');
    assert.equal(r.state.cursor, null);
});

test('stepHistory: walks both ends', () => {
    let s = { ...fresh(), history: ['a', 'b'] };
    let r = stepHistory(s, -1); assert.equal(r.value, 'b');
    r = stepHistory(r.state, -1); assert.equal(r.value, 'a');
    r = stepHistory(r.state, -1); assert.equal(r.value, 'a');
    r = stepHistory(r.state, 1); assert.equal(r.value, 'b');
    r = stepHistory(r.state, 1); assert.equal(r.value, '');
    assert.equal(r.state.cursor, null);
});

test('run: gui and resume navigate to the CV page, cv does not', () => {
    assert.equal(run('gui', fresh(), data).navigate, 'cv.html');
    assert.equal(run('cv', fresh(), data).navigate, null);
    assert.equal(run('RESUME', fresh(), data).navigate, 'cv.html');
});

test('run: projects and portfolio do not navigate away from the terminal', () => {
    assert.equal(run('projects', fresh(), data).navigate, null);
    assert.equal(run('portfolio', fresh(), data).navigate, null);
});

test('run: other commands do not navigate', () => {
    for (const c of ['about', 'help', 'socials', 'themes', 'history', 'clear', 'nope', '']) {
        assert.equal(run(c, fresh(), data).navigate, null, c);
    }
});

test('themes: dark is the default dark theme and is listed first', () => {
    assert.equal(THEMES[0], 'dark');
    assert.deepEqual([...THEMES].sort(), ['dark', 'dracula', 'light', 'matrix', 'nord', 'ubuntu']);
    assert.equal(loadTheme(null, false), 'dark');
    assert.equal(run('themes set dark', initialState('nord'), data).state.theme, 'dark');
});

test('run: welcome asks the UI to reprint the welcome block', () => {
    const r = run('Welcome', fresh(), data);
    assert.equal(r.welcome, true);
    assert.equal(r.output.length, 0);
    assert.deepEqual(r.state.history, ['Welcome']);
    assert.equal(run('about', fresh(), data).welcome, false);
    assert.ok(COMMANDS.includes('welcome'));
});

test('help: alphabetical, every command described, shortcut table aligned', () => {
    const out = run('help', fresh(), data).output;
    const cmds = flat(out).filter((b) => b.type === 'cmd');
    assert.equal(cmds.length, COMMANDS.length);
    for (const b of cmds) assert.ok(b.note && b.note.length > 3, b.command);
    const t = texts(out);
    assert.match(t, /Tab or Ctrl \+ i\s+=> autocompletes the command/);
    assert.match(t, /Up Arrow\s+=> go back to previous command/);
    assert.match(t, /Ctrl \+ l\s+=> clear the terminal/);
});

test('echo prints the rest of the line as typed', () => {
    assert.equal(texts(run('echo Hello  World', fresh(), data).output), 'Hello  World');
    assert.equal(texts(run('ECHO "Hi there"', fresh(), data).output), 'Hi there');
    assert.equal(texts(run('echo <b>x</b>', fresh(), data).output), '<b>x</b>');
    assert.equal(run('echo', fresh(), data).output.length, 0);
});

test('education lists both schools from the CV', () => {
    const t = texts(run('education', fresh(), data).output);
    for (const e of data.education) {
        assert.ok(t.includes(e.school), e.school);
        assert.ok(t.includes(e.course), e.course);
    }
    assert.equal(data.education.length, 2);
});

test('email opens a mail draft, gui opens the CV page', () => {
    const r = run('email', fresh(), data);
    assert.equal(r.navigate, 'mailto:reksy737@gmail.com');
    assert.ok(texts(r.output).includes('reksy737@gmail.com'));
    assert.equal(run('gui', fresh(), data).navigate, 'cv.html');
});

test('pwd and whoami', () => {
    assert.equal(texts(run('pwd', fresh(), data).output), '/home/visitor');
    assert.equal(texts(run('whoami', fresh(), data).output), 'visitor');
});

test('complete: e lists echo, education, email', () => {
    const r = complete('e');
    assert.equal(r.value, 'e');
    assert.deepEqual([...r.matches].sort(), ['echo', 'education', 'email']);
    assert.equal(complete('ed').value, 'education ');
});
