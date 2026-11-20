import { evaluate } from '../calc.js'
import { convert } from '../convert.js'
import { getWeather, UNAVAILABLE } from '../weather.js'
import { simulateCurl } from '../curl.js'
import { savePersisted } from '../../state/store.js'

const out = (text) => ({ type: 'out', text })
const err = (text) => ({ type: 'err', text })
// 12 significant digits hide float noise (0.1+0.2); integers stay exact (1024 GiB in B)
const num = (v) => String(Number.isInteger(v) ? v : +v.toPrecision(12))

function todo([sub, ...rest], ctx) {
  const todos = ctx.store.todos
  if (!sub) return todos.length ? todos.map((t, i) => out(`${i + 1}. [${t.done ? 'x' : ' '}] ${t.text}`)) : [out('no todos yet. Try: todo add <text>')]
  if (sub === 'add') {
    const text = rest.join(' ').trim()
    if (!text) return [err('usage: todo add <text>')]
    todos.push({ text, done: false })
    savePersisted()
    return [out(`added: ${text}`)]
  }
  if (sub === 'done' || sub === 'rm') {
    const n = Number(rest[0])
    if (!Number.isInteger(n) || n < 1 || n > todos.length) return [err(`no such todo: ${rest[0] ?? ''}`)]
    if (sub === 'done') todos[n - 1].done = true
    else todos.splice(n - 1, 1)
    savePersisted()
    return [out(sub === 'done' ? `done: ${n}` : `removed: ${n}`)]
  }
  return [err('usage: todo [add <text> | done <n> | rm <n>]')]
}

export const commands = [
  {
    name: 'calc',
    summary: 'calculator: calc <expression>',
    run(args) {
      if (!args.length) return [err('usage: calc <expression>')]
      try { return [out(num(evaluate(args.join(' '))))] } catch (e) { return [err(e.message)] }
    },
  },
  {
    name: 'convert',
    summary: 'convert units: convert <n> <from> <to>',
    run(args) {
      const [n, from, to] = args
      const v = Number(n)
      if (args.length !== 3 || n.trim() === '' || !Number.isFinite(v)) return [err('usage: convert <n> <from> <to>')]
      try { return [out(`${n} ${from} = ${num(convert(v, from, to))} ${to}`)] } catch (e) { return [err(e.message)] }
    },
  },
  { name: 'todo', summary: 'todo list: todo [add <text> | done <n> | rm <n>]', run: todo },
  {
    name: 'weather',
    summary: 'live weather for any city, regency or country: weather [place] (default Jakarta)',
    async run(args, ctx) {
      if (!ctx.fetch) return [err(UNAVAILABLE)]
      const { ok, text } = await getWeather(ctx.fetch, args.join(' '))
      return [ok ? out(text) : err(text)]
    },
  },
  {
    name: 'curl',
    summary: 'transfer data from a URL (simulated): curl reksy747.github.io',
    run([url], ctx) {
      if (!url) return [err("curl: try 'curl reksy747.github.io'")]
      const { status, lines } = simulateCurl(url, ctx.data)
      return lines.map((text) => (status.startsWith('HTTP/2 200') ? out(text) : err(text)))
    },
  },
]
