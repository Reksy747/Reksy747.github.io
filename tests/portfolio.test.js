import { test, expect } from 'bun:test'
import portfolio, { SECTIONS } from '../src/data/portfolio.js'

test('sections order', () => {
  expect(SECTIONS).toEqual(['about', 'experience', 'projects', 'skills', 'education', 'contact'])
})

test('experience ids, newest first', () => {
  expect(portfolio.experience.map((e) => e.id)).toEqual(['member-id', 'pegipegi', 'ukdw', 'dutatani', 'freelance', 'smk'])
})

test('five skill groups', () => {
  expect(portfolio.skills.map((s) => s.group)).toEqual([
    'Cloud & Infrastructure',
    'Containers & Orchestration',
    'Databases & Messaging',
    'Networking, Edge & Security',
    'CI/CD, Observability & Scripting',
  ])
})

test('three projects', () => {
  expect(portfolio.projects).toHaveLength(3)
})

test('donate link', () => {
  expect(portfolio.links.donate).toBe('https://saweria.co/Reksy')
})

test('every role has a short list of tool tags without numeric claims', () => {
  for (const e of portfolio.experience) {
    expect(Array.isArray(e.tools)).toBe(true)
    expect(e.tools.length).toBeGreaterThan(0)
    expect(e.tools.length).toBeLessThanOrEqual(9)
    for (const t of e.tools) {
      expect(typeof t).toBe('string')
      expect(t.trim()).not.toBe('')
      expect(t).not.toMatch(/^[\d\s.,+%x-]+$|\d\s?%|\d+\+/) // EC2 and S3 are names, "99%" or "5+" are claims
    }
  }
})

test('no invented numbers or zero-downtime in bullets', () => {
  const bullets = portfolio.experience.flatMap((e) => e.bullets)
  for (const b of bullets) expect(b).not.toMatch(/\d+\s?%|zero[- ]downtime/i)
})
