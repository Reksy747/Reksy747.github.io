import { test, expect } from 'bun:test'
import { currentSection } from '../src/gui/currentSection.js'

const P = [
  { id: 'about', top: 50, bottom: 310 },
  { id: 'experience', top: 350, bottom: 2790 },
  { id: 'education', top: 2830, bottom: 2970 },
  { id: 'contact', top: 3010, bottom: 3380 },
]
const at = (scrollY, extra = {}) => currentSection(P, { scrollY, line: scrollY + 300, viewportHeight: 900, atBottom: false, ...extra })

test('top of the page: no section', () => {
  expect(at(0)).toBe(null)
  expect(at(0.5)).toBe(null)
})

test('middle: first section on screen whose top passed the line', () => {
  expect(at(400)).toBe('experience')
  expect(at(1000)).toBe('experience')
})

test('a short section at the top stays current while the next one passes the line', () => {
  // tall viewport: experience top (350) is above the line, but about is still on screen
  expect(currentSection(P, { scrollY: 18, line: 18 + 378, viewportHeight: 1080, atBottom: false })).toBe('about')
})

test('scrolled but still above the first section (tall header): no section', () => {
  expect(currentSection([{ id: 'about', top: 900, bottom: 1200 }], { scrollY: 200, line: 500, viewportHeight: 800, atBottom: false })).toBe(null)
})

test('bottom: last section, unless the picked one is still on screen', () => {
  expect(at(2480, { atBottom: true })).toBe('contact')
  expect(at(2480, { atBottom: true, prev: 'experience' })).toBe('contact')
  expect(at(2480, { atBottom: true, prev: 'education' })).toBe('education')
})

test('empty positions', () => {
  expect(currentSection([], { scrollY: 500, line: 800, viewportHeight: 900, atBottom: true })).toBe(null)
})
