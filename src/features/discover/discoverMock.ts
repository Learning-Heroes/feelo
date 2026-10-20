export interface ClipPlatform {
  name: string
  color: string
}

export interface ClipCardData {
  title: string
  type: string
  genre: string
  durationLabel: string
  /** Fraction of the clip already played, 0–1. */
  progress: number
  platforms: ClipPlatform[]
  description: string
}

// Local mock until the Discover feed reads real clips.
export const discoverMock: ClipCardData = {
  title: 'Título de ejemplo',
  type: '🎬 Película',
  genre: 'Comedia',
  durationLabel: '▶ 1:42',
  progress: 0.3,
  platforms: [
    { name: 'Netflix', color: '#e50914' },
    { name: 'Prime', color: '#00a8e1' },
  ],
  description: 'Descripción corta de ejemplo para comprobar cómo se lee el texto de la card.',
}
