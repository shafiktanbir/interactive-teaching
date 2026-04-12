export type TOCItem = {
  id: string
  label: string
  children: TOCItem[]
  /** TipTap JSON for expandable sidebar panel copy */
  body?: Record<string, unknown> | null
}

export type MultimediaStripItem = {
  node_id: string
  label?: string | null
  kind?: string | null
}

export type MultimediaStripItemInput = {
  node_id: string
  label?: string | null
}

export type Lesson = {
  id: string
  title: string
  toc: TOCItem[]
  content: Record<string, unknown>
  multimedia_strip: MultimediaStripItem[]
  updated_at?: string
}

export type LessonPatch = {
  multimedia_strip?: MultimediaStripItemInput[]
  title?: string
  toc?: TOCItem[]
  content?: Record<string, unknown>
}

export type ResolvedText = {
  kind: 'text'
  text?: string | null
  content?: Record<string, unknown> | null
}

export type ResolvedImage = { kind: 'image'; url: string; alt?: string }

export type ResolvedAudio = { kind: 'audio'; url: string }

export type ResolvedVideo = {
  kind: 'video'
  url?: string
  embed?: string
  embed_id?: string
}

export type ResolvedWeb = { kind: 'web'; url: string }

export type InteractiveNodeResolved =
  | ResolvedText
  | ResolvedImage
  | ResolvedAudio
  | ResolvedVideo
  | ResolvedWeb

export type InteractiveNodeCreate = {
  kind: 'text' | 'image' | 'audio' | 'video' | 'web'
  label: string
  source: Record<string, unknown>
  alt?: string | null
  embed?: string | null
  embed_id?: string | null
}

export type InteractiveNodePatch = {
  label?: string | null
  source?: Record<string, unknown> | null
  alt?: string | null
  embed?: string | null
  embed_id?: string | null
}
