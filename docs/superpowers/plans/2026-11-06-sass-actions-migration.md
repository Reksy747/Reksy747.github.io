# Replace Gulp with the sass CLI and a GitHub Actions deploy: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove Gulp, build and check the site in CI, and deploy `dist/` to GitHub Pages with Actions, leaving the site's behavior and URLs unchanged.

**Architecture:** The `sass` CLI compiles `scss/` into `css/`. `scripts/build.mjs` copies an allowlist into `dist/` and stamps the service worker's `VERSION` with a content hash. `scripts/check-dist.mjs` verifies precache entries and local links. A two-job workflow (`build`, then `deploy` on pushes to `master`) publishes `dist/`.

**Tech Stack:** Node 22 (`fs`, `crypto`, `node:test`), the `sass` CLI, GitHub Actions and Pages. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-06-sass-actions-migration-design.md`

## Global Constraints

- No new dependency. After Task 3 the only devDependency is `sass`.
- npm stays the package manager. Tests stay on `node --test "tests/*.test.mjs"`.
- GitHub Pages stays a user site at `/`. URLs `/`, `/cv.html` and `/portfolio.html` do not change. No hashed filenames.
- `scripts/build.mjs` is plain Node 22 using `fs.cpSync`. It exports `precacheUrls`, `contentHash` and `stampVersion`, and builds only when run directly.
- The repository's own `sw.js` keeps `const VERSION = 'v2';`. Only `dist/sw.js` is stamped.
- `dist/` is git-ignored. `css/` stays committed until Task 7.
- Actions are pinned to these SHAs: `actions/checkout` v7 `3d3c42e5aac5ba805825da76410c181273ba90b1`, `actions/setup-node` v7 `949feb2413d6458794dcd2491c4babbbce0c15c1`, `actions/configure-pages` v6 `45bfe0192ca1faeb007ade9deae92b16b8254a0d`, `actions/upload-pages-artifact` v5 `fc324d3547104276b827a68afc52ff2a11cc49c9`, `actions/deploy-pages` v5 `368f82528645a54fb793d4d04e342629a3f51346`. Re-check them against Vite's static-deploy guide before Task 4.
- **Nothing is committed or pushed by the assistant.** Every task ends with "leave uncommitted". Delete files with plain `rm`, not `git rm`. The owner commits, pushes, and switches the Pages source.
- No text or claim goes into the docs that the repository does not already support.

## Review Focus

1. **CRLF in `sw.js`.** A Windows working copy may have CRLF line endings; stamping must change only the version value. Pinned in Task 1, test 2.
2. **Hash boundaries.** `['ab','c']` and `['a','bc']` must not hash the same. Pinned in Task 1, test 6.
3. **Case-mismatched links.** A link like `css/Styles.css` resolves on Windows but 404s on Pages (Linux). `check-dist` must compare names case-sensitively. Pinned in Task 2, Step 9.
4. **Stale or missing files in `dist/`.** A file removed from the sources must not survive in `dist/`, and a precached file that is missing must fail the build naming it. Pinned in Task 2, Steps 6 and 7.
5. **Lockfile out of sync.** After removing 11 packages, `npm ci` in CI must still succeed. Pinned in Task 3, Step 5.

---

### Task 1: Pure build helpers

**Files:**
- Create: `scripts/build.mjs` (helpers only in this task)
- Test: `tests/build.test.mjs`

**Interfaces:**
- Produces, exported from `scripts/build.mjs`:
  - `precacheUrls(swSource: string): string[]`: the entries of `const PRECACHE = [ ... ]`, in order, quotes removed.
  - `contentHash(buffers: Buffer[]): string`: 8 lowercase hex characters, the start of a SHA-1 over the buffers in order.
  - `stampVersion(swSource: string, hash: string): string`: the source with the value of `const VERSION = '...';` replaced by `hash`; throws an `Error` whose message contains `VERSION` when there is no such line.

- [ ] **Step 1: Write the failing tests in `tests/build.test.mjs`**, using `node:test` and `node:assert/strict`, importing the three functions from `../scripts/build.mjs`. Six tests:
  1. `stampVersion replaces the version and leaves everything else untouched`: `stampVersion("// c\nconst VERSION = 'v2';\nconst x = 1;\n", 'abc12345')` equals `"// c\nconst VERSION = 'abc12345';\nconst x = 1;\n"`.
  2. `stampVersion keeps CRLF line endings`: the same source with `\r\n` instead of `\n` gives the same result with `\r\n`.
  3. `stampVersion throws when there is no VERSION line`: `assert.throws(() => stampVersion('const X = 1;', 'abc12345'), /VERSION/)`.
  4. `precacheUrls reads the PRECACHE entries`: `precacheUrls("const PRECACHE = [\n    '/',\n    '/a.css',\n    '/b.js'\n];\n")` deep-equals `['/', '/a.css', '/b.js']`.
  5. `precacheUrls accepts double quotes and trailing commas and ignores other arrays`: a source with `const OTHER = ['/x'];` before and after a `PRECACHE` array written with double quotes and a trailing comma returns only the `PRECACHE` entries.
  6. `contentHash is 8 hex characters, stable, and sensitive to content and buffer boundaries`: the result matches `/^[0-9a-f]{8}$/`; the same input gives the same hash; changing one byte changes it; `contentHash([Buffer.from('ab'), Buffer.from('c')])` differs from `contentHash([Buffer.from('a'), Buffer.from('bc')])`.
- [ ] **Step 2: Run** `npm test`. Expected: the new file fails to load (cannot find `scripts/build.mjs` or its exports); the 38 existing tests still pass.
- [ ] **Step 3: Implement the three functions** in `scripts/build.mjs`. `stampVersion` replaces only the quoted value with a regex on `const VERSION = '...'`. `precacheUrls` captures the text between `const PRECACHE = [` and the first `]`, then reads every quoted string in it. `contentHash` updates a `crypto.createHash('sha1')` with each buffer's length and a separator before the buffer, so boundaries matter.
- [ ] **Step 4: Run** `npm test`. Expected: `# pass 44` and `# fail 0` (38 existing plus 6 new).
- [ ] **Step 5: Leave uncommitted.**

### Task 2: Build script, dist check, HTML and service-worker edits, npm scripts

**Files:**
- Modify: `scripts/build.mjs` (add the direct-run build), `package.json` (scripts only), `cv.html:401`, `portfolio.html:363`, `sw.js:12`
- Create: `scripts/check-dist.mjs`
- Modify (output): `css/styles.css`, `css/terminal.css` (regenerated by Step 3)

**Interfaces:**
- Consumes: `precacheUrls`, `contentHash`, `stampVersion` from Task 1.
- Produces: `npm run build:css`, `npm run dev:css`, `npm run build` (writes `dist/`), and `node scripts/check-dist.mjs` (exit 0 when clean, exit 1 listing every problem).

- [ ] **Step 1: Point the pages and the service worker at the unminified script.** In `cv.html`, `portfolio.html` and the `PRECACHE` list in `sw.js`, change `js/scripts.min.js` to `js/scripts.js`. Run `git grep -n "scripts.min.js" -- cv.html portfolio.html sw.js`. Expected: no output.
- [ ] **Step 2: Replace the `scripts` in `package.json`** with exactly the four scripts from the spec, section 2 (`dev:css`, `build:css`, `build`, `test`). The `watch` script is removed. Leave the dependencies for Task 3.
- [ ] **Step 3: Run** `npm run build:css`. Expected: no error. `wc -c css/styles.css css/terminal.css` gives 28332 and 4175 bytes (131 and 40 bytes smaller than before, the dropped prefixes only).
- [ ] **Step 4: Add the direct-run build to `scripts/build.mjs`**, guarded by `import.meta.url === pathToFileURL(process.argv[1]).href`:
  1. Remove `dist/` and recreate it.
  2. Copy `index.html`, `cv.html`, `portfolio.html`, `favicon.ico`, `manifest.webmanifest`, `sw.js`, `css/`, `fonts/`, `images/` and, when present, `CNAME`. Copy `js/` with `fs.cpSync(..., { recursive: true, filter })` where `filter` rejects `js/terminal/package.json` (normalize backslashes before comparing).
  3. Read `precacheUrls` from `dist/sw.js`. Map `'/'` to `dist/index.html` and every other URL to `dist/` plus the URL without its leading slash. If a file is missing, throw `Missing precached file: <url>`.
  4. `contentHash` the files in list order, write `stampVersion(...)` back to `dist/sw.js`, and print the number of files copied and `sw.js VERSION stamped: <hash>`.
- [ ] **Step 5: Implement `scripts/check-dist.mjs`** as a command-line script. It collects problems and exits 1 after printing all of them:
  - every `PRECACHE` URL of `dist/sw.js` (same mapping as Step 4) must exist in `dist/`;
  - every `href="..."` and `src="..."` in `dist/index.html`, `dist/cv.html` and `dist/portfolio.html` must resolve. Ignore values starting with `http:`, `https:`, `mailto:`, `data:`, `//` or `#`, and empty values. Strip `?query` and `#fragment`. Values starting with `/` resolve against `dist/`; others against the page's folder; a path ending in `/` resolves to its `index.html`.
  - the existence check is **case-sensitive on every platform**: compare each path segment against `fs.readdirSync` of its parent folder instead of calling `fs.existsSync` on the whole path.
  - on success print `dist OK: <links> links and <entries> precache entries checked`.
- [ ] **Step 6: Run** `node scripts/build.mjs`. Expected: exit 0; `dist/` has the three pages, `css/`, `js/`, `fonts/`, `images/`, `sw.js`, `manifest.webmanifest`, `favicon.ico`; `dist/js/terminal/package.json` does not exist; `grep "const VERSION" dist/sw.js` shows 8 hex characters while `grep "const VERSION" sw.js` still shows `'v2'`. Then create `dist/stale.txt`, run the build again, and confirm `dist/stale.txt` is gone.
- [ ] **Step 7: Prove a missing precached file fails.** Rename `images/icon-192.png` to `images/icon-192.png.bak`, run `node scripts/build.mjs`, and confirm exit code 1 with a message naming `/images/icon-192.png`. Rename the file back, and confirm `git status --short images` is clean.
- [ ] **Step 8: Run** `node scripts/build.mjs` and then `node scripts/check-dist.mjs`. Expected: exit 0 and `dist OK: ...`.
- [ ] **Step 9: Prove the check fails when it should.** (a) Delete `dist/css/styles.css`, run `node scripts/check-dist.mjs`. Expected: exit 1, naming `/css/styles.css` and the `css/styles.css` links in `cv.html` and `portfolio.html`. (b) Rebuild, change `css/styles.css` to `css/Styles.css` inside `dist/cv.html`, and run the check again. Expected: exit 1 naming `css/Styles.css`, even on Windows. Rebuild `dist/` at the end.
- [ ] **Step 10: Run** `npm test`. Expected: `# pass 44`, `# fail 0`. Leave uncommitted.

### Task 3: Remove Gulp

**Files:**
- Delete: `gulpfile.js`, `js/scripts.min.js`
- Modify: `package.json` (dependencies, `browserslist`), `package-lock.json` (by npm), `.gitignore`, `scss/styles.scss:7`

**Interfaces:**
- Consumes: the scripts from Task 2.
- Produces: a repository whose only devDependency is `sass`.

- [ ] **Step 1: Delete** `gulpfile.js` and `js/scripts.min.js` with plain `rm`.
- [ ] **Step 2: Uninstall** the 11 packages: `npm uninstall gulp gulp-plumber gulp-postcss gulp-rename gulp-sass gulp-terser postcss autoprefixer @fontsource/barlow-condensed @fontsource/jetbrains-mono @fontsource/source-sans-3`.
- [ ] **Step 3: Remove the `browserslist` field** from `package.json`.
- [ ] **Step 4: Add `dist/`** to `.gitignore`. In `scss/styles.scss`, change line 7 to `// ---------- Fonts (self-hosted: the woff2 files in fonts/ are committed) ----------`.
- [ ] **Step 5: Verify.** `node -e "console.log(Object.keys(require('./package.json').devDependencies))"` prints `[ 'sass' ]`. `npm ci --dry-run` exits 0 (if this npm version does not support the flag, run `npm ls --depth=0` and confirm it lists only `sass` with no `missing` or `invalid` lines). `git grep -n -i "gulp\|fontsource" -- . ':!package-lock.json' ':!docs/superpowers'` shows only the README and `PRODUCT.md` lines fixed in Task 5.
- [ ] **Step 6: Run** `npm run build`, `node scripts/check-dist.mjs` and `npm test`. Expected: all exit 0; `# pass 44`. Leave uncommitted.

### Task 4: CI workflow and Dependabot

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `.github/dependabot.yml`

- [ ] **Step 1: Write `.github/workflows/deploy.yml`.** Triggers: `push` to `master`, `pull_request`, `workflow_dispatch`. Workflow-level `permissions`: `contents: read`, `pages: write`, `id-token: write`. No workflow-level `concurrency`.
  - Job `build` (`ubuntu-latest`), `concurrency: { group: "build-${{ github.ref }}", cancel-in-progress: true }`. Steps in order: `actions/checkout`; `actions/setup-node` with `node-version: 22` and `cache: npm`; the conflict-marker step `run: if git grep -nI -e '^<<<<<<< ' -e '^>>>>>>> ' -- . ':!node_modules'; then exit 1; fi`; `npm ci`; `npm test`; `npm run build`; `node scripts/check-dist.mjs`; then `actions/configure-pages` and `actions/upload-pages-artifact` (`path: dist`), each with `if: (github.event_name == 'push' || github.event_name == 'workflow_dispatch') && github.ref == 'refs/heads/master'`.
  - Job `deploy`: `needs: build`, the same `if` (pushes to `master` and manual runs on `master`), `concurrency: { group: pages, cancel-in-progress: false }`, `environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }`, one step `id: deployment` using `actions/deploy-pages`.
  - Every `uses:` is pinned to the SHA from Global Constraints, followed by a `# vN` comment.
- [ ] **Step 2: Add a `github-actions` ecosystem** to `.github/dependabot.yml` next to `npm`: `directory: "/"`, weekly.
- [ ] **Step 3: Verify.** `grep -c "uses: .*@[0-9a-f]\{40\}" .github/workflows/deploy.yml` prints `5`. Run the conflict-marker command on the repository (without the `if`/`exit`): expected no output and exit 1 from `git grep`, meaning no markers. Prove it can find one in a scratch folder outside the repository: write a file containing a line that starts with seven `<` characters and a space, run the same `git grep --no-index -nI -e ... -e ... -- .` there, and confirm it prints the line. If Python with PyYAML is available, load both YAML files with `yaml.safe_load` and expect no error; otherwise GitHub reports syntax errors on the first run.
- [ ] **Step 4: Leave uncommitted.**

### Task 5: Docs

**Files:**
- Modify: `README.md` ("Tech Stack", "Running Locally", "Deploying"), `PRODUCT.md:32`

- [ ] **Step 1: `README.md` "Tech Stack".** The Styling line says Sass, compiled with the `sass` CLI. The Fonts line keeps JetBrains Mono, self-hosted, and adds: `fonts/` holds the latin subsets of Barlow Condensed (500, 600, 700), Source Sans 3 (400, 400 italic, 600, 700) and JetBrains Mono (500) from Fontsource 5.x, committed to the repository.
- [ ] **Step 2: "Running Locally".** Replace the build step with `npm run build:css` (needed before previewing, because `css/` is generated) and mention `npm run dev:css` to rebuild on every change. Keep the test step and the static-server step.
- [ ] **Step 3: "Deploying".** Say that pushes to `master` run the GitHub Actions workflow, which runs the tests, builds `dist/` and publishes it, and that Settings, Pages, Source must be "GitHub Actions". Remove the sentence about committing compiled files and about bumping `VERSION` by hand (the build stamps it).
- [ ] **Step 4: `PRODUCT.md:32`.** Rewrite the Build line to say SCSS is compiled with the `sass` CLI (`npm run build:css`) into `css/`, and `npm run build` assembles `dist/`, which GitHub Actions deploys to Pages.
- [ ] **Step 5: Verify.** `git grep -n -i "gulp\|fontsource\|scripts.min" -- . ':!package-lock.json' ':!docs/superpowers'` shows only the Fontsource credit in the README's Fonts line. `grep -n "—\|–" README.md` shows nothing. Leave uncommitted.

### Task 6: End-to-end check and hand-off (no file changes)

- [ ] **Step 1: Clean run.** Remove `dist/`, then run `npm run build:css`, `npm run build`, `node scripts/check-dist.mjs` and `npm test`. Expected: all exit 0; `# pass 44`.
- [ ] **Step 2: Serve `dist/`** with a static server (the scratchpad `serve.js dist` works) and open `/`, `/cv.html` and `/portfolio.html`. Expected: no console errors, no failed network requests, the terminal responds to `help`, and `caches.keys()` returns one name equal to the stamped version from the build output.
- [ ] **Step 3: Report to the owner**, in the final message, with this cutover order and no more: (1) commit and push these changes as merge 1 (a red `deploy` run on `master` is expected until step 2); (2) Settings, Pages, Source, "GitHub Actions"; (3) re-run the workflow and check the live site (terminal, CV, portfolio, offline mode); (4) only then ask for Task 7. State that rollback before Task 7 is switching the source back.

### Task 7: Merge 2, stop committing generated files (run only after the owner confirms the live site works)

**Files:**
- Modify: `.gitignore`; stop tracking `css/`

- [ ] **Step 1: Add `css/`** to `.gitignore` and stop tracking the folder with `git rm -r --cached css` (staging this one removal is the exception to the plain-`rm` rule, because untracking has no other command).
- [ ] **Step 2: Verify.** `git status --short` shows `css/styles.css` and `css/terminal.css` as deleted from the index and the folder still on disk. `npm run build` still succeeds and `node scripts/check-dist.mjs` exits 0.
- [ ] **Step 3: Tell the owner** that after this merge the site depends on CI having built the CSS, and that rollback is reverting this change first, then switching the Pages source back. Leave uncommitted.

## Post-review changes (2026-11-06)

The six minor findings from the final review were fixed after the plan was executed. The spec was updated to match.

- The conflict-marker step passes only on `git grep` exit code 1; markers or a `git grep` error fail the build.
- `distHash` replaces the precache-only hash: every file in `dist/` except `sw.js`, paths included, so a changed icon or favicon also changes `VERSION`.
- `isDirectRun` compares real paths, so a symlink, junction or `subst` drive cannot make `build.mjs` or `check-dist.mjs` silently do nothing.
- `check-dist` also reads single-quoted and unquoted attributes, `srcset`, CSS `url(...)` and manifest icons, skips `tel:` and `javascript:`, and decodes percent-encoding. `tests/check-dist.test.mjs` covers the helpers.
- Workflow permissions are `contents: read` at the top; only the `deploy` job has `pages: write` and `id-token: write`. `actions/configure-pages` was removed because nothing uses its outputs and the permission it needs without Pages access is undocumented.
- Version comments on the pinned actions use the exact tags (v7.0.1, v7.1.0, v5.0.0, v5.0.1).
