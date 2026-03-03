# EDI Portal - 部署与数据库持久化

## 数据库持久化（PostgreSQL + Prisma）

项目使用 **Prisma** 与 **PostgreSQL** 做数据持久化。未配置 `DATABASE_URL` 时，应用会自动回退到内存存储（适合本地演示）。

### 1. 本地开发（使用数据库）

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **创建 `.env` 并配置数据库**
   ```bash
   cp .env.example .env
   ```
   在 `.env` 中填写：
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
   ```
   可使用 [Neon](https://neon.tech) 或 [Vercel Postgres](https://vercel.com/storage/postgres) 的免费 PostgreSQL。

3. **推送表结构并填充种子数据**
   ```bash
   pnpm db:push
   pnpm db:seed
   ```
   或使用迁移（推荐生产）：
   ```bash
   pnpm exec prisma migrate dev --name init
   pnpm db:seed
   ```

4. **启动开发服务器**
   ```bash
   pnpm dev
   ```

### 2. 部署到 Vercel

1. **将仓库连接到 Vercel**
   - 打开 [vercel.com](https://vercel.com) 并登录
   - Import 本 Git 仓库

2. **配置环境变量**
   - 在项目 **Settings → Environment Variables** 中添加：
   - `DATABASE_URL`：PostgreSQL 连接字符串（必填，用于持久化）

3. **创建数据库（若尚未创建）**
   - Vercel 仪表盘：Storage → Create Database → Postgres
   - 或使用 [Neon](https://neon.tech) 创建项目并复制连接串

4. **部署**
   - 推送代码后 Vercel 会自动构建并部署
   - 构建脚本已包含 `prisma generate`，无需额外配置

5. **首次部署后执行迁移与种子（二选一）**
   - **方式 A：在 Vercel 的 Build Command 中执行迁移（可选）**
     - 在 Vercel 项目 Settings → General → Build & Development Settings
     - Build Command 设为：`prisma generate && prisma migrate deploy && next build`
     - 之后每次部署会自动执行 `prisma migrate deploy`
   - **方式 B：本地或 CI 执行一次**
     ```bash
     DATABASE_URL="你的生产库连接串" pnpm db:push
     DATABASE_URL="你的生产库连接串" pnpm db:seed
     ```

### 3. 其他平台（Docker / 自建服务器）

- 确保 Node 版本 ≥ 18，并设置 `DATABASE_URL`。
- 构建：`pnpm build`（内部已包含 `prisma generate`）。
- 启动前执行：`pnpm db:migrate` 或 `pnpm db:push`，以及（仅首次）`pnpm db:seed`。
- 启动：`pnpm start`。

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `pnpm build` | 生成 Prisma Client 并构建 Next.js |
| `pnpm db:generate` | 仅生成 Prisma Client |
| `pnpm db:push` | 将 schema 推送到数据库（不生成迁移文件） |
| `pnpm db:migrate` | 执行已存在的迁移（生产环境） |
| `pnpm db:seed` | 执行种子脚本（UNIS 规范 + 可选初始数据） |

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | 使用 DB 时必填 | PostgreSQL 连接字符串 |
| `NEXT_PUBLIC_API_BASE_URL` | 否 | 前端请求的 API 根地址，默认 `/api` |
