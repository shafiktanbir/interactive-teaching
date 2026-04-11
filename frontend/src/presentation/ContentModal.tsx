import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchInteractiveNode } from '../infrastructure/api'
import { useInteractiveModal } from '../application/useInteractiveModal'
import type { InteractiveNodeResolved } from '../domain/types'

export function ContentModal() {
  const { activeNodeId, close } = useInteractiveModal()

  useEffect(() => {
    if (!activeNodeId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeNodeId, close])

  const q = useQuery({
    queryKey: ['interactive-node', activeNodeId],
    queryFn: () => fetchInteractiveNode(activeNodeId as string),
    enabled: Boolean(activeNodeId),
  })

  if (!activeNodeId) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Interactive content"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={close} aria-label="Close">
          ×
        </button>
        {q.isLoading && <p className="modal-body">Loading…</p>}
        {q.isError && (
          <p className="modal-body error">Could not load content. Is the API running?</p>
        )}
        {q.data && <ModalBody data={q.data} />}
      </div>
    </div>
  )
}

function ModalBody({ data }: { data: InteractiveNodeResolved }) {
  if (data.kind === 'text') {
    return <p className="modal-body">{data.text}</p>
  }
  if (data.kind === 'image') {
    return (
      <div className="modal-body modal-media">
        <img src={data.url} alt={data.alt ?? ''} />
      </div>
    )
  }
  if (data.kind === 'audio') {
    return (
      <div className="modal-body modal-media">
        <audio controls src={data.url}>
          <track kind="captions" />
        </audio>
      </div>
    )
  }
  if (data.kind === 'video') {
    if (data.embed === 'youtube' && data.embed_id) {
      return (
        <div className="modal-body modal-media modal-video">
          <iframe
            title="YouTube embed"
            src={`https://www.youtube-nocookie.com/embed/${data.embed_id}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    if (data.url) {
      return (
        <div className="modal-body modal-media">
          <video controls src={data.url} />
        </div>
      )
    }
  }
  return <p className="modal-body">Unsupported content.</p>
}
