import { tokenize } from './tokenize.js'

export const registry = []

// Replaces any existing command with the same name.
export function register(cmds) {
  for (const c of cmds) {
    const i = registry.findIndex((r) => r.name === c.name)
    if (i >= 0) registry[i] = c
    else registry.push(c)
  }
}

// Test-only: empties the registry between tests.
export function clearRegistry() {
  registry.length = 0
}

export const find = (name) => registry.find((c) => c.name === name || c.aliases?.includes(name))

function lev(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[b.length]
}

export async function execute(line, ctx) {
  const [name, ...args] = tokenize(line)
  if (!name) return []
  const cmd = find(name)
  if (!cmd) {
    const out = [{ type: 'err', text: `command not found: ${name}` }]
    let best = null
    let bestD = 3
    for (const n of registry.flatMap((c) => [c.name, ...(c.aliases || [])])) {
      const d = lev(name, n)
      if (d < bestD) { bestD = d; best = n }
    }
    if (best) out.push({ type: 'out', text: `Did you mean ${best}?` })
    return out
  }
  try {
    return (await cmd.run(args, ctx)) || []
  } catch (e) {
    return [{ type: 'err', text: e?.message || String(e) }]
  }
}
