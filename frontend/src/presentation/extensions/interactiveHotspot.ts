import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { HotspotNodeView } from '../HotspotNodeView'

export const InteractiveHotspot = Node.create({
  name: 'interactiveHotspot',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      nodeId: { default: '' },
      label: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="interactive-hotspot"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'interactive-hotspot' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(HotspotNodeView)
  },
})
