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

// Local mock deck until the Discover feed reads real clips. Fixed order, so the deck is deterministic.
export const discoverDeck: readonly ClipCardData[] = [
  {
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
  },
  {
    title: 'La noche del faro',
    type: '🎬 Película',
    genre: 'Suspense',
    durationLabel: '▶ 1:15',
    progress: 0.55,
    platforms: [{ name: 'Netflix', color: '#e50914' }],
    description: 'Un guardián solitario descubre que alguien más vive en el faro.',
  },
  {
    title: 'Casa de verano',
    type: '📺 Serie',
    genre: 'Drama',
    durationLabel: '▶ 2:03',
    progress: 0.1,
    platforms: [{ name: 'Prime', color: '#00a8e1' }],
    description: 'Tres hermanos se reúnen una última vez antes de vender la casa familiar.',
  },
  {
    title: 'Código rojo',
    type: '📺 Serie',
    genre: 'Acción',
    durationLabel: '▶ 0:58',
    progress: 0.8,
    platforms: [
      { name: 'Netflix', color: '#e50914' },
      { name: 'Prime', color: '#00a8e1' },
    ],
    description: 'Una agente rastrea una filtración que amenaza a toda la ciudad.',
  },
  {
    title: 'Pequeños milagros',
    type: '🎬 Película',
    genre: 'Romance',
    durationLabel: '▶ 1:30',
    progress: 0.45,
    platforms: [],
    description: 'Dos desconocidos se cruzan cada día en el mismo tren sin hablarse.',
  },
]
