import { ref, nextTick } from 'vue'
import { store } from '../state/store.js'
import portfolio from '../data/portfolio.js'
import { execute } from './registry.js'
import { complete } from './complete.js'
import { registerAll } from './commands/index.js'
import { banner } from './banner.js'

export const PROMPT = 'visitor@reksy.dev:~$'
let registered = false
let announced = null // last section the terminal announced or set

export function useTerminal(scrollEl) {
  if (!registered) { registerAll(); registered = true }
  const input = ref('')
  let draft = ''
  const t = store.terminal
  const scrollDown = () => nextTick(() => { const el = scrollEl.value; if (el) el.scrollTop = el.scrollHeight })
  const ctx = {
    store, data: portfolio, now: () => new Date(), fetch: (...a) => window.fetch(...a),
    wait: (ms) => new Promise((r) => setTimeout(r, ms)), scroll: scrollDown,
  }

  if (!t.lines.length) {
    t.lines.push(...banner())
  }
  if (store.section && store.section !== announced) t.lines.push({ type: 'out', text: `you were reading: ${store.section}` })
  announced = store.section

  async function run(text) {
    const line = text.trim()
    input.value = ''
    if (!line) return
    t.history.push(line)
    t.cursor = t.history.length
    // echo first so slow commands (weather) show the input at once; clear replaces lines, dropping the echo
    t.lines.push({ type: 'in', text: `${PROMPT} ${line}` })
    const res = await execute(line, ctx)
    t.lines.push(...res)
    announced = store.section
    scrollDown()
  }

  function doComplete() {
    if (!input.value.trim()) return // nothing typed: Tab must not dump every command into the log
    try {
      const r = complete(input.value, ctx)
      input.value = r.value
      if (r.options.length) t.lines.push({ type: 'out', text: r.options.join('  ') })
    } catch {}
    scrollDown()
  }

  function clear() { t.lines = banner() } // Ctrl+L behaves like the clear command

  function onKey(e) {
    if (e.isComposing) return // IME: Enter/arrows belong to the composition
    const key = e.key.toLowerCase() // Caps Lock turns Ctrl+I into 'I'
    if (e.key === 'Enter') { e.preventDefault(); run(input.value) }
    // only plain Tab completes; Shift+Tab must still move focus out
    else if ((e.key === 'Tab' && !e.shiftKey) || (e.ctrlKey && key === 'i')) { e.preventDefault(); doComplete() }
    else if (e.ctrlKey && key === 'l') { e.preventDefault(); clear() }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!t.history.length || t.cursor <= 0) return
      if (t.cursor === t.history.length) draft = input.value
      input.value = t.history[--t.cursor]
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (t.cursor >= t.history.length) return
      t.cursor++
      input.value = t.cursor === t.history.length ? draft : t.history[t.cursor]
    }
  }

  return { input, onKey, run, doComplete, scrollDown, PROMPT }
}
