import { test, expect, beforeEach, afterEach } from 'bun:test'
import { reactive } from 'vue'
import portfolio from '../src/data/portfolio.js'
import { register, clearRegistry, execute } from '../src/terminal/registry.js'
import { commands } from '../src/terminal/commands/tools.js'
import { getWeather } from '../src/terminal/weather.js'
import { simulateCurl } from '../src/terminal/curl.js'

const UNAVAILABLE = 'weather unavailable (offline or blocked). Try again later.'
let ctx
beforeEach(() => {
  clearRegistry()
  register(commands)
  const store = reactive({ mode: 'terminal', section: null, theme: 'ink', terminal: { lines: [], history: [], cursor: 0 }, todos: [] })
  ctx = { store, data: portfolio, now: () => new Date(), fetch: undefined }
})
afterEach(() => clearRegistry())
const run = (l) => execute(l, ctx)
const text = (o) => o.map((l) => l.text).join('\n')

test('calc', async () => {
  expect(text(await run('calc 2+2'))).toBe('4')
  expect((await run('calc 2^99999'))[0].type).toBe('err')
  expect((await run('calc alert(1)'))[0].type).toBe('err')
  expect((await run('calc'))[0].type).toBe('err')
})

test('convert', async () => {
  expect(text(await run('convert 1 GiB MiB'))).toBe('1 GiB = 1024 MiB')
  expect((await run('convert x GiB MiB'))[0].type).toBe('err')
  expect((await run('convert 1 GiB'))[0].type).toBe('err')
  expect((await run('convert 1 kg km'))[0].type).toBe('err')
})

test('todo add/list/done/rm', async () => {
  await run('todo add buy milk')
  expect(text(await run('todo'))).toBe('1. [ ] buy milk')
  await run('todo done 1')
  expect(text(await run('todo'))).toBe('1. [x] buy milk')
  expect((await run('todo rm 9'))[0].type).toBe('err')
  expect((await run('todo done abc'))[0].type).toBe('err')
  expect((await run('todo add'))[0].type).toBe('err')
  await run('todo rm 1')
  expect(ctx.store.todos).toEqual([])
})

const okFetch = (j) => async () => ({ ok: true, json: async () => j })
const CUR = { temperature_2m: 29, apparent_temperature: 33, relative_humidity_2m: 70, weather_code: 2, wind_speed_10m: 8, time: '2026-11-21T14:15' }
// answers the geocoder and the forecast differently, and records the urls it was asked for
const routedFetch = (geo, forecast, urls = []) => async (u) => {
  urls.push(u)
  return { ok: true, json: async () => (u.includes('geocoding') ? geo : forecast) }
}
test('getWeather without a place reads Jakarta and skips the lookup', async () => {
  const urls = []
  const r = await getWeather(routedFetch({}, { current: CUR }, urls))
  expect(r).toEqual({ ok: true, text: 'Jakarta: 29°C (feels like 33°C), partly cloudy, humidity 70%, wind 8 km/h · reading 2026-11-21 14:15 GMT+7' })
  expect(urls).toHaveLength(1)
  expect(urls[0]).toContain('latitude=-6.2')
  expect(urls[0]).toContain('timezone=Asia%2FJakarta') // every place's reading time is reported in GMT+7
})
test('getWeather looks any place up and shows where it resolved', async () => {
  const urls = []
  const geo = { results: [{ name: 'Yogyakarta', admin1: 'Special Region of Yogyakarta', country: 'Indonesia', latitude: -7.8, longitude: 110.36 }] }
  const r = await getWeather(routedFetch(geo, { current: CUR }, urls), '  new york & co ')
  expect(r.ok).toBe(true)
  expect(r.text.startsWith('Yogyakarta, Special Region of Yogyakarta, Indonesia: 29°C')).toBe(true)
  expect(urls[0]).toContain('name=new%20york%20%26%20co') // trimmed and encoded, no injection into the query string
  expect(urls[1]).toContain('latitude=-7.8')
  expect(urls[1]).toContain('longitude=110.36')
})
test('getWeather unknown place is a clear error, not "unavailable"', async () => {
  for (const geo of [{}, { results: [] }, { results: [{ name: 'x' }] }]) {
    expect(await getWeather(routedFetch(geo, {}), 'zzzz')).toEqual({ ok: false, text: 'weather: place not found: zzzz' })
  }
})
test('getWeather unknown code does not throw', async () => {
  expect((await getWeather(okFetch({ current: { temperature_2m: 1, weather_code: 'constructor', wind_speed_10m: 2 } }))).text).toContain('1°C')
})
test('getWeather failures', async () => {
  const bad = { ok: false, text: UNAVAILABLE }
  expect(await getWeather(async () => { throw new Error('x') })).toEqual(bad)
  expect(await getWeather(async () => ({ ok: false }))).toEqual(bad)
  expect(await getWeather(async () => ({ ok: true, json: async () => { throw new Error('bad') } }))).toEqual(bad)
  expect(await getWeather(okFetch({}))).toEqual(bad)
  expect(await getWeather((_u, o) => new Promise(() => {}), '', 50)).toEqual(bad)
  expect(await getWeather((_u, o) => new Promise(() => {}), 'tokyo', 50)).toEqual(bad)
})
test('weather command', async () => {
  expect(await run('weather')).toEqual([{ type: 'err', text: UNAVAILABLE }])
  ctx.fetch = routedFetch({ results: [{ name: 'Tokyo', country: 'Japan', latitude: 35.7, longitude: 139.7 }] }, { current: CUR })
  expect(text(await run('weather'))).toContain('Jakarta: 29')
  const tokyo = await run('weather Tokyo')
  expect(tokyo[0].type).toBe('out')
  expect(tokyo[0].text).toContain('Tokyo, Japan: 29')
  ctx.fetch = routedFetch({ results: [] }, {})
  expect(await run('weather atlantis')).toEqual([{ type: 'err', text: 'weather: place not found: atlantis' }])
})

test('simulateCurl', () => {
  for (const t of ['reksy747.github.io', 'https://reksy747.github.io/', 'reksy747.github.io/portfolio.json', 'https://reksy747.github.io/portfolio.json']) {
    const r = simulateCurl(t, portfolio)
    expect(r.status).toBe('HTTP/2 200')
    const job = portfolio.experience[0]
    expect(JSON.parse(r.lines.slice(r.lines.indexOf('') + 1).join('\n'))).toEqual({ name: portfolio.identity.name, role: job.role, company: job.company })
  }
  const bad = simulateCurl('https://example.com', portfolio)
  expect(bad.lines).toHaveLength(1) // just the error, no note line
  expect(bad.lines[0]).toContain('CORS')
  expect(bad.lines[0]).toContain('https://example.com')
  expect(bad.status).not.toBe('HTTP/2 200')
  for (const t of ['/portfolio.json', 'reksy747.github.io.evil.com', 'evilreksy747.github.io', 'google.com']) expect(simulateCurl(t, portfolio).lines[0]).toContain('CORS')
})
test('curl command', async () => {
  expect((await run('curl'))[0].type).toBe('err')
  expect((await run('curl https://example.com')).every((l) => l.type === 'err')).toBe(true)
  expect((await run('curl /portfolio.json'))[0].type).toBe('err')
  const ok = await run('curl reksy747.github.io')
  expect(ok[0].type).toBe('out')
  expect(ok[0].text).toBe('HTTP/2 200')
})

test('calc and convert hide float noise, integers stay exact', async () => {
  expect(text(await run('calc 0.1+0.2'))).toBe('0.3')
  expect(text(await run('convert 100 F C'))).toBe('100 F = 37.7777777778 C')
  expect(text(await run('convert 1 GiB MiB'))).toBe('1 GiB = 1024 MiB')
  expect(text(await run('convert 1024 GiB B'))).toBe('1024 GiB = 1099511627776 B')
})

test('calc keeps precision on large non-integers', async () => {
  expect(text(await run('calc 12345678901.5'))).toBe('12345678901.5')
})

test('curl host is case-insensitive', () => {
  expect(simulateCurl('https://Reksy747.github.io/portfolio.json', portfolio).status).toBe('HTTP/2 200')
})

test('convert accepts degree aliases', async () => {
  expect(text(await run('convert 0 °C °F'))).toBe('0 °C = 32 °F')
})

test('todo done 0 is an error and changes nothing', async () => {
  await run('todo add x')
  expect((await run('todo done 0'))[0].type).toBe('err')
  expect(ctx.store.todos).toEqual([{ text: 'x', done: false }])
})

test('getWeather unknown numeric code reads mixed conditions', async () => {
  expect((await getWeather(okFetch({ current: { temperature_2m: 30, weather_code: 42, wind_speed_10m: 5 } }))).text).toBe('Jakarta: 30°C, mixed conditions, wind 5 km/h')
})
