import { tokenize } from './tokenize.js'
import { registry, find } from './registry.js'

const commonPrefix = (xs) => xs.reduce((p, x) => { let i = 0; while (i < p.length && p[i] === x[i]) i++; return p.slice(0, i) })

export function complete(input, ctx) {
  const toks = tokenize(input)
  const atNew = input === '' || /\s$/.test(input)
  const partial = atNew ? '' : toks[toks.length - 1]
  const head = atNew ? toks : toks.slice(0, -1)
  let cands
  if (head.length === 0) cands = registry.flatMap((c) => [c.name, ...(c.aliases || [])])
  else cands = find(head[0])?.args?.(partial, ctx) || []
  const matches = [...new Set(cands)].filter((c) => c.startsWith(partial))
  if (!matches.length) return { value: input, options: [] }
  // shortcut: rebuilds the line with single spaces, quoting is not re-applied
  const prefix = head.length ? head.join(' ') + ' ' : ''
  if (matches.length === 1) return { value: prefix + matches[0] + ' ', options: [] }
  return { value: prefix + commonPrefix(matches), options: matches.sort() }
}
