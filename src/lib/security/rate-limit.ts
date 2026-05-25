import { headers } from 'next/headers'

const buckets = new Map<string, { count: number; resetAt: number }>()

export async function getClientIp() {
  const headerStore = await headers()
  return (
    headerStore.get('cf-connecting-ip') ||
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}

export async function checkRateLimit(namespace: string, limit: number, windowMs: number) {
  const ip = await getClientIp()
  const key = `${namespace}:${ip}`
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false
  bucket.count += 1
  return true
}
