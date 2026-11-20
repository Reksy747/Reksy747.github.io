// Each family maps unit -> factor to the family base unit. Units are case-sensitive.
const FAMILIES = [
  { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3 },
  { ms: 0.001, s: 1, min: 60, h: 3600 },
  { km: 1000, mi: 1609.344 },
  { kg: 1, lb: 0.45359237 },
]
const ALIAS = { '°C': 'C', '°F': 'F' }
const TO_C = { C: (v) => v, F: (v) => ((v - 32) * 5) / 9 }
const FROM_C = { C: (v) => v, F: (v) => (v * 9) / 5 + 32 }

export function convert(value, from, to) {
  if (Object.hasOwn(ALIAS, from)) from = ALIAS[from]
  if (Object.hasOwn(ALIAS, to)) to = ALIAS[to]
  if (Object.hasOwn(TO_C, from) && Object.hasOwn(TO_C, to)) return FROM_C[to](TO_C[from](value))
  const fam = FAMILIES.find((f) => Object.hasOwn(f, from) && Object.hasOwn(f, to))
  if (!fam) throw new Error(`cannot convert ${from} to ${to}. Units: B/KB/KiB/MB/MiB/GB/GiB, ms/s/min/h, C/F, km/mi, kg/lb`)
  return (value * fam[from]) / fam[to]
}
