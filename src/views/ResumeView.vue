<script setup>
import portfolio from '../data/portfolio.js'
import { isPlaceholder } from '../data/placeholders.js'
import { setMode } from '../state/store.js'
import '../styles/print.scss'

const { identity, links } = portfolio
const print = () => window.print()
const meta = (job) => [job.type !== job.company && job.type, job.location, job.workMode].filter(Boolean).join(', ')
</script>

<template>
  <div class="resume">
    <div class="resume__toolbar">
      <button type="button" @click="print">Resume / Save PDF</button>
      <button type="button" @click="setMode('gui')">Back to site</button>
    </div>

    <main class="resume__page">
      <header>
        <h1 class="resume__name">{{ identity.name }}</h1>
        <p class="resume__role">{{ identity.role }}</p>
        <p class="resume__dim">{{ identity.location }}</p>
        <ul class="resume__contact">
          <li>LinkedIn: <a :href="links.linkedin">{{ links.linkedin }}</a></li>
          <li>GitHub: <a :href="links.github">{{ links.github }}</a></li>
          <li>Email: <a v-if="!isPlaceholder(links.email)" :href="`mailto:${links.email}`">{{ links.email }}</a><template v-else>{{ links.email }}</template></li>
        </ul>
      </header>

      <section class="resume__section">
        <h2>About</h2>
        <p>{{ portfolio.about.join(' ') }}</p>
      </section>

      <section class="resume__section">
        <h2>Experience</h2>
        <article v-for="job in portfolio.experience" :key="job.id" class="resume__job">
          <h3><strong>{{ job.role }}</strong>, {{ job.company }}</h3>
          <p class="resume__dim">{{ job.start }} – {{ job.end }}<template v-if="meta(job)">, {{ meta(job) }}</template></p>
          <ul v-if="job.bullets.length">
            <li v-for="b in job.bullets" :key="b">{{ b }}</li>
          </ul>
        </article>
      </section>

      <section class="resume__section">
        <h2>Skills</h2>
        <p v-for="g in portfolio.skills" :key="g.group"><strong>{{ g.group }}:</strong> {{ g.items.join(', ') }}</p>
      </section>

      <section class="resume__section">
        <h2>Projects</h2>
        <article v-for="p in portfolio.projects" :key="p.id" class="resume__item">
          <h3><strong>{{ p.name }}</strong> ({{ p.role }})</h3>
          <p>{{ p.summary }}</p>
          <p class="resume__dim">{{ p.stack.join(', ') }}</p>
          <p v-if="p.repo"><a :href="p.repo">{{ p.repo }}</a></p>
          <p v-if="p.note" class="resume__dim">{{ p.note }}</p>
        </article>
      </section>

      <section class="resume__section">
        <h2>Education</h2>
        <article v-for="e in portfolio.education" :key="e.school" class="resume__item">
          <h3><strong>{{ e.school }}</strong></h3>
          <p>{{ e.degree }}, {{ e.years }}</p>
        </article>
      </section>
    </main>
  </div>
</template>
