'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { clearAdminSession, createAdminSession, requireSuperAdmin, verifyAdminCredentials } from '@/lib/auth/admin'
import { checkRateLimit } from '@/lib/security/rate-limit'

export interface AdminLoginState {
  error?: string
}

export async function adminLogin(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  if (!(await checkRateLimit('admin-login', 8, 15 * 60 * 1000))) {
    return { error: 'Thử quá nhiều lần. Vui lòng thử lại sau.' }
  }

  const email = (formData.get('email') as string) || ''
  const password = (formData.get('password') as string) || ''

  if (!email.trim() || !password) {
    return { error: 'Vui lòng nhập email và mật khẩu' }
  }

  const admin = await verifyAdminCredentials(email, password)
  if (admin) {
    await createAdminSession(admin.id)
    redirect('/admin')
  }
  return { error: 'Email hoặc mật khẩu không đúng' }
}

export async function adminLogout() {
  await clearAdminSession()
  redirect('/admin/login')
}

export async function updateLeadStatus(leadId: number, status: string) {
  await requireSuperAdmin()
  await db.update(leads).set({ status, updatedAt: new Date() }).where(eq(leads.id, leadId))
  revalidatePath('/admin/leads')
}
