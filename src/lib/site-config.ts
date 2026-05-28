import { unstable_cache } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'

const SETTINGS_KEY = 'site_config'

export type SiteConfig = {
  phone: string
  phoneFormatted: string
  notificationEmails: string[]
  headerLogo: string | null
  footerLogo: string | null
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  phone: '0902211893',
  phoneFormatted: '090.22.11.893',
  notificationEmails: [],
  headerLogo: null,
  footerLogo: null,
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

export function normalizeSiteConfig(value: unknown): SiteConfig {
  const source = asRecord(value)
  const phone = typeof source.phone === 'string' && source.phone.trim()
    ? source.phone.trim()
    : DEFAULT_SITE_CONFIG.phone
  const phoneFormatted = typeof source.phoneFormatted === 'string' && source.phoneFormatted.trim()
    ? source.phoneFormatted.trim()
    : DEFAULT_SITE_CONFIG.phoneFormatted

  const rawEmails = source.notificationEmails
  let notificationEmails: string[] = []
  if (Array.isArray(rawEmails)) {
    notificationEmails = rawEmails
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item.length <= 180)
  }

  const headerLogo = typeof source.headerLogo === 'string' && source.headerLogo.trim()
    ? source.headerLogo.trim()
    : null
  const footerLogo = typeof source.footerLogo === 'string' && source.footerLogo.trim()
    ? source.footerLogo.trim()
    : null

  return { phone, phoneFormatted, notificationEmails, headerLogo, footerLogo }
}

export const getSiteConfig = unstable_cache(
  async (): Promise<SiteConfig> => {
    try {
      const rows = await db.select().from(settings).where(eq(settings.key, SETTINGS_KEY)).limit(1)
      return normalizeSiteConfig(rows[0]?.valueJson)
    } catch {
      return DEFAULT_SITE_CONFIG
    }
  },
  [SETTINGS_KEY],
  { tags: ['site-config'], revalidate: 300 }
)
