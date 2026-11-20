const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// 'Mar 2023' -> month index since year 0, or NaN for anything that is not "Mon YYYY"
function monthIndex(s) {
  const m = /^([A-Z][a-z]{2}) (\d{4})$/.exec(s ?? '')
  const mon = m ? MONTHS.indexOf(m[1]) : -1
  return mon < 0 ? NaN : Number(m[2]) * 12 + mon
}

// LinkedIn style, both endpoints inclusive: 'Nov 2021'..'Jan 2023' -> '1 yr 3 mo'. '' when a side is incomplete.
export function duration(start, end, now = new Date()) {
  const from = monthIndex(start)
  // "this month" is the month in GMT+7 (shift 7h, read as UTC), so it never depends on the visitor's timezone
  const j = new Date(now.getTime() + 7 * 3600e3)
  const to = end === 'Present' ? j.getUTCFullYear() * 12 + j.getUTCMonth() : monthIndex(end)
  const total = to - from + 1
  if (!(total > 0)) return ''
  const yrs = Math.floor(total / 12)
  const mo = total % 12
  return [yrs && `${yrs} ${yrs === 1 ? 'yr' : 'yrs'}`, mo && `${mo} mo`].filter(Boolean).join(' ')
}
