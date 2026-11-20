import { SECTIONS } from '../data/portfolio.js'

const MODES = ['gui', 'terminal', 'resume']

export function parseLocation(search, hash) {
  const m = new URLSearchParams(search).get('mode') // first value wins
  const s = (hash || '').replace(/^#/, '')
  return { mode: MODES.includes(m) ? m : 'terminal', section: SECTIONS.includes(s) ? s : null }
}

export function buildLocation(mode, section) {
  return (mode === 'terminal' ? '' : `?mode=${mode}`) + (section ? `#${section}` : '')
}
