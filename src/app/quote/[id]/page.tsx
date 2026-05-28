import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { getSiteConfig } from '@/lib/site-config'
import { db } from '@/lib/db'
import { quoteRequests, quoteResults, leads } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { CheckCircle2, Sun, TrendingUp, Clock, Banknote } from 'lucide-react'
import { formatVnd } from '@/lib/quote/calculator'

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = buildPageMetadata({
  title: 'Báo Giá Điện Mặt Trời - SOLIQ ENERGY',
  description: 'Chi tiết báo giá điện mặt trời của bạn.',
  robots: {
    index: false,
    follow: false,
  },
})

export default async function QuoteDetailPage({ params }: Props) {
  const { id: quoteToken } = await params
  const siteConfig = await getSiteConfig()
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(quoteToken)) notFound()

  const quoteRows = await db
    .select({
      id: quoteRequests.id,
      leadName: leads.name,
      leadPhone: leads.phone,
      leadEmail: leads.email,
      customerType: quoteRequests.customerType,
      paymentMode: quoteRequests.paymentMode,
      monthlyBillVnd: quoteRequests.monthlyBillVnd,
      batteryOption: quoteRequests.batteryOption,
      createdAt: quoteRequests.createdAt,
    })
    .from(quoteRequests)
    .leftJoin(leads, eq(quoteRequests.leadId, leads.id))
    .where(eq(quoteRequests.publicToken, quoteToken))

  if (quoteRows.length === 0) notFound()
  const quote = quoteRows[0]

  const resultRows = await db
    .select()
    .from(quoteResults)
    .where(eq(quoteResults.quoteRequestId, quote.id))
    .limit(1)

  const result = resultRows[0] || null

  return (
    <div className="bg-solar-light min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 mb-8 transition-colors">
          ← Về trang chủ
        </Link>

        <div className="glass rounded-2xl overflow-hidden border border-white/50">
          <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-5">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-5 h-5" />
              <h1 className="font-bold text-lg">Báo giá của bạn</h1>
            </div>
            <p className="text-green-100 text-sm mt-1">Mã báo giá: #{quote.id}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer info */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Thông tin khách hàng</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Tên:</span> <span className="font-medium">{quote.leadName}</span></p>
                <p><span className="text-gray-500">SĐT:</span> <span className="font-medium">{quote.leadPhone}</span></p>
                {quote.leadEmail && <p><span className="text-gray-500">Email:</span> <span className="font-medium">{quote.leadEmail}</span></p>}
              </div>
            </div>

            {/* Input summary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Thông tin yêu cầu</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Hóa đơn điện:</span> <span className="font-medium">{formatVnd(quote.monthlyBillVnd)}/tháng</span></p>
                <p><span className="text-gray-500">Loại khách hàng:</span> <span className="font-medium">{quote.customerType === 'residential' ? 'Gia đình' : quote.customerType === 'business' ? 'Doanh nghiệp' : 'Nhà máy'}</span></p>
                <p><span className="text-gray-500">Pin lưu trữ:</span> <span className="font-medium">{quote.batteryOption ? 'Có' : 'Không'}</span></p>
                <p><span className="text-gray-500">Hình thức:</span> <span className="font-medium">{quote.paymentMode === 'cash' ? 'Trả thẳng' : 'Trả góp'}</span></p>
              </div>
            </div>

            {/* Result */}
            {result && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <Sun className="w-4 h-4 text-green-700 mb-1" />
                    <p className="text-xs text-gray-500">Công suất</p>
                    <p className="text-xl font-bold text-green-700">{result.recommendedCapacityKwp} kWp</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <Banknote className="w-4 h-4 text-orange-600 mb-1" />
                    <p className="text-xs text-gray-500">Đầu tư</p>
                    <p className="text-xl font-bold text-orange-600">{formatVnd(result.estimatedInvestmentVnd)}</p>
                  </div>
                  <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
                    <TrendingUp className="w-4 h-4 text-cyan-600 mb-1" />
                    <p className="text-xs text-gray-500">Tiết kiệm/năm</p>
                    <p className="text-xl font-bold text-cyan-600">{formatVnd(result.annualSavingsVnd)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <Clock className="w-4 h-4 text-purple-600 mb-1" />
                    <p className="text-xs text-gray-500">Hoàn vốn</p>
                    <p className="text-xl font-bold text-purple-600">{result.paybackYears} năm</p>
                  </div>
                </div>

                <p className="text-xs text-gray-900 leading-relaxed border-t border-gray-100 pt-3">
                  Kết quả mang tính ước tính. Cần khảo sát thực tế để có báo giá chính xác.
                </p>
              </>
            )}

            {!result && (
              <div className="text-center py-6 text-gray-500 text-sm">
                Đang chờ kết quả tính toán...
              </div>
            )}

            <a href={`tel:${siteConfig.phone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
              Gọi ngay để tư vấn chi tiết
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
