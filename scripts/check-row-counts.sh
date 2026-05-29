#!/usr/bin/env bash
# Compare row counts between local Neon DB and VPS production DB
# for every public table. Output is a side-by-side table.

set -euo pipefail

VPS_HOST="${VPS_HOST:-root@103.179.189.210}"
VPS_PASSWORD="${VPS_PASSWORD:-j9Jt72fe411gZ95O}"

# Pick all user tables (in dependency order roughly).
TABLES=(
  admins
  audit_events
  settings
  media_assets
  carousel_images
  ve_soliq_gallery_images
  articles
  projects
  partners
  pricing_packages
  faqs
  recruitment_posts
  recruitment_applications
  leads
  quote_requests
  quote_results
)

run_local() {
  local q="$1"
  npx --yes pg-cli >/dev/null 2>&1 || true
  node -e "
    require('dotenv').config({ path: '.env' });
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.query(process.argv[1]).then((r) => {
      console.log(r.rows.map((row) => Object.values(row).join('|')).join('\\n'));
      return pool.end();
    }).catch((err) => { console.error(err.message); process.exit(1); });
  " "$q"
}

run_vps() {
  local q="$1"
  sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=accept-new -o LogLevel=ERROR \
    "$VPS_HOST" "docker exec -i soliq-db-1 psql -U soliq -d soliq -t -A -c \"$q\""
}

printf '%-28s %12s %12s\n' 'TABLE' 'LOCAL' 'VPS'
printf '%-28s %12s %12s\n' '----' '-----' '---'

for t in "${TABLES[@]}"; do
  local_count=$(run_local "SELECT COUNT(*)::text FROM \"$t\"" 2>/dev/null || echo '?')
  vps_count=$(run_vps "SELECT COUNT(*) FROM \"$t\"" 2>/dev/null || echo '?')
  printf '%-28s %12s %12s\n' "$t" "${local_count:-?}" "${vps_count:-?}"
done
