import { test, expect } from 'bun:test'
import { findPlaceholders, isPlaceholder } from '../src/data/placeholders.js'

test('finds placeholder paths', () => {
  expect(findPlaceholders({ a: '[add x]', b: ['ok', '[add y]'] })).toEqual(['a', 'b[1]'])
})

test('clean object returns []', () => {
  expect(findPlaceholders({ a: 'fine', b: [1, { c: 'x' }] })).toEqual([])
})

test('nested object path', () => {
  expect(findPlaceholders({ a: { b: [{ c: '[add z]' }] } })).toEqual(['a.b[0].c'])
})

test('isPlaceholder', () => {
  expect(isPlaceholder('[add x]')).toBe(true)
  expect(isPlaceholder('[x]')).toBe(false)
  expect(isPlaceholder(undefined)).toBe(false)
})

test('portfolio placeholders are only the known three (passes once filled)', async () => {
  const { default: portfolio } = await import('../src/data/portfolio.js')
  const allowed = ['links.email', 'education[0].degree', 'education[0].years']
  for (const p of findPlaceholders(portfolio)) expect(allowed).toContain(p)
})
