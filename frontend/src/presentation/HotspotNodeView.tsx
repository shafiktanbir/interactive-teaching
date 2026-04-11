import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { useInteractiveModal } from '../application/useInteractiveModal'
import { SearchIcon } from './icons'

export function HotspotNodeView({ node }: NodeViewProps) {
  const { open } = useInteractiveModal()
  const nodeId = String(node.attrs.nodeId ?? '')
  const label = String(node.attrs.label ?? '')

  return (
    <NodeViewWrapper as="span" className="hotspot-nodeview">
      <button
        type="button"
        className="hotspot-trigger"
        onClick={() => open(nodeId)}
        aria-label={`Open details for ${label}`}
      >
        <span className="hotspot-label">{label}</span>
        <SearchIcon className="hotspot-search" />
      </button>
    </NodeViewWrapper>
  )
}
