export const isPlaceholder = (s) => typeof s === 'string' && s.startsWith('[add ')

// Paths (a.b[0]) of every string starting with "[add ".
export function findPlaceholders(value, path = '') {
  if (typeof value === 'string') return isPlaceholder(value) ? [path] : []
  if (Array.isArray(value)) return value.flatMap((v, i) => findPlaceholders(v, `${path}[${i}]`))
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => findPlaceholders(v, path ? `${path}.${k}` : k))
  return []
}
