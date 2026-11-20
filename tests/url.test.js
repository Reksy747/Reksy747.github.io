import { test, expect } from 'bun:test'
import { parseLocation, buildLocation } from '../src/state/url.js'
import { SECTIONS } from '../src/data/portfolio.js'

test('parses mode and section', () => {
  expect(parseLocation('?mode=terminal', '#experience')).toEqual({ mode: 'terminal', section: 'experience' })
})
test('garbage falls back to terminal/null', () => {
  expect(parseLocation('?mode=garbage', '#nonsense')).toEqual({ mode: 'terminal', section: null })
  expect(parseLocation('', '')).toEqual({ mode: 'terminal', section: null })
})
test('first mode wins', () => {
  expect(parseLocation('?mode=gui&mode=resume', '').mode).toBe('gui')
})
test('buildLocation', () => {
  expect(buildLocation('terminal', null)).toBe('')
  expect(buildLocation('gui', 'skills')).toBe('?mode=gui#skills')
  expect(buildLocation('terminal', 'experience')).toBe('#experience')
  expect(buildLocation('resume', null)).toBe('?mode=resume')
})
test('round trip', () => {
  for (const mode of ['gui', 'terminal', 'resume'])
    for (const section of [null, ...SECTIONS]) {
      const loc = buildLocation(mode, section)
      const i = loc.indexOf('#')
      const search = i < 0 ? loc : loc.slice(0, i)
      const hash = i < 0 ? '' : loc.slice(i)
      expect(parseLocation(search, hash)).toEqual({ mode, section })
    }
})
