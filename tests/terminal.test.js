import { test, expect, beforeEach } from 'bun:test'
import { tokenize } from '../src/terminal/tokenize.js'
import { register, clearRegistry, execute } from '../src/terminal/registry.js'
import { complete } from '../src/terminal/complete.js'

const ctx = {}
const stub = (name, extra = {}) => ({ name, summary: name, run: () => [{ type: 'out', text: name }], ...extra })

beforeEach(() => clearRegistry())

test('tokenize', () => {
  expect(tokenize('echo "a b"  c')).toEqual(['echo', 'a b', 'c'])
  expect(tokenize("x 'a b'")).toEqual(['x', 'a b'])
  expect(tokenize('   ')).toEqual([])
  expect(tokenize('')).toEqual([])
})

test('execute: empty and unknown', async () => {
  expect(await execute('', ctx)).toEqual([])
  expect(await execute('  ', ctx)).toEqual([])
  const out = await execute('nope', ctx)
  expect(out).toHaveLength(1)
  expect(out[0].type).toBe('err')
  expect(out[0].text.startsWith('command not found: nope')).toBe(true)
})

test('execute: suggestion within distance 2', async () => {
  register([stub('help')])
  const out = await execute('hlep', ctx)
  expect(out.some((l) => l.text.includes('Did you mean help?'))).toBe(true)
  const far = await execute('zzzzzz', ctx)
  expect(far.some((l) => l.text.includes('Did you mean'))).toBe(false)
})

test('execute: runs command, alias, args', async () => {
  register([stub('echo', { aliases: ['say'], run: (a) => [{ type: 'out', text: a.join('|') }] })])
  expect(await execute('echo a "b c"', ctx)).toEqual([{ type: 'out', text: 'a|b c' }])
  expect(await execute('say x', ctx)).toEqual([{ type: 'out', text: 'x' }])
})

test('execute: void result, throw and reject become err or empty', async () => {
  register([
    stub('v', { run: () => {} }),
    stub('boom', { run: () => { throw new Error('bad') } }),
    stub('rej', { run: async () => { throw new Error('later') } }),
  ])
  expect(await execute('v', ctx)).toEqual([])
  expect(await execute('boom', ctx)).toEqual([{ type: 'err', text: 'bad' }])
  expect(await execute('rej', ctx)).toEqual([{ type: 'err', text: 'later' }])
})

test('register replaces by name', async () => {
  register([stub('a', { run: () => [{ type: 'out', text: '1' }] })])
  register([stub('a', { run: () => [{ type: 'out', text: '2' }] })])
  expect((await execute('a', ctx))[0].text).toBe('2')
})

test('complete: command names', () => {
  register([stub('help'), stub('history')])
  expect(complete('hel', ctx)).toEqual({ value: 'help ', options: [] })
  expect(complete('h', ctx)).toEqual({ value: 'h', options: ['help', 'history'] })
  expect(complete('hi', ctx).value).toBe('history ')
  expect(complete('zz', ctx)).toEqual({ value: 'zz', options: [] })
})

test('complete: aliases', () => {
  register([stub('echo', { aliases: ['say'] })])
  expect(complete('sa', ctx).value).toBe('say ')
})

test('complete: delegates to args', () => {
  register([stub('experience', { args: (p) => ['acme', 'beta', 'bold'].filter((x) => x.startsWith(p)) })])
  expect(complete('experience ', ctx).options).toEqual(['acme', 'beta', 'bold'])
  expect(complete('experience a', ctx)).toEqual({ value: 'experience acme ', options: [] })
  expect(complete('experience b', ctx)).toEqual({ value: 'experience b', options: ['beta', 'bold'] })
  expect(complete('experience bo', ctx).value).toBe('experience bold ')
  expect(complete('experience q', ctx)).toEqual({ value: 'experience q', options: [] })
  expect(complete('help x', ctx)).toEqual({ value: 'help x', options: [] })
})

test('tokenize: unclosed quote runs to end of line', () => {
  expect(tokenize('a "b c')).toEqual(['a', 'b c'])
})

test('complete: empty input lists every command and alias', () => {
  register([stub('help'), stub('vi', { aliases: ['vim'] }), stub('ls')])
  expect(complete('', ctx)).toEqual({ value: '', options: ['help', 'ls', 'vi', 'vim'] })
})
