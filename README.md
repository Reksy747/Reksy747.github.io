# Reksy747.github.io

Personal portfolio of Petrus Chanel Reksy Arfila (DevOps / SRE engineer, Jakarta), live at <https://reksy747.github.io/>.

The site has three views over **one data file**:

- **Terminal** (the first page): an interactive shell with commands such as `experience`, `projects` and `weather`.
- **GUI**: a dark resume page with a profile panel, sticky section tabs and experience entries.
- **Resume**: a printable layout for "Save as PDF".

Switch views at any time without losing your place.

## Stack

Vue 3 (`<script setup>`), Vite, [Pinia](https://pinia.vuejs.org) for state, [Naive UI](https://www.naiveui.com) for the GUI's buttons, tabs, tags and cards, custom SCSS and [Bun](https://bun.sh). No backend. The build is plain static files, deployed to GitHub Pages.

- **Pinia** holds the app state (view mode, section, themes, terminal history, todos) in `src/state/store.js`. The terminal commands and tests read the same store.
- **Naive UI** is used only in the GUI view, themed to the dark amber look in `src/gui/naiveTheme.js`. The terminal and printable resume are plain Vue and SCSS. The GUI and terminal views load on demand, so the first page does not download Naive UI.

## Quick start

Bun is the only supported tool: don't use `npm`, `npx` or `node`.

```sh
bun install
bun run dev        # dev server at http://localhost:5173
bun test           # run the test suite
bun run build      # production build into dist/
bun run preview    # serve the production build locally
```

## Views and URLs

| URL | View |
|---|---|
| `/` | Terminal (default) |
| `/?mode=gui` | GUI resume site |
| `/?mode=resume` | Printable resume |
| `#experience`, `#skills`, … | Jump to a section (`about`, `experience`, `projects`, `skills`, `education`, `contact`) |

Type `gui` in the terminal to open the GUI. The terminal and GUI buttons switch back.

## Terminal commands

Type `help` for the live list. Tab (or the Tab chip on phones) completes, and the arrow keys walk the history.

| Group | Commands |
|---|---|
| Resume content | `about`, `experience [id]`, `projects`, `skills`, `education`, `contact`, `resume` |
| Files | `ls`, `cat <file>` (for example `cat skills.txt`) |
| Shell | `help`, `whoami`, `hostname`, `date`, `echo`, `clear`, `history`, `theme [name]` |
| Navigation | `gui` (opens the resume site), `exit` (locked on purpose) |
| Links | `email`, `repo`, `donate` |
| Tools | `calc <expr>`, `convert <n> <from> <to>`, `todo`, `weather [place]`, `curl reksy747.github.io` |
| Easter eggs | `sudo`, `vi`, `vim`, `emacs` |

Notes:

- **`weather [place]`** looks up any city, regency or country through the free [Open-Meteo](https://open-meteo.com) API (no key). With no place it shows Jakarta. The reading is the provider's latest model value, refreshed about every 15 minutes, and the time is shown in GMT+7. The typed place and the visitor's IP are sent to Open-Meteo.
- **`curl`** is simulated and makes no request. Only `reksy747.github.io` answers, with a small JSON object. Every other domain returns a CORS error.
- **`calc`** is its own parser; it never uses `eval`.
- **`theme`** switches between `ink`, `paper`, `phosphor` and `blueprint`. Theme and todos are saved in `localStorage`.
- **`date`** and all other times on the site use GMT+7.

## Editing the content

All text comes from [`src/data/portfolio.js`](src/data/portfolio.js): identity, about, links, experience, skills, projects and education. Edit that one file and the GUI, terminal and printable resume all update.

- Only write facts that are true. Tool tags on an experience entry should come from your own description of that role.
- Strings that start with `[add ` are placeholders. `bun run build` **fails** while any remain (override locally with `ALLOW_PLACEHOLDERS=1`). CI never sets that override.
- The profile photo is [`src/assets/reksy.jpg`](src/assets/reksy.jpg); replace the file to change it. Strip location metadata from any new photo first.

## Project layout

```
index.html                  page shell and meta tags
src/
  main.js, App.vue          entry point, view switching, boot screen
  data/portfolio.js         the single source of truth for content
  state/                    Pinia store, URL <-> mode/section sync, persistence
  terminal/                 command engine, parser, themes, banner, weather, calc
    commands/               content, shell and tool commands
  views/                    TerminalView, GuiView, ResumeView
  gui/                      GUI components, helpers and the Naive UI theme
  components/BootScreen.vue first-load splash
  styles/                   tokens, base, GUI, terminal and print SCSS
scripts/check-placeholders.js   build gate for unfilled placeholders
tests/                      bun test suites
.github/workflows/deploy.yml    build and deploy to GitHub Pages
```

## Deployment

`.github/workflows/deploy.yml` runs on every push to `master` (and on manual dispatch): `bun install --frozen-lockfile`, `bun test`, `bun run build`, then it publishes `dist/` to GitHub Pages.

One-time setup: in the repository go to **Settings, Pages** and set **Source** to **GitHub Actions**. Commit `bun.lock`, because the frozen-lockfile install fails without it.

## Security notes

- No server, login or cookies. Output is rendered as plain text (no `v-html` or `eval`), and keyed lookups use `Object.hasOwn`.
- GitHub Pages can't set response headers. A `<meta>` Content-Security-Policy is a sensible hardening step, but Naive UI injects its styles at runtime, so a policy must allow inline styles (`style-src 'unsafe-inline'`) or the GUI loses its styling.
- The email address in `portfolio.js` is shipped in plain text, so scrapers can read it.
