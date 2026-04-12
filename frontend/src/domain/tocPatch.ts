import type { TOCItem } from './types'

export function updateTocItemBody(
  items: TOCItem[],
  id: string,
  body: Record<string, unknown>,
): TOCItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, body }
    }
    if (item.children?.length) {
      return { ...item, children: updateTocItemBody(item.children, id, body) }
    }
    return item
  })
}

export function updateTocItemLabel(items: TOCItem[], id: string, label: string): TOCItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, label }
    }
    if (item.children?.length) {
      return { ...item, children: updateTocItemLabel(item.children, id, label) }
    }
    return item
  })
}
