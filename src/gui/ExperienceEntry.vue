<script setup>
import { computed, ref } from 'vue'
import { NButton, NTag } from 'naive-ui'
import { duration } from './duration.js'

const props = defineProps({ job: { type: Object, required: true } })
const FOLD = 5

const expanded = ref(false)
const hidden = computed(() => Math.max(0, props.job.bullets.length - FOLD))
const shown = computed(() => (expanded.value ? props.job.bullets : props.job.bullets.slice(0, FOLD)))
const span = duration(props.job.start, props.job.end)
const place = [props.job.location, props.job.workMode].filter(Boolean).join(' · ')
const listId = `bullets-${props.job.id}`
</script>

<template>
  <article class="entry">
    <div class="entry__meta">
      <p class="entry__dates">{{ job.start }} – {{ job.end }}</p>
      <p v-if="span">{{ span }}</p>
      <p v-if="job.type !== job.company">{{ job.type }}</p>
      <p v-if="place">{{ place }}</p>
    </div>
    <div class="entry__body">
      <h3 class="entry__role">{{ job.role }}</h3>
      <p class="entry__org">{{ job.company }}</p>
      <ul v-if="job.bullets.length" :id="listId" class="bullets">
        <li v-for="b in shown" :key="b">{{ b }}</li>
      </ul>
      <n-button v-if="hidden" text type="primary" class="more" :aria-expanded="String(expanded)" :aria-controls="listId" @click="expanded = !expanded">
        {{ expanded ? 'Show less' : `Show ${hidden} more` }}
      </n-button>
      <ul v-if="job.tools?.length" class="chips" aria-label="Tools">
        <li v-for="t in job.tools" :key="t"><n-tag size="small" :bordered="true">{{ t }}</n-tag></li>
      </ul>
    </div>
  </article>
</template>
