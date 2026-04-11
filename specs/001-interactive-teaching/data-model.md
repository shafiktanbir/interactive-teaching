# Data Model — MongoDB

Encoding: UTF-8 everywhere. IDs: string ObjectIds serialized as hex strings in API JSON.

## Collection: `lessons`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `title` | string | Lesson title |
| `toc` | array of TOCItem | Ordered table of contents |
| `content` | object | TipTap JSON document (ProseMirror JSON) |
| `updated_at` | datetime | Last update (UTC) |

### TOCItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable section id (slug or uuid) |
| `label` | string | Display label |
| `children` | array of TOCItem | Optional nesting for accordion |

## Collection: `interactive_nodes`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key; exposed as `id` in API |
| `label` | string | Default display text for hotspot |
| `kind` | string enum | `text` \| `image` \| `audio` \| `video` |
| `source` | object | See Source variants |

### Source variants

**inline** (content stored in DB):

- `type`: `"inline"`
- `text` (optional): string for `kind: text`
- `media_url` (optional): string for image/audio/video when hosted or allowed

**external** (reference only):

- `type`: `"external"`
- `url`: string — must satisfy allowlist at read time

### Video embed metadata (optional)

| Field | Type | Description |
|-------|------|-------------|
| `embed` | string | e.g. `youtube` |
| `embed_id` | string | Provider video id |

## Relationships

- `lessons.content` references `interactive_nodes._id` by string id inside TipTap `interactiveHotspot` attrs. No hard DB foreign key; orphan nodes possible and acceptable for MVP.

## Indexes

- `lessons._id` default; optional `lessons.title` text index later.
- `interactive_nodes._id` default.
