import { test, expect } from 'bun:test'
import { evaluate } from '../src/terminal/calc.js'

test('evaluates arithmetic', () => {
  expect(evaluate('2+3*4')).toBe(14)
  expect(evaluate('(2+3)*4')).toBe(20)
  expect(evaluate('2^10')).toBe(1024)
  expect(evaluate('-3+5')).toBe(2)
  expect(evaluate('10%3')).toBe(1)
  expect(evaluate('1.5*2')).toBe(3)
})

test('^ is right-associative and handles unary', () => {
  expect(evaluate('2^3^2')).toBe(512)
  expect(evaluate('2^-1')).toBe(0.5)
  expect(evaluate('-2^2')).toBe(-4)
  expect(evaluate('--3')).toBe(3)
})

test('rejects hostile or malformed input', () => {
  for (const bad of ['', '   ', '1/0', '1%0', '(1+2', '1+2)', 'alert(1)', '2^99999', '1+', '1.2.3', '2 3', '()'])
    expect(() => evaluate(bad)).toThrow(Error)
  expect(() => evaluate('2^99999')).toThrow('result out of range')
})

test('deep nesting throws instead of overflowing the stack', () => {
  expect(() => evaluate('('.repeat(10000) + '1' + ')'.repeat(10000))).toThrow('too deeply nested')
  expect(() => evaluate('-'.repeat(10000) + '1')).toThrow('too deeply nested')
})
