# Deployment Notes

Sống tại **https://soliq.com.vn** (apex). `www` redirect sang apex.

## Stack hiện tại

```
soliq.com.vn (DNS A record → 103.179.189.210)
       ↓ port 80/443
   ┌─────────────┐
   │   Caddy 2.8 │  ← auto Let's Encrypt SSL, redirect HTTP → HTTPS, www → apex
   └──────┬──────┘
          │ Docker network app_net
          ↓
   ┌─────────────────────────┐
   │ web (Next.js standalone)│  ← container `soliq-web-1`, port 3000 internal
   └──────┬──────────────────┘
          ↓
   ┌─────────────────────────┐
   │ db (Postgres 16)        │  ← container `soliq-db-1`, port 5432 internal
   └─────────────────────────┘
```

Tất cả chạy trong Docker Compose trên 1 VPS Cloudfly.

## VPS

- IP: `103.179.189.210`
- Username: `root`
- Password: lưu trong dashboard Cloudfly (đừng commit)
- OS: Ubuntu 24.04
- Specs: 1 CPU / 1.5 GB RAM / 20 GB SSD
- Project path: `/root/soliq/`
- SSH: `ssh root@103.179.189.210`

## Domain

- `soliq.com.vn` đăng ký tại **iNET (Việt Nam)** — gia hạn ở https://portal.inet.vn
- DNS hosted tại **iNET** (không thể đổi nameserver sang Cloudflare vì VNNIC ràng buộc với `.vn`)
- DNS records hiện tại:
  - `A @ → 103.179.189.210`
  - `A www → 103.179.189.210`
- TTL: 300s (5 phút) — thay đổi DNS sẽ propagate trong vài phút

## SSL

- **Caddy 2.8** tự cấp Let's Encrypt cert lần đầu khi truy cập
- Auto-renew, không cần làm gì
- Cert lưu ở Docker volume `caddy_data`

## Files quan trọng

| File | Mục đích |
|---|---|
| `docker-compose.yml` | Stack definition (db + web + proxy) |
| `deploy/minipc/Caddyfile` | Caddy reverse proxy + SSL config |
| `Dockerfile` | Build Next.js standalone image |
| `.env.vps` | Production env vars (gitignored) |
| `.env.vps.example` | Template cho env vars |
| `scripts/deploy.sh` | Build amd64 image trên Mac → upload → restart container |

## Deploy

```bash
# Build + transfer + restart (full deploy)
npm run deploy

# Skip build nếu chưa đổi code
npm run deploy:fast

# Chỉ restart container (không build)
./scripts/deploy.sh --no-build
```

Script tự động:
1. Build Docker image cho linux/amd64 trên Mac (cross-build, ~2-3 phút)
2. Upload `docker-compose.yml`, `.env.vps` → `.env`, `Caddyfile` qua scp
3. Save image, gzip, transfer qua SSH (~30s)
4. `docker compose up -d --force-recreate web proxy` trên VPS
5. Health check, prune image cũ

## Env vars (`.env.vps`)

Cần các giá trị:
- `POSTGRES_*` — DB credentials trong Docker
- `APP_DATABASE_URL` — Web container connect tới DB qua hostname `db`
- `NEXT_PUBLIC_SITE_URL=https://soliq.com.vn`
- `APP_ADMIN_SESSION_SECRET` — random 64 hex chars
- `SMTP_*` — Gmail SMTP để gửi email thông báo (App Password)
- `CLOUDFLARE_*` — để trống (DNS không qua Cloudflare nên không có cache để purge)

## Database

- Postgres chạy trong container, data lưu ở volume `postgres_data`
- Migration apply tự động qua `drizzle-kit push` — chạy thủ công nếu cần:
  ```bash
  ssh root@103.179.189.210 "docker exec -it soliq-db-1 psql -U soliq -d soliq"
  ```
- Backup volume:
  ```bash
  ssh root@103.179.189.210 "docker exec soliq-db-1 pg_dump -U soliq soliq | gzip" > backup-$(date +%F).sql.gz
  ```

## Admin login

- URL: https://soliq.com.vn/admin/login
- User đầu tiên seed qua `scripts/seed.ts` (chạy local với `DATABASE_URL` trỏ về production)

## Cập nhật DNS (đổi server / IP)

1. Vào https://portal.inet.vn → đăng nhập
2. Danh sách dịch vụ → row `soliq.com.vn` → click button **"Bản ghi"**
3. Sửa A record: `@` và `www` → IP mới
4. TTL = 5 phút → propagate nhanh
5. Caddy sẽ tự re-issue cert nếu cần

## Cập nhật SMTP / email config

Sửa `.env.vps` → chạy `npm run deploy` → file mới được scp lên VPS, container restart sẽ load env mới.

## Troubleshooting

### Site không lên / SSL lỗi
```bash
ssh root@103.179.189.210 "cd /root/soliq && docker compose logs proxy --tail 50"
```
Caddy log sẽ chỉ ra cert issue (rate limit, DNS chưa đúng, port 80/443 bị firewall block).

### Web container không healthy
```bash
ssh root@103.179.189.210 "cd /root/soliq && docker compose logs web --tail 100"
```

### Quên password admin
Connect DB và update trực tiếp (password hash dùng bcrypt):
```bash
ssh root@103.179.189.210 "docker exec -it soliq-db-1 psql -U soliq -d soliq -c \"SELECT email FROM admins;\""
```

### Hết dung lượng disk
```bash
ssh root@103.179.189.210 "docker system prune -af --volumes"
```
(Cẩn thận: lệnh này xoá cả unused volumes — không xoá `postgres_data`, `uploads_data`, `caddy_data` đang in use)

## Rollback

Mỗi deploy commit lên git → rollback bằng cách `git revert` hoặc checkout commit cũ rồi `npm run deploy`.

Image cũ trên VPS bị `docker image prune -f` xoá sau mỗi deploy → không có rollback nhanh từ image. Nếu cần keep N image gần nhất, sửa `scripts/deploy.sh` bỏ phần prune.

## Lịch sử thay đổi quan trọng

- **Initial**: Deploy lên MiniPC tại nhà qua Cloudflare Tunnel (`soliq.solarcheck.best`)
- **2026-05-26**: Migrate sang VPS Cloudfly (`soliq2.solarcheck.best` qua Cloudflare Tunnel)
- **2026-05-29**: Domain chính `soliq.com.vn`, DNS iNET trỏ A record về VPS, Caddy + Let's Encrypt thay tunnel. Tắt staging `soliq2.solarcheck.best`.
