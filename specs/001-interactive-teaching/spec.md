# Feature Specification: Interactive Teaching Platform

**Feature Branch**: `001-interactive-teaching`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "LMS for teachers with rich text (bold, italic, URL embedding), table of contents, interactive hotspots (red label + search icon) opening a modal with text/image/audio/video from FastAPI or external URL; React frontend (layered), FastAPI backend (MVC), MongoDB on Docker, deployable separately."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Author and view lesson with TOC (Priority: P1)

A teacher opens a lesson page that shows a header, main content area, and a right sidebar acting as a table of contents. Sections in the sidebar expand/collapse and reflect lesson structure. The teacher can read the lesson and navigate via the TOC.

**Why this priority**: Delivers the core reading shell without which interactive content has no context.

**Independent Test**: Load a seeded lesson; verify TOC labels render and at least one section body is visible.

**Acceptance Scenarios**:

1. **Given** a lesson with multiple TOC entries, **When** the page loads, **Then** the sidebar lists those entries in order.
2. **Given** the lesson page, **When** the user expands a TOC section, **Then** associated content or anchor region is shown or scrolled into view (MVP: expand reveals subsection list or static placeholder).

---

### User Story 2 - Rich text formatting (Priority: P1)

A teacher edits or views lesson body text with basic formatting: bold, italic, and hyperlinks (URL embedding). Content persists and renders consistently after save/reload.

**Why this priority**: Matches "basic Word-like" expectations and is prerequisite for embedding interactive elements in prose.

**Independent Test**: Apply bold/italic/link in editor, save, reload; verify formatting survives.

**Acceptance Scenarios**:

1. **Given** the editor, **When** the user applies bold to a selection, **Then** the selection appears bold in preview and persisted content.
2. **Given** the editor, **When** the user inserts a link with `https` URL, **Then** the link is clickable and opens in a new tab (or same tab per product default).

---

### User Story 3 - Interactive hotspots and modal content (Priority: P1)

The lesson shows interactive triggers styled as red emphasized label plus a search (magnifying glass) icon. Types supported: text, image, audio, video (including common embeds such as YouTube as video). Clicking a trigger opens a modal. Modal content is loaded from the backend by stable id or from an allowed external URL per contract.

**Why this priority**: This is the differentiator shown in mockups.

**Independent Test**: Click each media type trigger; modal shows correct renderer (paragraph, img, audio, video) without full page navigation.

**Acceptance Scenarios**:

1. **Given** a text-type hotspot backed by API, **When** the user clicks the trigger, **Then** a modal opens with the returned text and a close control.
2. **Given** an image-type hotspot with image URL, **When** the user opens the modal, **Then** the image displays with alt text if provided.
3. **Given** audio/video types, **When** the modal opens, **Then** native controls play the media from the resolved URL.
4. **Given** a failed fetch or blocked URL, **When** the user opens the modal, **Then** an error message appears inside the modal.

---

### User Story 4 - API-backed persistence (Priority: P2)

Lessons and interactive node definitions are stored in MongoDB. The FastAPI service exposes documented REST endpoints for reading (and saving for teacher workflows in MVP scope).

**Why this priority**: Enables real data instead of fixtures only.

**Independent Test**: Create/update lesson via API; GET returns consistent JSON matching contracts.

---

### Edge Cases

- Invalid or non-allowlisted external URLs for hotspots must be rejected or not rendered as executable content.
- Large media: modal shows loading state; avoid blocking the main thread.
- Unicode (e.g., Bengali) in lesson body and modal text must display correctly (UTF-8 end-to-end).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a lesson view with a table-of-contents sidebar and main content region.
- **FR-002**: System MUST support rich text with at minimum bold, italic, and link (URL) in the lesson body authoring format.
- **FR-003**: System MUST support interactive hotspots with a consistent visual pattern (emphasized label + icon) and clickable behavior.
- **FR-004**: Hotspots MUST resolve content of types: text, image, audio, video; video MAY include provider-specific embed metadata (e.g., YouTube) as a subtype of video.
- **FR-005**: Opening a hotspot MUST display content in a modal overlay with dismiss (close control and ESC) without losing the lesson page state.
- **FR-006**: Backend MUST expose `GET` endpoints for lesson content and interactive node payloads; MVP MAY include `PUT` for lesson save without authentication if documented as dev-only.
- **FR-007**: Persistence MUST use MongoDB for lesson documents and interactive node metadata; local development MUST run MongoDB via Docker.
- **FR-008**: Frontend and backend MUST be separable deployables (independent build artifacts); communication via HTTP JSON with configurable base URL and CORS.
- **FR-009**: External URLs used for media or embeds MUST be validated against an allowlist policy documented in contracts.

### Key Entities

- **Lesson**: Title, ordered TOC entries, serialized rich-text document (JSON preferred), references to interactive node ids.
- **InteractiveNode**: Stable id, kind (text | image | audio | video), display label, source (inline payload reference or external URL with policy), optional provider hint for embeds.
- **TOCEntry**: Label, optional anchor id, optional ordering/nesting for accordion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open a seeded lesson and complete Story 1–3 flows in under five minutes on a developer machine.
- **SC-002**: 100% of hotspot types in the seed data open a modal with no console errors in current Chrome and Firefox.
- **SC-003**: API responses for lesson and node match published JSON contracts (schema-validated in CI or manual checklist).

## Assumptions

- MVP targets a single teacher or single-tenant demo; authentication is deferred but contracts reserve space for auth headers later.
- Teachers run MongoDB locally via Docker Compose; cloud deployments place MongoDB on a private network reachable only by the API.
- Frontend and backend may live in one repository as separate packages for developer convenience while remaining independently deployable.
