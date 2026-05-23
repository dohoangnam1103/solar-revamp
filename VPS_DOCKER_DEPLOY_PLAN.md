# VPS Ubuntu Docker Deploy Plan

Date: 2026-05-23
Scope: audit only, no implementation.

## Current State

- App is a Next.js 16 App Router project with server actions, cookies, admin pages, `next/image`, sitemap, robots, and DB-backed lead/quote/admin flows.
- Existing deploy setup targets Cloudflare Workers/OpenNext:
  - `open-next.config.ts`
  - `wrangler.jsonc`
  - `wrangler.worker.jsonc`
  - package scripts `cf:build`, `cf:preview`, `cf:deploy`
  - dependency `@opennextjs/cloudflare`
- There is currently no root `Dockerfile`, `docker-compose.yml`, `.dockerignore`, nginx/caddy config, or VPS deploy script.
- Current DB driver is Neon-specific:
  - `src/lib/db/index.ts` uses `@neondatabase/serverless` and `drizzle-orm/neon-http`.
  - `scripts/migrate.ts` also uses Neon HTTP migrator.
- `package.json` already has standard Node deploy scripts:
  - `build`: `next build`
  - `start`: `next start`
- `next.config.ts` is currently empty. It does not enable standalone output.

## Recommended VPS Architecture

Use a normal Node.js Next server inside Docker, not OpenNext/Cloudflare.

Recommended production shape:

- `nginx` or `caddy` on VPS as public reverse proxy.
- `web` Docker container running Next standalone server on internal port `3000`.
- `postgres` Docker container if we want DB fully on VPS.
- Optional `backup` cron/systemd job for Postgres dumps.
- Optional Cloudflare DNS/proxy in front of VPS for CDN/WAF, but not Cloudflare Workers.

Request path:

`Internet -> Cloudflare DNS/proxy optional -> nginx/caddy :443 -> web container :3000 -> Postgres`

## Main Decision: Database

### Option A: Keep Neon Postgres

Least code change.

Needed:

- Keep `@neondatabase/serverless`.
- Keep `src/lib/db/index.ts` unchanged.
- Keep `scripts/migrate.ts` mostly unchanged.
- Put Neon `DATABASE_URL` into VPS `.env.production`.
- Docker only needs the Next app container.

Pros:

- Fastest migration from Cloudflare plan to VPS.
- No DB backup/upgrade burden on VPS.
- Existing code and migration script continue to match the DB driver.

Cons:

- App still depends on Neon external network.
- VPS is not fully self-contained.

### Option B: Move Postgres Into Docker On VPS

More self-contained, but requires code/dependency changes.

Needed changes:

- Add `pg` dependency.
- Change `src/lib/db/index.ts` from Neon HTTP driver to Node Postgres driver:
  - `drizzle-orm/node-postgres`
  - `pg` `Pool`
- Change `scripts/migrate.ts` to use `drizzle-orm/node-postgres/migrator`.
- Update `DATABASE_URL` to internal Docker host:
  - `postgresql://soliq:<password>@postgres:5432/soliq`
- Add `postgres` service and persistent volume in `docker-compose.yml`.
- Add backup plan before production use.

Pros:

- Fully controlled on VPS.
- Lower latency between app and DB.

Cons:

- More code and ops changes.
- Need backups, monitoring, upgrades, restore testing.

Recommendation: start with Option A if goal is to move web hosting quickly. Choose Option B only if we explicitly want the VPS to own database operations too.

## Required App/Config Changes For Docker

### 1. Enable Next Standalone Output

Need to update `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: 'standalone',
}
```

Reason:

- Next docs recommend `output: 'standalone'` for Docker because it emits `.next/standalone/server.js` plus traced runtime dependencies.
- Docker image can copy only the standalone server, `public`, and `.next/static`.

### 2. Add Dockerfile

Need a multi-stage production Dockerfile:

- `deps` stage: `npm ci`
- `builder` stage: `npm run build`
- `runner` stage:
  - copy `.next/standalone`
  - copy `.next/static`
  - copy `public`
  - run `node server.js`
  - set `HOSTNAME=0.0.0.0`
  - expose `3000`

Notes:

- Use Node LTS image. For Next 16, use a recent Node version that satisfies the installed Next package.
- Include `sharp` runtime support already present in dependency tree through Next/image; use Debian slim unless we intentionally optimize Alpine native deps.

### 3. Add `.dockerignore`

Should exclude:

- `node_modules`
- `.next`
- `.open-next`
- `.git`
- local screenshots/temp files
- `.env`
- logs
- OS/editor files

Reason:

- Avoid copying Cloudflare build output and secrets into Docker build context.

### 4. Add Compose For VPS

If keeping Neon:

- `web` only.
- Pass `DATABASE_URL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, analytics vars.
- Bind internal `3000`, expose only through reverse proxy.

If using local Postgres:

- `web`
- `postgres`
- named volume `postgres_data`
- healthcheck for Postgres
- web depends on DB health
- migration command/process defined separately, not hidden inside app boot unless we accept deploy-time DB mutation.

### 5. Replace Cloudflare Runtime Assumptions

No current application code appears to require Cloudflare Worker bindings directly.

Keep or remove:

- Keep `wrangler*.jsonc`, `open-next.config.ts`, and `cf:*` scripts if we want a fallback Cloudflare target.
- Remove them later only if VPS becomes the only deploy target.

Must change:

- Production deploy docs and scripts should use Docker, not `cf:deploy`.
- `.env.example` should remove Cloudflare-only vars from the default VPS path or split env examples:
  - `.env.example`
  - `.env.vps.example`
  - optional `.env.cloudflare.example`

### 6. Runtime Env Notes

Important Next behavior:

- Server-only envs can be read at runtime.
- `NEXT_PUBLIC_*` envs are inlined into client bundles during `next build`.

Implication:

- For Docker images promoted across environments, avoid relying on changing `NEXT_PUBLIC_*` at container runtime unless the page reads them server-side dynamically.
- For this project, build the image with the production public values:
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_SITE_NAME`
  - `NEXT_PUBLIC_GTM_ID`
  - `NEXT_PUBLIC_META_PIXEL_ID`

Server runtime envs:

- `DATABASE_URL`
- `ADMIN_PASSWORD`

### 7. Reverse Proxy

Need nginx or caddy config.

Requirements:

- TLS certificate.
- Proxy to `web:3000` or `127.0.0.1:<mapped-port>`.
- Forward headers:
  - `Host`
  - `X-Forwarded-Proto`
  - `X-Forwarded-For`
- Set reasonable body size limits.
- Disable proxy buffering if streaming/Suspense issues appear.
- Add basic rate limiting for admin login/contact/quote routes if needed.

### 8. Persistent Cache And Multi-Instance Notes

For a single VPS container:

- Default Next cache on local filesystem is acceptable.
- `revalidatePath` should work within one running instance.

If running multiple `web` containers:

- Need shared cache or accept inconsistent cache after admin edits.
- Need stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` across builds/instances.
- Consider `deploymentId` to reduce version skew during rolling deploys.

Initial recommendation:

- Run one `web` container first.
- Avoid multi-instance until traffic requires it.

## Database Migration Plan

### If Keeping Neon

- Keep existing migrations.
- Run migrations from CI/VPS manually:

```bash
npm run db:push
# or
npx tsx scripts/migrate.ts
```

Need to verify which migration path is canonical, because both Drizzle Kit and custom `scripts/migrate.ts` exist.

### If Moving To Local Postgres

Plan code changes:

- Install `pg`.
- Change DB driver and migrator to Node Postgres.
- Test migrations against Docker Postgres locally.
- Seed settings with `npm run db:seed`.
- Backup before any production migration.

Plan data migration from Neon to VPS Postgres:

1. `pg_dump` Neon DB.
2. Restore into VPS Postgres container.
3. Run app against restored DB.
4. Compare row counts for:
   - `leads`
   - `quote_requests`
   - `quote_results`
   - `articles`
   - `partners`
   - `projects`
   - `settings`
   - `audit_events`

## Security/Production Checklist

- Set strong `ADMIN_PASSWORD`.
- Admin cookie currently only sets `httpOnly`, `maxAge`, and `path`.
  - For HTTPS production, consider adding `secure: true` and `sameSite: 'lax'`.
- Review admin auth before public launch; current password-only session is MVP-level.
- Ensure `.env` is never copied into image or committed.
- Restrict database network exposure. Postgres should not bind publicly.
- Add VPS firewall:
  - allow `22`, `80`, `443`
  - deny direct app/db ports
- Add DB backups and restore test.
- Set log rotation for Docker.
- Add uptime check for `/`.
- Consider basic rate limiting for contact and quote submissions.

## Files Likely To Be Added

No implementation done yet. Expected files if we proceed:

- `Dockerfile`
- `.dockerignore`
- `docker-compose.yml`
- `.env.vps.example`
- `deploy/vps/nginx.conf` or `deploy/vps/Caddyfile`
- `deploy/vps/README.md`
- optional `scripts/deploy-vps.sh`
- optional `scripts/backup-postgres.sh`

## Files Likely To Be Edited

No implementation done yet. Expected edits if we proceed:

- `next.config.ts`
  - add `output: 'standalone'`
  - optionally `deploymentId`
- `package.json`
  - optional `docker:*` scripts
  - optional remove/separate Cloudflare scripts later
  - add `pg` only if using local Postgres
- `src/lib/db/index.ts`
  - only if moving from Neon to local Postgres
- `scripts/migrate.ts`
  - only if moving from Neon to local Postgres
- `.env.example`
  - split VPS/Cloudflare env documentation
- `README.md`
  - add VPS Docker runbook

## Validation Plan Before Deploy

Do this only when implementation is approved:

1. Build Docker image locally.
2. Run app container locally with production env.
3. Verify:
   - `/`
   - `/bao-gia-dien-mat-troi`
   - quote submission
   - `/admin/login`
   - `/admin/leads`
   - `/sitemap.xml`
   - `/robots.txt`
4. Verify static assets:
   - logo SVGs
   - hero images
   - project carousel images
5. Verify `next/image` optimized routes work inside container.
6. If local Postgres:
   - run migrations
   - seed settings
   - submit a quote
   - confirm rows in DB.
7. Deploy to VPS staging domain.
8. Put reverse proxy/TLS in front.
9. Run smoke test through public HTTPS domain.

## Open Questions Before Implementation

1. Do we keep Neon Postgres, or move Postgres into Docker on VPS?
2. Which domain should `NEXT_PUBLIC_SITE_URL` use on VPS?
3. Should Cloudflare remain DNS/CDN in front of VPS?
4. Do we want nginx or caddy?
5. Should VPS deploy be manual `docker compose pull/up`, or automated through GitHub Actions/registry?

## Recommended First Implementation Slice

If approved, implement in this order:

1. Add Docker standalone setup while keeping Neon.
2. Add VPS compose and reverse-proxy docs.
3. Verify full app in local Docker.
4. Deploy to VPS staging.
5. Only then decide whether to migrate DB from Neon to VPS Postgres.
