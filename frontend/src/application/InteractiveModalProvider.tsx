import { useMemo, useState, useCallback, type ReactNode } from 'react'
import { InteractiveModalContext } from './interactiveModalContext'

export function InteractiveModalProvider({ children }: { children: ReactNode }) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)

  const open = useCallback((nodeId: string) => {
    setActiveNodeId(nodeId)
  }, [])

  const close = useCallback(() => setActiveNodeId(null), [])

  const value = useMemo(
    () => ({ activeNodeId, open, close }),
    [activeNodeId, open, close],
  )

  return (
    <InteractiveModalContext.Provider value={value}>{children}</InteractiveModalContext.Provider>
  )
}
