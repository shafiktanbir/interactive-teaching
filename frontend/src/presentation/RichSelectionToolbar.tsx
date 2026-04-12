import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'

export function RichSelectionToolbar({
  subEditor,
  onLink,
}: {
  subEditor: Editor
  onLink: () => void
}) {
  const { bold, italic, underline } = useEditorState({
    editor: subEditor,
    selector: (ctx) => ({
      bold: ctx.editor?.isActive('bold') ?? false,
      italic: ctx.editor?.isActive('italic') ?? false,
      underline: ctx.editor?.isActive('underline') ?? false,
    }),
  })

  return (
    <div className="rich-toolbar lesson-edit-toolbar" role="toolbar" aria-label="Formatting">
      <button
        type="button"
        className={bold ? 'active' : ''}
        onClick={() => subEditor.chain().focus().toggleBold().run()}
      >
        Bold
      </button>
      <button
        type="button"
        className={italic ? 'active' : ''}
        onClick={() => subEditor.chain().focus().toggleItalic().run()}
      >
        Italic
      </button>
      <button
        type="button"
        className={underline ? 'active' : ''}
        onClick={() => subEditor.chain().focus().toggleUnderline().run()}
      >
        Underline
      </button>
      <button type="button" onClick={onLink}>
        Link
      </button>
    </div>
  )
}
