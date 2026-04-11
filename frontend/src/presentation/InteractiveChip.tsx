import { useInteractiveModal } from '../application/useInteractiveModal'
import type { ChipIcon } from '../domain/constants'
import { ChipGlyph, SearchIcon } from './icons'

type Props = {
  nodeId: string
  label: string
  icon: ChipIcon
}

export function InteractiveChip({ nodeId, label, icon }: Props) {
  const { open } = useInteractiveModal()

  return (
    <button type="button" className="media-chip" onClick={() => open(nodeId)}>
      <span className="media-chip-icon" aria-hidden>
        <ChipGlyph kind={icon} />
      </span>
      <span className="media-chip-label">{label}</span>
      <SearchIcon className="media-chip-search" />
    </button>
  )
}
