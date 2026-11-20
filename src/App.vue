<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { store } from './state/store.js'
import BootScreen from './components/BootScreen.vue'
import ResumeView from './views/ResumeView.vue'

// both heavy views load on demand: the terminal is the first page and the GUI pulls in the UI library
const loadTerminal = () => import('./views/TerminalView.vue')
const loadGui = () => import('./views/GuiView.vue')
const TerminalView = defineAsyncComponent(loadTerminal)
const GuiView = defineAsyncComponent(loadGui)

// fetch the other chunk once the first view is idle, so switching modes does not flash an empty screen
onMounted(() => {
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500))
  idle(() => (store.mode === 'terminal' ? loadGui() : loadTerminal()).catch(() => {})) // a failed prefetch is not an error worth showing
})
// first load only (switching modes does not remount App); never in the print view
const booting = ref(store.mode !== 'resume')
const view = computed(() => (store.mode === 'terminal' ? TerminalView : store.mode === 'resume' ? ResumeView : GuiView))
</script>

<template>
  <BootScreen v-if="booting" @done="booting = false" />
  <Transition name="mode" mode="out-in">
    <component :is="view" :key="store.mode" />
  </Transition>
</template>

<style>
.mode-enter-active,
.mode-leave-active { transition: opacity 120ms ease; }
.mode-enter-from,
.mode-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .mode-enter-active,
  .mode-leave-active { transition: none; }
}
</style>
