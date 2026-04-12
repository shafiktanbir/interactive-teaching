import { type ReactNode } from 'react'
import { LessonContext } from './lessonContext'

export function LessonProvider({
  lessonId,
  children,
}: {
  lessonId: string
  children: ReactNode
}) {
  return <LessonContext.Provider value={{ lessonId }}>{children}</LessonContext.Provider>
}
