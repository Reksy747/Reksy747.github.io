<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits(['done'])

const LINES = ['> initializing env...', '> loading modules [OK]', '> ready']
const STEP = 180 // ms between lines
const HOLD = 600 // ms until the fade starts; fade is 200ms, so the whole thing ends by 800ms

const shown = ref(0)
const open = ref(true)
const timers = []

function skip() {
  if (!open.value) return
  timers.forEach(clearTimeout)
  open.value = false
}

onMounted(() => {
  // reduced motion: all lines at once, no blink, no fade (see the CSS); it is still shown, just not animated
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) shown.value = LINES.length
  else LINES.forEach((_, i) => timers.push(setTimeout(() => { shown.value = i + 1 }, i * STEP)))
  timers.push(setTimeout(skip, HOLD))
  window.addEventListener('keydown', skip)
})
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  window.removeEventListener('keydown', skip)
})
</script>

<template>
  <Transition name="boot" @after-leave="emit('done')">
    <div v-if="open" class="boot" aria-hidden="true" @click="skip">
      <div class="boot__box">
        <p v-for="(line, i) in LINES.slice(0, shown)" :key="i" class="boot__line">
          {{ line }}<span v-if="i === shown - 1" class="boot__cursor"></span>
        </p>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.boot {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background-color: #0b0d0e;
  // same 40px grid as the GUI; flat, no glow
  background-image:
    linear-gradient(#1c2024 1px, transparent 1px),
    linear-gradient(90deg, #1c2024 1px, transparent 1px);
  background-size: 40px 40px;
  color: #f59e0b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.9375rem;
  cursor: pointer;

  &__box {
    min-width: min(20rem, calc(100vw - 2rem));
    min-height: 5.5rem; // reserves the room for all three lines, so nothing shifts as they appear
    padding: 1rem 1.25rem;
    border: 1px solid #2a2f35;
    background: #0b0d0e;
  }

  &__line { margin: 0; line-height: 1.8; white-space: nowrap; }

  &__cursor {
    display: inline-block;
    width: 0.55em;
    height: 1em;
    margin-left: 0.35em;
    background: #f59e0b;
    vertical-align: -0.15em;
    animation: boot-blink 0.9s steps(1) infinite;
  }
}

.boot-leave-active { transition: opacity 200ms ease; pointer-events: none; } // clicks pass through while it fades
.boot-leave-to { opacity: 0; }

@keyframes boot-blink { 50% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .boot__cursor { animation: none; }
  .boot-leave-active { transition: none; }
}
</style>
