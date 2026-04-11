import { useContext } from 'react'
import { InteractiveModalContext } from './interactiveModalContext'

export function useInteractiveModal() {
  const ctx = useContext(InteractiveModalContext)
  if (!ctx) {
    throw new Error('useInteractiveModal must be used within InteractiveModalProvider')
  }
  return ctx
}
