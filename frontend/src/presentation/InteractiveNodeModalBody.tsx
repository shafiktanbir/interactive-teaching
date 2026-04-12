import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isYoutubeNocookieEmbedSrc, normalizeForIframePreview } from '../domain/webPreviewUrl'
import { useEditor, EditorContent } from '@tiptap/react'
import { useQueryClient } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import type { InteractiveNodePatch, ResolvedText, ResolvedWeb } from '../domain/types'
import { patchInteractiveNode } from '../infrastructure/api'
import { useLessonId } from '../application/useLessonId'

function textToDoc(plain: string): Record<string, unknown> {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: plain ? [{ type: 'text', text: plain }] : [],
      },
    ],
  }
}

type RichProps = {
  nodeId: string
  data: ResolvedText
}

export function RichTextModalBody({ nodeId, data }: RichProps) {
  const queryClient = useQueryClient()
  const lessonId = useLessonId()
  const lastSavedJson = useRef<string>('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const initialDoc = useMemo(
    () => data.content ?? textToDoc(data.text ?? ''),
    [data],
  )

  const persist = useCallback(
    async (doc: Record<string, unknown>) => {
      setSaveState('saving')
      const patch: InteractiveNodePatch = {
        source: { type: 'inline', rich_text: doc },
      }
      try {
        await patchInteractiveNode(nodeId, patch)
        lastSavedJson.current = JSON.stringify(doc)
        setSaveState('saved')
        queryClient.invalidateQueries({ queryKey: ['interactive-node', nodeId] })
        if (lessonId) queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
        setTimeout(() => setSaveState('idle'), 1500)
      } catch {
        setSaveState('error')
      }
    },
    [nodeId, queryClient, lessonId],
  )

  const debouncedPersist = useDebouncedCallback(persist, 500)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Highlight.configure({ multicolor: false }),
    ],
    content: initialDoc,
    editorProps: {
      attributes: { class: 'rich-modal-editor' },
    },
    onUpdate: ({ editor: ed }) => {
      const j = JSON.stringify(ed.getJSON())
      if (j === lastSavedJson.current) return
      debouncedPersist(ed.getJSON() as unknown as Record<string, unknown>)
    },
  })

  useEffect(() => {
    const doc = data.content ?? textToDoc(data.text ?? '')
    const j = JSON.stringify(doc)
    lastSavedJson.current = j
    editor?.commands.setContent(doc)
  }, [data, editor])

  const setLink = () => {
    const prev = editor?.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) return <p className="modal-body">Loading editor…</p>

  return (
    <div className="rich-modal">
      <div className="rich-toolbar" role="toolbar" aria-label="Formatting">
        <button
          type="button"
          className={editor.isActive('bold') ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={editor.isActive('highlight') ? 'active' : ''}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          Highlight
        </button>
        <button type="button" onClick={setLink}>
          Link
        </button>
        <span className="save-pill" data-state={saveState}>
          {saveState === 'saving' && 'Saving…'}
          {saveState === 'saved' && 'Saved'}
          {saveState === 'error' && 'Save failed'}
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

type UrlFieldProps = {
  nodeId: string
  kind: 'image' | 'audio' | 'video'
  initialUrl: string
  alt?: string
  isYoutubeFile?: boolean
}

export function MediaUrlModalBody({ nodeId, kind, initialUrl, alt }: UrlFieldProps) {
  const queryClient = useQueryClient()
  const lessonId = useLessonId()
  const [url, setUrl] = useState(initialUrl)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const debouncedSave = useDebouncedCallback(async (next: string) => {
    setSaveState('saving')
    const patch: InteractiveNodePatch = {
      source: { type: 'inline', media_url: next },
    }
    if (kind === 'image' && alt !== undefined) patch.alt = alt
    try {
      await patchInteractiveNode(nodeId, patch)
      setSaveState('saved')
      queryClient.invalidateQueries({ queryKey: ['interactive-node', nodeId] })
      if (lessonId) queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
    }
  }, 500)

  return (
    <div className="url-modal">
      <label className="url-label">
        URL
        <input
          className="url-input"
          value={url}
          onChange={(e) => {
            const v = e.target.value
            setUrl(v)
            debouncedSave(v)
          }}
        />
      </label>
      <span className="save-pill" data-state={saveState}>
        {saveState === 'saving' && 'Saving…'}
        {saveState === 'saved' && 'Saved'}
        {saveState === 'error' && 'Save failed'}
      </span>
      {kind === 'image' && url ? (
        <div className="modal-media">
          <img src={url} alt="" />
        </div>
      ) : null}
      {kind === 'audio' && url ? (
        <audio controls src={url} className="modal-media">
          <track kind="captions" />
        </audio>
      ) : null}
      {kind === 'video' && url ? <video controls src={url} className="modal-media" /> : null}
    </div>
  )
}

type YtProps = { nodeId: string; embedId: string }

export function YoutubeModalBody({ nodeId, embedId }: YtProps) {
  const queryClient = useQueryClient()
  const lessonId = useLessonId()
  const [embedIdState, setEmbedIdState] = useState(embedId)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const debouncedSave = useDebouncedCallback(async (id: string) => {
    setSaveState('saving')
    try {
      await patchInteractiveNode(nodeId, { embed_id: id, embed: 'youtube' })
      setSaveState('saved')
      queryClient.invalidateQueries({ queryKey: ['interactive-node', nodeId] })
      if (lessonId) queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
    }
  }, 500)

  return (
    <div className="url-modal">
      <label className="url-label">
        YouTube video ID
        <input
          className="url-input"
          value={embedIdState}
          onChange={(e) => {
            const v = e.target.value
            setEmbedIdState(v)
            debouncedSave(v)
          }}
        />
      </label>
      <span className="save-pill" data-state={saveState}>
        {saveState === 'saving' && 'Saving…'}
        {saveState === 'saved' && 'Saved'}
        {saveState === 'error' && 'Save failed'}
      </span>
      {embedIdState ? (
        <div className="modal-body modal-media modal-video">
          <iframe
            title="YouTube"
            src={`https://www.youtube-nocookie.com/embed/${embedIdState}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  )
}

type WebProps = { nodeId: string; data: ResolvedWeb }

export function WebPreviewModalBody({ nodeId, data }: WebProps) {
  const queryClient = useQueryClient()
  const lessonId = useLessonId()
  const [url, setUrl] = useState(data.url)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const debouncedSave = useDebouncedCallback(async (next: string) => {
    setSaveState('saving')
    try {
      await patchInteractiveNode(nodeId, { source: { type: 'inline', url: next } })
      setSaveState('saved')
      queryClient.invalidateQueries({ queryKey: ['interactive-node', nodeId] })
      if (lessonId) queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('error')
    }
  }, 500)

  const safePreview =
    url.startsWith('https://') && !url.includes('javascript:') ? url : ''

  const previewSrc = useMemo(
    () => (safePreview ? normalizeForIframePreview(safePreview) : ''),
    [safePreview],
  )

  const isYtEmbed = isYoutubeNocookieEmbedSrc(previewSrc)

  return (
    <div className="url-modal">
      <label className="url-label">
        Page URL
        <input
          className="url-input"
          value={url}
          onChange={(e) => {
            const v = e.target.value
            setUrl(v)
            debouncedSave(v)
          }}
        />
      </label>
      <span className="save-pill" data-state={saveState}>
        {saveState === 'saving' && 'Saving…'}
        {saveState === 'saved' && 'Saved'}
        {saveState === 'error' && 'Save failed'}
      </span>
      {previewSrc ? (
        <>
          <iframe
            title="Preview"
            src={previewSrc}
            className="web-iframe"
            {...(isYtEmbed
              ? {
                  allow:
                    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                  allowFullScreen: true,
                }
              : { sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms' })}
          />
          <p className="web-preview-external muted">
            <a href={safePreview} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </p>
        </>
      ) : (
        <p className="modal-body muted">
          Enter an https:// URL to preview. Many sites block in-page embedding; if the preview stays blank,
          paste a direct media or embed link, or open the page in a new tab after saving.
        </p>
      )}
    </div>
  )
}

