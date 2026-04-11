/** Matches backend `app/seed.py` for the demo lesson and chips. */
export const SEED_LESSON_ID = '507f1f77bcf86cd799439020'

export type ChipIcon = 'text' | 'image' | 'audio' | 'video' | 'youtube'

export const DEMO_CHIPS: { nodeId: string; label: string; icon: ChipIcon }[] = [
  { nodeId: '507f1f77bcf86cd799439011', label: 'A Text', icon: 'text' },
  { nodeId: '507f1f77bcf86cd799439012', label: 'Image', icon: 'image' },
  { nodeId: '507f1f77bcf86cd799439013', label: 'Audio', icon: 'audio' },
  { nodeId: '507f1f77bcf86cd799439014', label: 'MyVid', icon: 'video' },
  { nodeId: '507f1f77bcf86cd799439015', label: 'YouTube', icon: 'youtube' },
]
