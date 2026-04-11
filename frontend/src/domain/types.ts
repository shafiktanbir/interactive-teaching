export type TOCItem = {
  id: string
  label: string
  children: TOCItem[]
}

export type Lesson = {
  id: string
  title: string
  toc: TOCItem[]
  content: Record<string, unknown>
  updated_at?: string
}

export type ResolvedText = { kind: 'text'; text: string }

export type ResolvedImage = { kind: 'image'; url: string; alt?: string }

export type ResolvedAudio = { kind: 'audio'; url: string }

export type ResolvedVideo = {
  kind: 'video'
  url?: string
  embed?: string
  embed_id?: string
}

export type InteractiveNodeResolved =
  | ResolvedText
  | ResolvedImage
  | ResolvedAudio
  | ResolvedVideo
