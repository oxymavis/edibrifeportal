# UNIS EDI Portal

B2B EDI 管理平台：交易伙伴、证书、报文规范、交易与通知管理。

## 技术栈

- **前端**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **后端**: FastAPI + SQLAlchemy + Alembic（Python）
- **数据**: PostgreSQL

## 快速开始

```bash
pnpm install
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd ..
pnpm dev
pnpm dev:backend
```

浏览器打开 http://localhost:3000，后端默认 http://localhost:8000。

注意：Next.js 旧 `/api/*` 端点已下线（返回 `410`），仅保留 `/api/health` 用于前端宿主健康检查。

## 数据库

1. 复制根目录 `.env.example` 并填写 `DATABASE_URL`、`NEXT_PUBLIC_API_BASE_URL`。
2. 复制 `backend/.env.example` 为 `backend/.env`，填写 `DATABASE_URL`、`AUTH_SECRET`、`CORS_ORIGINS`。
3. 启动后端时自动建表和注入基础种子数据。

## 部署与发布

详见 **[docs/DEPLOY.md](docs/DEPLOY.md)**，包含：

- 环境变量说明
- 本地开发与生产构建
- **Vercel 部署**（推荐）：连接仓库、配置 Vercel Postgres 或 Neon、部署步骤
- 其他平台（Docker / 自托管）简要说明

OpenAPI 平台运维（本地双环境 + 压测）请看：
- **[docs/OPENAPI-OPS-RUNBOOK.md](docs/OPENAPI-OPS-RUNBOOK.md)**
- **[docs/openapi/WHITELIST-CANARY-ROLLOUT.md](docs/openapi/WHITELIST-CANARY-ROLLOUT.md)**
- **[docs/openapi/SLO-DASHBOARD-METRICS.md](docs/openapi/SLO-DASHBOARD-METRICS.md)**
- **[docs/openapi/TEST-CASES-ENTERPRISE.md](docs/openapi/TEST-CASES-ENTERPRISE.md)**
- **[deploy/nginx/openapi-gateway.conf](deploy/nginx/openapi-gateway.conf)**
- 一键启动双环境：`docker compose -f docker-compose.openapi.yml up -d --build`

## 脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 开发服务器 |
| `pnpm build` | 生产构建（含 `prisma generate`） |
| `pnpm start` | 生产启动 |
| `pnpm dev:backend` | 启动 FastAPI 后端 |
| `pnpm test:backend` | 运行后端 pytest |

## 需求与规格

- [docs/Functional-Specification.md](docs/Functional-Specification.md) — 功能规格
- [docs/PRD.md](docs/PRD.md) — 产品需求
- [docs/DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md) — 详细开发文档（架构、模型、流程、联调）
- [docs/API-REFERENCE.md](docs/API-REFERENCE.md) — 接口文档（请求/响应/示例/错误码）
