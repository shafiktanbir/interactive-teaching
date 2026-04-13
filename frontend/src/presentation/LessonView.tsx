import { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { useQuery } from '@tanstack/react-query'
import { fetchLesson } from '../infrastructure/api'
import { InteractiveHotspot } from './extensions/interactiveHotspot'
import { InteractiveChip } from './InteractiveChip'
import { SidebarTOC } from './SidebarTOC'
import { LessonProvider } from '../application/LessonProvider'
import { AddMultimediaModal } from './AddMultimediaModal'
import { LessonArticleBubbleEdit } from './LessonArticleBubbleEdit'
import { useInteractiveModal } from '../application/useInteractiveModal'
import { isInteractiveHref, parseInteractiveNodeIdFromHref } from '../domain/interactiveLinks'

const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] }

type Props = { lessonId: string }

function LessonViewInner({ lessonId }: Props) {
  const [addOpen, setAddOpen] = useState(false)
  const { open } = useInteractiveModal()
  const lessonQuery = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => fetchLesson(lessonId),
  })

  const editor = useEditor({
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
      InteractiveHotspot,
    ],
    editable: false,
    content: emptyDoc,
  })

  useEffect(() => {
    if (lessonQuery.data?.content && editor) {
      editor.commands.setContent(lessonQuery.data.content)
    }
  }, [lessonQuery.data, editor])

  const onArticleClickCapture = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!isInteractiveHref(href)) return
      // Prevent browser navigation for interactive links; they should open in-app modal.
      event.preventDefault()
      const nodeId = parseInteractiveNodeIdFromHref(href)
      if (!nodeId) return
      open(nodeId)
    },
    [open],
  )

  if (lessonQuery.isLoading) {
    return <p className="panel-muted">Loading lesson…</p>
  }

  if (lessonQuery.isError || !lessonQuery.data) {
    return (
      <p className="panel-muted error">
        Failed to load lesson. Ensure the API is running and MongoDB is seeded.
      </p>
    )
  }

  const lesson = lessonQuery.data
  const strip = lesson.multimedia_strip ?? []

  return (
    <>
      <div className="layout-grid">
        <main className="main-panel">
          <section className="content-card">
            <h2 className="section-title">Multimedia Content Examples</h2>
            <div className="chip-row">
              {strip.map((item) => (
                <InteractiveChip
                  key={item.node_id}
                  nodeId={item.node_id}
                  label={item.label?.trim() || 'Untitled'}
                  kind={item.kind}
                />
              ))}
              <button type="button" className="media-chip media-chip-add" onClick={() => setAddOpen(true)}>
                <span className="media-chip-label">+ Add</span>
              </button>
            </div>
          </section>
          <section className="content-card article-card" onClickCapture={onArticleClickCapture}>
            {editor ? (
              <>
                <EditorContent editor={editor} className="tiptap-readonly" />
                <LessonArticleBubbleEdit editor={editor} lessonId={lessonId} />
              </>
            ) : (
              <p className="panel-muted">Preparing editor…</p>
            )}
          </section>
        </main>
        <SidebarTOC toc={lesson.toc} lessonId={lessonId} />
      </div>
      <AddMultimediaModal lessonId={lessonId} open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}

export function LessonView({ lessonId }: Props) {
  return (
    <LessonProvider lessonId={lessonId}>
      <LessonViewInner lessonId={lessonId} />
    </LessonProvider>
  )
}
