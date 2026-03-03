#!/usr/bin/env bash
# EDI Portal - 前端启动脚本（LaunchAgent 开机自启用）
set -e
ROOT="/Users/sheliasun/Projects/edi-portal-prototype"
export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$PATH"
cd "$ROOT"
exec pnpm run dev
