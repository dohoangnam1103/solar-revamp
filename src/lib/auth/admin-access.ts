import type { Admin } from '@/lib/db/schema'

export const CONTENT_ADMIN_PATHS = ['/admin/articles', '/admin/projects', '/admin/carousel', '/admin/recruitment'] as const
export const CONTENT_ADMIN_HOME = CONTENT_ADMIN_PATHS[0]

export function canAccessAdminPath(admin: Pick<Admin, 'isSuper'>, pathname: string) {
  if (admin.isSuper) return true
  return CONTENT_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
