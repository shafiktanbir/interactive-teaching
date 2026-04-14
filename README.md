# Interactive Teaching

Interactive Teaching is a full-stack demo app for lesson content with embedded interactive multimedia.
It uses a React + TipTap frontend and a FastAPI + MongoDB backend.

## Features

- Lesson viewer with a seeded demo lesson and table-of-contents sidebar.
- Interactive links inside lesson content that open rich modal content.
- Multimedia strip with chips for quick access to related content.
- Add multimedia from the UI (text, image, audio, video, YouTube, web link).
- Backend API for lessons and interactive nodes (`GET`, `PATCH`, `POST` flows).
- Automatic seed-on-start when the database is empty.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, TipTap, TanStack Query
- Backend: FastAPI, Motor (MongoDB), Pydantic
- Database: MongoDB 7
- Runtime: Docker Compose (recommended for parity), or local dev servers

## Project Structure

- `frontend/` - React app
- `backend/` - FastAPI app
- `docker-compose.yml` - Mongo + backend + frontend stack
- `deploy/ansible/` - VPS deployment automation
- `Makefile` - local development shortcuts

## Run with Docker Compose (recommended)

### 1) Prepare env file

Create a root env file from example:

```bash
cp .env.example .env
```

For Docker/Nginx mode, keep:

```env
VITE_API_BASE_URL=/api
```

### 2) Build and start

```bash
docker compose up -d --build
```

### 3) Open app

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend health: [http://localhost:8000/health](http://localhost:8000/health)
- Proxied health via frontend origin: [http://localhost:8080/api/health](http://localhost:8080/api/health)

## Run in local dev mode (without frontend container)

Prereqs:
- Python 3.12+
- Node 20+
- Docker (for MongoDB)

First-time setup:

```bash
make mongo
make setup-env
make install
make seed
make dev
```

Default local URLs:
- Frontend (Vite): [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)

## API Overview

Main endpoints:

- `GET /health`
- `GET /lessons/{lesson_id}`
- `PUT /lessons/{lesson_id}`
- `PATCH /lessons/{lesson_id}`
- `POST /interactive-nodes`
- `GET /interactive-nodes/{node_id}`
- `PATCH /interactive-nodes/{node_id}`

## Seeding Behavior

- Seed data is loaded by backend startup (`seed_if_empty`) in `backend/app/main.py`.
- Seeding only happens when DB collections are empty (idempotent behavior).
- If you wipe volumes (`docker compose down -v`), data will seed again at next startup.

## Troubleshooting

- Frontend cannot talk to backend from `:8080`:
  - Ensure `VITE_API_BASE_URL=/api` and rebuild frontend (`docker compose up -d --build`).
  - Verify `http://localhost:8080/api/health` returns `200`.
- Docker command typo:
  - Correct: `docker compose up -d --build`
  - Incorrect: `docker compose up -d--rebuild`

## Useful Commands

```bash
make help
make test
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

## Deployment

VPS deployment automation lives in `deploy/ansible/deploy-vps.yml`.
It provisions nginx + Docker, validates compose config, builds images, and runs the stack.
