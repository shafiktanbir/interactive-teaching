/** YouTube video IDs are 11 characters ([A-Za-z0-9_-]). */
const YT_ID = /^[a-zA-Z0-9_-]{11}$/

const YT_EMBED_BASE = 'https://www.youtube-nocookie.com/embed/'

function normalizeYoutubeHostname(host: string): string {
  return host.replace(/^www\./, '')
}

function extractYoutubeId(parsed: URL): string | null {
  const host = normalizeYoutubeHostname(parsed.hostname)

  if (host === 'youtu.be') {
    const seg = parsed.pathname.replace(/^\//, '').split('/')[0] ?? ''
    return YT_ID.test(seg) ? seg : null
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    const path = parsed.pathname
    if (path.startsWith('/embed/')) {
      const id = path.split('/').filter(Boolean)[1] ?? ''
      return YT_ID.test(id) ? id : null
    }
    if (path.startsWith('/shorts/')) {
      const id = path.split('/').filter(Boolean)[1] ?? ''
      return YT_ID.test(id) ? id : null
    }
    if (path === '/watch' || path.startsWith('/watch')) {
      const v = parsed.searchParams.get('v')
      return v && YT_ID.test(v) ? v : null
    }
  }

  if (host === 'youtube-nocookie.com') {
    if (parsed.pathname.startsWith('/embed/')) {
      const id = parsed.pathname.split('/').filter(Boolean)[1] ?? ''
      return YT_ID.test(id) ? id : null
    }
  }

  return null
}

function extractVimeoId(parsed: URL): string | null {
  const host = normalizeYoutubeHostname(parsed.hostname)

  if (host === 'player.vimeo.com' && parsed.pathname.startsWith('/video/')) {
    const id = parsed.pathname.split('/').filter(Boolean)[1] ?? ''
    return /^\d+$/.test(id) ? id : null
  }

  if (host === 'vimeo.com') {
    const numeric = parsed.pathname
      .split('/')
      .filter(Boolean)
      .find((segment) => /^\d{6,}$/.test(segment))
    return numeric ?? null
  }

  return null
}

/**
 * Rewrites common media page URLs to iframe-embeddable equivalents.
 * Other HTTPS URLs are returned unchanged (many sites still block embedding).
 * Expects caller to only pass strings that already passed https:// validation.
 */
export function normalizeForIframePreview(httpsUrl: string): string {
  try {
    const parsed = new URL(httpsUrl)
    if (parsed.protocol !== 'https:') return httpsUrl

    const yt = extractYoutubeId(parsed)
    if (yt) return `${YT_EMBED_BASE}${yt}`

    const vm = extractVimeoId(parsed)
    if (vm) return `https://player.vimeo.com/video/${vm}`

    return httpsUrl
  } catch {
    return httpsUrl
  }
}

export function isYoutubeNocookieEmbedSrc(src: string): boolean {
  try {
    const u = new URL(src)
    return (
      u.protocol === 'https:' &&
      (u.hostname === 'www.youtube-nocookie.com' || u.hostname === 'youtube-nocookie.com') &&
      u.pathname.startsWith('/embed/')
    )
  } catch {
    return false
  }
}
