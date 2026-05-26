'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { adminLogout } from '@/app/actions/admin'
import {
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Images,
  LayoutDashboard,
  LogOut,
  Newspaper,
  ShieldCheck,
  Tag,
  UserRoundSearch,
  Users,
  Zap,
} from 'lucide-react'

type AdminSidebarProps = {
  email: string
  isSuper: boolean
}

const SIDEBAR_STORAGE_KEY = 'soliq-admin-sidebar-collapsed'

export default function AdminSidebar({ email, isSuper }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1')
  }, [])

  const navItems = useMemo(
    () => [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/leads', label: 'Khách tiềm năng', icon: Users },
      { href: '/admin/quotes', label: 'Báo giá', icon: FileText },
      { href: '/admin/articles', label: 'Bài viết', icon: Newspaper },
      { href: '/admin/projects', label: 'Dự án', icon: Building2 },
      { href: '/admin/carousel', label: 'Carousel', icon: Images },
      { href: '/admin/recruitment', label: 'Tuyển dụng', icon: UserRoundSearch },
      { href: '/admin/partners', label: 'Đối tác', icon: Briefcase },
      { href: '/admin/faqs', label: 'FAQ', icon: HelpCircle },
      { href: '/admin/pricing', label: 'Giá cả', icon: Tag },
      ...(isSuper ? [{ href: '/admin/admins', label: 'Quản trị viên', icon: ShieldCheck }] : []),
    ],
    [isSuper]
  )

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-200 ${
        collapsed ? 'w-18' : 'w-56'
      }`}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-full rounded-r-md border border-l-0 border-gray-200 bg-white p-1 text-gray-400 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-600"
        aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        title={collapsed ? 'Mở rộng' : 'Thu gọn'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="border-b border-gray-200 p-3">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-700">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">SOLIQ</p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-lg py-2 text-sm transition-colors ${
                collapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
              } ${
                active
                  ? 'bg-green-50 font-semibold text-green-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-gray-200 p-3">
        {!collapsed && (
          <p className="truncate px-3 text-xs text-gray-500" title={email}>
            {email}
          </p>
        )}
        <form action={adminLogout}>
          <button
            type="submit"
            title={collapsed ? 'Đăng xuất' : undefined}
            className={`flex w-full items-center rounded-lg py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-red-600 ${
              collapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </form>
      </div>
    </aside>
  )
}
