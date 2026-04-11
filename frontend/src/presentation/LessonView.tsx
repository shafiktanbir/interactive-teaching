import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useQuery } from '@tanstack/react-query'
import { fetchLesson } from '../infrastructure/api'
import { InteractiveHotspot } from './extensions/interactiveHotspot'
import { DEMO_CHIPS } from '../domain/constants'
import { InteractiveChip } from './InteractiveChip'
import { SidebarTOC } from './SidebarTOC'

const emptyDoc = { type: 'doc', content: [{ type: 'paragraph' }] }

type Props = { lessonId: string }

export function LessonView({ lessonId }: Props) {
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

  return (
    <div className="layout-grid">
      <main className="main-panel">
        <section className="content-card">
          <h2 className="section-title">Multimedia Content Examples</h2>
          <div className="chip-row">
            {DEMO_CHIPS.map((c) => (
              <InteractiveChip key={c.nodeId} nodeId={c.nodeId} label={c.label} icon={c.icon} />
            ))}
          </div>
        </section>
        <section className="content-card article-card">
          {editor ? (
            <EditorContent editor={editor} className="tiptap-readonly" />
          ) : (
            <p className="panel-muted">Preparing editor…</p>
          )}
        </section>
      </main>
      <SidebarTOC toc={lesson.toc} />
    </div>
  )
}
