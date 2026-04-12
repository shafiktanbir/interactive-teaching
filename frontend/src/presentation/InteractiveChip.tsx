import { useInteractiveModal } from '../application/useInteractiveModal'
import { chipIconFromKind, type ChipIcon } from '../domain/constants'
import { ChipGlyph, SearchIcon } from './icons'

type Props = {
  nodeId: string
  label: string
  icon?: ChipIcon
  kind?: string | null
}

export function InteractiveChip({ nodeId, label, icon, kind }: Props) {
  const resolved: ChipIcon = icon ?? chipIconFromKind(kind)
  const { open } = useInteractiveModal()

  return (
    <button type="button" className="media-chip" onClick={() => open(nodeId)}>
      <span className="media-chip-icon" aria-hidden>
        <ChipGlyph kind={resolved} />
      </span>
      <span className="media-chip-label">{label}</span>
      <SearchIcon className="media-chip-search" />
    </button>
  )
}
