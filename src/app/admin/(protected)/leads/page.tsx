import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { desc, ne } from 'drizzle-orm'
import { updateLeadStatus } from '@/app/actions/admin'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Mới' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'qualified', label: 'Tiềm năng' },
  { value: 'closed', label: 'Đã chốt' },
]
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
}
const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s.label]))

export default async function LeadsPage() {
  const allLeads = await db.select().from(leads).where(ne(leads.source, 'recruitment')).orderBy(desc(leads.createdAt))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads ({allLeads.length})</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Tên', 'SĐT', 'Email', 'Tỉnh', 'Nguồn', 'Trạng thái', 'Thời gian'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allLeads.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Chưa có leads nào</td></tr>
              ) : allLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">#{lead.id}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{lead.name}</td>
                  <td className="px-4 py-3"><a href={`tel:${lead.phone}`} className="text-green-600 hover:underline">{lead.phone}</a></td>
                  <td className="px-4 py-3 text-gray-600">{lead.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{lead.province || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{lead.source}</td>
                  <td className="px-4 py-3">
                    <form action={async (fd) => {
                      'use server'
                      await updateLeadStatus(lead.id, fd.get('status') as string)
                    }}>
                      <select name="status" defaultValue={lead.status || 'new'}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium cursor-pointer ${STATUS_COLORS[lead.status || 'new']}`}>
                        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <button type="submit" className="ml-1 text-xs text-gray-400 hover:text-gray-900">✓</button>
                    </form>
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
