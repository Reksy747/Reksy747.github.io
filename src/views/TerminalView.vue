<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { store, savePersisted } from '../state/store.js'
import { applyTheme } from '../terminal/themes.js'
import { useTerminal } from '../terminal/useTerminal.js'
import '../styles/terminal.scss'

const rootEl = ref(null)
const logEl = ref(null)
const inputEl = ref(null)
const { input, onKey, run, doComplete, scrollDown, PROMPT } = useTerminal(logEl)
const CHIPS = ['help', 'experience', 'projects', 'skills', 'contact', 'gui']

watch(() => store.theme, (n) => { applyTheme(n, rootEl.value); savePersisted() })

// keep the prompt above the on-screen keyboard
const vv = typeof window !== 'undefined' ? window.visualViewport : null
const fit = () => { if (vv && rootEl.value) rootEl.value.style.height = `${vv.height}px` }
onMounted(() => {
  applyTheme(store.theme, rootEl.value)
  inputEl.value.focus({ preventScroll: true })
  scrollDown()
  vv?.addEventListener('resize', fit)
  fit()
})
onBeforeUnmount(() => vv?.removeEventListener('resize', fit))

// keep a text selection (copying output) intact
const focusInput = () => { if (!window.getSelection()?.toString()) inputEl.value.focus({ preventScroll: true }) }
const chip = (c) => { run(c); inputEl.value.focus({ preventScroll: true }) }
const tab = () => { doComplete(); inputEl.value.focus({ preventScroll: true }) }
</script>

<template>
  <div ref="rootEl" class="term" @click="focusInput">
    <div ref="logEl" class="term__log" role="log" aria-live="polite" aria-label="Terminal output" tabindex="0">
      <div v-for="(l, i) in store.terminal.lines" :key="i" class="term__line" :class="`is-${l.type}`" :aria-hidden="l.type === 'banner' ? 'true' : null">
        <a v-if="l.href" :href="l.href" rel="noopener" :target="l.href.startsWith('mailto:') ? null : '_blank'">{{ l.text }}</a>
        <template v-else>{{ l.text }}</template>
      </div>
    </div>
    <label class="term__prompt">
      <span class="term__ps" aria-hidden="true">{{ PROMPT }}</span>
      <input
        ref="inputEl" v-model="input" class="term__input" aria-label="Terminal command"
        autocapitalize="off" autocorrect="off" autocomplete="off" spellcheck="false" enterkeyhint="go"
        @keydown="onKey"
      >
    </label>
    <div class="term__chips">
      <button v-for="c in CHIPS" :key="c" type="button" @click.stop="chip(c)">{{ c }}</button>
      <button type="button" @click.stop="tab">Tab</button>
    </div>
  </div>
</template>
