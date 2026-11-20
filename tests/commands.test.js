import { test, expect, beforeEach, afterEach } from 'bun:test'
import { reactive } from 'vue'
import portfolio from '../src/data/portfolio.js'
import { register, clearRegistry, execute, registry } from '../src/terminal/registry.js'
import { commands as content } from '../src/terminal/commands/content.js'
import { commands as shell } from '../src/terminal/commands/shell.js'
import { THEMES } from '../src/terminal/themes.js'
import { banner } from '../src/terminal/banner.js'

let ctx
beforeEach(() => {
  clearRegistry()
  register([...content, ...shell])
  const store = reactive({ mode: 'terminal', section: null, theme: 'ink', terminal: { lines: [], history: [], cursor: 0 }, todos: [] })
  ctx = { store, data: portfolio, now: () => new Date('2026-01-02T03:04:05Z'), fetch: undefined }
})
afterEach(() => clearRegistry())

const run = (l) => execute(l, ctx)
const last = (a) => a[a.length - 1]

test('experience lists six roles; detail; unknown', async () => {
  const out = await run('experience')
  expect(out).toHaveLength(6)
  expect(ctx.store.section).toBe('experience')
  const d = await run('experience member-id')
  expect(d.map((l) => l.text).join('\n')).toContain('NGINX')
  const b = portfolio.experience[0].bullets
  expect(last(d).text).toContain(b[b.length - 1])
  expect((await run('experience nope'))[0].type).toBe('err')
})

test('content commands set section', async () => {
  for (const s of ['about', 'projects', 'skills', 'education', 'contact']) {
    ctx.store.section = null
    const out = await run(s)
    expect(out.length).toBeGreaterThan(0)
    expect(ctx.store.section).toBe(s)
  }
  await run('resume')
  expect(ctx.store.mode).toBe('resume')
})

test('ls and cat', async () => {
  expect((await run('ls'))[0].text).toContain('about.txt')
  expect((await run('cat nope.txt'))[0].type).toBe('err')
  expect((await run('cat skills.txt')).length).toBeGreaterThan(0)
  expect(ctx.store.section).toBe('skills')
})

const withEmail = (email) => ({ ...portfolio, links: { ...portfolio.links, email } })

test('contact shows the repo, and the email placeholder while none is set', async () => {
  ctx.data = withEmail('[add public email]')
  const t = (await run('contact')).map((l) => l.text + (l.href || '')).join('\n')
  expect(t).toContain(portfolio.links.repo)
  expect(t).toContain('[add public email]')
})

test('the real email in the data shows in contact as a mailto link', async () => {
  const email = (await run('contact')).find((l) => l.text.startsWith('Email'))
  expect(email.text).toContain(portfolio.links.email)
  expect(email.href).toBe(`mailto:${portfolio.links.email}`)
})

test('contact email is a mailto link when real; resume summary carries the label', async () => {
  ctx.data = { ...portfolio, links: { ...portfolio.links, email: 'a@b.co' } }
  const email = (await run('contact')).find((l) => l.text.startsWith('Email'))
  expect(email.href).toBe('mailto:a@b.co')
  expect(registry.find((c) => c.name === 'resume').summary).toBe('Resume / Save PDF (printable view)')
})

test('gui prints its launch lines, waits between them, and switches last', async () => {
  const seen = []
  ctx.wait = async () => { seen.push([ctx.store.terminal.lines.length, ctx.store.mode]) }
  await run('gui')
  expect(seen).toEqual([[1, 'terminal'], [2, 'terminal'], [3, 'terminal']])
  expect(ctx.store.mode).toBe('gui')
})

test('shell basics', async () => {
  await run('gui')
  expect(ctx.store.mode).toBe('gui')
  ctx.store.mode = 'terminal'
  expect(await run('exit')).toEqual([{ type: 'out', text: 'System locked. There is no exit from this simulation' }])
  expect(ctx.store.mode).toBe('terminal') // exit no longer leaves; only gui does
  expect((await run('donate'))[0].href).toBe('https://saweria.co/Reksy')
  expect((await run('repo'))[0].href).toBe(portfolio.links.repo)
  expect((await run('email'))[0].text).toBe(portfolio.links.email)
  const denied = [{ type: 'out', text: 'visitor is not in the sudoers file. This incident will be reported.' }]
  expect(await run('sudo')).toEqual(denied)
  expect(await run('sudo su')).toEqual(denied)
  ctx.store.terminal.lines.push({ type: 'out', text: 'x' })
  expect(await run('clear')).toEqual([])
  expect(ctx.store.terminal.lines).toEqual(banner()) // clear brings the welcome banner back
  expect((await run('cat nope.txt'))[0].type).toBe('err')
  expect((await run('whoami'))[0].text).toBe('visitor')
  expect((await run('hostname'))[0].text).toBe('reksy.dev')
  expect((await run('date'))[0].text).toBe('Fri Jan 2 2026 10:04:05 GMT+7') // 03:04:05Z is 10:04:05 in Jakarta
  ctx.now = () => new Date('2026-12-31T20:00:00Z')
  expect((await run('date'))[0].text).toBe('Fri Jan 1 2027 03:00:00 GMT+7') // the date rolls over in GMT+7 too
  expect((await run('vi'))[0].text).not.toBe((await run('emacs'))[0].text)
  expect((await run('vim'))[0].text).toBe((await run('vi'))[0].text)
})

test('echo is plain text', async () => {
  const out = await run('echo <script>alert(1)</script>')
  expect(out[0].text).toBe('<script>alert(1)</script>')
})

test('history numbered', async () => {
  ctx.store.terminal.history.push('ls', 'help')
  expect((await run('history')).map((l) => l.text)).toEqual(['1  ls', '2  help'])
})

test('theme', async () => {
  const list = await run('theme')
  for (const n of Object.keys(THEMES)) expect(list.map((l) => l.text).join('\n')).toContain(n)
  await run('theme paper')
  expect(ctx.store.theme).toBe('paper')
  const bad = await run('theme nope')
  expect(bad[0].type).toBe('err')
  expect(bad[0].text).toContain('paper')
})

test('themes have exact keys', () => {
  for (const t of Object.values(THEMES)) expect(Object.keys(t).sort()).toEqual(['accent', 'bg', 'fg', 'muted', 'rule'])
})

test('summaries and help', async () => {
  expect(registry.length).toBeGreaterThan(0)
  for (const c of registry) expect(c.summary?.length).toBeGreaterThan(0)
  const h = (await run('help')).map((l) => l.text).join('\n')
  for (const c of registry) expect(h).toContain(c.name)
})

test('prototype keys are not themes or files', async () => {
  for (const k of ['constructor', '__proto__', 'toString']) {
    const t = await run(`theme ${k}`)
    expect(t).toHaveLength(1)
    expect(t[0].type).toBe('err')
    expect(t[0].text).toContain('Valid: ink, paper')
    expect(ctx.store.theme).toBe('ink')
  }
  for (const k of ['constructor', '__proto__']) {
    const c = await run(`cat ${k}`)
    expect(c).toHaveLength(1)
    expect(c[0]).toEqual({ type: 'err', text: `cat: ${k}: No such file` })
  }
})

test('email placeholder is plain text, no href', async () => {
  ctx.data = withEmail('[add public email]')
  const [line] = await run('email')
  expect(line.text).toBe('[add public email]')
  expect(line.href).toBeUndefined()
})

test('help lists aliases next to the command', async () => {
  const h = (await run('help')).map((l) => l.text)
  expect(h.some((l) => l.startsWith('vi, vim '))).toBe(true)
})
