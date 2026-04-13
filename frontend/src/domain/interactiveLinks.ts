const INTERACTIVE_PROTOCOL = 'interactive://'

export function isInteractiveHref(href: string | null | undefined): boolean {
  if (typeof href !== 'string') return false
  return href.trim().toLowerCase().startsWith(INTERACTIVE_PROTOCOL)
}

export function parseInteractiveNodeIdFromHref(href: string | null | undefined): string | null {
  if (!isInteractiveHref(href)) return null
  const raw = (href ?? '').trim().slice(INTERACTIVE_PROTOCOL.length)
  const withoutQuery = raw.split(/[?#]/, 1)[0] ?? ''
  if (!withoutQuery) return null
  try {
    const nodeId = decodeURIComponent(withoutQuery).trim()
    return nodeId.length > 0 ? nodeId : null
  } catch {
    return null
  }
}

export function buildInteractiveHref(nodeId: string): string | null {
  const trimmed = nodeId.trim()
  if (!trimmed) return null
  return `${INTERACTIVE_PROTOCOL}${encodeURIComponent(trimmed)}`
}
