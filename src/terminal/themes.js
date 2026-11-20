export const THEMES = {
  ink: { bg: '#161513', fg: '#f3f0e8', muted: '#9a9484', accent: '#d6361f', rule: '#3a3833' },
  paper: { bg: '#f3f0e8', fg: '#161513', muted: '#6d685c', accent: '#d6361f', rule: '#c9c4b6' },
  phosphor: { bg: '#0a0f0a', fg: '#7dff8a', muted: '#3f9a4a', accent: '#d6ff5c', rule: '#1c3a20' },
  blueprint: { bg: '#0e2a5c', fg: '#dce8ff', muted: '#8fa8d6', accent: '#ffd166', rule: '#2a4a85' },
}

export function applyTheme(name, el) {
  const t = Object.hasOwn(THEMES, name) ? THEMES[name] : THEMES.ink
  for (const k of Object.keys(t)) el.style.setProperty(`--t-${k}`, t[k])
}
