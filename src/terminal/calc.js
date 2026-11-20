// Recursive-descent arithmetic parser. Never uses eval/Function.
const MAX_DEPTH = 100

export function evaluate(expr) {
  const s = String(expr)
  let i = 0
  let depth = 0

  const skip = () => { while (s[i] === ' ' || s[i] === '\t') i++ }
  const peek = () => (skip(), s[i])
  const enter = () => { if (++depth > MAX_DEPTH) throw new Error('expression too deeply nested') }

  function sum() {
    let v = product()
    for (let c = peek(); c === '+' || c === '-'; c = peek()) {
      i++
      const r = product()
      v = c === '+' ? v + r : v - r
    }
    return v
  }

  function product() {
    let v = unary()
    for (let c = peek(); c === '*' || c === '/' || c === '%'; c = peek()) {
      i++
      const r = unary()
      if ((c === '/' || c === '%') && r === 0) throw new Error('division by zero')
      v = c === '*' ? v * r : c === '/' ? v / r : v % r
    }
    return v
  }

  // unary minus binds looser than ^, so -2^2 = -4
  function unary() {
    enter()
    const c = peek()
    let v
    if (c === '-') { i++; v = -unary() }
    else if (c === '+') { i++; v = unary() }
    else v = power()
    depth--
    return v
  }

  function power() {
    const base = atom()
    if (peek() === '^') { i++; return base ** unary() } // right-associative
    return base
  }

  function atom() {
    const c = peek()
    if (c === '(') {
      i++
      const v = sum()
      if (peek() !== ')') throw new Error("missing closing ')'")
      i++
      return v
    }
    const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i))
    if (!m) throw new Error(c === undefined ? 'unexpected end of expression' : `unexpected '${c}'`)
    i += m[0].length
    return Number(m[0])
  }

  if (peek() === undefined) throw new Error('empty expression')
  const v = sum()
  if (peek() !== undefined) throw new Error(`unexpected '${s[i]}'`)
  if (!Number.isFinite(v)) throw new Error('result out of range')
  return v
}
