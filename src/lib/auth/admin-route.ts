import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { CONTENT_ADMIN_HOME } from '@/lib/auth/admin-access'

export async function requireSuperAdminPage() {
  const current = await getCurrentAdmin()
  if (!current) redirect('/admin/login')
  if (!current.isSuper) redirect(CONTENT_ADMIN_HOME)
  return current
}
