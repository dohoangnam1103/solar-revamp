'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export interface AdminLoginState {
  error?: string
}

export async function adminLogin(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const password = formData.get('password') as string
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', '1', {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    redirect('/admin')
  }
  return { error: 'Mật khẩu không đúng' }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}

export async function updateLeadStatus(leadId: number, status: string) {
  await db.update(leads).set({ status, updatedAt: new Date() }).where(eq(leads.id, leadId))
  revalidatePath('/admin/leads')
}
