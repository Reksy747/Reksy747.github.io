// Welcome banner: REKSY in 5-row block letters (33 columns), then the greeting.
const GLYPHS = {
  R: ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
  E: ['█████', '█    ', '████ ', '█    ', '█████'],
  K: ['█  █ ', '█ █  ', '██   ', '█ █  ', '█  █ '],
  S: [' ████', '█    ', ' ███ ', '    █', '████ '],
  Y: ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
}

export const art = (word) => Array.from({ length: 5 }, (_, row) => [...word].map((ch) => GLYPHS[ch][row]).join('  ').trimEnd())

export function banner() {
  return [
    ...art('REKSY').map((text) => ({ type: 'banner', text })),
    { type: 'out', text: '' },
    { type: 'out', text: "Welcome to Reksy's resume terminal." },
    { type: 'out', text: "Type 'help' for the list of commands, or 'gui' for the resume site." },
  ]
}
