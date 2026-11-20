import { test, expect } from 'bun:test'
import { convert } from '../src/terminal/convert.js'

test('converts bytes decimal and binary', () => {
  expect(convert(1, 'GiB', 'MiB')).toBe(1024)
  expect(convert(1, 'GB', 'MB')).toBe(1000)
  expect(convert(1, 'KiB', 'B')).toBe(1024)
})

test('converts time, temperature, length, mass', () => {
  expect(convert(1, 'min', 's')).toBe(60)
  expect(convert(100, 'C', 'F')).toBe(212)
  expect(convert(32, 'F', 'C')).toBe(0)
  expect(Math.abs(convert(1, 'mi', 'km') - 1.609344)).toBeLessThan(1e-6)
  expect(Math.abs(convert(1, 'kg', 'lb') - 2.20462)).toBeLessThan(1e-4)
})

test('throws naming both units for incompatible or unknown', () => {
  expect(() => convert(1, 'kg', 'km')).toThrow(/kg.*km/)
  expect(() => convert(1, 'gb', 'MB')).toThrow(/gb.*MB/)
  expect(() => convert(1, 'xyz', 's')).toThrow(/xyz.*s/)
})

test('degree aliases and unit list in the error', () => {
  expect(convert(100, '°C', '°F')).toBe(212)
  expect(convert(32, '°F', 'C')).toBe(0)
  expect(() => convert(1, 'xyz', 's')).toThrow(/Units: .*kg\/lb/)
})

test('inherited Object.prototype keys are not units', () => {
  for (const [a, b] of [['C', 'toString'], ['__proto__', 'C'], ['constructor', 'valueOf'], ['toString', 'F']])
    expect(() => convert(1, a, b)).toThrow(new RegExp(`${a}.*${b}`))
})
