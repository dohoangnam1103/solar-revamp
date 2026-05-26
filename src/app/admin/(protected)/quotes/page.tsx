import { db } from '@/lib/db'
import { quoteRequests, quoteResults, leads } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireSuperAdminPage } from '@/lib/auth/admin-route'
import RefreshButton from '../RefreshButton'

export default async function QuotesPage() {
  await requireSuperAdminPage()
  const quotes = await db
    .select({
      id: quoteRequests.id,
      leadName: leads.name,
      leadPhone: leads.phone,
      customerType: quoteRequests.customerType,
      paymentMode: quoteRequests.paymentMode,
      monthlyBill: quoteRequests.monthlyBillVnd,
      batteryOption: quoteRequests.batteryOption,
      createdAt: quoteRequests.createdAt,
    })
    .from(quoteRequests)
    .leftJoin(leads, eq(quoteRequests.leadId, leads.id))
    .orderBy(desc(quoteRequests.createdAt))

  const results = await db.select().from(quoteResults).orderBy(desc(quoteResults.createdAt))
  const resultMap = new Map(results.map((r) => [r.quoteRequestId, r]))

  const CUSTOMER_TYPE_LABEL: Record<string, string> = {
    residential: 'Hộ gia đình',
    business: 'Doanh nghiệp',
    factory: 'Nhà máy',
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Báo giá ({quotes.length})</h1>
        <RefreshButton />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Khách hàng', 'SĐT', 'Loại KH', 'Hóa đơn/tháng', 'Công suất', 'Đầu tư', 'Hoàn vốn', 'Thời gian'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {quotes.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Chưa có báo giá nào</td></tr>
              ) : quotes.map((q) => {
                const result = resultMap.get(q.id)
                return (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{q.id}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{q.leadName || '—'}</td>
                    <td className="px-4 py-3 text-green-600">{q.leadPhone || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{CUSTOMER_TYPE_LABEL[q.customerType] ?? q.customerType}</td>
                    <td className="px-4 py-3 text-gray-600">{(q.monthlyBill / 1_000_000).toFixed(1)}tr</td>
                    <td className="px-4 py-3 text-cyan-700 font-medium">{result ? `${result.recommendedCapacityKwp} kWp` : '—'}</td>
                    <td className="px-4 py-3 text-orange-700">{result ? `${(result.estimatedInvestmentVnd / 1_000_000).toFixed(0)}tr` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{result ? `${result.paybackYears} năm` : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(q.createdAt).toLocaleString('vi-VN')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
