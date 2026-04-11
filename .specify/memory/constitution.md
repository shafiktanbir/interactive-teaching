<!--
Sync Impact Report
- Version change: template → 1.0.0
- Modified principles: N/A (initial adoption)
- Added sections: Core Principles (5), Security & Data, Development Workflow, Governance
- Removed sections: N/A
- Templates: plan-template.md ⚠ verify Constitution Check gates manually; spec-template.md ✅ compatible; tasks-template.md ⚠ no change required for MVP
- Follow-up TODOs: Add automated constitution checks in CI when tasks workflow exists
-->

# Interactive Teaching Platform Constitution

## Core Principles

### I. Separation of Client and API

The web client and the FastAPI service MUST remain independently buildable and deployable artifacts. Shared code MUST live in explicit contracts (OpenAPI/JSON Schema) rather than shared libraries unless a dedicated package is introduced. Rationale: preserves independent release cycles and clear boundaries.

### II. Layered Frontend, MVC Backend

The React application MUST follow a layered structure: presentation (UI), application (hooks/state), domain (types), infrastructure (HTTP client, env). The FastAPI application MUST use routers for HTTP, controllers or services for orchestration, and repositories for MongoDB access. Rationale: predictable structure and test seams.

### III. Contract-First Interfaces

Public HTTP APIs MUST be documented in `specs/*/contracts/` and kept stable within a minor version. Breaking changes require a MAJOR version bump in API versioning strategy and migration notes. Rationale: protects the frontend and future integrators.

### IV. Security by Default

All user-controlled or teacher-supplied rich text MUST be sanitized before storage or rendering rules allow unsafe HTML. External URLs for media or embeds MUST pass an allowlist policy. CORS MUST restrict origins in non-local deployments. MongoDB MUST not be exposed to the public internet in production. Rationale: teaching content is still an attack surface for XSS and SSRF.

### V. Test-Backed Critical Paths

Backend repositories and API handlers MUST have automated tests for lesson read/write and interactive node resolution. Frontend MUST have tests for modal open/close and at least one hotspot type flow. Rationale: regressions in content delivery break trust immediately.

## Security & Data

- UTF-8 is the standard encoding for all text and API payloads.
- Secrets (MongoDB credentials, API keys) MUST come from environment variables or secret stores, never committed.
- Logs MUST NOT contain full lesson body content or tokens in production.

## Development Workflow

- Feature work uses Spec Kit artifacts under `specs/<feature>/` (spec, plan, research, data model, contracts, quickstart).
- Local development uses Docker Compose for MongoDB; backend and frontend run as separate dev processes.
- Code review MUST verify constitution principles for new endpoints and UI that handles HTML or URLs.

## Governance

This constitution supersedes ad-hoc conventions for this repository. Amendments require a PR that updates this file, increments version per semantic rules, and updates the Sync Impact Report comment. Complexity that violates a principle MUST be recorded in the feature plan’s Complexity Tracking table with justification.

**Version**: 1.0.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12
