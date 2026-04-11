# Phase 0 Research — Interactive Teaching Platform

## Rich text editor

- **Decision**: Use **TipTap** (ProseMirror) with StarterKit plus Link extension; persist the editor document as **JSON** (`editor.getJSON()`).
- **Rationale**: Mature ecosystem, straightforward custom **Node** for interactive hotspots with attrs (`nodeId`, `label`), avoids fragile HTML regex for embedded triggers.
- **Alternatives considered**: Lexical (good; slightly less examples for custom embeds in TipTap-heavy teams), raw ContentEditable (rejected: too brittle).

## Hotspot representation

- **Decision**: Custom TipTap node `interactiveHotspot` (inline-capable block or atom inline per implementation) storing `nodeId` (MongoDB string id of `interactive_nodes` collection) and display `label`.
- **Rationale**: Stable join to API `GET /interactive-nodes/{id}`; label denormalized for editor display.
- **Alternatives considered**: HTML `<span data-id>` only (rejected: harder to validate on round-trip).

## Modal content loading

- **Decision**: Client calls `GET /interactive-nodes/{id}`; response is a **discriminated union** by `kind`. For `external_url` source, backend returns resolved URL only if allowlist passes; frontend renders `<img>`, `<audio>`, `<video>`, or text; YouTube uses `video` kind with `embed: youtube` metadata and a constrained iframe component.
- **Rationale**: Single endpoint simplifies React Query cache key; security policy centralized in FastAPI.
- **Alternatives considered**: Client-side fetch of arbitrary URLs (rejected: SSRF risk).

## URL allowlist

- **Decision**: Environment variable `MEDIA_URL_ALLOWLIST` as comma-separated host suffixes (e.g., `cdn.example.com,youtube.com,www.youtube.com`). Empty means **only** backend-stored inline content (no external URLs) for strictest dev default; seed uses `localhost` or relative paths for demos.
- **Rationale**: Matches constitution; tunable per environment.
- **Alternatives considered**: Open redirect to any HTTPS (rejected).

## CORS

- **Decision**: `CORS_ORIGINS` comma-separated list; default `http://localhost:5173` for Vite.
- **Rationale**: Explicit origins for production.

## MongoDB access

- **Decision**: **Motor** async driver with plain Pydantic models (no ODM required for MVP).
- **Rationale**: Lightweight, aligns with FastAPI async; Beanie optional later.

## Testing

- **Decision**: `pytest` with `httpx.AsyncClient` against TestClient; MongoDB mocked or test container optional Phase 2; MVP uses `mongomock-motor` or in-memory if available — simplest: **TestClient with dependency override** returning fake repo for unit tests, plus one integration test with real MongoDB in CI optional.
- **Rationale**: Fast feedback on handlers.
