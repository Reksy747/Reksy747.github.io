import { registry } from '../registry.js'
import { isPlaceholder } from '../../data/placeholders.js'
import { THEMES } from '../themes.js'
import { banner } from '../banner.js'

const out = (text, extra) => ({ type: 'out', text, ...extra })
const link = (text, href) => [out(text, { href })]

// the site's clock is always Jakarta time (GMT+7, no daylight saving), whatever the visitor's device says
const clock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Jakarta', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
})
export function gmt7(date) {
  const p = Object.fromEntries(clock.formatToParts(date).map((x) => [x.type, x.value]))
  return `${p.weekday} ${p.month} ${p.day} ${p.year} ${p.hour}:${p.minute}:${p.second} GMT+7`
}
// short launch sequence typed into the terminal, then the switch; ctx.wait/scroll are absent in tests, so they switch at once
const LAUNCH = ['> resolving modules... [OK]', '> mounting resume gui... [OK]', '> launching_']
async function toGui(_a, ctx) {
  for (const text of LAUNCH) {
    ctx.store.terminal.lines.push(out(text))
    ctx.scroll?.()
    await ctx.wait?.(260)
  }
  ctx.store.mode = 'gui'
  return []
}

export const commands = [
  {
    name: 'help',
    summary: 'list commands',
    run: () => registry.map((c) => out(`${[c.name, ...(c.aliases || [])].join(', ').padEnd(12)}${c.summary}`)),
  },
  { name: 'whoami', summary: 'who you are', run: () => [out('visitor')] },
  { name: 'hostname', summary: 'print the host name', run: () => [out('reksy.dev')] },
  { name: 'date', summary: 'current date and time (GMT+7)', run: (_a, ctx) => [out(gmt7(ctx.now()))] },
  { name: 'echo', summary: 'print text', run: (args) => [out(args.join(' '))] },
  { name: 'clear', summary: 'clear the screen', run: (_a, ctx) => { ctx.store.terminal.lines = banner(); return [] } },
  { name: 'history', summary: 'show command history', run: (_a, ctx) => ctx.store.terminal.history.map((h, i) => out(`${i + 1}  ${h}`)) },
  {
    name: 'theme',
    summary: 'list or switch themes: theme [name]',
    args: () => Object.keys(THEMES),
    run([name], ctx) {
      const names = Object.keys(THEMES)
      if (!name) return names.map((n) => out(n === ctx.store.theme ? `${n} (current)` : n))
      if (!Object.hasOwn(THEMES, name)) return [{ type: 'err', text: `unknown theme: ${name}. Valid: ${names.join(', ')}` }]
      ctx.store.theme = name
      return [out(`theme: ${name}`)]
    },
  },
  { name: 'gui', summary: 'switch to the GUI', run: toGui },
  { name: 'exit', summary: 'leave the terminal', run: () => [out('System locked. There is no exit from this simulation')] },
  { name: 'email', summary: 'show the email address', run: (_a, ctx) => { const e = ctx.data.links.email; return link(e, isPlaceholder(e) ? undefined : `mailto:${e}`) } },
  { name: 'repo', summary: 'link to the source code of this site', run: (_a, ctx) => link(ctx.data.links.repo, ctx.data.links.repo) },
  { name: 'donate', summary: 'support me on Saweria', run: (_a, ctx) => link(ctx.data.links.donate, ctx.data.links.donate) },
  { name: 'sudo', summary: 'try it', run: () => [out('visitor is not in the sudoers file. This incident will be reported.')] },
  { name: 'vi', aliases: ['vim'], summary: 'edit a file', run: () => [out('vi: I opened it, but I can not figure out how to leave.')] },
  { name: 'emacs', summary: 'edit a file, slowly', run: () => [out('emacs: still starting up. Check back after the next release.')] },
]
