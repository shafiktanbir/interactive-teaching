# Deploying to a VPS

## Architecture

- **Host nginx** (installed by Ansible): TLS via certbot, reverse proxy to loopback ports for the **frontend** (static) and **backend** (FastAPI) containers.
- **Docker Compose** (`docker-compose.yml` at repo root): `mongo`, `backend`, `frontend` on network `app_net`. Mongo is not exposed publicly; backend and frontend publish only on `127.0.0.1` ports defined in `.env.local`.

## GitHub Actions: Deploy VPS

Workflow: [`.github/workflows/deploy-vps.yml`](../.github/workflows/deploy-vps.yml).

**Secrets** (repository settings):

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | Server hostname or IP |
| `VPS_PORT` | SSH port |
| `VPS_USERNAME` | SSH user (must run Docker after being added to `docker` group, or use root — playbook adds `ansible_user` to `docker`) |
| `VPS_SSH_KEY_B64` | Private key, base64-encoded |
| `VPS_APP_DIR` | Absolute path on the server (e.g. `/opt/interactive-teaching`) |

On each run, the workflow rsyncs the repo, copies [`.env.docker.example`](../.env.docker.example) to `$VPS_APP_DIR/.env.local` (**overwrites**), then runs `deploy/ansible/deploy-vps.yml` with `app_dir=$VPS_APP_DIR`.

**Before the first deploy:** Point DNS for your domain at the VPS, then edit [`ansible/group_vars/all.yml`](ansible/group_vars/all.yml) (or pass `-e domain=... -e certbot_email=...`) so `domain` and `certbot_email` are real. Ports `frontend_host_port` / `backend_host_port` must match `FRONTEND_PUBLISH_PORT` / `BACKEND_PUBLISH_PORT` in `.env.docker.example` / `.env.local`.

## Ansible locally

```bash
cd deploy/ansible
ansible-playbook -i 'vps ansible_host=YOUR_HOST ansible_port=22 ansible_user=YOUR_USER' deploy-vps.yml \
  --extra-vars 'app_dir=/opt/interactive-teaching' \
  -e domain=your.domain \
  -e certbot_email=you@example.com
```

Use SSH key with `-private-key` or `ansible_ssh_private_key_file` in inventory.

## Local Docker stack

```bash
cp .env.docker.example .env.local
# edit passwords and CORS_ORIGINS
docker compose --env-file .env.local up -d --build
```

`make mongo` still starts **only** the MongoDB service for local app development without the full stack.
