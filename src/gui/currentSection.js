// Which section the reader is on. positions: [{ id, top, bottom }] in document order, in page pixels.
// line: the page y a section top must pass to count (scrollY plus a share of the viewport).
// At the very bottom the last section wins, unless the reader picked one whose top is still on screen
// (short final sections can never reach the line, so a nav click on them must not be overridden).
export function currentSection(positions, { scrollY, line, viewportHeight, atBottom, prev = null }) {
  if (!positions.length || scrollY < 1) return null
  if (atBottom) {
    const kept = positions.find((p) => p.id === prev)
    return kept && kept.top >= scrollY && kept.top < scrollY + viewportHeight ? prev : positions.at(-1).id
  }
  // the first section still on screen whose top reached the line, so a short section above stays current
  return positions.find((p) => p.bottom > scrollY && p.top <= line)?.id ?? null
}
