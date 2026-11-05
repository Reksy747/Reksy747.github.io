# Terminal Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page with an interactive terminal that prints short CV and portfolio summaries and links to the full pages, moving today's CV to `cv.html`.

**Architecture:** Pure command logic in `js/terminal/core.js` (no DOM), summary data in `js/terminal/data.js`, and a thin DOM layer in `js/terminal/ui.js`, loaded as native ES modules without bundling. Themes are CSS variables compiled by gulp into `css/terminal.css`. A root `sw.js` serves pages, JS and CSS network-first and fonts and images cache-first.

**Tech Stack:** HTML, SCSS (gulp-sass), vanilla ES modules, Node 22 built-in test runner (`node --test`), ffmpeg for icons.

**Spec:** `docs/superpowers/specs/2026-11-06-terminal-home-design.md`

## Global Constraints

- **No git commits or pushes.** The owner commits. Every task ends with "leave uncommitted", not a commit.
- No new npm dependency, runtime or dev.
- The root `package.json` must not get `"type": "module"`, because `gulpfile.js` uses `require`. Only `js/terminal/package.json` contains `{"type":"module"}`.
- **Canonicals are self-referencing:**
  - `index.html` → `https://reksy747.github.io/`
  - `cv.html` → `https://reksy747.github.io/cv.html`
  - `portfolio.html` → `https://reksy747.github.io/portfolio.html`
  - Each page's `og:url` equals its canonical.
- No text, figure or claim that is not already in today's `index.html` or `portfolio.html`. Summaries copy existing sentences verbatim.
- Output is rendered with `textContent` and `href` attributes only, never `innerHTML` with data or user input.
- **Themes:** exactly `dracula`, `nord`, `ubuntu`, `matrix`, `light`.
  - localStorage key: `terminal-theme`.
  - Default: `light` when `prefers-color-scheme: light`, else `dracula`.
- **Commands:** `about`, `cv`, `projects`, `socials`, `themes`, `history`, `help`, `clear`. Aliases: `resume` → `cv`, `portfolio` → `projects`.
- **Unknown command text, exactly:** `command not found: <name>. Type 'help' to see available commands.`
- **Welcome line, exactly:** `Type 'help' to see available commands.`
- **Input attributes:** `autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="go"`, font size ≥ 16px.
- No horizontal scroll at 375px width on any page.
- **Service worker:**
  - `const VERSION = 'v1';`
  - Network-first for navigations, `.js` and `.css`. Cache-first for fonts and images.
  - Same-origin GET only; nothing else is handled.
- Résumé URL: `https://drive.google.com/file/d/1SHfUOhkKift7SdeT7EdSMaQGtsuMURkG/view?usp=sharing`

## Review Focus

1. **HTML in user input.** Typing `<img src=x onerror=alert(1)>` echoes as literal text and nothing executes. Pinned in Task 6 Step 4: the manual check, plus a source search for `innerHTML` in `ui.js`.
2. **Unavailable storage.**
   - localStorage throws (Safari private mode, blocked site data): the page still loads and themes work for the session.
   - The saved value is not a known theme: fall back to the default.
   - Pinned in Task 2: `loadTheme`/`saveTheme` tests with throwing and invalid stubs.
3. **Tab on empty input.** It lists all commands and leaves the input empty. Pinned in Task 4: `complete('')` test.
4. **ArrowUp with no history.** It leaves the input unchanged and doesn't throw. Pinned in Task 4: `stepHistory` on empty history.
5. **Enter while a mobile IME is composing.** It does not run the command: the keydown handler returns early when `event.isComposing`. Pinned in Task 6 Step 2 (code requirement) and Step 4 (manual check).

---

### Task 1: Move the CV to cv.html and fix every link

**Files:**
- Create: `cv.html`, a copy of today's `index.html`
- Modify:
  - `cv.html:12,14,27,67`
  - `portfolio.html:63,77,345`
  - `.impeccable/config.json:28`
  - `PRODUCT.md:47`

**Interfaces:**
- Produces: `cv.html` at `https://reksy747.github.io/cv.html`, holding all CV content and section ids (`#experience`, `#projects`, `#skills`, `#education`, `#organizations`, `#certifications`, `#contact`).

- [ ] **Step 1: Copy the page:** `cp index.html cv.html`. `index.html` is replaced in Task 6. Until then both files are identical.
- [ ] **Step 2: Edit `cv.html`:**
  - Canonical, `og:url` and the JSON-LD `ProfilePage` `url` (line 27) → `https://reksy747.github.io/cv.html`.
  - The `Person.url` (line 39) stays `https://reksy747.github.io/`.
  - Page switch (line 67): `<a href="/">Terminal</a>`, then `<a href="cv.html" aria-current="page">CV</a>`, then `<a href="portfolio.html">Portfolio</a>`.
- [ ] **Step 3: Edit `portfolio.html`:**
  - Line 63 → `href="cv.html"`, and add `<a href="/">Terminal</a>` before it.
  - Line 77 → `href="cv.html"`.
  - Line 345 → `href="cv.html#contact"`.
- [ ] **Step 4: Edit config and docs:**
  - `.impeccable/config.json` line 28: the `cramped-padding` entry lists `"index.html", "cv.html"`.
  - `PRODUCT.md` line 47: `index.html` → `cv.html`.
- [ ] **Step 5: Verify:**
  - Run `grep -n 'href="index.html' cv.html portfolio.html`. Expected: no output.
  - Run `grep -c 'reksy747.github.io/cv.html' cv.html`. Expected: `3`.
- [ ] **Step 6: Leave uncommitted.**

### Task 2: Test harness, parse and theme storage

**Files:**
- Create:
  - `js/terminal/package.json`: `{"type":"module"}`
  - `js/terminal/core.js`
  - `tests/core.test.mjs`
- Modify: `package.json`: add `"test": "node --test tests/"` to `scripts`.

**Interfaces:**
- Produces, from `core.js`:
  - `COMMANDS: string[]`, in the order `['about','cv','projects','socials','themes','history','help','clear']`
  - `ALIASES: { resume: 'cv', portfolio: 'projects' }`
  - `THEMES: ['dracula','nord','ubuntu','matrix','light']`
  - `THEME_KEY = 'terminal-theme'`
  - `parse(input: string) → { name: string, args: string[] }`
  - `initialState(theme: string) → { history: [], cursor: null, theme }`
  - `loadTheme(storage: {getItem} | null, prefersLight: boolean) → string`
  - `saveTheme(storage: {setItem} | null, theme: string) → boolean`

- [ ] **Step 1: Write failing tests in `tests/core.test.mjs`**, using `node:test` and `node:assert/strict` and importing from `../js/terminal/core.js`:
  - `parse('  RESUME  ')` deep-equals `{ name: 'cv', args: [] }`.
  - `parse('Themes   SET  Nord')` deep-equals `{ name: 'themes', args: ['set','nord'] }`.
  - `parse('')` deep-equals `{ name: '', args: [] }`.
  - `parse('portfolio')` gives `.name === 'projects'`.
  - `loadTheme({ getItem: () => 'nord' }, false) === 'nord'`.
  - `loadTheme({ getItem: () => 'neon' }, true) === 'light'`, for an invalid saved value.
  - `loadTheme({ getItem: () => { throw new Error() } }, false) === 'dracula'`.
  - `loadTheme(null, false) === 'dracula'`.
  - `saveTheme({ setItem: () => { throw new Error() } }, 'nord') === false`.
  - `saveTheme` with a recording stub returns `true` and was called with `('terminal-theme', 'nord')`.
  - `initialState('nord')` deep-equals `{ history: [], cursor: null, theme: 'nord' }`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, cannot find module `core.js` or missing exports.
- [ ] **Step 3: Implement the exports above in `core.js`.**
  - `parse` splits on `/\s+/` after trim, lowercases all tokens and maps the first through `ALIASES`.
  - Storage access sits inside try/catch.
- [ ] **Step 4: Verify:**
  - Run `npm test`. Expected: all tests PASS.
  - Run `npm run build`. Expected: finishes without error, proving the gulpfile is still CommonJS-safe.
- [ ] **Step 5: Leave uncommitted.**

### Task 3: Summary data and the sync guard

**Files:**
- Create:
  - `js/terminal/data.js`
  - `tests/data-sync.test.mjs`

**Interfaces:**
- Produces: `export default { profile, roles, repos, socials }`, where:
  - `profile`:
    - `name: 'Petrus Chanel Reksy Arfila'`
    - `title: 'DevOps Engineer'`
    - `employer: 'MEMBER.ID'`
    - `location: 'South Jakarta · Hybrid'`
    - `stack: 'GCP · Alibaba Cloud · AWS · Kubernetes'`
    - `summary: string[2]`
    - `resumeUrl` (the Global Constraints value), `cvUrl: 'cv.html'`, `portfolioUrl: 'portfolio.html'`
  - `roles: { title, company, years }[]`, newest first.
  - `repos: { name, line, url: string | null, visibility: 'Public' | 'Private' }[]`, in `portfolio.html` order.
  - `socials: { label, href }[]`:
    - `GitHub` → `https://github.com/Reksy747`
    - `LinkedIn` → `https://www.linkedin.com/in/reksy/`
    - `Email` → `mailto:reksy737@gmail.com`

- [ ] **Step 1: Write the failing test `tests/data-sync.test.mjs`.**
  - It reads `cv.html` and `portfolio.html` with `fs.readFileSync`.
  - It decodes `&amp;` → `&` and `&middot;` → `·`.
  - Test `every role title and company appears in cv.html`: asserts `html.includes(r.title)` and `html.includes(r.company)` for each role.
  - Test `every repo name appears in portfolio.html`: the same check for each repo name.
  - Test `data has seven roles and eight repos`. `cv.html` has seven `.leg__title` roles and `portfolio.html` has eight `.repo` items.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, `data.js` not found.
- [ ] **Step 3: Fill in `data.js`.**
  - `profile.summary` is exactly two sentences, copied verbatim:
    - `[0]`: `cv.html` `.summary__lede`
    - `[1]`: the first sentence of `portfolio.html` `.intro`
  - `roles`, in this order:

    | title | company | years |
    |---|---|---|
    | DevOps Engineer | MEMBER.ID | 2023–present |
    | Site Reliability Engineer | Pegipegi | 2021–2023 |
    | Assistant Lecturer, Administration Systems | Duta Wacana Christian University | 2021 |
    | Backend Developer | Dutatani.id, Duta Wacana Christian University | 2020–2021 |
    | Computer Technician | Freelance | 2017–2021 |
    | IT Support Technician | SMK Petrus Kanisius Klaten | 2016–2017 |
    | IT Support Technician | Gadjah Mada University (UGM) | 2016 |  - `repos`: the eight `.repo` items of `portfolio.html`.
    - `name` comes from `.repo__name`.
    - `line` is the first sentence of the repo's description `<p>`, verbatim.
    - `url` is the `<a>` href, or `null` when the name has no link.
    - `visibility` comes from `.repo__vis`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Check the guard:** temporarily rename one role title in `data.js` and run `npm test`. It must FAIL naming that title. Then revert.
- [ ] **Step 6: Leave uncommitted.**

### Task 4: Commands, autocomplete and history

**Files:**
- Modify:
  - `js/terminal/core.js`
  - `tests/core.test.mjs`

**Interfaces:**
- Consumes:
  - From Task 2: `parse`, `COMMANDS`, `ALIASES`, `THEMES`, `initialState`.
  - The data shape from Task 3, imported in tests as the default export of `../js/terminal/data.js`.
- Produces:
  - `run(input: string, state, data, env = { online: true }) → { output: Block[], state, clear: boolean }`
  - `complete(input: string) → { value: string, matches: string[] }`
  - `stepHistory(state, direction: -1 | 1) → { state, value: string }`
  - `Block` is one of:
    - `{type:'text',text}`
    - `{type:'heading',text}`
    - `{type:'link',text,href}`
    - `{type:'cmd',text,command}`
    - `{type:'list',items:Block[]}`

- [ ] **Step 1: Write failing tests:**
  - **Basics:**
    - `run('', s, data)` gives `output.length === 0`, and the history is unchanged.
    - `run('nope', s, data)` gives a text block equal to the exact unknown-command string, and `state.history` deep-equals `['nope']`.
    - `run` does not mutate its input: after `run('about', s, data)`, `s.history.length === 0`.
  - **Command output:**
    - `run('about', …)`: the output contains `data.profile.summary[0]`.
    - `run('resume', …)`:
      - The output contains a link with `href: 'cv.html'` and a link with `href === data.profile.resumeUrl`.
      - With `env {online:false}`, the PDF link text ends with `(needs a connection)`.
    - `run('projects', …)`: the output contains every repo name and a link with `href: 'portfolio.html'`.
    - `run('socials', …)`: the output contains a link with `href: 'mailto:reksy737@gmail.com'`.
    - `run('help', …)`: the output contains one `cmd` block per `COMMANDS` entry, each with `command === name`.
  - **Themes:**
    - `run('themes set NORD', …)` gives `state.theme === 'nord'`.
    - `run('themes set neon', …)` leaves the theme unchanged, and the output text includes `dracula`.
    - `run('themes', …)` marks the current theme.
  - **Other commands:**
    - `run('clear', …)` gives `clear === true` and an empty output.
    - `run('history', …)` after two commands lists both, numbered.
  - **Autocomplete:**
    - `complete('ab')` deep-equals `{ value: 'about ', matches: ['about'] }`.
    - `complete('c')`: the value is `'c'` and the matches include `'cv'` and `'clear'`.
    - `complete('xyz')` deep-equals `{ value: 'xyz', matches: [] }`.
    - `complete('')`: the value is `''` and the matches have length 10 (8 commands + 2 aliases).
    - `complete('themes set d')` gives the value `'themes set dracula'`.
    - `complete('res')` gives the value `'resume '`.
  - **History:**
    - `stepHistory(initialState('nord'), -1)` gives the value `''`, the cursor is `null`, and it doesn't throw.
    - With the history `['a','b']`:
      - Stepping `-1` gives `'b'`.
      - `-1` again gives `'a'`.
      - `-1` again stays `'a'`.
      - Then `+1` gives `'b'`, and `+1` again gives `''` with the cursor `null`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, `run`/`complete`/`stepHistory` are not exported.
- [ ] **Step 3: Implement in `core.js`:**
  - `run` dispatches on `parse(input).name` through a plain object of handlers, one per command, each returning `Block[]`.
  - Any non-empty input is appended to the history and resets the cursor.
  - `help` descriptions are one line each. Its shortcuts block reads, exactly: `Tab / Ctrl+I: complete · ↑ / ↓: history · Ctrl+L: clear`.
  - `complete` completes the first token against `[...COMMANDS, ...Object.keys(ALIASES)]`. When the tokens are `themes set <prefix>`, it completes against `THEMES`.
    - One match: the full word plus a trailing space for commands, no trailing space for theme names.
    - Several matches: the longest common prefix.
- [ ] **Step 4: Run** `npm test`. Expected: all PASS.
- [ ] **Step 5: Leave uncommitted.**

### Task 5: Terminal themes stylesheet

**Files:**
- Create: `scss/terminal.scss`
- Modify: `gulpfile.js`
  - Add a `terminal-styles` task, the same pipeline as `styles` with `src('./scss/terminal.scss')`.
  - Add it to `build`, and to `watch` on `./scss/terminal.scss`.
- Generated: `css/terminal.css`

**Interfaces:**
- Produces:
  - **Variables:** each `[data-theme="<name>"]` on `<html>` defines `--term-bg`, `--term-fg`, `--term-muted`, `--term-accent`, `--term-link`, `--term-prompt`.
  - **Classes used by Task 6:**
    - `.term`, `.term__banner--wide`, `.term__banner--narrow`
    - `.term__out`, `.term__line`, `.term__heading`, `.term__cmd` (button), `.term__list`
    - `.term__form`, `.term__prompt`, `.term__input`
    - `.site-nav`, `.sr-only`
  - **Fonts:** reuse the existing `@font-face` for JetBrains Mono 500 from `fonts/`.

- [ ] **Step 1: Write the stylesheet with the five theme blocks.**
  - Colours:
    - `dracula`: `#282a36` background, `#f8f8f2` text
    - `nord`: `#2e3440` / `#d8dee9`
    - `ubuntu`: `#300a24` / `#ffffff`
    - `matrix`: `#000000` / `#00ff41`
    - `light`: `#fafafa` / `#1f2328`
    - Pick the accent, link, prompt and muted colours per theme so each reaches ≥ 4.5:1 against its background.
  - **Layout:**
    - `.term__out` and `.term__line` use `white-space: pre-wrap; overflow-wrap: anywhere`.
    - `.term__input` uses `font-size: 1rem`.
    - `.term__banner--narrow` is hidden at ≥ 600px and `.term__banner--wide` below 600px.
    - `.term__cmd` is reset to look like inline text in `--term-accent` with an underline, and has a visible `:focus-visible` outline.
    - `html { scroll-behavior: smooth }` applies only inside `@media (prefers-reduced-motion: no-preference)`.
- [ ] **Step 2: Build:** run `npm run build`. Expected: finishes, and `css/terminal.css` exists.
- [ ] **Step 3: Check contrast:** run a one-off Node script in the scratchpad that applies the WCAG relative-luminance formula to every colour pair. The script is not part of the repo.
  - Pairs per theme: `--term-fg`, `--term-muted`, `--term-accent`, `--term-link` and `--term-prompt`, each against `--term-bg`.
  - Expected: every ratio ≥ 4.5.
- [ ] **Step 4: Leave uncommitted.**

### Task 6: Terminal page and UI layer

**Files:**
- Replace: `index.html`
- Create: `js/terminal/ui.js`

**Interfaces:**
- Consumes:
  - From Task 2: `loadTheme`, `saveTheme`, `initialState`, `THEME_KEY`.
  - From Task 4: `run`, `complete`, `stepHistory`.
  - Data: the default export from Task 3.
  - Styles: the classes from Task 5.

- [ ] **Step 1: Write the new `index.html`:**
  - **Head:**
    - Title `Petrus Chanel Reksy Arfila — DevOps Engineer`.
    - The meta description, Open Graph and Twitter tags copied from `cv.html`, with `og:url` and the canonical set to `https://reksy747.github.io/`.
    - The `ProfilePage`/`Person` JSON-LD copied from `cv.html`, with `ProfilePage.url` set to `https://reksy747.github.io/`.
    - `<link rel="manifest" href="manifest.webmanifest">` (file from Task 7).
    - `<link rel="stylesheet" href="css/terminal.css">`.
    - An inline script in `<head>` that applies the saved theme before first paint. It follows `loadTheme`'s rules, inlined because modules load deferred: read the stored theme; if it's missing or not one of the five, use the colour-scheme default; set `document.documentElement.dataset.theme`; all in try/catch.
  - **Body, in order:**
    - `<nav class="site-nav">` with plain links: `/` (Terminal, `aria-current="page"`), `cv.html`, `portfolio.html`, and the résumé URL (opens in a new tab with `rel="noopener noreferrer"`).
    - `<main class="term">`, containing:
      - `<h1 class="sr-only">Petrus Chanel Reksy Arfila</h1>`
      - `<p class="sr-only">`: the title, employer and stack from `data.js` `profile`, written as static text.
      - The two `<pre aria-hidden="true">` banners. Write original block lettering of "REKSY": wide ≤ 60 columns, narrow ≤ 30 columns.
      - The static welcome line, as exact copy.
      - `<div class="term__out" role="log" aria-live="polite">`.
      - `<form class="term__form">`, containing:
        - The prompt `reksy@github:~$`.
        - `<label class="sr-only" for="cmd">command</label>`.
        - The `<input id="cmd">` with every attribute from Global Constraints.
    - `<noscript>`: "This terminal needs JavaScript. Read the <a href="cv.html">full CV</a> or the <a href="portfolio.html">portfolio</a>."
    - `<footer>` with the same links as the navbar.
    - `<script type="module" src="js/terminal/ui.js"></script>`.
- [ ] **Step 2: Write `ui.js`:**
  - **Startup:** build the state with `initialState(loadTheme(storage, matchMedia('(prefers-color-scheme: light)').matches))`. Get `storage` from `try { localStorage } catch { null }`.
  - **Rendering:**
    - `render(blocks)` creates elements with `textContent` and `href` only.
    - `cmd` blocks become `<button type="button" class="term__cmd">`; clicking one runs `command` and focuses the input.
    - External links get `target="_blank" rel="noopener noreferrer"`.
  - **Form submit (Enter):**
    1. Echo the prompt and input as text.
    2. Call `run(value, state, data, { online: navigator.onLine })`.
    3. If `clear`, empty `.term__out`; otherwise append the output.
    4. If the theme changed, set `dataset.theme` and call `saveTheme`.
    5. Clear the input and scroll the last line into view.
  - **Keydown on the input:**
    - Return early when `event.isComposing`.
    - Tab, or Ctrl+I → `preventDefault`, then `complete`. If there are several matches, print them as one text line.
    - ArrowUp / ArrowDown → `preventDefault`, then `stepHistory`, then set the value and move the caret to the end.
  - **Document keydown:** Ctrl+L → `preventDefault`, then clear the output.
  - **Click on `.term`:** focus the input unless `getSelection().toString() !== ''` or `event.target.closest('a, button')`.
  - **Service worker:** register `/sw.js` on `load` when `'serviceWorker' in navigator`; `catch` → `console.warn`.
- [ ] **Step 3: Verify the build and markup:**
  - Run `npm test && npm run build`. Expected: PASS and finished.
  - Run `grep -n innerHTML js/terminal/ui.js`. Expected: no output.
  - Run `node -e "for (const m of require('fs').readFileSync('index.html','utf8').matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]); console.log('ok')"`. Expected: `ok`.
- [ ] **Step 4: Check in the browser pane at `http://localhost:5173/`:**
  - The welcome banner and line show.
  - `help` lists buttons, and tapping `about` prints the summary.
  - Tab on `ab` gives `about `. Tab on an empty input lists the commands.
  - ↑/↓ cycle through the history, and ↑ with no history does nothing.
  - Ctrl+L clears.
  - Selecting output text with the mouse doesn't steal focus.
  - `themes set nord` switches the theme and keeps it after a reload.
  - `<img src=x onerror=alert(1)>` echoes as text with no alert.
  - At 375px, `document.documentElement.scrollWidth <= innerWidth` holds after `cv` and `projects`, and the narrow banner shows.
  - The navbar links reach `cv.html` and `portfolio.html`.
  - With JavaScript disabled, the noscript links and the navbar show.
  - **IME check (Review Focus 5):** in the console, dispatch a `keydown` with `{key:'Enter', isComposing:true}` on the input; no new output line appears.
- [ ] **Step 5: Leave uncommitted.**

### Task 7: Manifest, icons and service worker

**Files:**
- Create:
  - `manifest.webmanifest`
  - `sw.js`
  - `images/icon-192.png`, `images/icon-512.png`
- Modify: scratchpad `serve.js`, the `types` map: add `'.mjs': 'text/javascript'` and `'.webmanifest': 'application/manifest+json'`. Restart the `cv` preview.

**Interfaces:**
- Consumes: the registration in `ui.js` (Task 6).
- Produces: a service worker at the root scope `/`.

- [ ] **Step 1: Make the icons:**
  - `ffmpeg -y -i images/profile.png -vf scale=192:192 images/icon-192.png`
  - The same command with `512:512` → `images/icon-512.png`.
- [ ] **Step 2: Write `manifest.webmanifest`:**
  - `name: "Petrus Chanel Reksy Arfila — Terminal"`, `short_name: "Reksy"`
  - `start_url: "/"`, `scope: "/"`, `display: "standalone"`
  - `background_color` and `theme_color`: `#282a36`
  - Two icons, each with `purpose: "any"`.
- [ ] **Step 3: Write `sw.js`:**
  - `VERSION` and a `PRECACHE` list:
    - `/`, `/cv.html`, `/portfolio.html`
    - `/css/styles.css`, `/css/terminal.css`
    - `/js/scripts.min.js`, `/js/terminal/core.js`, `/js/terminal/data.js`, `/js/terminal/ui.js`
    - every file in `fonts/`
    - `/images/profile-192.webp`, `/images/icon-192.png`
  - **install:** `addAll`, then `skipWaiting()`.
  - **activate:** delete every key `!== VERSION`, then `clients.claim()`.
  - **fetch:** handle only when `request.method === 'GET'` and the origin is the same.
    - Navigations, `.js` and `.css` → network-first. `cache.put` only when `response.ok`. When offline, fall back to the cache, then to the cached `/` for navigations.
    - Otherwise → cache-first, then the network.
  - The top comment says: `bump VERSION when you deploy changes to cached files`.
- [ ] **Step 4: Verify in the browser pane:**
  - Run `navigator.serviceWorker.ready.then(r => r.active.state)`. Expected: `"activated"`.
  - Run `caches.keys()`. Expected: `["v1"]`.
  - Then edit `index.html`'s welcome copy locally and reload while online: the new text shows (network-first). Revert.
  - Run `fetch('/manifest.webmanifest').then(r => r.headers.get('content-type'))`. Expected: a value containing `manifest+json`.
  - Offline check: in `sw.js` temporarily replace `fetch(` with `Promise.reject(` inside the network-first branch only, reload, and confirm `/`, `cv.html` and `portfolio.html` still render. Revert, and bump nothing.
- [ ] **Step 5: Leave uncommitted.**

### Task 8: Docs and final checks

**Files:**
- Modify:
  - `DESIGN.md`: add a short "Terminal home" section listing the theme tokens, the `.term*` classes and the 600px banner switch.
  - `.impeccable/surfaces/index-html.md` line 8: `CV (index.html)` → `CV (cv.html)`, plus `primary_target: "cv.html"`.

- [ ] **Step 1: Update the two docs as listed.**
- [ ] **Step 2: Run all checks:**
  - `npm test && npm run build && npx impeccable detect --json index.html cv.html portfolio.html`. Expected: tests PASS, build finished, detector `[]`.
- [ ] **Step 3: Check all three pages at 375px and 1280px:** no horizontal scroll, and the navbar links work. Then run `git status` and report the changed and new files to the owner. Leave everything uncommitted.
