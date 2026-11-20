import portfolio from '../src/data/portfolio.js'
import { findPlaceholders } from '../src/data/placeholders.js'

const found = findPlaceholders(portfolio)
if (found.length && process.env.ALLOW_PLACEHOLDERS !== '1') {
  console.error('Placeholders remain in src/data/portfolio.js (set ALLOW_PLACEHOLDERS=1 to override):')
  for (const p of found) console.error(`  ${p}`)
  process.exit(1)
}
