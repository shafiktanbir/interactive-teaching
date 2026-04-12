import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import type { Lesson, TOCItem } from '../domain/types'
import { updateTocItemBody } from '../domain/tocPatch'
import { LessonArticleBubbleEdit } from './LessonArticleBubbleEdit'

const emptyDoc = { type: 'doc', content: [{ type: 'paragraph', content: [] }] }

type Props = { item: TOCItem; lessonId: string }

export function TocSectionBody({ item, lessonId }: Props) {
  const queryClient = useQueryClient()

  const bodyEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Underline,
    ],
    editable: false,
    content: item.body ?? emptyDoc,
    editorProps: {
      attributes: { class: 'rich-modal-editor toc-body-editor tiptap-readonly' },
    },
  })

  useEffect(() => {
    if (!bodyEditor) return
    bodyEditor.commands.setContent(item.body ?? emptyDoc)
  }, [item.body, bodyEditor])

  if (!bodyEditor) {
    return <p className="panel-muted toc-body-loading">Loading…</p>
  }

  return (
    <div className="toc-body-panel">
      <EditorContent editor={bodyEditor} />
      <LessonArticleBubbleEdit
        editor={bodyEditor}
        lessonId={lessonId}
        buildPatch={(ed) => {
          const lesson = queryClient.getQueryData<Lesson>(['lesson', lessonId])
          if (!lesson?.toc) return { toc: [] }
          return {
            toc: updateTocItemBody(lesson.toc, item.id, ed.getJSON() as Record<string, unknown>),
          }
        }}
      />
    </div>
  )
}
