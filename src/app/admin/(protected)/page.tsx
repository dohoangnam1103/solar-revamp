import { db } from '@/lib/db'
import { leads, quoteRequests } from '@/lib/db/schema'
import { desc, count, eq, gte } from 'drizzle-orm'
import { Users, FileText, TrendingUp, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { CONTENT_ADMIN_HOME } from '@/lib/auth/admin-access'
import RefreshButton from './RefreshButton'

export default async function AdminDashboard() {
  const current = await getCurrentAdmin()
  if (!current?.isSuper) redirect(CONTENT_ADMIN_HOME)

  const [totalLeads] = await db.select({ count: count() }).from(leads)
  const [totalQuotes] = await db.select({ count: count() }).from(quoteRequests)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [newToday] = await db.select({ count: count() }).from(leads).where(gte(leads.createdAt, today))
  const [newLeads] = await db.select({ count: count() }).from(leads).where(eq(leads.status, 'new'))
  const recentLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(10)

  const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-600',
  }
  const STATUS_LABEL: Record<string, string> = {
    new: 'Mới',
    contacted: 'Đã liên hệ',
    qualified: 'Tiềm năng',
    closed: 'Đã chốt',
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <RefreshButton />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng khách tiềm năng', value: totalLeads.count, icon: Users, color: 'text-blue-600' },
          { label: 'Mới hôm nay', value: newToday.count, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Chờ xử lý', value: newLeads.count, icon: Clock, color: 'text-yellow-600' },
          { label: 'Tổng báo giá', value: totalQuotes.count, icon: FileText, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Khách tiềm năng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">Tên</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">SĐT</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">Tỉnh</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentLeads.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Chưa có leads nào</td></tr>
              ) : recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-medium">{lead.name}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.province || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status || 'new'] || STATUS_COLORS.new}`}>
                      {STATUS_LABEL[lead.status || 'new']}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(lead.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
