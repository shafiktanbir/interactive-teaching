/** Demo lesson id — matches backend `app/seed.py`. */
export const SEED_LESSON_ID = '507f1f77bcf86cd799439020'

export type ChipIcon = 'text' | 'image' | 'audio' | 'video' | 'youtube' | 'web'

/** Map API node kind to chip glyph (YouTube uses video kind with embed on server). */
export function chipIconFromKind(kind?: string | null): ChipIcon {
  if (!kind) return 'text'
  if (kind === 'web') return 'web'
  if (kind === 'image') return 'image'
  if (kind === 'audio') return 'audio'
  if (kind === 'video') return 'video'
  if (kind === 'text') return 'text'
  return 'text'
}
