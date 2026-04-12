import type { Editor } from '@tiptap/core'

export const INTERACTIVE_HOTSPOT_TYPE = 'interactiveHotspot'

/** True when selection is non-empty, within one block, and does not touch a hotspot atom. */
export function canSelectToEdit(editor: Editor): boolean {
  const { state } = editor
  const { from, to, empty } = state.selection
  if (empty || from === to) return false

  const { $from, $to } = state.selection
  if ($from.parent !== $to.parent) return false

  let touchesHotspot = false
  state.doc.nodesBetween(from, to, (node) => {
    if (node.type.name === INTERACTIVE_HOTSPOT_TYPE) {
      touchesHotspot = true
      return false
    }
  })
  return !touchesHotspot
}
