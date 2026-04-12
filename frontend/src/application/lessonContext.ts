import { createContext } from 'react'

export const LessonContext = createContext<{ lessonId: string } | null>(null)
