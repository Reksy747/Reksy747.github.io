// Open-Meteo: free, no API key, CORS-enabled. "current" is the provider's latest model reading (refreshed about every 15 minutes), not a station report.
const GEO = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const CURRENT = 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m'
const JAKARTA = { name: 'Jakarta', latitude: -6.2, longitude: 106.8167 }
export const UNAVAILABLE = 'weather unavailable (offline or blocked). Try again later.'

const label = (c) =>
  c === 0 ? 'clear' : c === 1 || c === 2 ? 'partly cloudy' : c === 3 ? 'overcast'
  : c === 45 || c === 48 ? 'fog' : c >= 51 && c <= 57 ? 'drizzle'
  : (c >= 61 && c <= 67) || (c >= 80 && c <= 82) ? 'rain' : (c >= 71 && c <= 77) || c === 85 || c === 86 ? 'snow'
  : c >= 95 && c <= 99 ? 'thunderstorm' : 'mixed conditions'

// returns { ok, text }; no query means Jakarta without a lookup
export async function getWeather(fetchFn, query = '', timeoutMs = 5000) {
  const ctrl = new AbortController()
  let timer
  const timeout = new Promise((_, rej) => { timer = setTimeout(() => { ctrl.abort(); rej(new Error('timeout')) }, timeoutMs) })
  const get = async (url) => {
    const res = await Promise.race([fetchFn(url, { signal: ctrl.signal }), timeout])
    if (!res?.ok) throw new Error('http')
    return Promise.race([res.json(), timeout])
  }
  try {
    const q = query.trim()
    let place = JAKARTA
    if (q) {
      const hit = (await get(`${GEO}?name=${encodeURIComponent(q.slice(0, 100))}&count=1&language=en&format=json`))?.results?.[0]
      if (!Number.isFinite(hit?.latitude) || !Number.isFinite(hit?.longitude)) return { ok: false, text: `weather: place not found: ${q}` }
      place = hit
    }
    const url = `${FORECAST}?latitude=${place.latitude}&longitude=${place.longitude}&current=${CURRENT}&timezone=Asia%2FJakarta`
    const cur = (await get(url))?.current
    if (!Number.isFinite(cur?.temperature_2m) || !Number.isFinite(cur?.wind_speed_10m)) return { ok: false, text: UNAVAILABLE }
    const where = [place.name, place.admin1, place.country].filter((x, i, a) => x && a.indexOf(x) === i).join(', ')
    const feels = Number.isFinite(cur.apparent_temperature) ? ` (feels like ${cur.apparent_temperature}°C)` : ''
    const humidity = Number.isFinite(cur.relative_humidity_2m) ? `, humidity ${cur.relative_humidity_2m}%` : ''
    const at = typeof cur.time === 'string' ? ` · reading ${cur.time.replace('T', ' ')} GMT+7` : ''
    return { ok: true, text: `${where}: ${cur.temperature_2m}°C${feels}, ${label(cur.weather_code)}${humidity}, wind ${cur.wind_speed_10m} km/h${at}` }
  } catch {
    return { ok: false, text: UNAVAILABLE }
  } finally {
    clearTimeout(timer)
  }
}
