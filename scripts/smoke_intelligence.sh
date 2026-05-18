#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[smoke] running python engine tests"
python3 -m unittest discover -s "$ROOT_DIR/python-engine/tests" -p "test_*.py" -v

echo "[smoke] build check"
npm --prefix "$ROOT_DIR" run build >/dev/null

echo "[smoke] ok"
