# EDI Portal 全量测试用例（Open API 企业化版）

## 1. 测试范围

- OAuth2 Open API：token 签发、scope、吊销、过期、兼容策略。
- 业务接口：partners、certificates、specifications、transactions、notifications、integrations。
- 交易关联：`945↔940`、`856↔850`、`214↔204`。
- 平台能力：限流、配额、审计日志、trace_id、幂等。
- 前后端联调：关键页面真实后端数据、事务详情关联展示。

## 2. 环境前置

- 前端：`pnpm dev`（默认 `http://localhost:3000`）
- 后端：`pnpm dev:backend` 或 `cd backend && uvicorn app.main:app --reload`
- 数据库：开发默认 SQLite；建议联调 PostgreSQL
- 必要环境变量：
  - `AUTH_SECRET`
  - `DATABASE_URL`
  - `NEXT_PUBLIC_API_BASE_URL`
  - `CORS_ORIGINS`
  - `OAUTH_ACCESS_TOKEN_TTL_MINUTES`
  - `API_DAILY_QUOTA`, `API_MONTHLY_QUOTA`
  - `LOCAL_STORAGE_PATH`

## 3. 测试数据约定

- OAuth client A（只读）：`partners:read transactions:read`
- OAuth client B（读写）：`partners:read partners:write integrations:write transactions:read`
- 用户 A：`qa_user_a@example.com / Password1`
- Partner: `WMT/TGT/AMZN`
- 环境：`production/sandbox`

## 4. 详细测试矩阵

### 4.1 OAuth2 与认证

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| OAUTH-001 | client_credentials 成功签发 | 已创建 client | `POST /v1/oauth/token` | 200，返回 `access_token/token_type/expires_in/scope` |
| OAUTH-002 | grant_type 非法 | 无 | `grant_type=password` | 400 |
| OAUTH-003 | client_secret 错误 | 有 client_id | 错误 secret 请求 token | 401 |
| OAUTH-004 | 请求未授权 scope | client 仅 `partners:read` | 请求 `partners:write` | 403 |
| OAUTH-005 | token 吊销 | 已签发 token | `POST /v1/oauth/revoke` 后访问资源 | 后续访问 401 |
| OAUTH-006 | token 过期 | TTL 设置极短 | 等待过期后访问资源 | 401 |
| OAUTH-007 | OAuth 客户端 last_used_at 更新 | 已请求 token/接口 | 查库 | `last_used_at` 更新 |

### 4.2 Scope 与授权边界

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| SCOPE-001 | `partners:read` 读接口可用 | 拿只读 token | `GET /v1/partners` | 200 |
| SCOPE-002 | `partners:read` 写接口拒绝 | 同上 | `POST /v1/partners` | 403 |
| SCOPE-003 | `partners:write` 写接口可用 | 读写 token | `POST /v1/partners` | 200 |
| SCOPE-004 | 跨模块越权拦截 | 仅 `partners:*` | 调 `POST /v1/integrations/events` | 403 |
| SCOPE-005 | 内部 cookie 用户兼容访问 | 已登录 UI 用户 | 调业务接口 | 200（兼容模式） |

### 4.3 速率与配额

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| LIMIT-001 | 全局限流触发 | 限流阈值已知 | 高频请求同一路径 | 429，`code=RATE_LIMITED` |
| QUOTA-001 | 日配额触发 | `API_DAILY_QUOTA` 设小值 | OAuth 调用超过阈值 | 429（quota exceeded） |
| QUOTA-002 | 月配额触发 | `API_MONTHLY_QUOTA` 设小值 | 超阈值调用 | 429 |
| QUOTA-003 | 计数正确累计 | 有调用流量 | 查 `api_quotas` | daily/monthly 计数与调用量一致 |

### 4.4 审计与可观测

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| AUDIT-001 | OAuth 调用落审计日志 | OAuth 调用任意接口 | 查 `api_call_logs` | 新增记录含 `client_id/path/status/latency` |
| AUDIT-002 | trace_id 透传 | 调用带/不带 `x-trace-id` | 检查响应头 | 总有 `x-trace-id`，且与请求一致或自动生成 |
| AUDIT-003 | API key 调用也审计 | `x-api-key` 调用 integration | 查日志 | `auth_kind=api_key` 请求被记录 |

### 4.5 Integrations 推送与幂等

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| INT-001 | 单条推送成功（OAuth） | 有 `integrations:write` token | `POST /v1/integrations/events` | 200，返回 `transactionId` |
| INT-002 | 单条推送成功（x-api-key 兼容） | fallback 打开且 key 有效 | 同上 | 200 |
| INT-003 | 无效认证 | 无 token/key | 调用推送接口 | 401 |
| INT-004 | schema 缺失字段 | 缺 `docType` 等 | 调用推送接口 | 422 |
| INT-005 | 幂等重放 | 同 `idempotencyKey` 重发 | 两次调用 | 返回同一 `transactionId` |
| INT-006 | 二级去重 | 同 `externalEventId+sourceSystem` | 重发不同幂等键 | 直接命中已有事件 |
| INT-007 | 批量部分成功 | batch 内含非法项 | 调 `/events/batch` | 逐条结果，成功失败分离 |

### 4.6 交易关联规则

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| LINK-001 | `856 -> 850` 精确命中 | 先有 850，再推 856（poNo 一致） | 查 related | 命中上游 850，confidence 高 |
| LINK-002 | `945 -> 940` 精确命中 | 先有 940，再推 945（warehouseOrderNo 一致） | 查 related | 命中正确 |
| LINK-003 | `214 -> 204` 精确命中 | 先有 204，再推 214（loadNo/bolNo 一致） | 查 related | 命中正确 |
| LINK-004 | 时间窗外不关联 | 交易间隔超窗口天数 | 推送后查 related | 不建立链路 |
| LINK-005 | 多候选冲突 | 构造等分候选 | 推送后查结果 | 标记 ambiguous，不自动建链 |
| LINK-006 | 关联查询接口 | 有上下游链路 | `GET /v1/transactions/{id}/related` | upstream/downstream 正确 |

### 4.7 业务模块回归

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| TP-001 | Partner CRUD | 有读写权限 | 增删改查 | 正常 |
| CERT-001 | 证书上传下载 | 有写权限 | 上传 `.pem` 再下载 | 文件落盘并可下载 |
| SPEC-001 | 规格上传查询 | 有写权限 | 上传 TP spec，按类型过滤 | 正确返回 |
| TRX-001 | 交易列表筛选 | 有交易数据 | 组合筛选 | 结果正确 |
| NOTIF-001 | 通知已读/归档 | 有通知数据 | 标记已读/归档 | 状态更新正确 |

### 4.8 前后端联调

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| UI-001 | 登录进入 Dashboard | 前后端启动 | 登录 | 成功进入主页 |
| UI-002 | Transaction 详情关联侧栏 | 有关联交易 | 打开详情 | 显示 upstream/downstream，可跳转 |
| UI-003 | 通知轮询刷新 | 有新通知 | 等待 15-30s | 列表自动刷新 |
| UI-004 | 上传流程端到端 | 证书/规格上传 | 页面上传并刷新 | 数据与文件一致 |

### 4.9 安全负向

| ID | 场景 | 前置 | 步骤 | 期望 |
|---|---|---|---|---|
| SEC-001 | Bearer token 篡改 | 拿到有效 token | 修改 payload 后调用 | 401 |
| SEC-002 | 未授权访问写接口 | 只读 token | 调写接口 | 403 |
| SEC-003 | 请求体过大 | 配置请求体限制 | 发送超限 payload | 413/4xx |
| SEC-004 | 日志脱敏 | 模拟敏感字段 | 查日志输出 | 无 token/secret 明文 |

## 5. 自动化执行清单

后端自动化：
```bash
cd backend
.venv/bin/python -m pytest -q
```

当前基线结果：
- `24 passed`

前端 E2E（如需）：
```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

## 6. 执行顺序建议

1. 先跑后端单元/集成（阻断级）
2. 再跑 OAuth + Integration + Linking 专项
3. 最后跑前端联调与回归
