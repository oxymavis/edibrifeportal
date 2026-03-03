# PRD Implementation Status (Python Backend Migration)

Date: 2026-03-02

## Completed
- Authentication with persistent users (`/v1/auth/register`, `/v1/auth/login`, `/v1/auth/logout`, `/v1/auth/me`)
- 24h session + remember me 30d (JWT + HttpOnly cookie)
- CSRF protection for all protected mutation endpoints
- Partners hierarchy CRUD (Partner > Subsidiary > AS2)
- Subsidiary message routing APIs + validation
- Certificates CRUD with file extension validation and status derivation
- Certificates now persist uploaded files to local disk and support download endpoint
- Specifications (UNIS + TP) retrieval and TP create/version history record
- Specifications now support multipart upload to local disk and download endpoint
- Transactions create/list/detail
- Notifications list/detail/read/mark-all-read/archive updates
- Partner detail "Specifications" tab now backed by live TP specification APIs (no static sample data)
- Certificates upload form now calls backend API and persists metadata/status updates
- Overview dashboard now loads live counts and recent activity from backend APIs
- Email verification now supports `mock` and SMTP modes
- External integration ingestion APIs implemented (`/v1/integrations/events`, `/v1/integrations/events/batch`)
- Transaction linking engine implemented for `945->940`, `856->850`, `214->204`
- Transaction related query API implemented (`/v1/transactions/{id}/related`)
- Transaction detail modal now displays related documents (upstream/downstream)
- Next.js legacy `/api/*` endpoints deprecated via middleware (410), `/api/health` retained
- Backend test suite (auth/security/domain flows)

## In Progress / Partial
- Frontend full E2E automation suite (critical path currently covered by backend integration tests)
- Complete UI wiring for all routing management interactions in every modal variation
- Production-grade deployment hardening (reverse proxy, TLS termination, observability stack)

## Not in Scope (per PRD)
- RBAC
- Multi-tenancy
- Advanced analytics dashboards
