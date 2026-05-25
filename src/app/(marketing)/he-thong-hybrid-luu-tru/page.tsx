import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata, serviceSchema, breadcrumbSchema } from '@/lib/seo/metadata'
import { Battery, Zap, Shield, CheckCircle, ArrowRight, Phone } from 'lucide-react'
import { getPricingPackages } from '@/lib/db/pricing'

export const metadata: Metadata = buildPageMetadata({
  title: 'Hệ Thống Điện Mặt Trời Hybrid Lưu Trữ - Dùng Điện Khi Mất Điện',
  description: 'Hệ thống điện mặt trời hybrid kết hợp pin lưu trữ LiFePO4. Dùng điện cả khi mất điện lưới, tối ưu giờ cao điểm, chủ động 100% nguồn điện.',
  alternates: { canonical: '/he-thong-hybrid-luu-tru' },
})

export default async function HybridPage() {
  const packages = await getPricingPackages('hybrid')
  const jsonLd = serviceSchema('Hệ thống điện mặt trời Hybrid lưu trữ', 'Hệ thống hybrid kết hợp pin lưu trữ, dùng điện cả khi mất điện lưới', '/he-thong-hybrid-luu-tru')
  const breadcrumb = breadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Hệ thống Hybrid lưu trữ', url: '/he-thong-hybrid-luu-tru' },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-cyan-300 font-medium mb-6 border border-white/20">
              <Battery className="w-4 h-4" />Hybrid + Lưu trữ
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Hệ thống Hybrid —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-yellow-300">dùng điện cả khi mất điện</span>
            </h1>
            <p className="text-green-100 text-lg leading-relaxed mb-8">Kết hợp tấm pin mặt trời + biến tần hybrid + pin lưu trữ LiFePO4. Tự chủ hoàn toàn nguồn điện, không lo cúp điện, tối ưu giờ cao điểm.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/bao-gia-dien-mat-troi" className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
                Tính báo giá Hybrid <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="tel:0902211893" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition-colors">
                <Phone className="w-4 h-4" />Tư vấn ngay
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Ưu điểm hệ thống Hybrid</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Dùng điện khi mất điện lưới', desc: 'Pin lưu trữ cung cấp điện liên tục khi lưới điện bị cúp, đảm bảo sinh hoạt và sản xuất không gián đoạn.' },
              { icon: Battery, title: 'Tối ưu giờ cao điểm', desc: 'Sạc pin ban ngày khi điện mặt trời dư, dùng pin vào giờ cao điểm (18-22h) để tiết kiệm tối đa.' },
              { icon: Shield, title: 'Pin LiFePO4 an toàn', desc: 'Công nghệ pin lithium sắt phosphate, tuổi thọ 3.000-6.000 chu kỳ, an toàn cháy nổ, không độc hại.' },
              { icon: CheckCircle, title: 'Giám sát thông minh', desc: 'App theo dõi sản lượng, trạng thái pin, tiêu thụ điện theo thời gian thực trên điện thoại.' },
              { icon: ArrowRight, title: 'Mở rộng linh hoạt', desc: 'Có thể thêm pin lưu trữ sau khi lắp đặt, phù hợp với nhu cầu tăng trưởng.' },
              { icon: Zap, title: 'Hỗ trợ 3 pha', desc: 'Có gói 3 pha cho nhà xưởng, doanh nghiệp cần nguồn điện 3 pha ổn định.' },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6 border border-white/50">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-cyan-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Gói Hybrid lưu trữ</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cyan-700 text-white">
                  <th className="px-4 py-3 text-left rounded-tl-xl">Công suất</th>
                  <th className="px-4 py-3 text-left">Số tấm</th>
                  <th className="px-4 py-3 text-left">Biến tần</th>
                  <th className="px-4 py-3 text-left">Pin lưu trữ</th>
                  <th className="px-4 py-3 text-right rounded-tr-xl">Giá tham khảo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-bold text-cyan-700">{row.cap}</td>
                    <td className="px-4 py-3 text-gray-600">{row.panels}</td>
                    <td className="px-4 py-3 text-gray-600">{row.inv}</td>
                    <td className="px-4 py-3 text-gray-500">{row.bat}</td>
                    <td className="px-4 py-3 text-right font-semibold">{row.price ? row.price.toLocaleString('vi-VN') : '—'}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-900 mt-3 text-center">* Giá chưa VAT. Liên hệ để nhận báo giá chính xác sau khảo sát.</p>
        </div>
      </section>
    </>
  )
}
