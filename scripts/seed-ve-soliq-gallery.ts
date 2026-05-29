/**
 * One-off seed: import the 29 default master-phi images from /public into
 * ve_soliq_gallery_images so the admin /admin/ve-soliq-config screen no
 * longer shows "Thư viện ảnh (0)".
 *
 * Idempotent — skips if any rows already exist for the same URL.
 *
 * Usage:
 *   npm run db:seed:ve-soliq-gallery
 */
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import { Pool } from 'pg'
import { mediaAssets, veSoliqGalleryImages } from '../src/lib/db/schema'
import { loadEnvFile } from './lib/load-env'

loadEnvFile()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

const PROJECT_ROOT = path.resolve(__dirname, '..')

async function main() {
  console.log('Seeding ve_soliq_gallery_images from /public/projects/master-phi/...')

  const existing = await db.select({ id: veSoliqGalleryImages.id }).from(veSoliqGalleryImages)
  if (existing.length > 0) {
    console.log(`Skipping — ve_soliq_gallery_images already has ${existing.length} rows.`)
    return
  }

  let inserted = 0
  for (let i = 1; i <= 29; i += 1) {
    const filename = `master-phi-${String(i).padStart(2, '0')}.webp`
    const url = `/projects/master-phi/${filename}`
    const absolutePath = path.join(PROJECT_ROOT, 'public', 'projects', 'master-phi', filename)

    const fileInfo = await stat(absolutePath).catch(() => null)
    if (!fileInfo) {
      console.warn(`  ! Missing file: ${absolutePath}`)
      continue
    }

    // Reuse existing media_asset if present (matched by URL).
    const existingAsset = await db
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.url, url))
      .limit(1)
    let mediaAssetId = existingAsset[0]?.id ?? null

    if (mediaAssetId == null) {
      const [asset] = await db
        .insert(mediaAssets)
        .values({
          url,
          // storagePath is UNIQUE in schema; use a synthetic path tied to /public
          // so it doesn't clash with real /uploads files. delete flow uses
          // unlink().catch(() => undefined) so a non-existent path on disk is safe.
          storagePath: `__public/projects/master-phi/${filename}`,
          originalName: filename,
          mimeType: 'image/webp',
          sizeBytes: fileInfo.size,
          usage: 've-soliq-gallery',
          alt: `Hình ảnh thực tế đội ngũ SOLIQ tại hiện trường ${i}`,
        })
        .returning()
      mediaAssetId = asset.id
    }

    await db.insert(veSoliqGalleryImages).values({
      mediaAssetId,
      alt: `Hình ảnh thực tế đội ngũ SOLIQ tại hiện trường ${i}`,
      sortOrder: i,
    })
    inserted += 1
  }

  console.log(`Done. Inserted ${inserted} gallery rows.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
