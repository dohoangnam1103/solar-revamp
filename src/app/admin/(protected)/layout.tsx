import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import AdminSidebar from './AdminSidebar'
import NavigationProgressBar from '@/components/shared/NavigationProgressBar'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentAdmin()
  if (!current) redirect('/admin/login')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <NavigationProgressBar />
      <AdminSidebar email={current.email} isSuper={current.isSuper} />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  )
}
