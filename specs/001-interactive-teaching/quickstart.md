# Quickstart — Interactive Teaching Platform

## Prerequisites

- Docker with Compose plugin
- Python 3.12+ and `pip`
- Node.js 20+ and `npm`

## 1. Start MongoDB

From the repository root:

```bash
docker compose up -d
```

This starts MongoDB on `localhost:27017` with credentials from `.env` (copy from `.env.example`).

## 2. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export MONGODB_URI="${MONGODB_URI:-mongodb://root:interactive@localhost:27017/interactive?authSource=admin}"
export CORS_ORIGINS="${CORS_ORIGINS:-http://localhost:5173}"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Seed data is inserted on first startup if collections are empty.

## 3. Frontend (Vite + React)

```bash
cd frontend
npm install
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://localhost:8000}"
npm run dev
```

Open `http://localhost:5173`.

## 4. Verify

- `GET http://localhost:8000/health` returns `{"status":"ok"}`
- Lesson page loads with header, TOC sidebar, multimedia strip, and article; clicking hotspots opens the modal.

## Cloud / internal network

- Run MongoDB only on a private subnet; FastAPI uses `MONGODB_URI` pointing at that host.
- Expose only the API through a reverse proxy with TLS; set `CORS_ORIGINS` to your frontend origin(s).
- Do not expose MongoDB ports to the public internet.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | AsyncMotor connection string |
| `CORS_ORIGINS` | Comma-separated allowed browser origins |
| `MEDIA_URL_ALLOWLIST` | Comma-separated host suffixes allowed for external media URLs |
| `VITE_API_BASE_URL` | Browser-facing API base (build-time for Vite) |
