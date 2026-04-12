import type { InteractiveNodeResolved } from '../domain/types'
import {
  MediaUrlModalBody,
  RichTextModalBody,
  WebPreviewModalBody,
  YoutubeModalBody,
} from './InteractiveNodeModalBody'

export function renderResolvedBody(nodeId: string, data: InteractiveNodeResolved) {
  if (data.kind === 'text') {
    return <RichTextModalBody nodeId={nodeId} data={data} />
  }
  if (data.kind === 'image') {
    return (
      <MediaUrlModalBody
        key={`img-${data.url}`}
        nodeId={nodeId}
        kind="image"
        initialUrl={data.url}
        alt={data.alt}
      />
    )
  }
  if (data.kind === 'audio') {
    return (
      <MediaUrlModalBody
        key={`aud-${data.url}`}
        nodeId={nodeId}
        kind="audio"
        initialUrl={data.url}
      />
    )
  }
  if (data.kind === 'video') {
    if (data.embed === 'youtube' && data.embed_id) {
      return (
        <YoutubeModalBody
          key={`yt-${data.embed_id}`}
          nodeId={nodeId}
          embedId={data.embed_id}
        />
      )
    }
    if (data.url) {
      return (
        <MediaUrlModalBody
          key={`vid-${data.url}`}
          nodeId={nodeId}
          kind="video"
          initialUrl={data.url}
        />
      )
    }
  }
  if (data.kind === 'web') {
    return <WebPreviewModalBody key={`web-${data.url}`} nodeId={nodeId} data={data} />
  }
  return <p className="modal-body">Unsupported content.</p>
}
