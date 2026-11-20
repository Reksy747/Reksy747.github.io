import { test, expect } from 'bun:test'
import { art, banner } from '../src/terminal/banner.js'

test('REKSY art is five rows, at most 33 columns, with the same shape on every row', () => {
  const rows = art('REKSY')
  expect(rows).toHaveLength(5)
  for (const r of rows) expect(r.length).toBeLessThanOrEqual(33)
  expect(rows[0]).toBe('████   █████  █  █    ████  █   █')
})

test('banner has the art, then the greeting and the help hint', () => {
  const b = banner()
  expect(b.filter((l) => l.type === 'banner')).toHaveLength(5)
  const text = b.map((l) => l.text).join('\n')
  expect(text).toContain("Welcome to Reksy's resume terminal.")
  expect(text).toContain("Type 'help'")
})
