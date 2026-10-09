/** Public metadata only: no ownership, review notes or playback URLs. */
export interface ViewerDrama {
  id: number
  title: string
  synopsis: string
  coverUrl: string
  genre: string
  language: string
  region: string
  totalEpisodes: number
}
export interface ViewerEpisode {
  id: number
  dramaId: number
  number: number
  title: string
  durationSeconds: number
}
export interface ViewerPageQuery { page?: number; pageSize?: number; search?: string }
export interface ViewerHealth { status: 'available' }
