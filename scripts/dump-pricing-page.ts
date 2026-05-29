/**
 * Dump rows of pricing_packages for a specific page identifier (gia-dinh,
 * doanh-nghiep, hoa-luoi, hybrid, vat-tu) into stdout as a SQL file you can
 * pipe straight into the production psql.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/dump-pricing-page.ts hoa-luoi > /tmp/hoa-luoi.sql
 */
import { Pool } from 'pg'
import { loadEnvFile } from './lib/load-env'

loadEnvFile()

const page = process.argv[2]
if (!page) {
  console.error('Usage: tsx scripts/dump-pricing-page.ts <page-id>')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function lit(value: string | number | boolean | null) {
  if (value === null) return 'NULL'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  return `'${String(value).replace(/'/g, "''")}'`
}

async function main() {
  const rows = (
    await pool.query(
      'SELECT page, category, sort_order, cap, panels, inv, bat, fit, name, spec, note, price, active FROM pricing_packages WHERE page = $1 ORDER BY sort_order, id',
      [page],
    )
  ).rows

  if (rows.length === 0) {
    console.error(`No rows found for page="${page}"`)
    process.exit(2)
  }

  process.stdout.write(`-- pricing_packages page="${page}" (${rows.length} rows)\n`)
  process.stdout.write(`DELETE FROM pricing_packages WHERE page = ${lit(page)};\n`)

  for (const r of rows) {
    process.stdout.write(
      `INSERT INTO pricing_packages (page, category, sort_order, cap, panels, inv, bat, fit, name, spec, note, price, active) VALUES (` +
        [
          lit(r.page),
          lit(r.category),
          lit(r.sort_order),
          lit(r.cap),
          lit(r.panels),
          lit(r.inv),
          lit(r.bat),
          lit(r.fit),
          lit(r.name),
          lit(r.spec),
          lit(r.note),
          lit(r.price),
          lit(r.active),
        ].join(', ') +
        ');\n',
    )
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
