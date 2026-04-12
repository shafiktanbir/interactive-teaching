import { useContext } from 'react'
import { LessonContext } from './lessonContext'

export function useLessonId(): string | null {
  return useContext(LessonContext)?.lessonId ?? null
}
