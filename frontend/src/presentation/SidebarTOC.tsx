import { useState } from 'react'
import type { TOCItem } from '../domain/types'

function Chevron({ open }: { open: boolean }) {
  return (
    <span className={`toc-chevron ${open ? 'open' : ''}`} aria-hidden>
      ▼
    </span>
  )
}

function Section({
  item,
  defaultOpen,
}: {
  item: TOCItem
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="toc-section">
      <button
        type="button"
        className="toc-button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{item.label}</span>
        <Chevron open={open} />
      </button>
      {open && item.children?.length ? (
        <ul className="toc-nested">
          {item.children.map((c) => (
            <li key={c.id}>{c.label}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function SidebarTOC({ toc }: { toc: TOCItem[] }) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Expandable Content</h2>
      <div className="toc-stack">
        {toc.map((item, i) => (
          <Section key={item.id} item={item} defaultOpen={i === 0} />
        ))}
      </div>
    </aside>
  )
}
