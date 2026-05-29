# Deployment Notes

Sống tại **https://soliq.com.vn** (apex). `www` redirect sang apex.

## Stack hiện tại

```
soliq.com.vn (DNS A record → 103.56.161.186)
       ↓ port 80/443
   ┌─────────────┐
   │   Caddy 2.x │  ← auto Let's Encrypt SSL, redirect HTTP → HTTPS, www → apex
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

Tất cả chạy trong Docker Compose trên 1 VPS iNET.

## VPS (production hiện tại)

- IP: `103.56.161.186`
- Username: `root`
- **SSH port: `24700`** (KHÔNG phải 22)
- Auth: **SSH key** `~/.ssh/id_ed25519_soliq_vps` (không dùng password nữa)
- OS: Ubuntu 22.04 LTS
- Specs: 1 CPU / 2 GB RAM / 20 GB SSD
- Project path: `/root/soliq/`
- SSH vào máy: `ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186`
- Quản lý VPS: https://portal.inet.vn → Cloud Server → Instances (reset password, console, rebuild)

## Domain

- `soliq.com.vn` đăng ký tại **iNET (Việt Nam)** — gia hạn ở https://portal.inet.vn
- DNS hosted tại **iNET** (không thể đổi nameserver sang Cloudflare vì VNNIC ràng buộc với `.vn`)
- DNS records hiện tại:
  - `A @ → 103.56.161.186`
  - `A www → 103.56.161.186`
- TTL: 300s (5 phút) — thay đổi DNS sẽ propagate trong vài phút

## SSL

- **Caddy** tự cấp Let's Encrypt cert lần đầu khi DNS đã trỏ đúng IP
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
| `scripts/check-row-counts.sh` | So sánh số row mỗi bảng giữa local DB và VPS |
| `scripts/dump-pricing-page.ts` | Dump 1 nhóm pricing (gia-dinh/hoa-luoi/...) ra SQL |
| `scripts/seed-ve-soliq-gallery.ts` | Seed 29 ảnh mặc định vào ve_soliq_gallery_images |

## Deploy (cập nhật code lên VPS đang chạy)

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

### Cấu hình kết nối của deploy script

`scripts/deploy.sh` đọc các biến (có thể override qua env khi chạy):

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `VPS_HOST` | `root@103.56.161.186` | user@ip |
| `VPS_PORT` | `24700` | SSH port |
| `VPS_SSH_KEY` | `~/.ssh/id_ed25519_soliq_vps` | private key. Nếu file tồn tại → dùng key. |
| `VPS_PASSWORD` | (trống) | chỉ dùng nếu KHÔNG có key file (fallback sshpass) |
| `REMOTE_DIR` | `/root/soliq` | thư mục project trên VPS |

Ví dụ deploy lên một VPS khác tạm thời:
```bash
VPS_HOST=root@1.2.3.4 VPS_PORT=22 VPS_SSH_KEY=~/.ssh/id_ed25519 npm run deploy
```

## Env vars (`.env.vps`)

Cần các giá trị:
- `POSTGRES_*` — DB credentials trong Docker
- `APP_DATABASE_URL` — Web container connect tới DB qua hostname `db`
- `NEXT_PUBLIC_SITE_URL=https://soliq.com.vn`
- `APP_ADMIN_SESSION_SECRET` — random 64 hex chars
- `SMTP_*` — Gmail SMTP để gửi email thông báo (App Password). Hiện gửi từ `phuquyland.service@gmail.com`.
- `CLOUDFLARE_*` — để trống (DNS không qua Cloudflare nên không có cache để purge)

## Email thông báo (gửi & nhận — KHÁC NHAU)

- **Gửi từ (sender)**: cấu hình ở `.env.vps` → `SMTP_USER` / `SMTP_FROM` / `SMTP_PASSWORD`.
  Đổi email gửi: tạo Gmail App Password mới (cần bật 2FA) tại
  https://myaccount.google.com/apppasswords → cập nhật 3 biến → `npm run deploy`
  (hoặc chỉ scp `.env.vps` → `.env` + `docker compose up -d --force-recreate web`).
- **Nhận thông báo (recipients)**: cấu hình trong DB qua trang `/admin/site-config`
  (`notificationEmails`). Khi có người submit form, mail gửi TỪ sender TỚI các recipient này.
- ⚠️ Server actions PHẢI `await` hàm notify trước khi return. Nếu fire-and-forget
  (không await), Next standalone runtime cắt promise SMTP giữa chừng → mail không gửi
  dù form báo thành công. Đã fix trong `contact.ts` và `quote.ts`.

## Database

- Postgres chạy trong container, data lưu ở volume `postgres_data`
- Schema thay đổi (thêm bảng/cột): apply qua `drizzle-kit push` từ local trỏ vào DB đích,
  HOẶC apply file SQL trong `drizzle/*.sql` trực tiếp:
  ```bash
  ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186 \
    "docker exec -i soliq-db-1 psql -U soliq -d soliq" < drizzle/0010_ve_soliq_gallery.sql
  ```
- Mở psql:
  ```bash
  ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186 \
    "docker exec -it soliq-db-1 psql -U soliq -d soliq"
  ```
- Backup DB:
  ```bash
  ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186 \
    "docker exec soliq-db-1 pg_dump -U soliq soliq | gzip" > backup-$(date +%F).sql.gz
  ```

## Admin login

- URL: https://soliq.com.vn/admin/login
- User đầu tiên seed qua `scripts/seed.ts` (chạy local với `DATABASE_URL` trỏ về production)

---

# 🚚 Migrate sang VPS MỚI (làm lại từ đầu trên server trống)

Quy trình đầy đủ đã dùng khi chuyển từ Cloudfly (103.179.189.210) sang iNET
(103.56.161.186). Làm theo thứ tự, **giữ VPS cũ chạy** đến khi VPS mới ổn rồi
mới tắt — để rollback DNS được nếu có sự cố.

### B1. Lấy quyền truy cập VPS mới
1. Mua VPS, vào portal nhà cung cấp lấy/reset **root password** + ghi nhớ **SSH port**.
2. Tạo key riêng (nếu chưa có): `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_soliq_vps -N ""`
3. Cài public key vào VPS mới (thay PORT/IP):
   ```bash
   sshpass -p '<root_password>' ssh-copy-id -i ~/.ssh/id_ed25519_soliq_vps.pub -p <PORT> root@<NEW_IP>
   ```
4. Test: `ssh -i ~/.ssh/id_ed25519_soliq_vps -p <PORT> root@<NEW_IP> "echo OK"`
5. Reset lại root password lần nữa ở portal nếu password đã bị lộ.

### B2. Cài Docker trên VPS mới
```bash
ssh -i ~/.ssh/id_ed25519_soliq_vps -p <PORT> root@<NEW_IP> \
  "curl -fsSL https://get.docker.com | sh && docker --version && docker compose version"
```
Docker service auto-enable (tự chạy khi reboot).

### B3. Trỏ deploy script sang VPS mới
Sửa phần `# ─── Config ───` trong `scripts/deploy.sh`:
- `VPS_HOST="root@<NEW_IP>"`
- `VPS_PORT="<PORT>"`
- `VPS_SSH_KEY="$HOME/.ssh/id_ed25519_soliq_vps"`

### B4. Deploy lần đầu (tạo stack)
```bash
npm run deploy
```
Lần đầu web sẽ **unhealthy** vì DB trống (chưa có bảng) — đó là bình thường,
qua B5 sẽ hết.

### B5. Migrate dữ liệu từ VPS cũ → VPS mới

**Database:**
```bash
# Dump từ VPS cũ (dùng cách auth của VPS cũ — vd password)
sshpass -p '<OLD_PASS>' ssh root@<OLD_IP> \
  "docker exec soliq-db-1 pg_dump -U soliq -d soliq --clean --if-exists" > /tmp/db.sql

# Restore vào VPS mới
ssh -i ~/.ssh/id_ed25519_soliq_vps -p <PORT> root@<NEW_IP> \
  "docker exec -i soliq-db-1 psql -U soliq -d soliq" < /tmp/db.sql
```

**Uploads (ảnh admin upload — volume `soliq_uploads_data`):**
```bash
# Tar từ VPS cũ
sshpass -p '<OLD_PASS>' ssh root@<OLD_IP> \
  "docker run --rm -v soliq_uploads_data:/data -w /data busybox tar czf - ." > /tmp/uploads.tar.gz

# Extract vào VPS mới
ssh -i ~/.ssh/id_ed25519_soliq_vps -p <PORT> root@<NEW_IP> \
  "docker run --rm -i -v soliq_uploads_data:/data -w /data busybox tar xzf -" < /tmp/uploads.tar.gz
```

### B6. Restart web để nhận DB đã có bảng
```bash
ssh -i ~/.ssh/id_ed25519_soliq_vps -p <PORT> root@<NEW_IP> \
  "cd /root/soliq && docker compose up -d --force-recreate web proxy"
```
Verify (chưa cần DNS):
```bash
ssh -i ~/.ssh/id_ed25519_soliq_vps -p <PORT> root@<NEW_IP> \
  "curl -sS -o /dev/null -w 'web HTTP %{http_code}\n' http://127.0.0.1:13000/"
```

### B7. Đổi DNS sang IP mới
- portal.inet.vn → `soliq.com.vn` → Bản ghi → sửa `A @` và `A www` → `<NEW_IP>`
- Chờ propagate (vài phút), kiểm tra: `dig +short soliq.com.vn @8.8.8.8`
- Caddy tự xin Let's Encrypt cert NGAY khi DNS trỏ đúng. Nếu chậm, restart proxy:
  ```bash
  ssh -i ~/.ssh/id_ed25519_soliq_vps -p <PORT> root@<NEW_IP> \
    "cd /root/soliq && docker compose restart proxy"
  ```
- Verify: `curl -sS -o /dev/null -w '%{http_code} ssl=%{ssl_verify_result}\n' https://soliq.com.vn/`
  (mong đợi `200 ssl=0`)

### B8. So sánh data + tắt VPS cũ
```bash
./scripts/check-row-counts.sh   # so sánh local vs VPS (sửa IP/key trong script nếu cần)
```
Khi chắc chắn VPS mới ổn → tắt stack VPS cũ:
```bash
sshpass -p '<OLD_PASS>' ssh root@<OLD_IP> "cd /root/soliq && docker compose down"
```
Đừng huỷ hẳn VPS cũ ngay — giữ vài ngày phòng rollback.

## Troubleshooting

### Site không lên / SSL lỗi
```bash
ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186 \
  "cd /root/soliq && docker compose logs proxy --tail 50"
```
ACME challenge fail thường do DNS chưa trỏ đúng IP (Let's Encrypt validate từ
ngoài Internet — phải đợi propagate). Restart proxy để thử lại ngay.

### Web container không healthy
```bash
ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186 \
  "cd /root/soliq && docker compose logs web --tail 100"
```
Lỗi `relation "..." does not exist` = DB chưa có bảng → cần migrate DB (B5).

### Form submit thành công nhưng không nhận mail
- Kiểm tra `notificationEmails` trong `/admin/site-config` có địa chỉ nhận không.
- Kiểm tra SMTP từ trong container:
  ```bash
  ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186 \
    "docker exec soliq-web-1 sh -c 'echo \$SMTP_USER \$SMTP_FROM'"
  ```
- Test outbound SMTP port (một số nhà cung cấp chặn 587/465/25):
  ```bash
  ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186 \
    "for p in 587 465 25; do timeout 8 bash -c \"</dev/tcp/smtp.gmail.com/\$p\" && echo \$p OPEN || echo \$p BLOCKED; done"
  ```
- Check mail trong Spam của hộp thư nhận.

### Hết dung lượng disk
```bash
ssh -i ~/.ssh/id_ed25519_soliq_vps -p 24700 root@103.56.161.186 "docker system prune -af"
```
(Không xoá volume đang dùng: `postgres_data`, `uploads_data`, `caddy_data`)

## Rollback

- **Code**: mỗi deploy nên commit git → `git revert` hoặc checkout commit cũ rồi `npm run deploy`.
- **Server**: nếu VPS mới lỗi sau khi đổi DNS, đổi DNS A record về IP VPS cũ (vẫn còn chạy).

## Lịch sử thay đổi quan trọng

- **Initial**: Deploy lên MiniPC tại nhà qua Cloudflare Tunnel (`soliq.solarcheck.best`)
- **2026-05-26**: Migrate sang VPS Cloudfly (`soliq2.solarcheck.best` qua Cloudflare Tunnel)
- **2026-05-29**: Domain chính `soliq.com.vn`, DNS iNET trỏ A record về VPS Cloudfly (103.179.189.210), Caddy + Let's Encrypt thay tunnel.
- **2026-05-29 (sau)**: Migrate sang VPS iNET mới `103.56.161.186` (SSH port 24700, auth bằng key). Đổi email gửi sang `phuquyland.service@gmail.com`. Fix bug notify mail (await thay vì fire-and-forget).
