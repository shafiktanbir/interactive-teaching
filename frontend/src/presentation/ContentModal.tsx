import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchInteractiveNode } from '../infrastructure/api'
import { useInteractiveModal } from '../application/useInteractiveModal'
import { renderResolvedBody } from './renderInteractiveNodeModal'

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
        className="modal-panel modal-panel--wide"
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
        {q.data && (
          <div key={activeNodeId} className="modal-scroll">
            {renderResolvedBody(activeNodeId, q.data)}
          </div>
        )}
      </div>
    </div>
  )
}
