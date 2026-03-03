#!/usr/bin/env bash
# EDI Portal - 后端启动脚本（LaunchAgent 开机自启用）
set -e
ROOT="/Users/sheliasun/Projects/edi-portal-prototype"
cd "$ROOT/backend"
exec .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
