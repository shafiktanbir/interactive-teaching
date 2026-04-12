import type { Editor } from '@tiptap/core'

/**
 * Builds a one-block TipTap JSON document from the current selection slice,
 * preserving the parent block type (paragraph, heading, etc.).
 */
export function selectionToMiniDocJSON(editor: Editor, from: number, to: number): Record<string, unknown> {
  const { state } = editor
  const slice = state.doc.slice(from, to)
  const $from = state.doc.resolve(from)
  const parent = $from.parent
  const content: unknown[] = []
  slice.content.forEach((node) => {
    content.push(node.toJSON())
  })
  const block: Record<string, unknown> = {
    type: parent.type.name,
    content,
  }
  if (parent.attrs && Object.keys(parent.attrs).length > 0) {
    block.attrs = { ...parent.attrs }
  }
  return {
    type: 'doc',
    content: [block],
  }
}

/** Inline JSON nodes from the sub-editor document (first block only). */
export function inlineContentFromMiniDoc(doc: Record<string, unknown>): unknown[] {
  const blocks = doc.content as unknown[] | undefined
  const first = blocks?.[0] as Record<string, unknown> | undefined
  const inner = first?.content as unknown[] | undefined
  return Array.isArray(inner) ? inner : []
}
