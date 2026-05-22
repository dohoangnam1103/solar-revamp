import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { adminLogout } from '@/app/actions/admin'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Zap, Newspaper, Building2, Briefcase } from 'lucide-react'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-sm">SOLIQ</p>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/leads', label: 'Leads', icon: Users },
            { href: '/admin/quotes', label: 'Báo giá', icon: FileText },
            { href: '/admin/articles', label: 'Bài viết', icon: Newspaper },
            { href: '/admin/projects', label: 'Dự án', icon: Building2 },
            { href: '/admin/partners', label: 'Đối tác', icon: Briefcase },
            { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <item.icon className="w-4 h-4" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <form action={adminLogout}>
            <button type="submit" className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors w-full">
              <LogOut className="w-4 h-4" />Đăng xuất
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
