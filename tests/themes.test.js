import { test, expect } from 'bun:test'
import { THEMES } from '../src/terminal/themes.js'
import { store, setTheme, loadPersisted } from '../src/state/store.js'

test('four themes with five hex keys each', () => {
  expect(Object.keys(THEMES)).toEqual(['ink', 'paper', 'phosphor', 'blueprint'])
  for (const t of Object.values(THEMES)) {
    expect(Object.keys(t).sort()).toEqual(['accent', 'bg', 'fg', 'muted', 'rule'])
    for (const v of Object.values(t)) expect(v).toMatch(/^#[0-9a-f]{6}$/i)
  }
})
test('setTheme ignores unknown and inherited names', () => {
  store.theme = 'ink'
  setTheme('nope'); expect(store.theme).toBe('ink')
  setTheme('constructor'); expect(store.theme).toBe('ink')
  setTheme('paper'); expect(store.theme).toBe('paper')
  store.theme = 'ink'
})
test('loadPersisted ignores an invalid persisted theme', () => {
  store.theme = 'ink'
  loadPersisted({ getItem: () => JSON.stringify({ theme: 'nope' }) })
  expect(store.theme).toBe('ink')
  loadPersisted({ getItem: () => JSON.stringify({ theme: 'phosphor' }) })
  expect(store.theme).toBe('phosphor')
  store.theme = 'ink'
})
