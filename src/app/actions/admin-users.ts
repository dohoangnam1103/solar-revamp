'use server'

import { db } from '@/lib/db'
import { admins } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getCurrentAdmin, hashPassword, requireSuperAdmin } from '@/lib/auth/admin'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6
const MAX_EMAIL_LENGTH = 180

export interface AdminFormState {
  error?: string
  success?: string
}

export async function listAdmins() {
  await requireSuperAdmin()
  return db.select({
    id: admins.id,
    email: admins.email,
    isSuper: admins.isSuper,
    createdAt: admins.createdAt,
    updatedAt: admins.updatedAt,
  }).from(admins).orderBy(admins.id)
}

export async function getAdminById(id: number) {
  await requireSuperAdmin()
  const rows = await db.select({
    id: admins.id,
    email: admins.email,
    isSuper: admins.isSuper,
    createdAt: admins.createdAt,
    updatedAt: admins.updatedAt,
  }).from(admins).where(eq(admins.id, id))
  return rows[0] || null
}

export async function createAdminUser(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireSuperAdmin()
  const email = ((formData.get('email') as string) || '').trim().toLowerCase()
  const password = (formData.get('password') as string) || ''

  if (!EMAIL_REGEX.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return { error: 'Email không hợp lệ' }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` }
  }

  const existing = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, email))
  if (existing.length) {
    return { error: 'Email đã tồn tại' }
  }

  await db.insert(admins).values({
    email,
    passwordHash: hashPassword(password),
    isSuper: false,
  })
  revalidatePath('/admin/admins')
  return { success: 'Đã tạo tài khoản admin' }
}

export async function updateAdminUser(
  id: number,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const current = await requireSuperAdmin()
  const target = (await db.select().from(admins).where(eq(admins.id, id)))[0]
  if (!target) return { error: 'Không tìm thấy admin' }

  const newEmail = ((formData.get('email') as string) || '').trim().toLowerCase()
  const newPassword = ((formData.get('password') as string) || '').trim()

  const updates: { email?: string; passwordHash?: string; updatedAt: Date } = { updatedAt: new Date() }

  if (target.isSuper) {
    // Superadmin: chỉ cho đổi password của chính mình. Không cho đổi email.
    if (newEmail && newEmail !== target.email) {
      return { error: 'Không thể đổi email của superadmin' }
    }
    if (newPassword) {
      if (current.id !== target.id) {
        return { error: 'Chỉ superadmin được đổi mật khẩu của chính mình' }
      }
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return { error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` }
      }
      updates.passwordHash = hashPassword(newPassword)
    } else {
      return { error: 'Không có thay đổi' }
    }
  } else {
    if (newEmail && newEmail !== target.email) {
      if (!EMAIL_REGEX.test(newEmail) || newEmail.length > MAX_EMAIL_LENGTH) {
        return { error: 'Email không hợp lệ' }
      }
      const dup = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, newEmail))
      if (dup.length && dup[0].id !== id) {
        return { error: 'Email đã tồn tại' }
      }
      updates.email = newEmail
    }
    if (newPassword) {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return { error: `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự` }
      }
      updates.passwordHash = hashPassword(newPassword)
    }
    if (!updates.email && !updates.passwordHash) {
      return { error: 'Không có thay đổi' }
    }
  }

  await db.update(admins).set(updates).where(eq(admins.id, id))
  revalidatePath('/admin/admins')
  return { success: 'Đã cập nhật' }
}

export async function deleteAdminUser(id: number) {
  const current = await requireSuperAdmin()
  const target = (await db.select().from(admins).where(eq(admins.id, id)))[0]
  if (!target) throw new Error('Không tìm thấy admin')
  if (target.isSuper) throw new Error('Không thể xoá superadmin')
  if (target.id === current.id) throw new Error('Không thể xoá tài khoản đang đăng nhập')

  await db.delete(admins).where(eq(admins.id, id))
  revalidatePath('/admin/admins')
}

export async function getCurrentAdminPublic() {
  const admin = await getCurrentAdmin()
  if (!admin) return null
  return { id: admin.id, email: admin.email, isSuper: admin.isSuper }
}
