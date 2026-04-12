import { useState } from 'react'
import type { TOCItem } from '../domain/types'
import { TocSectionBody } from './TocSectionBody'

function Chevron({ open }: { open: boolean }) {
  return (
    <span className={`toc-chevron ${open ? 'open' : ''}`} aria-hidden>
      ▼
    </span>
  )
}

function Section({ item, lessonId }: { item: TOCItem; lessonId: string }) {
  const [open, setOpen] = useState(false)
  const [expandedOnce, setExpandedOnce] = useState(false)

  return (
    <div className="toc-section">
      <button
        type="button"
        className="toc-button"
        onClick={() =>
          setOpen((o) => {
            const next = !o
            if (next) setExpandedOnce(true)
            return next
          })
        }
        aria-expanded={open}
      >
        <span className="toc-button-label">{item.label}</span>
        <Chevron open={open} />
      </button>
      {open && expandedOnce ? (
        <div className="toc-expand-panel">
          <TocSectionBody item={item} lessonId={lessonId} />
          {item.children?.length ? (
            <ul className="toc-nested">
              {item.children.map((c) => (
                <li key={c.id}>{c.label}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

type Props = { toc: TOCItem[]; lessonId: string }

export function SidebarTOC({ toc, lessonId }: Props) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Expandable Content</h2>
      <div className="toc-stack">
        {toc.map((item) => (
          <Section key={item.id} item={item} lessonId={lessonId} />
        ))}
      </div>
    </aside>
  )
}
