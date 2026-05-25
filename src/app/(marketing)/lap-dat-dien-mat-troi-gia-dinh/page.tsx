import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata, serviceSchema, breadcrumbSchema } from '@/lib/seo/metadata'
import { Home, CheckCircle, ArrowRight, Sun, TrendingUp, Shield, Phone } from 'lucide-react'
import { getPricingPackages } from '@/lib/db/pricing'

export const metadata: Metadata = buildPageMetadata({
  title: 'Lắp Điện Mặt Trời Gia Đình - Tiết Kiệm 50-100% Hóa Đơn Điện',
  description:
    'Lắp điện mặt trời gia đình tại Hà Nội. Hệ thống 3-15kWp, tiết kiệm 50-100% hóa đơn điện, hoàn vốn 5-7 năm. Tư vấn miễn phí, bảo hành 25 năm.',
  alternates: { canonical: '/lap-dat-dien-mat-troi-gia-dinh' },
})

export default async function GiaDinhPage() {
  const packages = await getPricingPackages('gia-dinh')
  const jsonLd = serviceSchema(
    'Lắp điện mặt trời gia đình',
    'Dịch vụ lắp đặt hệ thống điện mặt trời cho hộ gia đình tại SOLIQ ENERGY',
    '/lap-dat-dien-mat-troi-gia-dinh'
  )

  const breadcrumb = breadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Điện mặt trời gia đình', url: '/lap-dat-dien-mat-troi-gia-dinh' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }}
      />

      {/* Hero */}
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-cyan-300 font-medium mb-6 border border-white/20">
              <Home className="w-4 h-4" />
              Điện mặt trời gia đình
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Lắp điện mặt trời gia đình —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-yellow-300">
                tiết kiệm thật sự
              </span>
            </h1>
            <p className="text-green-100 text-lg leading-relaxed mb-8">
              Hệ thống điện mặt trời áp mái cho hộ gia đình từ 3-15kWp. Giảm 50-100% hóa đơn điện,
              hoàn vốn trong 5-7 năm, sử dụng 25-30 năm.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/bao-gia-dien-mat-troi"
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                Tính báo giá miễn phí
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:0902211893"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Gọi tư vấn ngay
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Lợi ích khi lắp điện mặt trời gia đình
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Tiết kiệm 50-100% điện', desc: 'Tùy công suất và mức tiêu thụ, nhiều gia đình giảm hóa đơn điện về 0 hoặc thậm chí bán điện dư lại lưới.' },
              { icon: Shield, title: 'Hoàn vốn 5-7 năm', desc: 'Với hóa đơn điện 2-4 triệu/tháng, thời gian hoàn vốn thường 5-7 năm. Hệ thống dùng được 25-30 năm.' },
              { icon: Sun, title: 'Bảo hành 25 năm', desc: 'Tấm pin bảo hành hiệu suất 25 năm, biến tần 5-10 năm. SOLIQ bảo hành thi công 2 năm.' },
              { icon: Home, title: 'Tăng giá trị bất động sản', desc: 'Nhà có hệ thống điện mặt trời được định giá cao hơn và hấp dẫn hơn khi bán hoặc cho thuê.' },
              { icon: CheckCircle, title: 'Không cần bảo trì nhiều', desc: 'Hệ thống hoạt động tự động, chỉ cần vệ sinh tấm pin định kỳ 1-2 lần/năm.' },
              { icon: ArrowRight, title: 'Hỗ trợ trả góp', desc: 'Không cần đầu tư toàn bộ ngay. Trả góp 12-60 tháng với lãi suất cạnh tranh.' },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6 border border-white/50">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-green-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Package table */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Gói lắp đặt gia đình
          </h2>
          <p className="text-center text-gray-500 mb-10">Phù hợp với mọi quy mô hộ gia đình</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="px-4 py-3 text-left rounded-tl-xl">Công suất</th>
                  <th className="px-4 py-3 text-left">Số tấm pin</th>
                  <th className="px-4 py-3 text-left">Biến tần</th>
                  <th className="px-4 py-3 text-left">Phù hợp</th>
                  <th className="px-4 py-3 text-right rounded-tr-xl">Giá tham khảo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packages.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-bold text-green-700">{row.cap}</td>
                    <td className="px-4 py-3 text-gray-600">{row.panels}</td>
                    <td className="px-4 py-3 text-gray-600">{row.inv}</td>
                    <td className="px-4 py-3 text-gray-500">{row.fit}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{row.price ? row.price.toLocaleString('vi-VN') : '—'}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-900 mt-3 text-center">* Giá chưa bao gồm VAT. Liên hệ để nhận báo giá chính xác sau khảo sát thực địa.</p>

          <div className="mt-8 text-center">
            <Link
              href="/bao-gia-dien-mat-troi"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-colors"
            >
              Tính báo giá cho nhà tôi
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-solar-hero">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng lắp điện mặt trời?</h2>
          <p className="text-green-100 mb-8">Liên hệ ngay để được khảo sát và báo giá miễn phí</p>
          <a
            href="tel:0902211893"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-lg"
          >
            <Phone className="w-5 h-5" />
            090.22.11.893
          </a>
        </div>
      </section>
    </>
  )
}
