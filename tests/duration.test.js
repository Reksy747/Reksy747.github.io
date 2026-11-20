import { test, expect } from 'bun:test'
import { duration } from '../src/gui/duration.js'

const now = new Date('2026-11-20T05:00:00Z') // Nov 2026

test('Present uses now, inclusive months', () => {
  expect(duration('Mar 2023', 'Present', now)).toBe('3 yrs 9 mo')
})
test('"this month" is the GMT+7 month, whatever the device timezone', () => {
  // 17:30Z on Nov 30 is already 00:30 on Dec 1 in Jakarta
  expect(duration('Nov 2026', 'Present', new Date('2026-11-30T16:59:00Z'))).toBe('1 mo')
  expect(duration('Nov 2026', 'Present', new Date('2026-11-30T17:01:00Z'))).toBe('2 mo')
})
test('closed ranges match LinkedIn', () => {
  expect(duration('Nov 2021', 'Jan 2023', now)).toBe('1 yr 3 mo')
  expect(duration('Feb 2021', 'Jun 2021', now)).toBe('5 mo')
  expect(duration('Aug 2020', 'Jan 2021', now)).toBe('6 mo')
  expect(duration('Jan 2016', 'Jan 2017', now)).toBe('1 yr 1 mo')
})
test('singular and plural units', () => {
  expect(duration('Jan 2020', 'Dec 2020', now)).toBe('1 yr')
  expect(duration('Jan 2020', 'Dec 2021', now)).toBe('2 yrs')
  expect(duration('Jan 2020', 'Jan 2020', now)).toBe('1 mo')
  expect(duration('Mar 2023', 'Jan 2026', now)).toBe('2 yrs 11 mo')
})
test('incomplete or invalid input gives empty string', () => {
  expect(duration('Jan 2017', '2021', now)).toBe('')
  expect(duration('', 'Jan 2021', now)).toBe('')
  expect(duration('Foo 2020', 'Jan 2021', now)).toBe('')
  expect(duration('Present', 'Jan 2021', now)).toBe('')
  expect(duration(undefined, null, now)).toBe('')
  expect(duration('Jun 2021', 'Jan 2021', now)).toBe('')
})
