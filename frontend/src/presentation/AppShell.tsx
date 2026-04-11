import { Header } from './Header'
import { LessonView } from './LessonView'
import { SEED_LESSON_ID } from '../domain/constants'

export function AppShell() {
  return (
    <div className="app-root">
      <Header />
      <div className="app-body">
        <LessonView lessonId={SEED_LESSON_ID} />
      </div>
    </div>
  )
}
