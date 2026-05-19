#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[1/2] Starting python-engine via Docker Compose..."
docker compose -f "$ROOT_DIR/python-engine/docker-compose.yml" up --build -d

echo "[2/2] Starting frontend + api via Vercel dev..."
cd "$ROOT_DIR"
npx vercel dev
