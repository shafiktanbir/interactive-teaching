import { createContext } from 'react'

export type InteractiveModalContextValue = {
  activeNodeId: string | null
  open: (nodeId: string) => void
  close: () => void
}

export const InteractiveModalContext = createContext<InteractiveModalContextValue | null>(null)
