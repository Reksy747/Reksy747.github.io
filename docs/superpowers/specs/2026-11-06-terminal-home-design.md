# Terminal home page: design

Date: 2026-11-06. Status: approved in chat, awaiting written-spec review.

## Goal

Make `reksy747.github.io` an interactive terminal that shows Petrus Chanel Reksy Arfila is a hands-on DevOps engineer. The terminal prints short summaries and links to the full CV and portfolio pages, so one detailed copy of the career history exists (the HTML pages) and the terminal never drifts from it unnoticed.

The mechanics follow the idea of Sat Naing's open-source terminal portfolio (command prompt, themes, autocomplete, history). None of its code, ASCII art or styling is copied.

## Decisions already made

- The terminal replaces the home page. The current CV moves to `cv.html`; `portfolio.html` stays.
- Plain JavaScript ES modules, no framework, no new runtime or dev dependency. Tests use Node's built-in runner (Node 22 is installed).
- Commands print summaries that link to the full pages.
- `help` lists commands as tappable buttons for phone users.
- Nothing is committed by the assistant; the owner commits and pushes.
- No figures, metrics or claims beyond what `cv.html` and `portfolio.html` already state.

## 1. Pages and SEO

| Page | Content | Canonical |
|---|---|---|
| `index.html` | Terminal | `https://reksy747.github.io/` |
| `cv.html` | Today's `index.html`, unchanged except head tags and links | `https://reksy747.github.io/cv.html` |
| `portfolio.html` | Unchanged except the CV link | `https://reksy747.github.io/portfolio.html` (as now) |

Every canonical is self-referencing, and each page's `og:url` equals its canonical. `index.html` must never point its canonical at `cv.html`.

`index.html` without JavaScript still has:

- JSON-LD `ProfilePage` / `Person` data, the same as today's CV page. `cv.html` keeps its own copy.
- A top navbar of plain `<a>` links: Terminal · CV · Portfolio · Résumé (PDF). The same links in the footer.
- A plain `<h1>` with the name and a short `<p>` summary (role, employer, stack).
- A `<noscript>` note pointing to `cv.html`.
- Title and meta description that name the role, plus Open Graph and Twitter tags reusing `images/og-card.png`.

Links to update:

- The portfolio page switch "CV" link → `cv.html`.
- `cv.html` page switch gains a "Terminal" link to `/`.
- Every `index.html#…` link → `cv.html#…`.
- The portfolio JSON-LD `author` URL stays the root domain.

## 2. Modules

```
js/terminal/package.json   {"type":"module"}  (scopes ES modules to this folder for Node)
js/terminal/core.js        pure logic, no DOM, no browser APIs
js/terminal/data.js        summary data only
js/terminal/ui.js          DOM, keyboard, focus, theme, storage, service-worker registration
```

`index.html` loads only `<script type="module" src="js/terminal/ui.js">`. `cv.html` and `portfolio.html` keep `js/scripts.min.js`.

### core.js exports

- `COMMANDS`: the list of command names: `about`, `cv`, `projects`, `socials`, `themes`, `history`, `help`, `clear`.
- `ALIASES`: `resume` → `cv`, `portfolio` → `projects`.
- `THEMES`: `dracula`, `nord`, `ubuntu`, `matrix`, `light`.
- `parse(input)` → `{ name, args }`. Trims, collapses whitespace, lowercases the name and the arguments, resolves aliases. Empty input → `{ name: '', args: [] }`.
- `run(input, state, data, env = { online: true })` → `{ output, state, clear }`. `env` is supplied by the UI, so core never reads `navigator`.
  - It never mutates `state`; it returns a new one.
  - Every non-empty input is appended to `state.history`, including unknown commands. The history cursor resets.
  - `output` is an array of blocks:
    - `{ type: 'text', text }`
    - `{ type: 'heading', text }`
    - `{ type: 'link', text, href }`
    - `{ type: 'cmd', text, command }`, rendered as a button that runs `command`
    - `{ type: 'list', items: [block] }`
  - An unknown command gives the output `command not found: <name>. Type 'help' to see available commands.`
  - `clear` gives an empty output and `clear: true`.
  - Empty input gives an empty output and no history entry.
- `complete(input)` → `{ value, matches }`:
  - Completing the command name: one match fills it in plus a trailing space; several matches fill in the longest common prefix and return the matches; no match leaves the input unchanged.
  - After `themes set `, it completes theme names the same way.
  - Aliases are included as candidates.
- `stepHistory(state, direction)` → `{ state, value }`:
  - `-1` is ArrowUp (older), `+1` is ArrowDown (newer).
  - The cursor stops at the oldest entry.
  - Stepping past the newest entry returns an empty value.
- `initialState(theme)` → `{ history: [], cursor: null, theme }`.

### Command output

- **Look and welcome (added 2026-11-06):** a sixth theme `dark` (navy) is the new default dark theme, listed first. The prompt is `visitor@reksy747.github.io:~$`. A `welcome` command reprints the static welcome block (one 58-column block-letter "REKSY" banner, sized with the viewport, replaces the wide/narrow pair); `run` returns `welcome: true` for it.
- **More commands (added 2026-11-06):** `education` (two schools from `data.js`, guarded by the sync test), `email` (navigates to the `mailto:` link), `gui` (navigates to `cv.html`), `echo` (prints the rest of the line in its original case, one pair of wrapping quotes removed), `pwd` (`/home/visitor`), `whoami` (`visitor`). `help` lists every command alphabetically as an aligned table (`name - description`) followed by the shortcut lines with `=>`.
- **No navbar (changed 2026-11-06, owner's call):** the top navbar and footer links were removed from `index.html`; plain links to `cv.html` and `portfolio.html` remain only in `<noscript>`, plus the JSON-LD. `cv.html` and `portfolio.html` keep their page switch.
- **Navigation (added 2026-11-06):** `run` also returns `navigate`: `'cv.html'` for `cv`/`resume`, `'portfolio.html'` for `projects`/`portfolio`, otherwise `null`. The UI opens that page right after printing.
- **about:** two-sentence summary, current role, base location.
- **cv:**
  - Each role as `title · company · years`, newest first.
  - Then a link to `cv.html` and a link to the Drive résumé PDF.
  - When `env.online` is false, the PDF link carries "(needs a connection)".
- **projects:** each repository as name, one line and its URL, then a link to `portfolio.html`.
- **socials:** GitHub, LinkedIn, email (`mailto:`).
- **themes:** lists the themes and marks the current one.
- **themes set &lt;name&gt;:** sets `state.theme`. An unknown name lists the valid ones and leaves the theme unchanged.
- **history:** numbered list of this session's commands.
- **help:** one `cmd` block per command with a one-line description, plus the keyboard shortcuts.

## 3. data.js and staying in sync

`data.js` holds only facts that rarely change:

- Name, current title, employer, base location, stack line, two-sentence summary.
- Roles: `{ title, company, years }`, no bullets.
- Repositories: `{ name, line, url }`, the same eight as `portfolio.html`.
- Social links and the résumé URL.

Bullets, skills, certifications, education, organizations and case studies stay only in the HTML pages.

**Sync guard:** `tests/data-sync.test.mjs` reads `cv.html` and `portfolio.html` as text and fails if any `title` or `company` in `data.js` is missing from `cv.html`, or any repository `name` is missing from `portfolio.html`. The match ignores HTML entities such as `&amp;`.

## 4. Terminal behaviour, themes and mobile

### Welcome screen

- An ASCII banner in original lettering of "REKSY". There are two versions: a wide one, and a narrow one under 600px, switched by CSS. A 375px viewport never scrolls sideways.
- Both banners are `aria-hidden="true"`; the `<h1>` carries the name.
- Then the line: `Type 'help' to see available commands.`

### Keys and focus

- **Enter:** runs the input.
- **Tab or Ctrl+I:** runs `complete`. The default action is prevented only while the input has focus.
- **ArrowUp / ArrowDown:** run `stepHistory` and put the value in the input with the caret at the end.
- **Ctrl+L:** clears the screen, the same as `clear`; the browser default is prevented.
- **Clicking the terminal:** focuses the input, except when:
  - `getSelection().toString()` is non-empty, or
  - the click is on a link or button.
- Tapping a `cmd` button runs that command as if typed, then returns focus to the input.

### Input element

```html
<label class="sr-only" for="cmd">command</label>
<input id="cmd" type="text" autocapitalize="off" autocomplete="off"
       autocorrect="off" spellcheck="false" enterkeyhint="go">
```

Font size is at least 16px, so iOS does not zoom.

### Output and layout

- **Output area:** `role="log"` with `aria-live="polite"`.
- **Wrapping:** `white-space: pre-wrap; overflow-wrap: anywhere` on output and prompt.
- **Scrolling:** the newest output scrolls into view after each command.
- **Phones:** no sideways scroll at 375px.
- **Motion:** none beyond scrolling; `scroll-behavior` respects reduced motion.

### Themes

- **Definitions:**
  - `scss/terminal.scss` defines each theme as CSS variables under `[data-theme="<name>"]`.
  - It is built by a new gulp `terminal-styles` task into `css/terminal.css`, added to `build` and `watch`.
  - Every theme meets WCAG AA contrast for body text.
- **Storage:** the choice is saved under `localStorage['terminal-theme']`. Every read and write is wrapped in try/catch; without storage, the theme works for the session only.
- **First visit:** with no saved value, `prefers-color-scheme: light` gets `light`, otherwise `dracula`.
- **No flash:** a small inline script in `<head>` sets `data-theme` before first paint.
- **Separate from the CV:** the terminal themes do not affect `cv.html` or `portfolio.html`, which keep their own light and dark modes.

## 5. PWA and offline

### manifest.webmanifest

- `name`, `short_name`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `background_color`, `theme_color`.
- Icons at 192px and 512px, generated with ffmpeg from `images/profile.png` (1337px source), as `images/icon-192.png` and `images/icon-512.png`.

### sw.js (site root)

- `const VERSION = 'v1';` with a comment: bump on every deploy that changes cached files.
- **Install:** pre-caches:
  - `/`, `cv.html`, `portfolio.html`
  - `css/styles.css`, `css/terminal.css`
  - `js/scripts.min.js`, `js/terminal/*.js`
  - the font files
  - `images/profile-192.webp`
- **Fetch:** only same-origin GET requests are handled. Everything else passes through untouched, including the Formspree POST, the Drive PDF and GitHub.
  - **Network-first** for HTML navigations, `.js` and `.css`: fetch, put the response in the cache, return it; on network failure, return the cached copy. For an uncached navigation offline, return the cached `/`.
  - **Cache-first** for fonts and images.
- **Activate:** deletes every cache not named after the current `VERSION`, then calls `clients.claim()`.
- **Registration:** `ui.js` registers `/sw.js` after `load`, only when `'serviceWorker' in navigator`. A failure is logged, not shown.
- **Offline gaps, by design:** the résumé PDF and the contact form need a connection.

### Local preview

The scratchpad static server adds MIME types for `.mjs` and `.webmanifest`. GitHub Pages already serves both.

## 6. Build

- **Gulp:** `gulpfile.js` builds only `./js/scripts.js`, so files in `js/terminal/` are outside every gulp task and cannot break the scripts or minify step.
  - The terminal modules ship unminified; together they are a few kilobytes.
  - The root `package.json` stays CommonJS (no `"type": "module"`), because `gulpfile.js` uses `require`. Only `js/terminal/package.json` sets module type.
- **Additions:**
  - gulp: the `terminal-styles` task.
  - `package.json`: a `"test": "node --test tests/"` script.

## 7. Testing

- **`tests/core.test.mjs`:**
  - `parse`: case and whitespace handling, aliases.
  - `run`:
    - every command's output shape
    - an unknown command
    - `themes set` with a valid and an invalid name
    - the `clear` flag
    - history recording, and empty input not recorded
    - state not mutated
  - `complete`: one match, several matches, no match, `themes set d` → `themes set dracula`.
  - `stepHistory`: both ends, and stepping past the newest entry.
- **`tests/data-sync.test.mjs`:** the guard from section 3.
- **Manual browser checks after the build:**
  - every shortcut
  - no sideways scroll at 375px
  - themes kept after a reload
  - the page works offline (service worker active, network off)
  - JSON-LD still parses
  - the Impeccable detector is clean

## Out of scope

- Extra commands (`whoami`, `echo`, `pwd`, `sudo`).
- Typing animation, sound, boot sequence.
- History kept across visits.
- Full CV details inside the terminal.
- Minifying or bundling the terminal modules.
