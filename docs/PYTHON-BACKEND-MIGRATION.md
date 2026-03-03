# Python Backend Migration Guide

## Goal
Replace legacy Next.js API routes with FastAPI backend (`/v1/*`) while keeping existing frontend UI.

## Environment Variables

### Frontend (`.env`)
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

### Backend (`backend/.env`)
- `DATABASE_URL=sqlite:///./dev.db` (or PostgreSQL URL)
- `AUTH_SECRET=replace-with-long-random-secret`
- `COOKIE_NAME=edi_session`
- `CSRF_COOKIE_NAME=edi_csrf`
- `CSRF_HEADER_NAME=x-csrf-token`
- `COOKIE_SECURE=false`
- `COOKIE_SAMESITE=lax`
- `CORS_ORIGINS=http://localhost:3000`
- `EMAIL_MODE=mock`
- `LOCAL_STORAGE_PATH=./storage`
- `SMTP_HOST=localhost`
- `SMTP_PORT=25`
- `SMTP_USERNAME=`
- `SMTP_PASSWORD=`
- `SMTP_USE_TLS=false`
- `SMTP_FROM=no-reply@localhost`
- `INTEGRATION_API_KEYS=dev-integration-key`
- `LINKING_TIME_WINDOW_DAYS=7`

## Local Startup
1. Install frontend deps: `pnpm install`
2. Install backend deps: `python3 -m pip install -r backend/requirements.txt`
3. Start frontend: `pnpm dev`
4. Start backend: `pnpm dev:backend`
5. Optional one-shot initialization: `pnpm backend:init`

## API Cutover Status
- Frontend calls Python backend via `lib/api-client.ts` and `/v1/*` routes.
- Legacy Next.js `/api/*` endpoints are blocked by middleware and return `410`.
- `/api/health` remains for frontend host health checks.

## Validation Checklist
- `pnpm test:backend` passes.
- Register/Login works and sets cookies.
- Protected mutation without CSRF header returns 403.
- Repeated requests on same endpoint beyond rate window return 429.
- Dashboard loads via `/v1/auth/me` session check.
- Certificate/specification uploads generate files under local storage path.
- External systems can push events to `/v1/integrations/events` using `x-api-key`.
- Transaction related links are available at `/v1/transactions/{id}/related`.

## Rollback Plan
1. Set frontend API base back to Next runtime by restoring old client base and request paths.
2. Remove/disable middleware deprecating `/api/*`.
3. Restart frontend and verify old `/api/*` routes respond.
4. Keep FastAPI service running in shadow mode for comparison until stable.

## Notes
- For production, switch `DATABASE_URL` to PostgreSQL and run Alembic migrations.
- Email verification currently uses `EMAIL_MODE=mock` and prints verification tokens to backend logs.
