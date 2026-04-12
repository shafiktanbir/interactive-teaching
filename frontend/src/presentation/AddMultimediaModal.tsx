import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createInteractiveNode, fetchLesson, patchLesson } from '../infrastructure/api'
import type { InteractiveNodeCreate, MultimediaStripItemInput } from '../domain/types'

type FormKind = 'text' | 'image' | 'audio' | 'video' | 'youtube' | 'web'

type Props = {
  lessonId: string
  open: boolean
  onClose: () => void
}

const emptyTipTap = (): Record<string, unknown> => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [] }],
})

export function AddMultimediaModal({ lessonId, open, onClose }: Props) {
  const queryClient = useQueryClient()
  const [kind, setKind] = useState<FormKind>('text')
  const [label, setLabel] = useState('')
  const [textBody, setTextBody] = useState('')
  const [url, setUrl] = useState('https://')
  const [youtubeId, setYoutubeId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!label.trim()) throw new Error('Label is required')
      let body: InteractiveNodeCreate
      if (kind === 'text') {
        const rich = textBody.trim()
          ? {
              type: 'doc' as const,
              content: [
                {
                  type: 'paragraph' as const,
                  content: [{ type: 'text' as const, text: textBody }],
                },
              ],
            }
          : emptyTipTap()
        body = {
          kind: 'text',
          label: label.trim(),
          source: {
            type: 'inline',
            text: textBody || undefined,
            rich_text: rich,
          },
        }
      } else if (kind === 'youtube') {
        if (!youtubeId.trim()) throw new Error('YouTube video ID required')
        body = {
          kind: 'video',
          label: label.trim(),
          embed: 'youtube',
          embed_id: youtubeId.trim(),
          source: { type: 'inline' },
        }
      } else if (kind === 'web') {
        if (!url.trim()) throw new Error('URL required')
        body = {
          kind: 'web',
          label: label.trim(),
          source: { type: 'inline', url: url.trim() },
        }
      } else {
        if (!url.trim()) throw new Error('URL required')
        body = {
          kind,
          label: label.trim(),
          source: { type: 'inline', media_url: url.trim() },
        }
      }
      const { id } = await createInteractiveNode(body)
      const lesson = await fetchLesson(lessonId)
      const strip: MultimediaStripItemInput[] = [
        ...lesson.multimedia_strip.map((s) => ({
          node_id: s.node_id,
          label: s.label ?? undefined,
        })),
        { node_id: id, label: label.trim() },
      ]
      await patchLesson(lessonId, { multimedia_strip: strip })
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      onClose()
      setLabel('')
      setTextBody('')
      setUrl('https://')
      setYoutubeId('')
      setError(null)
    },
    onError: (e: Error) => setError(e.message),
  })

  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Add multimedia"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h3 className="modal-title">Add multimedia chip</h3>
        <form
          className="add-form"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            mutation.mutate()
          }}
        >
          <label className="url-label">
            Type
            <select
              className="url-input"
              value={kind}
              onChange={(e) => setKind(e.target.value as FormKind)}
            >
              <option value="text">Text (rich editor in modal)</option>
              <option value="image">Image URL</option>
              <option value="audio">Audio URL</option>
              <option value="video">Video file URL</option>
              <option value="youtube">YouTube</option>
              <option value="web">Web page preview</option>
            </select>
          </label>
          <label className="url-label">
            Chip label
            <input
              className="url-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Shown on the strip"
              required
            />
          </label>
          {kind === 'text' ? (
            <label className="url-label">
              Initial text (optional)
              <textarea
                className="url-input"
                rows={3}
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
              />
            </label>
          ) : null}
          {kind === 'youtube' ? (
            <label className="url-label">
              YouTube video ID
              <input
                className="url-input"
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="e.g. dQw4w9WgXcQ"
              />
            </label>
          ) : null}
          {kind !== 'text' && kind !== 'youtube' ? (
            <label className="url-label">
              {kind === 'web' ? 'Page URL (https)' : 'Media URL'}
              <input
                className="url-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>
          ) : null}
          {error ? <p className="modal-body error">{error}</p> : null}
          <div className="add-form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
