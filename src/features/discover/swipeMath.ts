import { swipe } from '@/theme/tokens'

export type Direction = 'right' | 'left' | 'up' | 'down'

// Pure and marked 'worklet' so the same code runs on the UI thread (gesture and styles)
// and on JS (tests, hook). Values come from the theme tokens, imported rather than read
// through hooks, because worklets can't call hooks.

/** Horizontal only when strictly larger: a tie goes vertical. */
export function dominantAxis(dx: number, dy: number): 'x' | 'y' {
  'worklet'
  return Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
}

function directionOf(dx: number, dy: number): Direction {
  'worklet'
  if (dominantAxis(dx, dy) === 'x') return dx > 0 ? 'right' : 'left'
  return dy < 0 ? 'up' : 'down'
}

/** Opacity of one direction's overlay: 0 unless it is the dominant one and past `overlayMin`. */
export function overlayOpacity(direction: Direction, dx: number, dy: number): number {
  'worklet'
  if (directionOf(dx, dy) !== direction) return 0
  const displacement = dominantAxis(dx, dy) === 'x' ? Math.abs(dx) : Math.abs(dy)
  if (displacement <= swipe.overlayMin) return 0
  return Math.min(displacement / swipe.threshold, 1)
}

/** The registered direction on release, or null when the dominant axis doesn't pass the threshold. */
export function resolveRelease(dx: number, dy: number): Direction | null {
  'worklet'
  const displacement = dominantAxis(dx, dy) === 'x' ? Math.abs(dx) : Math.abs(dy)
  return displacement > swipe.threshold ? directionOf(dx, dy) : null
}

/** Where the card flies to; the other axis keeps the drag, doubled. */
export function exitTarget(direction: Direction, dx: number, dy: number): { x: number; y: number; rotate: number } {
  'worklet'
  let x: number
  let y: number
  if (direction === 'right' || direction === 'left') {
    x = direction === 'right' ? swipe.exitX : -swipe.exitX
    y = dy * swipe.exitOtherAxisFactor
  } else {
    x = dx * swipe.exitOtherAxisFactor
    y = direction === 'down' ? swipe.exitY : -swipe.exitY
  }
  return { x, y, rotate: x * swipe.exitRotate }
}
