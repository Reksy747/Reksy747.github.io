import { test, expect } from 'bun:test'
import { store, setMode, setSection, setTheme, setGuiTheme, loadPersisted, savePersisted, initStore, startUrlSync } from '../src/state/store.js'

const fakeStorage = (init = {}) => {
  const d = { ...init }
  return { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v) }, d }
}
const throwing = { getItem() { throw new Error('no') }, setItem() { throw new Error('no') } }

test('invalid JSON keeps defaults', () => {
  loadPersisted(fakeStorage({ 'reksy-portfolio': '{nope' }))
  expect(store.theme).toBe('ink')
  expect(store.todos).toEqual([])
})
test('throwing storage keeps defaults and save does not throw', () => {
  loadPersisted(throwing)
  expect(store.theme).toBe('ink')
  expect(() => savePersisted(throwing)).not.toThrow()
})
test('save then load restores theme and todos', () => {
  const s = fakeStorage()
  setTheme('paper')
  store.todos.push({ text: 'a', done: true })
  savePersisted(s)
  store.theme = 'ink'
  store.todos.length = 0
  loadPersisted(s)
  expect(store.theme).toBe('paper')
  expect(store.todos).toEqual([{ text: 'a', done: true }])
  expect(Object.keys(JSON.parse(s.d['reksy-portfolio'])).sort()).toEqual(['guiTheme', 'theme', 'todos'])
})

test('setGuiTheme accepts only dark and light', () => {
  store.guiTheme = 'dark'
  setGuiTheme('light')
  expect(store.guiTheme).toBe('light')
  for (const bad of ['__proto__', 5, 'ink', null, undefined, 'constructor']) setGuiTheme(bad)
  expect(store.guiTheme).toBe('light')
  setGuiTheme('dark')
  expect(store.guiTheme).toBe('dark')
})
test('guiTheme persists and invalid persisted values are ignored', () => {
  const s = fakeStorage()
  store.guiTheme = 'light'
  savePersisted(s)
  store.guiTheme = 'dark'
  loadPersisted(s)
  expect(store.guiTheme).toBe('light')
  for (const bad of ['"__proto__"', '5', '{"x":1}', '[1]']) {
    loadPersisted(fakeStorage({ 'reksy-portfolio': `{"guiTheme":${bad}}` }))
    expect(store.guiTheme).toBe('light')
  }
  store.guiTheme = 'dark'
})
test('terminal lines survive mode switches', () => {
  store.terminal.lines.push({ type: 'in', text: 'help' })
  setMode('terminal'); setMode('gui'); setMode('terminal')
  expect(store.terminal.lines).toEqual([{ type: 'in', text: 'help' }])
})
test('initStore reads location; startUrlSync writes it and handles popstate', () => {
  const calls = []
  const listeners = {}
  const win = {
    location: { pathname: '/', search: '?mode=gui', hash: '#skills' },
    history: { replaceState: (_a, _b, u) => calls.push(u) },
    addEventListener: (n, f) => { listeners[n] = f },
  }
  initStore(win)
  expect(store.mode).toBe('gui')
  expect(store.section).toBe('skills')
  startUrlSync(win)
  setSection('about')
  return Promise.resolve().then(() => {
    expect(calls.at(-1)).toBe('/?mode=gui#about')
    setMode('terminal') // the default mode must drop the query, not just change the hash
  }).then(() => {
    expect(calls.at(-1)).toBe('/#about')
    setSection(null)
  }).then(() => {
    expect(calls.at(-1)).toBe('/')
    win.location.search = ''; win.location.hash = '#contact'
    listeners.popstate()
    expect(store.mode).toBe('terminal')
    expect(store.section).toBe('contact')
  })
})

test('loadPersisted keeps only well-formed todos', () => {
  store.todos = []
  loadPersisted(fakeStorage({ 'reksy-portfolio': '{"todos":[null,1,{"text":"ok","done":1},{"text":5}]}' }))
  expect(store.todos).toEqual([{ text: 'ok', done: true }])
})
