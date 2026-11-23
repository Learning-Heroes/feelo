// User-facing strings of Discover. Constants until the app has i18n (Decision 001).
import type { Direction } from '@/features/discover/swipeMath'

export const overlayLabels: Record<Direction, string> = {
  right: 'Me gustó',
  left: 'No me gustó',
  up: 'Me encantó',
  down: 'No la he visto',
}

export const toastMessages: Record<Direction, string> = {
  right: 'Me gustó · guardado',
  left: 'No me gustó · anotado',
  up: 'Me encantó',
  down: 'No la has visto · te la podremos sugerir',
}

export interface LegendItem {
  direction: Direction
  emoji: string
  label: string
}

// Display order of the legend row.
export const legendItems: readonly LegendItem[] = [
  { direction: 'left', emoji: '👈', label: overlayLabels.left },
  { direction: 'down', emoji: '👇', label: overlayLabels.down },
  { direction: 'up', emoji: '👆', label: overlayLabels.up },
  { direction: 'right', emoji: '👉', label: overlayLabels.right },
]

export const ratedLabel = (count: number) => `${count} valorados`

