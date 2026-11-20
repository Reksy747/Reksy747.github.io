import { watch } from 'vue'
import { createPinia, defineStore } from 'pinia'
import { THEMES } from '../terminal/themes.js'
import { parseLocation, buildLocation } from './url.js'

const KEY = 'reksy-portfolio'

// One Pinia instance, created here so plain modules (terminal commands, tests) can read the store without a component.
// main.js installs the same instance on the app.
export const pinia = createPinia()

const useStore = defineStore('portfolio', {
  state: () => ({
    mode: 'terminal', // the first page is the terminal; the `gui` command (or ?mode=gui) opens the resume site
    section: null,
    theme: 'ink',
    guiTheme: 'dark',
    terminal: { lines: [], history: [], cursor: 0 },
    todos: [],
  }),
})

export const store = useStore(pinia)

export const setMode = (m) => { store.mode = m }
export const setSection = (id) => { store.section = id }
export const setTheme = (name) => { if (Object.hasOwn(THEMES, name)) store.theme = name }
const GUI_THEMES = ['dark', 'light']
export const setGuiTheme = (name) => { if (GUI_THEMES.includes(name)) store.guiTheme = name }

export function loadPersisted(storage) {
  try {
    const data = JSON.parse((storage ?? globalThis.localStorage).getItem(KEY))
    if (Object.hasOwn(THEMES, data?.theme)) store.theme = data.theme
    setGuiTheme(data?.guiTheme)
    if (Array.isArray(data?.todos)) store.todos = data.todos.filter((t) => t && typeof t.text === 'string').map((t) => ({ text: t.text, done: !!t.done }))
  } catch {}
}

export function savePersisted(storage) {
  try {
    (storage ?? globalThis.localStorage).setItem(KEY, JSON.stringify({ theme: store.theme, guiTheme: store.guiTheme, todos: store.todos }))
  } catch {}
}

function applyLocation(win) {
  const { mode, section } = parseLocation(win.location.search, win.location.hash)
  store.mode = mode
  store.section = section
}

export function initStore(win = window) {
  applyLocation(win)
  loadPersisted()
}

export function startUrlSync(win = window) {
  // always prefix the path: a bare '#x' would resolve against the old URL and keep the old '?mode=...'
  watch(() => [store.mode, store.section], () => win.history.replaceState(null, '', win.location.pathname + buildLocation(store.mode, store.section)))
  win.addEventListener('popstate', () => applyLocation(win))
}
