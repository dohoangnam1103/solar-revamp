import type { Metadata } from 'next'
import { buildPageMetadata, serviceSchema, breadcrumbSchema } from '@/lib/seo/metadata'
import QuoteCalculator from '@/components/quote/QuoteCalculator'
import { getSolarAssumptions } from '@/lib/quote/settings'
import { getSiteConfig } from '@/lib/site-config'
import { formatVnd } from '@/lib/quote/calculator'
import { CheckCircle, Phone, Zap } from 'lucide-react'
import { db } from '@/lib/db'
import { pricingPackages } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

export const metadata: Metadata = buildPageMetadata({
  title: 'Báo Giá Điện Mặt Trời - Tính Chi Phí Lắp Đặt Miễn Phí',
  description:
    'Tính báo giá điện mặt trời miễn phí ngay. Nhập hóa đơn điện, nhận ước tính công suất, chi phí đầu tư, tiết kiệm hàng năm và thời gian hoàn vốn.',
  alternates: { canonical: '/bao-gia-dien-mat-troi' },
})

export default async function BaoGiaPage() {
  const [quoteAssumptions, siteConfig, hoaLuoi, hybrid] = await Promise.all([
    getSolarAssumptions(),
    getSiteConfig(),
    db.select().from(pricingPackages).where(eq(pricingPackages.page, 'hoa-luoi')).orderBy(asc(pricingPackages.sortOrder)),
    db.select().from(pricingPackages).where(eq(pricingPackages.page, 'hybrid')).orderBy(asc(pricingPackages.sortOrder)),
  ])

  const jsonLd = serviceSchema(
    'Báo giá điện mặt trời',
    'Dịch vụ tư vấn và báo giá lắp đặt điện mặt trời miễn phí tại SOLIQ ENERGY',
    '/bao-gia-dien-mat-troi'
  )

  const breadcrumb = breadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Báo giá điện mặt trời', url: '/bao-gia-dien-mat-troi' },
  ])

  return (
    <>
      {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }}
      />

      <section className="bg-solar-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-cyan-300 font-medium mb-4 border border-white/20">
            <Zap className="w-4 h-4" />
            Miễn phí, không ràng buộc
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Báo giá điện mặt trời
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Nhập thông tin tiêu thụ điện, nhận ngay ước tính công suất, chi phí và thời gian hoàn vốn
          </p>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Calculator */}
            <div>
              <QuoteCalculator assumptions={quoteAssumptions} phone={siteConfig.phone} />
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Bảng giá tham khảo
                </h2>
                <div data-stagger className="space-y-3">
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Hệ thống hòa lưới</h3>
                  {hoaLuoi.map((row) => (
                    <div key={row.id} className="flex items-center justify-between p-3 glass rounded-xl border border-white/50 text-sm">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="font-bold text-green-700 w-16 shrink-0">{row.cap}</span>
                        <span className="text-gray-500 text-xs sm:text-sm">{row.panels}{row.inv ? ` · ${row.inv}` : ''}</span>
                      </div>
                      <span className="font-semibold text-gray-800 shrink-0">{row.price ? formatVnd(row.price) : '—'}</span>
                    </div>
                  ))}
                </div>

                <div data-stagger className="mt-6 space-y-3">
                  <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Hệ thống Hybrid (có pin lưu trữ)</h3>
                  {hybrid.map((row) => (
                    <div key={row.id} className="flex items-center justify-between p-3 glass rounded-xl border border-white/50 text-sm">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="font-bold text-cyan-700 w-20 shrink-0">{row.cap}</span>
                        <span className="text-gray-500 text-xs sm:text-sm">{row.panels}</span>
                      </div>
                      <span className="font-semibold text-gray-800 shrink-0">{row.price ? formatVnd(row.price) : '—'}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-900 mt-3">* Giá trên chỉ mang tính tham khảo. Liên hệ để nhận báo giá chính xác sau khảo sát.</p>
              </div>

              {/* Why SOLIQ */}
              <div className="glass rounded-2xl p-6 border border-white/50">
                <h3 className="font-bold text-gray-900 mb-4">Tại sao chọn SOLIQ ENERGY?</h3>
                <ul data-stagger className="space-y-3">
                  {[
                    'Lắp đặt trọn gói',
                    `Vay ngân hàng lên tới ${formatVnd(500_000_000)} không thế chấp`,
                    'Tư vấn miễn phí, không ép mua',
                    'Báo giá minh bạch, không phát sinh',
                    'Thi công đúng tiến độ cam kết',
                    'Bảo hành tấm pin 25 năm',
                    'Hỗ trợ kỹ thuật sau lắp đặt',
                    'Hỗ trợ trả góp 12-60 tháng',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={`tel:${siteConfig.phone}`}
                className="flex items-center justify-center gap-2 w-full py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-colors text-lg"
              >
                <Phone className="w-5 h-5" />
                Gọi ngay: {siteConfig.phoneFormatted}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
