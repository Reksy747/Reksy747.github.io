<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import portfolio, { SECTIONS } from '../data/portfolio.js'
import { isPlaceholder } from '../data/placeholders.js'
import { store, setSection } from '../state/store.js'
import { currentSection } from '../gui/currentSection.js'
import ProfileHeader from '../gui/ProfileHeader.vue'
import ExperienceEntry from '../gui/ExperienceEntry.vue'
import { NConfigProvider, NTabs, NTab, NTag, NCard, darkTheme } from 'naive-ui'
import { themeOverrides } from '../gui/naiveTheme.js'
import '../styles/gui.scss'

const { identity, links } = portfolio
const emailIsReal = !isPlaceholder(links.email)
const bare = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')
const TABS = [['experience', 'Experience'], ['education', 'Education'], ['skills', 'Skills'], ['projects', 'Projects'], ['contact', 'Contact']] // the sidebar is gone, so the tabs reach every section below About

// the tabs are in-page navigation (no panels): selecting one scrolls to its section; scroll-margin keeps it below the sticky bar
function jump(id) {
  setSection(id)
  document.getElementById(id)?.scrollIntoView()
}

// --- scroll tracking -------------------------------------------------------
let frame = 0
function track() {
  frame = 0
  const { scrollY, innerHeight } = window
  const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean)
  // a section is over once its end slides under the sticky bars (its scroll-margin), not the viewport top
  const covered = els.length ? parseFloat(getComputedStyle(els[0]).scrollMarginTop) || 0 : 0
  const positions = els
    .map((el) => { const r = el.getBoundingClientRect(); return { id: el.id, top: r.top + scrollY, bottom: r.bottom + scrollY - covered } })
    .sort((a, b) => a.top - b.top) // the page order differs from SECTIONS; currentSection wants document order
  const current = currentSection(positions, {
    scrollY,
    line: scrollY + innerHeight * 0.35, // a section counts once it reaches the top third
    viewportHeight: innerHeight,
    atBottom: innerHeight + scrollY >= document.documentElement.scrollHeight - 2,
    prev: store.section,
  })
  if (current !== store.section) setSection(current)
}
const onScroll = () => { if (!frame) frame = requestAnimationFrame(track) }

onMounted(() => {
  // scroll first, so the first measurement keeps the section we came back to
  if (store.section) document.getElementById(store.section)?.scrollIntoView()
  track()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
  <div class="shell" :data-gui-theme="store.guiTheme">
    <main class="main">
      <ProfileHeader />

      <div class="panel sheet">
        <section id="about" class="intro" aria-labelledby="h-about">
          <h2 id="h-about" class="intro__title">Resume<span class="accent" aria-hidden="true">.</span></h2>
          <p>{{ portfolio.about.join(' ') }}</p>
        </section>

        <nav class="tabs" aria-label="On this page">
          <n-tabs :value="store.section" type="line" justify-content="space-evenly" @update:value="jump">
            <n-tab v-for="[id, label] in TABS" :key="id" :name="id">{{ label }}</n-tab>
          </n-tabs>
        </nav>

        <section id="experience" aria-labelledby="h-experience">
          <h2 id="h-experience" class="sec"><span class="sec__num" aria-hidden="true">01</span>Experience</h2>
          <ExperienceEntry v-for="job in portfolio.experience" :key="job.id" :job="job" />
        </section>

        <section id="education" aria-labelledby="h-education">
          <h2 id="h-education" class="sec"><span class="sec__num" aria-hidden="true">02</span>Education</h2>
          <article v-for="e in portfolio.education" :key="e.school" class="entry">
            <div class="entry__meta"><p class="entry__dates">{{ e.years }}</p></div>
            <div class="entry__body">
              <h3 class="entry__role">{{ e.school }}</h3>
              <p>{{ e.degree }}</p>
            </div>
          </article>
        </section>

        <section id="skills" aria-labelledby="h-skills">
          <h2 id="h-skills" class="sec"><span class="sec__num" aria-hidden="true">03</span>Skills</h2>
          <div v-for="g in portfolio.skills" :key="g.group" class="entry">
            <h3 class="entry__meta skill">{{ g.group }}</h3>
            <ul class="chips entry__body">
              <li v-for="s in g.items" :key="s"><n-tag size="small" :bordered="true">{{ s }}</n-tag></li>
            </ul>
          </div>
        </section>

        <section id="projects" aria-labelledby="h-projects">
          <h2 id="h-projects" class="sec"><span class="sec__num" aria-hidden="true">04</span>Projects</h2>
          <ul class="projects">
            <li v-for="p in portfolio.projects" :key="p.id">
              <n-card size="small" class="card">
                <h3 class="entry__role">{{ p.name }}</h3>
                <p class="card__role">{{ p.role }}</p>
                <p>{{ p.summary }}</p>
                <ul class="chips" aria-label="Stack">
                  <li v-for="s in p.stack" :key="s"><n-tag size="small" :bordered="true">{{ s }}</n-tag></li>
                </ul>
                <p v-if="p.repo"><a :href="p.repo" rel="noopener">{{ bare(p.repo) }}</a></p>
                <p v-if="p.note" class="muted">{{ p.note }}</p>
              </n-card>
            </li>
          </ul>
        </section>

        <section id="contact" aria-labelledby="h-contact">
          <h2 id="h-contact" class="sec"><span class="sec__num" aria-hidden="true">05</span>Contact</h2>
          <dl class="contact">
            <div class="entry">
              <dt class="entry__meta">Email</dt>
              <dd class="entry__body">
                <a v-if="emailIsReal" :href="`mailto:${links.email}`">{{ links.email }}</a>
                <template v-else>{{ links.email }}</template>
              </dd>
            </div>
            <div class="entry">
              <dt class="entry__meta">LinkedIn</dt>
              <dd class="entry__body"><a :href="links.linkedin" rel="noopener">{{ bare(links.linkedin) }}</a></dd>
            </div>
            <div class="entry">
              <dt class="entry__meta">GitHub</dt>
              <dd class="entry__body"><a :href="links.github" rel="noopener">{{ bare(links.github) }}</a></dd>
            </div>
            <div class="entry">
              <dt class="entry__meta">Location</dt>
              <dd class="entry__body">{{ identity.location }}. {{ identity.openTo }}.</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  </div>
  </n-config-provider>
</template>
