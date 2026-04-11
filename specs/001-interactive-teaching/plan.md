# Implementation Plan: Interactive Teaching Platform

**Branch**: `001-interactive-teaching` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-interactive-teaching/spec.md`

**Note**: Generated and filled per Spec Kit workflow (Phase 0–1 complete in companion artifacts).

## Summary

Teacher-facing interactive LMS: React (layered) + FastAPI (MVC) as separate deployables, MongoDB for persistence, rich text with TipTap JSON document, TOC sidebar, and interactive hotspots (red label + icon) that fetch modal content (text, image, audio, video) via REST. Local MongoDB runs in Docker; production keeps MongoDB on a private network.

## Technical Context

**Language/Version**: Python 3.12+, TypeScript 5.x (strict), Node 20+  
**Primary Dependencies**: FastAPI, Motor (async MongoDB), Pydantic v2; React 19, Vite, TipTap, TanStack Query  
**Storage**: MongoDB 7.x (documents: lessons, interactive_nodes)  
**Testing**: pytest + httpx (backend); Vitest + Testing Library (frontend)  
**Target Platform**: Linux containers / developer workstations; browser evergreen (Chrome, Firefox)  
**Project Type**: Web application (separate `backend/` and `frontend/` trees)  
**Performance Goals**: Modal content loads within typical LAN/WAN expectations; no hard SLO for MVP  
**Constraints**: Sanitized rich text; URL allowlist for external media; CORS restricted by env  
**Scale/Scope**: Single-tenant MVP; designed for extension to auth and multi-tenancy  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status |
|-----------|--------|
| I. Separation of Client and API | Pass — separate `backend/` and `frontend/` builds; contracts in `contracts/` |
| II. Layered Frontend, MVC Backend | Pass — folders mapped in Project Structure |
| III. Contract-First Interfaces | Pass — OpenAPI in `contracts/openapi.yaml` |
| IV. Security by Default | Pass — allowlist + sanitization documented in research and contracts |
| V. Test-Backed Critical Paths | Pass — pytest/Vitest targets defined in quickstart |

## Project Structure

### Documentation (this feature)

```text
specs/001-interactive-teaching/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── spec.md
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── routers/
│   ├── controllers/
│   ├── models/
│   └── repositories/
├── tests/
├── requirements.txt
└── pyproject.toml

frontend/
├── src/
│   ├── presentation/
│   ├── application/
│   ├── domain/
│   └── infrastructure/
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts

docker-compose.yml
```

**Structure Decision**: Monorepo with two deployable packages (`backend`, `frontend`) sharing only API contracts under `specs/.../contracts/`. MongoDB runs via root `docker-compose.yml` for local development.

## Complexity Tracking

No constitution violations required for MVP.
