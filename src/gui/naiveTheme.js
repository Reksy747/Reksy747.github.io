// Maps the site's console look onto Naive UI's dark theme: near-black surfaces, amber accent, near-square corners.
const AMBER = '#f2a93b'
const INK = '#080a0d'
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"

export const themeOverrides = {
  common: {
    primaryColor: AMBER,
    primaryColorHover: '#f6bb5d',
    primaryColorPressed: '#d98f1f',
    primaryColorSuppl: AMBER,
    borderRadius: '3px',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontFamilyMono: MONO,
    bodyColor: INK,
    cardColor: '#0e1217',
    borderColor: '#232b35',
    textColorBase: '#e8ecf1',
    textColor2: '#e8ecf1',
    textColor3: '#8d99a8',
  },
  Button: {
    // white text on amber is under 2:1; use the ink colour on every primary state
    textColorPrimary: INK,
    textColorHoverPrimary: INK,
    textColorPressedPrimary: INK,
    textColorFocusPrimary: INK,
    fontWeight: '600',
    heightLarge: '44px', // 44px touch target
  },
  Tabs: {
    tabTextColorLine: '#8d99a8',
    tabTextColorHoverLine: '#e8ecf1',
    tabTextColorActiveLine: '#e8ecf1',
    barColor: AMBER,
    tabFontWeightActive: '600',
  },
  Tag: {
    color: '#151b22',
    border: '1px solid #232b35',
    textColor: '#e8ecf1',
    borderRadius: '3px',
  },
  Card: {
    color: '#0e1217',
    borderColor: '#232b35',
    borderRadius: '3px',
    textColor: '#e8ecf1',
  },
}
