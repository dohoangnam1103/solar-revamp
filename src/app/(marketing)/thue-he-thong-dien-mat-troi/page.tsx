import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata, serviceSchema } from '@/lib/seo/metadata'
import { CheckCircle, ArrowRight, Phone, Zap, Shield, TrendingUp } from 'lucide-react'
import { getSiteConfig } from '@/lib/site-config'
import { formatVnd } from '@/lib/quote/calculator'

export const metadata: Metadata = buildPageMetadata({
  title: 'Thuê Hệ Thống Điện Mặt Trời - Không Cần Đầu Tư Ban Đầu',
  description: 'Thuê hệ thống điện mặt trời từ SOLIQ ENERGY. Không cần đầu tư ban đầu, tiết kiệm điện ngay từ tháng đầu, SOLIQ chịu trách nhiệm bảo trì toàn bộ.',
  alternates: { canonical: '/thue-he-thong-dien-mat-troi' },
})

export default async function ThuePage() {
  const siteConfig = await getSiteConfig()
  const jsonLd = serviceSchema('Thuê hệ thống điện mặt trời', 'Dịch vụ cho thuê hệ thống điện mặt trời, không cần đầu tư ban đầu', '/thue-he-thong-dien-mat-troi')
  return (
    <>
      {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-cyan-300 font-medium mb-6 border border-white/20">
              <Zap className="w-4 h-4" />Mô hình thuê solar
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Thuê hệ thống solar —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-yellow-300">{formatVnd(0)} đầu tư ban đầu</span>
            </h1>
            <p className="text-green-100 text-lg leading-relaxed mb-8">
              SOLIQ lắp đặt và sở hữu hệ thống, bạn chỉ trả phí thuê hàng tháng thấp hơn hóa đơn điện hiện tại. Tiết kiệm ngay từ tháng đầu tiên.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
                <Phone className="w-4 h-4" />Tư vấn mô hình thuê
              </a>
              <Link href="/bao-gia-dien-mat-troi" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition-colors">
                Tính báo giá <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Mô hình thuê hoạt động như thế nào?</h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-stagger className="space-y-6">
              {[
                { step: '01', title: 'SOLIQ khảo sát & lắp đặt miễn phí', desc: 'Đội kỹ thuật khảo sát mái nhà, thiết kế và lắp đặt hệ thống hoàn toàn miễn phí.' },
                { step: '02', title: 'Bạn dùng điện mặt trời', desc: 'Hệ thống hoạt động ngay, bạn sử dụng điện sạch từ mặt trời với giá thấp hơn EVN.' },
                { step: '03', title: 'Trả phí thuê hàng tháng', desc: 'Phí thuê cố định, thấp hơn hóa đơn điện hiện tại. Không lo giá điện tăng.' },
                { step: '04', title: 'SOLIQ bảo trì toàn bộ', desc: 'Mọi chi phí bảo trì, sửa chữa, thay thế linh kiện do SOLIQ chịu hoàn toàn.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm">{item.step}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-8 border border-white/50">
              <h3 className="font-bold text-gray-900 text-xl mb-6">So sánh mô hình</h3>
              <div data-stagger className="space-y-4">
                {[
                  { label: 'Đầu tư ban đầu', mua: `${formatVnd(50_000_000)} - ${formatVnd(200_000_000)}`, thue: formatVnd(0), highlight: true },
                  { label: 'Tiết kiệm điện', mua: '50-100%', thue: '20-40%', highlight: false },
                  { label: 'Bảo trì', mua: 'Tự lo', thue: 'SOLIQ lo', highlight: true },
                  { label: 'Thời hạn', mua: 'Sở hữu vĩnh viễn', thue: 'Hợp đồng 10-20 năm', highlight: false },
                  { label: 'Phù hợp', mua: 'Có vốn đầu tư', thue: 'Không muốn đầu tư', highlight: true },
                ].map((row) => (
                  <div key={row.label} className={`grid grid-cols-3 gap-2 text-sm p-2 rounded-lg ${row.highlight ? 'bg-green-50' : ''}`}>
                    <span className="text-gray-500 font-medium">{row.label}</span>
                    <span className="text-center text-gray-700">{row.mua}</span>
                    <span className="text-center font-semibold text-green-700">{row.thue}</span>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-900 pt-1">
                  <span></span><span className="text-center">Mua đứt</span><span className="text-center">Thuê</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Ai phù hợp với mô hình thuê?</h2>
          <div data-stagger className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Không có vốn đầu tư', desc: `Muốn tiết kiệm điện ngay nhưng chưa có ngân sách ${formatVnd(50_000_000)} - ${formatVnd(200_000_000)}.` },
              { icon: TrendingUp, title: 'Doanh nghiệp vừa nhỏ', desc: 'Muốn giảm chi phí vận hành mà không ảnh hưởng dòng tiền kinh doanh.' },
              { icon: CheckCircle, title: 'Không muốn lo bảo trì', desc: 'Muốn hưởng lợi điện sạch mà không phải quản lý kỹ thuật.' },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6 border border-white/50 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href={`tel:${siteConfig.phone}`} className="inline-flex items-center gap-2 px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-colors text-lg">
              <Phone className="w-5 h-5" />Liên hệ tư vấn mô hình thuê
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
