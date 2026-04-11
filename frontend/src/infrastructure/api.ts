import type { InteractiveNodeResolved, Lesson } from '../domain/types'

const base = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:8000'

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

export async function fetchLesson(lessonId: string): Promise<Lesson> {
  const res = await fetch(`${base()}/lessons/${lessonId}`)
  return parseJson<Lesson>(res)
}

export async function fetchInteractiveNode(nodeId: string): Promise<InteractiveNodeResolved> {
  const res = await fetch(`${base()}/interactive-nodes/${nodeId}`)
  return parseJson<InteractiveNodeResolved>(res)
}
