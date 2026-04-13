# Interactive Teaching — local development shortcuts
# Usage: `make help` | `make mongo` then `make dev`

SHELL := /bin/bash

BACKEND_DIR := backend
FRONTEND_DIR := frontend
BACKEND_PORT ?= 8000
FRONTEND_PORT ?= 5173

.PHONY: help mongo mongo-down install install-backend install-frontend setup-env backend frontend dev test clean

help:
	@echo "Interactive Teaching — Makefile"
	@echo ""
	@echo "  make mongo          Start MongoDB (docker compose up -d)"
	@echo "  make mongo-down     Stop MongoDB container"
	@echo "  make setup-env      Copy .env.example -> backend/.env & frontend/.env (no overwrite)"
	@echo "  make install        Install Python venv + pip deps, and npm packages"
	@echo "  make install-backend / install-frontend   Install one side only"
	@echo "  make backend        Run FastAPI (uvicorn) on :$(BACKEND_PORT)"
	@echo "  make frontend       Run Vite dev server on :$(FRONTEND_PORT)"
	@echo "  make dev            Run backend + frontend in parallel (needs two terminals' worth — one make)"
	@echo "  make test           pytest (backend) + frontend build (typecheck)"
	@echo ""
	@echo "First time:  make mongo && make setup-env && make install && make dev"

# Prefer .env.local (deploy convention); fall back to project `.env` for Compose interpolation.
COMPOSE_ENV_FILE := $(shell test -f .env.local && echo .env.local || echo .env)

mongo:
	docker compose --env-file $(COMPOSE_ENV_FILE) up -d mongo

mongo-down:
	docker compose --env-file $(COMPOSE_ENV_FILE) down

setup-env:
	@test -f .env.example || { echo "Missing .env.example"; exit 1; }
	@cp -n .env.example backend/.env 2>/dev/null || true
	@cp -n .env.example frontend/.env 2>/dev/null || true
	@echo "Env files ready (existing files were not overwritten). Edit backend/.env and frontend/.env if needed."

install-backend:
	cd $(BACKEND_DIR) && python3 -m venv .venv
	cd $(BACKEND_DIR) && . .venv/bin/activate && pip install -U pip && pip install -r requirements.txt

install-frontend:
	cd $(FRONTEND_DIR) && npm install

install: install-backend install-frontend

# Ensure venv + deps exist (lightweight check)
$(BACKEND_DIR)/.venv/bin/uvicorn:
	$(MAKE) install-backend

backend: $(BACKEND_DIR)/.venv/bin/uvicorn
	cd $(BACKEND_DIR) && . .venv/bin/activate && \
		uvicorn app.main:app --reload --host 0.0.0.0 --port $(BACKEND_PORT)

frontend:
	cd $(FRONTEND_DIR) && npm run dev -- --host 0.0.0.0 --port $(FRONTEND_PORT)

# Run API and Vite together (requires GNU make jobserver)
dev:
	$(MAKE) -j2 backend frontend

test:
	cd $(BACKEND_DIR) && . .venv/bin/activate && pytest -q
	cd $(FRONTEND_DIR) && npm run build

clean:
	rm -rf $(BACKEND_DIR)/.venv $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist
