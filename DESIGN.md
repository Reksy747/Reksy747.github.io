---
name: Reksy747 CV
description: The CV of Petrus Chanel Reksy Arfila as an itinerary of record, Klaten to Jakarta, current leg in service.
colors:
  stock: "#eef1f4"
  paper: "#ffffff"
  ink: "#13202b"
  ink-muted: "#44546a"
  rule: "#c3ccd6"
  perf: "#9aa7b5"
  route: "#1f4fa8"
  signal: "#f25c05"
  signal-ink: "#b93f00"
  signal-hover: "#ff7424"
  on-signal: "#1a0a00"
  mast: "#13202b"
  mast-ink: "#eef1f4"
  mast-muted: "#a9b8c8"
  error: "#b42318"
  night-stock: "#0b131b"
  night-paper: "#121d28"
  night-ink: "#e4ebf2"
  night-ink-muted: "#9fb1c4"
  night-rule: "#26384a"
  night-perf: "#3b5168"
  night-route: "#6f9be8"
  night-signal: "#ff7a2e"
  night-signal-ink: "#ff8f4d"
  night-signal-hover: "#ff9a5c"
  night-mast: "#060c12"
  night-mast-muted: "#8fa3b8"
  night-error: "#ff7b72"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(1.375rem, 2.6vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
  role:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(1.125rem, 2.2vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.04em"
  lede:
    fontFamily: "Source Sans 3, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 2vw, 1.375rem)"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Source Sans 3, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tnum"
  label:
    fontFamily: "Source Sans 3, Segoe UI, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.1em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.03em"
  mono-caps:
    fontFamily: "JetBrains Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.06em"
rounded:
  hairline: "2px"
  panel: "3px"
  station: "50%"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  index-w: "11rem"
  summary-w: "15.5rem"
  stack-sm: "0.75rem"
  stack-md: "1rem"
  stack-lg: "1.5rem"
  panel: "clamp(1.5rem, 3.5vw, 2.25rem)"
  leg: "clamp(1.25rem, 3vw, 1.75rem)"
  section: "clamp(3.5rem, 8vw, 5.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    typography: "{typography.body}"
    rounded: "{rounded.hairline}"
    padding: "0 1.25rem"
    height: "2.875rem"
  button-primary-hover:
    backgroundColor: "{colors.signal-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mast-ink}"
    rounded: "{rounded.hairline}"
    padding: "0 1.25rem"
    height: "2.875rem"
  input-field:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.hairline}"
    padding: "0.75rem 0.85rem"
  ticket:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  leg:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "{spacing.leg}"
  stamp:
    textColor: "{colors.signal-ink}"
    typography: "{typography.mono-caps}"
    rounded: "{rounded.panel}"
    padding: "0.45rem 0.75rem"
  index-link:
    textColor: "{colors.ink-muted}"
    padding: "0.6rem 0"
  index-link-active:
    textColor: "{colors.ink}"
  repo-tag:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.hairline}"
    padding: "0.15rem 0.5rem"
---

# Design System: Reksy747 CV

## Overview

**Creative North Star: "The Itinerary"**

The CV is an itinerary of record: a dated, confirmed route of legs from Klaten through Yogyakarta to Jakarta, printed on cool ticket stock, with the current leg struck forward in signal orange and stamped IN SERVICE. Every surface is a part of a travel document: a navy masthead band with a mono running head, a white route strip, ticket panels with perforated stubs, boarding passes for projects, manifest tables for skills and certifications.

The page is calm and dense in the way a timetable is dense: two inks on stock, condensed capitals for names and places, a plain reading face for everything a person reads, and mono reserved for the things a ticket would print by machine (dates, refs, codes). One continuous route line runs through the experience section and the route strip; stations are round markers on it. Depth is paper resting on stock, not floating cards.

Rejected by the world itself: cards with coloured side borders, gradients, glass. The build carries none of them.

**Key Characteristics:**
- Two inks (navy ink, route blue) plus one live signal orange on cool stock.
- Barlow Condensed caps for names, cities and titles; Source Sans 3 for reading and field labels; JetBrains Mono for dates, refs, codes only.
- Dashed perforation rules separate ticket parts; punched notches where perforations meet edges.
- One continuous 4px route line with round station markers.
- Near-square corners (2px controls, 3px panels).
- Light and dark ("night") themes from the same token names; one authored motion moment (the route draw), with quiet continuity and feedback around it.

## Colors

A cool, low-chroma ticket palette with one hot accent that means "now".

Both themes share token names on `:root`; the night set (`night-*` keys) is applied by a `night` mixin under `prefers-color-scheme: dark` (unless `data-theme="light"`) or `data-theme="dark"`. Under `prefers-contrast: more`, rule and perforation become `currentColor` and muted ink becomes full ink. Print resets stock, paper and mast to white and ink to black.

### Primary
- **Signal Orange** (`signal`; night `night-signal`): the one live state. Fills the current station marker, the current leg tick and its halo, the active section-index dot, the primary button, the focus ring, the input caret and selection. Also the masthead role line, as text on navy.
- **Signal Hover** (`signal-hover`; night `night-signal-hover`): the primary button's hover fill, a lighter step of signal in both themes.
- **Signal Ink** (`signal-ink`; night `night-signal-ink`): signal as text or stroke on light grounds: the Jakarta city name in the route strip, the IN SERVICE stamp, and the name of a station reached by its anchor (`:target`).
- **Ember Black** (`on-signal`): text on any signal fill (buttons, skip link, selection). Fixed across themes.

### Secondary
- **Route Blue** (`route`; night `night-route`): the route line itself (route strip and experience rail), past station rings and leg ticks, inline links, employer lines, project refs, the sent status.

### Neutral
- **Ticket Stock** (`stock`; night `night-stock`): page ground; also input wells and the punched notches.
- **Printed Paper** (`paper`; night `night-paper`): every panel: route strip, summary stub, tickets, legs, passes, manifests, entries.
- **Navy Ink** (`ink`; night `night-ink`): body text and the heavy 2px rules under section titles, index top and manifest heads.
- **Faded Ink** (`ink-muted`; night `night-ink-muted`): dates, field labels, meta lines, inactive index links, bullet dashes.
- **Hairline Rule** (`rule`; night `night-rule`): 1px solid dividers in tables and the index list.
- **Perforation Grey** (`perf`; night `night-perf`): 2px dashed perforations between ticket parts and 1px dashed dividers between entries.
- **Masthead Navy** (`mast`; night `night-mast`): masthead and footer bands. Its inks are `mast-ink` (night uses `night-ink`) and `mast-muted` (night `night-mast-muted`).
- **Fault Red** (`error`; night `night-error`): form error status and invalid input underline only.

### Named Rules
**The One Live State Rule.** Signal orange marks only what is current or what acts: the current leg, the current station, the active index item, the primary action, focus. Past legs are plain route blue. Nothing is orange for decoration.

**The Signal-Ink Rule.** Orange as text or stroke on paper or stock uses `signal-ink`, never `signal`. Fills use `signal` with `on-signal` text.

**The Two Inks Rule.** Navy ink and route blue on stock and paper. No gradients, no third accent hue.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, sans-serif), self-hosted at 500/600/700
**Body Font:** Source Sans 3 (with Segoe UI, system-ui, sans-serif), self-hosted at 400, 400 italic, 600, 700
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Cascadia Mono, Consolas, monospace), self-hosted at 500

**Character:** Condensed caps read like a departures board and a printed ticket header; the humanist sans keeps long duty lists easy; the mono reads as machine-printed fare data. Body sets tabular numerals throughout so dates align.

### Hierarchy
- **Display** (700, clamp(2.25rem, 6vw, 4.5rem), 0.95, uppercase): the name in the masthead only; balanced wrap.
- **Headline** (700, clamp(2rem, 4.2vw, 2.75rem), 1, uppercase): section titles, sat on a 2px ink rule.
- **Title** (700, clamp(1.375rem, 2.6vw, 1.75rem), 1.05, uppercase): leg titles. Siblings at the same weight and case: route cities (clamp(1.375rem, 3.2vw, 2.125rem), 1), station names and pass titles (clamp(1.5rem, 3vw, 1.875rem) / clamp(1.5rem, 2.8vw, 1.875rem), 1), entry titles (1.375rem, 1.1), manifest row heads (1.1875rem, 1.3, 0.02em).
- **Role** (600, clamp(1.125rem, 2.2vw, 1.5rem), 0.04em, uppercase): the masthead role line in signal, naming title and employer ("DevOps Engineer · MEMBER.ID"). Under it, the masthead stack line in JetBrains Mono 500 at 0.8125rem/1.4 in `mast-ink`. On the CV the masthead carries two actions only (Download résumé, Contact), held on one row on phones; page links live in the running-head page switch.
- **Lede** (600, clamp(1.1875rem, 2vw, 1.375rem), 1.5): opening paragraph of a ticket, max 38em. The summary lede uses body size at 600, 1.45.
- **Body** (400, 1.0625rem, 1.6): reading text, max 42em in tickets and legs.
- **Label** (600, 0.75rem, 0.1em, uppercase): field labels on ticket stubs, summary facts, form fields and table heads. Reading face, not mono.
- **Mono** (500, 0.8125rem, 0.02-0.03em, sentence case): leg dates, station year ranges, route years, project refs; certificate numbers at 0.875rem.
- **Mono caps** (500, 0.75rem, 0.06em, uppercase): the masthead running head and the stamp's small line (0.6875rem, 0.1em).

### Named Rules
**The Three Voices Rule.** Condensed caps for names, places and titles; Source Sans 3 for everything read, including field labels; JetBrains Mono only for dates, refs and codes. A label is never set in mono.

## Layout

A centred wrap (max 84rem, side padding `gutter`) holds a three-column reading grid: a sticky section index (`index-w`), the reading column, and a sticky summary stub (`summary-w`), separated by a clamp(2rem, 3.5vw, 3rem) column gap. Above it, the full-bleed masthead band and the full-bleed white route strip.

Responsive behaviour (breakpoints 1100, 860, 760, 600px): at 1100px the summary moves above the column beside the index and lays out as a two-part stub with a vertical perforation; at 860px everything stacks and the index becomes a sticky, sideways-scrolling strip of tabs on stock; at 760px tickets and passes drop their stub below a horizontal perforation (notches move to the sides); at 600px the stamp leaves its corner and sits inline, manifests collapse to stacked rows.

Rhythm: sections are spaced `section`; ticket parts pad `panel`; legs pad `leg`; stations stack at 2.75rem, legs at 0.75rem, passes at 1.25rem. Small stacks step 0.75 / 1 / 1.5rem. `scroll-padding-top` is 4.5rem so anchored sections clear the sticky index.

### Named Rules
**The One Line Rule.** A single continuous route line governs the page: 4px of route blue, drawn across the route strip and down the experience rail. Stations are round markers on it; legs are small round ticks. Do not add a second line system.

## Elevation & Depth

Hybrid, and quiet: paper panels lift off stock with a soft ambient shadow tinted with navy ink, and parts within a panel are separated by dashed perforations, not by shadow or colour. Panel shadows are theme tokens (`--shadow-rest`, `--shadow-lift`) redefined in the `night` mixin: at night a navy-tinted shadow would vanish, so the edge is drawn by a faint white hairline ring and lift adds a dark drop, on top of the paper-over-stock tonal step.

### Shadow Vocabulary
- **Panel lift** (`--shadow-lift`: `0 1px 2px rgba(19, 32, 43, 0.06), 0 6px 20px rgba(19, 32, 43, 0.06)`; night `0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 24px rgba(0, 0, 0, 0.45)`): tickets, boarding passes, the summary stub, case studies and the troubleshooting panel.
- **Panel rest** (`--shadow-rest`: `0 1px 2px rgba(19, 32, 43, 0.05)`; night `0 0 0 1px rgba(255, 255, 255, 0.06)`): legs, manifest tables, entry lists, the repositories list.
- **Live halo** (`box-shadow: 0 0 0 5px color-mix(in srgb, var(--signal) 22%, transparent)`): the current station marker; the current leg tick uses a 3px stock ring plus a 6px 30% signal ring. The arrival pulse on a targeted station marker expands a 55% signal ring to 14px and fades.

### Named Rules
**The Printed Panel Rule.** Panels rest on stock; they never float. Shadows are ambient and ink-tinted (a hairline ring at night), never hard offset, never coloured. Panels take `--shadow-rest` or `--shadow-lift`, never a literal shadow. Separation inside a panel is a perforation.

## Shapes

Near-square paper: 2px corners on controls (buttons, inputs, the photo, focus rings, repository tags), 3px on panels and the stamp. Circles appear only where a ticket or a map would have them: station markers (1.25rem in the strip, 1.6rem with a 5px ring on the rail), leg ticks, index dots, and the punched notches (1.375rem, filled with stock) where a perforation meets a panel edge. Inputs are underlined wells (2px bottom border, top corners only rounded). The stamp is a double rule (2px border plus 1px outline at 2px offset), rotated -5deg (-3deg on phones).

## Components

### Buttons
Firm, flat and ticket-office plain.
- **Shape:** near-square (2px), min height 2.875rem, padding 0 1.25rem, 0.55rem gap to an inline SVG icon.
- **Primary:** signal fill with ember-black text, Source Sans 3 600 at 1rem. Hover lightens to `signal-hover`; active presses down 1px.
- **Ghost:** masthead only. Transparent with a 1px `currentColor` border in `mast-ink`; hover adds an 8% white wash.
- **Focus:** 2px signal outline at 3px offset (global).

### Links
- **Inline link:** route blue, 600, underline at 40% route blue that firms to full on hover; a trailing arrow icon nudges 2px up-right.

### Cards / Containers (tickets, passes, legs, entries, manifests)
- **Corner Style:** 3px.
- **Background:** paper on stock.
- **Shadow Strategy:** panel lift for tickets, passes and summary; panel rest for legs, manifests, entries.
- **Border:** none on the panel; perforations (2px dashed `perf`) between main part and stub, 1px dashed between entries, 1px solid `rule` between table rows.
- **Internal Padding:** `panel` for ticket and pass parts, `leg` for legs, 1.25rem by clamp(1rem, 2.5vw, 1.5rem) for entries and repository rows.
- **Image plate:** a boarding pass shows its project screenshot at native size on a stock plate (`object-fit: scale-down`, min height 15rem, padded); screenshots are never upscaled or cropped.

### Inputs / Fields
- **Style:** stock well, no side borders, 2px faded-ink underline, 2px top corners, 0.75rem by 0.85rem padding, signal caret.
- **Hover / Focus:** underline darkens to ink on hover; on focus the underline turns signal and the well tints 6% toward signal (no outline).
- **Error:** underline turns `error` on `:user-invalid`; status text in `error`, sent status in route blue.

### Navigation
- **Section index:** 2px ink top rule, 1px rule between items, Source Sans 3 600 at 0.9375rem in faded ink with a small hollow ring before each label. Hover and active go to ink; the active ring fills signal. On phones (860px and below) it becomes a slim sticky bar on stock: the current section name with a signal dot on the left, a drawn burger icon on the right (48px tall, turns to a close icon when open). The burger drops the full section list below the bar with panel lift and a 2px ink bottom rule; choosing a section, tapping outside or pressing Escape closes it. Without JS the list shows open.
- **Route strip:** the career route as navigation: three stations on the route line, each a link to its station in Experience; the current station is filled signal with the live halo and its city set in signal ink. Hover scales the marker 1.2 and underlines the city.

### Rubber Stamp (signature)
The IN SERVICE stamp sits in the top-right corner of the current leg: signal-ink double rule, Barlow Condensed 700 at 1.125rem for the word, mono caps for "since" and the date, rotated -5deg. One per page, on the current leg only.

### Portfolio page (portfolio.html)
Same world, two-column layout (`layout--two`: index + main, main capped at 52rem), compact masthead with a CV / Portfolio page switch in the running head (current page underlined in signal). Sections open with a faded-ink section lede under the title.
- **Operating scope:** a `manifest--record` table (Area, What I run, Where): row heads in the manifest row-head role, the middle column at 600, the last in faded ink; stacks to rows on phones. Scope and results are tabulated, never big-number hero tiles.
- **Case study (`.case`):** a printed panel split by 2px dashed perforations: head (mono date line, condensed-caps title at clamp(1.5rem, 3vw, 2rem), mono stack line in route blue) over a definition-list body (Context, What I did, Why it matters) with labels in the label role in an 8rem column. The perforated head and body can frame a diagram plate between them; none ships today.
- **Troubleshooting panel (`.postmortem`):** a labelled header (Scope, Tools, Output) over a stepped timeline (Detect, Diagnose, Restore, Prevent) on a 3px route-blue line with hollow route-blue markers; the last marker is filled.
- **Repositories (`.repos`, `.repo`):** one printed list at panel rest, rows split by 1px dashed perforation. Each row: repo name in mono 600 at 1rem (a route-blue link when public), a visibility tag in the label role with a 1px rule border and 2px corners (Public solid, Private dashed), a reading paragraph, a mono stack line in faded ink, and an optional italic collaborator note at 0.875rem in faded ink.
- **Content slot (`.slot`, `.slot--block`):** signal-tinted highlight in signal ink marked "TO FILL", block form with a 2px dashed signal-ink border. Deliberately loud so an unfilled page cannot pass for finished; remove each slot when its real content lands, and never replace one with an invented figure. No slot ships on the page today.

### Motion
One authored moment: on load the route line draws left to right (scaleX, 1.1s, ease-out `cubic-bezier(0.16, 1, 0.3, 1)`, 0.15s delay), then the Jakarta marker strikes in (scale from 0.4, 0.5s, 1.05s delay). Both run only with JS present and `prefers-reduced-motion: no-preference`.

Everything else is supporting continuity and feedback, runs only under `prefers-reduced-motion: no-preference`, and hides no content by default:
- **Page continuity:** CV and Portfolio cross-fade as a cross-document view transition (0.22s) while the masthead holds as one named element (`view-transition-name: masthead`, 0.3s).
- **Arrival:** following a route-strip link to a station pulses its marker twice (`arrive`, 0.9s, 0.35s delay). The landed station's name turns signal ink in every motion setting.
- **Troubleshooting line:** when the timeline scrolls into view the line draws down (scaleY, 0.8s) and the step markers strike in order (0.35s, 0.16s stagger). Gated by a `motion` class that JS sets only when IntersectionObserver exists and motion is allowed, so the line is never left hidden.
- **Form status:** the send result eases in (`status-in`, 0.25s, 3px rise); under reduce it only fades (`fade-in`).

State transitions elsewhere are 0.2s on the same ease. Under reduce, transitions collapse to 0.01ms and smooth scroll is off.

## Terminal home

`index.html` is a terminal; the Itinerary system above applies to `cv.html` and `portfolio.html`. Source: `scss/terminal.scss` → `css/terminal.css`.

- **Themes:** `[data-theme]` on `<html>`: dark (navy `#1d2a35`, default dark), light (default when the system is light), dracula, nord, ubuntu, matrix. Each defines `--term-bg`, `--term-fg`, `--term-muted`, `--term-accent`, `--term-link`, `--term-prompt`; every colour is ≥ 4.5:1 against its background. Saved under `localStorage['terminal-theme']`.
- **Type:** JetBrains Mono 500 throughout, 0.9375rem; the input is 1rem so iOS does not zoom.
- **Prompt:** `visitor@reksy747.github.io:~$` with `.term__user` in the accent colour and `.term__host` in the prompt colour; the rest in the text colour.
- **Classes:** `.term`, `.term__intro` (welcome block, reprinted by `welcome`), `.term__banner` (one 58-column block-letter "REKSY"; its font size shrinks with the viewport, about 9.6px at 375px, so it never overflows), `.term__rule` (`----` separators), `.term__code`, `.term__out` (`role="log"`), `.term__line`, `.term__echo`, `.term__heading`, `.term__list`, `.term__cmd` (tappable command button), `.term__muted`, `.term__form`, `.term__prompt`, `.term__input`, `.sr-only`. No navbar or footer: the page is the terminal alone; `cv`/`gui`/`projects`/`email` lead out, and `<noscript>` keeps plain links to `cv.html` and `portfolio.html`.
- **Links:** link colour with a dashed underline; command buttons use the prompt colour.
- **Help table:** `.term__list--plain` rows are a grid (`11ch` name column, `1rem` gap) with `.term__note` descriptions in the text colour; ligatures are off so `=>` shows as typed.
- **Wrapping:** output uses `pre-wrap` with `overflow-wrap: anywhere`; no horizontal scroll from 320px up.
- **Responsive:** side and bottom padding respect the notch and home bar (`env(safe-area-inset-*)`, the page uses `viewport-fit=cover`). The input stays beside the prompt while about 5 characters fit (on 320px it moves to its own line). At heights of 500px or less (a phone held sideways) spacing tightens and the banner drops to 11px, so the prompt is visible without scrolling.

## Do's and Don'ts

### Do:
- **Do** reserve signal orange for the current state and the primary action (The One Live State Rule).
- **Do** use `signal-ink` for orange text or strokes on paper and stock, and `on-signal` text on signal fills.
- **Do** separate parts of a panel with 2px dashed perforation in `perf`, with stock-filled notches where it meets an edge.
- **Do** set names, cities and titles in Barlow Condensed caps; dates, refs and codes in JetBrains Mono; everything else, labels included, in Source Sans 3.
- **Do** keep every new colour decision paired: define the token on `:root` and its counterpart in the `night` mixin.
- **Do** keep the route draw as the one authored motion moment; anything else is brief continuity or feedback, runs only under `prefers-reduced-motion: no-preference`, and never hides content by default.

### Don't:
- **Don't** use cards with coloured side borders, gradients or glass.
- **Don't** add a second accent hue or a second route line.
- **Don't** use hard offset shadows or coloured shadows on panels.
- **Don't** set field labels or body text in mono.
- **Don't** round panels beyond 3px; circles are for markers and notches only.
- **Don't** stamp anything other than the current leg.
