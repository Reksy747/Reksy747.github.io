<script setup>
import portfolio from '../data/portfolio.js'
import { isPlaceholder } from '../data/placeholders.js'
import { setMode } from '../state/store.js'
import photo from '../assets/reksy.jpg'
import { NButton } from 'naive-ui'
const { identity, links } = portfolio
const emailIsReal = !isPlaceholder(links.email)
</script>

<template>
  <header class="panel profile">
    <span class="avatar"><img :src="photo" width="400" height="400" :alt="`Photo of ${identity.shortName}`" fetchpriority="high"></span>
    <div class="profile__who">
      <h1 class="profile__name">{{ identity.name }}</h1>
      <p class="profile__role">{{ identity.role }}</p>
      <p class="profile__status">
        <span class="dot" aria-hidden="true"></span>{{ identity.status }}
        <span class="muted">· {{ identity.openTo }}</span>
      </p>
    </div>
    <div class="profile__side">
      <div class="profile__actions">
        <n-button type="primary" size="large" @click="setMode('resume')">Resume / Save PDF</n-button>
        <n-button size="large" @click="setMode('terminal')">Open terminal</n-button>
      </div>
      <ul class="profile__links">
        <li><a :href="links.linkedin" rel="noopener">LinkedIn</a></li>
        <li><a :href="links.github" rel="noopener">GitHub</a></li>
        <li>
          <a v-if="emailIsReal" :href="`mailto:${links.email}`">{{ links.email }}</a>
          <span v-else>{{ links.email }}</span>
        </li>
      </ul>
    </div>
  </header>
</template>
