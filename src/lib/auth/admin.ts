import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { admins, type Admin } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const ADMIN_SESSION_COOKIE = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24
const SCRYPT_KEYLEN = 64
const SCRYPT_SALT_BYTES = 16

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is required')
  }
  return secret
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer)
}

type SessionPayload = { exp: number; nonce: string; adminId: number }

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${body}.${sign(body)}`
}

function decodeSession(value: string): SessionPayload | null {
  const [body, signature] = value.split('.')
  if (!body || !signature || !safeEqual(sign(body), signature)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      exp?: unknown
      nonce?: unknown
      adminId?: unknown
    }
    if (typeof payload.exp !== 'number' || typeof payload.nonce !== 'string') return null
    if (typeof payload.adminId !== 'number') return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload as SessionPayload
  } catch {
    return null
  }
}

export function hashPassword(plain: string): string {
  const salt = randomBytes(SCRYPT_SALT_BYTES)
  const key = scryptSync(plain, salt, SCRYPT_KEYLEN)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  try {
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(hashHex, 'hex')
    const key = scryptSync(plain, salt, expected.length)
    return key.length === expected.length && timingSafeEqual(key, expected)
  } catch {
    return false
  }
}

export async function createAdminSession(adminId: number) {
  const cookieStore = await cookies()
  const value = encodeSession({
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    nonce: randomBytes(18).toString('base64url'),
    adminId,
  })

  cookieStore.set(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!raw) return null
  return decodeSession(raw)
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const session = await readSession()
  if (!session) return null
  const rows = await db.select().from(admins).where(eq(admins.id, session.adminId))
  return rows[0] || null
}

export async function isAdminSessionValid() {
  return (await getCurrentAdmin()) !== null
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Unauthorized')
  return admin
}

export async function requireSuperAdmin(): Promise<Admin> {
  const admin = await requireAdmin()
  if (!admin.isSuper) throw new Error('Forbidden')
  return admin
}

export async function verifyAdminCredentials(email: string, password: string): Promise<Admin | null> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !password) return null
  const rows = await db.select().from(admins).where(eq(admins.email, normalizedEmail))
  const admin = rows[0]
  if (!admin) return null
  if (!verifyPassword(password, admin.passwordHash)) return null
  return admin
}
