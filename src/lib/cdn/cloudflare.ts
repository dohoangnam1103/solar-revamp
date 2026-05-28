/**
 * Cloudflare CDN cache purge helper.
 *
 * Used after admin actions to invalidate edge-cached HTML so changes
 * are visible to users immediately instead of waiting for s-maxage to expire.
 *
 * Required env vars:
 *   CLOUDFLARE_API_TOKEN - API token with "Zone.Cache Purge" permission
 *   CLOUDFLARE_ZONE_ID   - Zone ID for the domain (e.g. "abc123...")
 *
 * Optional:
 *   CLOUDFLARE_PURGE_HOST - Limit purges to this hostname (e.g. "soliq2.solarcheck.best")
 */

type PurgePayload =
  | { purge_everything: true }
  | { files: string[] }
  | { tags: string[] }

async function callCloudflarePurge(payload: PurgePayload): Promise<boolean> {
  const token = process.env.CLOUDFLARE_API_TOKEN
  const zoneId = process.env.CLOUDFLARE_ZONE_ID

  if (!token || !zoneId) {
    // Silent skip when not configured (e.g. local dev)
    return false
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        // Don't keep the request hanging if Cloudflare is slow
        signal: AbortSignal.timeout(8000),
      }
    )

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.warn('[cloudflare] purge failed:', response.status, text)
      return false
    }

    const json = (await response.json().catch(() => null)) as { success?: boolean } | null
    if (!json?.success) {
      console.warn('[cloudflare] purge response not success:', json)
      return false
    }

    return true
  } catch (error) {
    console.warn('[cloudflare] purge error:', error)
    return false
  }
}

/**
 * Purge specific paths from Cloudflare's edge cache. Pass paths
 * (e.g. ['/', '/bao-gia-dien-mat-troi']) — they'll be expanded into
 * full URLs using CLOUDFLARE_PURGE_HOST or NEXT_PUBLIC_SITE_URL.
 */
export async function purgePaths(paths: string[]): Promise<boolean> {
  if (paths.length === 0) return false

  const host =
    process.env.CLOUDFLARE_PURGE_HOST ||
    (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '')
  if (!host) return false

  const files = paths.map((path) => `https://${host}${path.startsWith('/') ? path : `/${path}`}`)
  return callCloudflarePurge({ files })
}

/** Purge everything for the configured zone. Use sparingly. */
export async function purgeEverything(): Promise<boolean> {
  return callCloudflarePurge({ purge_everything: true })
}

/**
 * Fire-and-forget wrapper. Calls the purge but doesn't block the caller
 * on failure. Suitable for use inside admin server actions.
 */
export function firePurgePaths(paths: string[]): void {
  purgePaths(paths).catch((error) => {
    console.warn('[cloudflare] firePurgePaths swallowed error:', error)
  })
}
