import type {
  InteractiveNodeCreate,
  InteractiveNodePatch,
  InteractiveNodeResolved,
  Lesson,
  LessonPatch,
} from '../domain/types'

function apiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) return 'http://localhost:8000'
  return ''
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

export async function fetchLesson(lessonId: string): Promise<Lesson> {
  const res = await fetch(`${apiBase()}/lessons/${lessonId}`)
  return parseJson<Lesson>(res)
}

export async function fetchInteractiveNode(nodeId: string): Promise<InteractiveNodeResolved> {
  const res = await fetch(`${apiBase()}/interactive-nodes/${nodeId}`)
  return parseJson<InteractiveNodeResolved>(res)
}

export async function createInteractiveNode(body: InteractiveNodeCreate): Promise<{ id: string }> {
  const res = await fetch(`${apiBase()}/interactive-nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<{ id: string }>(res)
}

export async function patchInteractiveNode(
  nodeId: string,
  body: InteractiveNodePatch,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${apiBase()}/interactive-nodes/${nodeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson(res)
}

export async function patchLesson(lessonId: string, body: LessonPatch): Promise<Lesson> {
  const res = await fetch(`${apiBase()}/lessons/${lessonId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJson<Lesson>(res)
}
