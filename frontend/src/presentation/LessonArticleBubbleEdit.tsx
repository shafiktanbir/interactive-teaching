import type { Editor } from '@tiptap/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BubbleMenu } from '@tiptap/react/menus'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { canSelectToEdit } from '../domain/lessonSelectionEdit'
import { inlineContentFromMiniDoc, selectionToMiniDocJSON } from '../domain/lessonSelectionSlice'
import { patchLesson } from '../infrastructure/api'

const emptyMiniDoc = { type: 'doc', content: [{ type: 'paragraph', content: [] }] }

type Props = {
  editor: Editor
  lessonId: string
}

function SelectionFormatToolbar({
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

export function LessonArticleBubbleEdit({ editor, lessonId }: Props) {
  const queryClient = useQueryClient()
  const rangeRef = useRef<{ from: number; to: number } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Underline,
    ],
    content: emptyMiniDoc,
    editable: true,
    editorProps: {
      attributes: { class: 'rich-modal-editor lesson-edit-rich-editor' },
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (content: Record<string, unknown>) => patchLesson(lessonId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      setError(null)
    },
    onError: () => {
      setError('Could not save lesson.')
    },
  })

  const openPanel = useCallback(() => {
    if (!canSelectToEdit(editor)) return
    const { from, to } = editor.state.selection
    rangeRef.current = { from, to }
    setPanelOpen(true)
    setError(null)
  }, [editor])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
    rangeRef.current = null
    setError(null)
  }, [])

  useEffect(() => {
    if (!panelOpen || !subEditor || !rangeRef.current) return
    const { from, to } = rangeRef.current
    const mini = selectionToMiniDocJSON(editor, from, to)
    subEditor.commands.setContent(mini)
    queueMicrotask(() => subEditor.commands.focus('end'))
  }, [panelOpen, subEditor, editor])

  const setLink = useCallback(() => {
    if (!subEditor) return
    const prev = subEditor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      subEditor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    subEditor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [subEditor])

  const applyEdit = useCallback(() => {
    const range = rangeRef.current
    if (!range || !subEditor) return
    const { from, to } = range
    const doc = subEditor.getJSON() as Record<string, unknown>
    const inner = inlineContentFromMiniDoc(doc)

    editor.setEditable(true)
    let ok = false
    try {
      if (inner.length === 0) {
        ok = editor.chain().deleteRange({ from, to }).run()
      } else {
        ok = editor.chain().insertContentAt({ from, to }, inner).run()
      }
    } finally {
      editor.setEditable(false)
    }

    if (!ok) {
      setError('Could not update text.')
      return
    }

    setPanelOpen(false)
    rangeRef.current = null
    saveMutation.mutate(editor.getJSON() as Record<string, unknown>)
  }, [editor, subEditor, saveMutation])

  useEffect(() => {
    if (!panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen, closePanel])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panelOpen) return
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'e') return
      if (e.repeat) return
      if (!canSelectToEdit(editor)) return
      e.preventDefault()
      openPanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor, panelOpen, openPanel])

  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: ed }) => {
          if (!ed || ed.isDestroyed) return false
          return canSelectToEdit(ed)
        }}
        appendTo={() => document.body}
        options={{ placement: 'top', offset: 8 }}
      >
        <div className="lesson-bubble-menu" role="toolbar" aria-label="Selection actions">
          <button
            type="button"
            className="lesson-bubble-edit-icon-btn"
            onClick={openPanel}
            aria-label="Edit selection with formatting (bold, italic, underline, links)"
            title="Edit selection (Ctrl+E)"
          >
            <svg
              className="lesson-bubble-edit-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
        </div>
      </BubbleMenu>

      {panelOpen ? (
        <div className="lesson-edit-panel-backdrop" role="presentation" onClick={closePanel}>
          <div
            className="lesson-edit-panel lesson-edit-panel--wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lesson-edit-panel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="lesson-edit-panel-title" className="lesson-edit-panel-title">
              Edit selection
            </h3>
            <p className="lesson-edit-panel-sub muted">Use the toolbar for bold, italic, underline, and links.</p>
            {subEditor ? (
              <div className="lesson-edit-rich-wrap">
                <SelectionFormatToolbar subEditor={subEditor} onLink={setLink} />
                <EditorContent editor={subEditor} />
              </div>
            ) : (
              <p className="panel-muted">Loading editor…</p>
            )}
            {error ? <p className="lesson-edit-error">{error}</p> : null}
            <div className="lesson-edit-actions">
              <button type="button" className="btn-secondary" onClick={closePanel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={applyEdit}
                disabled={saveMutation.isPending || !subEditor}
              >
                {saveMutation.isPending ? 'Saving…' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
